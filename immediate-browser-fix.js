// IMMEDIATE FIX - Run this in your browser console right now!
// This will force your React app to load the saved WordPress content

(async function() {
    console.log('🚨 Running immediate content fix...');
    
    try {
        // 1. Fetch fresh content from WordPress
        const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content');
        const wpContent = await response.json();
        console.log('✅ WordPress content:', wpContent);
        
        // 2. Save to localStorage with correct structure
        const storageData = {
            version: 'v1',
            timestamp: Date.now(),
            content: wpContent
        };
        
        localStorage.setItem('violet-content', JSON.stringify(storageData));
        console.log('💾 Saved to localStorage');
        
        // 3. Force update all React components
        window.dispatchEvent(new CustomEvent('violet-content-updated', {
            detail: wpContent
        }));
        
        window.dispatchEvent(new CustomEvent('violet-content-synced', {
            detail: { content: wpContent, source: 'manual-fix' }
        }));
        
        console.log('✅ Content events dispatched');
        
        // 4. Update DOM directly as immediate visual feedback
        const heroTitle = document.querySelector('[data-violet-field="hero_title"]');
        if (heroTitle && wpContent.hero_title) {
            heroTitle.textContent = wpContent.hero_title;
            console.log('✅ Updated hero title to:', wpContent.hero_title);
        }
        
        // 5. Show what's currently displayed vs what should be displayed
        console.group('📊 Content Comparison:');
        console.log('WordPress hero_title:', wpContent.hero_title || '(empty)');
        console.log('Currently displayed:', heroTitle?.textContent || '(not found)');
        console.log('Should match:', wpContent.hero_title === heroTitle?.textContent ? '✅ YES' : '❌ NO');
        console.groupEnd();
        
        console.log('✅ Fix complete! If content doesn\'t update, refresh the page.');
        
    } catch (error) {
        console.error('❌ Fix failed:', error);
    }
})();
