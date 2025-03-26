import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';
import { clientPromise, mongoose } from '../../lib/mongodb';
import { AudioGear, Case, GearCaseMatch } from '../../lib/models/gear-models';
import { User, Content, Analytics, IAffiliate } from '../../lib/models/website-models';
import { ProductMatcher } from '../../lib/matching/product-matcher';
import { RecommendationEngine } from '../../lib/matching/recommendation-engine';
import { FeedbackManager } from '../../lib/matching/feedback-manager';
import { NextApiRequest, NextApiResponse } from 'next';
import { SortOrder } from 'mongoose';
import { Types } from 'mongoose';

// Initialize services
const productMatcher = new ProductMatcher();
const recommendationEngine = new RecommendationEngine();
const feedbackManager = new FeedbackManager();

// Define GraphQL schema
const typeDefs = gql`
  # Dimensions type
  type Dimensions {
    length: Float
    width: Float
    height: Float
    unit: String
  }

  # Weight type
  type Weight {
    value: Float
    unit: String
  }

  # Seller type
  type Seller {
    name: String
    url: String
    rating: Float
  }

  # Audio Gear type
  type AudioGear {
    id: ID!
    name: String!
    brand: String!
    category: String!
    type: String!
    dimensions: Dimensions!
    weight: Weight
    imageUrl: String
    productUrl: String
    description: String
    price: Float
    currency: String
    inStock: Boolean
    rating: Float
    reviewCount: Int
    features: [String]
    compatibleWith: [String]
    seller: Seller
    createdAt: String
    updatedAt: String
  }

  # Case type
  type Case {
    id: ID!
    name: String!
    brand: String
    type: String!
    internalDimensions: Dimensions!
    externalDimensions: Dimensions
    weight: Weight
    imageUrl: String
    productUrl: String
    description: String
    price: Float
    currency: String
    inStock: Boolean
    rating: Float
    reviewCount: Int
    features: [String]
    protectionLevel: String
    waterproof: Boolean
    shockproof: Boolean
    dustproof: Boolean
    color: String
    material: String
    seller: Seller
    createdAt: String
    updatedAt: String
  }

  # Dimension fit type
  type DimensionFit {
    length: Float
    width: Float
    height: Float
    overall: Float
  }

  # Gear-Case match type
  type GearCaseMatch {
    id: ID!
    gearId: ID!
    caseId: ID!
    gear: AudioGear
    case: Case
    compatibilityScore: Float!
    dimensionFit: DimensionFit
    priceCategory: String
    protectionLevel: String
    features: [String]
    userRating: Float
    reviewCount: Int
    createdAt: String
    updatedAt: String
  }

  # User feedback type
  type UserFeedback {
    id: ID!
    userId: ID
    gearId: ID!
    caseId: ID!
    rating: Float!
    comments: String
    fitAccuracy: Float
    protectionQuality: Float
    valueForMoney: Float
    actuallyPurchased: Boolean
    createdAt: String
  }

  # User type
  type User {
    id: ID!
    name: String
    email: String
    savedGear: [AudioGear]
    savedCases: [Case]
    savedMatches: [GearCaseMatch]
    createdAt: String
    updatedAt: String
  }

  # Content type
  type Content {
    id: ID!
    title: String!
    slug: String!
    content: String!
    excerpt: String
    author: String
    category: String
    tags: [String]
    imageUrl: String
    published: Boolean
    publishedAt: String
    createdAt: String
    updatedAt: String
  }

  # Affiliate link type
  type AffiliateLink {
    id: ID!
    productId: ID!
    productType: String!
    provider: String!
    url: String!
    commission: Float
    active: Boolean
    createdAt: String
    updatedAt: String
  }

  # Analytics type
  type Analytics {
    id: ID!
    pageViews: Int
    uniqueVisitors: Int
    searchCount: Int
    matchViewCount: Int
    affiliateClickCount: Int
    conversionRate: Float
    period: String
    createdAt: String
  }

  # Pagination input
  input PaginationInput {
    page: Int = 1
    limit: Int = 10
  }

  # Pagination info
  type PaginationInfo {
    total: Int!
    page: Int!
    limit: Int!
    pages: Int!
  }

  # Gear filter input
  input GearFilterInput {
    brands: [String]
    categories: [String]
    types: [String]
    minPrice: Float
    maxPrice: Float
    minRating: Float
    inStock: Boolean
    sortBy: String
    sortDirection: String
  }

  # Case filter input
  input CaseFilterInput {
    brands: [String]
    types: [String]
    minPrice: Float
    maxPrice: Float
    minRating: Float
    waterproof: Boolean
    shockproof: Boolean
    dustproof: Boolean
    colors: [String]
    materials: [String]
    inStock: Boolean
    sortBy: String
    sortDirection: String
  }

  # Match filter input
  input MatchFilterInput {
    gearId: ID
    caseId: ID
    minScore: Float
    protectionLevels: [String]
    priceCategories: [String]
    sortBy: String
    sortDirection: String
  }

  # Paginated gear response
  type PaginatedGearResponse {
    items: [AudioGear]!
    pagination: PaginationInfo!
  }

  # Paginated case response
  type PaginatedCaseResponse {
    items: [Case]!
    pagination: PaginationInfo!
  }

  # Paginated match response
  type PaginatedMatchResponse {
    items: [GearCaseMatch]!
    pagination: PaginationInfo!
  }

  # Paginated content response
  type PaginatedContentResponse {
    items: [Content]!
    pagination: PaginationInfo!
  }

  # Brand stats
  type BrandStats {
    name: String!
    count: Int!
    averageRating: Float
    categories: [String]
  }

  # Category stats
  type CategoryStats {
    name: String!
    count: Int!
    brands: [String]
  }

  # System stats
  type SystemStats {
    totalGear: Int!
    totalCases: Int!
    totalMatches: Int!
    totalUsers: Int!
    topBrands: [BrandStats]
    topCategories: [CategoryStats]
  }

  # Query type
  type Query {
    # Gear queries
    gear(id: ID!): AudioGear
    allGear(pagination: PaginationInput): PaginatedGearResponse
    filterGear(filter: GearFilterInput!, pagination: PaginationInput): PaginatedGearResponse
    searchGear(query: String!, pagination: PaginationInput): PaginatedGearResponse
    gearByBrand(brand: String!, pagination: PaginationInput): PaginatedGearResponse
    gearByCategory(category: String!, pagination: PaginationInput): PaginatedGearResponse
    gearByType(type: String!, pagination: PaginationInput): PaginatedGearResponse
    
    # Case queries
    case(id: ID!): Case
    allCases(pagination: PaginationInput): PaginatedCaseResponse
    filterCases(filter: CaseFilterInput!, pagination: PaginationInput): PaginatedCaseResponse
    searchCases(query: String!, pagination: PaginationInput): PaginatedCaseResponse
    casesByBrand(brand: String!, pagination: PaginationInput): PaginatedCaseResponse
    casesByType(type: String!, pagination: PaginationInput): PaginatedCaseResponse
    
    # Match queries
    match(id: ID!): GearCaseMatch
    allMatches(pagination: PaginationInput): PaginatedMatchResponse
    filterMatches(filter: MatchFilterInput!, pagination: PaginationInput): PaginatedMatchResponse
    matchesForGear(gearId: ID!, pagination: PaginationInput): PaginatedMatchResponse
    matchesForCase(caseId: ID!, pagination: PaginationInput): PaginatedMatchResponse
    
    # User queries
    user(id: ID!): User
    userByEmail(email: String!): User
    
    # Content queries
    content(id: ID!): Content
    contentBySlug(slug: String!): Content
    allContent(pagination: PaginationInput): PaginatedContentResponse
    
    # Stats queries
    systemStats: SystemStats
    brandStats(brand: String!): BrandStats
    categoryStats(category: String!): CategoryStats
    
    # Affiliate queries
    affiliateLinks(productId: ID!, productType: String!): [AffiliateLink]
    
    # Analytics queries
    analytics(period: String!): Analytics
  }

  # Mutation type
  type Mutation {
    # Gear mutations
    createGear(input: GearInput!): AudioGear
    updateGear(id: ID!, input: GearInput!): AudioGear
    deleteGear(id: ID!): Boolean
    
    # Case mutations
    createCase(input: CaseInput!): Case
    updateCase(id: ID!, input: CaseInput!): Case
    deleteCase(id: ID!): Boolean
    
    # Match mutations
    createMatch(input: MatchInput!): GearCaseMatch
    updateMatch(id: ID!, input: MatchInput!): GearCaseMatch
    deleteMatch(id: ID!): Boolean
    recalculateMatch(id: ID!): GearCaseMatch
    
    # User mutations
    createUser(input: UserInput!): User
    updateUser(id: ID!, input: UserInput!): User
    deleteUser(id: ID!): Boolean
    saveGear(userId: ID!, gearId: ID!): User
    saveCase(userId: ID!, caseId: ID!): User
    saveMatch(userId: ID!, matchId: ID!): User
    
    # Feedback mutations
    submitFeedback(input: FeedbackInput!): UserFeedback
    
    # Content mutations
    createContent(input: ContentInput!): Content
    updateContent(id: ID!, input: ContentInput!): Content
    deleteContent(id: ID!): Boolean
    publishContent(id: ID!): Content
    unpublishContent(id: ID!): Content
    
    # Affiliate mutations
    createAffiliateLink(input: AffiliateLinkInput!): AffiliateLink
    updateAffiliateLink(id: ID!, input: AffiliateLinkInput!): AffiliateLink
    deleteAffiliateLink(id: ID!): Boolean
    
    # System mutations
    clearCache: Boolean
    rebuildIndexes: Boolean
    runScraper(scraperId: String!): Boolean
  }

  # Input types
  input GearInput {
    name: String!
    brand: String!
    category: String!
    type: String!
    dimensions: DimensionsInput!
    weight: WeightInput
    imageUrl: String
    productUrl: String
    description: String
    price: Float
    currency: String
    inStock: Boolean
    rating: Float
    reviewCount: Int
    features: [String]
    compatibleWith: [String]
    seller: SellerInput
  }

  input CaseInput {
    name: String!
    brand: String
    type: String!
    internalDimensions: DimensionsInput!
    externalDimensions: DimensionsInput
    weight: WeightInput
    imageUrl: String
    productUrl: String
    description: String
    price: Float
    currency: String
    inStock: Boolean
    rating: Float
    reviewCount: Int
    features: [String]
    protectionLevel: String
    waterproof: Boolean
    shockproof: Boolean
    dustproof: Boolean
    color: String
    material: String
    seller: SellerInput
  }

  input MatchInput {
    gearId: ID!
    caseId: ID!
    compatibilityScore: Float
    dimensionFit: DimensionFitInput
    priceCategory: String
    protectionLevel: String
    features: [String]
    userRating: Float
    reviewCount: Int
  }

  input UserInput {
    name: String
    email: String!
    savedGear: [ID]
    savedCases: [ID]
    savedMatches: [ID]
  }

  input FeedbackInput {
    userId: ID
    gearId: ID!
    caseId: ID!
    rating: Float!
    comments: String
    fitAccuracy: Float
    protectionQuality: Float
    valueForMoney: Float
    actuallyPurchased: Boolean
  }

  input ContentInput {
    title: String!
    slug: String!
    content: String!
    excerpt: String
    author: String
    category: String
    tags: [String]
    imageUrl: String
    published: Boolean
  }

  input AffiliateLinkInput {
    productId: ID!
    productType: String!
    provider: String!
    url: String!
    commission: Float
    active: Boolean
  }

  input DimensionsInput {
    length: Float!
    width: Float!
    height: Float!
    unit: String!
  }

  input WeightInput {
    value: Float!
    unit: String!
  }

  input DimensionFitInput {
    length: Float!
    width: Float!
    height: Float!
    overall: Float!
  }

  input SellerInput {
    name: String!
    url: String
    rating: Float
  }
`;

// Define resolvers
const resolvers = {
  Query: {
    // Gear queries
    gear: async (_, { id }) => {
      await clientPromise;
      return AudioGear.findById(id);
    },
    
    allGear: async (_, { pagination = { page: 1, limit: 10 } }) => {
      await clientPromise;
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;
      
      const [result] = await AudioGear.aggregate([
        {
          $facet: {
            items: [
              { $sort: { name: 1 } },
              { $skip: skip },
              { $limit: limit }
            ],
            total: [
              { $count: 'count' }
            ]
          }
        }
      ]);
      
      const items = result.items || [];
      const total = result.total.length > 0 ? result.total[0].count : 0;
      const pages = Math.ceil(total / limit);
      
      return {
        items,
        pagination: {
          total,
          page,
          limit,
          pages
        }
      };
    },
    
    filterGear: async (_, { filter, pagination = { page: 1, limit: 10 } }) => {
      type MongoQuery = Record<string, any>;
      
      await clientPromise;
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;
      
      // Set a timeout for the database operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database operation timeout')), 10000);
      });
      
      // Database operation with timeout
      const dbOperation = async () => {
        try {
          // Build filter query
          const query: MongoQuery = {};
          
          if (filter.brands && filter.brands.length > 0) {
            query.brand = { $in: filter.brands };
          }
          
          if (filter.types && filter.types.length > 0) {
            query.type = { $in: filter.types };
          }
          
          if (filter.categories && filter.categories.length > 0) {
            query.category = { $in: filter.categories };
          }
          
          if (filter.minPrice !== undefined) {
            query.price = query.price || {};
            query.price.$gte = filter.minPrice;
          }
          
          if (filter.maxPrice !== undefined) {
            query.price = query.price || {};
            query.price.$lte = filter.maxPrice;
          }
          
          if (filter.minRating !== undefined) {
            query.rating = { $gte: filter.minRating };
          }
          
          if (filter.inStock !== undefined) {
            query.inStock = filter.inStock;
          }
          
          // Determine sort order
          let sortField = 'name';
          let sortOrder: 1 | -1 = 1;
          
          if (filter.sortBy) {
            sortField = filter.sortBy;
            sortOrder = filter.sortDirection === 'desc' ? -1 : 1;
          }
          
          const sortOptions: Record<string, 1 | -1> = {};
          sortOptions[sortField] = sortOrder;
          
          // Execute query with aggregation
          const [result] = await AudioGear.aggregate([
            { $match: query },
            {
              $facet: {
                items: [
                  { $sort: sortOptions },
                  { $skip: skip },
                  { $limit: limit }
                ],
                total: [
                  { $count: 'count' }
                ]
              }
            }
          ]);
          
          const items = result.items || [];
          const total = result.total.length > 0 ? result.total[0].count : 0;
          const pages = Math.ceil(total / limit);
          
          return {
            items,
            pagination: {
              total,
              page,
              limit,
              pages
            }
          };
        } catch (error) {
          console.error('Error in filterGear:', error);
          throw error;
        }
      };
      
      // Execute with timeout
      return Promise.race([dbOperation(), timeoutPromise]);
    },
    
    searchGear: async (_, { query, pagination = { page: 1, limit: 10 } }) => {
      await clientPromise;
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;
      
      // Set a timeout for the database operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database operation timeout')), 10000);
      });
      
      // Database operation with timeout
      const dbOperation = async () => {
        try {
          const searchRegex = new RegExp(query, 'i');
          const searchQuery = {
            $or: [
              { name: searchRegex },
              { brand: searchRegex },
              { type: searchRegex },
              { description: searchRegex }
            ]
          };
          
          // Execute query with aggregation
          const [result] = await AudioGear.aggregate([
            { $match: searchQuery },
            {
              $facet: {
                items: [
                  { $sort: { name: 1 } },
                  { $skip: skip },
                  { $limit: limit }
                ],
                total: [
                  { $count: 'count' }
                ]
              }
            }
          ]);
          
          const items = result.items || [];
          const total = result.total.length > 0 ? result.total[0].count : 0;
          const pages = Math.ceil(total / limit);
          
          return {
            items,
            pagination: {
              total,
              page,
              limit,
              pages
            }
          };
        } catch (error) {
          console.error('Error in searchGear:', error);
          throw error;
        }
      };
      
      // Execute with timeout
      return Promise.race([dbOperation(), timeoutPromise]);
    },
    
    // Additional Query resolvers would be implemented here...
  },
  
  Mutation: {
    // Mutation resolvers would be implemented here...
  }
  
  // Mutation resolvers remain unchanged...
  // ...
};

// Create Apollo Server with @apollo/server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

// Initialize database indexes when server starts
(async () => {
  try {
    await clientPromise;
    
    // Create indexes on frequently queried fields
    await AudioGear.collection.createIndex({ brand: 1 });
    await AudioGear.collection.createIndex({ category: 1 });
    await AudioGear.collection.createIndex({ type: 1 });
    await AudioGear.collection.createIndex({ price: 1 });
    await AudioGear.collection.createIndex({ rating: 1 });
    await AudioGear.collection.createIndex({ name: 'text', description: 'text' });
    
    await Case.collection.createIndex({ brand: 1 });
    await Case.collection.createIndex({ type: 1 });
    await Case.collection.createIndex({ price: 1 });
    await Case.collection.createIndex({ rating: 1 });
    await Case.collection.createIndex({ name: 'text', description: 'text' });
    await Case.collection.createIndex({ waterproof: 1 });
    await Case.collection.createIndex({ shockproof: 1 });
    await Case.collection.createIndex({ dustproof: 1 });
    await Case.collection.createIndex({ brand: 1, type: 1 });
    await Case.collection.createIndex({ waterproof: 1, shockproof: 1, dustproof: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error initializing database indexes:', error);
  }
})();

// Create handler with proper Vercel serverless function support
// Note: We don't start the server in an IIFE, as startServerAndCreateNextHandler
// will handle this automatically in the Vercel serverless environment
const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req, res) => {
    // Add detailed logging for debugging
    console.log(`[DEBUG] GraphQL API request: ${req.method} ${req.url}`);
    console.log('[DEBUG] Request headers:', JSON.stringify(req.headers, null, 2));
    
    // Add CORS headers to all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apollo-require-preflight');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle OPTIONS requests explicitly for CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return { req, res };
    }
    
    // Return context object with database connection and services
    return {
      req,
      res,
      db: mongoose.connection,
      productMatcher,
      recommendationEngine,
      feedbackManager
    };
  }
});

// Export the handler directly
export default handler;
