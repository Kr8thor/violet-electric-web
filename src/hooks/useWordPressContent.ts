// File: src/hooks/useWordPressContent.ts
// This hook loads content from WordPress on app startup

import { useState, useEffect } from 'react';

interface WordPressContent {
  [key: string]: string;
}

export function useWordPressContent() {
  const [content, setContent] = useState<WordPressContent>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWordPressContent();
  }, []);

  const loadWordPressContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, check localStorage for immediate content
      const cachedContent = localStorage.getItem('violet-wordpress-content');
      if (cachedContent) {
        try {
          const parsedContent = JSON.parse(cachedContent);
          setContent(parsedContent);
          console.log('⚡ Quick load from cache:', Object.keys(parsedContent).length, 'fields');
          // Set loading to false immediately if we have cached content
          setLoading(false);
        } catch (parseError) {
          console.log('⚠️ Cache parse error, fetching fresh content');
        }
      }

      // Then fetch fresh content in background with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      try {
        const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }

        const wordpressContent = await response.json();
        
        // Update with fresh content
        setContent(wordpressContent);
        localStorage.setItem('violet-wordpress-content', JSON.stringify(wordpressContent));
        
        console.log('✅ Fresh WordPress content loaded:', Object.keys(wordpressContent).length, 'fields');
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.log('⏰ WordPress fetch timeout - using cached content');
        } else {
          console.error('❌ Failed to load fresh WordPress content:', fetchError);
          setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
        }
        
        // If no cached content was loaded, try one more time with localStorage
        if (Object.keys(content).length === 0 && cachedContent) {
          try {
            const parsedContent = JSON.parse(cachedContent);
            setContent(parsedContent);
            console.log('📦 Using fallback content from localStorage');
          } catch (parseError) {
            console.error('❌ Failed to parse fallback content:', parseError);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Content loading error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getContent = (field: string, defaultValue: string = '') => {
    return content[field] || defaultValue;
  };

  const refreshContent = () => {
    loadWordPressContent();
  };

  return {
    content,
    loading,
    error,
    getContent,
    refreshContent
  };
}