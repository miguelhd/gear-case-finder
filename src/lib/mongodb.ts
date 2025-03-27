// Enhanced MongoDB connection module with better error handling, diagnostics, and debugging
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

// Initialize MongoDB connection monitoring
console.log('Initializing MongoDB connection monitoring...');
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Log when models are compiled
mongoose.connection.on('model', (modelName) => {
  console.log(`Mongoose model compiled: ${modelName}`);
});

console.log('MongoDB connection monitoring initialized');

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
      .then(() => {
        console.log('Mongoose connected successfully in development mode');
        console.log('Database name:', mongoose.connection.db.databaseName);
        // List collections to verify database access
        return mongoose.connection.db.listCollections().toArray();
      })
      .then(collections => {
        console.log('Available collections:', collections.map(c => c.name).join(', '));
      })
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
    .then(() => {
      console.log('Mongoose connected successfully in production mode');
      console.log('Database name:', mongoose.connection.db.databaseName);
      // List collections to verify database access
      return mongoose.connection.db.listCollections().toArray();
    })
    .then(collections => {
      console.log('Available collections:', collections.map(c => c.name).join(', '));
    })
    .catch(handleConnectionError);
}

// Export a module-scoped MongoClient promise and Mongoose connection
export { clientPromise, mongooseConnection as mongoose };

// Add connectToDatabase function for backward compatibility
export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB database...');
      await mongoose.connect(uri);
      console.log('MongoDB connection established successfully');
      console.log('Connection state:', mongoose.connection.readyState);
      console.log('Database name:', mongoose.connection.db.databaseName);
      
      // List collections to verify database access
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name).join(', '));
      
      // Check if our required collections exist
      const requiredCollections = ['audiogears', 'cases', 'gearcasematches'];
      const missingCollections = requiredCollections.filter(
        name => !collections.some(c => c.name.toLowerCase() === name.toLowerCase())
      );
      
      if (missingCollections.length > 0) {
        console.warn('Warning: Missing required collections:', missingCollections.join(', '));
      } else {
        console.log('All required collections are present');
        
        // Count documents in each collection to verify data
        for (const collName of requiredCollections) {
          const count = await mongoose.connection.db.collection(collName).countDocuments();
          console.log(`Collection ${collName} has ${count} documents`);
        }
      }
    } else {
      console.log('MongoDB already connected');
      console.log('Connection state:', mongoose.connection.readyState);
      console.log('Database name:', mongoose.connection.db.databaseName);
    }
    return { client, mongoose };
  } catch (error) {
    console.error('Error connecting to database:', error);
    handleConnectionError(error);
    // Return the client and mongoose anyway, so the application can continue
    // This prevents the API from crashing even if the database is unavailable
    return { client, mongoose };
  }
}
