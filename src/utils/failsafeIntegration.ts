/**
 * Failsafe Integration Bridge
 * Connects the failsafe system with existing content management
 */

import { failsafeStorage } from './failsafeContentPersistence';
import { saveContent } from './contentStorage';

// Re-export for easy access
export { failsafeStorage };

/**
 * Initialize failsafe listeners
 */
export function initializeFailsafeListeners() {
  console.log('🛡️ Initializing failsafe content listeners...');

  // Listen for WordPress saves
  window.addEventListener('message', (event) => {
    if (event.data.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
      console.log('💾 FAILSAFE: Intercepting WordPress save');
      
      // Use failsafe storage
      failsafeStorage.handleWordPressSave(event.data.savedChanges);
      
      // Also update regular storage
      const updates: any = {};
      event.data.savedChanges.forEach((change: any) => {
        updates[change.field_name] = change.field_value;
      });
      saveContent(updates);
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('violet-content-updated', { 
        detail: updates 
      }));
    }
  });

  // Add periodic integrity check
  setInterval(() => {
    const isValid = failsafeStorage.verifyIntegrity();
    if (!isValid) {
      console.warn('⚠️ FAILSAFE: Integrity check failed, attempting recovery...');
      const recovered = failsafeStorage.loadContent();
      if (Object.keys(recovered).length > 0) {
        failsafeStorage.saveContent(recovered, 'local');
      }
    }
  }, 30000); // Check every 30 seconds

  console.log('✅ Failsafe listeners initialized');
}

/**
 * Hook for components to use failsafe content
 */
export function useFailsafeContent(field: string, defaultValue: string): string {
  const content = failsafeStorage.loadContent();
  return content[field] || defaultValue;
}

/**
 * Force refresh all content
 */
export function forceContentRefresh() {
  console.log('🔄 Forcing content refresh...');
  window.location.reload();
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  initializeFailsafeListeners();
}
