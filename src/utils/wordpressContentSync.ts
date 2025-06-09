/**
 * WordPress Content Sync Utility
 * Ensures WordPress content always takes priority over local storage
 */

import { saveContent } from './contentStorage';

const WORDPRESS_API_URL = 'https://wp.violetrainwater.com/wp-json/violet/v1/content';

/**
 * Fetch fresh content from WordPress and update local storage
 */
export const syncWordPressContent = async (): Promise<boolean> => {
  try {
    console.log('🔄 Syncing content from WordPress...');
    
    const response = await fetch(WORDPRESS_API_URL);
    if (!response.ok) {
      console.warn('⚠️ WordPress API not available:', response.status);
      return false;
    }
    
    const wpContent = await response.json();
    console.log('✅ WordPress content received:', wpContent);
    
    if (wpContent && Object.keys(wpContent).length > 0) {
      // Save to localStorage, replacing all existing content
      saveContent(wpContent, false); // false = don't merge, replace completely
      
      // Dispatch event to update all components
      window.dispatchEvent(new CustomEvent('violet-content-synced', { 
        detail: { content: wpContent, source: 'wordpress' } 
      }));
      
      console.log('💾 WordPress content synced successfully');
      return true;
    }
    
    return false;
  } catch (error) {
    console.log('ℹ️ Could not sync WordPress content (this is normal in development):', error);
    return false;
  }
};

/**
 * Apply saved changes from WordPress editor
 */
export const applyWordPressSavedChanges = (savedChanges: any[]) => {
  console.log('💾 Applying WordPress saved changes:', savedChanges);
  
  // Convert changes array to content object
  const updates: Record<string, string> = {};
  savedChanges.forEach((change: any) => {
    if (change.field_name && change.field_value !== undefined) {
      updates[change.field_name] = change.field_value;
    }
  });
  
  // Save to localStorage
  saveContent(updates, true); // true = merge with existing
  
  // Dispatch event to update all components
  window.dispatchEvent(new CustomEvent('violet-content-updated', { 
    detail: updates 
  }));
  
  // Also dispatch specific WordPress sync event
  window.dispatchEvent(new CustomEvent('violet-wordpress-changes-applied', { 
    detail: { changes: savedChanges, updates } 
  }));
  
  console.log('✅ WordPress changes applied:', updates);
};

/**
 * Initialize WordPress sync on page load
 */
export const initializeWordPressSync = () => {
  // Sync on page load
  syncWordPressContent();
  
  // Listen for WordPress save messages
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
      applyWordPressSavedChanges(event.data.savedChanges);
    }
  };
  
  window.addEventListener('message', handleMessage);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
  };
};
