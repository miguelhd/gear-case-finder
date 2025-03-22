import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB connection string
// For production, this would be stored in environment variables
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/musician-case-finder";

// MongoDB client
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Mongoose connection
let mongooseConnection: typeof mongoose;

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
    
    globalWithMongo._mongoClientPromise = client.connect();
  }
  
  clientPromise = globalWithMongo._mongoClientPromise;
  
  if (!globalWithMongo._mongooseConnection) {
    globalWithMongo._mongooseConnection = mongoose;
    mongoose.connect(uri);
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
  
  clientPromise = client.connect();
  
  mongooseConnection = mongoose;
  mongoose.connect(uri);
}

// Export a module-scoped MongoClient promise and Mongoose connection
export { clientPromise, mongooseConnection as mongoose };

// Add connectToDatabase function for backward compatibility
export async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri);
  }
  return { client, mongoose };
}