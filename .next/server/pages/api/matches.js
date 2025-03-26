"use strict";
(() => {
var exports = {};
exports.id = 442;
exports.ids = [442];
exports.modules = {

/***/ 8013:
/***/ ((module) => {

module.exports = require("mongodb");

/***/ }),

/***/ 1185:
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ 2621:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_mongodb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8377);
/* harmony import */ var _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6338);
/* harmony import */ var _lib_matching_feedback_manager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4985);



// Initialize the feedback manager
const feedbackManager = new _lib_matching_feedback_manager__WEBPACK_IMPORTED_MODULE_2__/* .FeedbackManager */ .B();
/**
 * API handler for match-related endpoints
 */ async function handler(req, res) {
    try {
        // Connect to the database
        await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_0__/* .connectToDatabase */ .vO)();
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
    const { action, gearId, caseId, limit = "10" } = req.query;
    switch(action){
        case "popular-matches":
            // Get popular matches
            const popularMatches = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.find().sort({
                compatibilityScore: -1
            }).limit(parseInt(limit)).populate("gearId").populate("caseId");
            return res.status(200).json(popularMatches);
        case "gear-matches":
            // Get matches for a specific gear
            if (!gearId) {
                return res.status(400).json({
                    error: "gearId parameter is required"
                });
            }
            const gearMatches = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.find({
                gearId
            }).sort({
                compatibilityScore: -1
            }).limit(parseInt(limit)).populate("gearId").populate("caseId");
            return res.status(200).json(gearMatches);
        case "case-matches":
            // Get matches for a specific case
            if (!caseId) {
                return res.status(400).json({
                    error: "caseId parameter is required"
                });
            }
            const caseMatches = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.find({
                caseId
            }).sort({
                compatibilityScore: -1
            }).limit(parseInt(limit)).populate("gearId").populate("caseId");
            return res.status(200).json(caseMatches);
        case "match-detail":
            // Get details for a specific match
            if (!gearId || !caseId) {
                return res.status(400).json({
                    error: "gearId and caseId parameters are required"
                });
            }
            const matchDetail = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.findOne({
                gearId,
                caseId
            }).populate("gearId").populate("caseId");
            if (!matchDetail) {
                return res.status(404).json({
                    error: "Match not found"
                });
            }
            return res.status(200).json(matchDetail);
        case "feedback":
            // Get feedback for a specific match
            if (!gearId || !caseId) {
                return res.status(400).json({
                    error: "gearId and caseId parameters are required"
                });
            }
            const feedback = await feedbackManager.getFeedbackForMatch(gearId, caseId);
            const averageRating = await feedbackManager.getAverageRatingForMatch(gearId, caseId);
            return res.status(200).json({
                feedback,
                averageRating
            });
        case "top-rated":
            // Get top-rated matches for a gear
            if (!gearId) {
                return res.status(400).json({
                    error: "gearId parameter is required"
                });
            }
            const topRated = await feedbackManager.getTopRatedMatchesForGear(gearId, parseInt(limit));
            return res.status(200).json(topRated);
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
        case "submit-feedback":
            // Submit feedback for a match
            const feedbackData = req.body;
            if (!feedbackData.gearId || !feedbackData.caseId || !feedbackData.rating) {
                return res.status(400).json({
                    error: "gearId, caseId, and rating are required"
                });
            }
            try {
                const feedback = await feedbackManager.submitFeedback(feedbackData);
                return res.status(201).json(feedback);
            } catch (error) {
                console.error("Error submitting feedback:", error);
                return res.status(500).json({
                    error: "Error submitting feedback"
                });
            }
        case "create-match":
            // Create a new match (usually done automatically by the algorithm)
            const matchData = req.body;
            if (!matchData.gearId || !matchData.caseId) {
                return res.status(400).json({
                    error: "gearId and caseId are required"
                });
            }
            try {
                // Check if match already exists
                const existingMatch = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.findOne({
                    gearId: matchData.gearId,
                    caseId: matchData.caseId
                });
                if (existingMatch) {
                    return res.status(409).json({
                        error: "Match already exists",
                        match: existingMatch
                    });
                }
                // Create new match
                const newMatch = await _lib_models_gear_models__WEBPACK_IMPORTED_MODULE_1__/* .GearCaseMatch */ .aX.create(matchData);
                return res.status(201).json(newMatch);
            } catch (error) {
                console.error("Error creating match:", error);
                return res.status(500).json({
                    error: "Error creating match"
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
var __webpack_exports__ = __webpack_require__.X(0, [338,377,985], () => (__webpack_exec__(2621)));
module.exports = __webpack_exports__;

})();