/**
 * Hook for loading and managing content from WordPress database
 * This ensures saved changes persist across page refreshes
 */

import { useState, useEffect } from 'react';

export interface WordPressContentField {
  field_name: string;
  field_value: string;
}

export interface UseWordPressContentReturn {
  content: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
  refetch: () => Promise<void>;
  getField: (fieldName: string, defaultValue?: string) => string;
}

const CONTENT_API_URL = '/wp-json/violet/v1/content';
const CACHE_KEY = 'violet-wp-content-cache';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export function useWordPressContent(): UseWordPressContentReturn {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const loadFromCache = (): Record<string, string> | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;
        
        if (!isExpired) {
          console.log('📦 Using cached WordPress content');
          return data;
        }
      }
    } catch (e) {
      console.warn('⚠️ Failed to load cached content:', e);
    }
    return null;
  };

  const saveToCache = (data: Record<string, string>): void => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('⚠️ Failed to cache content:', e);
    }
  };

  const fetchWordPressContent = async (): Promise<Record<string, string>> => {
    console.log('🔄 Fetching content from WordPress...');
    
    try {
      const response = await fetch(CONTENT_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ WordPress content loaded:', data);
      
      return data || {};
    } catch (fetchError) {
      console.error('❌ Failed to fetch WordPress content:', fetchError);
      throw fetchError;
    }
  };

  const refetch = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const wpContent = await fetchWordPressContent();
      setContent(wpContent);
      setLastSync(new Date());
      saveToCache(wpContent);
      console.log('✅ WordPress content refreshed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Failed to refetch content:', errorMessage);
      
      // Fall back to cache on error
      const cachedContent = loadFromCache();
      if (cachedContent) {
        setContent(cachedContent);
        console.log('📦 Using cached content due to fetch error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize content on mount
  useEffect(() => {
    const initializeContent = async () => {
      // First try cache for instant loading
      const cachedContent = loadFromCache();
      if (cachedContent) {
        setContent(cachedContent);
        setIsLoading(false);
      }

      // Then fetch fresh data from WordPress
      try {
        const wpContent = await fetchWordPressContent();
        setContent(wpContent);
        setLastSync(new Date());
        saveToCache(wpContent);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
        setError(errorMessage);
        
        // If no cache and fetch failed, show error but continue
        if (!cachedContent) {
          console.error('❌ No content available:', errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeContent();
  }, []);

  // Listen for content updates from WordPress editor
  useEffect(() => {
    const handleContentUpdate = (event: MessageEvent) => {
      if (event.data?.type === 'violet-content-updated') {
        console.log('🔄 Content updated by WordPress editor, refreshing...');
        refetch();
      }
    };

    const handleStorageUpdate = () => {
      console.log('🔄 Storage updated, refreshing WordPress content...');
      refetch();
    };

    window.addEventListener('message', handleContentUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('message', handleContentUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const getField = (fieldName: string, defaultValue: string = ''): string => {
    return content[fieldName] || defaultValue;
  };

  return {
    content,
    isLoading,
    error,
    lastSync,
    refetch,
    getField
  };
}

export default useWordPressContent;
