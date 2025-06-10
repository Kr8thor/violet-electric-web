/**
 * WordPress Editor Fix & Diagnostic Script
 * Run this in the WordPress Admin console to fix and test the editor
 */

console.clear();
console.log('🔧 WORDPRESS EDITOR DIAGNOSTIC & FIX SCRIPT');
console.log('='.repeat(50));

// 1. Check current configuration
console.log('1️⃣ CHECKING CONFIGURATION:');
if (window.violetConfig) {
    console.log('✅ violetConfig found');
    console.log('   Netlify URL:', window.violetConfig.netlifyAppBaseUrl);
    console.log('   Allowed origins:', window.violetConfig.allowedMessageOrigins);
} else {
    console.log('❌ violetConfig not found - page may not be loaded correctly');
}

// 2. Check iframe status
console.log('\n2️⃣ CHECKING IFRAME:');
const iframe = document.getElementById('violet-site-iframe');
if (iframe) {
    console.log('✅ Iframe found');
    console.log('   Current src:', iframe.src);
    console.log('   Ready state:', iframe.readyState);
    
    // Force refresh iframe with current settings
    if (window.violetConfig) {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const dynamicWpOrigin = window.location.origin;
        const queryString = `edit_mode=1&wp_admin=1&t=${timestamp}&r=${randomId}&wp_origin=${encodeURIComponent(dynamicWpOrigin)}`;
        const newSrc = window.violetConfig.netlifyAppBaseUrl + '?' + queryString;
        
        console.log('🔄 Updating iframe src to:', newSrc);
        iframe.src = newSrc;
    }
} else {
    console.log('❌ Iframe not found');
}

// 3. Test Netlify site accessibility
console.log('\n3️⃣ TESTING NETLIFY SITE:');
if (window.violetConfig?.netlifyAppBaseUrl) {
    fetch(window.violetConfig.netlifyAppBaseUrl)
        .then(response => {
            console.log('✅ Netlify site accessible, status:', response.status);
            if (response.status === 200) {
                console.log('✅ Site is live and responding');
            }
        })
        .catch(error => {
            console.log('❌ Cannot access Netlify site:', error.message);
        });
}

// 4. Test message communication
console.log('\n4️⃣ TESTING COMMUNICATION:');
let messageReceived = false;

const messageHandler = (event) => {
    if (event.data && event.data.type && event.data.type.includes('violet')) {
        messageReceived = true;
        console.log('✅ Message received from React app:', event.data.type);
        window.removeEventListener('message', messageHandler);
    }
};

window.addEventListener('message', messageHandler);

// Send test message after iframe loads
setTimeout(() => {
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
            type: 'violet-test-access',
            from: 'wordpress-diagnostic',
            timestamp: Date.now()
        }, '*');
        console.log('📤 Test message sent to React app');
        
        // Check if response received
        setTimeout(() => {
            if (!messageReceived) {
                console.log('⚠️ No response from React app after 3 seconds');
                console.log('   This could indicate:');
                console.log('   - React app not loaded yet');
                console.log('   - Communication blocked');
                console.log('   - Asset loading issues');
            }
        }, 3000);
    }
}, 2000);

// 5. Monitor function availability
console.log('\n5️⃣ CHECKING FUNCTIONS:');
const functions = [
    'violetActivateEditing',
    'violetSaveAllChanges', 
    'violetRefreshPreview',
    'violetTestCommunication'
];

functions.forEach(func => {
    if (window[func]) {
        console.log(`✅ ${func} available`);
    } else {
        console.log(`❌ ${func} missing`);
    }
});

// 6. Advanced diagnostics
console.log('\n6️⃣ ADVANCED DIAGNOSTICS:');

// Check for WordPress vs React content detection
const checkContentSource = () => {
    const editableElements = document.querySelectorAll('[data-violet-field]');
    console.log(`📊 Found ${editableElements.length} editable elements`);
    
    if (editableElements.length > 0) {
        console.log('✅ React app appears to be loaded with editable content');
    } else {
        console.log('⚠️ No editable content found - React app may not be ready');
    }
};

// Wait for iframe to load before checking content
setTimeout(checkContentSource, 5000);

// 7. Fix functions
console.log('\n7️⃣ AVAILABLE FIX FUNCTIONS:');
console.log('   fixIframeUrl() - Force reload iframe with correct URL');
console.log('   testAssetLoading() - Check if CSS/JS assets are loading');
console.log('   forceCommunication() - Test bidirectional communication');

window.fixIframeUrl = function() {
    if (iframe && window.violetConfig) {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const newSrc = window.violetConfig.netlifyAppBaseUrl + `?edit_mode=1&wp_admin=1&t=${timestamp}&r=${randomId}&wp_origin=${encodeURIComponent(window.location.origin)}`;
        console.log('🔄 Setting new iframe URL:', newSrc);
        iframe.src = newSrc;
    }
};

window.testAssetLoading = function() {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    const scripts = document.querySelectorAll('script[src]');
    
    console.log('🧪 ASSET LOADING TEST:');
    console.log(`   CSS files: ${links.length}`);
    console.log(`   JS files: ${scripts.length}`);
    
    // Check for failed assets
    const failedAssets = [];
    links.forEach(link => {
        if (link.sheet === null && link.href) {
            failedAssets.push(link.href);
        }
    });
    
    if (failedAssets.length > 0) {
        console.log('❌ Failed to load CSS assets:', failedAssets);
    } else {
        console.log('✅ All CSS assets loaded successfully');
    }
};

window.forceCommunication = function() {
    if (iframe && iframe.contentWindow) {
        const testMessages = [
            { type: 'violet-test-access', test: 'basic-communication' },
            { type: 'violet-enable-editing', test: 'editing-mode' },
            { type: 'violet-refresh-content', test: 'content-refresh' }
        ];
        
        testMessages.forEach((msg, index) => {
            setTimeout(() => {
                iframe.contentWindow.postMessage(msg, '*');
                console.log(`📤 Sent test message ${index + 1}:`, msg.type);
            }, index * 1000);
        });
    }
};

console.log('\n✨ Diagnostic complete! Check results above.');
console.log('💡 Run fixIframeUrl() if iframe issues detected');
console.log('💡 Run testAssetLoading() to check CSS/JS loading');
console.log('💡 Run forceCommunication() to test React app communication');
