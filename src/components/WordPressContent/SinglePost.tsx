import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { format } from 'date-fns';
import parse from 'html-react-parser';
import { WordPressPost } from '../../types/wordpress';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: String!) {
    postBy(slug: $slug) {
      id
      title
      content
      date
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
`;

export const SinglePost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { loading, error, data } = useQuery(GET_POST_BY_SLUG, {
    variables: { slug }
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error || !data?.postBy) return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
      <Link to="/blog"><Button><ArrowLeft className="h-4 w-4 mr-2" />Back to Blog</Button></Link>
    </div>
  );

  const post = data.postBy as WordPressPost;
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/blog" className="inline-block mb-6">
        <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back to Blog</Button>
      </Link>
      
      {post.featuredImage && (
        <img 
          src={post.featuredImage.node.sourceUrl}
          alt={post.featuredImage.node.altText}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}
      
      <h1 className="text-4xl font-bold mb-4">{parse(post.title)}</h1>
      <p className="text-gray-600 mb-8">{format(new Date(post.date), 'MMMM dd, yyyy')}</p>
      <div className="prose max-w-none">{parse(post.content)}</div>
    </div>
  );
};
