import { useState, useEffect, useCallback, useRef } from 'react';
import { failsafeStorage } from './failsafeContentPersistence';

interface UseFailsafeContentOptions {
  fieldName: string;
  defaultValue: string;
  forceRefreshInterval?: number;
}

interface ContentUpdate {
  field: string;
  value: string;
  timestamp: number;
}

/**
 * Failsafe Content Hook
 * 
 * This hook ensures content ALWAYS updates when WordPress saves,
 * bypassing any caching or state management issues
 */
export function useFailsafeContent({
  fieldName,
  defaultValue,
  forceRefreshInterval = 1000
}: UseFailsafeContentOptions): [string, (value: string) => void, boolean] {
  // Use a unique key to force updates
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [localValue, setLocalValue] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const mountedRef = useRef(true);

  // Load initial value
  useEffect(() => {
    const content = failsafeStorage.loadContent();
    const value = content[fieldName] || defaultValue;
    setLocalValue(value);
  }, [fieldName, defaultValue]);

  // Force refresh mechanism
  const forceRefresh = useCallback(() => {
    if (!mountedRef.current) return;
    
    const content = failsafeStorage.loadContent();
    const newValue = content[fieldName] || defaultValue;
    
    if (newValue !== localValue) {
      console.log(`🔄 FAILSAFE: Force updating ${fieldName}: "${localValue}" → "${newValue}"`);
      setLocalValue(newValue);
      setUpdateTrigger(prev => prev + 1);
      lastUpdateRef.current = Date.now();
    }
  }, [fieldName, defaultValue, localValue]);

  // Listen for WordPress saves
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
        console.log('💾 FAILSAFE HOOK: WordPress save detected', event.data);
        
        setIsUpdating(true);
        
        // Process the save immediately
        const updates: { [key: string]: string } = {};
        event.data.savedChanges.forEach((change: any) => {
          if (change.field_name && change.field_value !== undefined) {
            updates[change.field_name] = change.field_value;
            
            // If this is our field, update immediately
            if (change.field_name === fieldName) {
              console.log(`✅ FAILSAFE HOOK: Updating ${fieldName} immediately`);
              setLocalValue(change.field_value);
              setUpdateTrigger(prev => prev + 1);
            }
          }
        });

        // Save to failsafe storage
        const currentContent = failsafeStorage.loadContent();
        failsafeStorage.saveContent({ ...currentContent, ...updates }, 'wordpress');
        
        // Force refresh after a brief delay
        setTimeout(() => {
          forceRefresh();
          setIsUpdating(false);
        }, 100);
      }

      // Handle content change notifications
      if (event.data.type === 'violet-content-changed' && event.data.data) {
        if (event.data.data.fieldType === fieldName && event.data.data.value !== localValue) {
          console.log(`📝 FAILSAFE HOOK: Content changed for ${fieldName}`);
          setLocalValue(event.data.data.value);
          setUpdateTrigger(prev => prev + 1);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fieldName, localValue, forceRefresh]);

  // Periodic integrity check
  useEffect(() => {
    const interval = setInterval(() => {
      if (!mountedRef.current) return;
      
      const content = failsafeStorage.loadContent();
      const currentValue = content[fieldName] || defaultValue;
      
      if (currentValue !== localValue) {
        console.log(`🔍 FAILSAFE HOOK: Integrity check found mismatch for ${fieldName}`);
        setLocalValue(currentValue);
        setUpdateTrigger(prev => prev + 1);
      }
    }, forceRefreshInterval);

    return () => clearInterval(interval);
  }, [fieldName, defaultValue, localValue, forceRefreshInterval]);

  // Update function
  const updateValue = useCallback((newValue: string) => {
    console.log(`📝 FAILSAFE HOOK: Updating ${fieldName} to "${newValue}"`);
    setLocalValue(newValue);
    
    // Save to failsafe storage
    const currentContent = failsafeStorage.loadContent();
    failsafeStorage.saveContent({
      ...currentContent,
      [fieldName]: newValue
    }, 'local');
    
    // Notify WordPress if in edit mode
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'violet-content-changed',
        data: {
          fieldType: fieldName,
          value: newValue,
          timestamp: Date.now()
        }
      }, '*');
    }
  }, [fieldName]);

  // Listen for storage events (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'violet-content-primary' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const value = parsed.data[fieldName];
          if (value !== undefined && value !== localValue) {
            console.log(`🔄 FAILSAFE HOOK: Cross-tab update for ${fieldName}`);
            setLocalValue(value);
            setUpdateTrigger(prev => prev + 1);
          }
        } catch (err) {
          console.error('Failed to parse storage event:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fieldName, localValue]);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Return value with update trigger to force re-renders
  const finalValue = `${localValue}${updateTrigger > 0 ? '' : ''}`;
  
  return [finalValue, updateValue, isUpdating];
}

/**
 * Hook to force refresh all content
 */
export function useForceContentRefresh() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const forceRefresh = useCallback(() => {
    console.log('🔄 FAILSAFE: Forcing global content refresh');
    setRefreshTrigger(prev => prev + 1);
    
    // Also trigger a custom event
    window.dispatchEvent(new CustomEvent('violet-force-refresh'));
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'violet-apply-saved-changes') {
        console.log('💾 FAILSAFE: Triggering force refresh after WordPress save');
        setTimeout(forceRefresh, 200);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [forceRefresh]);

  return { refreshTrigger, forceRefresh };
}
