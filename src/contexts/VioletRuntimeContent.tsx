import React, { createContext, useContext, useEffect, useState } from "react";

// Runtime-only WordPress content provider - ZERO static imports
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

type Ctx = { 
  data: VioletContentMap | null; 
  set: (k: string, v: string) => void;
  loading: boolean;
  error: string | null;
};

const Ctx = createContext<Ctx>({ 
  data: null, 
  set: () => {}, 
  loading: true,
  error: null
});

export const VioletContentProvider: React.FC<
  React.PropsWithChildren<{ apiBase?: string }>
> = ({ apiBase = "", children }) => {
  const [data, setData] = useState<VioletContentMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🌐 Fetch once, block render until done
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🌐 Fetching WordPress content from API...');
        
        const response = await fetch(`${apiBase}/wp-json/violet/v1/content`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const live = await response.json();
        console.log('✅ WordPress API content loaded:', live);
        
        setData(live);
        
        // Cache for offline use
        localStorage.setItem('violetContentCache', JSON.stringify(live));
        
      } catch (fetchError) {
        console.warn('❌ WordPress API failed:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
        
        // Try to load from cache as fallback
        try {
          const cached = localStorage.getItem('violetContentCache');
          if (cached) {
            const cachedData = JSON.parse(cached);
            console.log('💾 Using cached WordPress content:', cachedData);
            setData(cachedData);
          } else {
            console.log('❌ No cached content available');
          }
        } catch (cacheError) {
          console.warn('❌ Cache read failed:', cacheError);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [apiBase]);

  // Listen for WordPress save events and diagnostic requests
  useEffect(() => {
    const handleMessages = (event: MessageEvent) => {
      if (event.data?.type === 'violet-saved') {
        console.log('💾 WordPress save detected - clearing cache and reloading');
        localStorage.removeItem('violetContentCache');
        window.location.reload();
      }
      
      // Handle diagnostic requests
      if (event.data?.type === 'violet-diagnostic-request') {
        console.log('🔍 Diagnostic request received, responding with current state');
        
        // Send back comprehensive diagnostic info
        if (event.source && event.source !== window) {
          (event.source as Window).postMessage({
            type: 'violet-diagnostic-response',
            testId: event.data.testId,
            providerLoaded: true,
            contentLoaded: !!data,
            loading: loading,
            error: error,
            currentContent: data,
            cacheStatus: !!localStorage.getItem('violetContentCache'),
            apiBase: apiBase,
            timestamp: new Date().toISOString()
          }, '*');
        }
      }
    };

    window.addEventListener('message', handleMessages);
    return () => window.removeEventListener('message', handleMessages);
  }, [data, loading, error, apiBase]);

  const set = (id: string, val: string) =>
    setData(d => (d ? { ...d, [id]: val } : d));

  // Block render until WordPress responds or fails
  if (loading) {
    return (
      <div className="p-4 text-center min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luminous-300 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading content from WordPress...</p>
        </div>
      </div>
    );
  }

  // If we failed to load AND have no cached data, show error
  if (!data && error) {
    return (
      <div className="p-4 text-center min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Content Loading Failed</h2>
          <p className="text-gray-600 mb-4">WordPress API: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-luminous-500 text-white rounded hover:bg-luminous-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <Ctx.Provider value={{ data, set, loading, error }}>{children}</Ctx.Provider>;
};

export const useVioletContent = () => useContext(Ctx);

// Legacy compatibility hooks
export const useWordPressContent = () => {
  const { data, set, loading, error } = useVioletContent();
  
  const getField = (fieldName: string, defaultValue: string = '') => {
    return data?.[fieldName] || defaultValue;
  };
  
  return {
    content: data || {},
    updateField: set,
    getField,
    loading,
    error,
    isConnected: !!data && !error,
    refreshContent: () => window.location.reload(),
  };
};

export const useContentField = (fieldName: string, defaultValue: string = '') => {
  const { data, loading, error } = useVioletContent();
  return {
    value: data?.[fieldName] || defaultValue,
    loading,
    error,
  };
};