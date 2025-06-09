// Test script for WordPress content persistence
// Run this in the browser console on https://lustrous-dolphin-447351.netlify.app/

console.log('🧪 Testing WordPress Content Persistence...\n');

// 1. Check if content is stored
const storedContent = localStorage.getItem('violet-content');
if (storedContent) {
    console.log('✅ Content found in localStorage:');
    console.log(JSON.parse(storedContent));
} else {
    console.log('❌ No content in localStorage yet');
}

// 2. Check if in WordPress iframe
const inIframe = window.parent !== window;
const editMode = new URLSearchParams(window.location.search).get('edit_mode') === '1';
console.log(`\n📍 In iframe: ${inIframe}`);
console.log(`✏️ Edit mode: ${editMode}`);

// 3. Test content update event
console.log('\n🔄 Testing content update system...');
window.addEventListener('violet-content-updated', (e) => {
    console.log('✅ Content update event received:', e.detail);
}, { once: true });

// 4. Simulate content update
const testContent = {
    hero_title: 'Test Title - ' + new Date().toLocaleTimeString(),
    hero_subtitle: 'Test Subtitle - ' + new Date().toLocaleTimeString()
};

console.log('\n📤 Dispatching test content update...');
window.dispatchEvent(new CustomEvent('violet-content-updated', {
    detail: testContent
}));

// 5. Check EditableText elements
console.log('\n🔍 Checking editable elements:');
const editableElements = document.querySelectorAll('[data-violet-field]');
console.log(`Found ${editableElements.length} editable elements:`);
editableElements.forEach(el => {
    console.log(`- Field: ${el.dataset.violetField}, Text: "${el.textContent.substring(0, 50)}..."`);
});

console.log('\n✅ Test complete! If content persistence is working:');
console.log('1. You should see content in localStorage');
console.log('2. Content update events should fire');
console.log('3. Editable elements should be marked with data-violet-field');
console.log('\n💡 To test WordPress save:');
console.log('1. Edit text in WordPress admin iframe');
console.log('2. Click "Save All Changes" in blue toolbar');
console.log('3. Refresh this page - content should persist');
