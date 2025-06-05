// PerformanceHooks.ts - Phase 2 Performance Optimization Hooks
import { useState, useCallback, useRef, useEffect } from 'react';

// Types
interface SaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

interface OptimisticUpdate<T> {
  id: string;
  optimisticValue: T;
  originalValue: T;
  timestamp: Date;
}

interface ContentCacheItem {
  value: string;
  timestamp: Date;
  fieldType: string;
}

// 1. Debounced Save Hook
export const useDebouncedSave = (
  saveFunction: (data: any) => Promise<void>,
  delay: number = 1000
) => {
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const pendingDataRef = useRef<any>();

  const debouncedSave = useCallback((data: any) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Store pending data
    pendingDataRef.current = data;
    setSaveState({ status: 'idle' });

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      setSaveState({ status: 'saving' });
      
      try {
        await saveFunction(pendingDataRef.current);
        setSaveState({ 
          status: 'saved', 
          lastSaved: new Date() 
        });
        
        // Auto-hide success state after 3 seconds
        setTimeout(() => {
          setSaveState(prev => 
            prev.status === 'saved' 
              ? { ...prev, status: 'idle' }
              : prev
          );
        }, 3000);
        
      } catch (error) {
        setSaveState({ 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Save failed' 
        });
      }
    }, delay);
  }, [saveFunction, delay]);

  const cancelSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setSaveState({ status: 'idle' });
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveState,
    debouncedSave,
    cancelSave,
    hasPendingChanges: !!timeoutRef.current
  };
};

// 2. Optimistic Updates Hook
export const useOptimisticUpdates = <T>() => {
  const [updates, setUpdates] = useState<Map<string, OptimisticUpdate<T>>>(new Map());

  const addOptimisticUpdate = useCallback((
    id: string, 
    optimisticValue: T, 
    originalValue: T
  ) => {
    setUpdates(prev => {
      const newUpdates = new Map(prev);
      newUpdates.set(id, {
        id,
        optimisticValue,
        originalValue,
        timestamp: new Date()
      });
      return newUpdates;
    });
  }, []);

  const confirmUpdate = useCallback((id: string) => {
    setUpdates(prev => {
      const newUpdates = new Map(prev);
      newUpdates.delete(id);
      return newUpdates;
    });
  }, []);

  const rollbackUpdate = useCallback((id: string) => {
    const update = updates.get(id);
    if (update) {
      setUpdates(prev => {
        const newUpdates = new Map(prev);
        newUpdates.delete(id);
        return newUpdates;
      });
      return update.originalValue;
    }
    return null;
  }, [updates]);

  const getOptimisticValue = useCallback((id: string, fallbackValue: T): T => {
    const update = updates.get(id);
    return update ? update.optimisticValue : fallbackValue;
  }, [updates]);

  const rollbackAll = useCallback(() => {
    const rollbackValues = new Map<string, T>();
    updates.forEach((update, id) => {
      rollbackValues.set(id, update.originalValue);
    });
    setUpdates(new Map());
    return rollbackValues;
  }, [updates]);

  return {
    addOptimisticUpdate,
    confirmUpdate,
    rollbackUpdate,
    getOptimisticValue,
    rollbackAll,
    hasOptimisticUpdates: updates.size > 0,
    optimisticUpdateCount: updates.size
  };
};

// 3. Content Cache Hook
export const useContentCache = (maxAge: number = 5 * 60 * 1000) => { // 5 minutes default
  const [cache, setCache] = useState<Map<string, ContentCacheItem>>(new Map());

  const setCacheItem = useCallback((key: string, value: string, fieldType: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, {
        value,
        timestamp: new Date(),
        fieldType
      });
      return newCache;
    });
  }, []);

  const getCacheItem = useCallback((key: string): ContentCacheItem | null => {
    const item = cache.get(key);
    if (!item) return null;

    // Check if item is expired
    const now = new Date().getTime();
    const itemTime = item.timestamp.getTime();
    
    if (now - itemTime > maxAge) {
      // Remove expired item
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }

    return item;
  }, [cache, maxAge]);

  const removeCacheItem = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  const clearExpiredItems = useCallback(() => {
    const now = new Date().getTime();
    setCache(prev => {
      const newCache = new Map();
      prev.forEach((item, key) => {
        if (now - item.timestamp.getTime() <= maxAge) {
          newCache.set(key, item);
        }
      });
      return newCache;
    });
  }, [maxAge]);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  // Auto cleanup expired items
  useEffect(() => {
    const interval = setInterval(clearExpiredItems, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [clearExpiredItems]);

  return {
    setCacheItem,
    getCacheItem,
    removeCacheItem,
    clearExpiredItems,
    clearCache,
    cacheSize: cache.size,
    cacheKeys: Array.from(cache.keys())
  };
};

// 4. Combined Performance Hook (convenience hook that combines all three)
export const useContentEditorPerformance = (
  saveFunction: (data: any) => Promise<void>,
  debounceDelay: number = 1000
) => {
  const debouncedSave = useDebouncedSave(saveFunction, debounceDelay);
  const optimisticUpdates = useOptimisticUpdates<string>();
  const contentCache = useContentCache();

  const updateContent = useCallback(async (
    fieldId: string,
    newValue: string,
    originalValue: string,
    fieldType: string
  ) => {
    // Add optimistic update
    optimisticUpdates.addOptimisticUpdate(fieldId, newValue, originalValue);
    
    // Cache the new value
    contentCache.setCacheItem(fieldId, newValue, fieldType);
    
    // Trigger debounced save
    debouncedSave.debouncedSave({ fieldId, value: newValue, fieldType });
    
  }, [optimisticUpdates, contentCache, debouncedSave]);

  const getDisplayValue = useCallback((fieldId: string, serverValue: string): string => {
    // First check optimistic updates
    const optimisticValue = optimisticUpdates.getOptimisticValue(fieldId, serverValue);
    if (optimisticValue !== serverValue) {
      return optimisticValue;
    }
    
    // Then check cache
    const cachedItem = contentCache.getCacheItem(fieldId);
    if (cachedItem && cachedItem.value !== serverValue) {
      return cachedItem.value;
    }
    
    return serverValue;
  }, [optimisticUpdates, contentCache]);

  const confirmSave = useCallback((fieldId: string) => {
    optimisticUpdates.confirmUpdate(fieldId);
  }, [optimisticUpdates]);

  const handleSaveError = useCallback((fieldId: string) => {
    const rolledBackValue = optimisticUpdates.rollbackUpdate(fieldId);
    contentCache.removeCacheItem(fieldId);
    return rolledBackValue;
  }, [optimisticUpdates, contentCache]);

  return {
    // Save state
    saveState: debouncedSave.saveState,
    hasPendingChanges: debouncedSave.hasPendingChanges,
    
    // Optimistic updates
    hasOptimisticUpdates: optimisticUpdates.hasOptimisticUpdates,
    optimisticUpdateCount: optimisticUpdates.optimisticUpdateCount,
    
    // Cache info
    cacheSize: contentCache.cacheSize,
    
    // Main functions
    updateContent,
    getDisplayValue,
    confirmSave,
    handleSaveError,
    
    // Utility functions
    cancelSave: debouncedSave.cancelSave,
    rollbackAll: optimisticUpdates.rollbackAll,
    clearCache: contentCache.clearCache
  };
};