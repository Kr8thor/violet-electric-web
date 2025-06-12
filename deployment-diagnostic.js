/**
 * 🔍 DEPLOYMENT DIAGNOSTIC SCRIPT
 * Run this in WordPress Admin console to identify deployment gaps
 * 
 * Copy this entire script into WordPress admin browser console
 */

console.log('🔍 DEPLOYMENT DIAGNOSTIC STARTING...');
console.log('==========================================');

function runDeploymentDiagnostic() {
    console.log('\n📋 STEP 1: WordPress Backend Check...');
    
    // Check 1: Enhanced Functions.php Loaded
    const universalEditorMenu = document.querySelector('a[href*="violet-universal-editor"]');
    const richTextMenu = document.querySelector('a[href*="violet-frontend-editor"]');
    const settingsMenu = document.querySelector('a[href*="violet-editor-settings"]');
    
    console.log('✅ WordPress Menu Check:');
    console.log('   Universal Editor menu:', universalEditorMenu ? '✅ Found' : '❌ Missing');
    console.log('   Rich Text Editor menu:', richTextMenu ? '✅ Found' : '❌ Missing');
    console.log('   Settings menu:', settingsMenu ? '✅ Found' : '❌ Missing');
    
    if (!universalEditorMenu) {
        console.log('🚨 CRITICAL: Enhanced functions.php NOT deployed!');
        console.log('   Current: Basic functions.php (257 lines)');
        console.log('   Needed: Enhanced functions.php (2,000+ lines)');
        return;
    }
    
    // Check 2: Universal Editor Page
    console.log('\n📋 STEP 2: Universal Editor Interface...');
    const iframe = document.getElementById('violet-site-iframe');
    const enableButton = document.getElementById('violet-enable-editing');
    const saveButton = document.getElementById('violet-save-all');
    
    console.log('✅ Editor Interface Check:');
    console.log('   Site iframe:', iframe ? '✅ Found' : '❌ Missing');
    console.log('   Enable button:', enableButton ? '✅ Found' : '❌ Missing');
    console.log('   Save button:', saveButton ? '✅ Found' : '❌ Missing');
    
    if (iframe) {
        console.log('   Iframe URL:', iframe.src);
        console.log('   Expected params: edit_mode=1&wp_admin=1');
    }
    
    // Check 3: JavaScript Functions
    console.log('\n📋 STEP 3: JavaScript Functions...');
    console.log('✅ Function Availability:');
    console.log('   violetSaveAllChanges:', typeof window.violetSaveAllChanges);
    console.log('   violetActivateEditing:', typeof window.violetActivateEditing);
    console.log('   violetRefreshPreview:', typeof window.violetRefreshPreview);
    console.log('   violetTestCommunication:', typeof window.violetTestCommunication);
    
    // Check 4: API Endpoints
    console.log('\n📋 STEP 4: Testing API Endpoints...');
    
    fetch('/wp-json/violet/v1/debug')
        .then(response => response.json())
        .then(data => {
            console.log('✅ Debug API Response:', data);
            console.log('   System:', data.system);
            console.log('   Content fields:', data.total_content_fields);
        })
        .catch(error => {
            console.log('❌ Debug API Failed:', error.message);
        });
        
    fetch('/wp-json/violet/v1/content')
        .then(response => response.json())
        .then(data => {
            console.log('✅ Content API Response:', Object.keys(data).length, 'fields');
        })
        .catch(error => {
            console.log('❌ Content API Failed:', error.message);
        });
    
    // Check 5: React Communication Test
    console.log('\n📋 STEP 5: React Communication Test...');
    if (iframe && iframe.contentWindow) {
        console.log('📡 Sending test message to React app...');
        iframe.contentWindow.postMessage({
            type: 'violet-test-connection',
            timestamp: Date.now(),
            from: 'diagnostic-script'
        }, '*');
        
        // Listen for response
        let responseReceived = false;
        const messageHandler = (event) => {
            if (event.data && event.data.type && event.data.type.includes('violet')) {
                console.log('✅ React Response Received:', event.data.type);
                responseReceived = true;
                window.removeEventListener('message', messageHandler);
            }
        };
        
        window.addEventListener('message', messageHandler);
        
        setTimeout(() => {
            if (!responseReceived) {
                console.log('❌ No React response - communication broken');
                window.removeEventListener('message', messageHandler);
            }
        }, 3000);
    } else {
        console.log('❌ Cannot test React communication - iframe not found');
    }
    
    // Final Summary
    setTimeout(() => {
        console.log('\n📊 DIAGNOSTIC SUMMARY:');
        console.log('======================');
        
        const checks = [
            { name: 'Enhanced Functions.php', status: !!universalEditorMenu },
            { name: 'Universal Editor Interface', status: !!iframe && !!enableButton },
            { name: 'JavaScript Functions', status: typeof window.violetSaveAllChanges === 'function' },
            { name: 'Editor Menu Available', status: !!universalEditorMenu }
        ];
        
        const passedChecks = checks.filter(check => check.status).length;
        const totalChecks = checks.length;
        
        checks.forEach(check => {
            console.log(`   ${check.status ? '✅' : '❌'} ${check.name}`);
        });
        
        console.log(`\n🎯 OVERALL SCORE: ${passedChecks}/${totalChecks} (${Math.round(passedChecks/totalChecks*100)}%)`);
        
        if (passedChecks === totalChecks) {
            console.log('🎉 SYSTEM STATUS: FULLY DEPLOYED');
            console.log('   Ready for testing and use!');
        } else if (passedChecks >= totalChecks/2) {
            console.log('⚠️  SYSTEM STATUS: PARTIALLY DEPLOYED');
            console.log('   Some components missing - check individual issues above');
        } else {
            console.log('🚨 SYSTEM STATUS: BASIC DEPLOYMENT');
            console.log('   Enhanced functions.php likely not deployed');
        }
        
        console.log('\n🔧 NEXT STEPS:');
        if (!universalEditorMenu) {
            console.log('1. 🚨 URGENT: Deploy enhanced functions.php (2,000+ lines)');
            console.log('2. Verify "🎨 Universal Editor" menu appears');
            console.log('3. Re-run this diagnostic');
        } else if (passedChecks < totalChecks) {
            console.log('1. Check individual failed components above');
            console.log('2. Verify React app deployment');
            console.log('3. Test editing functionality');
        } else {
            console.log('1. ✅ System ready - test editing workflow');
            console.log('2. Verify save persistence');
            console.log('3. Test rich text integration if needed');
        }
        
    }, 4000);
}

// Auto-run diagnostic
runDeploymentDiagnostic();

// Make available for manual re-run
window.runDeploymentDiagnostic = runDeploymentDiagnostic;

console.log('\n💡 Available Commands:');
console.log('runDeploymentDiagnostic() - Re-run this diagnostic');
console.log('window.location.href - Current page URL');

// Check current page
if (window.location.href.includes('violet-universal-editor')) {
    console.log('\n✅ You are on the Universal Editor page - perfect for testing!');
} else {
    console.log('\n📍 Current page:', window.location.pathname);
    console.log('   Go to: WordPress Admin → Universal Editor for full testing');
}