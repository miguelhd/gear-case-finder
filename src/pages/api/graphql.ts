// Update GraphQL API handler to use a direct approach without Apollo Server start()
import { ApolloServer } from '@apollo/server';
import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../lib/mongodb';
import { typeDefs } from '../../graphql/schema';
import { resolvers } from '../../graphql/resolvers';
import { withMonitoring } from '../../lib/monitoring';
import { GraphQLError } from 'graphql';
import { parse, validate, execute, specifiedRules } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

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

// Create an executable schema once
const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

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
      errors: [
        {
          message: `Method ${req.method} not allowed for GraphQL endpoint`,
          extensions: {
            code: 'METHOD_NOT_ALLOWED'
          }
        }
      ]
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
    
    // Process the GraphQL request directly without using Apollo Server's start()
    console.log(`[${timestamp}] [${requestId}] Processing GraphQL request directly...`);
    
    // Extract the GraphQL query from the request body
    const { query, variables, operationName } = req.body;
    
    if (!query) {
      throw new Error('No GraphQL query provided');
    }
    
    // Parse the query
    const document = parse(query);
    
    // Validate the query against the schema
    const validationErrors = validate(executableSchema, document, specifiedRules);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }
    
    // Execute the query
    const result = await execute({
      schema: executableSchema,
      document,
      variableValues: variables,
      operationName,
      contextValue: {
        requestId,
        timestamp,
      },
    });
    
    // Log the operation
    console.log(`[${timestamp}] [${requestId}] GraphQL operation: ${operationName || 'anonymous'}`);
    
    // Return the result
    const responseTime = Date.now() - new Date(timestamp).getTime();
    console.log(`[${timestamp}] [${requestId}] Response sent in ${responseTime}ms`);
    
    // Set cache control header
    res.setHeader('Cache-Control', 'no-store');
    
    // Send the response
    return res.status(200).json(result);
  } catch (error) {
    console.error(`[${timestamp}] [${requestId}] Error handling request:`, error);
    
    // Format the error response
    const formattedError = error instanceof GraphQLError
      ? error
      : new GraphQLError(
          error instanceof Error ? error.message : String(error),
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              requestId,
              timestamp
            }
          }
        );
    
    res.status(500).json({
      errors: [formattedError]
    });
  }
};

// Wrap the handler with monitoring middleware
const handler = withMonitoring(baseHandler);

export default handler;
