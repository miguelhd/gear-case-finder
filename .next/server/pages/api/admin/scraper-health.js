"use strict";
(() => {
var exports = {};
exports.id = 822;
exports.ids = [822];
exports.modules = {

/***/ 3413:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ handler)
});

;// CONCATENATED MODULE: external "winston"
const external_winston_namespaceObject = require("winston");
;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = require("fs");
var external_fs_default = /*#__PURE__*/__webpack_require__.n(external_fs_namespaceObject);
;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = require("path");
var external_path_default = /*#__PURE__*/__webpack_require__.n(external_path_namespaceObject);
;// CONCATENATED MODULE: ./src/lib/monitoring.ts
// Logging and monitoring system for scraping jobs



// Create logs directory if it doesn't exist
const logDir = external_path_default().join(process.cwd(), "logs");
if (!external_fs_default().existsSync(logDir)) {
    external_fs_default().mkdirSync(logDir, {
        recursive: true
    });
}
// Define log format
const logFormat = external_winston_namespaceObject.format.combine(external_winston_namespaceObject.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss"
}), external_winston_namespaceObject.format.errors({
    stack: true
}), external_winston_namespaceObject.format.splat(), external_winston_namespaceObject.format.json());
// Create the logger instance
const logger = (0,external_winston_namespaceObject.createLogger)({
    level:  true ? "info" : 0,
    format: logFormat,
    defaultMeta: {
        service: "scraper-service"
    },
    transports: [
        // Write all logs with level 'error' and below to error.log
        new external_winston_namespaceObject.transports.File({
            filename: external_path_default().join(logDir, "error.log"),
            level: "error",
            maxsize: 5242880,
            maxFiles: 5
        }),
        // Write all logs with level 'info' and below to combined.log
        new external_winston_namespaceObject.transports.File({
            filename: external_path_default().join(logDir, "combined.log"),
            maxsize: 5242880,
            maxFiles: 5
        }),
        // Write all scraper-specific logs to scraper.log
        new external_winston_namespaceObject.transports.File({
            filename: external_path_default().join(logDir, "scraper.log"),
            maxsize: 5242880,
            maxFiles: 5
        })
    ]
});
// If we're not in production, also log to the console
if (false) {}
// Create a scraper-specific logger
const scraperLogger = logger.child({
    component: "scraper"
});
// Scraper metrics tracking
class ScraperMetrics {
    constructor(){
        this.metrics = {};
    }
    // Initialize metrics for a marketplace
    initMarketplace(marketplace) {
        if (!this.metrics[marketplace]) {
            this.metrics[marketplace] = {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                itemsScraped: 0,
                newItemsAdded: 0,
                itemsUpdated: 0,
                lastRunTime: 0,
                lastRunDate: null,
                errors: [],
                rateLimits: []
            };
        }
    }
    // Record a request
    recordRequest(marketplace, success) {
        this.initMarketplace(marketplace);
        this.metrics[marketplace].totalRequests++;
        if (success) {
            this.metrics[marketplace].successfulRequests++;
        } else {
            this.metrics[marketplace].failedRequests++;
        }
    }
    // Record scraped items
    recordScrapedItems(marketplace, count) {
        this.initMarketplace(marketplace);
        this.metrics[marketplace].itemsScraped += count;
    }
    // Record database operations
    recordDatabaseOperations(marketplace, added, updated) {
        this.initMarketplace(marketplace);
        this.metrics[marketplace].newItemsAdded += added;
        this.metrics[marketplace].itemsUpdated += updated;
    }
    // Record run time
    recordRunTime(marketplace, timeInMs) {
        this.initMarketplace(marketplace);
        this.metrics[marketplace].lastRunTime = timeInMs;
        this.metrics[marketplace].lastRunDate = new Date();
    }
    // Record an error
    recordError(marketplace, message, code) {
        this.initMarketplace(marketplace);
        this.metrics[marketplace].errors.push({
            timestamp: new Date(),
            message,
            code
        });
        // Keep only the last 100 errors
        if (this.metrics[marketplace].errors.length > 100) {
            this.metrics[marketplace].errors.shift();
        }
        // Log the error
        scraperLogger.error(`Scraper error for ${marketplace}: ${message}`, {
            code,
            marketplace
        });
    }
    // Record a rate limit
    recordRateLimit(marketplace, waitTimeMs) {
        this.initMarketplace(marketplace);
        this.metrics[marketplace].rateLimits.push({
            timestamp: new Date(),
            waitTime: waitTimeMs
        });
        // Keep only the last 50 rate limits
        if (this.metrics[marketplace].rateLimits.length > 50) {
            this.metrics[marketplace].rateLimits.shift();
        }
        // Log the rate limit
        scraperLogger.warn(`Rate limit hit for ${marketplace}. Waiting ${waitTimeMs}ms before retry.`, {
            marketplace,
            waitTime: waitTimeMs
        });
    }
    // Get metrics for a specific marketplace
    getMarketplaceMetrics(marketplace) {
        this.initMarketplace(marketplace);
        return this.metrics[marketplace];
    }
    // Get metrics for all marketplaces
    getAllMetrics() {
        return this.metrics;
    }
    // Get summary metrics
    getSummaryMetrics() {
        const summary = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            itemsScraped: 0,
            newItemsAdded: 0,
            itemsUpdated: 0,
            errorCount: 0,
            rateLimitCount: 0,
            marketplaces: Object.keys(this.metrics)
        };
        for(const marketplace in this.metrics){
            const m = this.metrics[marketplace];
            summary.totalRequests += m.totalRequests;
            summary.successfulRequests += m.successfulRequests;
            summary.failedRequests += m.failedRequests;
            summary.itemsScraped += m.itemsScraped;
            summary.newItemsAdded += m.newItemsAdded;
            summary.itemsUpdated += m.itemsUpdated;
            summary.errorCount += m.errors.length;
            summary.rateLimitCount += m.rateLimits.length;
        }
        return summary;
    }
    // Reset metrics for a marketplace
    resetMarketplaceMetrics(marketplace) {
        this.metrics[marketplace] = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            itemsScraped: 0,
            newItemsAdded: 0,
            itemsUpdated: 0,
            lastRunTime: 0,
            lastRunDate: null,
            errors: [],
            rateLimits: []
        };
    }
    // Reset all metrics
    resetAllMetrics() {
        this.metrics = {};
    }
}
// Create a singleton instance of the metrics tracker
const scraperMetrics = new ScraperMetrics();
// Middleware for monitoring scraper jobs
function monitorScraperJob(marketplace, jobFn) {
    return async (...args)=>{
        const startTime = Date.now();
        scraperLogger.info(`Starting scraper job for ${marketplace}`, {
            marketplace
        });
        try {
            // Run the scraper job
            const result = await jobFn(...args);
            // Record metrics
            const endTime = Date.now();
            const runTime = endTime - startTime;
            scraperMetrics.recordRunTime(marketplace, runTime);
            scraperLogger.info(`Completed scraper job for ${marketplace} in ${runTime}ms`, {
                marketplace,
                runTime,
                itemsScraped: result?.itemsScraped || 0,
                itemsAdded: result?.itemsAdded || 0,
                itemsUpdated: result?.itemsUpdated || 0
            });
            return result;
        } catch (error) {
            // Record error
            const errorMessage = error instanceof Error ? error.message : String(error);
            scraperMetrics.recordError(marketplace, errorMessage);
            // Log error
            scraperLogger.error(`Failed scraper job for ${marketplace}: ${errorMessage}`, {
                marketplace,
                error: error instanceof Error ? error.stack : errorMessage
            });
            throw error;
        }
    };
}
// Health check function for scrapers
function getScraperHealth() {
    const metrics = scraperMetrics.getAllMetrics();
    const summary = scraperMetrics.getSummaryMetrics();
    const health = {
        status: "healthy",
        lastUpdated: new Date(),
        summary,
        marketplaces: {}
    };
    // Check health of each marketplace
    for(const marketplace in metrics){
        const m = metrics[marketplace];
        const successRate = m.totalRequests > 0 ? m.successfulRequests / m.totalRequests * 100 : 100;
        const lastRunAgeHours = m.lastRunDate ? (Date.now() - m.lastRunDate.getTime()) / (1000 * 60 * 60) : null;
        const recentErrors = m.errors.filter((e)=>Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000).length;
        let status = "healthy";
        const issues = [];
        // Check for issues
        if (successRate < 80) {
            status = "warning";
            issues.push("Low success rate");
        }
        if (lastRunAgeHours !== null && lastRunAgeHours > 24) {
            status = "warning";
            issues.push("No recent runs");
        }
        if (recentErrors > 10) {
            status = "warning";
            issues.push("High error rate");
        }
        if (successRate < 50 || recentErrors > 50) {
            status = "critical";
        }
        health.marketplaces[marketplace] = {
            status,
            issues,
            successRate: Math.round(successRate * 100) / 100,
            lastRun: m.lastRunDate,
            lastRunAgeHours: lastRunAgeHours !== null ? Math.round(lastRunAgeHours * 10) / 10 : null,
            recentErrors,
            totalErrors: m.errors.length
        };
        // Update overall status
        if (status === "critical" && health.status !== "critical") {
            health.status = "critical";
        } else if (status === "warning" && health.status === "healthy") {
            health.status = "warning";
        }
    }
    return health;
}
/* harmony default export */ const monitoring = ({
    logger,
    scraperLogger,
    scraperMetrics,
    monitorScraperJob,
    getScraperHealth
});

;// CONCATENATED MODULE: ./src/pages/api/admin/scraper-health.ts

async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }
    try {
        const health = getScraperHealth();
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
var __webpack_exports__ = (__webpack_exec__(3413));
module.exports = __webpack_exports__;

})();