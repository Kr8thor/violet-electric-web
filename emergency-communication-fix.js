/**
 * EMERGENCY WORDPRESS-REACT COMMUNICATION FIX
 * 
 * Run this script in the WordPress admin console (F12) to immediately fix
 * the connection issue between WordPress and React app.
 * 
 * This addresses the "Testing connection..." stuck state.
 */

console.clear();
console.log('🚨 EMERGENCY COMMUNICATION FIX STARTING...');

// Step 1: Check current state
const iframe = document.getElementById('violet-site-iframe');
const connectionStatus = document.getElementById('violet-connection-status');
const editorStatus = document.getElementById('violet-editor-status');

console.log('📊 Current State:');
console.log('- Iframe found:', !!iframe);
console.log('- Iframe src:', iframe?.src);
console.log('- Connection status:', connectionStatus?.textContent);
console.log('- Editor status:', editorStatus?.textContent);

if (!iframe) {
    console.error('❌ No iframe found - cannot proceed with fix');
    throw new Error('Iframe not found');
}

// Step 2: Enhanced message handler with aggressive debugging
let messageCount = 0;
const receivedMessages = [];

const emergencyMessageHandler = (event) => {
    messageCount++;
    const message = {
        count: messageCount,
        origin: event.origin,
        type: event.data?.type,
        data: event.data,
        timestamp: new Date().toLocaleTimeString()
    };
    
    receivedMessages.push(message);
    
    if (event.data?.type?.includes('violet')) {
        console.log(`📨 Message ${messageCount}:`, message);
        
        // Handle specific message types
        switch (event.data.type) {
            case 'violet-iframe-ready':
                console.log('✅ React app is ready!');
                if (connectionStatus) {
                    connectionStatus.textContent = '✅ React app ready';
                    connectionStatus.className = 'status-success';
                }
                
                // Send confirmation back
                iframe.contentWindow.postMessage({
                    type: 'violet-access-confirmed',
                    success: true,
                    timestamp: Date.now()
                }, '*');
                
                console.log('📤 Sent access confirmation to React');
                break;
                
            case 'violet-access-confirmed':
                console.log('✅ Two-way communication established!');
                if (connectionStatus) {
                    connectionStatus.textContent = '✅ Connected';
                    connectionStatus.className = 'status-success';
                }
                if (editorStatus) {
                    editorStatus.textContent = '✅ Ready for editing';
                    editorStatus.className = 'status-success';
                }
                break;
                
            case 'violet-content-changed':
                console.log('📝 Content changed:', event.data.data);
                // Update pending changes
                if (window.violetPendingChanges && event.data.data) {
                    window.violetPendingChanges[event.data.data.fieldType] = event.data.data;
                    if (window.violetUpdateSaveButton) {
                        window.violetUpdateSaveButton();
                    }
                }
                break;
        }
    }
};

// Remove existing listeners and add new one
window.removeEventListener('message', window.violetHandleMessage);
window.addEventListener('message', emergencyMessageHandler);

console.log('✅ Emergency message handler installed');

// Step 3: Force iframe reload with enhanced parameters
const reloadIframe = () => {
    const currentSrc = iframe.src;
    const baseUrl = currentSrc.split('?')[0];
    const wpOrigin = encodeURIComponent(window.location.origin);
    const timestamp = Date.now();
    const emergency = Math.random().toString(36).substring(2, 15);
    
    const newSrc = `${baseUrl}?edit_mode=1&wp_admin=1&wp_origin=${wpOrigin}&t=${timestamp}&emergency=${emergency}&force_communication=1`;
    
    console.log('🔄 Reloading iframe with emergency parameters...');
    console.log('New src:', newSrc);
    
    iframe.src = newSrc;
    
    if (connectionStatus) {
        connectionStatus.textContent = 'Establishing emergency connection...';
        connectionStatus.className = 'status-info';
    }
};

// Step 4: Test current communication first
console.log('🧪 Testing current communication...');

const testCommunication = () => {
    if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({
            type: 'violet-test-access',
            timestamp: Date.now(),
            from: 'wordpress-emergency-fix'
        }, '*');
        
        console.log('📤 Sent test message to React app');
        
        // Wait for response
        setTimeout(() => {
            const recentMessages = receivedMessages.filter(m => 
                Date.now() - new Date(m.timestamp).getTime() < 5000
            );
            
            if (recentMessages.length === 0) {
                console.log('⚠️ No response received - forcing iframe reload');
                reloadIframe();
            } else {
                console.log('✅ Communication appears to be working');
            }
        }, 3000);
    }
};

// Step 5: Enhanced save button functionality
const enhanceSaveButton = () => {
    const saveBtn = document.getElementById('violet-save-all-btn');
    if (saveBtn && window.violetSaveAllChanges) {
        const originalSave = window.violetSaveAllChanges;
        
        window.violetSaveAllChanges = function() {
            console.log('💾 Enhanced save function called');
            
            // Notify React app about save preparation
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'violet-prepare-save',
                    timestamp: Date.now()
                }, '*');
            }
            
            // Call original save function
            return originalSave.apply(this, arguments);
        };
        
        console.log('✅ Save function enhanced');
    }
};

// Step 6: Execute the fix
setTimeout(() => {
    testCommunication();
    enhanceSaveButton();
}, 1000);

// Step 7: Monitor for 30 seconds
let monitorCount = 0;
const monitor = setInterval(() => {
    monitorCount++;
    
    const status = connectionStatus?.textContent || 'unknown';
    console.log(`Monitor ${monitorCount}/30: ${status}`);
    
    if (status.includes('✅ Connected') || monitorCount >= 30) {
        clearInterval(monitor);
        
        if (status.includes('✅ Connected')) {
            console.log('🎉 EMERGENCY FIX SUCCESSFUL!');
            console.log('📊 Communication Summary:');
            console.log(`- Messages received: ${messageCount}`);
            console.log(`- Connection status: ${status}`);
            console.log('- Recent messages:', receivedMessages.slice(-3));
            
            // Test editing functionality
            setTimeout(() => {
                console.log('🧪 Testing editing activation...');
                if (window.violetActivateEditing) {
                    console.log('✅ Edit functions available');
                } else {
                    console.log('⚠️ Edit functions not found');
                }
            }, 2000);
            
        } else {
            console.log('❌ Emergency fix timeout - manual intervention needed');
            console.log('📝 Debug info for manual fix:');
            console.log('- Check Netlify deployment status');
            console.log('- Verify React app loads correctly');
            console.log('- Check browser console for errors');
            console.log('- Try refreshing the entire WordPress admin page');
        }
    }
}, 1000);

// Step 8: Provide manual override functions
window.emergencyCommTest = () => {
    console.log('🔧 Manual communication test');
    testCommunication();
};

window.emergencyReload = () => {
    console.log('🔧 Manual iframe reload');
    reloadIframe();
};

window.emergencyStatus = () => {
    console.log('📊 Emergency fix status:');
    console.log('- Messages received:', messageCount);
    console.log('- Recent messages:', receivedMessages.slice(-5));
    console.log('- Current iframe src:', iframe?.src);
    console.log('- Connection status:', connectionStatus?.textContent);
};

console.log('🚨 EMERGENCY FIX INITIATED!');
console.log('📋 Available manual commands:');
console.log('- emergencyCommTest() - Test communication');
console.log('- emergencyReload() - Force iframe reload');
console.log('- emergencyStatus() - Show current status');
console.log('⏱️ Monitoring for 30 seconds...');
