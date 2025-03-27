// Test script to verify MongoDB connection using the same code as production
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Get MongoDB URI from environment or use the one from .env.local
const uri = process.env.MONGODB_URI || "mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@gearcasefindercluster.emncnyk.mongodb.net/?retryWrites=true&w=majority&appName=GearCaseFinderCluster";

console.log('Testing MongoDB connection with URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials in logs

async function testMongooseConnection() {
  try {
    console.log('Attempting Mongoose connection...');
    await mongoose.connect(uri);
    console.log('Mongoose connection successful!');
    console.log('Mongoose connection state:', mongoose.connection.readyState);
    console.log('Connected to database:', mongoose.connection.name);
    console.log('Connected to host:', mongoose.connection.host);
    return true;
  } catch (error) {
    console.error('Mongoose connection error:', error);
    return false;
  } finally {
    await mongoose.disconnect();
  }
}

async function testMongoClientConnection() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  try {
    console.log('Attempting MongoClient connection...');
    await client.connect();
    console.log('MongoClient connection successful!');
    const dbList = await client.db().admin().listDatabases();
    console.log('Available databases:', dbList.databases.map(db => db.name).join(', '));
    return true;
  } catch (error) {
    console.error('MongoClient connection error:', error);
    return false;
  } finally {
    await client.close();
  }
}

async function main() {
  console.log('=== MongoDB Connection Test ===');
  console.log('Node.js version:', process.version);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  const mongooseSuccess = await testMongooseConnection();
  const mongoClientSuccess = await testMongoClientConnection();
  
  if (mongooseSuccess && mongoClientSuccess) {
    console.log('All connection tests passed successfully!');
    process.exit(0);
  } else {
    console.error('One or more connection tests failed!');
    process.exit(1);
  }
}

main().catch(console.error);
