const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gearCaseApp:rucwoj-watxor-Rocji5@cluster0.mongodb.net/musician-case-finder';

// Function to test MongoDB connection
async function testMongoDBConnection() {
  console.log('Testing MongoDB connection...');
  console.log(`Connection URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB!');
    
    // Get database information
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Connected to database: ${dbName}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Count documents in each collection
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`Collection ${collection.name} has ${count} documents`);
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
}

// Function to create indexes for collections
async function createIndexes() {
  console.log('Creating indexes for collections...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Create indexes for AudioGear collection
    console.log('Creating indexes for AudioGear collection...');
    await mongoose.connection.db.collection('AudioGear').createIndex({ brand: 1 });
    await mongoose.connection.db.collection('AudioGear').createIndex({ category: 1 });
    await mongoose.connection.db.collection('AudioGear').createIndex({ type: 1 });
    await mongoose.connection.db.collection('AudioGear').createIndex({ 
      "dimensions.length": 1, 
      "dimensions.width": 1, 
      "dimensions.height": 1 
    });
    await mongoose.connection.db.collection('AudioGear').createIndex({ 
      name: "text", 
      description: "text" 
    });
    
    // Create indexes for Case collection
    console.log('Creating indexes for Case collection...');
    await mongoose.connection.db.collection('Case').createIndex({ brand: 1 });
    await mongoose.connection.db.collection('Case').createIndex({ type: 1 });
    await mongoose.connection.db.collection('Case').createIndex({ 
      "dimensions.interior.length": 1, 
      "dimensions.interior.width": 1, 
      "dimensions.interior.height": 1 
    });
    await mongoose.connection.db.collection('Case').createIndex({ 
      waterproof: 1, 
      shockproof: 1, 
      dustproof: 1 
    });
    await mongoose.connection.db.collection('Case').createIndex({ 
      name: "text", 
      description: "text" 
    });
    
    // Create indexes for GearCaseMatch collection
    console.log('Creating indexes for GearCaseMatch collection...');
    await mongoose.connection.db.collection('GearCaseMatch').createIndex({ 
      gearId: 1, 
      caseId: 1 
    }, { unique: true });
    await mongoose.connection.db.collection('GearCaseMatch').createIndex({ 
      gearId: 1, 
      compatibilityScore: -1 
    });
    await mongoose.connection.db.collection('GearCaseMatch').createIndex({ 
      caseId: 1, 
      compatibilityScore: -1 
    });
    
    console.log('All indexes created successfully');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    return true;
  } catch (error) {
    console.error('Error creating indexes:', error);
    return false;
  }
}

// Main function
async function main() {
  // Test MongoDB connection
  const connectionSuccessful = await testMongoDBConnection();
  
  if (connectionSuccessful) {
    // Create indexes
    await createIndexes();
  } else {
    console.error('Failed to connect to MongoDB. Cannot create indexes.');
  }
}

// Run the main function
main().then(() => {
  console.log('Database integration test completed');
}).catch(error => {
  console.error('Fatal error:', error);
});
