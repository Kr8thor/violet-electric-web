// Complete WordPress Iframe Fix Solution
// Copy and paste this entire script into the WordPress admin console

(async function() {
    console.clear();
    console.log('🔧 WORDPRESS IFRAME COMPLETE DIAGNOSTIC & FIX\n');
    console.log('⏰ Time:', new Date().toLocaleString());
    console.log('═══════════════════════════════════════════\n');

    // Step 1: Check Netlify deployment status
    console.log('1️⃣ CHECKING NETLIFY DEPLOYMENT STATUS...');
    try {
        const response = await fetch('https://lustrous-dolphin-447351.netlify.app/');
        console.log('   Status:', response.status);
        
        if (response.status === 200) {
            const html = await response.text();
            const hasReactRoot = html.includes('id="root"');
            const hasReactAssets = html.includes('/assets/index-') && html.includes('.js');
            
            if (hasReactRoot && hasReactAssets) {
                console.log('   ✅ React app is deployed and accessible');
            } else {
                console.log('   ⚠️ Site responds but React app may not be properly built');
                console.log('   - Has root div:', hasReactRoot);
                console.log('   - Has React assets:', hasReactAssets);
            }
        } else {
            console.log('   ❌ Site not accessible. Status:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Cannot reach Netlify site:', error.message);
    }

    // Step 2: Check iframe element
    console.log('\n2️⃣ CHECKING IFRAME ELEMENT...');
    const iframe = document.getElementById('violet-site-iframe');
    
    if (!iframe) {
        console.log('   ❌ No iframe found with ID "violet-site-iframe"');
        return;
    }
    
    console.log('   ✅ Iframe found');
    console.log('   Current src:', iframe.src || '(empty)');
    console.log('   Dimensions:', iframe.offsetWidth + 'x' + iframe.offsetHeight);
    console.log('   Display:', window.getComputedStyle(iframe).display);
    console.log('   Visibility:', window.getComputedStyle(iframe).visibility);

    // Step 3: Check for blocking issues
    console.log('\n3️⃣ CHECKING FOR BLOCKING ISSUES...');
    
    // Check if iframe src is empty or wrong
    if (!iframe.src || iframe.src === 'about:blank' || iframe.src === window.location.href) {
        console.log('   ⚠️ Iframe src is empty or incorrect');
    }
    
    // Check for mixed content
    if (window.location.protocol === 'https:' && iframe.src && iframe.src.startsWith('http:')) {
        console.log('   ⚠️ Mixed content warning: HTTPS page loading HTTP iframe');
    }
    
    // Check iframe styles
    const computedStyle = window.getComputedStyle(iframe);
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
        console.log('   ⚠️ Iframe is hidden by CSS');
    }

    // Step 4: Apply fixes
    console.log('\n4️⃣ APPLYING FIXES...');
    
    // Fix 1: Set correct iframe URL
    const correctUrl = 'https://lustrous-dolphin-447351.netlify.app/?edit_mode=1&wp_admin=1&wp_origin=' + 
                      encodeURIComponent(window.location.origin) + '&t=' + Date.now();
    
    console.log('   Setting iframe URL to:', correctUrl);
    iframe.src = correctUrl;
    
    // Fix 2: Ensure iframe is visible
    iframe.style.display = 'block';
    iframe.style.visibility = 'visible';
    iframe.style.opacity = '1';
    iframe.style.backgroundColor = 'white'; // Prevent transparent background
    
    // Fix 3: Add error handling
    iframe.onerror = function(e) {
        console.error('   ❌ Iframe error:', e);
    };
    
    let loadTimeout;
    iframe.onload = function() {
        clearTimeout(loadTimeout);
        console.log('   ✅ Iframe load event fired');
        
        // Check if content actually loaded
        setTimeout(() => {
            try {
                // Try to check if iframe has content (will fail for cross-origin)
                const doc = iframe.contentDocument;
                if (doc) {
                    console.log('   ✅ Can access iframe document (same origin)');
                }
            } catch (e) {
                console.log('   ℹ️ Cross-origin iframe (normal) - content should be loaded');
            }
            
            // Visual check
            console.log('\n5️⃣ VISUAL CHECK:');
            console.log('   If iframe is still white, try:');
            console.log('   1. Open https://lustrous-dolphin-447351.netlify.app/ in new tab');
            console.log('   2. Check browser console for Content Security Policy errors');
            console.log('   3. Check if deployment is complete on Netlify dashboard');
            console.log('   4. Try the manual commands below');
        }, 2000);
    };
    
    // Set timeout for load
    loadTimeout = setTimeout(() => {
        console.log('   ⚠️ Iframe load timeout (10 seconds) - may still be loading');
    }, 10000);

    // Step 5: Provide manual commands
    console.log('\n6️⃣ MANUAL COMMANDS AVAILABLE:');
    
    window.iframeFix = {
        reload: function() {
            console.log('Reloading iframe...');
            iframe.src = iframe.src.includes('?') 
                ? iframe.src + '&reload=' + Date.now()
                : iframe.src + '?reload=' + Date.now();
        },
        
        openInNewTab: function() {
            window.open(iframe.src || correctUrl, '_blank');
        },
        
        setUrl: function(url) {
            console.log('Setting iframe URL to:', url);
            iframe.src = url;
        },
        
        checkStatus: function() {
            console.log('Iframe status:');
            console.log('- Src:', iframe.src);
            console.log('- Ready state:', iframe.contentDocument ? 'accessible' : 'cross-origin or not loaded');
            console.log('- Display:', window.getComputedStyle(iframe).display);
            console.log('- Dimensions:', iframe.offsetWidth + 'x' + iframe.offsetHeight);
        },
        
        testLocalhost: function() {
            console.log('Testing localhost development server...');
            iframe.src = 'http://localhost:5173/?edit_mode=1&wp_admin=1';
        }
    };
    
    console.log('   - iframeFix.reload()       : Reload the iframe');
    console.log('   - iframeFix.openInNewTab() : Open React app in new tab');
    console.log('   - iframeFix.checkStatus()  : Check current iframe status');
    console.log('   - iframeFix.testLocalhost(): Try localhost dev server');
    console.log('   - iframeFix.setUrl(url)    : Set custom URL');
    
    console.log('\n✅ DIAGNOSTIC COMPLETE');
    console.log('═══════════════════════════════════════════\n');
    
})();
