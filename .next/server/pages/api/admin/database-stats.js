"use strict";
(() => {
var exports = {};
exports.id = 155;
exports.ids = [155];
exports.modules = {

/***/ 1185:
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ 7881:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_mongodb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8377);

async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }
    try {
        // Connect to MongoDB and get database
        await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .ZP)();
        const mongooseInstance = (await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 1185, 23))).default;
        const db = mongooseInstance.connection.db;
        // Get collection stats
        const audiogears = await db.collection("audiogears").countDocuments();
        const cases = await db.collection("cases").countDocuments();
        const matches = await db.collection("gearcasematches").countDocuments();
        // Get distinct values for categories, brands, etc.
        const gearCategories = await db.collection("audiogears").distinct("category");
        const gearBrands = await db.collection("audiogears").distinct("brand");
        const caseTypes = await db.collection("cases").distinct("type");
        const caseBrands = await db.collection("cases").distinct("brand");
        // Mock data for recent activity
        const recentActivity = [
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 5),
                collection: "audiogears",
                operation: "insert",
                count: 3
            },
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 15),
                collection: "cases",
                operation: "insert",
                count: 5
            },
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                collection: "gearcasematches",
                operation: "update",
                count: 12
            },
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 60),
                collection: "audiogears",
                operation: "update",
                count: 2
            },
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 120),
                collection: "cases",
                operation: "delete",
                count: 1
            }
        ];
        const stats = {
            gearCount: audiogears,
            caseCount: cases,
            matchCount: matches,
            gearCategories: gearCategories.length,
            gearBrands: gearBrands.length,
            caseTypes: caseTypes.length,
            caseBrands: caseBrands.length,
            avgCompatibility: 78.5,
            highCompatibilityCount: Math.floor(matches * 0.35),
            recentActivity
        };
        res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching database stats:", error);
        res.status(500).json({
            message: "Failed to fetch database statistics"
        });
    }
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [377], () => (__webpack_exec__(7881)));
module.exports = __webpack_exports__;

})();