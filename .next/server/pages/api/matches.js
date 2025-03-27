"use strict";
(() => {
var exports = {};
exports.id = 442;
exports.ids = [442];
exports.modules = {

/***/ 1185:
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ 9697:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ handler)
});

// EXTERNAL MODULE: ./src/lib/mongodb.ts
var mongodb = __webpack_require__(8377);
// EXTERNAL MODULE: ./src/lib/models/gear-models.ts
var gear_models = __webpack_require__(6338);
// EXTERNAL MODULE: external "mongoose"
var external_mongoose_ = __webpack_require__(1185);
var external_mongoose_default = /*#__PURE__*/__webpack_require__.n(external_mongoose_);
;// CONCATENATED MODULE: ./src/lib/matching/feedback-manager.ts


// Schema for user feedback
const UserFeedbackSchema = new (external_mongoose_default()).Schema({
    userId: {
        type: String
    },
    gearId: {
        type: String,
        required: true,
        index: true
    },
    caseId: {
        type: String,
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comments: {
        type: String
    },
    fitAccuracy: {
        type: Number,
        min: 1,
        max: 5
    },
    protectionQuality: {
        type: Number,
        min: 1,
        max: 5
    },
    valueForMoney: {
        type: Number,
        min: 1,
        max: 5
    },
    actuallyPurchased: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Create compound index for gear and case
UserFeedbackSchema.index({
    gearId: 1,
    caseId: 1
});
// Create the model
let UserFeedbackModel;
try {
    UserFeedbackModel = external_mongoose_default().model("UserFeedback");
} catch (error) {
    UserFeedbackModel = external_mongoose_default().model("UserFeedback", UserFeedbackSchema);
}
class FeedbackManager {
    /**
   * Submit user feedback for a gear-case match
   */ async submitFeedback(feedback) {
        const newFeedback = new UserFeedbackModel({
            ...feedback,
            createdAt: new Date()
        });
        await newFeedback.save();
        // Update the match confidence based on feedback
        await this.updateMatchConfidence(feedback.gearId, feedback.caseId, feedback.rating);
        return newFeedback;
    }
    /**
   * Get all feedback for a specific gear-case match
   */ async getFeedbackForMatch(gearId, caseId) {
        return UserFeedbackModel.find({
            gearId,
            caseId
        }).sort({
            createdAt: -1
        });
    }
    /**
   * Get average rating for a specific gear-case match
   */ async getAverageRatingForMatch(gearId, caseId) {
        const result = await UserFeedbackModel.aggregate([
            {
                $match: {
                    gearId,
                    caseId
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: {
                        $avg: "$rating"
                    }
                }
            }
        ]);
        if (result.length === 0) {
            return null;
        }
        return result[0].averageRating;
    }
    /**
   * Update match confidence based on user feedback
   */ async updateMatchConfidence(gearId, caseId, rating) {
        // Find the match in the database
        const match = await gear_models/* GearCaseMatch */.aX.findOne({
            gearId: new (external_mongoose_default()).Types.ObjectId(gearId),
            caseId: new (external_mongoose_default()).Types.ObjectId(caseId)
        });
        if (!match) {
            // Create a new match if it doesn't exist
            const newMatch = new gear_models/* GearCaseMatch */.aX({
                gearId: new (external_mongoose_default()).Types.ObjectId(gearId),
                caseId: new (external_mongoose_default()).Types.ObjectId(caseId),
                compatibilityScore: rating * 20,
                dimensionFit: {
                    length: 80,
                    width: 80,
                    height: 80,
                    overall: 80
                },
                priceCategory: "mid-range",
                protectionLevel: "medium",
                features: []
            });
            await newMatch.save();
            return;
        }
        // Get all feedback for this match
        const allFeedback = await this.getFeedbackForMatch(gearId, caseId);
        if (allFeedback.length === 0) {
            return;
        }
        // Calculate average rating
        const totalRating = allFeedback.reduce((sum, item)=>sum + item.rating, 0);
        const averageRating = totalRating / allFeedback.length;
        // Adjust compatibility score based on feedback
        // We'll use a weighted average: 70% algorithm score, 30% user feedback
        const adjustedScore = match.compatibilityScore * 0.7 + averageRating * 20 * 0.3;
        // Update the match
        await gear_models/* GearCaseMatch */.aX.updateOne({
            _id: match._id
        }, {
            $set: {
                compatibilityScore: Math.round(adjustedScore)
            }
        });
    }
    /**
   * Get top-rated matches for a specific gear
   */ async getTopRatedMatchesForGear(gearId, limit = 5) {
        // Get all feedback for this gear
        const feedback = await UserFeedbackModel.aggregate([
            {
                $match: {
                    gearId
                }
            },
            {
                $group: {
                    _id: "$caseId",
                    averageRating: {
                        $avg: "$rating"
                    },
                    feedbackCount: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    averageRating: -1,
                    feedbackCount: -1
                }
            },
            {
                $limit: limit
            }
        ]);
        // Get case details for each match
        const Case = external_mongoose_default().model("Case");
        const results = [];
        for (const item of feedback){
            const caseItem = await Case.findById(item._id);
            if (caseItem) {
                results.push({
                    case: caseItem,
                    averageRating: item.averageRating,
                    feedbackCount: item.feedbackCount
                });
            }
        }
        return results;
    }
    /**
   * Get feedback statistics
   */ async getFeedbackStatistics() {
        const totalFeedback = await UserFeedbackModel.countDocuments();
        const averageRating = await UserFeedbackModel.aggregate([
            {
                $group: {
                    _id: null,
                    average: {
                        $avg: "$rating"
                    }
                }
            }
        ]);
        const ratingDistribution = await UserFeedbackModel.aggregate([
            {
                $group: {
                    _id: "$rating",
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);
        const purchaseRate = await UserFeedbackModel.aggregate([
            {
                $group: {
                    _id: null,
                    purchased: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$actuallyPurchased",
                                        true
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    total: {
                        $sum: 1
                    }
                }
            }
        ]);
        return {
            totalFeedback,
            averageRating: averageRating.length > 0 ? averageRating[0].average : 0,
            ratingDistribution: ratingDistribution.map((item)=>({
                    rating: item._id,
                    count: item.count
                })),
            purchaseRate: purchaseRate.length > 0 ? purchaseRate[0].purchased / purchaseRate[0].total * 100 : 0
        };
    }
}

;// CONCATENATED MODULE: ./src/pages/api/matches.ts



// Initialize the feedback manager
const feedbackManager = new FeedbackManager();
/**
 * API handler for match-related endpoints
 */ async function handler(req, res) {
    try {
        // Connect to the database
        await (0,mongodb/* default */.ZP)();
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
            const popularMatches = await gear_models/* GearCaseMatch */.aX.find().sort({
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
            const gearMatches = await gear_models/* GearCaseMatch */.aX.find({
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
            const caseMatches = await gear_models/* GearCaseMatch */.aX.find({
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
            const matchDetail = await gear_models/* GearCaseMatch */.aX.findOne({
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
                const existingMatch = await gear_models/* GearCaseMatch */.aX.findOne({
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
                const newMatch = await gear_models/* GearCaseMatch */.aX.create(matchData);
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
var __webpack_exports__ = __webpack_require__.X(0, [338,377], () => (__webpack_exec__(9697)));
module.exports = __webpack_exports__;

})();