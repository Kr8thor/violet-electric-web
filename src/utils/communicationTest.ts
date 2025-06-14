/**
 * WordPress Communication Test Utility
 * Use this to verify Phase 1 is working correctly
 */

export const testWordPressCommunication = () => {
  console.log('🧪 Testing WordPress Communication Phase 1...');
  
  // Test 1: Check if we're in WordPress context
  const urlParams = new URLSearchParams(window.location.search);
  const isWordPressContext = urlParams.has('edit_mode') && urlParams.has('wp_admin');
  const inIframe = window.parent !== window.self;
  
  console.log('📋 Context Check:');
  console.log('  - WordPress context:', isWordPressContext);
  console.log('  - In iframe:', inIframe);
  console.log('  - URL params:', Object.fromEntries(urlParams.entries()));
  
  // Test 2: Check if communication module is loaded
  let communicationLoaded = false;
  try {
    const { wordPressCommunication } = require('../utils/WordPressCommunication');
    communicationLoaded = !!wordPressCommunication;
  } catch (e) {
    console.log('  - Communication module error:', e.message);
  }
  
  console.log('  - Communication module loaded:', communicationLoaded);
  
  // Test 3: Send test message if in WordPress context
  if (isWordPressContext && inIframe) {
    console.log('🔄 Sending test message to WordPress...');
    
    window.parent.postMessage({
      type: 'violet-communication-test',
      data: {
        phase: 1,
        status: 'testing',
        timestamp: Date.now(),
        message: 'Phase 1 communication test from React app'
      }
    }, '*');
    
    console.log('📤 Test message sent');
  }
  
  // Test 4: Listen for response
  const testListener = (event: MessageEvent) => {
    if (event.data?.type === 'violet-communication-test-response') {
      console.log('✅ Received response from WordPress:', event.data);
      window.removeEventListener('message', testListener);
    }
  };
  
  window.addEventListener('message', testListener);
  
  // Clean up listener after 5 seconds
  setTimeout(() => {
    window.removeEventListener('message', testListener);
  }, 5000);
  
  // Return test results
  return {
    wordPressContext: isWordPressContext,
    inIframe,
    communicationLoaded,
    testSent: isWordPressContext && inIframe
  };
};

// Auto-run test in development
if (import.meta.env?.DEV) {
  // Run test after a short delay to ensure everything is loaded
  setTimeout(() => {
    testWordPressCommunication();
  }, 2000);
}