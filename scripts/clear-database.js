// scripts/clear-database.js
require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection string
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const cluster = process.env.MONGODB_CLUSTER;
const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;

async function clearDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');

    // Get references to all collections
    const collections = mongoose.connection.collections;
    
    // Clear each collection
    for (const key in collections) {
      const collection = collections[key];
      console.log(`Clearing collection: ${collection.collectionName}`);
      await collection.deleteMany({});
      console.log(`Collection ${collection.collectionName} cleared successfully`);
    }

    console.log('All collections have been cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
clearDatabase();
