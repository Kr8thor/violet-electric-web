// 🎯 QUICK TEST SCRIPT - Run this in WordPress admin console
// This will quickly verify if the system is working

(function() {
    console.log('🚀 QUICK DEPLOYMENT TEST');
    console.log('='.repeat(40));
    
    // Test 1: WordPress API
    fetch('/wp-json/violet/v1/content')
        .then(r => r.json())
        .then(data => {
            console.log('✅ WordPress API: Working');
            console.log('📋 Content fields:', Object.keys(data).length);
        })
        .catch(() => {
            console.log('❌ WordPress API: Failed - Update functions.php');
        });
    
    // Test 2: React iframe
    const iframe = document.getElementById('violet-site-iframe');
    if (iframe) {
        console.log('✅ React iframe: Found');
        
        // Test communication
        iframe.contentWindow.postMessage({
            type: 'violet-test-access',
            timestamp: Date.now()
        }, '*');
        
        setTimeout(() => {
            if (window.violetReactAppReady) {
                console.log('✅ React communication: Working');
            } else {
                console.log('⏱️ React communication: Loading...');
            }
        }, 2000);
        
    } else {
        console.log('❌ React iframe: Missing - Open Edit Frontend page');
    }
    
    // Test 3: UI Elements
    const editBtn = document.getElementById('violet-enable-edit-btn');
    const saveBtn = document.getElementById('violet-save-all-btn');
    
    console.log('🎨 Edit button:', editBtn ? '✅ Found' : '❌ Missing');
    console.log('💾 Save button:', saveBtn ? '✅ Found' : '❌ Missing');
    
    // Instructions
    console.log('\n🎯 QUICK TEST INSTRUCTIONS:');
    console.log('1. Click "Enable Edit Mode" button above');
    console.log('2. Click any text in the iframe');
    console.log('3. Edit it and click "Save Changes"');
    console.log('4. Refresh this page');
    console.log('5. ✅ PASS if text stays changed');
    console.log('❌ FAIL if text reverts to default');
    
})();