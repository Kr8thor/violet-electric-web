import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWordPressData } from '../../hooks/useWordPressData';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const WordPressNavigation: React.FC = () => {
  const { settings, pages, loading } = useWordPressData();
  const location = useLocation();

  // Common navigation items
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Blog', path: '/blog' },
    ...pages.filter(page => 
      ['about', 'contact', 'services', 'keynotes', 'testimonials'].includes(page.slug.toLowerCase())
    ).map(page => ({
      label: page.title,
      path: `/${page.slug}`
    }))
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              settings?.title || 'Violet Rainwater'
            )}
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="text-sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile menu button - you can expand this later */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
