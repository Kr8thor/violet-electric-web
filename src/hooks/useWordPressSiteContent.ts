import { useQuery, gql } from '@apollo/client';

// Simple GraphQL query using standard WordPress features
const GET_SITE_CONTENT = gql`
  query GetSiteContent {
    generalSettings {
      title
      description
    }
    # Get the page with slug "homepage" for hero content
    pageBy(uri: "/homepage/") {
      title
      content
      excerpt
    }
  }
`;

export const useWordPressSiteContent = () => {
  const { loading, error, data } = useQuery(GET_SITE_CONTENT, {
    errorPolicy: 'all'
  });
  
  // Extract hero content from WordPress page content
  const pageContent = data?.pageBy?.content || '';
  const pageExcerpt = data?.pageBy?.excerpt || '';
  
  // Parse hero content from page content or use defaults
  const heroTitle = data?.pageBy?.title || 'Change the Channel.\nChange Your Life.';
  const heroSubtitle = pageExcerpt || 'Transform your potential with neuroscience-backed strategies and heart-centered leadership. Discover the power within you to create extraordinary results.';
  
  return {
    loading,
    error,
    siteTitle: data?.generalSettings?.title || 'Violet Rainwater',
    siteDescription: data?.generalSettings?.description || '',
    heroTitle,
    heroSubtitle,
    heroButtonText: 'Book Violet', // Keep static for now
    heroVideoUrl: 'https://www.youtube.com/watch?v=AG2emkNGwVY' // Keep static for now
  };
};
