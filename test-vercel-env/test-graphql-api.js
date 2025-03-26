// This script simulates the Vercel serverless environment for testing the GraphQL API
const http = require('http');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = 3000;
const GRAPHQL_ENDPOINT = '/api/graphql';
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('Starting Vercel-like test environment for GraphQL API');
console.log(`Project root: ${PROJECT_ROOT}`);

// Create a simple HTTP server to simulate Vercel's request handling
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Log request body for debugging
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', async () => {
    if (body) {
      console.log('Request body:', body);
    }
    
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request (CORS preflight)');
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apollo-require-preflight',
        'Access-Control-Max-Age': '86400'
      });
      res.end();
      return;
    }
    
    // Handle GraphQL API requests
    if (pathname === GRAPHQL_ENDPOINT) {
      console.log('Handling GraphQL API request');
      
      // Set CORS headers for all responses
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apollo-require-preflight');
      
      // Only allow POST requests for GraphQL
      if (req.method !== 'POST') {
        console.error(`Method ${req.method} not allowed for GraphQL endpoint`);
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          errors: [{
            message: `Method ${req.method} not allowed for GraphQL endpoint`
          }]
        }));
        return;
      }
      
      try {
        // Parse the GraphQL query
        const data = JSON.parse(body);
        console.log('GraphQL operation:', data.operationName || 'anonymous');
        console.log('GraphQL query:', data.query);
        
        // Simulate a successful response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          data: {
            __typename: 'Query'
          }
        }));
      } catch (error) {
        console.error('Error processing GraphQL request:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          errors: [{
            message: 'Invalid GraphQL request'
          }]
        }));
      }
      return;
    }
    
    // Handle other requests
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`GraphQL endpoint available at http://localhost:${PORT}${GRAPHQL_ENDPOINT}`);
  console.log('');
  console.log('To test with curl:');
  console.log(`curl -X POST http://localhost:${PORT}${GRAPHQL_ENDPOINT} \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -H "apollo-require-preflight: true" \\');
  console.log('  -d \'{"query": "{ __typename }"}\'\n');
  
  console.log('To test with the browser:');
  console.log('1. Open a new terminal and start the Next.js development server:');
  console.log('   cd ' + PROJECT_ROOT + ' && npm run dev\n');
  
  console.log('2. Open http://localhost:3000 in your browser');
  console.log('3. The app will use the Apollo client to connect to the GraphQL API');
  console.log('4. Check browser console for any errors\n');
  
  console.log('Press Ctrl+C to stop the test server');
});
