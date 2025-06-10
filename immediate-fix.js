// IMMEDIATE FIX - Run this in WordPress Admin Console NOW!
(function() {
    console.clear();
    console.log('🔧 FIXING REACT APP LOADING ISSUE...\n');
    
    // 1. Fix the iframe URL immediately
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.error('❌ Iframe not found! Are you on the Edit Frontend page?');
        return;
    }
    
    // Set the correct URL with all parameters
    const correctUrl = 'https://lustrous-dolphin-447351.netlify.app/?edit_mode=1&wp_admin=1&wp_origin=' + encodeURIComponent(window.location.origin) + '&t=' + Date.now();
    
    console.log('✅ Setting iframe URL to:', correctUrl);
    iframe.src = correctUrl;
    
    // 2. Update the config if it exists
    if (window.violetConfig) {
        window.violetConfig.netlifyAppUrl = 'https://lustrous-dolphin-447351.netlify.app';
        window.violetConfig.netlifyAppBaseUrl = 'https://lustrous-dolphin-447351.netlify.app';
        window.violetConfig.netlifyOrigin = 'https://lustrous-dolphin-447351.netlify.app';
        console.log('✅ Updated config object');
    }
    
    // 3. Force reload the iframe after a moment
    setTimeout(() => {
        console.log('🔄 Reloading iframe...');
        iframe.src = iframe.src; // Force reload
    }, 1000);
    
    // 4. Also open in new tab to verify it works
    console.log('📋 Opening in new tab to verify...');
    window.open(correctUrl, '_blank');
    
    console.log('\n✅ FIX APPLIED!');
    console.log('The React app should now load in the iframe.');
    console.log('If it still shows gray, check the new tab that opened.');
    
    // 5. Monitor for iframe load
    iframe.onload = function() {
        console.log('✅ Iframe loaded!');
        setTimeout(() => {
            try {
                // Try to check if React loaded
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    const root = iframeDoc.getElementById('root');
                    if (root && root.children.length > 0) {
                        console.log('✅ React app is rendering!');
                    } else {
                        console.log('⚠️ React root found but no children - app may still be loading');
                    }
                }
            } catch (e) {
                console.log('ℹ️ Cross-origin check - this is normal');
            }
        }, 2000);
    };
    
    iframe.onerror = function() {
        console.error('❌ Iframe failed to load!');
    };
})();

// Additional fix - update WordPress option via AJAX
(function() {
    // Create form data
    const formData = new FormData();
    formData.append('action', 'update_option');
    formData.append('option', 'violet_netlify_url');
    formData.append('value', 'https://lustrous-dolphin-447351.netlify.app');
    
    // Try to update via admin-ajax
    fetch(ajaxurl || '/wp-admin/admin-ajax.php', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
    }).then(response => {
        console.log('📝 Attempted to update WordPress option');
    }).catch(error => {
        console.log('ℹ️ Could not update option via AJAX - use Settings page');
    });
})();
