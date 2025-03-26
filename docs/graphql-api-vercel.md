# GraphQL API Documentation for Vercel Deployment

## Overview
This document provides detailed information about the GraphQL API implementation in the Gear Case Finder application, specifically focusing on the changes made to ensure proper functionality in Vercel's serverless environment.

## Key Components

### 1. Apollo Server Configuration
The GraphQL API is implemented using Apollo Server with specific configurations for Vercel's serverless environment:

```typescript
// Create Apollo Server with @apollo/server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [
    // Plugin for request/response logging
    {
      async requestDidStart(requestContext) {
        // Detailed logging implementation
      }
    }
  ]
});
```

### 2. Server Initialization
Server initialization is handled differently in Vercel's serverless environment compared to traditional server environments:

```typescript
// Function to ensure server is started
const ensureServerStarted = () => {
  if (!serverStartPromise) {
    console.log('[Apollo] Starting Apollo Server...');
    serverStartPromise = apolloServer.start().then(() => {
      console.log('[Apollo] Apollo Server started successfully');
    }).catch(err => {
      console.error('[Apollo] Failed to start Apollo Server:', err);
      // Reset the promise so we can try again
      serverStartPromise = null;
      throw err;
    });
  }
  return serverStartPromise;
};
```

### 3. CORS Configuration
Proper CORS handling is essential for GraphQL operations, especially in Vercel's serverless environment:

```typescript
// Handle CORS preflight requests explicitly
if (req.method === 'OPTIONS') {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, apollo-require-preflight, Apollo-Require-Preflight'
  );
  res.status(204).end();
  return;
}
```

### 4. Request Handling
The API handler is designed to work with Vercel's serverless functions:

```typescript
// Create handler with enhanced logging and CORS support
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Log request details for debugging
  const { timestamp, requestId } = logRequest(req);
  
  // Ensure Apollo Server is started before handling the request
  try {
    await ensureServerStarted();
    
    // Connect to database if needed
    if (!mongoose.connection.readyState) {
      await connectToDatabase();
    }
    
    // Set CORS headers for all responses
    // ...
    
    // Only allow POST requests for GraphQL operations
    if (req.method !== 'POST') {
      res.status(405).json({
        name: "ApolloError",
        // ...
      });
      return;
    }
    
    // Use the Next.js handler from @as-integrations/next
    const nextHandler = startServerAndCreateNextHandler(apolloServer, {
      // ...
    });
    
    // Call the handler
    return nextHandler(req, res);
  } catch (error) {
    // Error handling
  }
};
```

### 5. Apollo Client Configuration
The client-side Apollo configuration is optimized for working with the serverless GraphQL API:

```typescript
// HTTP link with explicit fetch options optimized for Vercel
const httpLink = createHttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
  },
  fetchOptions: {
    method: 'POST',
  },
});
```

## Vercel-Specific Configuration
The `vercel.json` file includes specific configurations for the GraphQL API:

```json
{
  "routes": [
    {
      "src": "/api/graphql",
      "methods": ["POST", "OPTIONS"],
      "headers": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
        "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, apollo-require-preflight, Apollo-Require-Preflight"
      }
    }
  ]
}
```

## Testing and Debugging
A comprehensive testing suite is available in the `test-vercel-env` directory:

- `test-graphql-api.js`: Tests the GraphQL API implementation
- `test-graphql-client.js`: Tests the client-side Apollo configuration
- `test-graphql-vercel.js`: Tests the API in both local and Vercel environments

## Common Issues and Solutions

### 405 Method Not Allowed Error
This error typically occurs when:
1. The Apollo Server is not properly initialized in the serverless environment
2. CORS headers are not correctly configured
3. The client is sending requests with incorrect HTTP methods

Solution:
- Ensure proper server initialization with the `ensureServerStarted` function
- Configure CORS headers for both OPTIONS and POST requests
- Verify that the client is sending POST requests for GraphQL operations

### Debugging Tips
- Use the detailed logging implemented in the GraphQL API handler
- Check the Vercel deployment logs for any errors
- Test the API locally using the provided test scripts before deploying

## Conclusion
The GraphQL API implementation is now optimized for Vercel's serverless environment, with proper error handling, CORS configuration, and detailed logging. This ensures reliable operation of the API in both development and production environments.
