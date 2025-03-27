// MongoDB connection monitoring utility
// This script helps monitor MongoDB connection status and logs issues
import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Configuration - Use /tmp directory in production environment
const LOG_DIR = process.env.NODE_ENV === 'production' 
  ? '/tmp/logs' 
  : (process.env.LOG_DIR || './logs');
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_LOG_FILES = 5;
const CHECK_INTERVAL = 60 * 1000; // 1 minute

// Ensure log directory exists with error handling
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch (error) {
  console.error(`Failed to create log directory ${LOG_DIR}:`, error);
  // Continue execution even if directory creation fails
}

// Log file path
const LOG_FILE = path.join(LOG_DIR, 'mongodb-connection.log');

// Rotate logs if needed with error handling
function rotateLogIfNeeded() {
  try {
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_LOG_SIZE) {
      // Rotate existing log files
      for (let i = MAX_LOG_FILES - 1; i > 0; i--) {
        const oldFile = `${LOG_FILE}.${i}`;
        const newFile = `${LOG_FILE}.${i + 1}`;
        if (fs.existsSync(oldFile) && i < MAX_LOG_FILES - 1) {
          fs.renameSync(oldFile, newFile);
        }
      }
      
      // Rename current log to .1
      if (fs.existsSync(LOG_FILE)) {
        fs.renameSync(LOG_FILE, `${LOG_FILE}.1`);
      }
    }
  } catch (error) {
    console.error('Error rotating log files:', error);
  }
}

// Write to log file with error handling
function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  try {
    rotateLogIfNeeded();
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    // Fallback to console logging if file operations fail
    console.error(`[MongoDB Monitor] ${message}`);
    console.error('Error writing to log file:', error);
  }
}

// Check MongoDB connection status
async function checkMongoDBConnection() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/musician-case-finder";
  const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  
  logToFile(`Checking MongoDB connection to: ${sanitizedUri}`);
  
  // Check Mongoose connection
  try {
    const state = mongoose.connection.readyState;
    let stateString = 'unknown';
    
    switch (state) {
      case 0:
        stateString = 'disconnected';
        break;
      case 1:
        stateString = 'connected';
        break;
      case 2:
        stateString = 'connecting';
        break;
      case 3:
        stateString = 'disconnecting';
        break;
      case 99:
        stateString = 'uninitialized';
        break;
    }
    
    logToFile(`Mongoose connection state: ${stateString} (${state})`);
    
    if (state === 1) {
      logToFile(`Connected to database: ${mongoose.connection.name}`);
      logToFile(`Connected to host: ${mongoose.connection.host}`);
    } else if (state === 0) {
      // Try to reconnect
      logToFile('Mongoose disconnected, attempting to reconnect...');
      try {
        await mongoose.connect(uri);
        logToFile('Mongoose reconnection successful');
      } catch (reconnectError) {
        logToFile(`Mongoose reconnection failed: ${reconnectError instanceof Error ? reconnectError.message : String(reconnectError)}`);
      }
    }
  } catch (error) {
    logToFile(`Error checking Mongoose connection: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Check MongoClient connection
  try {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    
    logToFile('Testing direct MongoClient connection...');
    await client.connect();
    logToFile('MongoClient connection successful');
    
    // Get server info
    const serverInfo = await client.db().admin().serverInfo();
    logToFile(`MongoDB server version: ${serverInfo.version}`);
    
    await client.close();
    logToFile('MongoClient connection closed');
  } catch (error) {
    logToFile(`MongoClient connection error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Start monitoring
export function startMongoDBMonitoring() {
  try {
    logToFile('Starting MongoDB connection monitoring');
    
    // Initial check
    checkMongoDBConnection().catch(error => {
      logToFile(`Error in initial connection check: ${error instanceof Error ? error.message : String(error)}`);
    });
    
    // Set up interval for regular checks
    const intervalId = setInterval(() => {
      checkMongoDBConnection().catch(error => {
        logToFile(`Error in scheduled connection check: ${error instanceof Error ? error.message : String(error)}`);
      });
    }, CHECK_INTERVAL);
    
    // Return function to stop monitoring
    return () => {
      clearInterval(intervalId);
      logToFile('MongoDB connection monitoring stopped');
    };
  } catch (error) {
    console.error('Failed to start MongoDB monitoring:', error);
    // Return a no-op function as fallback
    return () => {};
  }
}

// Export for use in other modules
export default {
  startMongoDBMonitoring,
  checkMongoDBConnection,
  logToFile
};
