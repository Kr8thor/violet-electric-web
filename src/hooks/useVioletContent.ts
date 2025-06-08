import { useState, useEffect } from 'react';
import { VioletContent, getAllContentSync, initializeContent, getContentMetadata } from '@/utils/contentStorage';

/**
 * Enhanced hook to use WordPress-managed content in React components
 */
export function useVioletContent() {
  const [content, setContent] = useState<VioletContent>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    // Load initial content
    const loadContent = async () => {
      try {
        console.log('🔄 useVioletContent: Loading initial content...');
        
        // Load cached content immediately for fast display
        const cachedContent = getAllContentSync();
        if (Object.keys(cachedContent).length > 0) {
          setContent(cachedContent);
          console.log('📦 useVioletContent: Loaded cached content', cachedContent);
        }
        
        // Then load fresh content from WordPress
        const freshContent = await initializeContent();
        setContent(freshContent);
        
        // Update metadata
        const metadata = getContentMetadata();
        if (metadata) {
          setLastUpdate(metadata.timestamp ? new Date(metadata.timestamp) : null);
          setSource(metadata.source);
        }
        
        console.log('✅ useVioletContent: Content loading complete', freshContent);
      } catch (error) {
        console.error('❌ useVioletContent: Error loading content:', error);
        // Fallback to cached content
        const cachedContent = getAllContentSync();
        setContent(cachedContent);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();

    // Listen for content updates from the storage system
    const handleContentUpdate = (event: CustomEvent) => {
      console.log('🔄 useVioletContent: Content updated via event', event.detail);
      setContent(event.detail);
      setLastUpdate(new Date());
      
      // Update metadata
      const metadata = getContentMetadata();
      if (metadata) {
        setSource(metadata.source);
      }
    };

    // Listen for manual content refresh requests
    const handleContentRefresh = async () => {
      console.log('🔄 useVioletContent: Manual refresh requested');
      setIsLoading(true);
      
      try {
        const freshContent = await initializeContent();
        setContent(freshContent);
        setLastUpdate(new Date());
        
        const metadata = getContentMetadata();
        if (metadata) {
          setSource(metadata.source);
        }
      } catch (error) {
        console.error('❌ useVioletContent: Refresh failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener('violet-content-updated', handleContentUpdate as EventListener);
    window.addEventListener('violet-content-refresh', handleContentRefresh as EventListener);

    return () => {
      window.removeEventListener('violet-content-updated', handleContentUpdate as EventListener);
      window.removeEventListener('violet-content-refresh', handleContentRefresh as EventListener);
    };
  }, []);

  // Function to manually refresh content
  const refreshContent = async () => {
    window.dispatchEvent(new CustomEvent('violet-content-refresh'));
  };

  return { 
    content, 
    isLoading, 
    lastUpdate, 
    source,
    refreshContent 
  };
}

/**
 * Get a specific content field with default value
 * Enhanced with real-time updates
 */
export function useContentField(field: string, defaultValue: string): string {
  const { content } = useVioletContent();
  const [currentValue, setCurrentValue] = useState<string>(defaultValue);

  // Update when content changes
  useEffect(() => {
    const newValue = content[field] || defaultValue;
    if (newValue !== currentValue) {
      setCurrentValue(newValue);
      console.log(`🔄 Field "${field}" updated:`, newValue);
    }
  }, [content, field, defaultValue, currentValue]);

  return currentValue;
}

/**
 * Enhanced hook for specific content fields with metadata
 */
export function useContentFieldEnhanced(field: string, defaultValue: string) {
  const { content, isLoading, lastUpdate, source } = useVioletContent();
  const value = content[field] || defaultValue;
  const hasValue = content[field] !== undefined;
  const isDefault = !hasValue;

  return {
    value,
    hasValue,
    isDefault,
    isLoading,
    lastUpdate,
    source,
    field
  };
}

/**
 * Hook to use multiple content fields at once
 */
export function useContentFields(fields: string[], defaultValues: string[] = []) {
  const { content, isLoading } = useVioletContent();
  
  const values = fields.map((field, index) => 
    content[field] || defaultValues[index] || ''
  );

  return {
    values,
    content,
    isLoading,
    getField: (field: string, defaultValue: string = '') => content[field] || defaultValue
  };
}

/**
 * Debug hook to inspect content state
 */
export function useContentDebug() {
  const { content, isLoading, lastUpdate, source } = useVioletContent();
  const metadata = getContentMetadata();

  return {
    content,
    isLoading,
    lastUpdate,
    source,
    metadata,
    fieldCount: Object.keys(content).length,
    hasContent: Object.keys(content).length > 0,
    cachedContent: getAllContentSync()
  };
}
