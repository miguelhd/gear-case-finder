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
          { type: { $regex: query, $options: 'i' } }
        ]
      }).limit(limit);
    },
    gearByCategory: async (_: any, { category, limit = 20, offset = 0 }: { category: string, limit?: number, offset?: number }) => {
      return await AudioGear.find({ category }).limit(limit).skip(offset);
    },
    gearByBrand: async (_: any, { brand, limit = 20, offset = 0 }: { brand: string, limit?: number, offset?: number }) => {
      return await AudioGear.find({ brand }).limit(limit).skip(offset);
    },
    popularGear: async (_: any, { limit = 20 }: { limit?: number }) => {
      return await AudioGear.find().sort({ popularity: -1 }).limit(limit);
    },
    gearCategories: async (_: any) => {
      return await AudioGear.distinct('category');
    },
    gearBrands: async (_: any) => {
      return await AudioGear.distinct('brand');
    },
    paginatedGear: async (_: any, { filter = {} }: { filter?: any }) => {
      const {
        categories,
        brands,
        page = 1,
        limit = 20,
        sortBy = 'popularity',
        sortDirection = 'desc'
      } = filter;

      const query: any = {};
      if (categories && categories.length > 0) {
        query.category = { $in: categories };
      }
      if (brands && brands.length > 0) {
        query.brand = { $in: brands };
      }

      const sort: { [key: string]: 1 | -1 } = {};
      sort[sortBy] = sortDirection === 'asc' ? 1 : -1;

      const skip = (page - 1) * limit;
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
          { type: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
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
    popularCases: async (_: any, { limit = 20 }: { limit?: number }) => {
      return await Case.find().sort({ rating: -1 }).limit(limit);
    },
    caseTypes: async (_: any) => {
      return await Case.distinct('type');
    },
    caseBrands: async (_: any) => {
      return await Case.distinct('brand');
    },
    caseMarketplaces: async (_: any) => {
      return await Case.distinct('marketplace');
    },
    paginatedCases: async (_: any, { filter = {} }: { filter?: any }) => {
      const {
        types,
        brands,
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
        sortBy = 'rating',
        sortDirection = 'desc'
      } = filter;

      const query: Record<string, any> = {};
      if (types && types.length > 0) {
        query.type = { $in: types };
      }
      if (brands && brands.length > 0) {
        query.brand = { $in: brands };
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
        query.features = { $in: features };
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

      const sort: { [key: string]: 1 | -1 } = {};
      sort[sortBy] = sortDirection === 'asc' ? 1 : -1;

      const skip = (page - 1) * limit;
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
    matchesForGear: async (_, { gearId, limit = 10 }) => {
      const matches = await GearCaseMatch.find({ gearId })
        .sort({ compatibilityScore: -1 })
        .limit(limit)
        .populate('gearId')
        .populate('caseId');
      
      return matches.map(match => ({
        id: match._id,
        gear: match.gearId,
        case: match.caseId,
        compatibilityScore: match.compatibilityScore,
        dimensionFit: match.dimensionFit,
        priceCategory: match.priceCategory,
        protectionLevel: match.protectionLe<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>