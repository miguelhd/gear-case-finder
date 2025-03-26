"use strict";
(() => {
var exports = {};
exports.id = 189;
exports.ids = [189];
exports.modules = {

/***/ 1185:
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ 7259:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6338);

/**
 * API handler for case-related endpoints
 */ async function handler(req, res) {
    try {
        // Database connection is already established in the mongodb.ts file
        // No need to explicitly connect here
        // Route based on HTTP method
        switch(req.method){
            case "GET":
                return handleGetRequest(req, res);
            case "POST":
                return handlePostRequest(req, res);
            default:
                return res.status(405).json({
                    error: "Method not allowed"
                });
        }
    } catch (error) {
        console.error("API error:", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}
/**
 * Handle GET requests
 */ async function handleGetRequest(req, res) {
    const { action, id, query, type, brand, marketplace, minPrice, maxPrice, protectionLevel, limit = "20" } = req.query;
    switch(action){
        case "all":
            // Get all cases with optional filtering
            const filter = {};
            if (type) filter.type = type;
            if (brand) filter.brand = brand;
            if (marketplace) filter.marketplace = marketplace;
            if (protectionLevel) filter.protectionLevel = protectionLevel;
            // Handle price range
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) filter.price.$gte = parseFloat(minPrice);
                if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
            }
            const allCases = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .Case */ .JZ.find(filter).limit(parseInt(limit)).sort({
                rating: -1
            });
            return res.status(200).json(allCases);
        case "search":
            // Search for cases by name, brand, or type
            if (!query) {
                return res.status(400).json({
                    error: "Query parameter is required"
                });
            }
            const searchResults = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .Case */ .JZ.find({
                $or: [
                    {
                        name: {
                            $regex: query,
                            $options: "i"
                        }
                    },
                    {
                        brand: {
                            $regex: query,
                            $options: "i"
                        }
                    },
                    {
                        type: {
                            $regex: query,
                            $options: "i"
                        }
                    },
                    {
                        description: {
                            $regex: query,
                            $options: "i"
                        }
                    }
                ]
            }).limit(parseInt(limit));
            return res.status(200).json(searchResults);
        case "detail":
            // Get details for a specific case
            if (!id) {
                return res.status(400).json({
                    error: "ID parameter is required"
                });
            }
            const caseDetail = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .Case */ .JZ.findById(id);
            if (!caseDetail) {
                return res.status(404).json({
                    error: "Case not found"
                });
            }
            return res.status(200).json(caseDetail);
        case "types":
            // Get all unique case types
            const types = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .Case */ .JZ.distinct("type");
            return res.status(200).json(types);
        case "brands":
            // Get all unique case brands
            const brands = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .Case */ .JZ.distinct("brand");
            return res.status(200).json(brands);
        case "marketplaces":
            // Get all unique marketplaces
            const marketplaces = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .Case */ .JZ.distinct("marketplace");
            return res.status(200).json(marketplaces);
        case "popular":
            // Get popular cases
            const popularCases = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .Case */ .JZ.find().sort({
                rating: -1,
                reviewCount: -1
            }).limit(parseInt(limit));
            return res.status(200).json(popularCases);
        case "price-range":
            // Get min and max prices for cases
            const minMaxPrice = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .Case */ .JZ.aggregate([
                {
                    $group: {
                        _id: null,
                        minPrice: {
                            $min: "$price"
                        },
                        maxPrice: {
                            $max: "$price"
                        }
                    }
                }
            ]);
            if (minMaxPrice.length === 0) {
                return res.status(200).json({
                    minPrice: 0,
                    maxPrice: 0
                });
            }
            return res.status(200).json({
                minPrice: minMaxPrice[0].minPrice,
                maxPrice: minMaxPrice[0].maxPrice
            });
        default:
            return res.status(400).json({
                error: "Invalid action"
            });
    }
}
/**
 * Handle POST requests
 */ async function handlePostRequest(req, res) {
    const { action } = req.query;
    switch(action){
        case "filter":
            // Advanced filtering for cases
            const filterCriteria = req.body;
            try {
                const filter = {};
                // Apply filters from request body
                if (filterCriteria.types && filterCriteria.types.length > 0) {
                    filter.type = {
                        $in: filterCriteria.types
                    };
                }
                if (filterCriteria.brands && filterCriteria.brands.length > 0) {
                    filter.brand = {
                        $in: filterCriteria.brands
                    };
                }
                if (filterCriteria.marketplaces && filterCriteria.marketplaces.length > 0) {
                    filter.marketplace = {
                        $in: filterCriteria.marketplaces
                    };
                }
                if (filterCriteria.protectionLevels && filterCriteria.protectionLevels.length > 0) {
                    filter.protectionLevel = {
                        $in: filterCriteria.protectionLevels
                    };
                }
                if (filterCriteria.minPrice !== undefined || filterCriteria.maxPrice !== undefined) {
                    filter.price = {};
                    if (filterCriteria.minPrice !== undefined) {
                        filter.price.$gte = filterCriteria.minPrice;
                    }
                    if (filterCriteria.maxPrice !== undefined) {
                        filter.price.$lte = filterCriteria.maxPrice;
                    }
                }
                if (filterCriteria.features && filterCriteria.features.length > 0) {
                    filter.features = {
                        $in: filterCriteria.features
                    };
                }
                if (filterCriteria.hasHandle !== undefined) {
                    filter.hasHandle = filterCriteria.hasHandle;
                }
                if (filterCriteria.hasWheels !== undefined) {
                    filter.hasWheels = filterCriteria.hasWheels;
                }
                if (filterCriteria.waterproof !== undefined) {
                    filter.waterproof = filterCriteria.waterproof;
                }
                if (filterCriteria.shockproof !== undefined) {
                    filter.shockproof = filterCriteria.shockproof;
                }
                // Apply sorting
                const sortField = filterCriteria.sortBy || "rating";
                const sortDirection = filterCriteria.sortDirection === "asc" ? 1 : -1;
                const sort = {};
                sort[sortField] = sortDirection;
                // Apply pagination
                const page = filterCriteria.page || 1;
                const limit = filterCriteria.limit || 20;
                const skip = (page - 1) * limit;
                // Execute query
                const filteredCases = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .Case */ .JZ.find(filter).sort(sort).skip(skip).limit(limit);
                // Get total count for pagination
                const totalCount = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .Case */ .JZ.countDocuments(filter);
                return res.status(200).json({
                    cases: filteredCases,
                    pagination: {
                        total: totalCount,
                        page,
                        limit,
                        pages: Math.ceil(totalCount / limit)
                    }
                });
            } catch (error) {
                console.error("Error filtering cases:", error);
                return res.status(500).json({
                    error: "Error filtering cases"
                });
            }
        case "add-case":
            // Add a new case (admin only)
            // In a real app, this would have authentication
            const newCase = req.body;
            try {
                const createdCase = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .Case */ .JZ.create(newCase);
                return res.status(201).json(createdCase);
            } catch (error) {
                console.error("Error adding case:", error);
                return res.status(500).json({
                    error: "Error adding case"
                });
            }
        default:
            return res.status(400).json({
                error: "Invalid action"
            });
    }
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [338], () => (__webpack_exec__(7259)));
module.exports = __webpack_exports__;

})();