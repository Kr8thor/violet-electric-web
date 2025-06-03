import { useQuery, gql } from '@apollo/client';
import { WordPressSettings, WordPressPage } from '../types/wordpress';

const GET_SITE_DATA = gql`
  query GetSiteData {
    generalSettings {
      title
      description
      url
    }
    pages(first: 20) {
      nodes {
        id
        title
        content
        slug
        uri
      }
    }
  }
`;

export const useWordPressData = () => {
  const { loading, error, data } = useQuery(GET_SITE_DATA);
  
  return {
    loading,
    error,
    settings: data?.generalSettings as WordPressSettings,
    pages: data?.pages?.nodes as WordPressPage[] || []
  };
};
