import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { VioletContent, getAllContentSync, initializeContent, saveContent } from '@/utils/contentStorage';

interface ContentContextValue {
  content: VioletContent;
  isLoading: boolean;
  getField: (field: string, defaultValue: string) => string;
  updateContent: (updates: Partial<VioletContent>) => void;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<VioletContent>(() => {
    // Initialize with cached content
    const cached = getAllContentSync();
    console.log('🎨 ContentProvider initializing with cached content:', cached);
    return cached;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Refresh content from WordPress
  const refreshContent = useCallback(async () => {
    try {
      setIsLoading(true);
      const freshContent = await initializeContent();
      setContent(freshContent);
      console.log('✅ Content refreshed from WordPress:', freshContent);
    } catch (error) {
      console.error('❌ Error refreshing content:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update content locally and persist
  const updateContent = useCallback((updates: Partial<VioletContent>) => {
    setContent(prev => {
      const newContent = { ...prev, ...updates };
      saveContent(newContent);
      return newContent;
    });
  }, []);

  // Get a specific field with default
  const getField = useCallback((field: string, defaultValue: string): string => {
    return content[field] || defaultValue;
  }, [content]);

  // Load content on mount
  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  // Listen for content updates
  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      console.log('📦 Content update event received:', event.detail);
      setContent(event.detail);
    };
    
    const handleContentPersisted = (event: CustomEvent) => {
      console.log('💾 Content persisted event received:', event.detail);
      if (event.detail && event.detail.content) {
        setContent(event.detail.content);
      }
    };
    
    const handleContentSynced = (event: CustomEvent) => {
      console.log('🔄 Content synced from WordPress:', event.detail);
      if (event.detail && event.detail.content) {
        setContent(event.detail.content);
      }
    };

    const handleMessage = (event: MessageEvent) => {
      // Handle messages from WordPress
      if (event.data.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
        console.log('💾 ContentContext: Applying saved changes from WordPress:', event.data.savedChanges);
        
        const updates: VioletContent = {};
        event.data.savedChanges.forEach((change: any) => {
          updates[change.field_name] = change.field_value;
        });
        
        updateContent(updates);
      }
    };

    window.addEventListener('violet-content-updated', handleContentUpdate as EventListener);
    window.addEventListener('violet-content-persisted', handleContentPersisted as EventListener);
    window.addEventListener('violet-content-synced', handleContentSynced as EventListener);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('violet-content-updated', handleContentUpdate as EventListener);
      window.removeEventListener('violet-content-persisted', handleContentPersisted as EventListener);
      window.removeEventListener('violet-content-synced', handleContentSynced as EventListener);
      window.removeEventListener('message', handleMessage);
    };
  }, [updateContent]);

  const value: ContentContextValue = {
    content,
    isLoading,
    getField,
    updateContent,
    refreshContent
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

// Convenience hook for a specific field
export const useContentField = (field: string, defaultValue: string): string => {
  const { getField } = useContent();
  const value = getField(field, defaultValue);
  
  // Debug logging in development
  if (import.meta.env?.DEV) {
    console.log(`📝 useContentField: ${field} = "${value}" (default: "${defaultValue}")`);
  }
  
  return value;
};
