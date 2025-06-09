// Emergency WordPress Content Fix
// This forces the React app to fetch and use WordPress content

(function() {
  console.log('🚑 Emergency WordPress content fix loading...');
  
  // Check if we've already run this fix recently (prevent infinite loops)
  const lastRunKey = 'violet-fix-last-run';
  const lastRun = localStorage.getItem(lastRunKey);
  const now = Date.now();
  
  // Only run once every 30 seconds to prevent loops
  if (lastRun && (now - parseInt(lastRun)) < 30000) {
    console.log('⏳ Fix already ran recently, skipping...');
    return;
  }
  
  localStorage.setItem(lastRunKey, now.toString());
  
  // Force fetch WordPress content on page load
  async function forceWordPressContent() {
    try {
      console.log('🔄 Fetching content from WordPress...');
      const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content');
      
      if (response.ok) {
        const wpContent = await response.json();
        console.log('✅ WordPress content received:', wpContent);
        
        // Check if content has actually changed
        const currentStored = localStorage.getItem('violet-content');
        let hasChanged = true;
        
        if (currentStored) {
          try {
            const current = JSON.parse(currentStored);
            hasChanged = JSON.stringify(current.content) !== JSON.stringify(wpContent);
          } catch (e) {
            // Invalid JSON, proceed with update
          }
        }
        
        if (hasChanged) {
          // Store in localStorage with proper structure
          const storageData = {
            version: 'v1',
            timestamp: Date.now(),
            content: wpContent
          };
          
          localStorage.setItem('violet-content', JSON.stringify(storageData));
          console.log('💾 Content saved to localStorage');
          
          // Force React to update without reload
          window.dispatchEvent(new CustomEvent('violet-content-synced', {
            detail: { content: wpContent, source: 'wordpress-emergency-fix' }
          }));
          
          // Also dispatch as storage event
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'violet-content',
            newValue: JSON.stringify(storageData),
            url: window.location.href
          }));
          
          console.log('✅ Emergency fix applied - content should update now');
          
          // NO RELOAD - let React handle the update
          console.log('ℹ️ Content updated without page reload');
        } else {
          console.log('ℹ️ Content unchanged, no update needed');
        }
      }
    } catch (error) {
      console.error('❌ Emergency fix failed:', error);
    }
  }
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceWordPressContent);
  } else {
    forceWordPressContent();
  }
  
  // Also listen for WordPress save messages
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'violet-apply-saved-changes') {
      console.log('📨 WordPress save detected, applying emergency fix...');
      // Don't fetch immediately, wait a bit to let React handle it first
      setTimeout(forceWordPressContent, 2000);
    }
  });
  
})();
