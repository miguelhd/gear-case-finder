/**
 * Test MongoDB Atlas Connection
 * 
 * This script tests the connection to MongoDB Atlas using the connection string
 * from the .env.local file.
 * 
 * Usage: node scripts/db-setup/test-connection.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection URI
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function testConnection() {
  console.log('Testing connection to MongoDB Atlas...');
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas');
    
    // Get database reference
    const dbName = uri.split('/').pop().split('?')[0];
    console.log(`✅ Using database: ${dbName}`);
    
    // List collections
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections in the database`);
    
    if (collections.length > 0) {
      console.log('Existing collections:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    console.log('\nConnection test completed successfully');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  } finally {
    // Close the connection
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the test
testConnection().catch(console.error);
