import React from 'react';
import { Link } from 'react-router-dom';
import { useWordPressData } from '../../hooks/useWordPressData';
import { useWordPressPosts } from '../../hooks/useWordPressPosts';
import parse from 'html-react-parser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const WordPressHomepage: React.FC = () => {
  const { settings, loading: settingsLoading } = useWordPressData();
  const { posts, loading: postsLoading } = useWordPressPosts(3);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {settingsLoading ? (
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          ) : (
            <>
              <h1 className="text-5xl font-bold mb-4">
                {settings?.title || 'Welcome to Violet Rainwater'}
              </h1>
              <p className="text-xl mb-8">
                {settings?.description || 'A beautiful WordPress-powered React site'}
              </p>
            </>
          )}
          <Link to="/blog">
            <Button size="lg" variant="secondary">
              Read Our Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Latest Posts Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Latest Posts</h2>
          
          {postsLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : posts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  {post.featuredImage && (
                    <img 
                      src={post.featuredImage.node.sourceUrl}
                      alt={post.featuredImage.node.altText}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {parse(post.title)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-600 mb-4">
                      {parse(post.excerpt)}
                    </div>
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read More →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <p>No posts yet. Create some content in WordPress!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
