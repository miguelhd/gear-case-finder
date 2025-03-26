"use strict";
(() => {
var exports = {};
exports.id = 574;
exports.ids = [574];
exports.modules = {

/***/ 1185:
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ 5818:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6338);
/* harmony import */ var _lib_matching_product_matcher__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2755);
/* harmony import */ var _lib_matching_feature_matcher__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5934);
/* harmony import */ var _lib_matching_recommendation_engine__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8788);




// Initialize the product matcher
const productMatcher = new _lib_matching_product_matcher__WEBPACK_IMPORTED_MODULE_1__/* .ProductMatcher */ .o();
const featureMatcher = new _lib_matching_feature_matcher__WEBPACK_IMPORTED_MODULE_3__/* .FeatureMatcher */ .v();
const recommendationEngine = new _lib_matching_recommendation_engine__WEBPACK_IMPORTED_MODULE_2__/* .RecommendationEngine */ .$();
/**
 * API handler for gear-related endpoints
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
    const { action, id, query, category, brand, limit = "20" } = req.query;
    switch(action){
        case "all":
            // Get all gear with optional filtering
            const allGear = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .AudioGear */ .a1.find({
                ...category ? {
                    category
                } : {},
                ...brand ? {
                    brand
                } : {}
            }).limit(parseInt(limit));
            return res.status(200).json(allGear);
        case "search":
            // Search for gear by name, brand, or type
            if (!query) {
                return res.status(400).json({
                    error: "Query parameter is required"
                });
            }
            const searchResults = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .AudioGear */ .a1.find({
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
                    }
                ]
            }).limit(parseInt(limit));
            return res.status(200).json(searchResults);
        case "detail":
            // Get details for a specific gear item
            if (!id) {
                return res.status(400).json({
                    error: "ID parameter is required"
                });
            }
            const gearDetail = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .AudioGear */ .a1.findById(id);
            if (!gearDetail) {
                return res.status(404).json({
                    error: "Gear not found"
                });
            }
            return res.status(200).json(gearDetail);
        case "categories":
            // Get all unique categories
            const categories = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .AudioGear */ .a1.distinct("category");
            return res.status(200).json(categories);
        case "brands":
            // Get all unique brands
            const brands = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .AudioGear */ .a1.distinct("brand");
            return res.status(200).json(brands);
        case "popular":
            // Get popular gear items
            const popularGear = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .AudioGear */ .a1.find().sort({
                popularity: -1
            }).limit(parseInt(limit));
            return res.status(200).json(popularGear);
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
        case "find-cases":
            // Find compatible cases for a gear item
            const { gearId, options } = req.body;
            if (!gearId) {
                return res.status(400).json({
                    error: "gearId is required"
                });
            }
            try {
                const compatibleCases = await productMatcher.findCompatibleCases(gearId, options);
                return res.status(200).json(compatibleCases);
            } catch (error) {
                console.error("Error finding compatible cases:", error);
                return res.status(500).json({
                    error: "Error finding compatible cases"
                });
            }
        case "recommend-alternatives":
            // Recommend alternative cases
            const { gearId: gId, caseId, recommendationOptions } = req.body;
            if (!gId || !caseId) {
                return res.status(400).json({
                    error: "gearId and caseId are required"
                });
            }
            try {
                const gear = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .AudioGear */ .a1.findById(gId);
                if (!gear) {
                    return res.status(404).json({
                        error: "Gear not found"
                    });
                }
                const Case = (__webpack_require__(6338)/* .Case */ .JZ);
                const caseItem = await Case.findById(caseId);
                if (!caseItem) {
                    return res.status(404).json({
                        error: "Case not found"
                    });
                }
                const alternatives = await recommendationEngine.generateAlternativeRecommendations(gear, caseItem, recommendationOptions);
                return res.status(200).json(alternatives);
            } catch (error) {
                console.error("Error recommending alternatives:", error);
                return res.status(500).json({
                    error: "Error recommending alternatives"
                });
            }
        case "add-gear":
            // Add a new gear item (admin only)
            // In a real app, this would have authentication
            const newGear = req.body;
            try {
                const createdGear = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .AudioGear */ .a1.create(newGear);
                return res.status(201).json(createdGear);
            } catch (error) {
                console.error("Error adding gear:", error);
                return res.status(500).json({
                    error: "Error adding gear"
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
var __webpack_exports__ = __webpack_require__.X(0, [338,788], () => (__webpack_exec__(5818)));
module.exports = __webpack_exports__;

})();