// 🚀 QUICK FIX SCRIPT - Copy and paste this entire block into your browser console

console.log('🔧 Running Violet Content Quick Fix...\n');

// Step 1: Check if debug tools exist
if (!window.violetDebug) {
  console.log('❌ Debug tools not found. Creating them now...');
  
  window.violetDebug = {
    testSave: (fieldName, value) => {
      const STORAGE_KEY = 'violet-content';
      const stored = localStorage.getItem(STORAGE_KEY);
      let data = stored ? JSON.parse(stored) : { version: 'v1', timestamp: Date.now(), content: {} };
      data.content[fieldName] = value;
      data.timestamp = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Saved:', fieldName, '=', value);
      window.dispatchEvent(new CustomEvent('violet-content-updated', { detail: data.content }));
      return true;
    },
    showContent: () => {
      const raw = localStorage.getItem('violet-content');
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log('📦 Content:', parsed.content);
        console.table(parsed.content || {});
      } else {
        console.log('📭 No content in localStorage');
      }
    }
  };
  console.log('✅ Debug tools created!\n');
} else {
  console.log('✅ Debug tools already exist\n');
}

// Step 2: Check localStorage
console.log('📦 Checking localStorage...');
const currentContent = localStorage.getItem('violet-content');
if (currentContent) {
  try {
    const parsed = JSON.parse(currentContent);
    console.log('✅ Found content with', Object.keys(parsed.content || {}).length, 'fields');
    console.table(parsed.content || {});
  } catch (e) {
    console.log('❌ Content exists but is corrupted. Fixing...');
    localStorage.removeItem('violet-content');
    console.log('✅ Cleared corrupted content');
  }
} else {
  console.log('📭 No content in localStorage yet');
}

// Step 3: Test save functionality
console.log('\n🧪 Testing save functionality...');
const testValue = 'Test at ' + new Date().toLocaleTimeString();
window.violetDebug.testSave('test_field', testValue);

const afterTest = localStorage.getItem('violet-content');
if (afterTest && JSON.parse(afterTest).content.test_field === testValue) {
  console.log('✅ Save functionality working!');
} else {
  console.log('❌ Save functionality not working properly');
}

// Step 4: Show current content
console.log('\n📋 Current content:');
window.violetDebug.showContent();

console.log('\n✅ Quick fix complete! Available commands:');
console.log('window.violetDebug.testSave("hero_title", "New Title")');
console.log('window.violetDebug.showContent()');
