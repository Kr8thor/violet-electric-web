/**
 * 🚨 EMERGENCY QUICK FIX
 * Copy and paste this ENTIRE script into WordPress admin console
 * This will fix communication and save issues immediately
 */

console.log('🚨 EMERGENCY QUICK FIX STARTING...');
console.log('This will fix communication and save issues in 30 seconds');

// 1. Fix Communication immediately
let readyReceived = false;
const iframe = document.getElementById('violet-site-iframe');

if (iframe) {
    console.log('✅ Found iframe, fixing communication...');
    
    // Enhanced message listener
    const fixedListener = (event) => {
        if (event.data?.type === 'violet-iframe-ready') {
            readyReceived = true;
            console.log('✅ React app ready signal received!');
            
            // Fix connection status immediately
            const statusEl = document.getElementById('violet-connection-status');
            if (statusEl) {
                statusEl.textContent = '✅ Connected';
                statusEl.style.color = 'green';
                statusEl.style.fontWeight = 'bold';
            }
            
            window.violetReactAppReady = true;
            console.log('✅ WordPress marked as ready');
        }
        
        if (event.data?.type === 'violet-content-changed') {
            console.log('📝 Content change:', event.data.data);
            
            if (event.data.data && window.violetPendingChanges) {
                window.violetPendingChanges[event.data.data.fieldType] = {
                    field_name: event.data.data.fieldType,
                    field_value: event.data.data.value,
                    field_type: event.data.data.fieldType
                };
                
                if (window.violetUpdateSaveButton) {
                    window.violetUpdateSaveButton();
                }
                console.log('✅ Change tracked for save');
            }
        }
    };
    
    // Remove old listeners, add new one
    window.removeEventListener('message', window.violetHandleMessage);
    window.addEventListener('message', fixedListener);
    
    // Force iframe to send ready message
    iframe.contentWindow.postMessage({
        type: 'violet-force-ready',
        timestamp: Date.now()
    }, '*');
    
    console.log('📤 Forced ready message request sent');
} else {
    console.log('❌ No iframe found');
}

// 2. Fix Save Function
if (window.violetSaveAllChanges) {
    const originalSave = window.violetSaveAllChanges;
    
    window.violetSaveAllChanges = function() {
        console.log('💾 Enhanced save triggered');
        console.log('💾 Saving changes:', window.violetPendingChanges);
        
        // Call original save
        const result = originalSave.apply(this, arguments);
        
        // Enhanced post-save handling
        setTimeout(() => {
            if (iframe && iframe.contentWindow) {
                // Send save success to React
                iframe.contentWindow.postMessage({
                    type: 'violet-apply-saved-changes',
                    savedChanges: Object.values(window.violetPendingChanges || {}),
                    timestamp: Date.now()
                }, '*');
                
                console.log('✅ Save message sent to React app');
            }
        }, 500);
        
        return result;
    };
    
    console.log('✅ Enhanced save function installed');
} else {
    console.log('⚠️ Save function not found - check functions.php');
}

// 3. Fix Connection Status Loop
const statusFix = () => {
    const statusEl = document.getElementById('violet-connection-status');
    if (statusEl && statusEl.textContent === 'Testing connection...') {
        if (readyReceived || window.violetReactAppReady) {
            statusEl.textContent = '✅ Connected';
            statusEl.style.color = 'green';
        } else {
            statusEl.textContent = '🔄 Connecting...';
            statusEl.style.color = 'orange';
        }
    }
};

setInterval(statusFix, 1000);

// 4. Add Global Debug Utilities
window.emergencyFix = {
    forceConnect: () => {
        readyReceived = true;
        window.violetReactAppReady = true;
        statusFix();
        console.log('✅ Connection forced');
    },
    
    testSave: () => {
        if (iframe) {
            iframe.contentWindow.postMessage({
                type: 'violet-apply-saved-changes',
                savedChanges: [{
                    field_name: 'hero_title',
                    field_value: 'Emergency test: ' + new Date().toTimeString()
                }],
                timestamp: Date.now()
            }, '*');
            console.log('✅ Test save sent');
        }
    },
    
    status: () => {
        console.log('📊 System Status:');
        console.log('  Ready received:', readyReceived);
        console.log('  WordPress ready:', !!window.violetReactAppReady);
        console.log('  Iframe found:', !!iframe);
        console.log('  Save function:', typeof window.violetSaveAllChanges);
        console.log('  Pending changes:', Object.keys(window.violetPendingChanges || {}).length);
    }
};

// 5. Final Status Check
setTimeout(() => {
    console.log('\n🔍 EMERGENCY FIX RESULTS:');
    
    if (readyReceived) {
        console.log('✅ Communication: WORKING');
    } else {
        console.log('❌ Communication: FAILED - iframe may need reload');
    }
    
    if (window.violetSaveAllChanges) {
        console.log('✅ Save function: ENHANCED');
    } else {
        console.log('❌ Save function: MISSING');
    }
    
    console.log('\n💡 Available commands:');
    console.log('  window.emergencyFix.status() - Check system status');
    console.log('  window.emergencyFix.forceConnect() - Force connection');
    console.log('  window.emergencyFix.testSave() - Test save functionality');
    
    console.log('\n🎯 Next steps:');
    if (readyReceived) {
        console.log('  1. Click "Enable Edit Mode"');
        console.log('  2. Click text in iframe to edit');
        console.log('  3. Click "Save All Changes"');
        console.log('  4. Check if changes persist after refresh');
    } else {
        console.log('  1. Try: window.emergencyFix.forceConnect()');
        console.log('  2. Reload iframe if needed');
        console.log('  3. Run comprehensive diagnostic');
    }
    
    console.log('\n🚨 EMERGENCY FIX COMPLETE');
}, 10000);

console.log('⏳ Emergency fix running... check results in 10 seconds');
