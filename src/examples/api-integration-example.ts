/**
 * API Integration Example
 * 
 * This module provides an example of how to use the API integration components.
 */

import ApiFactory from '../lib/api/api-factory';
import { IAudioGear, ICase } from '../lib/models/gear-models';

async function main() {
  try {
    console.log('Initializing API Integration Service...');
    
    // Create an API integration service
    const apiIntegrationService = ApiFactory.createApiIntegrationService({
      enableCaching: true,
      enableBatchProcessing: true
    });
    
    // Initialize the service
    await apiIntegrationService.initialize();
    
    console.log('Searching for synthesizers...');
    
    // Search for synthesizers
    const synthesizers = await apiIntegrationService.searchAudioGear('synthesizer', { limit: 5 });
    
    console.log(`Found ${synthesizers.length} synthesizers:`);
    synthesizers.forEach((synth: IAudioGear, index: number) => {
      console.log(`${index + 1}. ${synth.brand} ${synth.name}`);
      console.log(`   Dimensions: ${synth.dimensions.length}x${synth.dimensions.width}x${synth.dimensions.height} ${synth.dimensions.unit}`);
      console.log(`   Source: ${synth.marketplace}`);
      console.log('');
    });
    
    console.log('Searching for cases...');
    
    // Search for cases
    const cases = await apiIntegrationService.searchCases('synthesizer case', { limit: 5 });
    
    console.log(`Found ${cases.length} cases:`);
    cases.forEach((caseItem: ICase, index: number) => {
      console.log(`${index + 1}. ${caseItem.brand} ${caseItem.name}`);
      console.log(`   Interior Dimensions: ${caseItem.dimensions.interior.length}x${caseItem.dimensions.interior.width}x${caseItem.dimensions.interior.height} ${caseItem.dimensions.interior.unit}`);
      console.log(`   Source: ${caseItem.marketplace}`);
      console.log('');
    });
    
    console.log('Getting cache statistics...');
    
    // Get cache statistics
    const cacheStats = await apiIntegrationService.getCacheStats();
    console.log('Cache Statistics:', cacheStats);
    
    console.log('Example completed successfully!');
  } catch (error) {
    console.error('Error in API integration example:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default main;
