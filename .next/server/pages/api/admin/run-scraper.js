"use strict";
(() => {
var exports = {};
exports.id = 856;
exports.ids = [856];
exports.modules = {

/***/ 1154:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }
    try {
        const { marketplace } = req.body;
        if (!marketplace) {
            return res.status(400).json({
                message: "Marketplace parameter is required"
            });
        }
        // In a real implementation, this would trigger the actual scraper job
        // For now, we'll just simulate starting a job
        if (marketplace === "all") {
            // Start all scrapers
            console.log("Starting all scrapers");
            // Mock response
            res.status(200).json({
                message: "All scraper jobs started successfully",
                jobIds: [
                    "amazon-123",
                    "ebay-456",
                    "etsy-789",
                    "aliexpress-012",
                    "temu-345"
                ]
            });
        } else {
            // Start specific scraper
            console.log(`Starting ${marketplace} scraper`);
            // Mock response
            res.status(200).json({
                message: `${marketplace} scraper job started successfully`,
                jobId: `${marketplace}-${Date.now()}`
            });
        }
    } catch (error) {
        console.error("Error starting scraper job:", error);
        res.status(500).json({
            message: "Failed to start scraper job"
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
var __webpack_exports__ = (__webpack_exec__(1154));
module.exports = __webpack_exports__;

})();