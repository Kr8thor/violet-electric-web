/**
 * Content Persistence Test Script
 * Run this in the browser console to verify the save persistence fix
 */

console.log('🧪 Starting Content Persistence Test...\n');

// Test 1: Check current state
console.log('📊 Test 1: Checking current state...');
const currentState = window.violetDebug.getContentState();
if (currentState) {
  console.log('✅ Content state found:', currentState);
  console.log(`  - Last sync: ${currentState.lastSync ? new Date(currentState.lastSync).toLocaleString() : 'Never'}`);
  console.log(`  - Last save: ${currentState.lastSave ? new Date(currentState.lastSave).toLocaleString() : 'Never'}`);
  console.log(`  - Pending changes: ${Object.keys(currentState.pending || {}).length}`);
} else {
  console.log('❌ No content state found');
}

// Test 2: Check grace period
console.log('\n⏱️ Test 2: Checking grace period...');
const inGracePeriod = window.violetDebug.isInGracePeriod();
if (inGracePeriod) {
  const remaining = window.violetDebug.getGracePeriodRemaining();
  console.log(`✅ In grace period - ${Math.round(remaining / 1000)}s remaining`);
  console.log('  - WordPress sync is BLOCKED during this time');
} else {
  console.log('❌ Not in grace period - WordPress sync is ALLOWED');
}

// Test 3: Simulate a save
console.log('\n💾 Test 3: Simulating a WordPress save...');
const testValue = 'PERSISTENCE TEST: ' + new Date().toLocaleTimeString();
console.log(`  - Setting hero_title to: "${testValue}"`);

window.violetDebug.simulateSave('hero_title', testValue);

// Wait a moment for the save to process
setTimeout(() => {
  // Test 4: Verify the save persisted
  console.log('\n✅ Test 4: Verifying save persistence...');
  
  // Check if the hero title element has the new value
  const heroElement = document.querySelector('[data-violet-field="hero_title"]');
  if (heroElement) {
    const currentValue = heroElement.textContent || heroElement.innerHTML;
    if (currentValue.includes('PERSISTENCE TEST')) {
      console.log('✅ SUCCESS! Content persisted in DOM:', currentValue);
    } else {
      console.log('❌ FAIL: Content not updated in DOM. Current value:', currentValue);
    }
  } else {
    console.log('⚠️ Hero title element not found in DOM');
  }
  
  // Check the content state
  const newState = window.violetDebug.getContentState();
  if (newState && newState.local && newState.local.hero_title) {
    console.log('✅ Content saved in state:', newState.local.hero_title);
  } else {
    console.log('❌ Content not found in state');
  }
  
  // Test 5: Test visibility change behavior
  console.log('\n👁️ Test 5: Testing visibility change behavior...');
  console.log('Instructions:');
  console.log('1. Switch to another tab for 2 seconds');
  console.log('2. Come back to this tab');
  console.log('3. Watch the console to see if content reverts');
  console.log('4. If content stays as "PERSISTENCE TEST", the fix is working!');
  
  // Monitor for content changes
  let lastValue = heroElement ? heroElement.textContent : '';
  const monitor = setInterval(() => {
    if (heroElement) {
      const currentValue = heroElement.textContent || '';
      if (currentValue !== lastValue) {
        console.log(`⚠️ Content changed from "${lastValue}" to "${currentValue}"`);
        if (!currentValue.includes('PERSISTENCE TEST')) {
          console.log('❌ ISSUE: Content reverted! The fix may not be working properly.');
          clearInterval(monitor);
        }
        lastValue = currentValue;
      }
    }
  }, 100);
  
  // Stop monitoring after 30 seconds
  setTimeout(() => {
    clearInterval(monitor);
    console.log('\n✅ Test completed. If content didn\'t revert, the fix is working!');
  }, 30000);
  
}, 1000);

// Helper function to run a full test cycle
window.violetRunFullTest = () => {
  console.log('\n🚀 Running full persistence test cycle...\n');
  
  // Step 1: Clear everything
  console.log('Step 1: Clearing cache...');
  localStorage.removeItem('violet-content-state');
  
  // Step 2: Reload
  console.log('Step 2: Reloading page...');
  console.log('Run violetRunFullTest() again after reload.');
  window.location.reload();
};