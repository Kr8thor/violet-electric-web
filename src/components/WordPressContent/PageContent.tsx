import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import parse from 'html-react-parser';
import { WordPressPage } from '../../types/wordpress';
import { Loader2, AlertCircle } from 'lucide-react';

const GET_PAGE_BY_URI = gql`
  query GetPageByUri($uri: String!) {
    pageBy(uri: $uri) {
      id
      title
      content
      slug
    }
  }
`;

export const PageContent: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const uri = `/${slug}/`;
  
  const { loading, error, data } = useQuery(GET_PAGE_BY_URI, {
    variables: { uri }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading page...</span>
        </div>
      </div>
    );
  }

  if (error || !data?.pageBy) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-gray-600">
            This page doesn't exist or hasn't been created in WordPress yet.
          </p>
        </div>
      </div>
    );
  }

  const page = data.pageBy as WordPressPage;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{parse(page.title)}</h1>
      <div className="prose max-w-none prose-lg">
        {parse(page.content)}
      </div>
    </div>
  );
};
