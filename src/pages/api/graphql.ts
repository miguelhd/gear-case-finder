import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';  // Changed from @apollo/server
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
    categories: [String]
    types: [String]
    minPrice: Float
    maxPrice: Float
    features: [String]
    protectionLevels: [String]
    waterproof: Boolean
    shockproof: Boolean
    hasHandle: Boolean
    hasWheels: Boolean
    materials: [String]
    colors: [String]
    sortBy: String
    sortDirection: String
  }

  input PaginationInput {
    page: Int!
    limit: Int!
  }

  # Queries
  type Query {
    # Gear queries
    gear(id: ID!): AudioGear
    gearByName(name: String!): AudioGear
    allGear(pagination: PaginationInput): PaginatedAudioGear
    gearByBrand(brand: String!, pagination: PaginationInput): PaginatedAudioGear
    gearByCategory(category: String!, pagination: PaginationInput): PaginatedAudioGear
    gearByType(type: String!, pagination: PaginationInput): PaginatedAudioGear
    searchGear(query: String!, pagination: PaginationInput): PaginatedAudioGear
    filterGear(filter: FilterInput!, pagination: PaginationInput): PaginatedAudioGear
    gearBrands: [String]!
    gearCategories: [String]!
    gearTypes: [String]!
    
    # Case queries
    case(id: ID!): Case
    caseByName(name: String!): Case
    allCases(pagination: PaginationInput): PaginatedCases
    casesByBrand(brand: String!, pagination: PaginationInput): PaginatedCases
    casesByType(type: String!, pagination: PaginationInput): PaginatedCases
    searchCases(query: String!, pagination: PaginationInput): PaginatedCases
    filterCases(filter: FilterInput!, pagination: PaginationInput): PaginatedCases
    caseBrands: [String]!
    caseTypes: [String]!
    caseFeatures: [String]!
    caseProtectionLevels: [String]!
    caseMaterials: [String]!
    caseColors: [String]!
    
    # Match queries
    match(id: ID!): Match
    matchesByGear(gearId: ID!, pagination: PaginationInput): PaginatedMatches
    matchesByCase(caseId: ID!, pagination: PaginationInput): PaginatedMatches
    findMatches(
      gearId: ID!, 
      options: MatchingOptionsInput, 
      pagination: PaginationInput
    ): PaginatedMatches
    
    # User queries
    user(id: ID!): User
    userByEmail(email: String!): User
    
    # Content queries
    content(id: ID!): Content
    contentBySlug(slug: String!): Content
    allContent(contentType: String, pagination: PaginationInput): PaginatedContent
    searchContent(query: String!, pagination: PaginationInput): PaginatedContent
  }

  # Mutations
  type Mutation {
    # Gear mutations
    addGear(
      name: String!,
      brand: String!,
      category: String!,
      type: String!,
      dimensions: DimensionsInput!,
      weight: WeightInput,
      imageUrl: String,
      productUrl: String,
      description: String,
      popularity: Int,
      releaseYear: Int,
      discontinued: Boolean
    ): AudioGear
    
    updateGear(
      id: ID!,
      name: String,
      brand: String,
      category: String,
      type: String,
      dimensions: DimensionsInput,
      weight: WeightInput,
      imageUrl: String,
      productUrl: String,
      description: String,
      popularity: Int,
      releaseYear: Int,
      discontinued: Boolean
    ): AudioGear
    
    deleteGear(id: ID!): Boolean
    
    # Case mutations
    addCase(
      sourceId: String!,
      marketplace: String!,
      name: String!,
      brand: String,
      type: String!,
      externalDimensions: DimensionsInput!,
      internalDimensions: DimensionsInput!,
      weight: WeightInput,
      price: Float!,
      currency: String!,
      url: String!,
      imageUrls: [String]!,
      description: String,
      features: [String],
      rating: Float,
      reviewCount: Int,
      availability: String,
      seller: String,
      protectionLevel: String,
      waterproof: Boolean,
      shockproof: Boolean,
      hasHandle: Boolean,
      hasWheels: Boolean,
      material: String,
      color: String,
      compatibleWith: [String]
    ): Case
    
    updateCase(
      id: ID!,
      sourceId: String,
      marketplace: String,
      name: String,
      brand: String,
      type: String,
      externalDimensions: DimensionsInput,
      internalDimensions: DimensionsInput,
      weight: WeightInput,
      price: Float,
      currency: String,
      url: String,
      imageUrls: [String],
      description: String,
      features: [String],
      rating: Float,
      reviewCount: Int,
      availability: String,
      seller: String,
      protectionLevel: String,
      waterproof: Boolean,
      shockproof: Boolean,
      hasHandle: Boolean,
      hasWheels: Boolean,
      material: String,
      color: String,
      compatibleWith: [String]
    ): Case
    
    deleteCase(id: ID!): Boolean
    
    # Match mutations
    addMatch(
      gearId: ID!,
      caseId: ID!,
      compatibilityScore: Float!,
      dimensionFit: DimensionFit!,
      priceCategory: String!,
      protectionLevel: String!,
      features: [String]
    ): Match
    
    updateMatch(
      id: ID!,
      gearId: ID,
      caseId: ID,
      compatibilityScore: Float,
      dimensionFit: DimensionFit,
      priceCategory: String,
      protectionLevel: String,
      features: [String]
    ): Match
    
    deleteMatch(id: ID!): Boolean
    
    # Feedback mutations
    addFeedback(feedback: FeedbackInput!): Feedback
    
    # User mutations
    addUser(
      email: String!,
      name: String
    ): User
    
    updateUserPreferences(
      userId: ID!,
      preferredBrands: [String],
      excludedBrands: [String],
      preferredFeatures: [String],
      preferredProtectionLevel: String,
      maxPrice: Float
    ): User
    
    addSearchHistory(
      userId: ID!,
      query: String!
    ): User
    
    addViewHistory(
      userId: ID!,
      gearId: String!,
      caseId: String!
    ): User
    
    # Content mutations
    addContent(
      title: String!,
      slug: String!,
      content: String!,
      excerpt: String,
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      contentType: String!,
      relatedGear: [ID],
      relatedCases: [ID],
      author: String,
      publishDate: String!,
      status: String!
    ): Content
    
    updateContent(
      id: ID!,
      title: String,
      slug: String,
      content: String,
      excerpt: String,
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      contentType: String,
      relatedGear: [ID],
      relatedCases: [ID],
      author: String,
      publishDate: String,
      updateDate: String,
      status: String,
      viewCount: Int
    ): Content
    
    deleteContent(id: ID!): Boolean
    
    incrementContentViewCount(id: ID!): Content
  }
`;

// Define resolvers
const resolvers = {
  Query: {
    // Gear queries
    gear: async (_, { id }) => {
      try {
        await clientPromise;
        return await AudioGear.findById(id);
      } catch (error) {
        console.error('Error fetching gear by ID:', error);
        throw new Error('Failed to fetch gear');
      }
    },
    
    gearByName: async (_, { name }) => {
      try {
        await clientPromise;
        return await AudioGear.findOne({ name: { $regex: name, $options: 'i' } });
      } catch (error) {
        console.error('Error fetching gear by name:', error);
        throw new Error('Failed to fetch gear');
      }
    },
    
    allGear: async (_, { pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
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
      } catch (error) {
        console.error('Error fetching all gear:', error);
        throw new Error('Failed to fetch gear');
      }
    },
    
    gearByBrand: async (_, { brand, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const items = await AudioGear.find({ brand }).skip(skip).limit(limit);
        const total = await AudioGear.countDocuments({ brand });
        
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
        console.error('Error fetching gear by brand:', error);
        throw new Error('Failed to fetch gear');
      }
    },
    
    gearByCategory: async (_, { category, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const items = await AudioGear.find({ category }).skip(skip).limit(limit);
        const total = await AudioGear.countDocuments({ category });
        
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
        console.error('Error fetching gear by category:', error);
        throw new Error('Failed to fetch gear');
      }
    },
    
    gearByType: async (_, { type, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const items = await AudioGear.find({ type }).skip(skip).limit(limit);
        const total = await AudioGear.countDocuments({ type });
        
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
        console.error('Error fetching gear by type:', error);
        throw new Error('Failed to fetch gear');
      }
    },
    
    searchGear: async (_, { query, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const searchRegex = new RegExp(query, 'i');
        const items = await AudioGear.find({
          $or: [
            { name: searchRegex },
            { brand: searchRegex },
            { category: searchRegex },
            { type: searchRegex },
            { description: searchRegex }
          ]
        }).skip(skip).limit(limit);
        
        const total = await AudioGear.countDocuments({
          $or: [
            { name: searchRegex },
            { brand: searchRegex },
            { category: searchRegex },
            { type: searchRegex },
            { description: searchRegex }
          ]
        });
        
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
        const query = {};
        
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
        let sort = {};
        if (filter.sortBy) {
          sort[filter.sortBy] = filter.sortDirection === 'desc' ? -1 : 1;
        } else {
          sort = { name: 1 };
        }
        
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
      } catch (error) {
        console.error('Error filtering gear:', error);
        throw new Error('Failed to filter gear');
      }
    },
    
    gearBrands: async () => {
      try {
        await clientPromise;
        const brands = await AudioGear.distinct('brand');
        return brands;
      } catch (error) {
        console.error('Error fetching gear brands:', error);
        throw new Error('Failed to fetch gear brands');
      }
    },
    
    gearCategories: async () => {
      try {
        await clientPromise;
        const categories = await AudioGear.distinct('category');
        return categories;
      } catch (error) {
        console.error('Error fetching gear categories:', error);
        throw new Error('Failed to fetch gear categories');
      }
    },
    
    gearTypes: async () => {
      try {
        await clientPromise;
        const types = await AudioGear.distinct('type');
        return types;
      } catch (error) {
        console.error('Error fetching gear types:', error);
        throw new Error('Failed to fetch gear types');
      }
    },
    
    // Case queries
    case: async (_, { id }) => {
      try {
        await clientPromise;
        return await Case.findById(id);
      } catch (error) {
        console.error('Error fetching case by ID:', error);
        throw new Error('Failed to fetch case');
      }
    },
    
    caseByName: async (_, { name }) => {
      try {
        await clientPromise;
        return await Case.findOne({ name: { $regex: name, $options: 'i' } });
      } catch (error) {
        console.error('Error fetching case by name:', error);
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
    
    casesByBrand: async (_, { brand, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const items = await Case.find({ brand }).skip(skip).limit(limit);
        const total = await Case.countDocuments({ brand });
        
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
        console.error('Error fetching cases by brand:', error);
        throw new Error('Failed to fetch cases');
      }
    },
    
    casesByType: async (_, { type, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const items = await Case.find({ type }).skip(skip).limit(limit);
        const total = await Case.countDocuments({ type });
        
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
        console.error('Error fetching cases by type:', error);
        throw new Error('Failed to fetch cases');
      }
    },
    
    searchCases: async (_, { query, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const searchRegex = new RegExp(query, 'i');
        const items = await Case.find({
          $or: [
            { name: searchRegex },
            { brand: searchRegex },
            { type: searchRegex },
            { description: searchRegex }
          ]
        }).skip(skip).limit(limit);
        
        const total = await Case.countDocuments({
          $or: [
            { name: searchRegex },
            { brand: searchRegex },
            { type: searchRegex },
            { description: searchRegex }
          ]
        });
        
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
        const query = {};
        
        if (filter.brands && filter.brands.length > 0) {
          query.brand = { $in: filter.brands };
        }
        
        if (filter.types && filter.types.length > 0) {
          query.type = { $in: filter.types };
        }
        
        if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
          query.price = {};
          if (filter.minPrice !== undefined) {
            query.price.$gte = filter.minPrice;
          }
          if (filter.maxPrice !== undefined) {
            query.price.$lte = filter.maxPrice;
          }
        }
        
        if (filter.features && filter.features.length > 0) {
          query.features = { $all: filter.features };
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
        
        if (filter.hasHandle !== undefined) {
          query.hasHandle = filter.hasHandle;
        }
        
        if (filter.hasWheels !== undefined) {
          query.hasWheels = filter.hasWheels;
        }
        
        if (filter.materials && filter.materials.length > 0) {
          query.material = { $in: filter.materials };
        }
        
        if (filter.colors && filter.colors.length > 0) {
          query.color = { $in: filter.colors };
        }
        
        // Apply sorting
        let sort = {};
        if (filter.sortBy) {
          sort[filter.sortBy] = filter.sortDirection === 'desc' ? -1 : 1;
        } else {
          sort = { name: 1 };
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
    
    caseBrands: async () => {
      try {
        await clientPromise;
        const brands = await Case.distinct('brand');
        return brands.filter(brand => brand); // Filter out null/undefined values
      } catch (error) {
        console.error('Error fetching case brands:', error);
        throw new Error('Failed to fetch case brands');
      }
    },
    
    caseTypes: async () => {
      try {
        await clientPromise;
        const types = await Case.distinct('type');
        return types;
      } catch (error) {
        console.error('Error fetching case types:', error);
        throw new Error('Failed to fetch case types');
      }
    },
    
    caseFeatures: async () => {
      try {
        await clientPromise;
        // Aggregate all features from all cases
        const cases = await Case.find({}, { features: 1 });
        const featuresSet = new Set();
        
        cases.forEach(caseItem => {
          if (caseItem.features && Array.isArray(caseItem.features)) {
            caseItem.features.forEach(feature => featuresSet.add(feature));
          }
        });
        
        return Array.from(featuresSet);
      } catch (error) {
        console.error('Error fetching case features:', error);
        throw new Error('Failed to fetch case features');
      }
    },
    
    caseProtectionLevels: async () => {
      try {
        await clientPromise;
        const protectionLevels = await Case.distinct('protectionLevel');
        return protectionLevels.filter(level => level); // Filter out null/undefined values
      } catch (error) {
        console.error('Error fetching case protection levels:', error);
        throw new Error('Failed to fetch case protection levels');
      }
    },
    
    caseMaterials: async () => {
      try {
        await clientPromise;
        const materials = await Case.distinct('material');
        return materials.filter(material => material); // Filter out null/undefined values
      } catch (error) {
        console.error('Error fetching case materials:', error);
        throw new Error('Failed to fetch case materials');
      }
    },
    
    caseColors: async () => {
      try {
        await clientPromise;
        const colors = await Case.distinct('color');
        return colors.filter(color => color); // Filter out null/undefined values
      } catch (error) {
        console.error('Error fetching case colors:', error);
        throw new Error('Failed to fetch case colors');
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
        const gear = await AudioGear.findById(match.gearId);
        const caseItem = await Case.findById(match.caseId);
        
        if (!gear || !caseItem) {
          throw new Error('Associated gear or case not found');
        }
        
        return {
          ...match.toObject(),
          gear,
          case: caseItem
        };
      } catch (error) {
        console.error('Error fetching match by ID:', error);
        throw new Error('Failed to fetch match');
      }
    },
    
    matchesByGear: async (_, { gearId, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const matches = await GearCaseMatch.find({ gearId }).skip(skip).limit(limit);
        const total = await GearCaseMatch.countDocuments({ gearId });
        
        // Populate gear and case data for each match
        const populatedMatches = await Promise.all(matches.map(async match => {
          const gear = await AudioGear.findById(match.gearId);
          const caseItem = await Case.findById(match.caseId);
          
          if (!gear || !caseItem) {
            return null;
          }
          
          return {
            ...match.toObject(),
            gear,
            case: caseItem
          };
        }));
        
        // Filter out null values (matches with missing gear or case)
        const validMatches = populatedMatches.filter(match => match !== null);
        
        return {
          items: validMatches,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        };
      } catch (error) {
        console.error('Error fetching matches by gear ID:', error);
        throw new Error('Failed to fetch matches');
      }
    },
    
    matchesByCase: async (_, { caseId, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const matches = await GearCaseMatch.find({ caseId }).skip(skip).limit(limit);
        const total = await GearCaseMatch.countDocuments({ caseId });
        
        // Populate gear and case data for each match
        const populatedMatches = await Promise.all(matches.map(async match => {
          const gear = await AudioGear.findById(match.gearId);
          const caseItem = await Case.findById(match.caseId);
          
          if (!gear || !caseItem) {
            return null;
          }
          
          return {
            ...match.toObject(),
            gear,
            case: caseItem
          };
        }));
        
        // Filter out null values (matches with missing gear or case)
        const validMatches = populatedMatches.filter(match => match !== null);
        
        return {
          items: validMatches,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        };
      } catch (error) {
        console.error('Error fetching matches by case ID:', error);
        throw new Error('Failed to fetch matches');
      }
    },
    
    findMatches: async (_, { gearId, options = {}, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        // Get the gear item
        const gear = await AudioGear.findById(gearId);
        if (!gear) {
          throw new Error('Gear not found');
        }
        
        // Use the product matcher to find compatible cases
        const matches = await productMatcher.findCompatibleCases(gear, options);
        
        // Apply pagination
        const paginatedMatches = matches.slice(skip, skip + limit);
        
        // Format the response
        return {
          items: paginatedMatches,
          pagination: {
            total: matches.length,
            page,
            limit,
            pages: Math.ceil(matches.length / limit)
          }
        };
      } catch (error) {
        console.error('Error finding matches:', error);
        throw new Error('Failed to find matches');
      }
    },
    
    // User queries
    user: async (_, { id }) => {
      try {
        await clientPromise;
        return await User.findById(id);
      } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw new Error('Failed to fetch user');
      }
    },
    
    userByEmail: async (_, { email }) => {
      try {
        await clientPromise;
        return await User.findOne({ email });
      } catch (error) {
        console.error('Error fetching user by email:', error);
        throw new Error('Failed to fetch user');
      }
    },
    
    // Content queries
    content: async (_, { id }) => {
      try {
        await clientPromise;
        return await Content.findById(id);
      } catch (error) {
        console.error('Error fetching content by ID:', error);
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
    
    allContent: async (_, { contentType, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const query = contentType ? { contentType } : {};
        
        const items = await Content.find(query).skip(skip).limit(limit);
        const total = await Content.countDocuments(query);
        
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
        console.error('Error fetching all content:', error);
        throw new Error('Failed to fetch content');
      }
    },
    
    searchContent: async (_, { query, pagination = { page: 1, limit: 10 } }) => {
      try {
        await clientPromise;
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        
        const searchRegex = new RegExp(query, 'i');
        const items = await Content.find({
          $or: [
            { title: searchRegex },
            { content: searchRegex },
            { excerpt: searchRegex },
            { metaTitle: searchRegex },
            { metaDescription: searchRegex },
            { keywords: searchRegex }
          ]
        }).skip(skip).limit(limit);
        
        const total = await Content.countDocuments({
          $or: [
            { title: searchRegex },
            { content: searchRegex },
            { excerpt: searchRegex },
            { metaTitle: searchRegex },
            { metaDescription: searchRegex },
            { keywords: searchRegex }
          ]
        });
        
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
        console.error('Error searching content:', error);
        throw new Error('Failed to search content');
      }
    }
  },
  
  Mutation: {
    // Gear mutations
    addGear: async (_, args) => {
      try {
        await clientPromise;
        const newGear = new AudioGear(args);
        return await newGear.save();
      } catch (error) {
        console.error('Error adding gear:', error);
        throw new Error('Failed to add gear');
      }
    },
    
    updateGear: async (_, { id, ...updates }) => {
      try {
        await clientPromise;
        return await AudioGear.findByIdAndUpdate(id, updates, { new: true });
      } catch (error) {
        console.error('Error updating gear:', error);
        throw new Error('Failed to update gear');
      }
    },
    
    deleteGear: async (_, { id }) => {
      try {
        await clientPromise;
        await AudioGear.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.error('Error deleting gear:', error);
        throw new Error('Failed to delete gear');
      }
    },
    
    // Case mutations
    addCase: async (_, args) => {
      try {
        await clientPromise;
        const newCase = new Case(args);
        return await newCase.save();
      } catch (error) {
        console.error('Error adding case:', error);
        throw new Error('Failed to add case');
      }
    },
    
    updateCase: async (_, { id, ...updates }) => {
      try {
        await clientPromise;
        return await Case.findByIdAndUpdate(id, updates, { new: true });
      } catch (error) {
        console.error('Error updating case:', error);
        throw new Error('Failed to update case');
      }
    },
    
    deleteCase: async (_, { id }) => {
      try {
        await clientPromise;
        await Case.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.error('Error deleting case:', error);
        throw new Error('Failed to delete case');
      }
    },
    
    // Match mutations
    addMatch: async (_, args) => {
      try {
        await clientPromise;
        const newMatch = new GearCaseMatch(args);
        return await newMatch.save();
      } catch (error) {
        console.error('Error adding match:', error);
        throw new Error('Failed to add match');
      }
    },
    
    updateMatch: async (_, { id, ...updates }) => {
      try {
        await clientPromise;
        return await GearCaseMatch.findByIdAndUpdate(id, updates, { new: true });
      } catch (error) {
        console.error('Error updating match:', error);
        throw new Error('Failed to update match');
      }
    },
    
    deleteMatch: async (_, { id }) => {
      try {
        await clientPromise;
        await GearCaseMatch.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.error('Error deleting match:', error);
        throw new Error('Failed to delete match');
      }
    },
    
    // Feedback mutations
    addFeedback: async (_, { feedback }) => {
      try {
        await clientPromise;
        return await feedbackManager.addFeedback(feedback);
      } catch (error) {
        console.error('Error adding feedback:', error);
        throw new Error('Failed to add feedback');
      }
    },
    
    // User mutations
    addUser: async (_, args) => {
      try {
        await clientPromise;
        const newUser = new User({
          ...args,
          preferences: {},
          searchHistory: [],
          viewHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return await newUser.save();
      } catch (error) {
        console.error('Error adding user:', error);
        throw new Error('Failed to add user');
      }
    },
    
    updateUserPreferences: async (_, { userId, ...preferences }) => {
      try {
        await clientPromise;
        return await User.findByIdAndUpdate(
          userId,
          { 
            preferences,
            updatedAt: new Date().toISOString()
          },
          { new: true }
        );
      } catch (error) {
        console.error('Error updating user preferences:', error);
        throw new Error('Failed to update user preferences');
      }
    },
    
    addSearchHistory: async (_, { userId, query }) => {
      try {
        await clientPromise;
        return await User.findByIdAndUpdate(
          userId,
          { 
            $push: { 
              searchHistory: { 
                query, 
                timestamp: new Date().toISOString() 
              } 
            },
            updatedAt: new Date().toISOString()
          },
          { new: true }
        );
      } catch (error) {
        console.error('Error adding search history:', error);
        throw new Error('Failed to add search history');
      }
    },
    
    addViewHistory: async (_, { userId, gearId, caseId }) => {
      try {
        await clientPromise;
        return await User.findByIdAndUpdate(
          userId,
          { 
            $push: { 
              viewHistory: { 
                gearId, 
                caseId, 
                timestamp: new Date().toISOString() 
              } 
            },
            updatedAt: new Date().toISOString()
          },
          { new: true }
        );
      } catch (error) {
        console.error('Error adding view history:', error);
        throw new Error('Failed to add view history');
      }
    },
    
    // Content mutations
    addContent: async (_, args) => {
      try {
        await clientPromise;
        const newContent = new Content({
          ...args,
          viewCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return await newContent.save();
      } catch (error) {
        console.error('Error adding content:', error);
        throw new Error('Failed to add content');
      }
    },
    
    updateContent: async (_, { id, ...updates }) => {
      try {
        await clientPromise;
        return await Content.findByIdAndUpdate(
          id,
          {
            ...updates,
            updatedAt: new Date().toISOString()
          },
          { new: true }
        );
      } catch (error) {
        console.error('Error updating content:', error);
        throw new Error('Failed to update content');
      }
    },
    
    deleteContent: async (_, { id }) => {
      try {
        await clientPromise;
        await Content.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.error('Error deleting content:', error);
        throw new Error('Failed to delete content');
      }
    },
    
    incrementContentViewCount: async (_, { id }) => {
      try {
        await clientPromise;
        return await Content.findByIdAndUpdate(
          id,
          { $inc: { viewCount: 1 } },
          { new: true }
        );
      } catch (error) {
        console.error('Error incrementing content view count:', error);
        throw new Error('Failed to increment content view count');
      }
    }
  },
  
  // Field resolvers
  AudioGear: {
    compatibleCases: async (parent, { limit = 5 }) => {
      try {
        await clientPromise;
        const matches = await GearCaseMatch.find({ gearId: parent.id }).limit(limit);
        
        // Get case IDs from matches
        const caseIds = matches.map(match => match.caseId);
        
        // Fetch cases
        return await Case.find({ _id: { $in: caseIds } });
      } catch (error) {
        console.error('Error fetching compatible cases:', error);
        throw new Error('Failed to fetch compatible cases');
      }
    }
  },
  
  Case: {
    compatibleGear: async (parent, { limit = 5 }) => {
      try {
        await clientPromise;
        const matches = await GearCaseMatch.find({ caseId: parent.id }).limit(limit);
        
        // Get gear IDs from matches
        const gearIds = matches.map(match => match.gearId);
        
        // Fetch gear
        return await AudioGear.find({ _id: { $in: gearIds } });
      } catch (error) {
        console.error('Error fetching compatible gear:', error);
        throw new Error('Failed to fetch compatible gear');
      }
    }
  },
  
  Match: {
    gear: async (parent) => {
      try {
        await clientPromise;
        return await AudioGear.findById(parent.gearId);
      } catch (error) {
        console.error('Error fetching gear for match:', error);
        throw new Error('Failed to fetch gear for match');
      }
    },
    
    case: async (parent) => {
      try {
        await clientPromise;
        return await Case.findById(parent.caseId);
      } catch (error) {
        console.error('Error fetching case for match:', error);
        throw new Error('Failed to fetch case for match');
      }
    },
    
    feedback: async (parent) => {
      try {
        await clientPromise;
        return await feedbackManager.getFeedbackForMatch(parent.gearId, parent.caseId);
      } catch (error) {
        console.error('Error fetching feedback for match:', error);
        throw new Error('Failed to fetch feedback for match');
      }
    },
    
    averageRating: async (parent) => {
      try {
        await clientPromise;
        return await feedbackManager.getAverageRatingForMatch(parent.gearId, parent.caseId);
      } catch (error) {
        console.error('Error calculating average rating for match:', error);
        throw new Error('Failed to calculate average rating for match');
      }
    }
  },
  
  Content: {
    relatedGear: async (parent) => {
      try {
        await clientPromise;
        if (!parent.relatedGear || parent.relatedGear.length === 0) {
          return [];
        }
        
        return await AudioGear.find({ _id: { $in: parent.relatedGear } });
      } catch (error) {
        console.error('Error fetching related gear for content:', error);
        throw new Error('Failed to fetch related gear for content');
      }
    },
    
    relatedCases: async (parent) => {
      try {
        await clientPromise;
        if (!parent.relatedCases || parent.relatedCases.length === 0) {
          return [];
        }
        
        return await Case.find({ _id: { $in: parent.relatedCases } });
      } catch (error) {
        console.error('Error fetching related cases for content:', error);
        throw new Error('Failed to fetch related cases for content');
      }
    }
  }
};

// Create Apollo Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create handler with Next.js integration
const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req, res) => {
    // Ensure CORS headers are set for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apollo-require-preflight, Apollo-Require-Preflight');
    
    // Handle OPTIONS requests explicitly
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return { req, res };
    }
    
    return {
      req,
      res,
      db: await clientPromise,
      // Set auth to null to explicitly disable authentication checks
      auth: null
    };
  },
});

// Export the handler for Next.js API routes
export default handler;

// Disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};
