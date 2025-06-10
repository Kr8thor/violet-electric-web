import { useState, useEffect } from 'react';

/**
 * Hook to load and manage content from triple failsafe storage
 * This replaces hardcoded content with dynamic content from WordPress
 */
export function useContentFromStorage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load content from storage on mount
  useEffect(() => {
    loadContentFromStorage();
  }, []);

  // Listen for content updates from WordPress
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'violet-persist-content-changes') {
        console.log('🔄 Received content update from WordPress:', event.data);
        persistContentChanges(event.data.contentData);
      }
      
      if (event.data.type === 'violet-refresh-content') {
        console.log('🔄 Refreshing content from storage');
        loadContentFromStorage();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loadContentFromStorage = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from triple failsafe system
      let loadedContent: Record<string, string> = {};

      // 1. Try primary localStorage
      const primaryData = localStorage.getItem('violet-content-primary');
      if (primaryData) {
        try {
          const parsed = JSON.parse(primaryData);
          loadedContent = parsed.data || parsed;
          console.log('✅ Loaded content from primary storage:', loadedContent);
        } catch (e) {
          console.warn('⚠️ Primary storage corrupted, trying backup');
        }
      }

      // 2. Fallback to backup localStorage
      if (Object.keys(loadedContent).length === 0) {
        const backupData = localStorage.getItem('violet-content-backup');
        if (backupData) {
          try {
            loadedContent = JSON.parse(backupData);
            console.log('✅ Loaded content from backup storage:', loadedContent);
          } catch (e) {
            console.warn('⚠️ Backup storage corrupted, trying session');
          }
        }
      }

      // 3. Fallback to sessionStorage
      if (Object.keys(loadedContent).length === 0) {
        const sessionData = sessionStorage.getItem('violet-content-session');
        if (sessionData) {
          try {
            loadedContent = JSON.parse(sessionData);
            console.log('✅ Loaded content from session storage:', loadedContent);
          } catch (e) {
            console.warn('⚠️ Session storage corrupted, trying IndexedDB');
          }
        }
      }

      // 4. Final fallback to IndexedDB
      if (Object.keys(loadedContent).length === 0) {
        try {
          loadedContent = await loadFromIndexedDB();
          console.log('✅ Loaded content from IndexedDB:', loadedContent);
        } catch (e) {
          console.warn('⚠️ IndexedDB load failed:', e);
        }
      }

      // Set default content if nothing found
      if (Object.keys(loadedContent).length === 0) {
        loadedContent = getDefaultContent();
        console.log('🔄 Using default content');
      }

      setContent(loadedContent);
    } catch (error) {
      console.error('❌ Error loading content:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setContent(getDefaultContent());
    } finally {
      setLoading(false);
    }
  };

  const persistContentChanges = async (changes: any[]) => {
    try {
      // Convert changes array to content object
      const newContent = { ...content };
      changes.forEach(change => {
        if (change.field_name && change.field_value !== undefined) {
          newContent[change.field_name] = change.field_value;
        }
      });

      // Update state immediately
      setContent(newContent);

      // Save to all storage layers
      await saveToAllStorageLayers(newContent);
      
      console.log('✅ Content persisted to all storage layers:', newContent);
    } catch (error) {
      console.error('❌ Error persisting content changes:', error);
    }
  };

  const saveToAllStorageLayers = async (contentData: Record<string, string>) => {
    const timestamp = new Date().toISOString();
    
    // Save to primary localStorage
    localStorage.setItem('violet-content-primary', JSON.stringify({
      data: contentData,
      timestamp,
      source: 'wordpress_save'
    }));

    // Save to backup localStorage
    localStorage.setItem('violet-content-backup', JSON.stringify(contentData));

    // Save to sessionStorage
    sessionStorage.setItem('violet-content-session', JSON.stringify(contentData));

    // Save to IndexedDB
    try {
      await saveToIndexedDB(contentData);
    } catch (e) {
      console.warn('IndexedDB save failed:', e);
    }
  };

  const loadFromIndexedDB = (): Promise<Record<string, string>> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('VioletContentDB', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['content'], 'readonly');
        const store = transaction.objectStore('content');
        const getRequest = store.get('latest');
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result?.data || {});
        };
        
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('content')) {
          db.createObjectStore('content');
        }
      };
    });
  };

  const saveToIndexedDB = (contentData: Record<string, string>): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('VioletContentDB', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['content'], 'readwrite');
        const store = transaction.objectStore('content');
        
        const putRequest = store.put({
          data: contentData,
          timestamp: new Date().toISOString()
        }, 'latest');
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  };

  const getDefaultContent = (): Record<string, string> => {
    return {
      hero_title: 'Welcome to Our Site',
      hero_subtitle: 'Transform your potential into success',
      hero_cta: 'Get Started',
      contact_email: 'hello@example.com',
      contact_phone: '(555) 123-4567'
    };
  };

  // Helper function to get content by field name
  const get = (fieldName: string, defaultValue: string = '') => {
    return content[fieldName] || defaultValue;
  };

  return {
    content,
    loading,
    error,
    get,
    loadContentFromStorage,
    persistContentChanges
  };
}
