/**
 * EMERGENCY WORDPRESS EDITOR FIX
 * Copy and paste this entire script into WordPress Admin console (F12)
 * when the editor is not working properly
 */

(function() {
    'use strict';
    
    console.log('🚨 EMERGENCY WORDPRESS EDITOR FIX STARTED');
    
    // Step 1: Fix iframe URL to use latest deployment
    const iframe = document.getElementById('violet-site-iframe');
    if (iframe) {
        const correctUrl = 'https://lustrous-dolphin-447351.netlify.app';
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const wpOrigin = encodeURIComponent(window.location.origin);
        const queryString = `edit_mode=1&wp_admin=1&t=${timestamp}&r=${randomId}&wp_origin=${wpOrigin}`;
        
        iframe.src = correctUrl + '?' + queryString;
        console.log('✅ Iframe URL updated with cache busting');
        console.log('   New URL:', iframe.src);
        
        // Force reload after 2 seconds
        setTimeout(() => {
            iframe.contentWindow.location.reload();
        }, 2000);
    }
    
    // Step 2: Update global config if it exists
    if (window.violetConfig) {
        window.violetConfig.netlifyAppBaseUrl = 'https://lustrous-dolphin-447351.netlify.app';
        window.violetConfig.netlifyOrigin = 'https://lustrous-dolphin-447351.netlify.app';
        console.log('✅ Global config updated');
    }
    
    // Step 3: Enhanced message handling
    let messageCount = 0;
    const originalHandler = window.violetHandleMessage;
    
    window.violetHandleMessage = function(event) {
        messageCount++;
        console.log(`📨 Message ${messageCount}:`, event.data?.type || 'unknown');
        
        // Call original handler if it exists
        if (originalHandler && typeof originalHandler === 'function') {
            originalHandler.call(this, event);
        }
        
        // Enhanced handling for iframe ready
        if (event.data?.type === 'violet-iframe-ready') {
            console.log('✅ React app confirmed ready');
            document.getElementById('violet-connection-status').textContent = '✅ Connected';
            
            // Auto-test communication
            setTimeout(() => {
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'violet-test-access',
                        from: 'emergency-fix'
                    }, '*');
                }
            }, 1000);
        }
    };
    
    // Step 4: Force communication test
    setTimeout(() => {
        if (iframe && iframe.contentWindow) {
            console.log('🔗 Testing communication...');
            iframe.contentWindow.postMessage({
                type: 'violet-test-access',
                timestamp: Date.now()
            }, '*');
        }
    }, 3000);
    
    // Step 5: Monitor and report status
    let statusChecks = 0;
    const statusMonitor = setInterval(() => {
        statusChecks++;
        const connectionStatus = document.getElementById('violet-connection-status');
        
        if (connectionStatus) {
            const currentStatus = connectionStatus.textContent;
            console.log(`📊 Status check ${statusChecks}: ${currentStatus}`);
            
            if (currentStatus.includes('✅') || statusChecks > 10) {
                clearInterval(statusMonitor);
                if (currentStatus.includes('✅')) {
                    console.log('🎉 EMERGENCY FIX SUCCESSFUL!');
                    console.log('   Editor should now be working');
                    console.log('   Try clicking "Enable Direct Editing"');
                } else {
                    console.log('⚠️ Emergency fix completed but connection status unclear');
                    console.log('   Check Netlify deployment at: https://app.netlify.com/sites/lustrous-dolphin-447351/deploys');
                }
            }
        }
    }, 2000);
    
    // Step 6: Quick diagnostic info
    setTimeout(() => {
        console.log('\n📋 DIAGNOSTIC SUMMARY:');
        console.log('   Iframe found:', !!iframe);
        console.log('   Config exists:', !!window.violetConfig);
        console.log('   Save function:', !!window.violetSaveAllChanges);
        console.log('   Messages received:', messageCount);
        
        const editButton = document.getElementById('violet-edit-toggle');
        if (editButton) {
            console.log('   Edit button ready:', editButton.textContent);
        }
    }, 5000);
    
    console.log('🚨 EMERGENCY FIX COMPLETE - Monitor console for updates');
    
})();

// Additional utility functions
window.quickDiagnose = function() {
    console.log('🔍 QUICK DIAGNOSE:');
    console.log('   React app URL:', document.getElementById('violet-site-iframe')?.src);
    console.log('   Connection:', document.getElementById('violet-connection-status')?.textContent);
    console.log('   Editor:', document.getElementById('violet-editor-status')?.textContent);
    console.log('   Changes:', document.getElementById('violet-changes-status')?.textContent);
};

window.forceReconnect = function() {
    console.log('🔄 FORCING RECONNECTION...');
    const iframe = document.getElementById('violet-site-iframe');
    if (iframe) {
        const currentSrc = iframe.src;
        const newTimestamp = Date.now();
        const newSrc = currentSrc.replace(/t=\d+/, `t=${newTimestamp}`).replace(/r=[^&]+/, `r=${Math.random().toString(36).substring(2, 15)}`);
        iframe.src = newSrc;
        console.log('✅ Iframe reloaded with new cache-busting parameters');
    }
};

console.log('💡 Additional functions available:');
console.log('   quickDiagnose() - Show current status');
console.log('   forceReconnect() - Force iframe reload');
