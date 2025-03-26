"use strict";
(() => {
var exports = {};
exports.id = 132;
exports.ids = [132];
exports.modules = {

/***/ 5680:
/***/ ((module) => {

module.exports = require("lru-cache");

/***/ }),

/***/ 7125:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3471);

async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }
    try {
        (0,_lib_cache__WEBPACK_IMPORTED_MODULE_0__/* .clearCache */ .LK)();
        res.status(200).json({
            message: "Cache cleared successfully"
        });
    } catch (error) {
        console.error("Error clearing cache:", error);
        res.status(500).json({
            message: "Failed to clear cache"
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
var __webpack_exports__ = __webpack_require__.X(0, [471], () => (__webpack_exec__(7125)));
module.exports = __webpack_exports__;

})();