// Quick verification script for content persistence fix
// Run this in the browser console on your React app

console.log('🧪 Quick Content Persistence Verification\n');

// Check if debug tools are available
if (typeof window.violetDebug === 'undefined') {
  console.error('❌ Debug tools not found! Make sure you\'re in edit mode or development.');
  console.log('Try adding ?edit_mode=1 to your URL');
} else {
  console.log('✅ Debug tools found\n');
  
  // Test the save persistence
  console.log('📝 Testing save persistence...');
  const testTime = new Date().toLocaleTimeString();
  const testValue = `PERSIST TEST ${testTime}`;
  
  console.log(`Setting hero_title to: "${testValue}"`);
  window.violetDebug.simulateSave('hero_title', testValue);
  
  console.log('\n⏱️ Grace period status:');
  if (window.violetDebug.isInGracePeriod()) {
    const remaining = Math.round(window.violetDebug.getGracePeriodRemaining() / 1000);
    console.log(`✅ In grace period - ${remaining}s remaining`);
    console.log('WordPress sync is BLOCKED (content won\'t revert)');
  } else {
    console.log('❌ Not in grace period');
  }
  
  console.log('\n👉 Next steps:');
  console.log('1. Switch to another browser tab');
  console.log('2. Wait 5 seconds');
  console.log('3. Come back to this tab');
  console.log(`4. Hero title should still show: "${testValue}"`);
  console.log('5. If it doesn\'t revert, the fix is working! 🎉');
  
  // Monitor for changes
  setTimeout(() => {
    const heroEl = document.querySelector('[data-violet-field="hero_title"]');
    if (heroEl) {
      const currentValue = heroEl.textContent || '';
      if (currentValue.includes('PERSIST TEST')) {
        console.log('\n✅ SUCCESS! Content persisted after tab switch!');
      } else {
        console.log('\n❌ Content may have reverted. Current value:', currentValue);
      }
    }
  }, 10000); // Check after 10 seconds
}