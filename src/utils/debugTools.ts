// Global debug utilities for testing content persistence
// Add this to your window object for debugging

declare global {
  interface Window {
    violetDebug: {
      testSave: (fieldName: string, value: string) => void;
      clearAll: () => void;
      showContent: () => void;
      simulateWordPressSave: (changes: Array<{field_name: string, field_value: string}>) => void;
    };
  }
}

export const initializeDebugTools = () => {
  if (typeof window === 'undefined') return;
  
  // Don't reinitialize if already exists
  if (window.violetDebug) {
    console.log('🛠️ Debug tools already initialized');
    return;
  }

  window.violetDebug = {
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
      console.log('✅ Content cleared. Refresh page to see changes.');
    },

    // Show current content
    showContent: () => {
      const raw = localStorage.getItem('violet-content');
      console.log('📦 Raw localStorage:', raw);
      
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          console.log('📄 Parsed content:', parsed);
          console.table(parsed.content);
        } catch (e) {
          console.error('❌ Failed to parse content:', e);
        }
      } else {
        console.log('📭 No content in localStorage');
      }
    },

    // Simulate a WordPress save message
    simulateWordPressSave: (changes) => {
      console.log('🎭 Simulating WordPress save with changes:', changes);
      
      window.postMessage({
        type: 'violet-apply-saved-changes',
        savedChanges: changes,
        timestamp: Date.now()
      }, window.location.origin);
      
      console.log('✅ Message posted. Check console for processing logs.');
    }
  };

  console.log(`
🛠️ Violet Debug Tools Loaded!
Available commands:

window.violetDebug.testSave('hero_title', 'New Title')
window.violetDebug.clearAll()
window.violetDebug.showContent()
window.violetDebug.simulateWordPressSave([
  { field_name: 'hero_title', field_value: 'Test Title' },
  { field_name: 'hero_subtitle', field_value: 'Test Subtitle' }
])
  `);
};

export default initializeDebugTools;
