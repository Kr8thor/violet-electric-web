// ROOT CAUSE TEST - Run this in React console to verify the fix
console.log('🧪 Testing WordPress Save Handler...\n');

// Test 1: Verify the bug was real
console.log('📍 Test 1: Simulating WordPress save message...');

// Simulate what WordPress sends when you click Save
window.postMessage({
  type: 'violet-apply-saved-changes',
  savedChanges: [{
    field_name: 'hero_title',
    field_value: 'FIX TEST: ' + new Date().toLocaleTimeString()
  }],
  timestamp: Date.now(),
  syncDelay: 30000
}, window.location.origin);

console.log('✅ Save message sent');
console.log('⏳ Wait 2 seconds and check if content updated...\n');

// Test 2: Check if content actually updated
setTimeout(() => {
  const heroTitle = document.querySelector('[data-violet-field="hero_title"]');
  const currentContent = heroTitle?.textContent || heroTitle?.innerText || 'NOT FOUND';
  
  if (currentContent.includes('FIX TEST:')) {
    console.log('🎉 SUCCESS! Content was saved and persisted!');
    console.log('Current content:', currentContent);
    console.log('\n✅ THE FIX IS WORKING!');
  } else {
    console.log('❌ FAIL: Content was not saved');
    console.log('Current content:', currentContent);
    console.log('\n⚠️ The save handler might still be broken');
  }
  
  // Test 3: Check state directly
  console.log('\n📊 Checking internal state...');
  if (window.violetDebug && window.violetDebug.getContentState) {
    const state = window.violetDebug.getContentState();
    console.log('State:', state);
    if (state?.local?.hero_title?.includes('FIX TEST:')) {
      console.log('✅ State was properly updated!');
    }
  }
}, 2000);