import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// WordPress GraphQL endpoint
const httpLink = createHttpLink({
  uri: 'https://wp.violetrainwater.com/graphql',
});

// Auth link for potential authentication
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      // Add any authentication headers if needed
    }
  };
});

// Apollo Client configuration
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Export as 'client' for compatibility
export const client = apolloClient;

// Export ApolloProvider for convenience
export { ApolloProvider };

export default apolloClient;
