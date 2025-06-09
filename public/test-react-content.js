// Test script for React app console
// Run this in the React app tab (not WordPress admin)

console.log('🧪 Testing React Content System...\n');

// Check what's in localStorage
console.log('📦 Checking all localStorage keys:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  if (key && !key.includes('debug') && !key.includes('analytics')) {
    console.log(`  ${key}: ${value?.substring(0, 50)}...`);
  }
}

// Check if EditableText components exist
console.log('\n🔍 Looking for EditableText components:');
const editableElements = document.querySelectorAll('[data-violet-field]');
console.log(`Found ${editableElements.length} editable elements`);

if (editableElements.length === 0) {
  // Look for any text that should be editable
  console.log('\n📝 Looking for hero text:');
  const heroSection = document.querySelector('h1');
  if (heroSection) {
    console.log('H1 content:', heroSection.textContent);
    console.log('H1 HTML:', heroSection.innerHTML.substring(0, 200) + '...');
  }
}

// Test if we can trigger a content update
console.log('\n🔄 Testing content update event:');
window.dispatchEvent(new CustomEvent('violet-content-updated', {
  detail: {
    hero_title: 'Test Update ' + new Date().toLocaleTimeString()
  }
}));

// Listen for postMessage from WordPress
console.log('\n👂 Listening for WordPress messages:');
window.addEventListener('message', (event) => {
  console.log('📨 Message received:', {
    origin: event.origin,
    type: event.data?.type,
    data: event.data
  });
  
  // If it's a save message, log the details
  if (event.data?.type === 'violet-apply-saved-changes') {
    console.log('💾 Save message details:', event.data.savedChanges);
  }
});

console.log('\n✅ Test script complete. Try editing in WordPress admin and saving.');
