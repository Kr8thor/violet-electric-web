import React, { createContext, useContext, useEffect, useState } from "react";
import { contentManager, type WordPressContent } from "../utils/contentPersistenceFix";

/**
 * 🎯 ENHANCED WORDPRESS CONTENT PROVIDER
 * Fixes content persistence issues and enables universal editing
 */

export interface VioletContentMap {
  hero_title?: string;
  hero_subtitle?: string;
  hero_subtitle_line2?: string;
  hero_cta?: string;
  hero_cta_secondary?: string;
  contact_email?: string;
  contact_phone?: string;
  nav_about?: string;
  nav_keynotes?: string;
  nav_testimonials?: string;
  nav_contact?: string;
  auto_rebuild?: string;
  content_initialized?: string;
  footer_text?: string;
  generic_text?: string;
  keynote_setup_complete?: string;
  [key: string]: string | undefined;
}

interface ContentContextType { 
  data: VioletContentMap | null; 
  getField: (fieldId: string, defaultValue?: string) => string;
  updateField: (fieldId: string, value: string) => void;
  saveChanges: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
}

const VioletContentContext = createContext<ContentContextType>({ 
  data: null, 
  getField: () => '',
  updateField: () => {},
  saveChanges: async () => false,
  loading: true,
  error: null,
  refreshContent: async () => {}
});

export const VioletContentProvider: React.FC<React.PropsWithChildren<{ apiBase?: string }>> = ({ 
  apiBase = "", 
  children 
}) => {
  const [data, setData] = useState<VioletContentMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize content on mount
  useEffect(() => {
    initializeContent();
  }, [apiBase]);

  // Listen for content changes from WordPress
  useEffect(() => {
    const handleContentUpdate = () => {
      const allContent = contentManager.getAllContent();
      setData(allContent);
      setError(null);
    };

    // Set up content change listener
    const unsubscribeMap = new Map<string, () => void>();
    
    // Listen to key fields for changes
    const keyFields = [
      'hero_title', 'hero_subtitle', 'hero_subtitle_line2', 'hero_cta', 'hero_cta_secondary',
      'contact_email', 'contact_phone', 'nav_about', 'nav_keynotes', 'nav_testimonials', 
      'nav_contact', 'footer_text', 'generic_text'
    ];

    keyFields.forEach(field => {
      const unsubscribe = contentManager.subscribeToField(field, () => {
        handleContentUpdate();
      });
      unsubscribeMap.set(field, unsubscribe);
    });

    // Cleanup
    return () => {
      unsubscribeMap.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Initialize content loading
  const initializeContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌐 VioletContentProvider: Loading WordPress content...');
      
      const content = await contentManager.loadContentFromWordPress();
      setData(content);
      
      console.log('✅ VioletContentProvider: Content loaded successfully');
      
    } catch (fetchError) {
      console.error('❌ VioletContentProvider: Content loading failed:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
      
      // Try to use cached content
      const allContent = contentManager.getAllContent();
      if (Object.keys(allContent).length > 0) {
        console.log('💾 VioletContentProvider: Using cached content');
        setData(allContent);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get field value
  const getField = (fieldId: string, defaultValue: string = ''): string => {
    return contentManager.getField(fieldId, defaultValue);
  };

  // Update field value
  const updateField = (fieldId: string, value: string): void => {
    contentManager.updateField(fieldId, value);
    // Trigger re-render by updating local data
    setData(prev => ({ ...prev, [fieldId]: value }));
  };

  // Save all changes to WordPress
  const saveChanges = async (): Promise<boolean> => {
    try {
      const success = await contentManager.saveToWordPress();
      if (success) {
        console.log('✅ VioletContentProvider: Changes saved successfully');
      }
      return success;
    } catch (error) {
      console.error('❌ VioletContentProvider: Save failed:', error);
      return false;
    }
  };

  // Refresh content from WordPress
  const refreshContent = async (): Promise<void> => {
    await initializeContent();
  };

  // Handle WordPress admin messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'violet-refresh-content') {
        console.log('🔄 WordPress requesting content refresh');
        refreshContent();
      }
      
      if (event.data?.type === 'violet-diagnostic-request') {
        console.log('🔍 Diagnostic request received');
        
        // Send comprehensive diagnostic response
        if (event.source && event.source !== window) {
          (event.source as Window).postMessage({
            type: 'violet-diagnostic-response',
            testId: event.data.testId,
            providerLoaded: true,
            contentLoaded: !!data,
            loading: loading,
            error: error,
            currentContent: data,
            allContent: contentManager.getAllContent(),
            pendingChanges: Object.fromEntries(contentManager.getPendingChanges()),
            cacheStatus: !!localStorage.getItem('violetContentCache'),
            apiBase: apiBase,
            timestamp: new Date().toISOString()
          }, '*');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [data, loading, error, apiBase]);

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luminous-300 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading content from WordPress...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to wp.violetrainwater.com</p>
        </div>
      </div>
    );
  }

  // Error state (only if no cached data available)
  if (!data && error) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">WordPress Connection Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={refreshContent}
              className="px-4 py-2 bg-luminous-500 text-white rounded hover:bg-luminous-600 mr-2"
            >
              Retry Connection
            </button>
            <button 
              onClick={() => {
                setError(null);
                setData({});
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Continue Offline
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VioletContentContext.Provider value={{ 
      data, 
      getField, 
      updateField, 
      saveChanges,
      loading, 
      error,
      refreshContent
    }}>
      {children}
    </VioletContentContext.Provider>
  );
};

export const useVioletContent = () => useContext(VioletContentContext);

// Legacy compatibility hooks
export const useWordPressContent = () => {
  const { data, getField, updateField, saveChanges, loading, error, refreshContent } = useVioletContent();
  
  return {
    content: data || {},
    updateField,
    getField,
    loading,
    error,
    isConnected: !!data && !error,
    refreshContent,
    saveChanges
  };
};

export const useContentField = (fieldName: string, defaultValue: string = '') => {
  const { getField, updateField, loading, error } = useVioletContent();
  
  return {
    value: getField(fieldName, defaultValue),
    updateValue: (newValue: string) => updateField(fieldName, newValue),
    loading,
    error,
  };
};