// Temporary fix while waiting for Netlify deployment
// Run this in the console right now to test persistence

console.log('🔧 Installing temporary save handler...');

// Create the save function manually
window.saveWordPressContent = function(changes) {
  console.log('💾 Temporary save handler called with:', changes);
  
  try {
    // Get existing content
    const existingRaw = localStorage.getItem('violet-content');
    let existing = {};
    
    if (existingRaw) {
      try {
        const parsed = JSON.parse(existingRaw);
        existing = parsed.content || parsed;
      } catch (e) {
        console.error('Failed to parse existing content:', e);
      }
    }
    
    // Apply changes
    const newContent = { ...existing };
    
    if (Array.isArray(changes)) {
      changes.forEach(change => {
        if (change.field_name && change.field_value !== undefined) {
          newContent[change.field_name] = change.field_value;
          console.log(`✅ Set ${change.field_name} = "${change.field_value}"`);
        }
      });
    }
    
    // Save to localStorage
    const toSave = {
      version: 'v1',
      timestamp: Date.now(),
      content: newContent
    };
    
    localStorage.setItem('violet-content', JSON.stringify(toSave));
    console.log('💾 Saved to localStorage:', toSave);
    
    // Force reload
    setTimeout(() => {
      console.log('🔄 Reloading page...');
      window.location.reload();
    }, 500);
    
    return true;
  } catch (error) {
    console.error('❌ Error saving:', error);
    return false;
  }
};

// Also add message listener
window.addEventListener('message', (event) => {
  console.log('📨 Message received:', event.data?.type);
  
  if (event.data?.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
    console.log('💾 Processing WordPress save message...');
    window.saveWordPressContent(event.data.savedChanges);
  }
});

console.log('✅ Temporary save handler installed!');
console.log('You can now test with: window.saveWordPressContent([{field_name: "hero_title", field_value: "Test"}])');

// Test it immediately
const testResult = window.saveWordPressContent([{
  field_name: 'hero_title',
  field_value: 'TEMP FIX: Working! ' + new Date().toTimeString()
}]);

console.log('Test result:', testResult);
