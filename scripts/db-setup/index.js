/**
 * Database Setup Script for Gear Case Finder
 * 
 * This script initializes the MongoDB database structure by:
 * 1. Creating all required collections
 * 2. Setting up indexes for optimized queries
 * 3. Validating collection schemas
 * 
 * Usage: node scripts/db-setup/index.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Import collection setup scripts
const setupAudioGearCollection = require('./collections/audioGear');
const setupCaseCollection = require('./collections/case');
const setupGearCaseMatchCollection = require('./collections/gearCaseMatch');
const setupUserCollection = require('./collections/user');
const setupContentCollection = require('./collections/content');
const setupAnalyticsCollection = require('./collections/analytics');
const setupAffiliateCollection = require('./collections/affiliate');

// MongoDB connection URI
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function setupDatabase() {
  console.log('Starting database setup...');
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    // Get database reference
    const dbName = uri.split('/').pop().split('?')[0];
    const db = client.db(dbName);
    console.log(`Using database: ${dbName}`);
    
    // Setup collections
    await setupAudioGearCollection(db);
    await setupCaseCollection(db);
    await setupGearCaseMatchCollection(db);
    await setupUserCollection(db);
    await setupContentCollection(db);
    await setupAnalyticsCollection(db);
    await setupAffiliateCollection(db);
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    // Close the connection
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the setup
setupDatabase().catch(console.error);
