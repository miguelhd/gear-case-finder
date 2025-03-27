/**
 * Comprehensive Database Seeding Script for Gear Case Finder
 * 
 * This script creates and populates the MongoDB database with mock data
 * for testing complete user flows including:
 * - Searching for audio gear
 * - Finding matching cases
 * - Viewing gear and case details
 * - Exploring compatibility matches
 * 
 * Usage: node scripts/seed/seed-db.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

// MongoDB connection URI
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/gear-case-finder";

// Mock data generators
const { generateAudioGear } = require('./generators/audio-gear');
const { generateCases } = require('./generators/cases');
const { generateMatches } = require('./generators/matches');
const { generateUsers } = require('./generators/users');
const { generateContent } = require('./generators/content');
const { generateAnalytics } = require('./generators/analytics');
const { generateAffiliates } = require('./generators/affiliates');

// Configuration
const config = {
  audioGearCount: 50,  // Number of audio gear items to generate
  casesCount: 100,     // Number of cases to generate
  usersCount: 20,      // Number of users to generate
  contentCount: 15,    // Number of content items to generate
  analyticsCount: 30,  // Number of analytics records to generate
  affiliatesCount: 10, // Number of affiliate records to generate
  dropCollections: true // Whether to drop existing collections before seeding
};

/**
 * Main seeding function
 */
async function seedDatabase() {
  console.log('Starting database seeding...');
  console.log(`Configuration: ${JSON.stringify(config, null, 2)}`);
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    console.log(`Connected to MongoDB at ${uri}`);
    
    // Get database reference
    const dbName = uri.split('/').pop().split('?')[0];
    const db = client.db(dbName);
    console.log(`Using database: ${dbName}`);
    
    // Drop existing collections if configured
    if (config.dropCollections) {
      console.log('Dropping existing collections...');
      const collections = ['AudioGear', 'Case', 'GearCaseMatch', 'User', 'Content', 'Analytics', 'Affiliate'];
      
      for (const collectionName of collections) {
        try {
          await db.collection(collectionName).drop();
          console.log(`Dropped collection: ${collectionName}`);
        } catch (error) {
          // Collection might not exist, which is fine
          console.log(`Collection ${collectionName} does not exist or could not be dropped`);
        }
      }
    }
    
    // Generate and insert audio gear data
    console.log(`Generating ${config.audioGearCount} audio gear items...`);
    const audioGearItems = generateAudioGear(config.audioGearCount);
    const audioGearResult = await db.collection('AudioGear').insertMany(audioGearItems);
    console.log(`Inserted ${audioGearResult.insertedCount} audio gear items`);
    
    // Generate and insert case data
    console.log(`Generating ${config.casesCount} cases...`);
    const caseItems = generateCases(config.casesCount);
    const caseResult = await db.collection('Case').insertMany(caseItems);
    console.log(`Inserted ${caseResult.insertedCount} cases`);
    
    // Generate and insert gear-case matches
    console.log('Generating gear-case matches...');
    const matches = await generateMatches(db, audioGearItems, caseItems);
    const matchResult = await db.collection('GearCaseMatch').insertMany(matches);
    console.log(`Inserted ${matchResult.insertedCount} gear-case matches`);
    
    // Generate and insert user data
    console.log(`Generating ${config.usersCount} users...`);
    const users = generateUsers(config.usersCount);
    const userResult = await db.collection('User').insertMany(users);
    console.log(`Inserted ${userResult.insertedCount} users`);
    
    // Generate and insert content data
    console.log(`Generating ${config.contentCount} content items...`);
    const contentItems = generateContent(config.contentCount, audioGearItems, caseItems);
    const contentResult = await db.collection('Content').insertMany(contentItems);
    console.log(`Inserted ${contentResult.insertedCount} content items`);
    
    // Generate and insert analytics data
    console.log(`Generating ${config.analyticsCount} analytics records...`);
    const analyticsRecords = generateAnalytics(config.analyticsCount);
    const analyticsResult = await db.collection('Analytics').insertMany(analyticsRecords);
    console.log(`Inserted ${analyticsResult.insertedCount} analytics records`);
    
    // Generate and insert affiliate data
    console.log(`Generating ${config.affiliatesCount} affiliate records...`);
    const affiliateRecords = generateAffiliates(config.affiliatesCount);
    const affiliateResult = await db.collection('Affiliate').insertMany(affiliateRecords);
    console.log(`Inserted ${affiliateResult.insertedCount} affiliate records`);
    
    // Create indexes for better query performance
    console.log('Creating indexes...');
    
    // AudioGear indexes
    await db.collection('AudioGear').createIndex({ brand: 1 });
    await db.collection('AudioGear').createIndex({ category: 1 });
    await db.collection('AudioGear').createIndex({ type: 1 });
    await db.collection('AudioGear').createIndex({ "dimensions.length": 1, "dimensions.width": 1, "dimensions.height": 1 });
    await db.collection('AudioGear').createIndex({ name: "text", description: "text" });
    
    // Case indexes
    await db.collection('Case').createIndex({ brand: 1 });
    await db.collection('Case').createIndex({ type: 1 });
    await db.collection('Case').createIndex({ "internalDimensions.length": 1, "internalDimensions.width": 1, "internalDimensions.height": 1 });
    await db.collection('Case').createIndex({ waterproof: 1, shockproof: 1, dustproof: 1 });
    await db.collection('Case').createIndex({ name: "text", description: "text" });
    
    // GearCaseMatch indexes
    await db.collection('GearCaseMatch').createIndex({ gearId: 1, caseId: 1 }, { unique: true });
    await db.collection('GearCaseMatch').createIndex({ gearId: 1, compatibilityScore: -1 });
    await db.collection('GearCaseMatch').createIndex({ caseId: 1, compatibilityScore: -1 });
    
    console.log('Database seeding completed successfully');
    
    // Save a summary of the seeded data
    const summary = {
      timestamp: new Date().toISOString(),
      configuration: config,
      results: {
        audioGear: audioGearResult.insertedCount,
        cases: caseResult.insertedCount,
        matches: matchResult.insertedCount,
        users: userResult.insertedCount,
        content: contentResult.insertedCount,
        analytics: analyticsResult.insertedCount,
        affiliates: affiliateResult.insertedCount
      }
    };
    
    await fs.writeFile(
      path.join(__dirname, 'seed-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('Seed summary saved to seed-summary.json');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close the connection
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the seeding function
seedDatabase().catch(console.error);
