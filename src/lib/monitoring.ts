// Integration of MongoDB monitoring with application startup
import { startMongoDBMonitoring } from './mongodb-monitor';
import { NextApiRequest, NextApiResponse } from 'next';

// Flag to track if monitoring is already started
let monitoringStarted = false;

// Scraper health status types
export type ScraperStatus = 'healthy' | 'warning' | 'error' | 'critical';

// Scraper health interface
export interface ScraperHealth {
  status: ScraperStatus;
  lastUpdated: string;
  scrapers: {
    amazon: {
      status: ScraperStatus;
      lastRun: string | null;
      itemsScraped: number;
      errors: number;
    };
    thomann: {
      status: ScraperStatus;
      lastRun: string | null;
      itemsScraped: number;
      errors: number;
    };
    sweetwater: {
      status: ScraperStatus;
      lastRun: string | null;
      itemsScraped: number;
      errors: number;
    };
  };
  databaseConnection: {
    status: ScraperStatus;
    message: string;
  };
}

// Scraper job interface
export interface ScraperJob {
  id: string;
  marketplace: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime: string | null;
  itemsScraped: number;
  errors: number;
  logs: string[];
}

// Mock scraper metrics for compatibility with existing code
export const scraperMetrics = {
  recordScraperRun: (marketplace: string, itemsScraped: number, errors: number) => {
    console.log(`Recording scraper run for ${marketplace}: ${itemsScraped} items, ${errors} errors`);
    // This is a placeholder implementation
  }
};

// Function to monitor a scraper job
export function monitorScraperJob(marketplace: string): ScraperJob {
  // This is a placeholder implementation that returns a mock scraper job
  const jobId = `${marketplace}-${Date.now()}`;
  
  console.log(`Monitoring scraper job for ${marketplace} with ID ${jobId}`);
  
  // In a real implementation, this would create an actual job record in the database
  // and set up monitoring for the job
  
  return {
    id: jobId,
    marketplace,
    status: 'pending',
    startTime: new Date().toISOString(),
    endTime: null,
    itemsScraped: 0,
    errors: 0,
    logs: [`Job ${jobId} created for ${marketplace} marketplace`]
  };
}

// Function to get scraper health status
export function getScraperHealth(): ScraperHealth {
  // This is a placeholder implementation that returns mock data
  // In a real implementation, this would fetch actual scraper metrics from a database
  
  // Get MongoDB connection status from the monitoring system
  const dbStatus: ScraperStatus = 
    process.env['MONGODB_URI'] ? 'healthy' : 'warning';
  
  return {
    status: dbStatus, // Overall status matches database connection status
    lastUpdated: new Date().toISOString(),
    scrapers: {
      amazon: {
        status: 'healthy',
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        itemsScraped: 250,
        errors: 0
      },
      thomann: {
        status: 'healthy',
        lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        itemsScraped: 180,
        errors: 2
      },
      sweetwater: {
        status: 'healthy',
        lastRun: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
        itemsScraped: 320,
        errors: 1
      }
    },
    databaseConnection: {
      status: dbStatus,
      message: dbStatus === 'healthy' 
        ? 'Connected to MongoDB' 
        : 'MongoDB connection issues detected'
    }
  };
}

// Function to initialize monitoring on application startup
export function initializeMonitoring() {
  if (!monitoringStarted) {
    console.log('Initializing MongoDB connection monitoring...');
    const stopMonitoring = startMongoDBMonitoring();
    
    // Set up cleanup for graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, stopping MongoDB monitoring...');
      stopMonitoring();
    });
    
    process.on('SIGINT', () => {
      console.log('SIGINT received, stopping MongoDB monitoring...');
      stopMonitoring();
    });
    
    monitoringStarted = true;
    console.log('MongoDB connection monitoring initialized');
  }
}

// Middleware to ensure monitoring is started for API routes
// Updated to accept Promise<unknown> return type for broader compatibility
export function withMonitoring(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Initialize monitoring if not already started
    initializeMonitoring();
    
    // Call the original handler
    return handler(req, res);
  };
}

// Initialize monitoring on module import in production
if (process.env.NODE_ENV === 'production') {
  initializeMonitoring();
}

export default {
  initializeMonitoring,
  withMonitoring,
  getScraperHealth,
  scraperMetrics,
  monitorScraperJob
};
