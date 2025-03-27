// Enhanced MongoDB connection module with better error handling and diagnostics
import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB connection string
// For production, this would be stored in environment variables
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/musician-case-finder";

// Log connection attempt (hiding credentials)
console.log(`Attempting to connect to MongoDB with URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

// MongoDB client
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Mongoose connection
let mongooseConnection: typeof mongoose;

// Enhanced error handling for MongoDB connections
const handleConnectionError = (error: any) => {
  console.error('MongoDB connection error:', error);
  
  // Check for DNS resolution errors
  if (error.code === 'ENOTFOUND') {
    console.error('DNS resolution failed. Please check your MongoDB connection string and ensure the hostname is correct.');
    console.error('If you are using MongoDB Atlas, verify that the cluster name is correct and accessible.');
  }
  
  // Check for authentication errors
  if (error.code === 'ETIMEDOUT' || error.message?.includes('authentication')) {
    console.error('Connection timed out or authentication failed. Please check your credentials and network connectivity.');
  }
  
  // Don't throw the error - this allows the application to continue running
  // even if the database connection fails
  return error;
};

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
    _mongooseConnection?: typeof mongoose;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    
    globalWithMongo._mongoClientPromise = client.connect()
      .catch(handleConnectionError);
  }
  
  clientPromise = globalWithMongo._mongoClientPromise;
  
  if (!globalWithMongo._mongooseConnection) {
    globalWithMongo._mongooseConnection = mongoose;
    mongoose.connect(uri)
      .catch(handleConnectionError);
  }
  
  mongooseConnection = globalWithMongo._mongooseConnection;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  clientPromise = client.connect()
    .catch(handleConnectionError);
  
  mongooseConnection = mongoose;
  mongoose.connect(uri)
    .catch(handleConnectionError);
}

// Export a module-scoped MongoClient promise and Mongoose connection
export { clientPromise, mongooseConnection as mongoose };

// Add connectToDatabase function for backward compatibility
export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
      console.log('MongoDB connection established successfully');
    }
    return { client, mongoose };
  } catch (error) {
    handleConnectionError(error);
    // Return the client and mongoose anyway, so the application can continue
    // This prevents the API from crashing even if the database is unavailable
    return { client, mongoose };
  }
}
