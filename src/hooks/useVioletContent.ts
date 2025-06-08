import { useState, useEffect } from 'react';
import { VioletContent, getAllContentSync, initializeContent } from '@/utils/contentStorage';

/**
 * Hook to use WordPress-managed content in React components
 */
export function useVioletContent() {
  const [content, setContent] = useState<VioletContent>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial content from WordPress
    const loadContent = async () => {
      try {
        // First load cached content immediately
        const cachedContent = getAllContentSync();
        setContent(cachedContent);
        
        // Then fetch fresh content from WordPress
        const freshContent = await initializeContent();
        setContent(freshContent);
        
        console.log('✅ Content loaded from WordPress:', freshContent);
      } catch (error) {
        console.error('❌ Error loading content:', error);
        // Fallback to cached content
        const cachedContent = getAllContentSync();
        setContent(cachedContent);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();

    // Listen for content updates
    const handleContentUpdate = (event: CustomEvent) => {
      setContent(event.detail);
    };

    window.addEventListener('violet-content-updated', handleContentUpdate as EventListener);

    return () => {
      window.removeEventListener('violet-content-updated', handleContentUpdate as EventListener);
    };
  }, []);

  return { content, isLoading };
}

/**
 * Get a specific content field with default value
 */
export function useContentField(field: string, defaultValue: string): string {
  const { content } = useVioletContent();
  return content[field] || defaultValue;
}
