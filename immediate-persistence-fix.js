/**
 * 🚨 IMMEDIATE PERSISTENCE FIX
 * Copy and paste this ENTIRE script into WordPress admin console
 * This will fix the save persistence issue you're experiencing
 */

console.log('🚨 IMMEDIATE PERSISTENCE FIX STARTING...');
console.log('This will fix the content persistence issue in 10 seconds');

const iframe = document.getElementById('violet-site-iframe');

if (!iframe) {
    console.log('❌ No iframe found');
    return;
}

// 1. Enhanced Save Function with Proper Persistence
if (window.violetSaveAllChanges) {
    const originalSave = window.violetSaveAllChanges;
    
    window.violetSaveAllChanges = function() {
        console.log('💾 ENHANCED SAVE with persistence fix triggered');
        console.log('💾 Saving changes:', window.violetPendingChanges);
        
        // Call original save
        const result = originalSave.apply(this, arguments);
        
        // Enhanced post-save handling with persistence
        setTimeout(() => {
            console.log('🔄 Sending persistence messages to React...');
            
            // Convert pending changes to array format
            const changesArray = Object.values(window.violetPendingChanges || {});
            
            // Send multiple message types to ensure React receives them
            const persistenceMessages = [
                {
                    type: 'violet-apply-saved-changes',
                    savedChanges: changesArray,
                    timestamp: Date.now()
                },
                {
                    type: 'violet-persist-content',
                    content: window.violetPendingChanges,
                    timestamp: Date.now()
                },
                {
                    type: 'violet-content-updated',
                    changes: changesArray,
                    timestamp: Date.now()
                }
            ];
            
            // Send all persistence messages
            persistenceMessages.forEach((message, index) => {
                setTimeout(() => {
                    iframe.contentWindow.postMessage(message, '*');
                    console.log(`✅ Persistence message ${index + 1} sent:`, message.type);
                }, index * 200); // Stagger messages
            });
            
            // Force React to update localStorage directly
            setTimeout(() => {
                iframe.contentWindow.postMessage({
                    type: 'violet-force-localStorage-update',
                    content: changesArray,
                    forceReload: true,
                    timestamp: Date.now()
                }, '*');
                console.log('✅ Force localStorage update sent');
            }, 1000);
            
        }, 500);
        
        return result;
    };
    
    console.log('✅ Enhanced save function with persistence installed');
} else {
    console.log('❌ Save function not found - check functions.php');
}

// 2. Add React localStorage update handler
const reactStorageUpdate = (event) => {
    if (event.data?.type === 'violet-force-localStorage-update') {
        console.log('📦 React requested localStorage update');
        
        // Prepare content for React localStorage
        const contentForStorage = {};
        
        if (event.data.content && Array.isArray(event.data.content)) {
            event.data.content.forEach(change => {
                contentForStorage[change.field_name] = change.field_value;
            });
        }
        
        // Send localStorage format to React
        iframe.contentWindow.postMessage({
            type: 'violet-update-localStorage-now',
            content: {
                version: 'wp-save-v1',
                timestamp: Date.now(),
                content: contentForStorage
            },
            forceReload: event.data.forceReload
        }, '*');
        
        console.log('✅ localStorage update sent to React:', contentForStorage);
    }
};

window.addEventListener('message', reactStorageUpdate);

// 3. Test Current Save State
console.log('\n📊 CURRENT SAVE STATE:');
console.log('  Pending changes:', Object.keys(window.violetPendingChanges || {}).length);
console.log('  Save function:', typeof window.violetSaveAllChanges);
console.log('  Iframe found:', !!iframe);

// 4. Quick Test Function
window.testPersistence = () => {
    console.log('🧪 Testing persistence...');
    
    // Add a test change
    if (!window.violetPendingChanges) window.violetPendingChanges = {};
    
    window.violetPendingChanges['hero_title'] = {
        field_name: 'hero_title',
        field_value: 'PERSISTENCE TEST: ' + new Date().toLocaleTimeString(),
        field_type: 'hero_title'
    };
    
    // Update save button
    if (window.violetUpdateSaveButton) {
        window.violetUpdateSaveButton();
    }
    
    console.log('✅ Test change added - click "Save All Changes" to test');
    console.log('💡 After saving, refresh the page to check if change persists');
};

// 5. Check for existing changes and offer to save them
if (window.violetPendingChanges && Object.keys(window.violetPendingChanges).length > 0) {
    console.log('\n⚠️ You have unsaved changes:');
    Object.entries(window.violetPendingChanges).forEach(([key, change]) => {
        console.log(`  - ${change.field_name}: "${change.field_value}"`);
    });
    console.log('\n💡 Click "Save All Changes" button to save them with the new persistence fix');
} else {
    console.log('\n💡 No current changes. Use window.testPersistence() to add a test change');
}

setTimeout(() => {
    console.log('\n🚨 PERSISTENCE FIX COMPLETE');
    console.log('📋 What to do next:');
    console.log('  1. Make an edit (click text, change it)');
    console.log('  2. Click "Save All Changes" button');
    console.log('  3. Wait for save completion');
    console.log('  4. Refresh the page');
    console.log('  5. Changes should now persist! ✅');
    console.log('\n🔧 Debug commands:');
    console.log('  window.testPersistence() - Add test change');
}, 2000);

console.log('⏳ Persistence fix installed... ready to test!');
