/**
 * WordPress Content Sync Utility
 * Ensures smart synchronization with grace periods after saves
 */

import { saveContent, getAllContentSync } from './contentStorage';

const WORDPRESS_API_URL = 'https://wp.violetrainwater.com/wp-json/violet/v1/content';
const SYNC_INTERVAL = 60000; // Check for updates every 60 seconds (increased from 30s)
const LAST_SYNC_KEY = 'violet-last-sync-timestamp';

let syncInterval: number | null = null;

/**
 * Check if content has changed
 */
const hasContentChanged = (oldContent: any, newContent: any): boolean => {
  const oldKeys = Object.keys(oldContent || {}).sort();
  const newKeys = Object.keys(newContent || {}).sort();
  
  if (oldKeys.length !== newKeys.length) return true;
  
  for (const key of oldKeys) {
    if (oldContent[key] !== newContent[key]) return true;
  }
  
  return false;
};

/**
 * Fetch fresh content from WordPress and update local storage
 * This is now called by ContentContext with smart grace period logic
 */
export const syncWordPressContent = async (): Promise<boolean> => {
  try {
    console.log('🔄 Fetching content from WordPress...');
    
    // Check if we're in the WordPress iframe
    const isInWordPressIframe = window.location.search.includes('edit_mode=1') && 
                                window.location.search.includes('wp_admin=1');
    
    // Use the correct URL based on context
    const apiUrl = isInWordPressIframe 
      ? '/wp-json/violet/v1/content'  // Use proxy when in iframe
      : WORDPRESS_API_URL;             // Use direct URL otherwise
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      credentials: 'omit' // Don't send credentials for public endpoint
    });
    
    if (!response.ok) {
      console.warn('⚠️ WordPress API not available:', response.status);
      return false;
    }
    
    const wpContent = await response.json();
    console.log('✅ WordPress content received:', wpContent);
    
    if (wpContent && Object.keys(wpContent).length > 0) {
      // Check if content has actually changed
      const currentContent = getAllContentSync();
      const contentChanged = hasContentChanged(currentContent, wpContent);
      
      if (contentChanged) {
        // Save to localStorage, replacing all existing content
        saveContent(wpContent, false); // false = don't merge, replace completely
        
        // Update last sync timestamp
        localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
        
        // Dispatch event to update all components
        window.dispatchEvent(new CustomEvent('violet-content-synced', { 
          detail: { content: wpContent, source: 'wordpress' } 
        }));
        
        console.log('💾 WordPress content synced successfully (content changed)');
      } else {
        console.log('ℹ️ WordPress content unchanged, skipping update');
        // Still update timestamp to prevent unnecessary syncs
        localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    // Don't log errors in production - this is expected when not connected to WordPress
    if (window.location.hostname === 'localhost' || window.location.search.includes('debug=1')) {
      console.log('ℹ️ Could not sync WordPress content:', error);
    }
    return false;
  }
};

/**
 * Apply saved changes from WordPress editor
 * Note: This is now handled directly by ContentContext for better state management
 */
export const applyWordPressSavedChanges = (savedChanges: any[]) => {
  console.log('💾 Processing WordPress saved changes:', savedChanges);
  
  if (!Array.isArray(savedChanges) || savedChanges.length === 0) {
    console.warn('⚠️ No valid changes to apply');
    return;
  }
  
  // Convert changes array to content object
  const updates: Record<string, string> = {};
  savedChanges.forEach((change: any) => {
    if (change.field_name && change.field_value !== undefined) {
      updates[change.field_name] = change.field_value;
    }
  });
  
  if (Object.keys(updates).length === 0) {
    console.warn('⚠️ No valid field updates found');
    return;
  }
  
  // Save to localStorage (merge with existing)
  saveContent(updates, true);
  
  // Update last sync timestamp
  localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  
  // Dispatch event to update all components
  window.dispatchEvent(new CustomEvent('violet-content-updated', { 
    detail: updates 
  }));
  
  // Also dispatch specific WordPress sync event
  window.dispatchEvent(new CustomEvent('violet-wordpress-changes-applied', { 
    detail: { changes: savedChanges, updates } 
  }));
  
  console.log('✅ WordPress changes processed:', updates);
};

/**
 * Start automatic content sync with reduced frequency
 */
const startAutoSync = () => {
  if (syncInterval) return;
  
  // Only auto-sync in production or when in WordPress iframe
  const shouldAutoSync = window.location.hostname !== 'localhost' || 
                        window.location.search.includes('edit_mode=1');
  
  if (shouldAutoSync) {
    syncInterval = window.setInterval(() => {
      // The actual sync will be handled by ContentContext with grace period logic
      console.log('⏰ Auto-sync timer triggered (ContentContext will decide if sync needed)');
      window.dispatchEvent(new CustomEvent('violet-auto-sync-request'));
    }, SYNC_INTERVAL);
    
    console.log('🔄 Auto-sync started (every 60s)');
  }
};

/**
 * Stop automatic content sync
 */
const stopAutoSync = () => {
  if (syncInterval) {
    window.clearInterval(syncInterval);
    syncInterval = null;
    console.log('⏹️ Auto-sync stopped');
  }
};

/**
 * Initialize WordPress sync on page load
 * Note: Most sync logic is now handled by ContentContext for better state management
 */
export const initializeWordPressSync = () => {
  // Start auto-sync timer
  startAutoSync();
  
  // Listen for WordPress save messages
  const handleMessage = (event: MessageEvent) => {
    // Accept messages from WordPress admin
    const trustedOrigins = [
      'https://wp.violetrainwater.com',
      'https://violetrainwater.com',
      'http://localhost:5678' // n8n development
    ];
    
    // In iframe mode, also accept from parent
    if (window.location.search.includes('wp_admin=1') && event.origin === window.location.origin) {
      trustedOrigins.push(event.origin);
    }
    
    // Check origin if not in development
    if (window.location.hostname !== 'localhost' && !trustedOrigins.includes(event.origin)) {
      console.warn('⚠️ Ignoring message from untrusted origin:', event.origin);
      return;
    }
    
    // Note: Save messages are now handled directly by ContentContext
    // This is kept for backward compatibility
    if (event.data.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
      console.log('📨 Save message received (forwarding to ContentContext)');
      // ContentContext will handle this
    }
  };
  
  window.addEventListener('message', handleMessage);
  
  // Note: Visibility change syncing is now handled by ContentContext with grace period logic
  // Removed aggressive sync on visibility change
  
  // Handle online/offline
  const handleOnline = () => {
    console.log('🌐 Back online, requesting sync check...');
    window.dispatchEvent(new CustomEvent('violet-online-sync-request'));
  };
  
  window.addEventListener('online', handleOnline);
  
  // Return cleanup function
  return () => {
    stopAutoSync();
    window.removeEventListener('message', handleMessage);
    window.removeEventListener('online', handleOnline);
  };
};

/**
 * Force immediate sync (respects grace period in ContentContext)
 */
export const forceSyncWordPressContent = async (): Promise<boolean> => {
  console.log('🔄 Force sync requested (ContentContext will check grace period)');
  return syncWordPressContent();
};

/**
 * Get last sync timestamp
 */
export const getLastSyncTimestamp = (): Date | null => {
  const timestamp = localStorage.getItem(LAST_SYNC_KEY);
  return timestamp ? new Date(parseInt(timestamp)) : null;
};