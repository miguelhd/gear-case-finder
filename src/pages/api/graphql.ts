import { ApolloServer } from 'apollo-server-micro';
import { gql } from 'apollo-server-micro';
import { clientPromise, mongoose } from '../../lib/mongodb';
import { AudioGear, Case, GearCaseMatch } from '../../lib/models/gear-models';
import { User, Content, Analytics, IAffiliate } from '../../lib/models/website-models';
import { ProductMatcher } from '../../lib/matching/product-matcher';
import { RecommendationEngine } from '../../lib/matching/recommendation-engine';
import { FeedbackManager } from '../../lib/matching/feedback-manager';
import { NextApiRequest, NextApiResponse } from 'next';
// import Cors from 'micro-cors';
// Using require instead of import to avoid TypeScript errors
const Cors = require('micro-cors');

// Initialize services
const productMatcher = new ProductMatcher();
const recommendationEngine = new RecommendationEngine();
const feedbackManager = new FeedbackManager();

// Connect to database
// Database connection is already established in the mongodb.ts file
// No need to explicitly connect here

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
    popularity: Int
    releaseYear: Int
    discontinued: Boolean
    compatibleCases(limit: Int): [Case]
  }

  # Case type
  type Case {
    id: ID!
    sourceId: String!
    marketplace: String!
    name: String!
    brand: String
    type: String!
    externalDimensions: Dimensions!
    internalDimensions: Dimensions!
    weight: Weight
    price: Float!
    currency: String!
    url: String!
    imageUrls: [String]!
    description: String
    features: [String]
    rating: Float
    reviewCount: Int
    availability: String
    seller: Seller
    protectionLevel: String
    waterproof: Boolean
    shockproof: Boolean
    hasHandle: Boolean
    hasWheels: Boolean
    material: String
    color: String
    compatibleWith: [String]
    compatibleGear(limit: Int): [AudioGear]
  }

  # Match type
  type Match {
    id: ID!
    gear: AudioGear!
    case: Case!
    compatibilityScore: Float!
    dimensionFit: DimensionFit!
    priceCategory: String!
    protectionLevel: String!
    features: [String]
    feedback: [Feedback]
    averageRating: Float
  }

  # Dimension fit type
  type DimensionFit {
    length: Float!
    width: Float!
    height: Float!
    overall: Float!
  }

  # Feedback type
  type Feedback {
    id: ID!
    userId: String
    gearId: String!
    caseId: String!
    rating: Float!
    comments: String
    fitAccuracy: Float
    protectionQuality: Float
    valueForMoney: Float
    actuallyPurchased: Boolean
    createdAt: String!
  }

  # User type
  type User {
    id: ID!
    email: String!
    name: String
    preferences: UserPreferences
    searchHistory: [SearchHistory]
    viewHistory: [ViewHistory]
    createdAt: String!
    updatedAt: String!
  }

  # User preferences type
  type UserPreferences {
    preferredBrands: [String]
    excludedBrands: [String]
    preferredFeatures: [String]
    preferredProtectionLevel: String
    maxPrice: Float
  }

  # Search history type
  type SearchHistory {
    query: String!
    timestamp: String!
  }

  # View history type
  type ViewHistory {
    gearId: String!
    caseId: String!
    timestamp: String!
  }

  # Content type
  type Content {
    id: ID!
    title: String!
    slug: String!
    content: String!
    excerpt: String
    metaTitle: String
    metaDescription: String
    keywords: [String]
    contentType: String!
    relatedGear: [AudioGear]
    relatedCases: [Case]
    author: String
    publishDate: String!
    updateDate: String
    status: String!
    viewCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  # Pagination info
  type PaginationInfo {
    total: Int!
    page: Int!
    limit: Int!
    pages: Int!
  }

  # Paginated audio gear
  type PaginatedAudioGear {
    items: [AudioGear]!
    pagination: PaginationInfo!
  }

  # Paginated cases
  type PaginatedCases {
    items: [Case]!
    pagination: PaginationInfo!
  }

  # Paginated matches
  type PaginatedMatches {
    items: [Match]!
    pagination: PaginationInfo!
  }

  # Paginated content
  type PaginatedContent {
    items: [Content]!
    pagination: PaginationInfo!
  }

  # Input types
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

  input MatchingOptionsInput {
    minCompatibilityScore: Float
    preferredProtectionLevel: String
    maxPriceUSD: Float
    preferredFeatures: [String]
    preferredBrands: [String]
    allowWaterproof: Boolean
    allowShockproof: Boolean
    requireHandle: Boolean
    requireWheels: Boolean
    maxResults: Int
    sortBy: String
    sortDirection: String
  }

  input FeedbackInput {
    userId: String
    gearId: String!
    caseId: String!
    rating: Float!
    comments: String
    fitAccuracy: Float
    protectionQuality: Float
    valueForMoney: Float
    actuallyPurchased: Boolean
  }

  input FilterInput {
    brands: [String]
    types: [String]
    categories: [String]
    marketplaces: [String]
    protectionLevels: [String]
    minPrice: Float
    maxPrice: Float
    features: [String]
    hasHandle: Boolean
    hasWheels: Boolean
    waterproof: Boolean
    shockproof: Boolean
    sortBy: String
    sortDirection: String
    page: Int
    limit: Int
  }

  # Queries
  type Query {
    # Gear queries
    gear(id: ID!): AudioGear
    allGear(limit: Int, offset: Int): [AudioGear]
    searchGear(query: String!, limit: Int): [AudioGear]
    gearByCategory(category: String!, limit: Int, offset: Int): [AudioGear]
    gearByBrand(brand: String!, limit: Int, offset: Int): [AudioGear]
    popularGear(limit: Int): [AudioGear]
    gearCategories: [String]
    gearBrands: [String]
    paginatedGear(filter: FilterInput): PaginatedAudioGear

    # Case queries
    case(id: ID!): Case
    allCases(limit: Int, offset: Int): [Case]
    searchCases(query: String!, limit: Int): [Case]
    casesByType(type: String!, limit: Int, offset: Int): [Case]
    casesByBrand(brand: String!, limit: Int, offset: Int): [Case]
    casesByMarketplace(marketplace: String!, limit: Int, offset: Int): [Case]
    popularCases(limit: Int): [Case]
    caseTypes: [String]
    caseBrands: [String]
    caseMarketplaces: [String]
    paginatedCases(filter: FilterInput): PaginatedCases
    casePriceRange: [Float]

    # Match queries
    match(gearId: ID!, caseId: ID!): Match
    matchesForGear(gearId: ID!, limit: Int): [Match]
    matchesForCase(caseId: ID!, limit: Int): [Match]
    popularMatches(limit: Int): [Match]
    paginatedMatches(filter: FilterInput): PaginatedMatches

    # Content queries
    content(slug: String!): Content
    allContent(limit: Int, offset: Int): [Content]
    contentByType(contentType: String!, limit: Int, offset: Int): [Content]
    popularContent(limit: Int): [Content]
    paginatedContent(filter: FilterInput): PaginatedContent

    # User queries
    user(id: ID!): User
    userByEmail(email: String!): User
  }

  # Mutations
  type Mutation {
    # Matching mutations
    findCompatibleCases(gearId: ID!, options: MatchingOptionsInput): [Case]
    recommendAlternativeCases(gearId: ID!, caseId: ID!, options: MatchingOptionsInput): [Case]
    
    # Feedback mutations
    submitFeedback(feedback: FeedbackInput!): Feedback
    
    # User mutations
    updateUserPreferences(userId: ID!, preferences: UserPreferences!): User
    addToSearchHistory(userId: ID!, query: String!): User
    addToViewHistory(userId: ID!, gearId: ID!, caseId: ID!): User
  }
`;

// Define resolvers
const resolvers = {
  Query: {
    // Gear queries
    gear: async (_: any, { id }: { id: string }) => {
      return await AudioGear.findById(id);
    },
    allGear: async (_: any, { limit = 20, offset = 0 }: { limit?: number, offset?: number }) => {
      return await AudioGear.find().limit(limit).skip(offset);
    },
    searchGear: async (_: any, { query, limit = 20 }: { query: string, limit?: number }) => {
      return await AudioGear.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
          { type: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      }).limit(limit);
    },
    gearByCategory: async (_: any, { category, limit = 20, offset = 0 }: { category: string, limit?: number, offset?: number }) => {
      return await AudioGear.find({ category }).limit(limit).skip(offset);
    },
    gearByBrand: async (_: any, { brand, limit = 20, offset = 0 }: { brand: string, limit?: number, offset?: number }) => {
      return await AudioGear.find({ brand }).limit(limit).skip(offset);
    },
    popularGear: async (_: any, { limit = 10 }: { limit?: number }) => {
      return await AudioGear.find().sort({ popularity: -1 }).limit(limit);
    },
    gearCategories: async () => {
      const categories = await AudioGear.distinct('category');
      return categories;
    },
    gearBrands: async () => {
      const brands = await AudioGear.distinct('brand');
      return brands;
    },
    paginatedGear: async (_: any, { filter = {} }: { filter?: any }) => {
      const {
        brands,
        types,
        categories,
        page = 1,
        limit = 20,
        sortBy = 'name',
        sortDirection = 'asc'
      } = filter;
      
      const query: any = {};
      
      if (brands && brands.length > 0) {
        query.brand = { $in: brands };
      }
      
      if (types && types.length > 0) {
        query.type = { $in: types };
      }
      
      if (categories && categories.length > 0) {
        query.category = { $in: categories };
      }
      
      const sort: any = {};
      sort[sortBy] = sortDirection === 'asc' ? 1 : -1;
      
      const skip = (page - 1) * limit;
      
      const [items, total] = await Promise.all([
        AudioGear.find(query).sort(sort).skip(skip).limit(limit),
        AudioGear.countDocuments(query)
      ]);
      
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
    
    // Case queries
    case: async (_: any, { id }: { id: string }) => {
      return await Case.findById(id);
    },
    allCases: async (_: any, { limit = 20, offset = 0 }: { limit?: number, offset?: number }) => {
      return await Case.find().limit(limit).skip(offset);
    },
    searchCases: async (_: any, { query, limit = 20 }: { query: string, limit?: number }) => {
      return await Case.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
          { type: { $regex: query, $options: 'i' } }
        ]
      }).limit(limit);
    },
    casesByType: async (_: any, { type, limit = 20, offset = 0 }: { type: string, limit?: number, offset?: number }) => {
      return await Case.find({ type }).limit(limit).skip(offset);
    },
    casesByBrand: async (_: any, { brand, limit = 20, offset = 0 }: { brand: string, limit?: number, offset?: number }) => {
      return await Case.find({ brand }).limit(limit).skip(offset);
    },
    casesByMarketplace: async (_: any, { marketplace, limit = 20, offset = 0 }: { marketplace: string, limit?: number, offset?: number }) => {
      return await Case.find({ marketplace }).limit(limit).skip(offset);
    },
    popularCases: async (_: any, { limit = 10 }: { limit?: number }) => {
      return await Case.find().sort({ reviewCount: -1 }).limit(limit);
    },
    caseTypes: async () => {
      const types = await Case.distinct('type');
      return types;
    },
    caseBrands: async () => {
      const brands = await Case.distinct('brand');
      return brands;
    },
    caseMarketplaces: async () => {
      const marketplaces = await Case.distinct('marketplace');
      return marketplaces;
    },
    paginatedCases: async (_: any, { filter = {} }: { filter?: any }) => {
      const {
        brands,
        types,
        marketplaces,
        protectionLevels,
        minPrice,
        maxPrice,
        features,
        hasHandle,
        hasWheels,
        waterproof,
        shockproof,
        page = 1,
        limit = 20,
        sortBy = 'name',
        sortDirection = 'asc'
      } = filter;
      
      const query: any = {};
      
      if (brands && brands.length > 0) {
        query.brand = { $in: brands };
      }
      
      if (types && types.length > 0) {
        query.type = { $in: types };
      }
      
      if (marketplaces && marketplaces.length > 0) {
        query.marketplace = { $in: marketplaces };
      }
      
      if (protectionLevels && protectionLevels.length > 0) {
        query.protectionLevel = { $in: protectionLevels };
      }
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) {
          query.price.$gte = minPrice;
        }
        if (maxPrice !== undefined) {
          query.price.$lte = maxPrice;
        }
      }
      
      if (features && features.length > 0) {
        query.features = { $all: features };
      }
      
      if (hasHandle !== undefined) {
        query.hasHandle = hasHandle;
      }
      
      if (hasWheels !== undefined) {
        query.hasWheels = hasWheels;
      }
      
      if (waterproof !== undefined) {
        query.waterproof = waterproof;
      }
      
      if (shockproof !== undefined) {
        query.shockproof = shockproof;
      }
      
      const sort: any = {};
      sort[sortBy] = sortDirection === 'asc' ? 1 : -1;
      
      const skip = (page - 1) * limit;
      
      const [items, total] = await Promise.all([
        Case.find(query).sort(sort).skip(skip).limit(limit),
        Case.countDocuments(query)
      ]);
      
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
    casePriceRange: async () => {
      const result = await Case.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ]);
      
      if (result.length === 0) {
        return [0, 0];
      }
      
      return [result[0].minPrice, result[0].maxPrice];
    },
    // Match queries
    match: async (_: any, { gearId, caseId }: { gearId: string, caseId: string }) => {
      const match = await GearCaseMatch.findOne({ gearId, caseId })
        .populate('gearId')
        .populate('caseId');
      
      if (!match) return null;
      
      // Get feedback for this match
      const feedback = await feedbackManager.getFeedbackForMatch(gearId, caseId);
      const averageRating = await feedbackManager.getAverageRatingForMatch(gearId, caseId);
      
      return {
        id: match._id,
        gear: match.gearId,
        case: match.caseId,
        compatibilityScore: match.compatibilityScore,
        dimensionFit: match.dimensionFit,
        priceCategory: match.priceCategory,
        protectionLevel: match.protectionLevel,
        features: match.features,
        feedback,
        averageRating
      };
    },
    matchesForGear: async (_: any, { gearId, limit = 10 }: { gearId: string, limit?: number }) => {
      const matches = await GearCaseMatch.find({ gearId })
        .populate('gearId')
        .populate('caseId')
        .limit(limit);
      
      if (!matches || matches.length === 0) return [];
      
      return Promise.all(matches.map(async (match) => {
        const feedback = await feedbackManager.getFeedbackForMatch(match.gearId, match.caseId);
        const averageRating = await feedbackManager.getAverageRatingForMatch(match.gearId, match.caseId);
        
        return {
          id: match._id,
          gear: match.gearId,
          case: match.caseId,
          compatibilityScore: match.compatibilityScore,
          dimensionFit: match.dimensionFit,
          priceCategory: match.priceCategory,
          protectionLevel: match.protectionLevel,
          features: match.features,
          feedback,
          averageRating
        };
      }));
    }
  }
};

// Create Apollo Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  context: async ({ req }) => {
    return {
      db: await clientPromise,
      productMatcher,
      recommendationEngine,
      feedbackManager
    };
  }
});

// Enable CORS
const cors = Cors({
  allowMethods: ['POST', 'OPTIONS', 'GET', 'HEAD'],
});

// Start Apollo Server
const startServer = apolloServer.start();

// Export API handler
export default cors(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }
  
  await startServer;
  
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res);
});

// Disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};
