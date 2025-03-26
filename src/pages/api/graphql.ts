import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';  // Changed from @apollo/server
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
    matchCount: Int
    clickThroughRate: Float
    conversionRate: Float
    topSearches: [String]
    topGear: [String]
    topCases: [String]
    date: String
  }

  # Pagination input
  input PaginationInput {
    page: Int
    limit: Int
  }

  # Pagination output
  type PaginationOutput {
    total: Int!
    page: Int!
    limit: Int!
    pages: Int!
  }

  # Gear search result
  type GearSearchResult {
    items: [AudioGear]!
    pagination: PaginationOutput!
  }

  # Case search result
  type CaseSearchResult {
    items: [Case]!
    pagination: PaginationOutput!
  }

  # Match search result
  type MatchSearchResult {
    items: [GearCaseMatch]!
    pagination: PaginationOutput!
  }

  # Gear filter input
  input GearFilterInput {
    brands: [String]
    categories: [String]
    types: [String]
    minPrice: Float
    maxPrice: Float
    inStock: Boolean
    minRating: Float
    sortBy: String
    sortDirection: String
  }

  # Case filter input
  input CaseFilterInput {
    brands: [String]
    types: [String]
    protectionLevels: [String]
    waterproof: Boolean
    shockproof: Boolean
    dustproof: Boolean
    colors: [String]
    materials: [String]
    minPrice: Float
    maxPrice: Float
    inStock: Boolean
    minRating: Float
    sortBy: String
    sortDirection: String
  }

  # Match filter input
  input MatchFilterInput {
    gearId: ID
    gearBrands: [String]
    gearCategories: [String]
    gearTypes: [String]
    caseBrands: [String]
    caseTypes: [String]
    protectionLevels: [String]
    minCompatibilityScore: Float
    sortBy: String
    sortDirection: String
  }

  # User feedback input
  input UserFeedbackInput {
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

  # Category result type
  type CategoryResult {
    items: [CategoryItem]!
  }

  # Category item type
  type CategoryItem {
    category: String
  }

  # Brand result type
  type BrandResult {
    items: [BrandItem]!
  }

  # Brand item type
  type BrandItem {
    brand: String
  }

  # Query type
  type Query {
    # Gear queries
    gear(id: ID!): AudioGear
    allGear(pagination: PaginationInput): GearSearchResult
    searchGear(query: String!, pagination: PaginationInput): GearSearchResult
    filterGear(filter: GearFilterInput!, pagination: PaginationInput): GearSearchResult
    gearCategories: CategoryResult
    gearBrands: BrandResult
    
    # Case queries
    case(id: ID!): Case
    allCases(pagination: PaginationInput): CaseSearchResult
    searchCases(query: String!, pagination: PaginationInput): CaseSearchResult
    filterCases(filter: CaseFilterInput!, pagination: PaginationInput): CaseSearchResult
    
    # Match queries
    match(id: ID!): GearCaseMatch
    matchByGearAndCase(gearId: ID!, caseId: ID!): GearCaseMatch
    findCompatibleCases(gearId: ID!, pagination: PaginationInput): CaseSearchResult
    findAlternativeRecommendations(gearId: ID!, caseId: ID!, pagination: PaginationInput): CaseSearchResult
    searchMatches(query: String!, pagination: PaginationInput): MatchSearchResult
    filterMatches(filter: MatchFilterInput!, pagination: PaginationInput): MatchSearchResult
    
    # User feedback queries
    userFeedback(id: ID!): UserFeedback
    feedbackForMatch(gearId: ID!, caseId: ID!, pagination: PaginationInput): [UserFeedback]
    
    # Content queries
    content(id: ID!): Content
    contentBySlug(slug: String!): Content
    allContent(pagination: PaginationInput): [Content]
    
    # Analytics queries
    analytics(days: Int): Analytics
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
    createMatch(gearId: ID!, caseId: ID!): GearCaseMatch
    updateMatch(id: ID!, input: MatchInput!): GearCaseMatch
    deleteMatch(id: ID!): Boolean
    
    # User feedback mutations
    submitFeedback(input: UserFeedbackInput!): UserFeedback
    
    # User mutations
    saveGear(userId: ID!, gearId: ID!): User
    saveCase(userId: ID!, caseId: ID!): User
    saveMatch(userId: ID!, matchId: ID!): User
  }

  # Gear input
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

  # Case input
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

  # Match input
  input MatchInput {
    compatibilityScore: Float
    dimensionFit: DimensionFitInput
    priceCategory: String
    protectionLevel: String
    features: [String]
  }

  # Dimensions input
  input DimensionsInput {
    length: Float!
    width: Float!
    height: Float!
    unit: String
  }

  # Weight input
  input WeightInput {
    value: Float!
    unit: String
  }

  # Dimension fit input
  input DimensionFitInput {
    length: Float!
    width: Float!
    height: Float!
    overall: Float!
  }

  # Seller input
  input SellerInput {
    name: String!
    url: String
    rating: Float
  }
`;

// Define MongoDB query type for dynamic properties
interface MongoQuery {
  [key: string]: any;
}

// Define MongoDB sort type for dynamic properties
interface MongoSort {
  [key: string]: SortOrder;
}

// Define resolvers
const resolvers = {
  Query: {
    // Gear queries
    gear: async (_, { id }) => {
      try {
        await clientPromise;
        return await AudioGear.findById(id);
      } catch (error) {
        console.error('Error fetching gear:', error);
        throw new Error('Failed to fetch gear');
      }
    },
    
    // Gear categories query
    gearCategories: async () => {
      try {
        await clientPromise;
        const categories = await AudioGear.distinct('category');
        return { items: categories.filter(Boolean).map(category => ({ category })) };
      } catch (error) {
        console.error('Error fetching gear categories:', error);
        return { items: [] }; // Return empty array instead of throwing error
      }
    },
    
    // Gear brands query
    gearBrands: async () => {
      try {
        await clientPromise;
        const brands = await AudioGear.distinct('brand');
        return { items: brands.filter(Boolean).map(brand => ({ brand })) };
      } catch (error) {
        console.error('Error fetching gear brands:', error);
        return { items: [] }; // Return empty array instead of throwing error
      }
    },
    
    allGear: async (_, { pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        try {
          const items = await AudioGear.find().skip(skip).limit(limit);
          const total = await AudioGear.countDocuments();
          
          return {
            items,
            pagination: {
              total,
              page,
              limit,
              pages: Math.ceil(total / limit)
            }
          };
        } catch (dbError) {
          console.error('Database error in allGear:', dbError);
          return {
            items: [],
            pagination: {
              total: 0,
              page,
              limit,
              pages: 0
            }
          };
        }
      } catch (error) {
        console.error('Error fetching all gear:', error);
        return {
          items: [],
          pagination: {
            total: 0,
            page: pagination.page,
            limit: pagination.limit,
            pages: 0
          }
        };
      }
    },
    
    searchGear: async (_, { query, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const searchRegex = new RegExp(query, 'i');
        const searchQuery = {
          $or: [
            { name: searchRegex },
            { brand: searchRegex },
            { category: searchRegex },
            { type: searchRegex },
            { description: searchRegex }
          ]
        };
        
        const items = await AudioGear.find(searchQuery).skip(skip).limit(limit);
        const total = await AudioGear.countDocuments(searchQuery);
        
        return {
          items,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        };
      } catch (error) {
        console.error('Error searching gear:', error);
        throw new Error('Failed to search gear');
      }
    },
    
    filterGear: async (_, { filter, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        // Build filter query
        const query: MongoQuery = {};
        
        if (filter.brands && filter.brands.length > 0) {
          query.brand = { $in: filter.brands };
        }
        
        if (filter.categories && filter.categories.length > 0) {
          query.category = { $in: filter.categories };
        }
        
        if (filter.types && filter.types.length > 0) {
          query.type = { $in: filter.types };
        }
        
        // Apply sorting
        const sort: { [key: string]: SortOrder } = {};
        if (filter.sortBy) {
          sort[filter.sortBy] = filter.sortDirection === 'desc' ? -1 : 1;
        } else {
          sort.name = 1;
        }
        
        try {
          const items = await AudioGear.find(query).sort(sort).skip(skip).limit(limit);
          const total = await AudioGear.countDocuments(query);
          
          return {
            items,
            pagination: {
              total,
              page,
              limit,
              pages: Math.ceil(total / limit)
            }
          };
        } catch (dbError) {
          console.error('Database error in filterGear:', dbError);
          return {
            items: [],
            pagination: {
              total: 0,
              page,
              limit,
              pages: 0
            }
          };
        }
      } catch (error) {
        console.error('Error filtering gear:', error);
        return {
          items: [],
          pagination: {
            total: 0,
            page: pagination.page,
            limit: pagination.limit,
            pages: 0
          }
        };
      }
    },
    
    // Case queries
    case: async (_, { id }) => {
      try {
        await clientPromise;
        return await Case.findById(id);
      } catch (error) {
        console.error('Error fetching case:', error);
        throw new Error('Failed to fetch case');
      }
    },
    
    allCases: async (_, { pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const items = await Case.find().skip(skip).limit(limit);
        const total = await Case.countDocuments();
        
        return {
          items,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        };
      } catch (error) {
        console.error('Error fetching all cases:', error);
        throw new Error('Failed to fetch cases');
      }
    },
    
    searchCases: async (_, { query, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const searchRegex = new RegExp(query, 'i');
        const searchQuery = {
          $or: [
            { name: searchRegex },
            { brand: searchRegex },
            { type: searchRegex },
            { description: searchRegex }
          ]
        };
        
        const items = await Case.find(searchQuery).skip(skip).limit(limit);
        const total = await Case.countDocuments(searchQuery);
        
        return {
          items,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        };
      } catch (error) {
        console.error('Error searching cases:', error);
        throw new Error('Failed to search cases');
      }
    },
    
    filterCases: async (_, { filter, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        // Build filter query
        const query: MongoQuery = {};
        
        if (filter.brands && filter.brands.length > 0) {
          query.brand = { $in: filter.brands };
        }
        
        if (filter.types && filter.types.length > 0) {
          query.type = { $in: filter.types };
        }
        
        if (filter.protectionLevels && filter.protectionLevels.length > 0) {
          query.protectionLevel = { $in: filter.protectionLevels };
        }
        
        if (filter.waterproof !== undefined) {
          query.waterproof = filter.waterproof;
        }
        
        if (filter.shockproof !== undefined) {
          query.shockproof = filter.shockproof;
        }
        
        if (filter.dustproof !== undefined) {
          query.dustproof = filter.dustproof;
        }
        
        if (filter.colors && filter.colors.length > 0) {
          query.color = { $in: filter.colors };
        }
        
        if (filter.materials && filter.materials.length > 0) {
          query.material = { $in: filter.materials };
        }
        
        if (filter.minPrice !== undefined) {
          query.price = query.price || {};
          query.price.$gte = filter.minPrice;
        }
        
        if (filter.maxPrice !== undefined) {
          query.price = query.price || {};
          query.price.$lte = filter.maxPrice;
        }
        
        if (filter.inStock !== undefined) {
          query.inStock = filter.inStock;
        }
        
        if (filter.minRating !== undefined) {
          query.rating = { $gte: filter.minRating };
        }
        
        // Apply sorting
        const sort: { [key: string]: SortOrder } = {};
        if (filter.sortBy) {
          sort[filter.sortBy] = filter.sortDirection === 'desc' ? -1 : 1;
        } else {
          sort.name = 1;
        }
        
        const items = await Case.find(query).sort(sort).skip(skip).limit(limit);
        const total = await Case.countDocuments(query);
        
        return {
          items,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        };
      } catch (error) {
        console.error('Error filtering cases:', error);
        throw new Error('Failed to filter cases');
      }
    },
    
    // Match queries
    match: async (_, { id }) => {
      try {
        await clientPromise;
        const match = await GearCaseMatch.findById(id);
        
        if (!match) {
          throw new Error('Match not found');
        }
        
        // Populate gear and case data
        match.gear = await AudioGear.findById(match.gearId);
        match.case = await Case.findById(match.caseId);
        
        return match;
      } catch (error) {
        console.error('Error fetching match:', error);
        throw new Error('Failed to fetch match');
      }
    },
    
    matchByGearAndCase: async (_, { gearId, caseId }) => {
      try {
        await clientPromise;
        
        // Convert string IDs to ObjectIds if needed
        const gearObjectId = Types.ObjectId.isValid(gearId) 
          ? new Types.ObjectId(gearId) 
          : gearId;
        
        const caseObjectId = Types.ObjectId.isValid(caseId) 
          ? new Types.ObjectId(caseId) 
          : caseId;
        
        let match = await GearCaseMatch.findOne({
          gearId: gearObjectId,
          caseId: caseObjectId
        });
        
        if (!match) {
          // If no match exists, create one on-the-fly
          const gear = await AudioGear.findById(gearId);
          const caseItem = await Case.findById(caseId);
          
          if (!gear || !caseItem) {
            throw new Error('Gear or case not found');
          }
          
          // Calculate compatibility score
          const compatibilityScore = productMatcher.calculateCompatibilityScore(gear, caseItem);
          
          // Create a new match
          match = new GearCaseMatch({
            gearId: gearObjectId,
            caseId: caseObjectId,
            compatibilityScore,
            dimensionFit: productMatcher.calculateDimensionFit(gear, caseItem),
            priceCategory: productMatcher.determinePriceCategory(caseItem),
            protectionLevel: caseItem.protectionLevel || 'medium',
            features: caseItem.features || []
          });
          
          await match.save();
        }
        
        // Populate gear and case data
        match.gear = await AudioGear.findById(match.gearId);
        match.case = await Case.findById(match.caseId);
        
        return match;
      } catch (error) {
        console.error('Error fetching match by gear and case:', error);
        throw new Error('Failed to fetch match');
      }
    },
    
    findCompatibleCases: async (_, { gearId, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        
        const gear = await AudioGear.findById(gearId);
        
        if (!gear) {
          throw new Error('Gear not found');
        }
        
        // Use the product matcher to find compatible cases
        const compatibleCases = await productMatcher.findCompatibleCases(gear, {
          minCompatibilityScore: 70,
          maxResults: limit,
          sortBy: 'compatibilityScore',
          sortDirection: 'desc'
        });
        
        // Extract just the case objects
        const items = compatibleCases.map(item => item);
        
        // For pagination, we'd need to know the total count of all compatible cases
        // This is an approximation since we're using the matcher service
        const total = await Case.countDocuments();
        
        return {
          items,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        };
      } catch (error) {
        console.error('Error finding compatible cases:', error);
        throw new Error('Failed to find compatible cases');
      }
    },
    
    findAlternativeRecommendations: async (_, { gearId, caseId, pagination = { page: 1, limit: 5 } }) => {
      try {
        await clientPromise;
        const { limit } = pagination;
        
        const gear = await AudioGear.findById(gearId);
        const primaryCase = await Case.findById(caseId);
        
        if (!gear || !primaryCase) {
          throw new Error('Gear or case not found');
        }
        
        // Use the recommendation engine to find alternatives
        const alternatives = await recommendationEngine.generateAlternativeRecommendations(
          gear,
          primaryCase,
          {
            maxAlternatives: limit,
            includeUpgrades: true,
            includeBudgetOptions: true,
            includeAlternativeSizes: true
          }
        );
        
        // Extract just the case objects
        const items = alternatives.map(item => ({
          ...item,
          recommendationType: item.recommendationType
        }));
        
        return {
          items,
          pagination: {
            total: items.length,
            page: 1,
            limit,
            pages: 1
          }
        };
      } catch (error) {
        console.error('Error finding alternative recommendations:', error);
        throw new Error('Failed to find alternative recommendations');
      }
    },
    
    searchMatches: async (_, { query, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        // First, search for gear and cases that match the query
        const searchRegex = new RegExp(query, 'i');
        
        const matchingGear = await AudioGear.find({
          $or: [
            { name: searchRegex },
            { brand: searchRegex },
            { category: searchRegex },
            { type: searchRegex }
          ]
        }).select('_id');
        
        const matchingCases = await Case.find({
          $or: [
            { name: searchRegex },
            { brand: searchRegex },
            { type: searchRegex }
          ]
        }).select('_id');
        
        // Get the IDs
        const gearIds = matchingGear.map(g => g._id);
        const caseIds = matchingCases.map(c => c._id);
        
        // Find matches that involve either the matching gear or matching cases
        const matchQuery: MongoQuery = {
          $or: [
            { gearId: { $in: gearIds } },
            { caseId: { $in: caseIds } }
          ]
        };
        
        const items = await GearCaseMatch.find(matchQuery)
          .sort({ compatibilityScore: -1 })
          .skip(skip)
          .limit(limit);
        
        const total = await GearCaseMatch.countDocuments(matchQuery);
        
        // Populate gear and case data for each match
        for (const match of items) {
          match.gear = await AudioGear.findById(match.gearId);
          match.case = await Case.findById(match.caseId);
        }
        
        return {
          items,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        };
      } catch (error) {
        console.error('Error searching matches:', error);
        throw new Error('Failed to search matches');
      }
    },
    
    filterMatches: async (_, { filter, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        // Build the match query
        const matchQuery: MongoQuery = {};
        
        // Filter by specific gear
        if (filter.gearId) {
          matchQuery.gearId = new Types.ObjectId(filter.gearId);
        }
        
        // Filter by compatibility score
        if (filter.minCompatibilityScore !== undefined) {
          matchQuery.compatibilityScore = { $gte: filter.minCompatibilityScore };
        }
        
        // Filter by protection level
        if (filter.protectionLevels && filter.protectionLevels.length > 0) {
          matchQuery.protectionLevel = { $in: filter.protectionLevels };
        }
        
        // Apply sorting
        const sort: { [key: string]: SortOrder } = {};
        if (filter.sortBy) {
          sort[filter.sortBy] = filter.sortDirection === 'desc' ? -1 : 1;
        } else {
          sort.compatibilityScore = -1;
        }
        
        // If we need to filter by gear properties, we need to find the gear first
        let gearIds: Types.ObjectId[] = [];
        if (filter.gearBrands || filter.gearCategories || filter.gearTypes) {
          const gearQuery: MongoQuery = {};
          
          if (filter.gearBrands && filter.gearBrands.length > 0) {
            gearQuery.brand = { $in: filter.gearBrands };
          }
          
          if (filter.gearCategories && filter.gearCategories.length > 0) {
            gearQuery.category = { $in: filter.gearCategories };
          }
          
          if (filter.gearTypes && filter.gearTypes.length > 0) {
            gearQuery.type = { $in: filter.gearTypes };
          }
          
          const matchingGear = await AudioGear.find(gearQuery).select('_id');
          gearIds = matchingGear.map(g => g._id);
          
          if (gearIds.length > 0) {
            matchQuery.gearId = { $in: gearIds };
          } else if (Object.keys(gearQuery).length > 0) {
            // If we have gear filters but no matching gear, return empty result
            return {
              items: [],
              pagination: {
                total: 0,
                page,
                limit,
                pages: 0
              }
            };
          }
        }
        
        // If we need to filter by case properties, we need to find the cases first
        let caseIds: Types.ObjectId[] = [];
        if (filter.caseBrands || filter.caseTypes) {
          const caseQuery: MongoQuery = {};
          
          if (filter.caseBrands && filter.caseBrands.length > 0) {
            caseQuery.brand = { $in: filter.caseBrands };
          }
          
          if (filter.caseTypes && filter.caseTypes.length > 0) {
            caseQuery.type = { $in: filter.caseTypes };
          }
          
          const matchingCases = await Case.find(caseQuery).select('_id');
          caseIds = matchingCases.map(c => c._id);
          
          if (caseIds.length > 0) {
            matchQuery.caseId = { $in: caseIds };
          } else if (Object.keys(caseQuery).length > 0) {
            // If we have case filters but no matching cases, return empty result
            return {
              items: [],
              pagination: {
                total: 0,
                page,
                limit,
                pages: 0
              }
            };
          }
        }
        
        const items = await GearCaseMatch.find(matchQuery)
          .sort(sort)
          .skip(skip)
          .limit(limit);
        
        const total = await GearCaseMatch.countDocuments(matchQuery);
        
        // Populate gear and case data for each match
        for (const match of items) {
          match.gear = await AudioGear.findById(match.gearId);
          match.case = await Case.findById(match.caseId);
        }
        
        return {
          items,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        };
      } catch (error) {
        console.error('Error filtering matches:', error);
        throw new Error('Failed to filter matches');
      }
    },
    
    // User feedback queries
    userFeedback: async (_, { id }) => {
      try {
        await clientPromise;
        return await feedbackManager.getFeedbackForMatch(id, id); // Using as a workaround since getFeedbackById doesn't exist
      } catch (error) {
        console.error('Error fetching user feedback:', error);
        throw new Error('Failed to fetch user feedback');
      }
    },
    
    feedbackForMatch: async (_, { gearId, caseId, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        return await feedbackManager.getFeedbackForMatch(gearId, caseId);
      } catch (error) {
        console.error('Error fetching feedback for match:', error);
        throw new Error('Failed to fetch feedback');
      }
    },
    
    // Content queries
    content: async (_, { id }) => {
      try {
        await clientPromise;
        return await Content.findById(id);
      } catch (error) {
        console.error('Error fetching content:', error);
        throw new Error('Failed to fetch content');
      }
    },
    
    contentBySlug: async (_, { slug }) => {
      try {
        await clientPromise;
        return await Content.findOne({ slug });
      } catch (error) {
        console.error('Error fetching content by slug:', error);
        throw new Error('Failed to fetch content');
      }
    },
    
    allContent: async (_, { pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        return await Content.find({ published: true })
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit);
      } catch (error) {
        console.error('Error fetching all content:', error);
        throw new Error('Failed to fetch content');
      }
    },
    
    // Analytics queries
    analytics: async (_, { days = 30 }) => {
      try {
        await clientPromise;
        
        // Get analytics for the specified number of days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        return await Analytics.findOne({
          date: { $gte: startDate }
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        throw new Error('Failed to fetch analytics');
      }
    }
  },
  
  Mutation: {
    // User feedback mutations
    submitFeedback: async (_, { input }) => {
      try {
        await clientPromise;
        return await feedbackManager.submitFeedback(input);
      } catch (error) {
        console.error('Error submitting feedback:', error);
        throw new Error('Failed to submit feedback');
      }
    },
    
    // User mutations
    saveGear: async (_, { userId, gearId }) => {
      try {
        await clientPromise;
        
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        
        const gear = await AudioGear.findById(gearId);
        if (!gear) {
          throw new Error('Gear not found');
        }
        
        // Add gear to user's saved gear if not already saved
        if (!user.savedGear.includes(gearId)) {
          user.savedGear.push(gearId);
          await user.save();
        }
        
        return user;
      } catch (error) {
        console.error('Error saving gear for user:', error);
        throw new Error('Failed to save gear');
      }
    },
    
    saveCase: async (_, { userId, caseId }) => {
      try {
        await clientPromise;
        
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        
        const caseItem = await Case.findById(caseId);
        if (!caseItem) {
          throw new Error('Case not found');
        }
        
        // Add case to user's saved cases if not already saved
        if (!user.savedCases.includes(caseId)) {
          user.savedCases.push(caseId);
          await user.save();
        }
        
        return user;
      } catch (error) {
        console.error('Error saving case for user:', error);
        throw new Error('Failed to save case');
      }
    },
    
    saveMatch: async (_, { userId, matchId }) => {
      try {
        await clientPromise;
        
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        
        const match = await GearCaseMatch.findById(matchId);
        if (!match) {
          throw new Error('Match not found');
        }
        
        // Add match to user's saved matches if not already saved
        if (!user.savedMatches.includes(matchId)) {
          user.savedMatches.push(matchId);
          await user.save();
        }
        
        return user;
      } catch (error) {
        console.error('Error saving match for user:', error);
        throw new Error('Failed to save match');
      }
    }
  }
};

// Create Apollo Server
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageDisabled()
      : undefined
  ].filter(Boolean) as any,
});

// Create handler for Next.js API route
const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req, res) => ({ req, res }),
});

export default async function graphqlHandler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Apollo-Require-Preflight');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Handle the GraphQL request
  return handler(req, res);
}
