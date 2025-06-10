// Quick WordPress-React Content Persistence Test
// Copy and paste this entire script into your browser console

console.clear();
console.log('%c🧪 WordPress-React Content Test', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('=' .repeat(50));

// Test configuration
const TEST_FIELD = 'hero_title';
const TEST_VALUE = `PERSISTENCE TEST: ${new Date().toLocaleTimeString()}`;

// Step 1: Check current state
console.log('\n📋 Current State:');
const checkState = () => {
  // Check localStorage
  const stored = localStorage.getItem('violet-content');
  const content = stored ? JSON.parse(stored).content || JSON.parse(stored) : {};
  console.log('  localStorage:', content[TEST_FIELD] || 'empty');
  
  // Check component
  const component = document.querySelector(`[data-violet-field="${TEST_FIELD}"]`);
  console.log('  Component:', component?.textContent || 'not found');
  
  return { stored: content[TEST_FIELD], displayed: component?.textContent };
};

const initial = checkState();

// Step 2: Simulate WordPress save
console.log('\n💾 Simulating WordPress save...');
window.postMessage({
  type: 'violet-apply-saved-changes',
  savedChanges: [{
    field_name: TEST_FIELD,
    field_value: TEST_VALUE
  }],
  timestamp: Date.now()
}, window.location.origin);

// Step 3: Check if it worked
setTimeout(() => {
  console.log('\n📊 Results after save:');
  const final = checkState();
  
  // Check localStorage update
  const storageUpdated = final.stored === TEST_VALUE;
  console.log(`  localStorage updated: ${storageUpdated ? '✅' : '❌'}`);
  
  // Check component update
  const componentUpdated = final.displayed === TEST_VALUE;
  console.log(`  Component updated: ${componentUpdated ? '✅' : '❌'}`);
  
  // Overall result
  console.log('\n🎯 Test Result:');
  if (storageUpdated && componentUpdated) {
    console.log('%c✅ SUCCESS! Content persistence is working!', 'color: #10b981; font-weight: bold;');
  } else if (storageUpdated && !componentUpdated) {
    console.log('%c⚠️  PARTIAL: Content saved but components not updating', 'color: #f59e0b; font-weight: bold;');
    console.log('   Fix: Components need to re-render when content updates');
    console.log('   Try: location.reload() to see saved content');
  } else {
    console.log('%c❌ FAILED: Content not persisting', 'color: #ef4444; font-weight: bold;');
    console.log('   Check: Message handlers in WordPressEditor.tsx');
  }
  
  // Provide quick fix
  if (!componentUpdated && storageUpdated) {
    console.log('\n🔧 Quick Fix Available:');
    console.log('   Run: location.reload()');
    console.log('   Or: window.dispatchEvent(new CustomEvent("violet-force-component-update"))');
  }
  
}, 1000);

// Export test function for repeated use
window.testPersistence = () => eval(document.currentScript.text);
console.log('\n💡 Run testPersistence() to test again');