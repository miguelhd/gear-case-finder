"use strict";
(() => {
var exports = {};
exports.id = 702;
exports.ids = [702];
exports.modules = {

/***/ 7343:
/***/ ((module) => {

module.exports = require("graphql");

/***/ }),

/***/ 8013:
/***/ ((module) => {

module.exports = require("mongodb");

/***/ }),

/***/ 1185:
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ 6550:
/***/ ((module) => {

module.exports = import("@graphql-tools/schema");;

/***/ }),

/***/ 7147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 1017:
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ 5906:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   s: () => (/* binding */ resolvers)
/* harmony export */ });
/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1185);
/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6338);
/* harmony import */ var _lib_mongodb__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8377);
// Enhanced GraphQL resolvers with improved MongoDB connection handling



// Helper function to map MongoDB _id to GraphQL id
const mapIdField = (doc)=>{
    if (!doc) return null;
    return {
        ...doc,
        id: doc._id.toString()
    };
};
// Define GraphQL resolvers
const resolvers = {
    Query: {
        // Simple query to check if the API is working
        apiStatus: async ()=>{
            console.log("API status check - MongoDB connection state:", (mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection).readyState);
            try {
                await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .connectToMongoDB */ .No)();
                return "API is operational and database is connected";
            } catch (error) {
                console.error("API status check - Database connection error:", error);
                return "API is operational but database connection failed";
            }
        },
        // Get all gear with pagination
        allGear: async (_, { pagination = {
            page: 1,
            limit: 10
        } })=>{
            try {
                console.log("Executing allGear query with pagination:", pagination);
                // Ensure MongoDB is connected with enhanced connection handling
                await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .connectToMongoDB */ .No)();
                // Check if collection exists using the safe method
                const exists = await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .collectionExists */ .hv)(_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.collection.name);
                if (!exists) {
                    console.error(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.collection.name} collection does not exist in the database`);
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
                const count = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.countDocuments();
                console.log(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.collection.name} collection has ${count} documents`);
                if (count === 0) {
                    console.warn(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.collection.name} collection is empty`);
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
                const { page = 1, limit = 10 } = pagination;
                const skip = (page - 1) * limit;
                // Use find instead of aggregate for simpler debugging
                const items = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.find().skip(skip).limit(limit).lean().then((docs)=>docs.map(mapIdField));
                console.log(`Retrieved ${items.length} gear items`);
                return {
                    items,
                    pagination: {
                        total: count,
                        page,
                        limit,
                        pages: Math.ceil(count / limit)
                    }
                };
            } catch (error) {
                console.error("Error in allGear resolver:", error);
                throw new Error(`Failed to fetch gear items: ${error instanceof Error ? error.message : String(error)}`);
            }
        },
        // Get gear by ID
        gear: async (_, { id })=>{
            try {
                console.log(`Executing gear query for ID: ${id}`);
                // Ensure MongoDB is connected with enhanced connection handling
                await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .connectToMongoDB */ .No)();
                const item = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.findById(id).lean().then(mapIdField);
                console.log("Retrieved gear item:", item ? "Found" : "Not found");
                return item;
            } catch (error) {
                console.error(`Error in gear resolver for ID ${id}:`, error);
                throw new Error(`Failed to fetch gear with ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
            }
        },
        // Filter gear with pagination
        filterGear: async (_, { filter, pagination = {
            page: 1,
            limit: 10
        } })=>{
            try {
                console.log("Executing filterGear query with filter:", filter, "and pagination:", pagination);
                // Ensure MongoDB is connected with enhanced connection handling
                await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .connectToMongoDB */ .No)();
                // Check if collection exists using the safe method
                const exists = await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .collectionExists */ .hv)(_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.collection.name);
                if (!exists) {
                    console.error(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.collection.name} collection does not exist in the database`);
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
                const count = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.countDocuments();
                console.log(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.collection.name} collection has ${count} documents`);
                if (count === 0) {
                    console.warn(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.collection.name} collection is empty`);
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
                const { page = 1, limit = 10 } = pagination;
                const skip = (page - 1) * limit;
                // Build query based on filter
                const query = {};
                if (filter.search) {
                    query.$or = [
                        {
                            name: {
                                $regex: filter.search,
                                $options: "i"
                            }
                        },
                        {
                            brand: {
                                $regex: filter.search,
                                $options: "i"
                            }
                        },
                        {
                            description: {
                                $regex: filter.search,
                                $options: "i"
                            }
                        }
                    ];
                }
                if (filter.categories && filter.categories.length > 0) {
                    query.category = {
                        $in: filter.categories
                    };
                }
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
                if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
                    query.price = {};
                    if (filter.minPrice !== undefined) {
                        query.price.$gte = filter.minPrice;
                    }
                    if (filter.maxPrice !== undefined) {
                        query.price.$lte = filter.maxPrice;
                    }
                }
                if (filter.minRating !== undefined) {
                    query.rating = {
                        $gte: filter.minRating
                    };
                }
                if (filter.inStock !== undefined) {
                    query.inStock = filter.inStock;
                }
                // Determine sort order
                let sortField = "name";
                let sortOrder = 1;
                if (filter.sortBy) {
                    sortField = filter.sortBy;
                    sortOrder = filter.sortDirection === "desc" ? -1 : 1;
                }
                const sortOptions = {};
                sortOptions[sortField] = sortOrder;
                console.log("Executing query with filter:", query);
                // Use find instead of aggregate for simpler debugging
                const queryCount = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.countDocuments(query);
                console.log(`Query matched ${queryCount} documents`);
                const items = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.find(query).sort(sortOptions).skip(skip).limit(limit).lean().then((docs)=>docs.map(mapIdField));
                console.log(`Retrieved ${items.length} filtered gear items`);
                return {
                    items,
                    pagination: {
                        total: queryCount,
                        page,
                        limit,
                        pages: Math.ceil(queryCount / limit)
                    }
                };
            } catch (error) {
                console.error("Error in filterGear resolver:", error);
                throw new Error(`Failed to filter gear items: ${error instanceof Error ? error.message : String(error)}`);
            }
        },
        // Get all cases with pagination
        allCases: async (_, { pagination = {
            page: 1,
            limit: 10
        } })=>{
            try {
                console.log("Executing allCases query with pagination:", pagination);
                // Ensure MongoDB is connected with enhanced connection handling
                await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .connectToMongoDB */ .No)();
                // Check if collection exists using the safe method
                const exists = await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .collectionExists */ .hv)(_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.collection.name);
                if (!exists) {
                    console.error(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.collection.name} collection does not exist in the database`);
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
                const count = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.countDocuments();
                console.log(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.collection.name} collection has ${count} documents`);
                if (count === 0) {
                    console.warn(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.collection.name} collection is empty`);
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
                const { page = 1, limit = 10 } = pagination;
                const skip = (page - 1) * limit;
                // Use find instead of aggregate for simpler debugging
                const items = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.find().skip(skip).limit(limit).lean().then((docs)=>docs.map(mapIdField));
                console.log(`Retrieved ${items.length} case items`);
                return {
                    items,
                    pagination: {
                        total: count,
                        page,
                        limit,
                        pages: Math.ceil(count / limit)
                    }
                };
            } catch (error) {
                console.error("Error in allCases resolver:", error);
                throw new Error(`Failed to fetch case items: ${error instanceof Error ? error.message : String(error)}`);
            }
        },
        // Get case by ID
        case: async (_, { id })=>{
            try {
                console.log(`Executing case query for ID: ${id}`);
                // Ensure MongoDB is connected with enhanced connection handling
                await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .connectToMongoDB */ .No)();
                const item = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.findById(id).lean().then(mapIdField);
                console.log("Retrieved case item:", item ? "Found" : "Not found");
                return item;
            } catch (error) {
                console.error(`Error in case resolver for ID ${id}:`, error);
                throw new Error(`Failed to fetch case with ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
            }
        },
        // Filter cases with pagination
        filterCases: async (_, { filter, pagination = {
            page: 1,
            limit: 10
        } })=>{
            try {
                console.log("Executing filterCases query with filter:", filter, "and pagination:", pagination);
                // Ensure MongoDB is connected with enhanced connection handling
                await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .connectToMongoDB */ .No)();
                // Check if collection exists using the safe method
                const exists = await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .collectionExists */ .hv)(_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.collection.name);
                if (!exists) {
                    console.error(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.collection.name} collection does not exist in the database`);
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
                const count = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.countDocuments();
                console.log(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.collection.name} collection has ${count} documents`);
                if (count === 0) {
                    console.warn(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.collection.name} collection is empty`);
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
                const { page = 1, limit = 10 } = pagination;
                const skip = (page - 1) * limit;
                // Build query based on filter
                const query = {};
                if (filter.search) {
                    query.$or = [
                        {
                            name: {
                                $regex: filter.search,
                                $options: "i"
                            }
                        },
                        {
                            brand: {
                                $regex: filter.search,
                                $options: "i"
                            }
                        },
                        {
                            description: {
                                $regex: filter.search,
                                $options: "i"
                            }
                        }
                    ];
                }
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
                if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
                    query.price = {};
                    if (filter.minPrice !== undefined) {
                        query.price.$gte = filter.minPrice;
                    }
                    if (filter.maxPrice !== undefined) {
                        query.price.$lte = filter.maxPrice;
                    }
                }
                if (filter.minRating !== undefined) {
                    query.rating = {
                        $gte: filter.minRating
                    };
                }
                if (filter.inStock !== undefined) {
                    query.inStock = filter.inStock;
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
                // Determine sort order
                let sortField = "name";
                let sortOrder = 1;
                if (filter.sortBy) {
                    sortField = filter.sortBy;
                    sortOrder = filter.sortDirection === "desc" ? -1 : 1;
                }
                const sortOptions = {};
                sortOptions[sortField] = sortOrder;
                console.log("Executing query with filter:", query);
                // Use find instead of aggregate for simpler debugging
                const queryCount = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.countDocuments(query);
                console.log(`Query matched ${queryCount} documents`);
                const items = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.find(query).sort(sortOptions).skip(skip).limit(limit).lean().then((docs)=>docs.map(mapIdField));
                console.log(`Retrieved ${items.length} filtered case items`);
                return {
                    items,
                    pagination: {
                        total: queryCount,
                        page,
                        limit,
                        pages: Math.ceil(queryCount / limit)
                    }
                };
            } catch (error) {
                console.error("Error in filterCases resolver:", error);
                throw new Error(`Failed to filter case items: ${error instanceof Error ? error.message : String(error)}`);
            }
        },
        // Get matches between gear and cases
        matches: async (_, { filter, pagination = {
            page: 1,
            limit: 10
        } })=>{
            try {
                console.log("Executing matches query with filter:", filter, "and pagination:", pagination);
                // Ensure MongoDB is connected with enhanced connection handling
                await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .connectToMongoDB */ .No)();
                // Check if collection exists using the safe method
                const exists = await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .collectionExists */ .hv)(_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.collection.name);
                if (!exists) {
                    console.error(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.collection.name} collection does not exist in the database`);
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
                const { page = 1, limit = 10 } = pagination;
                const skip = (page - 1) * limit;
                // Build query based on filter
                const query = {};
                if (filter.gearId) {
                    query.gearId = filter.gearId;
                }
                if (filter.caseId) {
                    query.caseId = filter.caseId;
                }
                if (filter.minScore !== undefined) {
                    query.compatibilityScore = {
                        $gte: filter.minScore
                    };
                }
                // Determine sort order
                let sortField = "compatibilityScore";
                let sortOrder = -1; // Default to highest score first
                if (filter.sortBy) {
                    sortField = filter.sortBy;
                    sortOrder = filter.sortDirection === "desc" ? -1 : 1;
                }
                const sortOptions = {};
                sortOptions[sortField] = sortOrder;
                // Use find instead of aggregate for simpler debugging
                const queryCount = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.countDocuments(query);
                console.log(`Query matched ${queryCount} match documents`);
                // Explicitly type the result as IGearCaseMatchDocument[]
                const items = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.find(query).sort(sortOptions).skip(skip).limit(limit).lean().then((docs)=>docs.map(mapIdField));
                console.log(`Retrieved ${items.length} match items`);
                // Populate gear and case data
                const populatedItems = await Promise.all(items.map(async (match)=>{
                    try {
                        const gear = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.findById(match.gearId).lean().then(mapIdField);
                        const caseItem = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.findById(match.caseId).lean().then(mapIdField);
                        return {
                            ...match,
                            gear,
                            case: caseItem
                        };
                    } catch (err) {
                        console.error(`Error populating match data for match ID ${match._id}:`, err);
                        return match;
                    }
                }));
                return {
                    items: populatedItems,
                    pagination: {
                        total: queryCount,
                        page,
                        limit,
                        pages: Math.ceil(queryCount / limit)
                    }
                };
            } catch (error) {
                console.error("Error in matches resolver:", error);
                throw new Error(`Failed to fetch matches: ${error instanceof Error ? error.message : String(error)}`);
            }
        },
        // Get matches for specific gear
        matchesForGear: async (_, { gearId, pagination = {
            page: 1,
            limit: 10
        } })=>{
            try {
                console.log(`Executing matchesForGear query for gear ID: ${gearId} with pagination:`, pagination);
                // Ensure MongoDB is connected with enhanced connection handling
                await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .connectToMongoDB */ .No)();
                // Check if collection exists using the safe method
                const exists = await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .collectionExists */ .hv)(_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.collection.name);
                if (!exists) {
                    console.error(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.collection.name} collection does not exist in the database`);
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
                const { page = 1, limit = 10 } = pagination;
                const skip = (page - 1) * limit;
                // Query for matches with the specified gear ID
                const query = {
                    gearId
                };
                // Use countDocuments for accurate count
                const queryCount = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.countDocuments(query);
                console.log(`Query matched ${queryCount} match documents for gear ID ${gearId}`);
                // Sort by compatibility score (highest first)
                const items = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.find(query).sort({
                    compatibilityScore: -1
                }).skip(skip).limit(limit).lean().then((docs)=>docs.map(mapIdField));
                console.log(`Retrieved ${items.length} match items for gear ID ${gearId}`);
                // Populate gear and case data
                const populatedItems = await Promise.all(items.map(async (match)=>{
                    try {
                        const gear = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.findById(match.gearId).lean().then(mapIdField);
                        const caseItem = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.findById(match.caseId).lean().then(mapIdField);
                        return {
                            ...match,
                            gear,
                            case: caseItem
                        };
                    } catch (err) {
                        console.error(`Error populating match data for match ID ${match._id}:`, err);
                        return match;
                    }
                }));
                return {
                    items: populatedItems,
                    pagination: {
                        total: queryCount,
                        page,
                        limit,
                        pages: Math.ceil(queryCount / limit)
                    }
                };
            } catch (error) {
                console.error(`Error in matchesForGear resolver for gear ID ${gearId}:`, error);
                throw new Error(`Failed to fetch matches for gear ID ${gearId}: ${error instanceof Error ? error.message : String(error)}`);
            }
        },
        // Get matches for specific case
        matchesForCase: async (_, { caseId, pagination = {
            page: 1,
            limit: 10
        } })=>{
            try {
                console.log(`Executing matchesForCase query for case ID: ${caseId} with pagination:`, pagination);
                // Ensure MongoDB is connected with enhanced connection handling
                await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .connectToMongoDB */ .No)();
                // Check if collection exists using the safe method
                const exists = await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .collectionExists */ .hv)(_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.collection.name);
                if (!exists) {
                    console.error(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.collection.name} collection does not exist in the database`);
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
                const { page = 1, limit = 10 } = pagination;
                const skip = (page - 1) * limit;
                // Query for matches with the specified case ID
                const query = {
                    caseId
                };
                // Use countDocuments for accurate count
                const queryCount = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.countDocuments(query);
                console.log(`Query matched ${queryCount} match documents for case ID ${caseId}`);
                // Sort by compatibility score (highest first)
                const items = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.find(query).sort({
                    compatibilityScore: -1
                }).skip(skip).limit(limit).lean().then((docs)=>docs.map(mapIdField));
                console.log(`Retrieved ${items.length} match items for case ID ${caseId}`);
                // Populate gear and case data
                const populatedItems = await Promise.all(items.map(async (match)=>{
                    try {
                        const gear = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.findById(match.gearId).lean().then(mapIdField);
                        const caseItem = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.findById(match.caseId).lean().then(mapIdField);
                        return {
                            ...match,
                            gear,
                            case: caseItem
                        };
                    } catch (err) {
                        console.error(`Error populating match data for match ID ${match._id}:`, err);
                        return match;
                    }
                }));
                return {
                    items: populatedItems,
                    pagination: {
                        total: queryCount,
                        page,
                        limit,
                        pages: Math.ceil(queryCount / limit)
                    }
                };
            } catch (error) {
                console.error(`Error in matchesForCase resolver for case ID ${caseId}:`, error);
                throw new Error(`Failed to fetch matches for case ID ${caseId}: ${error instanceof Error ? error.message : String(error)}`);
            }
        },
        // Get a specific match
        match: async (_, { id })=>{
            try {
                console.log(`Executing match query for ID: ${id}`);
                // Ensure MongoDB is connected with enhanced connection handling
                await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .connectToMongoDB */ .No)();
                // Check if collection exists using the safe method
                const exists = await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_2__/* .collectionExists */ .hv)(_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.collection.name);
                if (!exists) {
                    console.error(`${_lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.collection.name} collection does not exist in the database`);
                    return null;
                }
                // Find the match by ID
                const match = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.findById(id).lean().then(mapIdField);
                if (!match) {
                    console.warn(`Match with ID ${id} not found`);
                    return null;
                }
                console.log(`Retrieved match with ID ${id}`);
                // Populate gear and case data
                try {
                    const gear = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .AudioGear */ .a1.findById(match.gearId).lean().then(mapIdField);
                    const caseItem = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .Case */ .JZ.findById(match.caseId).lean().then(mapIdField);
                    return {
                        ...match,
                        gear,
                        case: caseItem
                    };
                } catch (err) {
                    console.error(`Error populating match data for match ID ${id}:`, err);
                    return match;
                }
            } catch (error) {
                console.error(`Error in match resolver for ID ${id}:`, error);
                throw new Error(`Failed to fetch match with ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }
};


/***/ }),

/***/ 9895:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  U: () => (/* binding */ typeDefs)
});

;// CONCATENATED MODULE: external "graphql-tag"
const external_graphql_tag_namespaceObject = require("graphql-tag");
;// CONCATENATED MODULE: ./src/graphql/schema.ts

// Define GraphQL schema
const typeDefs = external_graphql_tag_namespaceObject.gql`
  # Types
  type AudioGear {
    id: ID!
    name: String!
    brand: String
    category: String
    type: String
    imageUrl: String
    popularity: Int
    inStock: Boolean
    releaseYear: Int
    dimensions: Dimensions
    description: String
    features: [String]
    price: Float
    rating: Float
    reviews: Int
  }

  type Case {
    id: ID!
    name: String!
    brand: String
    type: String
    imageUrl: String
    inStock: Boolean
    dimensions: Dimensions
    internalDimensions: Dimensions
    description: String
    features: [String]
    price: Float
    currency: String
    rating: Float
    reviews: Int
    reviewCount: Int
    protectionLevel: String
    compatibleWith: [String]
    waterproof: Boolean
    shockproof: Boolean
    dustproof: Boolean
    color: String
    material: String
    hasHandle: Boolean
    hasWheels: Boolean
    seller: Seller
  }

  type Seller {
    name: String
    url: String
    rating: Float
  }

  type GearCaseMatch {
    id: ID!
    gearId: ID!
    caseId: ID!
    gear: AudioGear
    case: Case
    compatibilityScore: Float!
    matchReason: String
    notes: String
  }

  type Dimensions {
    length: Float
    width: Float
    height: Float
    unit: String
  }

  # Pagination
  type PaginationInfo {
    total: Int!
    page: Int!
    limit: Int!
    pages: Int!
  }

  type AudioGearResult {
    items: [AudioGear!]!
    pagination: PaginationInfo!
  }

  type CaseResult {
    items: [Case!]!
    pagination: PaginationInfo!
  }

  type MatchResult {
    items: [GearCaseMatch!]!
    pagination: PaginationInfo!
  }

  # Input types
  input PaginationInput {
    page: Int
    limit: Int
  }

  input DimensionsInput {
    length: Float
    width: Float
    height: Float
    unit: String
  }

  input GearFilterInput {
    search: String
    categories: [String]
    brands: [String]
    types: [String]
    minPrice: Float
    maxPrice: Float
    minRating: Float
    inStock: Boolean
    sortBy: String
    sortDirection: String
  }

  input CaseFilterInput {
    search: String
    brands: [String]
    types: [String]
    protectionLevels: [String]
    minPrice: Float
    maxPrice: Float
    minRating: Float
    inStock: Boolean
    waterproof: Boolean
    shockproof: Boolean
    dustproof: Boolean
    sortBy: String
    sortDirection: String
  }

  input MatchFilterInput {
    gearId: ID
    caseId: ID
    minScore: Float
    sortBy: String
    sortDirection: String
  }

  # Queries
  type Query {
    # Get all gear with pagination and filtering
    allGear(pagination: PaginationInput): AudioGearResult!
    
    # Get gear by ID
    gear(id: ID!): AudioGear
    
    # Filter gear
    filterGear(filter: GearFilterInput!, pagination: PaginationInput): AudioGearResult!
    
    # Get all cases with pagination and filtering
    allCases(pagination: PaginationInput): CaseResult!
    
    # Get case by ID
    case(id: ID!): Case
    
    # Filter cases
    filterCases(filter: CaseFilterInput!, pagination: PaginationInput): CaseResult!
    
    # Get matches between gear and cases
    matches(filter: MatchFilterInput!, pagination: PaginationInput): MatchResult!
    
    # Get matches for specific gear
    matchesForGear(gearId: ID!, pagination: PaginationInput): MatchResult!
    
    # Get matches for specific case
    matchesForCase(caseId: ID!, pagination: PaginationInput): MatchResult!
    
    # Get a specific match
    match(id: ID!): GearCaseMatch
    
    # Query to check if the API is working
    apiStatus: String!
  }
`;


/***/ }),

/***/ 583:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1185);
/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _lib_mongodb__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8377);
/* harmony import */ var _graphql_schema__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9895);
/* harmony import */ var _graphql_resolvers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5906);
/* harmony import */ var _lib_monitoring__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(9241);
/* harmony import */ var graphql__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(7343);
/* harmony import */ var graphql__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(graphql__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _graphql_tools_schema__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(6550);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_graphql_tools_schema__WEBPACK_IMPORTED_MODULE_6__]);
_graphql_tools_schema__WEBPACK_IMPORTED_MODULE_6__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
// Update GraphQL API handler to use a direct approach without Apollo Server start()








// Create a request logger for debugging
const logRequest = (req)=>{
    const timestamp = new Date().toISOString();
    const requestId = Math.random().toString(36).substring(2, 15);
    console.log(`[${timestamp}] [${requestId}] === GraphQL Request ===`);
    console.log(`[${timestamp}] [${requestId}] Method: ${req.method}`);
    console.log(`[${timestamp}] [${requestId}] URL: ${req.url}`);
    console.log(`[${timestamp}] [${requestId}] Headers:`, JSON.stringify(req.headers, null, 2));
    if (req.body) {
        try {
            console.log(`[${timestamp}] [${requestId}] Body:`, JSON.stringify(req.body, null, 2));
        } catch (e) {
            console.log(`[${timestamp}] [${requestId}] Body: [Unable to stringify body]`);
        }
    }
    return {
        timestamp,
        requestId
    };
};
// Create an executable schema once
const executableSchema = (0,_graphql_tools_schema__WEBPACK_IMPORTED_MODULE_6__.makeExecutableSchema)({
    typeDefs: _graphql_schema__WEBPACK_IMPORTED_MODULE_2__/* .typeDefs */ .U,
    resolvers: _graphql_resolvers__WEBPACK_IMPORTED_MODULE_3__/* .resolvers */ .s
});
// Create handler with enhanced logging and CORS support
const baseHandler = async (req, res)=>{
    // Log request details for debugging
    const { timestamp, requestId } = logRequest(req);
    // Handle CORS preflight requests explicitly
    if (req.method === "OPTIONS") {
        console.log(`[${timestamp}] [${requestId}] Handling OPTIONS request (CORS preflight)`);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
        res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, apollo-require-preflight, Apollo-Require-Preflight");
        res.status(204).end();
        console.log(`[${timestamp}] [${requestId}] OPTIONS request completed with 204 status`);
        return;
    }
    // Set CORS headers for all responses
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, apollo-require-preflight, Apollo-Require-Preflight");
    // Only allow POST requests for GraphQL operations
    if (req.method !== "POST") {
        console.error(`[${timestamp}] [${requestId}] Method ${req.method} not allowed for GraphQL endpoint`);
        res.status(405).json({
            errors: [
                {
                    message: `Method ${req.method} not allowed for GraphQL endpoint`,
                    extensions: {
                        code: "METHOD_NOT_ALLOWED"
                    }
                }
            ]
        });
        return;
    }
    try {
        // Connect to database if needed - with enhanced error handling
        try {
            if (!(mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection).readyState) {
                console.log(`[${timestamp}] [${requestId}] Connecting to database...`);
                await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .ZP)();
                console.log(`[${timestamp}] [${requestId}] Database connection established`);
            }
        } catch (dbError) {
            // Log the error but continue processing the request
            console.error(`[${timestamp}] [${requestId}] Database connection error:`, dbError);
            console.log(`[${timestamp}] [${requestId}] Continuing without database connection`);
        // We don't throw here, allowing the GraphQL API to function even without DB
        }
        // Process the GraphQL request directly without using Apollo Server's start()
        console.log(`[${timestamp}] [${requestId}] Processing GraphQL request directly...`);
        // Extract the GraphQL query from the request body
        const { query, variables, operationName } = req.body;
        if (!query) {
            throw new Error("No GraphQL query provided");
        }
        // Parse the query
        const document = (0,graphql__WEBPACK_IMPORTED_MODULE_5__.parse)(query);
        // Validate the query against the schema
        const validationErrors = (0,graphql__WEBPACK_IMPORTED_MODULE_5__.validate)(executableSchema, document, graphql__WEBPACK_IMPORTED_MODULE_5__.specifiedRules);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                errors: validationErrors
            });
        }
        // Execute the query
        const result = await (0,graphql__WEBPACK_IMPORTED_MODULE_5__.execute)({
            schema: executableSchema,
            document,
            variableValues: variables,
            operationName,
            contextValue: {
                requestId,
                timestamp
            }
        });
        // Log the operation
        console.log(`[${timestamp}] [${requestId}] GraphQL operation: ${operationName || "anonymous"}`);
        // Return the result
        const responseTime = Date.now() - new Date(timestamp).getTime();
        console.log(`[${timestamp}] [${requestId}] Response sent in ${responseTime}ms`);
        // Set cache control header
        res.setHeader("Cache-Control", "no-store");
        // Send the response
        return res.status(200).json(result);
    } catch (error) {
        console.error(`[${timestamp}] [${requestId}] Error handling request:`, error);
        // Format the error response
        const formattedError = error instanceof graphql__WEBPACK_IMPORTED_MODULE_5__.GraphQLError ? error : new graphql__WEBPACK_IMPORTED_MODULE_5__.GraphQLError(error instanceof Error ? error.message : String(error), {
            extensions: {
                code: "INTERNAL_SERVER_ERROR",
                requestId,
                timestamp
            }
        });
        res.status(500).json({
            errors: [
                formattedError
            ]
        });
    }
};
// Wrap the handler with monitoring middleware
const handler = (0,_lib_monitoring__WEBPACK_IMPORTED_MODULE_4__/* .withMonitoring */ .sQ)(baseHandler);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (handler);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [338,377,241], () => (__webpack_exec__(583)));
module.exports = __webpack_exports__;

})();