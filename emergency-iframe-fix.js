/**
 * EMERGENCY IFRAME FIX - Paste this in WordPress Admin Console
 * Fixes asset loading and forces WordPress-React communication
 */

console.log('🚨 EMERGENCY IFRAME FIX STARTING...');

(function() {
    'use strict';
    
    // Get iframe and force aggressive reload with cache busting
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.error('❌ Iframe not found!');
        return;
    }
    
    console.log('🔄 Current iframe src:', iframe.src);
    
    // Generate aggressive cache busting parameters
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const baseUrl = 'https://lustrous-dolphin-447351.netlify.app';
    const wpOrigin = encodeURIComponent(window.location.origin);
    
    // Force reload with multiple cache busting techniques
    const newUrl = `${baseUrl}?edit_mode=1&wp_admin=1&emergency=1&t=${timestamp}&r=${randomId}&v=fix&cb=${timestamp}&wp_origin=${wpOrigin}`;
    
    console.log('🚀 Reloading iframe with emergency parameters...');
    console.log('📍 New URL:', newUrl);
    
    iframe.src = newUrl;
    
    // Monitor for connection establishment
    let attempts = 0;
    const maxAttempts = 30; // 1.5 minutes
    let lastStatus = '';
    
    const monitor = setInterval(() => {
        attempts++;
        const connectionStatus = document.getElementById('violet-connection-status')?.textContent || 'Unknown';
        const editorStatus = document.getElementById('violet-editor-status')?.textContent || 'Unknown';
        
        if (connectionStatus !== lastStatus) {
            console.log(`🔍 Attempt ${attempts}/${maxAttempts}:`);
            console.log(`   Connection: ${connectionStatus}`);
            console.log(`   Editor: ${editorStatus}`);
            lastStatus = connectionStatus;
        }
        
        // Check for success
        if (connectionStatus.includes('✅') || connectionStatus.includes('Connected')) {
            clearInterval(monitor);
            console.log('🎉 SUCCESS! WordPress-React connection established!');
            console.log('✅ You can now edit content in the React app');
            
            // Test the connection
            testConnection();
            return;
        }
        
        // Check for timeout
        if (attempts >= maxAttempts) {
            clearInterval(monitor);
            console.log('⏰ Monitoring timeout reached');
            console.log('🔍 Current status:', { connectionStatus, editorStatus });
            console.log('💡 Try refreshing the WordPress admin page or wait for Netlify deployment');
        }
    }, 3000);
    
    // Function to test the connection
    function testConnection() {
        console.log('🧪 Testing WordPress-React communication...');
        
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-test-access',
                timestamp: Date.now(),
                source: 'emergency-fix'
            }, '*');
            console.log('📤 Test message sent to React app');
        }
    }
    
    // Listen for messages from React app
    const messageHandler = (event) => {
        if (event.data && event.data.type && event.data.type.includes('violet')) {
            console.log(`📨 Received from React: ${event.data.type}`);
            
            if (event.data.type === 'violet-access-confirmed') {
                console.log('✅ Communication confirmed! WordPress-React link is working');
            }
        }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Auto-cleanup after 2 minutes
    setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        console.log('🧹 Emergency fix cleanup completed');
    }, 120000);
    
    console.log('🛠️ Emergency fix applied. Monitoring for 1.5 minutes...');
    console.log('💡 If this doesn\'t work, wait for Netlify deployment (2-5 minutes)');
    
})();

console.log('📋 Emergency fix loaded. Results will appear above.');
