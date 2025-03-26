// Test script for verifying GraphQL API in Vercel environment
const fetch = require('node-fetch');

// Configuration
const LOCAL_ENDPOINT = 'http://localhost:3000/api/graphql';
const PRODUCTION_ENDPOINT = 'https://gear-case-finder.vercel.app/api/graphql';

// Simple test query
const query = `
  query TestQuery {
    __typename
  }
`;

// Function to test the GraphQL API with detailed logging
async function testGraphQLAPI(endpoint, options = {}) {
  console.log(`\n=== Testing GraphQL API at ${endpoint} ===`);
  
  try {
    // Test OPTIONS request (CORS preflight)
    console.log('\n1. Testing OPTIONS request (CORS preflight):');
    const optionsResponse = await fetch(endpoint, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`Status: ${optionsResponse.status}`);
    console.log('Response Headers:');
    optionsResponse.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    // Test POST request with GraphQL query
    console.log('\n2. Testing POST request with GraphQL query:');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Response Headers:');
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    const responseText = await response.text();
    console.log('Response Body:');
    try {
      const data = JSON.parse(responseText);
      console.log(JSON.stringify(data, null, 2));
      return { success: response.status === 200, status: response.status, data };
    } catch (e) {
      console.log(responseText);
      return { success: false, status: response.status, error: 'Invalid JSON response' };
    }
  } catch (error) {
    console.error('Error testing GraphQL API:', error);
    return { success: false, error: error.message };
  }
}

// Instructions for running the test
console.log('=== GraphQL API Test Tool ===');
console.log('This script tests the GraphQL API in both local and production environments.');
console.log('It helps diagnose 405 Method Not Allowed errors by checking CORS and request handling.');
console.log('\nUsage:');
console.log('1. To test local environment:');
console.log('   node test-graphql-vercel.js local');
console.log('2. To test production environment:');
console.log('   node test-graphql-vercel.js production');
console.log('3. To test both environments:');
console.log('   node test-graphql-vercel.js both');

// Run tests based on command line arguments
const args = process.argv.slice(2);
const testTarget = args[0] || 'both';

(async () => {
  if (testTarget === 'local' || testTarget === 'both') {
    await testGraphQLAPI(LOCAL_ENDPOINT);
  }
  
  if (testTarget === 'production' || testTarget === 'both') {
    await testGraphQLAPI(PRODUCTION_ENDPOINT);
  }
  
  console.log('\n=== Test Summary ===');
  console.log('If you see 405 Method Not Allowed errors in production but not locally,');
  console.log('it indicates a mismatch between your local environment and Vercel.');
  console.log('\nPossible solutions:');
  console.log('1. Ensure vercel.json has proper routes configuration for /api/graphql');
  console.log('2. Check that Apollo Server is properly initialized in the serverless environment');
  console.log('3. Verify CORS headers are correctly set for both OPTIONS and POST requests');
  console.log('4. Remove apollo-require-preflight headers from the Apollo client');
})();
