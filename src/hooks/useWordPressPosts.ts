import { useQuery, gql } from '@apollo/client';
import { WordPressPost } from '../types/wordpress';

const GET_POSTS = gql`
  query GetPosts($first: Int = 10) {
    posts(first: $first, where: { status: PUBLISH }) {
      nodes {
        id
        title
        content
        excerpt
        slug
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

export const useWordPressPosts = (limit = 10) => {
  const { loading, error, data } = useQuery(GET_POSTS, {
    variables: { first: limit }
  });
  
  return {
    loading,
    error,
    posts: data?.posts?.nodes as WordPressPost[] || []
  };
};
