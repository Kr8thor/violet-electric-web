import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for content management
interface VioletContent {
  [key: string]: any;
}

interface VioletContentContextType {
  content: VioletContent;
  updateContent: (field: string, value: any) => void;
  saveContent: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
  getField: (field: string, defaultValue?: any) => any;
}

// Create context
const VioletContentContext = createContext<VioletContentContextType | undefined>(undefined);

// Provider component
export function VioletContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<VioletContent>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load WordPress content on initialization
  useEffect(() => {
    loadWordPressContent();
  }, []);

  // Load content from WordPress REST API
  const loadWordPressContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/wp-json/violet/v1/content', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data);
        console.log('✅ WordPress content loaded:', Object.keys(data).length, 'fields');
      } else {
        throw new Error(`Failed to load content: ${response.statusText}`);
      }
    } catch (err) {
      console.warn('⚠️ Could not load WordPress content:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Load from localStorage as fallback
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // Load content from localStorage fallback
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('violet-content');
      if (stored) {
        const parsedContent = JSON.parse(stored);
        setContent(parsedContent);
        console.log('📦 Loaded content from localStorage');
      }
    } catch (err) {
      console.warn('Could not load from localStorage:', err);
    }
  };

  // Update content field
  const updateContent = (field: string, value: any) => {
    setContent(prev => {
      const updated = { ...prev, [field]: value };
      // Save to localStorage immediately
      localStorage.setItem('violet-content', JSON.stringify(updated));
      return updated;
    });
  };

  // Save content to WordPress
  const saveContent = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/wp-json/violet/v1/save-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changes: Object.entries(content).map(([field, value]) => ({
            field_name: field,
            field_value: value,
          })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Content saved to WordPress:', result);
        return true;
      } else {
        throw new Error(`Failed to save: ${response.statusText}`);
      }
    } catch (err) {
      console.error('❌ Save failed:', err);
      setError(err instanceof Error ? err.message : 'Save failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get field value with fallback
  const getField = (field: string, defaultValue: any = '') => {
    return content[field] !== undefined ? content[field] : defaultValue;
  };

  // Expose globally for debugging and WordPress integration
  useEffect(() => {
    (window as any).violetContent = content;
    (window as any).violetUpdateContent = updateContent;
    (window as any).violetSaveContent = saveContent;
    (window as any).violetGetField = getField;
  }, [content]);

  const contextValue: VioletContentContextType = {
    content,
    updateContent,
    saveContent,
    loading,
    error,
    getField,
  };

  return (
    <VioletContentContext.Provider value={contextValue}>
      {children}
    </VioletContentContext.Provider>
  );
}

// Hook to use the context
export function useVioletContent() {
  const context = useContext(VioletContentContext);
  if (context === undefined) {
    throw new Error('useVioletContent must be used within a VioletContentProvider');
  }
  return context;
}

// Export for compatibility
export default VioletContentProvider;
