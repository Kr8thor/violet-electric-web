/**
 * Browser Console Test Script for Content Persistence
 * Run this in the browser console of your React app
 */

// Test 1: Check WordPress API
console.log('🧪 TEST 1: Checking WordPress API...');
fetch('/wp-json/violet/v1/content')
  .then(res => res.json())
  .then(data => {
    console.log('✅ WordPress API Response:', data);
    console.log('Fields found:', Object.keys(data).join(', '));
  })
  .catch(err => console.error('❌ WordPress API Error:', err));

// Test 2: Check localStorage
console.log('\n🧪 TEST 2: Checking localStorage...');
const violetContent = localStorage.getItem('violet-content');
if (violetContent) {
  try {
    const parsed = JSON.parse(violetContent);
    console.log('✅ localStorage content:', parsed);
    console.log('Content fields:', Object.keys(parsed.content || parsed));
  } catch (e) {
    console.error('❌ Failed to parse localStorage:', e);
  }
} else {
  console.warn('⚠️ No violet-content in localStorage');
}

// Test 3: Check React components
console.log('\n🧪 TEST 3: Checking React components...');
const components = document.querySelectorAll('[data-violet-field]');
console.log(`Found ${components.length} EditableText components:`);
components.forEach(comp => {
  console.log(`  ${comp.dataset.violetField}: "${comp.textContent}"`);
});

// Test 4: Check if ContentContext is available
console.log('\n🧪 TEST 4: Checking React Context...');
// Try to access React fiber
const rootElement = document.getElementById('root');
if (rootElement && rootElement._reactRootContainer) {
  console.log('✅ React root found');
  
  // Try to find ContentProvider in the component tree
  const fiber = rootElement._reactRootContainer._internalRoot.current;
  let contextFound = false;
  
  function findContext(node, depth = 0) {
    if (!node || depth > 10) return;
    
    if (node.elementType && node.elementType.name === 'ContentProvider') {
      console.log('✅ ContentProvider found!');
      contextFound = true;
      return;
    }
    
    if (node.child) findContext(node.child, depth + 1);
    if (node.sibling) findContext(node.sibling, depth);
  }
  
  findContext(fiber);
  
  if (!contextFound) {
    console.warn('⚠️ ContentProvider not found in component tree');
  }
} else {
  console.warn('⚠️ React root not accessible');
}

// Test 5: Simulate a save
console.log('\n🧪 TEST 5: Simulating WordPress save...');
const testSave = () => {
  const testData = {
    type: 'violet-apply-saved-changes',
    savedChanges: [
      { field_name: 'hero_title', field_value: 'TEST: Saved at ' + new Date().toLocaleTimeString() },
      { field_name: 'hero_subtitle', field_value: 'TEST: This subtitle should persist' }
    ],
    timestamp: Date.now()
  };
  
  // Method 1: PostMessage
  window.postMessage(testData, window.location.origin);
  console.log('📤 Sent postMessage:', testData);
  
  // Method 2: Custom Event
  window.dispatchEvent(new CustomEvent('violet-wordpress-save-complete', {
    detail: {
      updates: {
        hero_title: testData.savedChanges[0].field_value,
        hero_subtitle: testData.savedChanges[1].field_value
      }
    }
  }));
  console.log('📤 Dispatched custom event');
  
  // Check results after 1 second
  setTimeout(() => {
    console.log('\n🔍 Checking if save was applied...');
    
    // Check localStorage
    const saved = localStorage.getItem('violet-content');
    if (saved) {
      const content = JSON.parse(saved).content || JSON.parse(saved);
      console.log('localStorage hero_title:', content.hero_title);
      console.log('localStorage hero_subtitle:', content.hero_subtitle);
    }
    
    // Check components
    const titleComp = document.querySelector('[data-violet-field="hero_title"]');
    const subtitleComp = document.querySelector('[data-violet-field="hero_subtitle"]');
    
    if (titleComp) {
      console.log('Component hero_title:', titleComp.textContent);
      if (titleComp.textContent.includes('TEST:')) {
        console.log('✅ Title component updated!');
      } else {
        console.error('❌ Title component NOT updated');
      }
    }
    
    if (subtitleComp) {
      console.log('Component hero_subtitle:', subtitleComp.textContent);
      if (subtitleComp.textContent.includes('TEST:')) {
        console.log('✅ Subtitle component updated!');
      } else {
        console.error('❌ Subtitle component NOT updated');
      }
    }
  }, 1000);
};

// Run the save test
testSave();

// Test 6: Force refresh
console.log('\n🧪 TEST 6: Testing force refresh...');
const forceRefresh = () => {
  // Dispatch all possible refresh events
  window.dispatchEvent(new CustomEvent('violet-content-updated'));
  window.dispatchEvent(new CustomEvent('violet-refresh-content'));
  window.dispatchEvent(new Event('violet-force-refresh'));
  
  console.log('📤 Sent refresh events');
  
  // Check if components update
  setTimeout(() => {
    const comps = document.querySelectorAll('[data-violet-field]');
    console.log(`Components after refresh: ${comps.length}`);
  }, 500);
};

forceRefresh();

// Helper function to manually update content
window.violetUpdate = (field, value) => {
  // Update localStorage
  const stored = localStorage.getItem('violet-content');
  const data = stored ? JSON.parse(stored) : { version: 'v1', timestamp: Date.now(), content: {} };
  data.content[field] = value;
  data.timestamp = Date.now();
  localStorage.setItem('violet-content', JSON.stringify(data));
  
  // Dispatch events
  window.dispatchEvent(new CustomEvent('violet-content-updated', { detail: data.content }));
  
  console.log(`✅ Updated ${field} to "${value}"`);
  console.log('Refresh the page to see changes');
};

console.log('\n📝 Use window.violetUpdate(field, value) to manually update content');
console.log('Example: violetUpdate("hero_title", "New Title")');