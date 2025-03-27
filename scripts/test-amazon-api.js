/**
 * Script to test the Amazon Product Advertising API integration
 * 
 * This script demonstrates how to use the Amazon API Service to search for products
 * and store them in MongoDB.
 */

// Import required modules
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// Load environment variables
dotenv.config();

// Check for required environment variables
const requiredEnvVars = [
  'AMAZON_ACCESS_KEY',
  'AMAZON_SECRET_KEY',
  'AMAZON_PARTNER_TAG',
  'AMAZON_REGION',
  'MONGODB_URI'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please create a .env file with these variables or set them in your environment.');
  process.exit(1);
}

// Import the Amazon API Service
// Note: We're requiring it dynamically to ensure environment variables are loaded first
const AmazonApiService = require('../src/lib/api/amazon-api-service').default;

// Create an instance of the Amazon API Service
const amazonApiService = new AmazonApiService({
  accessKey: process.env.AMAZON_ACCESS_KEY,
  secretKey: process.env.AMAZON_SECRET_KEY,
  partnerTag: process.env.AMAZON_PARTNER_TAG,
  region: process.env.AMAZON_REGION
});

// Function to test searching for audio gear
async function testSearchAudioGear() {
  try {
    console.log('Testing search for audio gear...');
    const keywords = 'synthesizer keyboard';
    const results = await amazonApiService.searchAndStoreAudioGear(keywords, 5);
    
    console.log(`Found ${results.length} audio gear items for keywords: ${keywords}`);
    console.log('Sample item:', JSON.stringify(results[0], null, 2));
    
    return results;
  } catch (error) {
    console.error('Error testing search for audio gear:', error);
    throw error;
  }
}

// Function to test searching for cases
async function testSearchCases() {
  try {
    console.log('Testing search for cases...');
    const keywords = 'keyboard case';
    const results = await amazonApiService.searchAndStoreCases(keywords, 5);
    
    console.log(`Found ${results.length} case items for keywords: ${keywords}`);
    console.log('Sample item:', JSON.stringify(results[0], null, 2));
    
    return results;
  } catch (error) {
    console.error('Error testing search for cases:', error);
    throw error;
  }
}

// Function to verify MongoDB storage
async function verifyMongoDBStorage() {
  try {
    console.log('Verifying MongoDB storage...');
    
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    // Check AudioGear collection
    const audioGearCount = await db.collection('AudioGear').countDocuments();
    console.log(`AudioGear collection has ${audioGearCount} documents`);
    
    // Check Case collection
    const caseCount = await db.collection('Case').countDocuments();
    console.log(`Case collection has ${caseCount} documents`);
    
    // Close the connection
    await client.close();
    
    return { audioGearCount, caseCount };
  } catch (error) {
    console.error('Error verifying MongoDB storage:', error);
    throw error;
  }
}

// Main function to run all tests
async function runTests() {
  try {
    console.log('Initializing Amazon API Service...');
    await amazonApiService.initialize();
    
    // Test searching for audio gear
    await testSearchAudioGear();
    
    // Test searching for cases
    await testSearchCases();
    
    // Verify MongoDB storage
    await verifyMongoDBStorage();
    
    console.log('All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();
