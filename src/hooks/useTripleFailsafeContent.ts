/**
 * React Hook for Triple Failsafe Content
 * Provides automatic updates when content changes
 */

import { useState, useEffect, useCallback } from 'react';
import { tripleFailsafe } from '../utils/tripleFailsafeSystem';

interface UseFailsafeContentOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Hook to use content with triple failsafe protection
 */
export function useTripleFailsafeContent(
  field: string, 
  defaultValue: string = '',
  options: UseFailsafeContentOptions = {}
): [string, (value: string) => void] {
  const { autoRefresh = true, refreshInterval = 1000 } = options;
  
  // Initialize with current value
  const [value, setValue] = useState(() => {
    return tripleFailsafe.getField(field, defaultValue);
  });

  // Update function
  const updateValue = useCallback(async (newValue: string) => {
    console.log(`🔄 Updating ${field} to: ${newValue}`);
    
    // Save through triple failsafe
    await tripleFailsafe.saveToAllLayers([{
      field_name: field,
      field_value: newValue
    }]);
    
    // Update local state
    setValue(newValue);
  }, [field]);

  useEffect(() => {
    // Listen for content updates
    const handleContentUpdate = (event: CustomEvent) => {
      const content = event.detail;
      if (content[field] !== undefined && content[field] !== value) {
        console.log(`📥 Field ${field} updated from event:`, content[field]);
        setValue(content[field]);
      }
    };

    window.addEventListener('violet-content-saved', handleContentUpdate as any);

    // Auto-refresh if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        const currentValue = tripleFailsafe.getField(field, defaultValue);
        if (currentValue !== value) {
          console.log(`🔄 Auto-refresh detected change for ${field}`);
          setValue(currentValue);
        }
      }, refreshInterval);
    }

    return () => {
      window.removeEventListener('violet-content-saved', handleContentUpdate as any);
      if (interval) clearInterval(interval);
    };
  }, [field, value, defaultValue, autoRefresh, refreshInterval]);

  return [value, updateValue];
}

/**
 * Hook to get all content
 */
export function useAllFailsafeContent(): { [key: string]: string } {
  const [content, setContent] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Load initial content
    tripleFailsafe.loadContentWithFailover().then(setContent);

    // Listen for updates
    const handleUpdate = (event: CustomEvent) => {
      setContent(event.detail);
    };

    window.addEventListener('violet-content-saved', handleUpdate as any);

    return () => {
      window.removeEventListener('violet-content-saved', handleUpdate as any);
    };
  }, []);

  return content;
}

/**
 * Hook for WordPress integration status
 */
export function useFailsafeStatus() {
  const [status, setStatus] = useState({
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
    connected: false
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check localStorage
        localStorage.setItem('violet-test', 'test');
        const lsTest = localStorage.getItem('violet-test') === 'test';
        localStorage.removeItem('violet-test');

        // Check sessionStorage
        sessionStorage.setItem('violet-test', 'test');
        const ssTest = sessionStorage.getItem('violet-test') === 'test';
        sessionStorage.removeItem('violet-test');

        // Check IndexedDB
        let idbTest = false;
        try {
          const testContent = await tripleFailsafe.loadContentWithFailover();
          idbTest = true;
        } catch (e) {}

        setStatus({
          localStorage: lsTest,
          sessionStorage: ssTest,
          indexedDB: idbTest,
          connected: lsTest || ssTest || idbTest
        });
      } catch (e) {
        console.error('Status check failed:', e);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return status;
}
