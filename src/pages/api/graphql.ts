// Update GraphQL API handler to use monitoring middleware
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../lib/mongodb';
import { typeDefs } from '../../graphql/schema';
import { resolvers } from '../../graphql/resolvers';
import { withMonitoring } from '../../lib/monitoring';

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

// Create Apollo Server plugin for logging
const loggingPlugin = {
  async requestDidStart(requestContext: any) {
    const { request } = requestContext;
    const requestId = 'req_' + Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] [${requestId}] GraphQL operation: ${request.operationName || 'anonymous'}`);
    
    return {
      async didEncounterErrors(ctx: any) {
        console.error(`[${timestamp}] [${requestId}] GraphQL errors:`, ctx.errors);
      },
      async willSendResponse(ctx: any) {
        const responseTime = Date.now() - new Date(timestamp).getTime();
        console.log(`[${timestamp}] [${requestId}] Response sent in ${responseTime}ms`);
      },
    };
  },
};

// Create handler with enhanced logging and CORS support
const baseHandler = async (req: NextApiRequest, res: NextApiResponse) => {
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
  
  try {
    // Connect to database if needed - with enhanced error handling
    try {
      if (!mongoose.connection.readyState) {
        console.log(`[${timestamp}] [${requestId}] Connecting to database...`);
        await connectToDatabase();
        console.log(`[${timestamp}] [${requestId}] Database connection established`);
      }
    } catch (dbError) {
      // Log the error but continue processing the request
      console.error(`[${timestamp}] [${requestId}] Database connection error:`, dbError);
      console.log(`[${timestamp}] [${requestId}] Continuing without database connection`);
      // We don't throw here, allowing the GraphQL API to function even without DB
    }
    
    // Create a new Apollo Server instance for each request
    // This avoids the "start() called multiple times" issue in serverless environments
    console.log(`[${timestamp}] [${requestId}] Creating Apollo Server instance...`);
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
      plugins: [loggingPlugin],
    });
    
    // Start the server
    console.log(`[${timestamp}] [${requestId}] Starting Apollo Server...`);
    await server.start();
    console.log(`[${timestamp}] [${requestId}] Apollo Server started successfully`);
    
    // Create a handler for this specific request
    console.log(`[${timestamp}] [${requestId}] Creating Next.js handler...`);
    const handler = startServerAndCreateNextHandler(server, {
      context: async () => ({ requestId, timestamp }),
    });
    
    // Process the request
    console.log(`[${timestamp}] [${requestId}] Processing GraphQL request...`);
    return handler(req, res);
  } catch (error) {
    console.error(`[${timestamp}] [${requestId}] Error handling request:`, error);
    res.status(500).json({
      name: "ApolloError",
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
      requestId,
      timestamp
    });
  }
};

// Wrap the handler with monitoring middleware
const handler = withMonitoring(baseHandler);

export default handler;
