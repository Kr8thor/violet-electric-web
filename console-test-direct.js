// Copy and paste this ENTIRE block into your browser console

console.clear();
console.log('%c🧪 WordPress-React Content Persistence Test', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('='.repeat(50));

// Test configuration
const TEST_FIELD = 'hero_title';
const TEST_VALUE = `PERSISTENCE TEST: ${new Date().toLocaleTimeString()}`;

// Step 1: Check current state
console.log('\n📋 Current State:');
const checkState = () => {
  // Check localStorage
  const stored = localStorage.getItem('violet-content');
  let content = {};
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      content = parsed.content || parsed;
    } catch (e) {
      console.error('Failed to parse localStorage:', e);
    }
  }
  console.log('  localStorage ' + TEST_FIELD + ':', content[TEST_FIELD] || 'empty');
  
  // Check component
  const component = document.querySelector(`[data-violet-field="${TEST_FIELD}"]`);
  console.log('  Component display:', component?.textContent || 'not found');
  
  // Check all editable components
  const allComponents = document.querySelectorAll('[data-violet-field]');
  console.log('  Total EditableText components found:', allComponents.length);
  
  return { 
    stored: content[TEST_FIELD], 
    displayed: component?.textContent,
    component: component
  };
};

const initial = checkState();

// Step 2: Check WordPress API
console.log('\n🌐 Testing WordPress API...');
fetch('/wp-json/violet/v1/content')
  .then(res => res.json())
  .then(data => {
    console.log('  ✅ WordPress API working:', Object.keys(data).length + ' fields');
    console.log('  WordPress ' + TEST_FIELD + ':', data[TEST_FIELD] || 'not found');
  })
  .catch(err => {
    console.error('  ❌ WordPress API error:', err);
  });

// Step 3: Simulate WordPress save
setTimeout(() => {
  console.log('\n💾 Simulating WordPress save...');
  
  // Method 1: PostMessage (simulating WordPress iframe)
  window.postMessage({
    type: 'violet-apply-saved-changes',
    savedChanges: [{
      field_name: TEST_FIELD,
      field_value: TEST_VALUE
    }],
    timestamp: Date.now(),
    syncDelay: 30000
  }, window.location.origin);
  
  // Method 2: Direct event
  window.dispatchEvent(new MessageEvent('message', {
    data: {
      type: 'violet-apply-saved-changes',
      savedChanges: [{
        field_name: TEST_FIELD,
        field_value: TEST_VALUE
      }],
      timestamp: Date.now(),
      syncDelay: 30000
    },
    origin: window.location.origin
  }));
  
  console.log('  📤 Save message sent');
}, 1000);

// Step 4: Check if it worked
setTimeout(() => {
  console.log('\n📊 Results after save:');
  const final = checkState();
  
  // Check localStorage update
  const storageUpdated = final.stored === TEST_VALUE;
  console.log(`  localStorage updated: ${storageUpdated ? '✅ YES' : '❌ NO'}`);
  
  // Check component update
  const componentUpdated = final.displayed === TEST_VALUE;
  console.log(`  Component updated: ${componentUpdated ? '✅ YES' : '❌ NO'}`);
  
  // Overall result
  console.log('\n🎯 DIAGNOSIS:');
  if (storageUpdated && componentUpdated) {
    console.log('%c✅ SUCCESS! Content persistence is working perfectly!', 'color: #10b981; font-weight: bold; font-size: 16px;');
  } else if (storageUpdated && !componentUpdated) {
    console.log('%c⚠️  ISSUE FOUND: Content saves but components don\'t update', 'color: #f59e0b; font-weight: bold; font-size: 16px;');
    console.log('\n🔧 SOLUTION:');
    console.log('The content IS saving correctly, but React components aren\'t re-rendering.');
    console.log('\nQuick Fix #1 - Refresh the page:');
    console.log('  location.reload();');
    console.log('\nQuick Fix #2 - Add auto-refresh after saves:');
    console.log(`  window.addEventListener('message', (e) => {
    if (e.data.type === 'violet-apply-saved-changes') {
      setTimeout(() => location.reload(), 500);
    }
  });`);
    console.log('\nPermanent Fix - Update EditableText.tsx to force re-renders');
  } else {
    console.log('%c❌ FAILED: Content not persisting at all', 'color: #ef4444; font-weight: bold; font-size: 16px;');
    console.log('Check message handlers in WordPressEditor.tsx');
  }
  
  // Additional debugging info
  console.log('\n📝 Debug Info:');
  console.log('  Component found:', !!final.component);
  console.log('  Component text:', final.displayed);
  console.log('  Stored value:', final.stored);
  
  // Check for duplicate text issue
  const heroText = document.querySelector('.text-4xl')?.textContent;
  if (heroText && heroText.includes('Change the channel') && heroText.includes('Change Your Life') && heroText.includes('Change Your Life')) {
    console.log('\n⚠️  Note: There appears to be duplicate text in your hero section');
  }
  
}, 3000);

// Helper functions
window.violetHelpers = {
  // Check all content
  checkAll: () => {
    console.log('\n📋 All Content Sources:');
    
    // localStorage
    const stored = localStorage.getItem('violet-content');
    console.log('\n1. localStorage:');
    if (stored) {
      const content = JSON.parse(stored).content || JSON.parse(stored);
      console.table(content);
    } else {
      console.log('  Empty');
    }
    
    // Components
    console.log('\n2. Components:');
    const components = {};
    document.querySelectorAll('[data-violet-field]').forEach(el => {
      components[el.dataset.violetField] = el.textContent;
    });
    console.table(components);
    
    // WordPress
    console.log('\n3. Fetching WordPress content...');
    fetch('/wp-json/violet/v1/content')
      .then(r => r.json())
      .then(data => {
        console.log('WordPress content:');
        console.table(data);
      });
  },
  
  // Force update
  forceUpdate: (field, value) => {
    const data = JSON.parse(localStorage.getItem('violet-content') || '{}');
    const content = data.content || data;
    content[field] = value;
    localStorage.setItem('violet-content', JSON.stringify({
      version: 'v1',
      timestamp: Date.now(),
      content: content
    }));
    console.log(`Updated ${field} to "${value}". Refresh to see changes.`);
  },
  
  // Clear all
  clearAll: () => {
    if (confirm('Clear all saved content?')) {
      localStorage.removeItem('violet-content');
      location.reload();
    }
  }
};

console.log('\n💡 Additional commands:');
console.log('  violetHelpers.checkAll()    - See all content sources');
console.log('  violetHelpers.forceUpdate(field, value) - Update a field');
console.log('  violetHelpers.clearAll()    - Clear all content');
