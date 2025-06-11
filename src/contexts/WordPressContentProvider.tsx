import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tripleFailsafe } from '../utils/tripleFailsafeSystem';
import EnhancedPersistence from '../utils/enhancedPersistence';

interface WordPressContentContextType {
  content: Record<string, any>;
  loading: boolean;
  error: string | null;
  getField: (fieldName: string, defaultValue?: string) => string;
  updateField: (fieldName: string, value: string) => void;
  refreshContent: () => Promise<void>;
  isConnected: boolean;
}

const WordPressContentContext = createContext<WordPressContentContextType>({
  content: {},
  loading: true,
  error: null,
  getField: (fieldName: string, defaultValue: string = '') => defaultValue,
  updateField: () => {},
  refreshContent: async () => {},
  isConnected: false,
});

export function WordPressContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch content from WordPress REST API
  const fetchWordPressContent = useCallback(async (): Promise<Record<string, any>> => {
    try {
      console.log('🔄 Fetching content from WordPress...');
      
      const response = await fetch('/wp-json/violet/v1/content', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ WordPress content fetched:', data);
      setIsConnected(true);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch WordPress content:', error);
      setIsConnected(false);
      throw error;
    }
  }, []);

  // Load content with fallback strategy
  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // PRIORITY 1: Load SAVED content from localStorage FIRST
      let savedContent = {};
      try {
        const stored = localStorage.getItem('violet-content');
        if (stored) {
          const parsed = JSON.parse(stored);
          savedContent = parsed.content || parsed;
          console.log('✅ SAVED content loaded from localStorage:', savedContent);
        } else {
          console.log('ℹ️ No saved content in localStorage');
        }
      } catch (error) {
        console.warn('⚠️ Failed to load saved content:', error);
      }

      // Strategy 2: Try WordPress API
      let wordpressContent = {};
      try {
        wordpressContent = await fetchWordPressContent();
        console.log('✅ WordPress API content loaded:', wordpressContent);
      } catch (wpError) {
        console.warn('⚠️ WordPress API unavailable, using saved content...');
      }

      // Strategy 3: Load from triple failsafe system (backup)
      const failsafeContent = await tripleFailsafe.getContent();
      console.log('📦 Failsafe content loaded:', failsafeContent);

      // CRITICAL FIX: Merge with SAVED content as highest priority
      const mergedContent = {
        // Start with failsafe as base
        ...failsafeContent,
        // Then WordPress API
        ...wordpressContent,
        // SAVED content has HIGHEST priority (overrides everything)
        ...savedContent,
      };

      // Strategy 4: Apply defaults ONLY for missing fields (not override saved)
      const contentWithDefaults = {
        // Defaults come FIRST (only used if field doesn't exist in saved content)
        hero_title: 'Welcome to Violet Electric',
        hero_subtitle: 'Transform your potential with cutting-edge solutions',
        hero_cta: 'Book Your Session',
        contact_email: 'hello@violetrainwater.com',
        contact_phone: '+1 (555) 123-4567',
        nav_about: 'About',
        nav_keynotes: 'Keynotes',
        nav_testimonials: 'Testimonials',
        nav_contact: 'Contact',
        // MERGED content OVERRIDES defaults (saved content wins!)
        ...mergedContent,
      };

      console.log('✅ Final content with saved prioritized:', contentWithDefaults);
      console.log('📊 Saved fields that override defaults:', Object.keys(savedContent));
      
      setContent(contentWithDefaults);
      setError(null);

    } catch (error) {
      console.error('❌ Complete content loading failed:', error);
      setError(error instanceof Error ? error.message : 'Content loading failed');
      
      // Emergency fallback to hardcoded content
      setContent({
        hero_title: 'Welcome to Violet Electric',
        hero_subtitle: 'Transform your potential with cutting-edge solutions',
        hero_cta: 'Book Your Session',
        contact_email: 'hello@violetrainwater.com',
        contact_phone: '+1 (555) 123-4567',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchWordPressContent]);

  // Initialize content loading on mount
  useEffect(() => {
    console.log('🚀 WordPress Content Provider initializing...');
    loadContent();
  }, [loadContent]);

  // Listen for WordPress save events
  useEffect(() => {
    const handleWordPressSave = (event: CustomEvent) => {
      console.log('💾 WordPress save event received:', event.detail);
      
      if (event.detail?.savedChanges) {
        // Update content immediately from save data
        const updates: Record<string, any> = {};
        event.detail.savedChanges.forEach((change: any) => {
          if (change.field_name && change.field_value !== undefined) {
            updates[change.field_name] = change.field_value;
          }
        });

        setContent(prev => {
          const newContent = { ...prev, ...updates };
          console.log('✅ Content updated from WordPress save:', newContent);
          
          // CRITICAL FIX: Save to localStorage in the correct format immediately
          try {
            const storageData = {
              version: 'v1',
              timestamp: Date.now(),
              content: newContent
            };
            localStorage.setItem('violet-content', JSON.stringify(storageData));
            console.log('✅ Content persisted to localStorage:', storageData);
          } catch (error) {
            console.error('❌ Failed to save to localStorage:', error);
          }
          
          return newContent;
        });

        // Save to triple failsafe
        tripleFailsafe.saveToAllLayers(event.detail.savedChanges)
          .then(() => console.log('✅ Content saved to triple failsafe'))
          .catch(err => console.error('❌ Failsafe save error:', err));
      }
    };

    // Enhanced message handler for postMessage saves
    const handlePostMessage = (event: MessageEvent) => {
      if (event.data?.type === 'violet-apply-saved-changes' || 
          event.data?.type === 'violet-persist-content' ||
          event.data?.type === 'violet-content-updated') {
        
        console.log('📨 Direct postMessage save received:', event.data);
        
        let updates: Record<string, any> = {};
        
        // Handle different message formats
        if (event.data.savedChanges && Array.isArray(event.data.savedChanges)) {
          event.data.savedChanges.forEach((change: any) => {
            if (change.field_name && change.field_value !== undefined) {
              updates[change.field_name] = change.field_value;
            }
          });
        } else if (event.data.content) {
          // Handle direct content format
          updates = event.data.content;
        } else if (event.data.changes) {
          // Handle changes format
          event.data.changes.forEach((change: any) => {
            if (change.field_name && change.field_value !== undefined) {
              updates[change.field_name] = change.field_value;
            }
          });
        }

        if (Object.keys(updates).length > 0) {
          setContent(prev => {
            const newContent = { ...prev, ...updates };
            console.log('✅ Content updated from postMessage:', newContent);
            
            // Save to localStorage immediately
            try {
              const storageData = {
                version: 'v1',
                timestamp: Date.now(),
                content: newContent
              };
              localStorage.setItem('violet-content', JSON.stringify(storageData));
              console.log('✅ Content persisted via postMessage:', storageData);
              
              // Force page reload after a short delay
              setTimeout(() => {
                console.log('🔄 Reloading page to show persisted content...');
                window.location.reload();
              }, 1000);
              
            } catch (error) {
              console.error('❌ Failed to save to localStorage:', error);
            }
            
            return newContent;
          });
        }
      }
    };

    const handleContentRefresh = () => {
      console.log('🔄 Content refresh requested');
      loadContent();
    };

    // Listen for WordPress save completion (custom events)
    window.addEventListener('violet-apply-changes', handleWordPressSave as EventListener);
    window.addEventListener('violet-content-updated', handleContentRefresh);
    window.addEventListener('violet-refresh-content', handleContentRefresh);
    
    // Listen for direct postMessage saves
    window.addEventListener('message', handlePostMessage);

    return () => {
      window.removeEventListener('violet-apply-changes', handleWordPressSave as EventListener);
      window.removeEventListener('violet-content-updated', handleContentRefresh);
      window.removeEventListener('violet-refresh-content', handleContentRefresh);
      window.removeEventListener('message', handlePostMessage);
    };
  }, [loadContent]);

  // Get field with fallback - ENHANCED to prioritize saved content
  const getField = useCallback((fieldName: string, defaultValue: string = ''): string => {
    // CRITICAL FIX: Use enhanced persistence to check for saved content first
    const savedValue = EnhancedPersistence.getField(fieldName);
    
    // Enhanced debug logging
    console.log(`🔍 getField("${fieldName}"):`);
    console.log(`  - Enhanced persistence value: "${savedValue}"`);
    console.log(`  - Context value: "${content[fieldName]}"`);
    console.log(`  - Default value: "${defaultValue}"`);
    
    // If enhanced persistence has saved content (even empty string), use it
    if (savedValue !== undefined) {
      console.log(`  ✅ Using ENHANCED SAVED value: "${savedValue}"`);
      return savedValue;
    }
    
    // Fallback to context content
    const contextValue = content[fieldName];
    if (contextValue !== undefined && contextValue !== null) {
      console.log(`  ✅ Using CONTEXT value: "${contextValue}"`);
      return String(contextValue);
    }
    
    // Only use default if no saved content exists at all
    console.log(`  ⚠️ Using DEFAULT value: "${defaultValue}"`);
    return defaultValue;
  }, [content]);

  // Update field (for editing)
  const updateField = useCallback((fieldName: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Also save to triple failsafe immediately
    tripleFailsafe.saveToAllLayers([{ field_name: fieldName, field_value: value }])
      .catch(err => console.error('❌ Failed to save to failsafe:', err));
  }, []);

  // Refresh content manually
  const refreshContent = useCallback(async () => {
    await loadContent();
  }, [loadContent]);

  const contextValue: WordPressContentContextType = {
    content,
    loading,
    error,
    getField,
    updateField,
    refreshContent,
    isConnected,
  };

  return (
    <WordPressContentContext.Provider value={contextValue}>
      {children}
    </WordPressContentContext.Provider>
  );
}

// Custom hook to use WordPress content
export const useWordPressContent = () => {
  const context = useContext(WordPressContentContext);
  if (!context) {
    throw new Error('useWordPressContent must be used within WordPressContentProvider');
  }
  return context;
};

// Convenience hook for getting a single field
export const useContentField = (fieldName: string, defaultValue: string = '') => {
  const { getField, loading, error } = useWordPressContent();
  return {
    value: getField(fieldName, defaultValue),
    loading,
    error,
  };
};

// Global function for external access
declare global {
  interface Window {
    violetRefreshContent?: () => void;
  }
}

// Make refresh function globally available
if (typeof window !== 'undefined') {
  window.violetRefreshContent = () => {
    window.dispatchEvent(new CustomEvent('violet-refresh-content'));
  };
}
