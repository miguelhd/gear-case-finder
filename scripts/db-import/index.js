/**
 * Database Import Script for Gear Case Finder
 * 
 * This script imports data from JSON files into MongoDB collections:
 * 1. Reads JSON files from the data directory
 * 2. Processes and transforms the data to match collection schemas
 * 3. Imports the data into the appropriate collections
 * 4. Handles duplicate detection and data validation
 * 
 * Usage: node scripts/db-import/index.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Import collection import scripts
const importAudioGear = require('./importers/audioGear');
const importCase = require('./importers/case');
const importGearCaseMatch = require('./importers/gearCaseMatch');
const importUser = require('./importers/user');
const importContent = require('./importers/content');
const importAnalytics = require('./importers/analytics');
const importAffiliate = require('./importers/affiliate');

// MongoDB connection URI
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Default data directory
const DATA_DIR = process.env.DATA_DIR || './data';

/**
 * Main import function
 */
async function importData() {
  console.log('Starting database import...');
  
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
    
    // Check if data directory exists
    try {
      await fs.access(DATA_DIR);
    } catch (error) {
      console.log(`Data directory ${DATA_DIR} does not exist. Creating it...`);
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    // Get list of JSON files in data directory
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log('No JSON files found in data directory. Nothing to import.');
      return;
    }
    
    console.log(`Found ${jsonFiles.length} JSON files to process`);
    
    // Process each JSON file
    for (const file of jsonFiles) {
      const filePath = path.join(DATA_DIR, file);
      console.log(`Processing file: ${filePath}`);
      
      // Read and parse JSON file
      const data = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(data);
      
      if (!Array.isArray(jsonData)) {
        console.warn(`Skipping ${filePath}: Not an array of products`);
        continue;
      }
      
      console.log(`Found ${jsonData.length} items in ${filePath}`);
      
      // Categorize items by product type
      const audioGearItems = [];
      const caseItems = [];
      
      for (const item of jsonData) {
        if (item.isCase) {
          caseItems.push(item);
        } else {
          audioGearItems.push(item);
        }
      }
      
      // Import items to appropriate collections
      if (audioGearItems.length > 0) {
        console.log(`Importing ${audioGearItems.length} audio gear items...`);
        const audioGearResult = await importAudioGear(db, audioGearItems);
        console.log(`Imported ${audioGearResult.insertedCount} audio gear items, ${audioGearResult.updatedCount} updated, ${audioGearResult.skippedCount} skipped`);
      }
      
      if (caseItems.length > 0) {
        console.log(`Importing ${caseItems.length} case items...`);
        const caseResult = await importCase(db, caseItems);
        console.log(`Imported ${caseResult.insertedCount} case items, ${caseResult.updatedCount} updated, ${caseResult.skippedCount} skipped`);
      }
      
      // Generate gear-case matches for newly imported items
      if (audioGearItems.length > 0 || caseItems.length > 0) {
        console.log('Generating gear-case matches...');
        const matchResult = await importGearCaseMatch(db, {
          newAudioGear: audioGearItems.length > 0,
          newCases: caseItems.length > 0
        });
        console.log(`Generated ${matchResult.insertedCount} new matches, ${matchResult.updatedCount} updated, ${matchResult.skippedCount} skipped`);
      }
    }
    
    console.log('Database import completed successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  } finally {
    // Close the connection
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the import
importData().catch(console.error);
