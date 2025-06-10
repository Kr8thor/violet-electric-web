// Global debug utilities for testing content persistence
// Enhanced with content state management debugging

import { initializeContentDebugTools } from './contentDebugTools';

declare global {
  interface Window {
    violetDebug: {
      // Original debug tools
      testSave: (fieldName: string, value: string) => void;
      clearAll: () => void;
      showContent: () => void;
      simulateWordPressSave: (changes: Array<{field_name: string, field_value: string}>) => void;
      
      // Enhanced content state tools
      getContentState: () => any;
      getCachedState: () => any;
      getLastSync: () => Date | null;
      getLastSave: () => Date | null;
      forceSync: () => Promise<void>;
      clearCache: () => void;
      simulateSave: (field: string, value: string) => void;
      isInGracePeriod: () => boolean;
      getGracePeriodRemaining: () => number;
      enableLogging: () => void;
      disableLogging: () => void;
    };
  }
}

export const initializeDebugTools = () => {
  if (typeof window === 'undefined') return;
  
  // Don't reinitialize if already exists
  if (window.violetDebug && window.violetDebug.getContentState) {
    console.log('🛠️ Debug tools already initialized');
    return;
  }

  // Initialize the enhanced content debug tools first
  initializeContentDebugTools();
  
  // Add the original debug tools
  const originalTools = {
    // Test saving a single field
    testSave: (fieldName: string, value: string) => {
      console.log(`🧪 Testing save: ${fieldName} = ${value}`);
      
      // Import at runtime to avoid circular dependencies
      import('@/utils/contentStorage').then(({ saveContent, getAllContentSync }) => {
        const result = saveContent({ [fieldName]: value });
        console.log('💾 Save result:', result);
        
        const current = getAllContentSync();
        console.log('📦 Current content:', current);
        console.log(`✅ Field value: ${current[fieldName]}`);
      });
    },

    // Clear all content
    clearAll: () => {
      console.log('🗑️ Clearing all content...');
      localStorage.removeItem('violet-content');
      localStorage.removeItem('violet-content-state');
      localStorage.removeItem('violet-content-cache');
      localStorage.removeItem('violet-last-sync-timestamp');
      console.log('✅ All content cleared. Refresh page to see changes.');
    },

    // Show current content
    showContent: () => {
      const raw = localStorage.getItem('violet-content');
      console.log('📦 Raw localStorage:', raw);
      
      try {
        const parsed = raw ? JSON.parse(raw) : {};
        console.log('📝 Parsed content:', parsed);
        console.table(parsed);
      } catch (e) {
        console.error('❌ Failed to parse content:', e);
      }
    },

    // Simulate a WordPress save message
    simulateWordPressSave: (changes: Array<{field_name: string, field_value: string}>) => {
      console.log('🔧 Simulating WordPress save...', changes);
      
      // Simulate the postMessage from WordPress
      window.postMessage({
        type: 'violet-apply-saved-changes',
        savedChanges: changes,
        timestamp: Date.now(),
        syncDelay: 30000
      }, window.location.origin);
      
      console.log('✅ Save message sent. Check content with showContent()');
    }
  };
  
  // Merge with existing tools
  window.violetDebug = {
    ...window.violetDebug,
    ...originalTools
  };

  console.log(`
🛠️ Violet Debug Tools Enhanced!

Quick test commands:
1. Test if saves persist:
   violetDebug.simulateSave('hero_title', 'Test ' + Date.now())
   
2. Check grace period:
   violetDebug.isInGracePeriod()
   violetDebug.getGracePeriodRemaining()
   
3. View content state:
   violetDebug.getContentState()
   
4. Force sync (after grace period):
   violetDebug.forceSync()
  `);
};

export default initializeDebugTools;