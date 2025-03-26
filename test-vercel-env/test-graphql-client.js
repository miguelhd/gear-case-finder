// This script tests the GraphQL API with the same headers and configuration as the Apollo client
const fetch = require('node-fetch');

// Configuration
const GRAPHQL_ENDPOINT = 'http://localhost:3000/api/graphql';
const PRODUCTION_ENDPOINT = 'https://gear-case-finder.vercel.app/api/graphql';

// Test query
const query = `
  query TestQuery {
    __typename
  }
`;

// Headers that match the Apollo client configuration
const headers = {
  'Content-Type': 'application/json',
  'apollo-require-preflight': 'true',
  'Apollo-Require-Preflight': 'true'
};

// Function to test the GraphQL API
async function testGraphQLAPI(endpoint) {
  console.log(`Testing GraphQL API at ${endpoint}`);
  
  try {
    // First, log the OPTIONS request (CORS preflight)
    console.log('\nTesting OPTIONS request (CORS preflight):');
    const optionsResponse = await fetch(endpoint, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, apollo-require-preflight'
      }
    });
    
    console.log(`OPTIONS Status: ${optionsResponse.status}`);
    console.log('OPTIONS Headers:');
    optionsResponse.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    // Now test the actual GraphQL query
    console.log('\nTesting POST request with GraphQL query:');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query })
    });
    
    console.log(`POST Status: ${response.status}`);
    console.log('POST Headers:');
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    const data = await response.text();
    console.log('Response data:');
    console.log(data);
    
    return { success: response.status === 200, status: response.status, data };
  } catch (error) {
    console.error('Error testing GraphQL API:', error);
    return { success: false, error: error.message };
  }
}

// Main function to run the tests
async function runTests() {
  console.log('=== GraphQL API Test Tool ===');
  
  // Test local development server
  console.log('\n=== Testing Local Development Server ===');
  const localResult = await testGraphQLAPI(GRAPHQL_ENDPOINT);
  
  // Offer to test production if local test succeeds
  if (localResult.success) {
    console.log('\nLocal test successful! ✅');
    console.log('\nWould you like to test the production endpoint as well?');
    console.log('To test production, run:');
    console.log('node test-graphql-client.js production');
  } else {
    console.log('\nLocal test failed! ❌');
    console.log('Please fix the local API before deploying to production.');
  }
  
  // Test production if requested
  if (process.argv.includes('production')) {
    console.log('\n=== Testing Production Server ===');
    const productionResult = await testGraphQLAPI(PRODUCTION_ENDPOINT);
    
    if (productionResult.success) {
      console.log('\nProduction test successful! ✅');
    } else {
      console.log('\nProduction test failed! ❌');
      console.log('The issue only occurs in production, not locally.');
    }
  }
}

// Run the tests
runTests();
