import { useState, useEffect } from 'react';
import { useContentField as useOriginalContentField } from '@/contexts/ContentContext';
import { saveManager } from '@/utils/WordPressSaveManager';
import { getAllContentSync } from '@/utils/contentStorage';
import { tripleFailsafe } from '@/utils/tripleFailsafeSystem';

/**
 * Enhanced content field hook that uses Triple Failsafe System
 */
export function useContentField(field: string, defaultValue: string): string {
  // Get initial value from triple failsafe
  const [value, setValue] = useState(() => {
    return tripleFailsafe.getField(field, defaultValue);
  });

  useEffect(() => {
    // Subscribe to WordPress saves
    const unsubscribe = saveManager.subscribe((updates) => {
      if (updates[field] !== undefined) {
        console.log(`🔄 useContentField[${field}]: Updating from "${value}" to "${updates[field]}"`);
        setValue(updates[field]);
      }
    });

    // Listen for failsafe content updates
    const handleContentUpdate = (event: CustomEvent) => {
      const content = event.detail;
      if (content[field] !== undefined && content[field] !== value) {
        console.log(`🔄 useContentField[${field}]: Triple failsafe update from "${value}" to "${content[field]}"`);
        setValue(content[field]);
      }
    };

    // Listen for various content events
    window.addEventListener('violet-content-saved', handleContentUpdate as any);
    window.addEventListener('violet-content-updated', handleContentUpdate as any);
    
    // Also check for storage events
    const handleStorageUpdate = async () => {
      const currentValue = tripleFailsafe.getField(field, defaultValue);
      if (currentValue !== value) {
        console.log(`🔄 useContentField[${field}]: Storage update from "${value}" to "${currentValue}"`);
        setValue(currentValue);
      }
    };

    window.addEventListener('storage', handleStorageUpdate);

    // Periodic check for updates (every second)
    const interval = setInterval(async () => {
      const currentValue = tripleFailsafe.getField(field, defaultValue);
      if (currentValue !== value) {
        console.log(`🔄 useContentField[${field}]: Periodic check update from "${value}" to "${currentValue}"`);
        setValue(currentValue);
      }
    }, 1000);

    return () => {
      unsubscribe();
      window.removeEventListener('violet-content-saved', handleContentUpdate as any);
      window.removeEventListener('violet-content-updated', handleContentUpdate as any);
      window.removeEventListener('storage', handleStorageUpdate);
      clearInterval(interval);
    };
  }, [field, value, defaultValue]);

  return value;
}

// Re-export other hooks from ContentContext
export { useContent, useWordPressConnection, useEditMode } from '@/contexts/ContentContext';
