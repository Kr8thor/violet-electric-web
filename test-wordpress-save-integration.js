// WORDPRESS SAVE FIX TEST
// Run this in the WordPress admin console to test the exact issue

console.log('🧪 Testing WordPress Save Integration...\n');

// Step 1: Check if iframe exists
const iframe = document.getElementById('violet-site-iframe');
if (!iframe) {
  console.error('❌ No iframe found! Make sure you\'re on the editor page.');
} else {
  console.log('✅ Found iframe');
  
  // Step 2: Send a test save message
  console.log('📤 Sending test save message...');
  
  const testMessage = {
    type: 'violet-apply-saved-changes',
    savedChanges: [{
      field_name: 'hero_title',
      field_value: 'PERSISTENCE TEST: ' + new Date().toLocaleTimeString()
    }],
    timestamp: Date.now(),
    syncDelay: 30000
  };
  
  // Get the correct origin from the iframe src
  const iframeSrc = iframe.src;
  const iframeOrigin = new URL(iframeSrc).origin;
  
  console.log('Target origin:', iframeOrigin);
  
  iframe.contentWindow.postMessage(testMessage, iframeOrigin);
  
  console.log('✅ Message sent. Check React console for response.');
  console.log('\n👉 Now check if the hero title changed in the iframe.');
  console.log('If it didn\'t change, the issue is in message handling.');
  
  // Step 3: Try querying the content directly
  setTimeout(() => {
    try {
      const heroTitle = iframe.contentWindow.document.querySelector('[data-violet-field="hero_title"]');
      if (heroTitle) {
        console.log('\n📊 Current hero title in iframe:', heroTitle.textContent);
        if (heroTitle.textContent.includes('PERSISTENCE TEST')) {
          console.log('✅ Content updated successfully!');
        } else {
          console.log('❌ Content not updated - check React message handlers');
        }
      }
    } catch (e) {
      console.log('⚠️ Cannot access iframe content (cross-origin)');
    }
  }, 2000);
}