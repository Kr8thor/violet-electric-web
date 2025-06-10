/**
 * Content Persistence Fix
 * This fix ensures that saved content from WordPress is properly displayed in React components
 */

import { saveContent, getAllContentSync } from './contentStorage';
import { tripleFailsafe } from './tripleFailsafeSystem';

// Global flag to track initialization
let isInitialized = false;

/**
 * Force all EditableText components to re-render with new content
 */
export const forceComponentUpdate = async () => {
  console.log('🔄 TRIPLE FAILSAFE: Forcing component updates...');
  
  // Method 1: Dispatch a custom event that components can listen to
  window.dispatchEvent(new CustomEvent('violet-force-component-update'));
  
  // Method 2: Update all data attributes using triple failsafe content
  const components = document.querySelectorAll('[data-violet-field]');
  const content = await tripleFailsafe.loadContentWithFailover();
  
  components.forEach(comp => {
    const field = comp.dataset.violetField;
    const newValue = content[field];
    
    if (newValue && newValue !== comp.textContent) {
      console.log(`📝 TRIPLE FAILSAFE: Updating ${field}: "${comp.textContent}" → "${newValue}"`);
      comp.dataset.violetValue = newValue;
      
      // Force React to notice the change by modifying a key prop
      if (comp.key) {
        comp.key = `${field}-${Date.now()}`;
      }
    }
  });
  
  // Method 3: Trigger a state update in React
  const event = new CustomEvent('violet-content-persisted', {
    detail: { content, timestamp: Date.now() }
  });
  window.dispatchEvent(event);
};

/**
 * Handle WordPress save messages with proper persistence
 */
const handleWordPressSave = async (savedChanges) => {
  console.log('💾 TRIPLE FAILSAFE: Processing WordPress save:', savedChanges);
  
  if (!Array.isArray(savedChanges) || savedChanges.length === 0) {
    console.warn('⚠️ Invalid saved changes format');
    return;
  }
  
  // Convert to content object format for triple failsafe
  const updates = savedChanges.map(change => ({
    field_name: change.field_name,
    field_value: change.field_value || ''
  }));
  
  if (updates.length === 0) {
    console.warn('⚠️ No valid updates found');
    return;
  }
  
  // Save to triple failsafe system (all 3 layers)
  try {
    await tripleFailsafe.saveToAllLayers(updates);
    console.log('✅ TRIPLE FAILSAFE: Content saved to all 3 layers:', updates);
  } catch (error) {
    console.error('❌ TRIPLE FAILSAFE: Save error:', error);
  }
  
  // Also save to regular storage for backward compatibility
  const contentUpdates = {};
  savedChanges.forEach(change => {
    if (change.field_name && change.field_value !== undefined) {
      contentUpdates[change.field_name] = change.field_value;
    }
  });
  saveContent(contentUpdates, true);
  
  // Force immediate component update
  forceComponentUpdate();
  
  // Also dispatch specific events for React
  window.dispatchEvent(new CustomEvent('violet-wordpress-changes-applied', {
    detail: { updates: contentUpdates, timestamp: Date.now() }
  }));
  
  // If in development, show a visual confirmation
  if (import.meta.env.DEV) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      z-index: 99999;
      font-weight: bold;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = '✅ TRIPLE FAILSAFE: Content saved to all layers!';
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }
};

/**
 * Enhanced message listener that ensures saves are processed
 */
const enhancedMessageListener = (event) => {
  // Handle WordPress save messages
  if (event.data && event.data.type === 'violet-apply-saved-changes') {
    console.log('📨 Received WordPress save message');
    
    if (event.data.savedChanges) {
      handleWordPressSave(event.data.savedChanges);
    }
  }
  
  // Handle content refresh requests
  if (event.data && event.data.type === 'violet-content-updated') {
    console.log('🔄 Content update requested');
    forceComponentUpdate();
  }
};

/**
 * Initialize the persistence fix
 */
export const initializeWordPressPersistence = () => {
  if (isInitialized) {
    console.log('⚠️ WordPress persistence already initialized');
    return;
  }
  
  console.log('🚀 Initializing WordPress persistence fix...');
  
  // Remove any existing listeners to avoid duplicates
  window.removeEventListener('message', enhancedMessageListener);
  
  // Add enhanced message listener
  window.addEventListener('message', enhancedMessageListener);
  
  // Listen for custom save events
  window.addEventListener('violet-wordpress-save-complete', (event) => {
    console.log('📢 WordPress save complete event received');
    if (event.detail && event.detail.updates) {
      const changes = Object.entries(event.detail.updates).map(([field_name, field_value]) => ({
        field_name,
        field_value
      }));
      handleWordPressSave(changes);
    }
  });
  
  // Listen for content sync events
  window.addEventListener('violet-content-synced', (event) => {
    console.log('🔄 Content synced from WordPress');
    forceComponentUpdate();
  });
  
  // Add CSS for notifications
  if (!document.getElementById('violet-persistence-styles')) {
    const style = document.createElement('style');
    style.id = 'violet-persistence-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Export helper functions to window for debugging
  if (import.meta.env.DEV) {
    window.violetPersistence = {
      forceUpdate: forceComponentUpdate,
      testSave: (field, value) => {
        handleWordPressSave([{ field_name: field, field_value: value }]);
      },
      checkContent: () => {
        const stored = getAllContentSync();
        console.log('📦 Stored content:', stored);
        
        const components = document.querySelectorAll('[data-violet-field]');
        console.log(`🔍 Found ${components.length} components:`);
        components.forEach(comp => {
          const field = comp.dataset.violetField;
          const displayed = comp.textContent;
          const stored = getAllContentSync()[field] || '';
          const match = displayed === stored;
          console.log(`  ${field}: "${displayed}" ${match ? '✅' : '❌'} (stored: "${stored}")`);
        });
      }
    };
    
    console.log('🛠️ Debug helpers available: window.violetPersistence');
  }
  
  isInitialized = true;
  console.log('✅ WordPress persistence fix initialized');
  
  // Initial content sync
  setTimeout(() => {
    console.log('🔄 Running initial content sync...');
    forceComponentUpdate();
  }, 1000);
};

// Auto-initialize if in WordPress iframe
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  const isInWordPress = urlParams.get('edit_mode') === '1' && urlParams.get('wp_admin') === '1';
  
  if (isInWordPress) {
    console.log('🎯 Detected WordPress iframe environment');
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeWordPressPersistence);
    } else {
      initializeWordPressPersistence();
    }
  }
}