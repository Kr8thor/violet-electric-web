import { useState, useEffect, useCallback, useRef } from 'react';
import { VioletContent } from '@/utils/contentStorage';
import { syncWordPressContent, getLastSyncTimestamp } from '@/utils/wordpressContentSync';
import { useContent } from '@/contexts/ContentContext';

/**
 * Custom hook for WordPress content with automatic sync
 */
export const useWordPressContent = () => {
  const { content, isLoading, refreshContent, forceRefresh } = useContent();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(getLastSyncTimestamp());
  
  // Sync content from WordPress
  const sync = useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      
      const success = await syncWordPressContent();
      
      if (success) {
        await refreshContent();
        setLastSync(new Date());
        forceRefresh();
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(errorMessage);
      console.error('❌ Sync error:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [refreshContent, forceRefresh]);
  
  // Auto-sync on mount and when window becomes visible
  useEffect(() => {
    // Initial sync
    sync();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        sync();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sync]);
  
  return {
    content,
    isLoading: isLoading || isSyncing,
    isSyncing,
    syncError,
    lastSync,
    sync,
    forceRefresh
  };
};

/**
 * Hook for a specific content field with real-time updates
 */
export const useContentFieldWithUpdates = (field: string, defaultValue: string) => {
  const { getField } = useContent();
  const [value, setValue] = useState(() => getField(field, defaultValue));
  const previousValue = useRef(value);
  
  // Get current value
  const currentValue = getField(field, defaultValue);
  
  // Update local state if content changed
  useEffect(() => {
    if (currentValue !== previousValue.current) {
      setValue(currentValue);
      previousValue.current = currentValue;
    }
  }, [currentValue]);
  
  // Listen for specific field updates
  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      const updates = event.detail;
      if (updates && updates[field] !== undefined) {
        setValue(updates[field]);
        previousValue.current = updates[field];
      }
    };
    
    const handleWordPressSave = (event: CustomEvent) => {
      if (event.detail && event.detail.updates && event.detail.updates[field] !== undefined) {
        setValue(event.detail.updates[field]);
        previousValue.current = event.detail.updates[field];
      }
    };
    
    window.addEventListener('violet-content-updated', handleContentUpdate as EventListener);
    window.addEventListener('violet-wordpress-save-complete', handleWordPressSave as EventListener);
    
    return () => {
      window.removeEventListener('violet-content-updated', handleContentUpdate as EventListener);
      window.removeEventListener('violet-wordpress-save-complete', handleWordPressSave as EventListener);
    };
  }, [field]);
  
  return value;
};

/**
 * Hook to detect if we're in WordPress edit mode
 */
export const useWordPressEditMode = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('edit_mode') === '1' && urlParams.get('wp_admin') === '1';
    const inIframe = window.parent !== window.self;
    
    setIsEditMode(editMode);
    setIsInIframe(inIframe);
  }, []);
  
  return { isEditMode, isInIframe };
};

/**
 * Hook for debugging content state
 */
export const useContentDebug = () => {
  const { content, isLoading, isWordPressConnected, lastSync } = useContent();
  const [localStorage, setLocalStorage] = useState<VioletContent>({});
  
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const stored = window.localStorage.getItem('violet-content');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.content) {
            setLocalStorage(parsed.content);
          }
        }
      } catch (e) {
        console.error('Failed to parse localStorage:', e);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    content,
    localStorage,
    isLoading,
    isWordPressConnected,
    lastSync,
    comparison: {
      inSync: JSON.stringify(content) === JSON.stringify(localStorage),
      contentKeys: Object.keys(content).sort(),
      localStorageKeys: Object.keys(localStorage).sort()
    }
  };
};
