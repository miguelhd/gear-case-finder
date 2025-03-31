// Simple test script to verify Canopy API integration
const axios = require('axios');

// Canopy API key
const CANOPY_API_KEY = process.env.CANOPY_API_KEY || '5e689e6a-9545-4b31-b4d5-b4a43140f688';

// GraphQL endpoint
const GRAPHQL_ENDPOINT = 'https://graphql.canopyapi.co/';

// Headers for the request
const headers = {
  'Authorization': `Bearer ${CANOPY_API_KEY}`,
  'Content-Type': 'application/json'
};

// GraphQL query to search for desktop synths
const desktopSynthQuery = `
  query amazonProductSearchResults($input: AmazonProductSearchResultsInput!) {
    amazonProductSearchResults(input: $input) {
      results {
        title
        brand
        mainImageUrl
        images {
          hiRes
          large
          medium
          thumb
        }
        rating
        ratingsTotal
        price {
          display
          value
          currency
        }
        dimensions {
          length
          width
          height
          unit
        }
        weight {
          value
          unit
        }
        description
        features
        asin
        categories
      }
    }
  }
`;

// GraphQL query to search for cases
const casesQuery = `
  query amazonProductSearchResults($input: AmazonProductSearchResultsInput!) {
    amazonProductSearchResults(input: $input) {
      results {
        title
        brand
        mainImageUrl
        images {
          hiRes
          large
          medium
          thumb
        }
        rating
        ratingsTotal
        price {
          display
          value
          currency
        }
        dimensions {
          length
          width
          height
          unit
        }
        weight {
          value
          unit
        }
        description
        features
        asin
        categories
      }
    }
  }
`;

// Function to execute a GraphQL query
async function executeQuery(query, variables) {
  try {
    const response = await axios({
      method: 'post',
      url: GRAPHQL_ENDPOINT,
      headers: headers,
      data: {
        query,
        variables
      }
    });
    
    if (response.data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error executing GraphQL query:', error);
    throw error;
  }
}

// Function to search for desktop synths
async function searchDesktopSynths() {
  try {
    console.log('Searching for desktop synths...');
    
    const variables = {
      input: {
        searchTerm: 'desktop synthesizer synth',
        domain: 'US',
        limit: 5 // Limit to 5 for testing
      }
    };
    
    const result = await executeQuery(desktopSynthQuery, variables);
    
    console.log(`Found ${result.amazonProductSearchResults.results.length} desktop synths`);
    
    // Print the first result
    if (result.amazonProductSearchResults.results.length > 0) {
      const firstSynth = result.amazonProductSearchResults.results[0];
      console.log('\nFirst desktop synth:');
      console.log(`Title: ${firstSynth.title}`);
      console.log(`Brand: ${firstSynth.brand}`);
      console.log(`Image URL: ${firstSynth.mainImageUrl}`);
      console.log(`Price: ${firstSynth.price?.display}`);
      console.log(`Rating: ${firstSynth.rating} (${firstSynth.ratingsTotal} reviews)`);
      
      if (firstSynth.dimensions) {
        console.log(`Dimensions: ${firstSynth.dimensions.length}x${firstSynth.dimensions.width}x${firstSynth.dimensions.height} ${firstSynth.dimensions.unit}`);
      }
      
      if (firstSynth.weight) {
        console.log(`Weight: ${firstSynth.weight.value} ${firstSynth.weight.unit}`);
      }
    }
    
    return result.amazonProductSearchResults.results;
  } catch (error) {
    console.error('Error searching for desktop synths:', error);
    throw error;
  }
}

// Function to search for cases
async function searchCases() {
  try {
    console.log('\nSearching for cases...');
    
    const variables = {
      input: {
        searchTerm: 'synthesizer keyboard case protective',
        domain: 'US',
        limit: 5 // Limit to 5 for testing
      }
    };
    
    const result = await executeQuery(casesQuery, variables);
    
    console.log(`Found ${result.amazonProductSearchResults.results.length} cases`);
    
    // Print the first result
    if (result.amazonProductSearchResults.results.length > 0) {
      const firstCase = result.amazonProductSearchResults.results[0];
      console.log('\nFirst case:');
      console.log(`Title: ${firstCase.title}`);
      console.log(`Brand: ${firstCase.brand}`);
      console.log(`Image URL: ${firstCase.mainImageUrl}`);
      console.log(`Price: ${firstCase.price?.display}`);
      console.log(`Rating: ${firstCase.rating} (${firstCase.ratingsTotal} reviews)`);
      
      if (firstCase.dimensions) {
        console.log(`Dimensions: ${firstCase.dimensions.length}x${firstCase.dimensions.width}x${firstCase.dimensions.height} ${firstCase.dimensions.unit}`);
      }
      
      if (firstCase.weight) {
        console.log(`Weight: ${firstCase.weight.value} ${firstCase.weight.unit}`);
      }
    }
    
    return result.amazonProductSearchResults.results;
  } catch (error) {
    console.error('Error searching for cases:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('Testing Canopy API integration...');
    
    // Search for desktop synths
    await searchDesktopSynths();
    
    // Search for cases
    await searchCases();
    
    console.log('\nCanopy API integration test completed successfully!');
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
}

// Run the script
main();
