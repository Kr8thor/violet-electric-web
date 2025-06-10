/**
 * Content Persistence Test Utility
 * Verifies that WordPress saves persist to the React frontend
 */

import { getAllContentSync, saveContent } from './contentStorage';
import { syncWordPressContent } from './wordpressContentSync';

export interface TestResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Run a complete content persistence test
 */
export const runContentPersistenceTest = async (): Promise<TestResult[]> => {
  const results: TestResult[] = [];
  
  console.log('🧪 Starting content persistence test...');
  
  // Step 1: Check current content
  try {
    const currentContent = getAllContentSync();
    results.push({
      step: 'Check Current Content',
      success: true,
      message: `Found ${Object.keys(currentContent).length} content fields`,
      data: currentContent
    });
  } catch (error) {
    results.push({
      step: 'Check Current Content',
      success: false,
      message: `Error: ${error}`
    });
  }
  
  // Step 2: Test WordPress sync
  try {
    const syncSuccess = await syncWordPressContent();
    results.push({
      step: 'WordPress Sync',
      success: syncSuccess,
      message: syncSuccess ? 'Successfully synced from WordPress' : 'WordPress not available (normal in dev)',
      data: { syncSuccess }
    });
  } catch (error) {
    results.push({
      step: 'WordPress Sync',
      success: false,
      message: `Sync error: ${error}`
    });
  }
  
  // Step 3: Test local save
  try {
    const testData = {
      test_field: `Test value ${Date.now()}`,
      test_timestamp: new Date().toISOString()
    };
    
    const saveSuccess = saveContent(testData, true);
    results.push({
      step: 'Local Save',
      success: saveSuccess,
      message: saveSuccess ? 'Successfully saved to localStorage' : 'Failed to save',
      data: testData
    });
  } catch (error) {
    results.push({
      step: 'Local Save',
      success: false,
      message: `Save error: ${error}`
    });
  }
  
  // Step 4: Test event dispatch
  try {
    let eventReceived = false;
    const handler = () => { eventReceived = true; };
    
    window.addEventListener('violet-content-updated', handler);
    window.dispatchEvent(new CustomEvent('violet-content-updated', { detail: { test: true } }));
    
    // Wait a bit for event to propagate
    await new Promise(resolve => setTimeout(resolve, 100));
    
    window.removeEventListener('violet-content-updated', handler);
    
    results.push({
      step: 'Event System',
      success: eventReceived,
      message: eventReceived ? 'Events working correctly' : 'Event system not working',
      data: { eventReceived }
    });
  } catch (error) {
    results.push({
      step: 'Event System',
      success: false,
      message: `Event error: ${error}`
    });
  }
  
  // Step 5: Test postMessage from parent
  try {
    const isInIframe = window.parent !== window.self;
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit_mode') === '1';
    
    results.push({
      step: 'iframe Detection',
      success: true,
      message: `In iframe: ${isInIframe}, Edit mode: ${isEditMode}`,
      data: { isInIframe, isEditMode }
    });
  } catch (error) {
    results.push({
      step: 'iframe Detection',
      success: false,
      message: `Detection error: ${error}`
    });
  }
  
  // Print results
  console.log('🧪 Test Results:');
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.step}: ${result.message}`);
    if (result.data) {
      console.log('   Data:', result.data);
    }
  });
  
  return results;
};

/**
 * Monitor content changes in real-time
 */
export const startContentMonitor = () => {
  console.log('👁️ Starting content monitor...');
  
  let lastContent = JSON.stringify(getAllContentSync());
  
  const checkForChanges = () => {
    const currentContent = JSON.stringify(getAllContentSync());
    if (currentContent !== lastContent) {
      console.log('🔄 Content changed!', {
        before: JSON.parse(lastContent),
        after: JSON.parse(currentContent)
      });
      lastContent = currentContent;
    }
  };
  
  // Check every second
  const interval = setInterval(checkForChanges, 1000);
  
  // Listen for all content events
  const events = [
    'violet-content-updated',
    'violet-content-persisted',
    'violet-content-synced',
    'violet-wordpress-changes-applied',
    'violet-wordpress-save-complete'
  ];
  
  events.forEach(eventName => {
    window.addEventListener(eventName, (event: Event) => {
      console.log(`📨 Event: ${eventName}`, (event as CustomEvent).detail);
    });
  });
  
  // Also monitor postMessages
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type && event.data.type.startsWith('violet-')) {
      console.log('📮 PostMessage:', event.data);
    }
  });
  
  console.log('👁️ Content monitor started. Call stopContentMonitor() to stop.');
  
  // Return stop function
  return () => {
    clearInterval(interval);
    console.log('👁️ Content monitor stopped');
  };
};

// Export for global access in console
if (typeof window !== 'undefined') {
  (window as any).violetTest = {
    runTest: runContentPersistenceTest,
    startMonitor: startContentMonitor,
    syncNow: syncWordPressContent,
    getContent: getAllContentSync,
    saveTest: (data: any) => saveContent(data, true)
  };
  
  console.log('🧪 Violet test utilities loaded. Use window.violetTest to access:');
  console.log('   - violetTest.runTest() - Run persistence test');
  console.log('   - violetTest.startMonitor() - Monitor content changes');
  console.log('   - violetTest.syncNow() - Force WordPress sync');
  console.log('   - violetTest.getContent() - Get current content');
  console.log('   - violetTest.saveTest({field: "value"}) - Test save');
}
