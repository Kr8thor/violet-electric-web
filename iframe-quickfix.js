// Quick fix for WordPress iframe visibility issue
// Copy and paste this entire script into the browser console on the WordPress admin page

(function() {
    console.clear();
    console.log('🔧 Violet Iframe Quick Fix Starting...\n');
    
    // Step 1: Check config
    const config = window.violetConfig;
    if (!config) {
        console.error('❌ FATAL: window.violetConfig not found!');
        console.log('This suggests the page hasn\'t loaded properly or there\'s a JavaScript error.');
        return;
    }
    
    console.log('✅ Config found. Netlify URL:', config.netlifyAppUrl || '❌ MISSING!');
    
    // Step 2: Find and fix iframe
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.error('❌ FATAL: Iframe element not found!');
        return;
    }
    
    console.log('✅ Iframe element found');
    console.log('Current src:', iframe.src || 'EMPTY');
    
    // Step 3: Force proper styling
    console.log('\n📐 Applying visibility fixes...');
    
    // Fix iframe styling
    iframe.style.width = '100%';
    iframe.style.height = '75vh';
    iframe.style.minHeight = '600px';
    iframe.style.border = '3px solid #0073aa';
    iframe.style.borderRadius = '12px';
    iframe.style.display = 'block';
    iframe.style.visibility = 'visible';
    iframe.style.opacity = '1';
    
    // Fix container styling
    const container = iframe.closest('.violet-preview-container-final');
    if (container) {
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        container.style.overflow = 'visible';
        container.style.minHeight = '650px';
        console.log('✅ Container styling fixed');
    }
    
    // Step 4: Set iframe src if needed
    if (!iframe.src || iframe.src === 'about:blank' || iframe.src === window.location.href) {
        console.log('\n🔄 Setting iframe src...');
        
        const netlifyUrl = config.netlifyAppUrl || config.netlifyAppBaseUrl || 'https://lustrous-dolphin-447351.netlify.app';
        const wpOrigin = encodeURIComponent(window.location.origin);
        const timestamp = new Date().getTime();
        const newSrc = `${netlifyUrl}?edit_mode=1&wp_admin=1&t=${timestamp}&wp_origin=${wpOrigin}`;
        
        console.log('New src:', newSrc);
        iframe.src = newSrc;
        
        // Monitor loading
        iframe.onload = function() {
            console.log('✅ Iframe loaded successfully!');
            console.log('If you still see a blank frame, check:');
            console.log('1. Netlify deployment is live');
            console.log('2. No X-Frame-Options blocking');
            console.log('3. Browser console for errors');
        };
        
        iframe.onerror = function() {
            console.error('❌ Iframe failed to load!');
            console.log('This usually means:');
            console.log('1. The URL is incorrect');
            console.log('2. The site is down');
            console.log('3. CORS/security blocking');
        };
    } else {
        console.log('✅ Iframe src already set:', iframe.src);
    }
    
    // Step 5: Test message communication
    console.log('\n📡 Testing communication...');
    setTimeout(() => {
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-test-access',
                from: 'debug-script',
                timestamp: Date.now()
            }, '*');
            console.log('📤 Test message sent to iframe');
        }
    }, 2000);
    
    // Step 6: Provide debug info
    console.log('\n📊 Debug Summary:');
    console.log('=================');
    console.log('Iframe ID:', iframe.id);
    console.log('Iframe src:', iframe.src);
    console.log('Iframe display:', iframe.style.display);
    console.log('Container found:', !!container);
    console.log('Config URL:', config.netlifyAppUrl);
    console.log('=================\n');
    
    console.log('💡 If iframe is still not visible:');
    console.log('1. Check browser DevTools Network tab for failed requests');
    console.log('2. Look for JavaScript errors in console');
    console.log('3. Verify Netlify site is accessible directly');
    console.log('4. Check for Content Security Policy errors');
    
    // Expose debug function
    window.violetFixIframe = function() {
        console.log('Running iframe fix again...');
        arguments.callee();
    };
    
    console.log('\n✨ Fix complete! Run violetFixIframe() to try again.');
})();
