"use strict";
(() => {
var exports = {};
exports.id = 702;
exports.ids = [702];
exports.modules = {

/***/ 8013:
/***/ ((module) => {

module.exports = require("mongodb");

/***/ }),

/***/ 1185:
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ 4434:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ graphql)
});

;// CONCATENATED MODULE: external "graphql-tag"
const external_graphql_tag_namespaceObject = require("graphql-tag");
// EXTERNAL MODULE: ./src/lib/mongodb.ts
var mongodb = __webpack_require__(8377);
// EXTERNAL MODULE: ./src/lib/models/gear-models.ts
var gear_models = __webpack_require__(6338);
// EXTERNAL MODULE: ./src/lib/matching/product-matcher.ts
var product_matcher = __webpack_require__(2755);
// EXTERNAL MODULE: ./src/lib/matching/recommendation-engine.ts
var recommendation_engine = __webpack_require__(8788);
// EXTERNAL MODULE: ./src/lib/matching/feedback-manager.ts
var feedback_manager = __webpack_require__(4985);
;// CONCATENATED MODULE: external "apollo-server-micro"
const external_apollo_server_micro_namespaceObject = require("apollo-server-micro");
;// CONCATENATED MODULE: external "apollo-server-core"
const external_apollo_server_core_namespaceObject = require("apollo-server-core");
;// CONCATENATED MODULE: ./src/pages/api/graphql.ts
 // Changed from @apollo/server







// Initialize services
const productMatcher = new product_matcher/* ProductMatcher */.o();
const recommendationEngine = new recommendation_engine/* RecommendationEngine */.$();
const feedbackManager = new feedback_manager/* FeedbackManager */.B();
// Define GraphQL schema
const typeDefs = external_graphql_tag_namespaceObject.gql`
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
    protectionLevels: [String]
    waterproof: Boolean
    shockproof: Boolean
    dustproof: Boolean
    colors: [String]
    materials: [String]
    minPrice: Float
    maxPrice: Float
    minRating: Float
    inStock: Boolean
    sortBy: String
    sortDirection: String
  }

  # Match filter input
  input MatchFilterInput {
    gearId: ID
    caseId: ID
    minCompatibilityScore: Float
    protectionLevels: [String]
    sortBy: String
    sortDirection: String
  }

  # Gear search result
  type GearSearchResult {
    items: [AudioGear]!
    pagination: PaginationInfo!
  }

  # Case search result
  type CaseSearchResult {
    items: [Case]!
    pagination: PaginationInfo!
  }

  # Match search result
  type MatchSearchResult {
    items: [GearCaseMatch]!
    pagination: PaginationInfo!
  }

  # User feedback result
  type UserFeedbackResult {
    items: [UserFeedback]!
    pagination: PaginationInfo!
  }

  # Content search result
  type ContentSearchResult {
    items: [Content]!
    pagination: PaginationInfo!
  }

  # Category result
  type CategoryResult {
    items: [CategoryItem]!
  }

  # Category item
  type CategoryItem {
    category: String!
  }

  # Brand result
  type BrandResult {
    items: [BrandItem]!
  }

  # Brand item
  type BrandItem {
    brand: String!
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
    caseTypes: [String]
    caseBrands: [String]
    caseColors: [String]
    caseMaterials: [String]

    # Match queries
    match(id: ID!): GearCaseMatch
    matchesForGear(gearId: ID!, pagination: PaginationInput): MatchSearchResult
    matchesForCase(caseId: ID!, pagination: PaginationInput): MatchSearchResult
    filterMatches(filter: MatchFilterInput!, pagination: PaginationInput): MatchSearchResult
    recommendMatches(gearId: ID!, pagination: PaginationInput): MatchSearchResult

    # User queries
    user(id: ID!): User
    userByEmail(email: String!): User

    # Feedback queries
    feedbackForMatch(gearId: ID!, caseId: ID!, pagination: PaginationInput): UserFeedbackResult

    # Content queries
    content(id: ID!): Content
    contentBySlug(slug: String!): Content
    allContent(pagination: PaginationInput): ContentSearchResult
    contentByCategory(category: String!, pagination: PaginationInput): ContentSearchResult

    # Analytics queries
    siteAnalytics(period: String!): Analytics
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
    generateMatches(gearId: ID): Int

    # User mutations
    createUser(input: UserInput!): User
    updateUser(id: ID!, input: UserInput!): User
    deleteUser(id: ID!): Boolean
    saveGear(userId: ID!, gearId: ID!): User
    saveCase(userId: ID!, caseId: ID!): User
    saveMatch(userId: ID!, matchId: ID!): User
    removeGear(userId: ID!, gearId: ID!): User
    removeCase(userId: ID!, caseId: ID!): User
    removeMatch(userId: ID!, matchId: ID!): User

    # Feedback mutations
    createFeedback(input: FeedbackInput!): UserFeedback
    updateFeedback(id: ID!, input: FeedbackInput!): UserFeedback
    deleteFeedback(id: ID!): Boolean

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
    trackAffiliateClick(id: ID!): Boolean
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

  # Dimensions input
  input DimensionsInput {
    length: Float!
    width: Float!
    height: Float!
    unit: String!
  }

  # Weight input
  input WeightInput {
    value: Float!
    unit: String!
  }

  # Seller input
  input SellerInput {
    name: String!
    url: String
    rating: Float
  }

  # Match input
  input MatchInput {
    compatibilityScore: Float
    dimensionFit: DimensionFitInput
    priceCategory: String
    protectionLevel: String
    features: [String]
  }

  # Dimension fit input
  input DimensionFitInput {
    length: Float!
    width: Float!
    height: Float!
    overall: Float!
  }

  # User input
  input UserInput {
    name: String
    email: String!
  }

  # Feedback input
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

  # Content input
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

  # Affiliate link input
  input AffiliateLinkInput {
    productId: ID!
    productType: String!
    provider: String!
    url: String!
    commission: Float
    active: Boolean
  }
`;
// Define resolvers
const resolvers = {
    Query: {
        // Gear queries
        gear: async (_, { id })=>{
            try {
                await mongodb/* clientPromise */.xd;
                return await gear_models/* AudioGear */.a1.findById(id);
            } catch (error) {
                console.error("Error fetching gear:", error);
                throw new Error("Failed to fetch gear");
            }
        },
        gearCategories: async ()=>{
            try {
                await mongodb/* clientPromise */.xd;
                const categories = await gear_models/* AudioGear */.a1.distinct("category");
                return {
                    items: categories.filter(Boolean).map((category)=>({
                            category
                        }))
                };
            } catch (error) {
                console.error("Error fetching gear categories:", error);
                return {
                    items: []
                }; // Return empty array instead of throwing error
            }
        },
        gearBrands: async ()=>{
            try {
                await mongodb/* clientPromise */.xd;
                const brands = await gear_models/* AudioGear */.a1.distinct("brand");
                return {
                    items: brands.filter(Boolean).map((brand)=>({
                            brand
                        }))
                };
            } catch (error) {
                console.error("Error fetching gear brands:", error);
                return {
                    items: []
                }; // Return empty array instead of throwing error
            }
        },
        allGear: async (_, { pagination = {
            page: 1,
            limit: 10
        } })=>{
            try {
                await mongodb/* clientPromise */.xd;
                const { page, limit } = pagination;
                const skip = (page - 1) * limit;
                // Set a timeout for the database operation
                const timeoutPromise = new Promise((_, reject)=>{
                    setTimeout(()=>reject(new Error("Database operation timeout")), 10000);
                });
                // Database operation with timeout
                const dbOperation = async ()=>{
                    try {
                        // Use aggregation to get items and count in a single query
                        const result = await gear_models/* AudioGear */.a1.aggregate([
                            {
                                $facet: {
                                    items: [
                                        {
                                            $sort: {
                                                name: 1
                                            }
                                        },
                                        {
                                            $skip: skip
                                        },
                                        {
                                            $limit: limit
                                        }
                                    ],
                                    totalCount: [
                                        {
                                            $count: "count"
                                        }
                                    ]
                                }
                            }
                        ]).exec();
                        const items = result[0].items;
                        const total = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
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
                        console.error("Database error in allGear:", dbError);
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
                };
                // Race between database operation and timeout
                return Promise.race([
                    dbOperation(),
                    timeoutPromise
                ]);
            } catch (error) {
                console.error("Error fetching all gear:", error);
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
        searchGear: async (_, { query, pagination = {
            page: 1,
            limit: 10
        } })=>{
            try {
                await mongodb/* clientPromise */.xd;
                const { page, limit } = pagination;
                const skip = (page - 1) * limit;
                // Set a timeout for the database operation
                const timeoutPromise = new Promise((_, reject)=>{
                    setTimeout(()=>reject(new Error("Database operation timeout")), 10000);
                });
                // Database operation with timeout
                const dbOperation = async ()=>{
                    try {
                        const searchRegex = new RegExp(query, "i");
                        const searchQuery = {
                            $or: [
                                {
                                    name: searchRegex
                                },
                                {
                                    brand: searchRegex
                                },
                                {
                                    category: searchRegex
                                },
                                {
                                    type: searchRegex
                                },
                                {
                                    description: searchRegex
                                }
                            ]
                        };
                        // Use aggregation to get items and count in a single query
                        const result = await gear_models/* AudioGear */.a1.aggregate([
                            {
                                $match: searchQuery
                            },
                            {
                                $facet: {
                                    items: [
                                        {
                                            $sort: {
                                                name: 1
                                            }
                                        },
                                        {
                                            $skip: skip
                                        },
                                        {
                                            $limit: limit
                                        }
                                    ],
                                    totalCount: [
                                        {
                                            $count: "count"
                                        }
                                    ]
                                }
                            }
                        ]).exec();
                        const items = result[0].items;
                        const total = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
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
                        console.error("Database error in searchGear:", dbError);
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
                };
                // Race between database operation and timeout
                return Promise.race([
                    dbOperation(),
                    timeoutPromise
                ]);
            } catch (error) {
                console.error("Error searching gear:", error);
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
        filterGear: async (_, { filter, pagination = {
            page: 1,
            limit: 10
        } })=>{
            try {
                await mongodb/* clientPromise */.xd;
                const { page, limit } = pagination;
                const skip = (page - 1) * limit;
                // Set a timeout for the database operation
                const timeoutPromise = new Promise((_, reject)=>{
                    setTimeout(()=>reject(new Error("Database operation timeout")), 10000);
                });
                // Database operation with timeout
                const dbOperation = async ()=>{
                    try {
                        // Build filter query
                        const query = {};
                        if (filter.brands && filter.brands.length > 0) {
                            query.brand = {
                                $in: filter.brands
                            };
                        }
                        if (filter.categories && filter.categories.length > 0) {
                            query.category = {
                                $in: filter.categories
                            };
                        }
                        if (filter.types && filter.types.length > 0) {
                            query.type = {
                                $in: filter.types
                            };
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
                            query.rating = {
                                $gte: filter.minRating
                            };
                        }
                        // Create sort object with explicit 1/-1 values
                        const sortField = filter.sortBy || "name";
                        const sortDirection = filter.sortDirection === "desc" ? -1 : 1;
                        const sortObj = {};
                        sortObj[sortField] = sortDirection;
                        // Use aggregation to get items and count in a single query
                        const result = await gear_models/* AudioGear */.a1.aggregate([
                            {
                                $match: query
                            },
                            {
                                $facet: {
                                    items: [
                                        {
                                            $sort: sortObj
                                        },
                                        {
                                            $skip: skip
                                        },
                                        {
                                            $limit: limit
                                        }
                                    ],
                                    totalCount: [
                                        {
                                            $count: "count"
                                        }
                                    ]
                                }
                            }
                        ]).exec();
                        const items = result[0].items;
                        const total = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
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
                        console.error("Database error in filterGear:", dbError);
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
                };
                // Race between database operation and timeout
                return Promise.race([
                    dbOperation(),
                    timeoutPromise
                ]);
            } catch (error) {
                console.error("Error filtering gear:", error);
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
        case: async (_, { id })=>{
            try {
                await mongodb/* clientPromise */.xd;
                return await gear_models/* Case */.JZ.findById(id);
            } catch (error) {
                console.error("Error fetching case:", error);
                throw new Error("Failed to fetch case");
            }
        },
        allCases: async (_, { pagination = {
            page: 1,
            limit: 10
        } })=>{
            try {
                await mongodb/* clientPromise */.xd;
                const { page, limit } = pagination;
                const skip = (page - 1) * limit;
                // Set a timeout for the database operation
                const timeoutPromise = new Promise((_, reject)=>{
                    setTimeout(()=>reject(new Error("Database operation timeout")), 10000);
                });
                // Database operation with timeout
                const dbOperation = async ()=>{
                    try {
                        // Use aggregation to get items and count in a single query
                        const result = await gear_models/* Case */.JZ.aggregate([
                            {
                                $facet: {
                                    items: [
                                        {
                                            $sort: {
                                                name: 1
                                            }
                                        },
                                        {
                                            $skip: skip
                                        },
                                        {
                                            $limit: limit
                                        }
                                    ],
                                    totalCount: [
                                        {
                                            $count: "count"
                                        }
                                    ]
                                }
                            }
                        ]).exec();
                        const items = result[0].items;
                        const total = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
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
                        console.error("Database error in allCases:", dbError);
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
                };
                // Race between database operation and timeout
                return Promise.race([
                    dbOperation(),
                    timeoutPromise
                ]);
            } catch (error) {
                console.error("Error fetching all cases:", error);
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
        searchCases: async (_, { query, pagination = {
            page: 1,
            limit: 10
        } })=>{
            try {
                await mongodb/* clientPromise */.xd;
                const { page, limit } = pagination;
                const skip = (page - 1) * limit;
                // Set a timeout for the database operation
                const timeoutPromise = new Promise((_, reject)=>{
                    setTimeout(()=>reject(new Error("Database operation timeout")), 10000);
                });
                // Database operation with timeout
                const dbOperation = async ()=>{
                    try {
                        const searchRegex = new RegExp(query, "i");
                        const searchQuery = {
                            $or: [
                                {
                                    name: searchRegex
                                },
                                {
                                    brand: searchRegex
                                },
                                {
                                    type: searchRegex
                                },
                                {
                                    description: searchRegex
                                }
                            ]
                        };
                        // Use aggregation to get items and count in a single query
                        const result = await gear_models/* Case */.JZ.aggregate([
                            {
                                $match: searchQuery
                            },
                            {
                                $facet: {
                                    items: [
                                        {
                                            $sort: {
                                                name: 1
                                            }
                                        },
                                        {
                                            $skip: skip
                                        },
                                        {
                                            $limit: limit
                                        }
                                    ],
                                    totalCount: [
                                        {
                                            $count: "count"
                                        }
                                    ]
                                }
                            }
                        ]).exec();
                        const items = result[0].items;
                        const total = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
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
                        console.error("Database error in searchCases:", dbError);
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
                };
                // Race between database operation and timeout
                return Promise.race([
                    dbOperation(),
                    timeoutPromise
                ]);
            } catch (error) {
                console.error("Error searching cases:", error);
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
        filterCases: async (_, { filter, pagination = {
            page: 1,
            limit: 10
        } })=>{
            try {
                await mongodb/* clientPromise */.xd;
                const { page, limit } = pagination;
                const skip = (page - 1) * limit;
                // Set a timeout for the database operation
                const timeoutPromise = new Promise((_, reject)=>{
                    setTimeout(()=>reject(new Error("Database operation timeout")), 10000);
                });
                // Database operation with timeout
                const dbOperation = async ()=>{
                    try {
                        // Build filter query
                        const query = {};
                        if (filter.brands && filter.brands.length > 0) {
                            query.brand = {
                                $in: filter.brands
                            };
                        }
                        if (filter.types && filter.types.length > 0) {
                            query.type = {
                                $in: filter.types
                            };
                        }
                        if (filter.protectionLevels && filter.protectionLevels.length > 0) {
                            query.protectionLevel = {
                                $in: filter.protectionLevels
                            };
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
                            query.color = {
                                $in: filter.colors
                            };
                        }
                        if (filter.materials && filter.materials.length > 0) {
                            query.material = {
                                $in: filter.materials
                            };
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
                            query.rating = {
                                $gte: filter.minRating
                            };
                        }
                        // Create sort object with explicit 1/-1 values
                        const sortField = filter.sortBy || "name";
                        const sortDirection = filter.sortDirection === "desc" ? -1 : 1;
                        const sortObj = {};
                        sortObj[sortField] = sortDirection;
                        // Use aggregation to get items and count in a single query
                        const result = await gear_models/* Case */.JZ.aggregate([
                            {
                                $match: query
                            },
                            {
                                $facet: {
                                    items: [
                                        {
                                            $sort: sortObj
                                        },
                                        {
                                            $skip: skip
                                        },
                                        {
                                            $limit: limit
                                        }
                                    ],
                                    totalCount: [
                                        {
                                            $count: "count"
                                        }
                                    ]
                                }
                            }
                        ]).exec();
                        const items = result[0].items;
                        const total = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
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
                        console.error("Database error in filterCases:", dbError);
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
                };
                // Race between database operation and timeout
                return Promise.race([
                    dbOperation(),
                    timeoutPromise
                ]);
            } catch (error) {
                console.error("Error filtering cases:", error);
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
        }
    }
};
// Create Apollo Server
const apolloServer = new external_apollo_server_micro_namespaceObject.ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
        (0,external_apollo_server_core_namespaceObject.ApolloServerPluginLandingPageGraphQLPlayground)()
    ],
    introspection: true
});
// Initialize database indexes when server starts
(async ()=>{
    try {
        await mongodb/* clientPromise */.xd;
        // Create indexes on frequently queried fields
        await gear_models/* AudioGear */.a1.collection.createIndex({
            brand: 1
        });
        await gear_models/* AudioGear */.a1.collection.createIndex({
            category: 1
        });
        await gear_models/* AudioGear */.a1.collection.createIndex({
            type: 1
        });
        await gear_models/* AudioGear */.a1.collection.createIndex({
            price: 1
        });
        await gear_models/* AudioGear */.a1.collection.createIndex({
            rating: 1
        });
        await gear_models/* AudioGear */.a1.collection.createIndex({
            name: "text",
            description: "text"
        });
        // Compound indexes for common filter combinations
        await gear_models/* AudioGear */.a1.collection.createIndex({
            brand: 1,
            category: 1
        });
        await gear_models/* AudioGear */.a1.collection.createIndex({
            category: 1,
            type: 1
        });
        // Case indexes
        await gear_models/* Case */.JZ.collection.createIndex({
            brand: 1
        });
        await gear_models/* Case */.JZ.collection.createIndex({
            type: 1
        });
        await gear_models/* Case */.JZ.collection.createIndex({
            protectionLevel: 1
        });
        await gear_models/* Case */.JZ.collection.createIndex({
            price: 1
        });
        await gear_models/* Case */.JZ.collection.createIndex({
            rating: 1
        });
        await gear_models/* Case */.JZ.collection.createIndex({
            name: "text",
            description: "text"
        });
        // Compound indexes for common filter combinations
        await gear_models/* Case */.JZ.collection.createIndex({
            brand: 1,
            type: 1
        });
        await gear_models/* Case */.JZ.collection.createIndex({
            waterproof: 1,
            shockproof: 1,
            dustproof: 1
        });
        console.log("Database indexes created successfully");
    } catch (error) {
        console.error("Error initializing database indexes:", error);
    }
})();
// Create handler function
const handler = (req, res)=>{
    // Use micro handler from apollo-server-micro
    return apolloServer.createHandler({
        path: "/api/graphql"
    })(req, res);
};
// Export the handler
/* harmony default export */ const graphql = (handler);


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [338,377,788,985], () => (__webpack_exec__(4434)));
module.exports = __webpack_exports__;

})();