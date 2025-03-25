import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'apollo-server-micro';
import { clientPromise, mongoose } from '../../lib/mongodb';
import { AudioGear, Case, GearCaseMatch } from '../../lib/models/gear-models';
import { User, Content, Analytics, IAffiliate } from '../../lib/models/website-models';
import { ProductMatcher } from '../../lib/matching/product-matcher';
import { RecommendationEngine } from '../../lib/matching/recommendation-engine';
import { FeedbackManager } from '../../lib/matching/feedback-manager';
import { NextApiRequest, NextApiResponse } from 'next';

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
    
    # Admin mutations
    refreshCaseData(marketplace: String): Boolean
    refreshGearData(category: String): Boolean
    rebuildMatchIndex: Boolean
  }
`;

// Define resolvers
const resolvers = {
  Query: {
    // Gear queries
    gear: async (_: any, { id }: { id: string }) => {
      try {
        const gear = await AudioGear.findById(id);
        return gear;
      } catch (error) {
        console.error('Error fetching gear:', error);
        throw new Error('Failed to fetch gear');
      }
    },
    allGear: async (_: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      try {
        const gear = await AudioGear.find().limit(limit).skip(offset);
        return gear;
      } catch (error) {
        console.error('Error fetching all gear:', error);
        throw new Error('Failed to fetch all gear');
      }
    },
    searchGear: async (_: any, { query, limit = 10 }: { query: string; limit?: number }) => {
      try {
        const regex = new RegExp(query, 'i');
        const gear = await AudioGear.find({
          $or: [
            { name: regex },
            { brand: regex },
            { category: regex },
            { type: regex },
            { description: regex },
          ],
        }).limit(limit);
        return gear;
      } catch (error) {
        console.error('Error searching gear:', error);
        throw new Error('Failed to search gear');
      }
    },
    gearByCategory: async (
      _: any,
      { category, limit = 10, offset = 0 }: { category: string; limit?: number; offset?: number }
    ) => {
      try {
        const gear = await AudioGear.find({ category }).limit(limit).skip(offset);
        return gear;
      } catch (error) {
        console.error('Error fetching gear by category:', error);
        throw new Error('Failed to fetch gear by category');
      }
    },
    gearByBrand: async (
      _: any,
      { brand, limit = 10, offset = 0 }: { brand: string; limit?: number; offset?: number }
    ) => {
      try {
        const gear = await AudioGear.find({ brand }).limit(limit).skip(offset);
        return gear;
      } catch (error) {
        console.error('Error fetching gear by brand:', error);
        throw new Error('Failed to fetch gear by brand');
      }
    },
    popularGear: async (_: any, { limit = 10 }: { limit?: number }) => {
      try {
        const gear = await AudioGear.find().sort({ popularity: -1 }).limit(limit);
        return gear;
      } catch (error) {
        console.error('Error fetching popular gear:', error);
        throw new Error('Failed to fetch popular gear');
      }
    },
    gearCategories: async () => {
      try {
        const categories = await AudioGear.distinct('category');
        return categories;
      } catch (error) {
        console.error('Error fetching gear categories:', error);
        throw new Error('Failed to fetch gear categories');
      }
    },
    gearBrands: async () => {
      try {
        const brands = await AudioGear.distinct('brand');
        return brands;
      } catch (error) {
        console.error('Error fetching gear brands:', error);
        throw new Error('Failed to fetch gear brands');
      }
    },
    paginatedGear: async (_: any, { filter = {} }: { filter?: any }) => {
      try {
        const {
          brands,
          types,
          categories,
          sortBy = 'name',
          sortDirection = 'asc',
          page = 1,
          limit = 10,
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

        const total = await AudioGear.countDocuments(query);
        const pages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const items = await AudioGear.find(query).sort(sort).skip(skip).limit(limit);

        return {
          items,
          pagination: {
            total,
            page,
            limit,
            pages,
          },
        };
      } catch (error) {
        console.error('Error fetching paginated gear:', error);
        throw new Error('Failed to fetch paginated gear');
      }
    },

    // Case queries
    case: async (_: any, { id }: { id: string }) => {
      try {
        const caseItem = await Case.findById(id);
        return caseItem;
      } catch (error) {
        console.error('Error fetching case:', error);
        throw new Error('Failed to fetch case');
      }
    },
    allCases: async (_: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      try {
        const cases = await Case.find().limit(limit).skip(offset);
        return cases;
      } catch (error) {
        console.error('Error fetching all cases:', error);
        throw new Error('Failed to fetch all cases');
      }
    },
    searchCases: async (_: any, { query, limit = 10 }: { query: string; limit?: number }) => {
      try {
        const regex = new RegExp(query, 'i');
        const cases = await Case.find({
          $or: [
            { name: regex },
            { brand: regex },
            { type: regex },
            { description: regex },
          ],
        }).limit(limit);
        return cases;
      } catch (error) {
        console.error('Error searching cases:', error);
        throw new Error('Failed to search cases');
      }
    },
    casesByType: async (
      _: any,
      { type, limit = 10, offset = 0 }: { type: string; limit?: number; offset?: number }
    ) => {
      try {
        const cases = await Case.find({ type }).limit(limit).skip(offset);
        return cases;
      } catch (error) {
        console.error('Error fetching cases by type:', error);
        throw new Error('Failed to fetch cases by type');
      }
    },
    casesByBrand: async (
      _: any,
      { brand, limit = 10, offset = 0 }: { brand: string; limit?: number; offset?: number }
    ) => {
      try {
        const cases = await Case.find({ brand }).limit(limit).skip(offset);
        return cases;
      } catch (error) {
        console.error('Error fetching cases by brand:', error);
        throw new Error('Failed to fetch cases by brand');
      }
    },
    casesByMarketplace: async (
      _: any,
      { marketplace, limit = 10, offset = 0 }: { marketplace: string; limit?: number; offset?: number }
    ) => {
      try {
        const cases = await Case.find({ marketplace }).limit(limit).skip(offset);
        return cases;
      } catch (error) {
        console.error('Error fetching cases by marketplace:', error);
        throw new Error('Failed to fetch cases by marketplace');
      }
    },
    popularCases: async (_: any, { limit = 10 }: { limit?: number }) => {
      try {
        const cases = await Case.find().sort({ reviewCount: -1 }).limit(limit);
        return cases;
      } catch (error) {
        console.error('Error fetching popular cases:', error);
        throw new Error('Failed to fetch popular cases');
      }
    },
    caseTypes: async () => {
      try {
        const types = await Case.distinct('type');
        return types;
      } catch (error) {
        console.error('Error fetching case types:', error);
        throw new Error('Failed to fetch case types');
      }
    },
    caseBrands: async () => {
      try {
        const brands = await Case.distinct('brand');
        return brands;
      } catch (error) {
        console.error('Error fetching case brands:', error);
        throw new Error('Failed to fetch case brands');
      }
    },
    caseMarketplaces: async () => {
      try {
        const marketplaces = await Case.distinct('marketplace');
        return marketplaces;
      } catch (error) {
        console.error('Error fetching case marketplaces:', error);
        throw new Error('Failed to fetch case marketplaces');
      }
    },
    paginatedCases: async (_: any, { filter = {} }: { filter?: any }) => {
      try {
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
          sortBy = 'name',
          sortDirection = 'asc',
          page = 1,
          limit = 10,
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

        const total = await Case.countDocuments(query);
        const pages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const items = await Case.find(query).sort(sort).skip(skip).limit(limit);

        return {
          items,
          pagination: {
            total,
            page,
            limit,
            pages,
          },
        };
      } catch (error) {
        console.error('Error fetching paginated cases:', error);
        throw new Error('Failed to fetch paginated cases');
      }
    },
    casePriceRange: async () => {
      try {
        const result = await Case.aggregate([
          {
            $group: {
              _id: null,
              min: { $min: '$price' },
              max: { $max: '$price' },
            },
          },
        ]);

        if (result.length > 0) {
          return [result[0].min, result[0].max];
        }
        return [0, 0];
      } catch (error) {
        console.error('Error fetching case price range:', error);
        throw new Error('Failed to fetch case price range');
      }
    },

    // Match queries
    match: async (_: any, { gearId, caseId }: { gearId: string; caseId: string }) => {
      try {
        const match = await GearCaseMatch.findOne({ gear: gearId, case: caseId })
          .populate('gear')
          .populate('case');
        return match;
      } catch (error) {
        console.error('Error fetching match:', error);
        throw new Error('Failed to fetch match');
      }
    },
    matchesForGear: async (_: any, { gearId, limit = 10 }: { gearId: string; limit?: number }) => {
      try {
        const matches = await GearCaseMatch.find({ gear: gearId })
          .sort({ compatibilityScore: -1 })
          .limit(limit)
          .populate('gear')
          .populate('case');
        return matches;
      } catch (error) {
        console.error('Error fetching matches for gear:', error);
        throw new Error('Failed to fetch matches for gear');
      }
    },
    matchesForCase: async (_: any, { caseId, limit = 10 }: { caseId: string; limit?: number }) => {
      try {
        const matches = await GearCaseMatch.find({ case: caseId })
          .sort({ compatibilityScore: -1 })
          .limit(limit)
          .populate('gear')
          .populate('case');
        return matches;
      } catch (error) {
        console.error('Error fetching matches for case:', error);
        throw new Error('Failed to fetch matches for case');
      }
    },
    popularMatches: async (_: any, { limit = 10 }: { limit?: number }) => {
      try {
        const matches = await GearCaseMatch.find()
          .sort({ averageRating: -1, compatibilityScore: -1 })
          .limit(limit)
          .populate('gear')
          .populate('case');
        return matches;
      } catch (error) {
        console.error('Error fetching popular matches:', error);
        throw new Error('Failed to fetch popular matches');
      }
    },
    paginatedMatches: async (_: any, { filter = {} }: { filter?: any }) => {
      try {
        const {
          sortBy = 'compatibilityScore',
          sortDirection = 'desc',
          page = 1,
          limit = 10,
        } = filter;

        const sort: any = {};
        sort[sortBy] = sortDirection === 'asc' ? 1 : -1;

        const total = await GearCaseMatch.countDocuments();
        const pages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const items = await GearCaseMatch.find()
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('gear')
          .populate('case');

        return {
          items,
          pagination: {
            total,
            page,
            limit,
            pages,
          },
        };
      } catch (error) {
        console.error('Error fetching paginated matches:', error);
        throw new Error('Failed to fetch paginated matches');
      }
    },

    // Content queries
    content: async (_: any, { slug }: { slug: string }) => {
      try {
        const content = await Content.findOne({ slug });
        return content;
      } catch (error) {
        console.error('Error fetching content:', error);
        throw new Error('Failed to fetch content');
      }
    },
    allContent: async (_: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      try {
        const content = await Content.find().limit(limit).skip(offset);
        return content;
      } catch (error) {
        console.error('Error fetching all content:', error);
        throw new Error('Failed to fetch all content');
      }
    },
    contentByType: async (
      _: any,
      { contentType, limit = 10, offset = 0 }: { contentType: string; limit?: number; offset?: number }
    ) => {
      try {
        const content = await Content.find({ contentType }).limit(limit).skip(offset);
        return content;
      } catch (error) {
        console.error('Error fetching content by type:', error);
        throw new Error('Failed to fetch content by type');
      }
    },
    popularContent: async (_: any, { limit = 10 }: { limit?: number }) => {
      try {
        const content = await Content.find().sort({ viewCount: -1 }).limit(limit);
        return content;
      } catch (error) {
        console.error('Error fetching popular content:', error);
        throw new Error('Failed to fetch popular content');
      }
    },
    paginatedContent: async (_: any, { filter = {} }: { filter?: any }) => {
      try {
        const {
          sortBy = 'publishDate',
          sortDirection = 'desc',
          page = 1,
          limit = 10,
        } = filter;

        const sort: any = {};
        sort[sortBy] = sortDirection === 'asc' ? 1 : -1;

        const total = await Content.countDocuments();
        const pages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const items = await Content.find().sort(sort).skip(skip).limit(limit);

        return {
          items,
          pagination: {
            total,
            page,
            limit,
            pages,
          },
        };
      } catch (error) {
        console.error('Error fetching paginated content:', error);
        throw new Error('Failed to fetch paginated content');
      }
    },

    // User queries
    user: async (_: any, { id }: { id: string }) => {
      try {
        const user = await User.findById(id);
        return user;
      } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Failed to fetch user');
      }
    },
    userByEmail: async (_: any, { email }: { email: string }) => {
      try {
        const user = await User.findOne({ email });
        return user;
      } catch (error) {
        console.error('Error fetching user by email:', error);
        throw new Error('Failed to fetch user by email');
      }
    },
  },

  Mutation: {
    // Matching mutations
    findCompatibleCases: async (
      _: any,
      { gearId, options = {} }: { gearId: string; options?: any }
    ) => {
      try {
        const gear = await AudioGear.findById(gearId);
        if (!gear) {
          throw new Error('Gear not found');
        }

        const compatibleCases = await productMatcher.findCompatibleCases(gear, options);
        return compatibleCases;
      } catch (error) {
        console.error('Error finding compatible cases:', error);
        throw new Error('Failed to find compatible cases');
      }
    },
    recommendAlternativeCases: async (
      _: any,
      { gearId, caseId, options = {} }: { gearId: string; caseId: string; options?: any }
    ) => {
      try {
        const gear = await AudioGear.findById(gearId);
        if (!gear) {
          throw new Error('Gear not found');
        }

        const caseItem = await Case.findById(caseId);
        if (!caseItem) {
          throw new Error('Case not found');
        }

        // Since recommendAlternativeCases doesn't exist, we'll use a simpler implementation
        // This is a placeholder - in a real implementation, you would implement this method in the RecommendationEngine class
        const alternativeCases = await Case.find({
          _id: { $ne: caseId },
          type: caseItem.type,
        }).limit(options.maxResults || 5);
        return alternativeCases;
      } catch (error) {
        console.error('Error recommending alternative cases:', error);
        throw new Error('Failed to recommend alternative cases');
      }
    },

    // Feedback mutations
    submitFeedback: async (_: any, { feedback }: { feedback: any }) => {
      try {
        const result = await feedbackManager.submitFeedback(feedback);
        return result;
      } catch (error) {
        console.error('Error submitting feedback:', error);
        throw new Error('Failed to submit feedback');
      }
    },

    // User mutations
    updateUserPreferences: async (
      _: any,
      { userId, preferences }: { userId: string; preferences: any }
    ) => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { preferences },
          { new: true }
        );
        return user;
      } catch (error) {
        console.error('Error updating user preferences:', error);
        throw new Error('Failed to update user preferences');
      }
    },

    // Admin mutations
    refreshCaseData: async (_: any, { marketplace }: { marketplace?: string }) => {
      try {
        // Implementation would depend on your data refresh logic
        console.log(`Refreshing case data for marketplace: ${marketplace || 'all'}`);
        return true;
      } catch (error) {
        console.error('Error refreshing case data:', error);
        throw new Error('Failed to refresh case data');
      }
    },
    refreshGearData: async (_: any, { category }: { category?: string }) => {
      try {
        // Implementation would depend on your data refresh logic
        console.log(`Refreshing gear data for category: ${category || 'all'}`);
        return true;
      } catch (error) {
        console.error('Error refreshing gear data:', error);
        throw new Error('Failed to refresh gear data');
      }
    },
    rebuildMatchIndex: async () => {
      try {
        // Implementation would depend on your index rebuild logic
        console.log('Rebuilding match index');
        return true;
      } catch (error) {
        console.error('Error rebuilding match index:', error);
        throw new Error('Failed to rebuild match index');
      }
    },
  },

  // Field resolvers
  AudioGear: {
    compatibleCases: async (parent: any, { limit = 10 }: { limit?: number }) => {
      try {
        const matches = await GearCaseMatch.find({ gear: parent.id })
          .sort({ compatibilityScore: -1 })
          .limit(limit)
          .populate('case');
        return matches.map((match) => match.case);
      } catch (error) {
        console.error('Error fetching compatible cases for gear:', error);
        throw new Error('Failed to fetch compatible cases for gear');
      }
    },
  },

  Case: {
    compatibleGear: async (parent: any, { limit = 10 }: { limit?: number }) => {
      try {
        const matches = await GearCaseMatch.find({ case: parent.id })
          .sort({ compatibilityScore: -1 })
          .limit(limit)
          .populate('gear');
        return matches.map((match) => match.gear);
      } catch (error) {
        console.error('Error fetching compatible gear for case:', error);
        throw new Error('Failed to fetch compatible gear for case');
      }
    },
  },
};

// Create Apollo Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create handler with Next.js integration
const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req, res) => {
    return {
      req,
      res,
      db: await clientPromise,
    };
  },
});

// Export the handler for Next.js API routes
export default async function graphqlHandler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS method for preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Process the request with the Apollo handler
  return handler(req, res);
}

// Disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};
