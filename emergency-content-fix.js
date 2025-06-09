// Emergency Content Fix Script
// Run this in the browser console to force sync with WordPress

(function fixContent() {
    console.log('🔧 Starting emergency content fix...');
    
    // 1. Clear all local storage content
    console.log('🗑️ Clearing local storage...');
    localStorage.removeItem('violet-content');
    localStorage.removeItem('hero_title');
    localStorage.removeItem('hero_subtitle');
    localStorage.removeItem('hero_cta');
    
    // 2. Fetch fresh content from WordPress
    console.log('📥 Fetching content from WordPress...');
    
    fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content')
        .then(response => response.json())
        .then(wpContent => {
            console.log('✅ WordPress content received:', wpContent);
            
            // 3. Save to localStorage in the correct format
            const storageData = {
                version: 'v1',
                timestamp: Date.now(),
                content: wpContent
            };
            
            localStorage.setItem('violet-content', JSON.stringify(storageData));
            console.log('💾 Content saved to localStorage');
            
            // 4. Dispatch events to update React
            window.dispatchEvent(new CustomEvent('violet-content-updated', { detail: wpContent }));
            window.dispatchEvent(new CustomEvent('violet-content-synced', { detail: { content: wpContent, source: 'wordpress' } }));
            
            console.log('✅ Content fix complete! Refreshing page...');
            
            // 5. Reload the page
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        })
        .catch(error => {
            console.error('❌ Failed to fetch WordPress content:', error);
            console.log('💡 Try refreshing the page manually');
        });
})();
