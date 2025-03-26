// Logging and monitoring system for scraping jobs
import winston from 'winston';
import { createLogger, format, transports } from 'winston';
import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create the logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'scraper-service' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all scraper-specific logs to scraper.log
    new transports.File({ 
      filename: path.join(logDir, 'scraper.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    ),
  }));
}

// Create a scraper-specific logger
export const scraperLogger = logger.child({ component: 'scraper' });

// Scraper metrics tracking
class ScraperMetrics {
  private metrics: {
    [marketplace: string]: {
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      itemsScraped: number;
      newItemsAdded: number;
      itemsUpdated: number;
      lastRunTime: number; // in milliseconds
      lastRunDate: Date | null;
      errors: Array<{
        timestamp: Date;
        message: string;
        code?: string;
      }>;
      rateLimits: Array<{
        timestamp: Date;
        waitTime: number; // in milliseconds
      }>;
    };
  };

  constructor() {
    this.metrics = {};
  }

  // Initialize metrics for a marketplace
  initMarketplace(marketplace: string): void {
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
        rateLimits: [],
      };
    }
  }

  // Record a request
  recordRequest(marketplace: string, success: boolean): void {
    this.initMarketplace(marketplace);
    this.metrics[marketplace].totalRequests++;
    
    if (success) {
      this.metrics[marketplace].successfulRequests++;
    } else {
      this.metrics[marketplace].failedRequests++;
    }
  }

  // Record scraped items
  recordScrapedItems(marketplace: string, count: number): void {
    this.initMarketplace(marketplace);
    this.metrics[marketplace].itemsScraped += count;
  }

  // Record database operations
  recordDatabaseOperations(marketplace: string, added: number, updated: number): void {
    this.initMarketplace(marketplace);
    this.metrics[marketplace].newItemsAdded += added;
    this.metrics[marketplace].itemsUpdated += updated;
  }

  // Record run time
  recordRunTime(marketplace: string, timeInMs: number): void {
    this.initMarketplace(marketplace);
    this.metrics[marketplace].lastRunTime = timeInMs;
    this.metrics[marketplace].lastRunDate = new Date();
  }

  // Record an error
  recordError(marketplace: string, message: string, code?: string): void {
    this.initMarketplace(marketplace);
    this.metrics[marketplace].errors.push({
      timestamp: new Date(),
      message,
      code,
    });
    
    // Keep only the last 100 errors
    if (this.metrics[marketplace].errors.length > 100) {
      this.metrics[marketplace].errors.shift();
    }
    
    // Log the error
    scraperLogger.error(`Scraper error for ${marketplace}: ${message}`, { code, marketplace });
  }

  // Record a rate limit
  recordRateLimit(marketplace: string, waitTimeMs: number): void {
    this.initMarketplace(marketplace);
    this.metrics[marketplace].rateLimits.push({
      timestamp: new Date(),
      waitTime: waitTimeMs,
    });
    
    // Keep only the last 50 rate limits
    if (this.metrics[marketplace].rateLimits.length > 50) {
      this.metrics[marketplace].rateLimits.shift();
    }
    
    // Log the rate limit
    scraperLogger.warn(`Rate limit hit for ${marketplace}. Waiting ${waitTimeMs}ms before retry.`, { marketplace, waitTime: waitTimeMs });
  }

  // Get metrics for a specific marketplace
  getMarketplaceMetrics(marketplace: string) {
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
      marketplaces: Object.keys(this.metrics),
    };

    for (const marketplace in this.metrics) {
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
  resetMarketplaceMetrics(marketplace: string): void {
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
      rateLimits: [],
    };
  }

  // Reset all metrics
  resetAllMetrics(): void {
    this.metrics = {};
  }
}

// Create a singleton instance of the metrics tracker
export const scraperMetrics = new ScraperMetrics();

// Middleware for monitoring scraper jobs
export function monitorScraperJob(marketplace: string, jobFn: Function) {
  return async (...args: any[]) => {
    const startTime = Date.now();
    scraperLogger.info(`Starting scraper job for ${marketplace}`, { marketplace });
    
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
export function getScraperHealth() {
  const metrics = scraperMetrics.getAllMetrics();
  const summary = scraperMetrics.getSummaryMetrics();
  
  const health = {
    status: 'healthy',
    lastUpdated: new Date(),
    summary,
    marketplaces: {} as Record<string, any>
  };
  
  // Check health of each marketplace
  for (const marketplace in metrics) {
    const m = metrics[marketplace];
    const successRate = m.totalRequests > 0 
      ? (m.successfulRequests / m.totalRequests) * 100 
      : 100;
    
    const lastRunAgeHours = m.lastRunDate 
      ? (Date.now() - m.lastRunDate.getTime()) / (1000 * 60 * 60)
      : null;
    
    const recentErrors = m.errors
      .filter(e => (Date.now() - e.timestamp.getTime()) < (24 * 60 * 60 * 1000))
      .length;
    
    let status = 'healthy';
    const issues: string[] = [];
    
    // Check for issues
    if (successRate < 80) {
      status = 'warning';
      issues.push('Low success rate');
    }
    
    if (lastRunAgeHours !== null && lastRunAgeHours > 24) {
      status = 'warning';
      issues.push('No recent runs');
    }
    
    if (recentErrors > 10) {
      status = 'warning';
      issues.push('High error rate');
    }
    
    if (successRate < 50 || recentErrors > 50) {
      status = 'critical';
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
    if (status === 'critical' && health.status !== 'critical') {
      health.status = 'critical';
    } else if (status === 'warning' && health.status === 'healthy') {
      health.status = 'warning';
    }
  }
  
  return health;
}

export default {
  logger,
  scraperLogger,
  scraperMetrics,
  monitorScraperJob,
  getScraperHealth
};
