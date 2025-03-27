"use strict";
(() => {
var exports = {};
exports.id = 822;
exports.ids = [822];
exports.modules = {

/***/ 8013:
/***/ ((module) => {

module.exports = require("mongodb");

/***/ }),

/***/ 1185:
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ 7147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 1017:
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ 6255:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_monitoring__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9241);

async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }
    try {
        const health = (0,_lib_monitoring__WEBPACK_IMPORTED_MODULE_0__/* .getScraperHealth */ .pg)();
        res.status(200).json(health);
    } catch (error) {
        console.error("Error fetching scraper health:", error);
        res.status(500).json({
            message: "Failed to fetch scraper health"
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
var __webpack_exports__ = __webpack_require__.X(0, [241], () => (__webpack_exec__(6255)));
module.exports = __webpack_exports__;

})();