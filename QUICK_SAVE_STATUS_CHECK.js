/**
 * 🔍 QUICK SAVE STATUS CHECK
 * Immediate status check for WordPress-React save functionality
 * 
 * COPY TO WORDPRESS ADMIN CONSOLE:
 * Go to: https://wp.violetrainwater.com/wp-admin/admin.php?page=violet-frontend-editor
 * Press F12 → Console → Paste this script
 */

(function() {
    console.log('🔍 QUICK SAVE STATUS CHECK');
    console.log('='.repeat(50));
    
    const status = {
        timestamp: new Date().toLocaleString(),
        netlify: 'https://lustrous-dolphin-447351.netlify.app',
        wordpress: 'https://wp.violetrainwater.com',
        checks: {}
    };
    
    // Check 1: WordPress Functions
    console.log('1️⃣ Checking WordPress functions...');
    status.checks.wordpressFunctions = {
        violetSaveAllChanges: typeof window.violetSaveAllChanges === 'function',
        violetActivateEditing: typeof window.violetActivateEditing === 'function',
        violetConfig: !!window.violetConfig,
        saveUrl: window.violetConfig?.batchSaveUrl || 'Not configured'
    };
    
    const wpFunctionsWorking = Object.values(status.checks.wordpressFunctions).slice(0, 3).every(Boolean);
    console.log(`   ${wpFunctionsWorking ? '✅' : '❌'} WordPress functions: ${wpFunctionsWorking ? 'OK' : 'MISSING'}`);
    
    // Check 2: Iframe
    console.log('2️⃣ Checking iframe...');
    const iframe = document.getElementById('violet-site-iframe');
    status.checks.iframe = {
        found: !!iframe,
        accessible: !!(iframe && iframe.contentWindow),
        url: iframe?.src || 'Not found',
        ready: !!window.violetReactAppReady
    };
    
    const iframeWorking = iframe && iframe.contentWindow;
    console.log(`   ${iframeWorking ? '✅' : '❌'} Iframe: ${iframeWorking ? 'READY' : 'NOT READY'}`);
    
    // Check 3: Communication Test
    console.log('3️⃣ Testing communication...');
    if (iframeWorking) {
        let communicationWorking = false;
        
        const testListener = (event) => {
            if (event.data?.type?.startsWith('violet-')) {
                communicationWorking = true;
                console.log(`   ✅ Communication: WORKING (${event.data.type})`);
                window.removeEventListener('message', testListener);
            }
        };
        
        window.addEventListener('message', testListener);
        
        iframe.contentWindow.postMessage({
            type: 'violet-test-access',
            timestamp: Date.now()
        }, '*');
        
        setTimeout(() => {
            if (!communicationWorking) {
                console.log('   ❌ Communication: NOT RESPONDING');
            }
            window.removeEventListener('message', testListener);
            
            // Check 4: Save Button
            console.log('4️⃣ Checking save functionality...');
            const saveButton = document.getElementById('violet-save-all-btn');
            status.checks.saveButton = {
                found: !!saveButton,
                enabled: saveButton ? !saveButton.disabled : false,
                text: saveButton?.innerHTML || 'Not found'
            };
            
            console.log(`   ${saveButton ? '✅' : '❌'} Save button: ${saveButton ? 'FOUND' : 'MISSING'}`);
            
            // Check 5: WordPress API
            console.log('5️⃣ Testing WordPress API...');
            fetch('/wp-json/violet/v1/debug')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        console.log('   ✅ WordPress API: WORKING');
                        status.checks.api = { working: true, system: data.system };
                    } else {
                        console.log('   ❌ WordPress API: ERROR');
                        status.checks.api = { working: false, error: data.message };
                    }
                    generateQuickReport();
                })
                .catch(error => {
                    console.log('   ❌ WordPress API: FAILED');
                    status.checks.api = { working: false, error: error.message };
                    generateQuickReport();
                });
                
        }, 2000);
    } else {
        console.log('   ❌ Communication: CANNOT TEST (iframe not ready)');
        generateQuickReport();
    }
    
    function generateQuickReport() {
        console.log('\n📊 QUICK STATUS SUMMARY');
        console.log('='.repeat(50));
        
        const checks = [
            { name: 'WordPress Functions', status: wpFunctionsWorking },
            { name: 'Iframe Access', status: iframeWorking },
            { name: 'Save Button', status: status.checks.saveButton?.found },
            { name: 'WordPress API', status: status.checks.api?.working }
        ];
        
        const workingCount = checks.filter(check => check.status).length;
        const successRate = Math.round((workingCount / checks.length) * 100);
        
        console.log(`🎯 System Status: ${successRate}% (${workingCount}/${checks.length})`);
        
        checks.forEach(check => {
            console.log(`   ${check.status ? '✅' : '❌'} ${check.name}`);
        });
        
        if (successRate >= 75) {
            console.log('\n🎉 SAVE FUNCTIONALITY READY!');
            console.log('\n📋 HOW TO TEST SAVES:');
            console.log('1. Click "Enable Direct Editing" button');
            console.log('2. Click any text in the React iframe below');
            console.log('3. Make changes to the text');
            console.log('4. Click "Save All Changes" in the blue toolbar');
            console.log('5. Refresh the React page to verify persistence');
            
            if (window.violetPendingChanges && Object.keys(window.violetPendingChanges).length > 0) {
                console.log('\n💡 You have pending changes ready to save!');
                console.log(`   Changes: ${Object.keys(window.violetPendingChanges).join(', ')}`);
            }
        } else {
            console.log('\n🚨 SAVE FUNCTIONALITY NEEDS FIXES');
            const failed = checks.filter(check => !check.status);
            console.log('\n❌ Issues to fix:');
            failed.forEach(check => {
                console.log(`   - ${check.name} not working`);
            });
            
            console.log('\n🔧 Potential fixes:');
            if (!wpFunctionsWorking) {
                console.log('   - Upload latest functions.php to WordPress');
            }
            if (!iframeWorking) {
                console.log('   - Check if Netlify deployment is live');
                console.log('   - Verify iframe URL is correct');
            }
            if (!status.checks.api?.working) {
                console.log('   - Check WordPress REST API permissions');
                console.log('   - Verify user has edit_posts capability');
            }
        }
        
        console.log('\n💾 Status stored in: window.quickStatusCheck');
        window.quickStatusCheck = status;
        
        console.log('\n🧪 For comprehensive testing, run:');
        console.log('   LIVE_SAVE_FUNCTIONALITY_TEST.js');
        
        console.log('\n🔍 QUICK SAVE STATUS CHECK COMPLETE');
    }
    
})();
