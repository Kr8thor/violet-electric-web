/**
 * 🔍 COMPREHENSIVE COMMUNICATION DIAGNOSTIC
 * Run this in WordPress Admin console to diagnose connection issues
 */

console.log('🔍 STARTING COMPREHENSIVE COMMUNICATION DIAGNOSTIC');
console.log('================================================');

function runCommunicationDiagnostic() {
    console.log('\n📋 STEP 1: WordPress Admin Environment Check');
    
    // Check if we're in the correct WordPress page
    const isUniversalEditor = window.location.href.includes('violet-universal-editor');
    const isReactEditor = window.location.href.includes('violet-frontend-editor');
    const hasIframe = !!document.getElementById('violet-site-iframe');
    
    console.log('🌐 Current page:', window.location.href);
    console.log('🎨 Universal Editor page:', isUniversalEditor);
    console.log('⚛️ React Editor page:', isReactEditor);
    console.log('🖼️ Iframe present:', hasIframe);
    
    if (!hasIframe) {
        console.log('❌ CRITICAL: No iframe found!');
        console.log('💡 Solution: Go to WordPress Admin → Universal Editor');
        return;
    }
    
    console.log('\n📋 STEP 2: Iframe Status Check');
    
    const iframe = document.getElementById('violet-site-iframe');
    console.log('🖼️ Iframe URL:', iframe.src);
    console.log('🖼️ Iframe loaded:', iframe.contentWindow ? 'Yes' : 'No');
    
    // Check if iframe URL has correct parameters
    const iframeURL = new URL(iframe.src);
    const hasEditMode = iframeURL.searchParams.has('edit_mode');
    const hasWpAdmin = iframeURL.searchParams.has('wp_admin');
    const hasWpOrigin = iframeURL.searchParams.has('wp_origin');
    
    console.log('📝 URL Parameters:');
    console.log('   edit_mode:', hasEditMode);
    console.log('   wp_admin:', hasWpAdmin);
    console.log('   wp_origin:', hasWpOrigin);
    
    if (!hasEditMode || !hasWpAdmin) {
        console.log('❌ CRITICAL: Missing required URL parameters!');
        console.log('💡 Solution: Refresh the Universal Editor page');
        return;
    }
    
    console.log('\n📋 STEP 3: Communication Test');
    
    let messageReceived = false;
    let communicationTest = 0;
    
    // Set up message listener
    window.addEventListener('message', function testListener(event) {
        if (event.data?.type?.startsWith('violet-')) {
            messageReceived = true;
            communicationTest++;
            console.log(`✅ Message ${communicationTest} received:`, event.data.type);
            
            if (event.data.type === 'violet-iframe-ready') {
                console.log('🎉 React app confirmed ready!');
            }
            
            if (event.data.type === 'violet-access-confirmed') {
                console.log('🎉 Two-way communication established!');
            }
        }
    });
    
    // Send test message to React app
    console.log('📤 Sending test message to React app...');
    iframe.contentWindow.postMessage({
        type: 'violet-test-connection',
        timestamp: Date.now()
    }, '*');
    
    // Wait for response
    setTimeout(() => {
        if (messageReceived) {
            console.log('✅ COMMUNICATION WORKING: Messages received from React');
        } else {
            console.log('❌ COMMUNICATION BROKEN: No response from React app');
            console.log('\n🔧 DEBUGGING STEPS:');
            console.log('1. Check browser console for React errors');
            console.log('2. Verify React app is loading correctly');
            console.log('3. Check CORS and iframe security settings');
            console.log('4. Try refreshing the iframe');
        }
        
        // Continue with WordPress elements check
        checkWordPressElements();
    }, 3000);
}

function checkWordPressElements() {
    console.log('\n📋 STEP 4: WordPress Interface Elements Check');
    
    // Check for editing buttons
    const enableButton = document.getElementById('violet-enable-editing');
    const saveButton = document.getElementById('violet-save-all');
    const refreshButton = document.getElementById('violet-refresh-preview');
    
    console.log('🎛️ WordPress Controls:');
    console.log('   Enable Editing button:', !!enableButton);
    console.log('   Save All button:', !!saveButton);
    console.log('   Refresh button:', !!refreshButton);
    
    // Check for menu items the user mentioned
    const menuItems = document.querySelectorAll('[href*="violet"]');
    console.log('\n🎮 WordPress Menu Items:');
    menuItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.textContent?.trim()} → ${item.href}`);
    });
    
    // Check for settings pages
    const settingsLinks = [
        'violet-editor-settings',
        'violet-content-manager',
        'violet-rich-content',
        'violet-preferences'
    ];
    
    console.log('\n⚙️ Settings Pages Status:');
    settingsLinks.forEach(page => {
        const link = document.querySelector(`[href*="${page}"]`);
        if (link) {
            console.log(`   ✅ ${page}: Found`);
        } else {
            console.log(`   ❌ ${page}: Missing`);
        }
    });
}

function testEditingFunctionality() {
    console.log('\n📋 STEP 5: Testing Editing Functionality');
    
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.log('❌ Cannot test - iframe not found');
        return;
    }
    
    // Test enable editing
    console.log('🧪 Testing enable editing...');
    iframe.contentWindow.postMessage({
        type: 'violet-enable-editing',
        timestamp: Date.now()
    }, '*');
    
    setTimeout(() => {
        // Test content change
        console.log('🧪 Testing content change...');
        iframe.contentWindow.postMessage({
            type: 'violet-update-preview',
            field: 'test_field',
            value: 'Test content change',
            contentType: 'text'
        }, '*');
    }, 1000);
}

function checkWordPressFunctions() {
    console.log('\n📋 STEP 6: WordPress Functions Check');
    
    // Check if WordPress functions are available
    const functions = [
        'violetActivateEditing',
        'violetSaveAllChanges',
        'violetRefreshPreview',
        'violetTestCommunication'
    ];
    
    console.log('🔧 WordPress Functions:');
    functions.forEach(func => {
        const exists = typeof window[func] === 'function';
        console.log(`   ${func}: ${exists ? '✅ Available' : '❌ Missing'}`);
    });
    
    // Check global variables
    const variables = [
        'violetConfig',
        'violetPendingChanges',
        'violetReactAppReady'
    ];
    
    console.log('\n📊 WordPress Variables:');
    variables.forEach(variable => {
        const exists = typeof window[variable] !== 'undefined';
        console.log(`   ${variable}: ${exists ? '✅ Defined' : '❌ Undefined'}`);
        if (exists) {
            console.log(`      Value:`, window[variable]);
        }
    });
}

function generateFixScript() {
    console.log('\n🔧 GENERATING EMERGENCY FIX SCRIPT');
    console.log('=====================================');
    
    console.log('// Run this script if communication is broken:');
    console.log(`
// EMERGENCY COMMUNICATION FIX
(function() {
    console.log('🚨 EMERGENCY COMMUNICATION FIX STARTING...');
    
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.log('❌ No iframe found');
        return;
    }
    
    // Force iframe refresh with correct parameters
    const currentUrl = new URL(iframe.src);
    currentUrl.searchParams.set('edit_mode', '1');
    currentUrl.searchParams.set('wp_admin', '1');
    currentUrl.searchParams.set('wp_origin', window.location.origin);
    currentUrl.searchParams.set('t', Date.now()); // Cache bust
    
    iframe.src = currentUrl.toString();
    console.log('🔄 Iframe refreshed with:', currentUrl.toString());
    
    // Set up emergency message handler
    let readyReceived = false;
    window.addEventListener('message', function emergencyHandler(event) {
        if (event.data?.type === 'violet-iframe-ready') {
            readyReceived = true;
            console.log('✅ Emergency fix successful - React app ready!');
            
            // Test editing capability
            setTimeout(() => {
                iframe.contentWindow.postMessage({
                    type: 'violet-test-connection'
                }, '*');
            }, 1000);
        }
    });
    
    // Check if fix worked
    setTimeout(() => {
        if (readyReceived) {
            console.log('🎉 EMERGENCY FIX SUCCESSFUL!');
        } else {
            console.log('❌ Emergency fix failed - manual intervention needed');
            console.log('💡 Try refreshing the entire WordPress admin page');
        }
    }, 5000);
})();
    `);
}

// Run the full diagnostic
runCommunicationDiagnostic();

// Export functions for manual testing
window.testEditingFunctionality = testEditingFunctionality;
window.checkWordPressFunctions = checkWordPressFunctions;
window.generateFixScript = generateFixScript;

console.log('\n🛠️ DIAGNOSTIC COMPLETE!');
console.log('📋 Available commands:');
console.log('   testEditingFunctionality() - Test edit operations');
console.log('   checkWordPressFunctions() - Check WordPress functions');
console.log('   generateFixScript() - Generate emergency fix');

console.log('\n🎯 NEXT STEPS:');
console.log('1. If communication is working: Test editing by clicking "Enable Editing"');
console.log('2. If communication is broken: Run the emergency fix script');
console.log('3. If nothing works: Check functions.php and React app for errors');
