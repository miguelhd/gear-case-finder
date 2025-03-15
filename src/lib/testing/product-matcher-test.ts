import { ProductMatcher, MatchingOptions } from '../matching/product-matcher';
import { seedAudioGearDatabase } from '../data/audio-gear-database';
import { IAudioGear, ICase } from '../models/gear-models';
import mongoose from 'mongoose';

/**
 * Test the product matching algorithm with sample data
 */
export async function testProductMatcher(): Promise<void> {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musician-case-finder');
    console.log('Connected to MongoDB');
    
    // Seed the database with audio gear if needed
    await seedAudioGearDatabase();
    console.log('Audio gear database seeded');
    
    // Create a product matcher instance
    const matcher = new ProductMatcher();
    
    // Get a sample gear item to test with
    const AudioGear = mongoose.model<IAudioGear>('AudioGear');
    const sampleGear = await AudioGear.findOne({ name: 'Moog Subsequent 37' });
    
    if (!sampleGear) {
      console.error('Sample gear not found');
      return;
    }
    
    console.log(`Testing matching algorithm with gear: ${sampleGear.name}`);
    console.log(`Dimensions: ${sampleGear.dimensions.length}" x ${sampleGear.dimensions.width}" x ${sampleGear.dimensions.height}"`);
    
    // Define matching options
    const options: MatchingOptions = {
      minCompatibilityScore: 70,
      preferredProtectionLevel: 'high',
      maxPriceUSD: 200,
      preferredFeatures: ['padded', 'waterproof', 'handle'],
      maxResults: 5,
      sortBy: 'compatibilityScore',
      sortDirection: 'desc'
    };
    
    // Find compatible cases
    console.log('Finding compatible cases...');
    const compatibleCases = await matcher.findCompatibleCases(sampleGear, options);
    
    // Log the results
    console.log(`Found ${compatibleCases.length} compatible cases`);
    compatibleCases.forEach((caseItem, index) => {
      console.log(`\nCase #${index + 1}: ${caseItem.name}`);
      console.log(`Compatibility Score: ${caseItem.compatibilityScore}%`);
      console.log(`Internal Dimensions: ${caseItem.internalDimensions.length}" x ${caseItem.internalDimensions.width}" x ${caseItem.internalDimensions.height}"`);
      console.log(`Price: ${caseItem.price} ${caseItem.currency}`);
      console.log(`Protection Level: ${caseItem.protectionLevel}`);
      console.log(`URL: ${caseItem.url}`);
    });
    
    // Test with different options
    console.log('\nTesting with different options (budget cases)...');
    const budgetOptions: MatchingOptions = {
      ...options,
      maxPriceUSD: 100,
      preferredProtectionLevel: 'medium'
    };
    
    const budgetCases = await matcher.findCompatibleCases(sampleGear, budgetOptions);
    console.log(`Found ${budgetCases.length} budget-friendly compatible cases`);
    
    // Test with a different gear item
    const anotherGear = await AudioGear.findOne({ name: 'Arturia MicroFreak' });
    if (anotherGear) {
      console.log(`\nTesting with different gear: ${anotherGear.name}`);
      console.log(`Dimensions: ${anotherGear.dimensions.length}" x ${anotherGear.dimensions.width}" x ${anotherGear.dimensions.height}"`);
      
      const microFreakCases = await matcher.findCompatibleCases(anotherGear, options);
      console.log(`Found ${microFreakCases.length} compatible cases for ${anotherGear.name}`);
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    console.log('\nProduct matcher testing completed successfully');
  } catch (error) {
    console.error('Error testing product matcher:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testProductMatcher()
    .then(() => console.log('Test completed'))
    .catch(error => console.error('Test failed:', error));
}
