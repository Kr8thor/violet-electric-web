import React, { createContext, useContext, useEffect, useState } from "react";
import type { WordPressContent } from "../wordpress-content";

// Import static content as FALLBACK ONLY
import { WORDPRESS_CONTENT } from "../wordpress-content";

interface VioletContentContextType {
  content: WordPressContent;
  updateField: (id: string, value: string) => void;
  loading: boolean;
  error: string | null;
}

const VioletContentCtx = createContext<VioletContentContextType>({
  content: WORDPRESS_CONTENT,
  updateField: () => {},
  loading: true,
  error: null,
});

// Simple fetch utility
async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export const VioletContentProvider: React.FC<
  React.PropsWithChildren<{ apiBase?: string }>
> = ({ apiBase = "", children }) => {
  const [content, setContent] = useState<WordPressContent>(WORDPRESS_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ On mount, try to pull the latest from WP
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching content from WordPress...');
        
        const live = await fetchJSON<WordPressContent>(`${apiBase}/wp-json/violet/v1/content`);
        
        console.log('✅ WordPress content fetched:', live);
        
        // 🎯 CRITICAL: Live WordPress content wins over static
        setContent((staticFallback) => ({ ...staticFallback, ...live }));
        
        // Cache for offline use
        localStorage.setItem("violetContentCache", JSON.stringify(live));
        
      } catch (fetchError) {
        console.warn('❌ WordPress API failed:', fetchError);
        
        // 2️⃣ If API fails, fall back to cached copy if any
        try {
          const cached = localStorage.getItem("violetContentCache");
          if (cached) {
            const cachedData = JSON.parse(cached);
            console.log('✅ Using cached WordPress content:', cachedData);
            setContent((staticFallback) => ({ ...staticFallback, ...cachedData }));
          } else {
            console.log('ℹ️ No cached content available, using static fallback');
            setError('WordPress API unavailable, using static content');
          }
        } catch (cacheError) {
          console.warn('❌ Cache read failed:', cacheError);
          setError('Content unavailable, using static fallback');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [apiBase]);

  // 3️⃣ Listen for WordPress save events and update immediately
  useEffect(() => {
    const handleWordPressSave = (event: MessageEvent) => {
      if (event.data?.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
        console.log('💾 WordPress save received:', event.data.savedChanges);
        
        const updates: Partial<WordPressContent> = {};
        event.data.savedChanges.forEach((change: any) => {
          if (change.field_name && change.field_value !== undefined) {
            updates[change.field_name as keyof WordPressContent] = change.field_value;
          }
        });
        
        setContent(prev => {
          const newContent = { ...prev, ...updates };
          console.log('✅ Content updated from WordPress save:', newContent);
          
          // Update cache immediately
          localStorage.setItem("violetContentCache", JSON.stringify(newContent));
          
          return newContent;
        });
      }
    };

    window.addEventListener('message', handleWordPressSave);
    return () => window.removeEventListener('message', handleWordPressSave);
  }, []);

  // 4️⃣ Expose updater (used by EditableText, etc.)
  const updateField = (id: string, value: string) => {
    setContent((prev) => {
      const updated = { ...prev, [id]: value };
      // Update cache when field changes
      localStorage.setItem("violetContentCache", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <VioletContentCtx.Provider value={{ content, updateField, loading, error }}>
      {children}
    </VioletContentCtx.Provider>
  );
};

export const useVioletContent = () => useContext(VioletContentCtx);

// Convenience hook for getting a single field
export const useContentField = (fieldName: keyof WordPressContent, defaultValue: string = '') => {
  const { content, loading, error } = useVioletContent();
  return {
    value: content[fieldName] || defaultValue,
    loading,
    error,
  };
};

// Legacy compatibility - keep existing hook name
export const useWordPressContent = () => {
  const { content, updateField, loading, error } = useVioletContent();
  
  const getField = (fieldName: string, defaultValue: string = '') => {
    return content[fieldName as keyof WordPressContent] || defaultValue;
  };
  
  return {
    content,
    updateField,
    getField,
    loading,
    error,
    isConnected: !error && !loading,
    refreshContent: () => window.location.reload(), // Simple refresh for now
  };
};