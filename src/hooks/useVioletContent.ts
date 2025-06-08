import { useState, useEffect } from 'react';
import { VioletContent, getAllContent } from '@/utils/contentStorage';

/**
 * Hook to use WordPress-managed content in React components
 */
export function useVioletContent() {
  const [content, setContent] = useState<VioletContent>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial content
    const loadContent = () => {
      const savedContent = getAllContent();
      setContent(savedContent);
      setIsLoading(false);
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
