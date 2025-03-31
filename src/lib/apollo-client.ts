import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { from } from '@apollo/client';

// Error handling link with enhanced logging
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    // Log additional details for debugging
    if ('statusCode' in networkError) {
      console.error(`Status code: ${networkError.statusCode}`);
    }
    if ('response' in networkError) {
      console.error(`Response: ${JSON.stringify(networkError.response)}`);
    }
  }
});

// HTTP link with explicit fetch options optimized for Vercel
const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === 'production' 
    ? 'https://gear-case-finder.vercel.app/api/graphql' 
    : '/api/graphql',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
  },
  fetchOptions: {
    method: 'POST',
  },
});

// Combine links
const link = from([errorLink, httpLink]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only', // Keep as 'network-only' to ensure fresh data
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only', // Keep as 'network-only' to ensure fresh data
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
