"use strict";
(() => {
var exports = {};
exports.id = 294;
exports.ids = [294];
exports.modules = {

/***/ 5680:
/***/ ((module) => {

module.exports = require("lru-cache");

/***/ }),

/***/ 3351:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3471);

async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }
    try {
        const stats = (0,_lib_cache__WEBPACK_IMPORTED_MODULE_0__/* .getCacheStats */ .eW)();
        // Add some mock data for the admin dashboard
        const enhancedStats = {
            ...stats,
            totalRequests: 1250,
            hits: 875,
            misses: 375,
            avgCachedResponseTime: 12,
            avgUncachedResponseTime: 187,
            entriesByType: [
                {
                    type: "search:gear",
                    count: 125,
                    hitRate: 0.82,
                    avgTtl: 300000
                },
                {
                    type: "search:cases",
                    count: 98,
                    hitRate: 0.79,
                    avgTtl: 300000
                },
                {
                    type: "search:compatible-cases",
                    count: 156,
                    hitRate: 0.88,
                    avgTtl: 300000
                },
                {
                    type: "filter:options",
                    count: 12,
                    hitRate: 0.95,
                    avgTtl: 3600000
                }
            ]
        };
        res.status(200).json(enhancedStats);
    } catch (error) {
        console.error("Error fetching cache stats:", error);
        res.status(500).json({
            message: "Failed to fetch cache statistics"
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
var __webpack_exports__ = __webpack_require__.X(0, [471], () => (__webpack_exec__(3351)));
module.exports = __webpack_exports__;

})();