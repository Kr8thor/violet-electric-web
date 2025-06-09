// Emergency WordPress Content Fix
// This forces the React app to fetch and use WordPress content

(function() {
  console.log('🚑 Emergency WordPress content fix loading...');
  
  // Force fetch WordPress content on page load
  async function forceWordPressContent() {
    try {
      console.log('🔄 Fetching content from WordPress...');
      const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content');
      
      if (response.ok) {
        const wpContent = await response.json();
        console.log('✅ WordPress content received:', wpContent);
        
        // Store in localStorage with proper structure
        const storageData = {
          version: 'v1',
          timestamp: Date.now(),
          content: wpContent
        };
        
        localStorage.setItem('violet-content', JSON.stringify(storageData));
        console.log('💾 Content saved to localStorage');
        
        // Force React to update
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
        
        // Reload page to ensure content is displayed
        setTimeout(() => {
          console.log('🔄 Reloading page to show updated content...');
          window.location.reload();
        }, 500);
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
      forceWordPressContent();
    }
  });
  
})();
