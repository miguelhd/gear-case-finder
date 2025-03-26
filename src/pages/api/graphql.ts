// Enhanced GraphQL API implementation with comprehensive debugging and request tracing
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../lib/mongodb';
import { typeDefs } from '../../graphql/schema';
import { resolvers } from '../../graphql/resolvers';
import cors from 'cors';

// Create a request logger for debugging
const logRequest = (req: NextApiRequest) => {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(2, 15);
  
  console.log(`[${timestamp}] [${requestId}] === GraphQL Request ===`);
  console.log(`[${timestamp}] [${requestId}] Method: ${req.method}`);
  console.log(`[${timestamp}] [${requestId}] URL: ${req.url}`);
  console.log(`[${timestamp}] [${requestId}] Headers:`, JSON.stringify(req.headers, null, 2));
  
  if (req.body) {
    try {
      console.log(`[${timestamp}] [${requestId}] Body:`, JSON.stringify(req.body, null, 2));
    } catch (e) {
      console.log(`[${timestamp}] [${requestId}] Body: [Unable to stringify body]`);
    }
  }
  
  return { timestamp, requestId };
};

// Create Apollo Server with @apollo/server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [
    // Plugin for request/response logging
    {
      async requestDidStart(requestContext) {
        const { request } = requestContext;
        const requestId = 'req_' + Math.random().toString(36).substring(2, 15);
        const timestamp = new Date().toISOString();
        
        console.log(`[${timestamp}] [${requestId}] GraphQL operation: ${request.operationName || 'anonymous'}`);
        
        return {
          async didEncounterErrors(ctx) {
            console.error(`[${timestamp}] [${requestId}] GraphQL errors:`, ctx.errors);
          },
          async willSendResponse(ctx) {
            const responseTime = Date.now() - new Date(timestamp).getTime();
            console.log(`[${timestamp}] [${requestId}] Response sent in ${responseTime}ms`);
          },
        };
      },
    },
  ],
});

// Initialize the Apollo Server
// Note: We don't use an async IIFE here as it causes issues in Vercel's serverless environment
let serverStartPromise: Promise<void> | null = null;

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

// Create handler with enhanced logging and CORS support
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Log request details for debugging
  const { timestamp, requestId } = logRequest(req);
  
  // Handle CORS preflight requests explicitly
  if (req.method === 'OPTIONS') {
    console.log(`[${timestamp}] [${requestId}] Handling OPTIONS request (CORS preflight)`);
    
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, apollo-require-preflight, Apollo-Require-Preflight'
    );
    res.status(204).end();
    console.log(`[${timestamp}] [${requestId}] OPTIONS request completed with 204 status`);
    return;
  }
  
  // Ensure Apollo Server is started before handling the request
  try {
    console.log(`[${timestamp}] [${requestId}] Ensuring Apollo Server is started...`);
    await ensureServerStarted();
    console.log(`[${timestamp}] [${requestId}] Apollo Server is ready`);
    
    // Connect to database if needed
    if (!mongoose.connection.readyState) {
      console.log(`[${timestamp}] [${requestId}] Connecting to database...`);
      await connectToDatabase();
      console.log(`[${timestamp}] [${requestId}] Database connection established`);
    }
    
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, apollo-require-preflight, Apollo-Require-Preflight'
    );
    
    // Only allow POST requests for GraphQL operations
    if (req.method !== 'POST') {
      console.error(`[${timestamp}] [${requestId}] Method ${req.method} not allowed for GraphQL endpoint`);
      res.status(405).json({
        name: "ApolloError",
        graphQLErrors: [],
        protocolErrors: [],
        clientErrors: [],
        networkError: {
          name: "ServerError",
          response: {},
          statusCode: 405,
          result: ""
        }
      });
      return;
    }
    
    console.log(`[${timestamp}] [${requestId}] Creating Next.js handler for Apollo Server...`);
    // Use the Next.js handler from @as-integrations/next
    const nextHandler = startServerAndCreateNextHandler(apolloServer, {
      context: async () => {
        return {
          requestId,
          timestamp,
          // Add any additional context here
        };
      },
    });
    
    console.log(`[${timestamp}] [${requestId}] Calling Next.js handler...`);
    // Call the handler
    return nextHandler(req, res);
  } catch (error) {
    console.error(`[${timestamp}] [${requestId}] Error handling request:`, error);
    res.status(500).json({
      name: "ApolloError",
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
      requestId, // Include request ID for tracing
      timestamp
    });
  }
};

export default handler;
