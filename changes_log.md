# Changes Log - March 26, 2025

## GraphQL API 405 Error Fix

### Issue
- GraphQL API endpoint was returning 405 Method Not Allowed errors
- Error message: `"networkError": { "name": "ServerError", "response": {}, "statusCode": 405, "result": "" }`
- Users were unable to fetch data through the GraphQL API

### Root Cause
- Mismatch between imports and implementation in the GraphQL API handler
- The code was importing `startServerAndCreateNextHandler` from `@as-integrations/next` (newer Apollo Server integration)
- But still using `apolloServer.createHandler` from `apollo-server-micro` (older Apollo Server integration)
- Missing `micro` dependency required by `apollo-server-micro`
- Top-level await syntax error due to TypeScript target set to ES2015

### Fix Implemented
1. Updated imports to use `ApolloServer` from `@apollo/server` instead of `apollo-server-micro`
2. Removed deprecated imports:
   ```typescript
   // Removed
   import { ApolloServer } from 'apollo-server-micro';
   import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
   import Cors from 'micro-cors';
   ```

3. Removed micro-cors configuration and replaced with direct CORS headers in the handler
4. Updated Apollo Server creation to use the newer API:
   ```typescript
   // Create Apollo Server with @apollo/server
   const apolloServer = new ApolloServer({
     typeDefs,
     resolvers,
     introspection: true,
   });
   ```

5. Implemented proper server initialization with async IIFE:
   ```typescript
   // Initialize Apollo Server
   (async () => {
     await apolloServer.start();
   })();
   ```

6. Updated handler implementation to use `startServerAndCreateNextHandler`:
   ```typescript
   // Create handler with enhanced logging and CORS support
   const handler = startServerAndCreateNextHandler(apolloServer, {
     context: async (req, res) => {
       // Add logging for debugging
       console.log(`[DEBUG] GraphQL API request: ${req.method} ${req.url}`);
       
       // Add CORS headers to all responses
       res.setHeader('Access-Control-Allow-Origin', '*');
       res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
       res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
       
       // Return context object with database connection and services
       return {
         req,
         res,
         db: mongoose.connection,
         productMatcher,
         recommendationEngine,
         feedbackManager
       };
     }
   });
   ```

7. Updated TypeScript configuration to support ES2017 features:
   ```json
   "compilerOptions": {
     "target": "es2017",
     // other options...
   }
   ```

### Verification
- Tested locally with curl command:
  ```
  curl -X POST http://localhost:3002/api/graphql -H "Content-Type: application/json" -d '{"query": "{ __typename }"}'
  ```
- Received successful response: `{"data":{"__typename":"Query"}}`
- All changes committed and pushed to the repository

### Files Modified
1. `/src/pages/api/graphql.ts` - Updated GraphQL API implementation
2. `/tsconfig.json` - Updated TypeScript target to ES2017
3. `/PROGRESS.md` - Updated with details about the fix
