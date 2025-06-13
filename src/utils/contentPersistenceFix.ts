// Enhanced content persistence with immediate initialization
import { saveContent, getAllContentSync } from './contentStorage';

export interface SavedChange {
  field_name: string;
  field_value: string;
  field_type?: string;
}

// Debug logger with timestamp
const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🔧 ContentPersistence: ${message}`, data || '');
};

// Track if we've initialized
let initialized = false;

// Apply saved changes from WordPress
export const applyWordPressSavedChanges = (savedChanges: SavedChange[]): boolean => {
  debugLog('Applying saved changes from WordPress', savedChanges);
  
  if (!Array.isArray(savedChanges) || savedChanges.length === 0) {
    debugLog('ERROR: No valid changes to apply');
    return false;
  }

  try {
    // Convert array of changes to content object
    const contentToSave: Record<string, string> = {};
    
    savedChanges.forEach((change, index) => {
      debugLog(`Processing change ${index + 1}/${savedChanges.length}`, change);
      
      if (change.field_name && change.field_value !== undefined) {
        contentToSave[change.field_name] = change.field_value;
        debugLog(`Added to save: ${change.field_name} = "${change.field_value}"`);
      } else {
        debugLog(`WARNING: Invalid change structure`, change);
      }
    });

    // Save to localStorage
    debugLog('Saving content to localStorage', contentToSave);
    const saveResult = saveContent(contentToSave, true); // merge with existing
    
    if (saveResult) {
      debugLog('✅ Content saved successfully to localStorage');
      
      // Verify the save
      const verifyContent = getAllContentSync();
      debugLog('Verification - Current localStorage content:', verifyContent);
      
      // Check if our changes were applied
      let allApplied = true;
      Object.entries(contentToSave).forEach(([field, value]) => {
        if (verifyContent[field] !== value) {
          debugLog(`ERROR: Field ${field} was not saved correctly. Expected: "${value}", Got: "${verifyContent[field]}"`);
          allApplied = false;
        } else {
          debugLog(`✅ Verified: ${field} = "${value}"`);
        }
      });
      
      // Dispatch update event
      window.dispatchEvent(new CustomEvent('violet-content-persisted', {
        detail: {
          content: verifyContent,
          changes: contentToSave,
          timestamp: Date.now()
        }
      }));
      
      // Don't force reload - let React handle updates reactively
      if (allApplied) {
        debugLog('✅ Content applied successfully - React will update automatically');
        // Removed: window.location.reload();
      }
      
      return allApplied;
    } else {
      debugLog('❌ Failed to save content to localStorage');
      return false;
    }
  } catch (error) {
    debugLog('ERROR: Exception during save', error);
    return false;
  }
};

// Initialize message listener for WordPress communication
export const initializeWordPressPersistence = () => {
  if (initialized) {
    debugLog('Already initialized, skipping...');
    return;
  }
  
  initialized = true;
  debugLog('Initializing WordPress persistence listener');
  
  const handleMessage = (event: MessageEvent) => {
    // Log ALL messages for debugging
    console.log('🎯 React received message:', { 
      type: event.data?.type, 
      origin: event.origin,
      data: event.data 
    });
    
    // Handle saved changes from WordPress - check for correct message type
    if (event.data && (
      event.data.type === 'violet-apply-saved-changes' || 
      event.data.type === 'violet-save-content' ||
      event.data.type === 'violet-persist-content'
    )) {
      debugLog('🎯 Received save message type: ' + event.data.type, event.data);
      
      // Handle different message formats
      let changesToApply: SavedChange[] = [];
      
      if (event.data.savedChanges) {
        changesToApply = event.data.savedChanges;
      } else if (event.data.content) {
        // Convert content object to changes array
        changesToApply = Object.entries(event.data.content).map(([field_name, field_value]) => ({
          field_name,
          field_value: field_value as string
        }));
      }
      
      if (changesToApply.length > 0) {
        const success = applyWordPressSavedChanges(changesToApply);
        
        // Send confirmation back to WordPress
        if (event.source) {
          const response = {
            type: 'violet-save-confirmation',
            success,
            timestamp: Date.now(),
            savedFields: changesToApply.map(c => c.field_name)
          };
          
          debugLog('Sending confirmation to WordPress', response);
          (event.source as Window).postMessage(response, event.origin);
        }
        
        // Show visual notification
        showSaveNotification(success);
      }
    }
  };
  
  window.addEventListener('message', handleMessage);
  debugLog('✅ WordPress persistence listener initialized and listening for messages');
  
  // Also listen for the specific content changed event from WordPressEditor
  window.addEventListener('violet-content-changed', (event: any) => {
    debugLog('Received violet-content-changed event', event.detail);
  });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
    initialized = false;
  };
};

// Show visual notification
const showSaveNotification = (success: boolean) => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${success ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = success ? '✅ Content saved and persisted!' : '❌ Failed to save content';
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      document.body.removeChild(notification);
      document.head.removeChild(style);
    }, 300);
  }, 3000);
};

// Debug helper to check current state
export const debugContentState = () => {
  const content = getAllContentSync();
  const rawStorage = localStorage.getItem('violet-content');
  
  console.group('🔍 Content Persistence Debug State');
  console.log('Current content from getAllContentSync():', content);
  console.log('Raw localStorage violet-content:', rawStorage);
  console.log('Number of fields:', Object.keys(content).length);
  console.log('Sample values:');
  console.log('  hero_title:', content.hero_title);
  console.log('  hero_subtitle:', content.hero_subtitle);
  console.log('  hero_cta:', content.hero_cta);
  console.groupEnd();
  
  return content;
};

// Export for window access in development
if (typeof window !== 'undefined') {
  (window as any).violetDebug = {
    checkContent: debugContentState,
    applyChanges: applyWordPressSavedChanges,
    testSave: () => {
      const testChanges = [
        { field_name: 'hero_title', field_value: 'TEST: This is a test title' },
        { field_name: 'hero_subtitle', field_value: 'TEST: This is a test subtitle' }
      ];
      return applyWordPressSavedChanges(testChanges);
    }
  };
  
  debugLog('Debug tools available at window.violetDebug');
}

// Auto-initialize if in iframe
if (typeof window !== 'undefined' && window.parent !== window) {
  initializeWordPressPersistence();
}
