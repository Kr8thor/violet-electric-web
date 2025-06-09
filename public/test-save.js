// Quick test to verify save functionality
console.log('🧪 Testing WordPress save functionality...\n');

// Test 1: Check if save function exists
console.group('Test 1: Check global functions');
console.log('window.saveWordPressContent exists?', typeof window.saveWordPressContent === 'function');
console.log('window.violetDebug exists?', typeof window.violetDebug === 'object');
console.groupEnd();

// Test 2: Check current content
console.group('Test 2: Current content');
const current = localStorage.getItem('violet-content');
if (current) {
  try {
    const parsed = JSON.parse(current);
    console.log('Content exists:', parsed);
  } catch (e) {
    console.log('Content exists but failed to parse:', e);
  }
} else {
  console.log('No content in localStorage');
}
console.groupEnd();

// Test 3: Test direct save
console.group('Test 3: Test direct save');
const testChanges = [
  {
    field_name: 'hero_title',
    field_value: 'DIRECT SAVE TEST: ' + new Date().toTimeString()
  }
];

console.log('Calling saveWordPressContent with:', testChanges);
if (window.saveWordPressContent) {
  window.saveWordPressContent(testChanges);
  console.log('✅ Save function called - page should reload in 500ms');
} else {
  console.error('❌ saveWordPressContent function not found!');
}
console.groupEnd();

// Test 4: Test postMessage
console.group('Test 4: Test postMessage');
console.log('Sending test postMessage...');
window.postMessage({
  type: 'violet-apply-saved-changes',
  savedChanges: [
    {
      field_name: 'hero_subtitle',
      field_value: 'POSTMESSAGE TEST: ' + new Date().toTimeString()
    }
  ]
}, window.location.origin);
console.log('✅ Message sent - check console for handler logs');
console.groupEnd();

console.log('\n🎯 Tests complete. If saves work, the page will reload showing new content.');
