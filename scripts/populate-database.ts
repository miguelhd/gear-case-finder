/**
 * Database Population Script
 * 
 * This script populates the MongoDB database with real data from the Canopy API.
 * It fetches 25 desktop synths and 25 cases, ensuring images are included.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ApiFactory } from '../src/lib/api/api-factory';
import { AudioGear, Case } from '../src/lib/models/gear-models';

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;

// Create API manager
const apiManager = ApiFactory.createApiManager({
  canopyApiKey: process.env.CANOPY_API_KEY || '5e689e6a-9545-4b31-b4d5-b4a43140f688',
  enableCaching: true
});

/**
 * Connect to MongoDB
 */
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

/**
 * Fetch and store desktop synths
 */
async function fetchAndStoreDesktopSynths() {
  try {
    console.log('Fetching desktop synths from Canopy API...');
    
    // Search for desktop synths
    const searchResults = await apiManager.searchAudioGear('desktop synthesizer synth', { limit: 25 });
    
    console.log(`Found ${searchResults.length} desktop synths`);
    
    // Filter out items without images
    const filteredResults = searchResults.filter((item: any) => 
      item.imageUrl || (item.imageUrls && item.imageUrls.length > 0)
    );
    
    console.log(`${filteredResults.length} desktop synths have images`);
    
    // Store each item in the database
    let savedCount = 0;
    for (const item of filteredResults) {
      // Check if this item already exists in the database
      const existingItem = await AudioGear.findOne({ 
        name: item.name,
        brand: item.brand
      });
      
      if (existingItem) {
        console.log(`Desktop synth already exists: ${item.name}`);
        continue;
      }
      
      // Create a new AudioGear document
      const audioGear = new AudioGear({
        name: item.name,
        brand: item.brand,
        category: item.category || 'synthesizer',
        type: item.type || 'desktop synth',
        dimensions: {
          length: item.dimensions?.length || 0,
          width: item.dimensions?.width || 0,
          height: item.dimensions?.height || 0,
          unit: item.dimensions?.unit || 'in'
        },
        weight: {
          value: item.weight?.value || 0,
          unit: item.weight?.unit || 'lb'
        },
        imageUrl: item.imageUrl || (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : ''),
        productUrl: item.productUrl || item.url || '',
        description: item.description || '',
        marketplace: item.marketplace || 'canopy',
        price: item.price || 0,
        currency: item.currency || 'USD'
      });
      
      // Save to database
      await audioGear.save();
      savedCount++;
      console.log(`Saved desktop synth: ${item.name}`);
    }
    
    console.log(`Successfully saved ${savedCount} desktop synths to the database`);
    return savedCount;
  } catch (error) {
    console.error('Error fetching and storing desktop synths:', error);
    throw error;
  }
}

/**
 * Fetch and store cases
 */
async function fetchAndStoreCases() {
  try {
    console.log('Fetching cases from Canopy API...');
    
    // Search for cases
    const searchResults = await apiManager.searchCases('synthesizer keyboard case protective', { limit: 25 });
    
    console.log(`Found ${searchResults.length} cases`);
    
    // Filter out items without images
    const filteredResults = searchResults.filter((item: any) => 
      item.imageUrl || (item.imageUrls && item.imageUrls.length > 0)
    );
    
    console.log(`${filteredResults.length} cases have images`);
    
    // Store each item in the database
    let savedCount = 0;
    for (const item of filteredResults) {
      // Check if this item already exists in the database
      const existingItem = await Case.findOne({ 
        name: item.name,
        brand: item.brand
      });
      
      if (existingItem) {
        console.log(`Case already exists: ${item.name}`);
        continue;
      }
      
      // Create a new Case document
      const caseItem = new Case({
        name: item.name,
        brand: item.brand,
        type: item.type || 'case',
        dimensions: {
          interior: {
            length: item.dimensions?.interior?.length || 0,
            width: item.dimensions?.interior?.width || 0,
            height: item.dimensions?.interior?.height || 0,
            unit: item.dimensions?.interior?.unit || 'in'
          },
          exterior: item.dimensions?.exterior || {
            length: 0,
            width: 0,
            height: 0,
            unit: 'in'
          }
        },
        internalDimensions: {
          length: item.dimensions?.interior?.length || 0,
          width: item.dimensions?.interior?.width || 0,
          height: item.dimensions?.interior?.height || 0,
          unit: item.dimensions?.interior?.unit || 'in'
        },
        externalDimensions: item.dimensions?.exterior || {
          length: 0,
          width: 0,
          height: 0,
          unit: 'in'
        },
        weight: item.weight || {
          value: 0,
          unit: 'lb'
        },
        features: item.features || [],
        price: item.price || 0,
        currency: item.currency || 'USD',
        rating: item.rating || 0,
        reviewCount: item.reviewCount || 0,
        imageUrl: item.imageUrl || (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : ''),
        productUrl: item.productUrl || item.url || '',
        description: item.description || '',
        protectionLevel: item.protectionLevel || 'medium',
        waterproof: item.waterproof || false,
        shockproof: item.shockproof || false,
        hasPadding: item.hasPadding || true,
        hasCompartments: item.hasCompartments || false,
        hasHandle: item.hasHandle || false,
        hasWheels: item.hasWheels || false,
        hasLock: item.hasLock || false,
        material: item.material || '',
        color: item.color || '',
        marketplace: item.marketplace || 'canopy'
      });
      
      // Save to database
      await caseItem.save();
      savedCount++;
      console.log(`Saved case: ${item.name}`);
    }
    
    console.log(`Successfully saved ${savedCount} cases to the database`);
    return savedCount;
  } catch (error) {
    console.error('Error fetching and storing cases:', error);
    throw error;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Initialize API manager
    await apiManager.initialize();
    
    // Fetch and store desktop synths
    const synthCount = await fetchAndStoreDesktopSynths();
    
    // Fetch and store cases
    const caseCount = await fetchAndStoreCases();
    
    console.log(`Database population complete. Added ${synthCount} desktop synths and ${caseCount} cases.`);
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
}

// Run the script
main();
