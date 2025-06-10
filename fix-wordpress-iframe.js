// Quick Fix for WordPress Editor Iframe
// Run this in the WordPress admin console to fix the white iframe issue

(function fixIframe() {
    console.clear();
    console.log('🔧 FIXING WORDPRESS EDITOR IFRAME...\n');
    
    // 1. Find the iframe
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.error('❌ No iframe found!');
        return;
    }
    
    console.log('✅ Iframe found');
    console.log('📍 Current URL:', iframe.src);
    
    // 2. Check if URL is correct
    const expectedUrls = [
        'https://lustrous-dolphin-447351.netlify.app/',
        'https://violetrainwater.com/',
        'http://localhost:5173/',
        'http://localhost:8080/'
    ];
    
    // 3. Set up proper iframe monitoring
    iframe.addEventListener('load', function() {
        console.log('✅ Iframe loaded event fired');
        
        try {
            // Try to access iframe content
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
                console.log('✅ Can access iframe document');
                const hasRoot = iframeDoc.getElementById('root');
                console.log('⚛️ React root:', hasRoot ? 'Found' : 'NOT FOUND');
                
                if (!hasRoot) {
                    console.warn('⚠️ React root element missing - app may not be loading');
                }
                
                // Check for any error messages
                const body = iframeDoc.body;
                if (body && body.textContent.trim() === '') {
                    console.warn('⚠️ Iframe body is empty');
                }
            }
        } catch (e) {
            console.log('🔒 Cross-origin iframe (expected) - content loaded from:', iframe.src);
        }
    });
    
    iframe.addEventListener('error', function(e) {
        console.error('❌ Iframe error:', e);
    });
    
    // 4. Function to update iframe URL
    window.updateIframe = function(url) {
        if (!url) {
            url = 'https://lustrous-dolphin-447351.netlify.app/?edit_mode=1&wp_admin=1&wp_origin=' + encodeURIComponent(window.location.origin) + '&t=' + Date.now();
        }
        console.log('🔄 Updating iframe URL to:', url);
        iframe.src = url;
    };
    
    // 5. Check if we need to update the URL
    if (!iframe.src || iframe.src === 'about:blank' || iframe.src === '') {
        console.log('⚠️ Iframe has no valid src, updating...');
        updateIframe();
    } else if (!iframe.src.includes('edit_mode=1')) {
        console.log('⚠️ Iframe missing edit_mode parameter, updating...');
        updateIframe();
    }
    
    // 6. Force refresh
    window.refreshIframe = function() {
        console.log('🔄 Force refreshing iframe...');
        const currentSrc = iframe.src;
        iframe.src = 'about:blank';
        setTimeout(() => {
            iframe.src = currentSrc.includes('?') 
                ? currentSrc + '&refresh=' + Date.now()
                : currentSrc + '?refresh=' + Date.now();
        }, 100);
    };
    
    // 7. Test different URLs
    window.testUrls = function() {
        const urls = [
            'https://lustrous-dolphin-447351.netlify.app/',
            'https://lustrous-dolphin-447351.netlify.app/?edit_mode=1&wp_admin=1',
            'https://violetrainwater.com/',
            'http://localhost:5173/',
            'http://localhost:8080/'
        ];
        
        let index = 0;
        function tryNext() {
            if (index < urls.length) {
                console.log(`\n🧪 Testing URL ${index + 1}/${urls.length}: ${urls[index]}`);
                iframe.src = urls[index];
                index++;
                setTimeout(tryNext, 5000); // Try next URL after 5 seconds
            }
        }
        tryNext();
    };
    
    // 8. Open in new tab to verify it works
    window.openInNewTab = function() {
        const url = iframe.src || 'https://lustrous-dolphin-447351.netlify.app/';
        console.log('🔗 Opening in new tab:', url);
        window.open(url, '_blank');
    };
    
    console.log('\n📋 AVAILABLE COMMANDS:');
    console.log('- updateIframe()     : Update iframe with correct parameters');
    console.log('- refreshIframe()    : Force refresh the iframe');
    console.log('- testUrls()         : Test different URLs automatically');
    console.log('- openInNewTab()     : Open the React app in a new tab');
    
    console.log('\n💡 SUGGESTIONS:');
    console.log('1. First try: openInNewTab() to verify the React app loads');
    console.log('2. If it loads in new tab but not iframe, check console for CORS errors');
    console.log('3. Try: updateIframe() to ensure correct parameters');
    console.log('4. Check browser console for any blocked content warnings');
    
})();
