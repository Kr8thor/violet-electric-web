/**
 * WordPress Admin Communication Fix
 * Paste this in your WordPress admin console to fix communication issues
 */

console.log('🔧 Applying WordPress Admin Communication Fix...');

// 1. Enhanced Message Listener
let messageCount = 0;
let lastReadyMessage = null;

const enhancedMessageListener = (event) => {
    messageCount++;
    
    // Log all violet messages for debugging
    if (event.data?.type?.includes('violet')) {
        console.log(`📨 Message ${messageCount}: ${event.data.type}`, event.data);
        
        if (event.data.type === 'violet-iframe-ready') {
            lastReadyMessage = event.data;
            console.log('✅ React app ready signal received!');
            
            // Update connection status immediately
            const statusEl = document.getElementById('violet-connection-status');
            if (statusEl) {
                statusEl.textContent = '✅ Connected';
                statusEl.style.color = 'green';
                statusEl.style.fontWeight = 'bold';
            }
            
            // Mark WordPress as ready
            window.violetReactAppReady = true;
            
            // Try to enable editing immediately
            setTimeout(() => {
                if (typeof window.violetHandleMessage === 'function') {
                    window.violetHandleMessage(event.data, event);
                }
            }, 100);
        }
        
        if (event.data.type === 'violet-diagnostic-pong') {
            console.log('✅ React app alive and responding to diagnostics');
        }
        
        if (event.data.type === 'violet-content-changed') {
            console.log('📝 Content change detected:', event.data.data);
            
            // Ensure pending changes are tracked
            if (event.data.data && typeof window.violetPendingChanges === 'object') {
                window.violetPendingChanges[event.data.data.fieldType] = {
                    field_name: event.data.data.fieldType,
                    field_value: event.data.data.value,
                    field_type: event.data.data.fieldType
                };
                
                // Update save button
                if (typeof window.violetUpdateSaveButton === 'function') {
                    window.violetUpdateSaveButton();
                }
            }
        }
    }
};

// Remove existing listeners and add enhanced one
window.removeEventListener('message', window.violetHandleMessage);
window.addEventListener('message', enhancedMessageListener);

console.log('✅ Enhanced message listener installed');

// 2. Force Communication Test
const iframe = document.getElementById('violet-site-iframe');

if (iframe) {
    console.log('🔍 Testing iframe communication...');
    
    // Send test ping
    iframe.contentWindow.postMessage({
        type: 'violet-diagnostic-ping',
        timestamp: Date.now(),
        from: 'wordpress-admin'
    }, '*');
    
    console.log('📤 Test ping sent to React app');
    
    // Wait for response
    setTimeout(() => {
        if (lastReadyMessage) {
            console.log('✅ Communication working! Last ready message:', lastReadyMessage);
        } else {
            console.log('⚠️ No ready message received yet. Checking iframe...');
            
            // Try to force reload iframe if needed
            const currentSrc = iframe.src;
            const url = new URL(currentSrc);
            
            // Add communication debug parameters
            url.searchParams.set('comm_debug', '1');
            url.searchParams.set('force_ready', '1');
            url.searchParams.set('wp_fix_timestamp', Date.now().toString());
            
            console.log('🔄 Reloading iframe with debug parameters...');
            iframe.src = url.toString();
        }
    }, 3000);
    
} else {
    console.log('❌ No iframe found! Check if the React app is loaded.');
}

// 3. Fix Save Function if needed
if (typeof window.violetSaveAllChanges === 'function') {
    const originalSave = window.violetSaveAllChanges;
    
    window.violetSaveAllChanges = function() {
        console.log('💾 Enhanced save triggered');
        console.log('💾 Pending changes:', window.violetPendingChanges);
        
        // Call original save
        const result = originalSave.apply(this, arguments);
        
        // Enhanced success handling
        const checkSaveSuccess = () => {
            const statusEl = document.getElementById('violet-connection-status');
            if (statusEl && statusEl.textContent.includes('Saved')) {
                console.log('✅ Save completed successfully');
                
                // Send save success message to React
                if (iframe) {
                    iframe.contentWindow.postMessage({
                        type: 'violet-save-success',
                        timestamp: Date.now(),
                        changes: window.violetPendingChanges
                    }, '*');
                }
            }
        };
        
        setTimeout(checkSaveSuccess, 1000);
        return result;
    };
    
    console.log('✅ Enhanced save function installed');
} else {
    console.log('⚠️ violetSaveAllChanges function not found');
}

// 4. Connection Status Override
const fixConnectionStatus = () => {
    const statusEl = document.getElementById('violet-connection-status');
    if (statusEl) {
        const currentText = statusEl.textContent;
        
        if (currentText === 'Testing connection...') {
            console.log('🔧 Fixing stuck connection status');
            
            if (window.violetReactAppReady || lastReadyMessage) {
                statusEl.textContent = '✅ Connected';
                statusEl.style.color = 'green';
            } else {
                statusEl.textContent = '🔄 Connecting...';
                statusEl.style.color = 'orange';
            }
        }
    }
};

// Check and fix status every 2 seconds
setInterval(fixConnectionStatus, 2000);

// 5. Global debugging utilities
window.violetDebugComm = {
    messageCount: () => messageCount,
    lastReady: () => lastReadyMessage,
    sendTestPing: () => {
        if (iframe) {
            iframe.contentWindow.postMessage({
                type: 'violet-diagnostic-ping',
                timestamp: Date.now()
            }, '*');
        }
    },
    forceReload: () => {
        if (iframe) {
            iframe.src = iframe.src + (iframe.src.includes('?') ? '&' : '?') + 'force_reload=' + Date.now();
        }
    },
    checkStatus: () => {
        console.log('📊 Communication Status:');
        console.log('  Messages received:', messageCount);
        console.log('  React app ready:', !!window.violetReactAppReady);
        console.log('  Last ready message:', lastReadyMessage);
        console.log('  Pending changes:', Object.keys(window.violetPendingChanges || {}).length);
    }
};

console.log('✅ WordPress Admin Communication Fix applied!');
console.log('💡 Use window.violetDebugComm.checkStatus() to check communication status');
console.log('💡 Use window.violetDebugComm.sendTestPing() to test communication');
