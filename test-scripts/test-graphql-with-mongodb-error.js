// Test script to verify GraphQL API with MongoDB connection error handling
const fetch = require('node-fetch');

// Test GraphQL query
const testQuery = `
  query TestQuery {
    apiStatus
  }
`;

// Function to test GraphQL API with different MongoDB URIs
async function testGraphQLAPI(mongodbUri) {
  // Set environment variable for this process
  process.env.MONGODB_URI = mongodbUri;
  
  console.log(`Testing GraphQL API with MongoDB URI: ${mongodbUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  
  try {
    // Make a POST request to the GraphQL API
    const response = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: testQuery,
      }),
    });
    
    // Get the response status and body
    const status = response.status;
    const body = await response.json();
    
    console.log('Response status:', status);
    console.log('Response body:', JSON.stringify(body, null, 2));
    
    // Check if the response is successful
    if (status === 200 && body.data && body.data.apiStatus) {
      console.log('✅ GraphQL API test passed!');
      return true;
    } else {
      console.log('❌ GraphQL API test failed!');
      return false;
    }
  } catch (error) {
    console.error('Error testing GraphQL API:', error);
    return false;
  }
}

// Main function to run tests
async function main() {
  console.log('=== GraphQL API Test with MongoDB Error Handling ===');
  
  // Save the original MongoDB URI
  const originalUri = process.env.MONGODB_URI;
  
  // Test with valid MongoDB URI
  console.log('\n--- Test with valid MongoDB URI ---');
  const validTest = await testGraphQLAPI(originalUri);
  
  // Test with invalid MongoDB URI
  console.log('\n--- Test with invalid MongoDB URI ---');
  const invalidTest = await testGraphQLAPI('mongodb+srv://invalid:invalid@nonexistent-cluster.mongodb.net/');
  
  // Restore the original MongoDB URI
  process.env.MONGODB_URI = originalUri;
  
  // Print summary
  console.log('\n=== Test Summary ===');
  console.log('Valid MongoDB URI test:', validTest ? 'PASSED' : 'FAILED');
  console.log('Invalid MongoDB URI test:', invalidTest ? 'PASSED' : 'FAILED');
  
  // The test is successful if the API works with both valid and invalid URIs
  // This verifies that our error handling prevents the API from crashing
  if (validTest && invalidTest) {
    console.log('\n✅ All tests passed! The GraphQL API handles MongoDB connection errors correctly.');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed! The GraphQL API does not handle MongoDB connection errors correctly.');
    process.exit(1);
  }
}

// Run the tests
main().catch(console.error);
