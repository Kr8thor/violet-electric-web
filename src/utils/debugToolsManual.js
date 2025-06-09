// Quick console script to initialize debug tools if they're not loaded
// Copy and paste this entire block into the console if window.violetDebug is undefined

(() => {
  if (window.violetDebug) {
    console.log('✅ Debug tools already loaded');
    return;
  }

  console.log('🔧 Manually initializing debug tools...');

  window.violetDebug = {
    testSave: (fieldName, value) => {
      console.log(`🧪 Testing save: ${fieldName} = ${value}`);
      
      try {
        const STORAGE_KEY = 'violet-content';
        const stored = localStorage.getItem(STORAGE_KEY);
        let data = stored ? JSON.parse(stored) : { version: 'v1', timestamp: Date.now(), content: {} };
        
        data.content[fieldName] = value;
        data.timestamp = Date.now();
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('💾 Saved successfully');
        console.log('📦 Current content:', data.content);
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('violet-content-updated', { detail: data.content }));
        
      } catch (error) {
        console.error('❌ Save failed:', error);
      }
    },

    clearAll: () => {
      console.log('🗑️ Clearing all content...');
      localStorage.removeItem('violet-content');
      console.log('✅ Content cleared. Refresh page to see changes.');
    },

    showContent: () => {
      const raw = localStorage.getItem('violet-content');
      console.log('📦 Raw localStorage:', raw);
      
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          console.log('📄 Parsed content:', parsed);
          console.table(parsed.content || {});
        } catch (e) {
          console.error('❌ Failed to parse content:', e);
        }
      } else {
        console.log('📭 No content in localStorage');
      }
    },

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
✅ Debug tools manually initialized!

Available commands:
window.violetDebug.testSave('hero_title', 'New Title')
window.violetDebug.clearAll()
window.violetDebug.showContent()
window.violetDebug.simulateWordPressSave([
  { field_name: 'hero_title', field_value: 'Test Title' }
])
  `);
})();
