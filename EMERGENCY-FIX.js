// EMERGENCY FIX - PASTE THIS IN CONSOLE NOW!
// This will force the iframe to load correctly

(function() {
    console.clear();
    console.log('🚨 EMERGENCY IFRAME FIX STARTING...\n');
    
    // 1. Find the iframe
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.error('❌ No iframe found! Wrong page?');
        return;
    }
    
    console.log('✅ Found iframe');
    
    // 2. Check current src
    console.log('Current src:', iframe.src || '(empty)');
    
    // 3. Force correct URL
    const correctUrl = 'https://lustrous-dolphin-447351.netlify.app/?edit_mode=1&wp_admin=1&wp_origin=' + encodeURIComponent(window.location.origin) + '&t=' + Date.now();
    
    console.log('Setting to:', correctUrl);
    iframe.src = correctUrl;
    
    // 4. Add load monitoring
    iframe.onload = function() {
        console.log('✅ Iframe loaded successfully!');
        
        // Try to check content after load
        setTimeout(() => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if (doc) {
                    console.log('✅ Can access iframe document');
                    const root = doc.getElementById('root');
                    console.log('React root:', root ? 'Found' : 'Not found');
                }
            } catch (e) {
                console.log('ℹ️ Cross-origin - this is expected');
            }
        }, 1000);
    };
    
    iframe.onerror = function(e) {
        console.error('❌ Iframe error:', e);
    };
    
    // 5. Also update config
    if (window.violetConfig) {
        window.violetConfig.netlifyAppUrl = 'https://lustrous-dolphin-447351.netlify.app';
        window.violetConfig.netlifyAppBaseUrl = 'https://lustrous-dolphin-447351.netlify.app';
        console.log('✅ Updated config');
    }
    
    // 6. Force refresh after 2 seconds
    setTimeout(() => {
        console.log('🔄 Force refreshing iframe...');
        iframe.src = iframe.src;
    }, 2000);
    
    console.log('\n✅ FIX APPLIED - React app should load within seconds');
    
    // 7. Open in new tab to verify
    console.log('📋 Opening in new tab to verify React app works...');
    window.open(correctUrl, '_blank');
})();
