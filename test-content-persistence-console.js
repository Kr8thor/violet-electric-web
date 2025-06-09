// Test script to verify WordPress-React content persistence
// Run this in the browser console on https://lustrous-dolphin-447351.netlify.app/?edit_mode=1&wp_admin=1

console.log('🧪 Starting Content Persistence Test...\n');

// Step 1: Check current localStorage content
console.group('📦 Step 1: Current localStorage State');
const currentContent = localStorage.getItem('violet-content');
console.log('Raw localStorage:', currentContent);
if (currentContent) {
  try {
    const parsed = JSON.parse(currentContent);
    console.log('Parsed content:', parsed);
    console.log('Number of fields:', Object.keys(parsed.content || parsed).length);
  } catch (e) {
    console.error('Failed to parse localStorage:', e);
  }
} else {
  console.log('❌ No content in localStorage');
}
console.groupEnd();

// Step 2: Test save message handling
console.group('💾 Step 2: Test Save Message');
console.log('Simulating WordPress save message...');

// Simulate the message that WordPress sends
const testMessage = {
  type: 'violet-apply-saved-changes',
  savedChanges: [
    {
      field_name: 'hero_title',
      field_value: 'TEST: Content Persistence Working! ' + new Date().toTimeString()
    },
    {
      field_name: 'hero_subtitle', 
      field_value: 'TEST: This subtitle was saved at ' + new Date().toTimeString()
    },
    {
      field_name: 'hero_cta',
      field_value: 'TEST: Click Me'
    }
  ],
  timestamp: Date.now(),
  system: 'test_script'
};

// Send the message to the current window (simulating WordPress)
window.postMessage(testMessage, window.location.origin);
console.log('✅ Test message sent');
console.groupEnd();

// Step 3: Wait and verify save
console.group('🔍 Step 3: Verification (wait 1 second)');
setTimeout(() => {
  const newContent = localStorage.getItem('violet-content');
  console.log('New localStorage content:', newContent);
  
  if (newContent) {
    try {
      const parsed = JSON.parse(newContent);
      const content = parsed.content || parsed;
      console.log('✅ Saved content:', content);
      
      // Check if our test values were saved
      if (content.hero_title && content.hero_title.includes('TEST:')) {
        console.log('✅ SUCCESS: Test content was saved!');
        console.log('  - hero_title:', content.hero_title);
        console.log('  - hero_subtitle:', content.hero_subtitle);
        console.log('  - hero_cta:', content.hero_cta);
      } else {
        console.log('❌ FAILED: Test content was not saved');
      }
    } catch (e) {
      console.error('Failed to parse new content:', e);
    }
  }
  
  console.groupEnd();
  console.log('\n🎯 Test complete. Refresh the page to see if content persists.');
}, 1000);

// Helper functions for manual testing
window.violetTest = {
  // Clear all content
  clearContent: () => {
    localStorage.removeItem('violet-content');
    console.log('✅ Content cleared. Refresh to see defaults.');
  },
  
  // Check current content
  checkContent: () => {
    const content = localStorage.getItem('violet-content');
    if (content) {
      console.log('Current content:', JSON.parse(content));
    } else {
      console.log('No content in localStorage');
    }
  },
  
  // Manually save test content
  saveTestContent: () => {
    const testContent = {
      version: 'v1',
      timestamp: Date.now(),
      content: {
        hero_title: 'MANUAL TEST: Title saved at ' + new Date().toTimeString(),
        hero_subtitle: 'MANUAL TEST: Subtitle saved at ' + new Date().toTimeString(),
        hero_cta: 'MANUAL TEST: Button'
      }
    };
    localStorage.setItem('violet-content', JSON.stringify(testContent));
    console.log('✅ Test content saved. Refresh to see changes.');
  },
  
  // Simulate WordPress save
  simulateWordPressSave: (title = 'WordPress Save Test') => {
    window.postMessage({
      type: 'violet-apply-saved-changes',
      savedChanges: [
        {
          field_name: 'hero_title',
          field_value: title
        }
      ]
    }, window.location.origin);
    console.log('✅ Simulated WordPress save message sent');
  }
};

console.log('\n💡 Helper functions available:');
console.log('  - violetTest.clearContent()');
console.log('  - violetTest.checkContent()');
console.log('  - violetTest.saveTestContent()');
console.log('  - violetTest.simulateWordPressSave("Your Title")');
