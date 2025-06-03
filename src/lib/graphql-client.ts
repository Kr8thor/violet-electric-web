import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Determine GraphQL endpoint based on environment
const getGraphQLEndpoint = () => {
  // Check if running locally (development)
  if (window.location.hostname === 'localhost' || 
      window.location.hostname.includes('192.168') ||
      window.location.hostname.includes('172.') ||
      window.location.hostname.includes('127.0.0.1')) {
    // Local development: connect directly to WordPress backend
    return 'https://wp.violetrainwater.com/graphql';
  }
  
  // Production: use Netlify proxy
  return '/graphql';
};

const httpLink = createHttpLink({
  uri: getGraphQLEndpoint(),
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    },
    query: {
      errorPolicy: 'all'
    }
  }
});

// Debug info (remove in production)
console.log('GraphQL Endpoint:', getGraphQLEndpoint());
