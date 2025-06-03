import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import parse from 'html-react-parser';
import { useWordPressPosts } from '../../hooks/useWordPressPosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Tag } from 'lucide-react';

export const PostList: React.FC = () => {
  const { loading, error, posts } = useWordPressPosts();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading posts from WordPress...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error loading posts</div>
        <p className="text-sm text-gray-600">
          Check WordPress backend connection
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Latest Posts</h1>
      
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No posts found</p>
          <p className="text-sm text-gray-500">
            Create some content in WordPress to see it here!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                {post.featuredImage && (
                  <div className="md:w-1/3">
                    <img 
                      src={post.featuredImage.node.sourceUrl}
                      alt={post.featuredImage.node.altText}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                )}
                <div className={post.featuredImage ? "md:w-2/3" : "w-full"}>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {parse(post.title)}
                      </Link>
                    </CardTitle>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.date), 'MMMM dd, yyyy')}
                      </div>
                      
                      {post.categories.nodes.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          {post.categories.nodes.map((cat, index) => (
                            <Badge key={cat.slug} variant="secondary" className="text-xs">
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="text-gray-800 mb-4">
                      {parse(post.excerpt)}
                    </div>
                    
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read More →
                    </Link>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
