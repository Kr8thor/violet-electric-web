
/**
 * Save Flow Tester - Test WordPress ↔ React save functionality
 */

export const testSaveFlow = () => {
  console.log('🧪 Testing WordPress ↔ React save flow...');
  
  // Test 1: Check if save handler exists
  const saveHandler = (window as any).wordPressSaveHandler;
  console.log('Test 1 - Save handler exists:', !!saveHandler);
  
  // Test 2: Check if we're in iframe (WordPress context)
  const inIframe = window.parent !== window.self;
  console.log('Test 2 - In WordPress iframe:', inIframe);
  
  // Test 3: Test localStorage save
  const testContent = {
    test_field: `Test save at ${new Date().toISOString()}`
  };
  
  try {
    localStorage.setItem('violet-content', JSON.stringify({
      version: 'v1',
      timestamp: Date.now(),
      content: testContent
    }));
    console.log('Test 3 - localStorage save: ✅ PASS');
  } catch (error) {
    console.error('Test 3 - localStorage save: ❌ FAIL', error);
  }
  
  // Test 4: Test WordPress API endpoint
  fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content')
    .then(response => {
      console.log('Test 4 - WordPress API:', response.ok ? '✅ PASS' : '❌ FAIL', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Test 4 - API data received:', Object.keys(data).length, 'fields');
    })
    .catch(error => {
      console.error('Test 4 - WordPress API: ❌ FAIL', error);
    });
  
  // Test 5: Simulate WordPress save message
  if (inIframe) {
    console.log('Test 5 - Sending test save message to React...');
    window.postMessage({
      type: 'violet-apply-saved-changes',
      savedChanges: [
        { field_name: 'test_field', field_value: 'Test from WordPress' }
      ],
      timestamp: Date.now()
    }, '*');
  } else {
    console.log('Test 5 - Skipped (not in iframe)');
  }
  
  return {
    saveHandlerExists: !!saveHandler,
    inWordPressContext: inIframe,
    testCompleted: true
  };
};

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).testSaveFlow = testSaveFlow;
  console.log('🧪 Save flow tester available at window.testSaveFlow()');
}
