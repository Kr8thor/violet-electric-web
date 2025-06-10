/**
 * Comprehensive Content Flow Test
 * Run this in your React app to test the entire content persistence flow
 */

console.log(`
🧪 CONTENT PERSISTENCE TEST SUITE
═══════════════════════════════════════════════════════════════
This test will verify the entire content flow from WordPress to React
`);

// Test Configuration
const TEST_FIELD = 'hero_title';
const TEST_VALUE = `TEST ${new Date().toLocaleTimeString()}`;
const ORIGINAL_VALUE = 'Change the Channel.';

// Test Results Storage
const results = {
  wordpressApi: false,
  localStorage: false,
  componentUpdate: false,
  messageHandling: false,
  contextUpdate: false
};

// Step 1: Check current state
console.log('\n📋 STEP 1: Checking current state...');

const checkCurrentState = () => {
  // Check localStorage
  const stored = localStorage.getItem('violet-content');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const content = parsed.content || parsed;
      console.log(`  localStorage ${TEST_FIELD}:`, content[TEST_FIELD] || 'not found');
    } catch (e) {
      console.error('  localStorage parse error:', e);
    }
  } else {
    console.log('  localStorage: empty');
  }
  
  // Check component
  const component = document.querySelector(`[data-violet-field="${TEST_FIELD}"]`);
  if (component) {
    console.log(`  Component ${TEST_FIELD}:`, component.textContent);
  } else {
    console.log('  Component: not found');
  }
};

checkCurrentState();

// Step 2: Test WordPress API
console.log('\n📋 STEP 2: Testing WordPress API...');

fetch('/wp-json/violet/v1/content')
  .then(res => res.json())
  .then(data => {
    console.log('  ✅ API Response received');
    console.log(`  ${TEST_FIELD} from API:`, data[TEST_FIELD] || 'not found');
    results.wordpressApi = true;
  })
  .catch(err => {
    console.error('  ❌ API Error:', err);
  });

// Step 3: Test save simulation
console.log('\n📋 STEP 3: Simulating WordPress save...');

const simulateSave = () => {
  // Track if events are received
  let messageReceived = false;
  let eventReceived = false;
  let storageUpdated = false;
  let componentUpdated = false;
  
  // Listen for storage changes
  const storageListener = setInterval(() => {
    const stored = localStorage.getItem('violet-content');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const content = parsed.content || parsed;
        if (content[TEST_FIELD] === TEST_VALUE) {
          storageUpdated = true;
          results.localStorage = true;
          console.log('  ✅ localStorage updated with test value');
          clearInterval(storageListener);
        }
      } catch (e) {}
    }
  }, 100);
  
  // Listen for component changes
  const componentListener = setInterval(() => {
    const component = document.querySelector(`[data-violet-field="${TEST_FIELD}"]`);
    if (component && component.textContent === TEST_VALUE) {
      componentUpdated = true;
      results.componentUpdate = true;
      console.log('  ✅ Component updated with test value');
      clearInterval(componentListener);
    }
  }, 100);
  
  // Listen for messages
  const messageHandler = (event) => {
    if (event.data && event.data.type && event.data.type.includes('violet')) {
      messageReceived = true;
      results.messageHandling = true;
      console.log('  ✅ Message received:', event.data.type);
    }
  };
  window.addEventListener('message', messageHandler);
  
  // Listen for custom events
  const eventHandler = (event) => {
    eventReceived = true;
    results.contextUpdate = true;
    console.log('  ✅ Custom event received:', event.type);
  };
  window.addEventListener('violet-content-updated', eventHandler);
  window.addEventListener('violet-wordpress-changes-applied', eventHandler);
  
  // Send the save message
  const saveData = {
    type: 'violet-apply-saved-changes',
    savedChanges: [
      { field_name: TEST_FIELD, field_value: TEST_VALUE }
    ],
    timestamp: Date.now()
  };
  
  // Method 1: PostMessage (simulating WordPress iframe)
  window.postMessage(saveData, window.location.origin);
  console.log('  📤 Sent postMessage');
  
  // Method 2: Direct event dispatch
  window.dispatchEvent(new MessageEvent('message', {
    data: saveData,
    origin: window.location.origin
  }));
  console.log('  📤 Dispatched message event');
  
  // Check results after 2 seconds
  setTimeout(() => {
    console.log('\n📊 TEST RESULTS:');
    console.log('─────────────────────────────');
    
    // Clean up listeners
    clearInterval(storageListener);
    clearInterval(componentListener);
    window.removeEventListener('message', messageHandler);
    window.removeEventListener('violet-content-updated', eventHandler);
    window.removeEventListener('violet-wordpress-changes-applied', eventHandler);
    
    // Display results
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;
    
    console.log(`WordPress API:     ${results.wordpressApi ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`localStorage:      ${results.localStorage ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Component Update:  ${results.componentUpdate ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Message Handling:  ${results.messageHandling ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Context Update:    ${results.contextUpdate ? '✅ PASS' : '❌ FAIL'}`);
    console.log('─────────────────────────────');
    console.log(`OVERALL: ${passed}/${total} tests passed`);
    
    if (passed < total) {
      console.log('\n🔧 TROUBLESHOOTING:');
      
      if (!results.localStorage) {
        console.log('• localStorage not updating: Check contentStorage.ts saveContent()');
      }
      
      if (!results.componentUpdate) {
        console.log('• Component not updating: Check EditableText useContentField hook');
        console.log('  Try: window.dispatchEvent(new CustomEvent("violet-force-component-update"))');
      }
      
      if (!results.messageHandling) {
        console.log('• Messages not received: Check message listeners in main.tsx');
      }
      
      if (!results.contextUpdate) {
        console.log('• Context not updating: Check ContentContext updateContent()');
      }
      
      console.log('\n💡 MANUAL FIX:');
      console.log('1. Open browser console');
      console.log('2. Run: localStorage.setItem("violet-content", JSON.stringify({version:"v1",timestamp:Date.now(),content:{hero_title:"Your New Title"}}))');
      console.log('3. Run: window.location.reload()');
    } else {
      console.log('\n✅ All tests passed! Content persistence is working correctly.');
    }
    
    // Final state check
    console.log('\n📋 FINAL STATE:');
    checkCurrentState();
    
  }, 2000);
};

// Run the save simulation
setTimeout(simulateSave, 1000);

// Export test functions for manual use
window.VioletTest = {
  checkState: checkCurrentState,
  simulateSave: (field = TEST_FIELD, value = TEST_VALUE) => {
    window.postMessage({
      type: 'violet-apply-saved-changes',
      savedChanges: [{ field_name: field, field_value: value }],
      timestamp: Date.now()
    }, window.location.origin);
    console.log(`Simulated save: ${field} = "${value}"`);
  },
  forceUpdate: () => {
    window.dispatchEvent(new CustomEvent('violet-force-component-update'));
    window.dispatchEvent(new CustomEvent('violet-content-updated'));
    console.log('Forced update events dispatched');
  },
  clearContent: () => {
    localStorage.removeItem('violet-content');
    console.log('Cleared localStorage content');
  }
};

console.log(`
💡 Additional commands available:
  VioletTest.checkState()         - Check current content state
  VioletTest.simulateSave(f, v)   - Simulate save with custom field/value
  VioletTest.forceUpdate()        - Force component updates
  VioletTest.clearContent()       - Clear saved content
`);