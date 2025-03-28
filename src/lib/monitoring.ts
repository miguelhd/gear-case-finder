// Integration of MongoDB monitoring with application startup
import { startMongoDBMonitoring } from './mongodb-monitor';
import { NextApiRequest, NextApiResponse } from 'next';

// Flag to track if monitoring is already started
let monitoringStarted = false;

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
  withMonitoring
};
