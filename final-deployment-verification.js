/**
 * 🎯 FINAL DEPLOYMENT VERIFICATION SCRIPT
 * Run this in WordPress admin console AFTER updating functions.php
 * This will verify the complete universal editing system is working
 */

(function() {
    console.log('🚀 FINAL DEPLOYMENT VERIFICATION');
    console.log('='.repeat(60));
    console.log('🔍 Checking universal WordPress-React editing system...\n');

    let verificationResults = {
        netlifyDeployment: 'checking',
        wordpressAPI: 'checking', 
        reactIntegration: 'checking',
        contentPersistence: 'checking',
        universalEditing: 'checking',
        overallStatus: 'unknown'
    };

    // ====================
    // STEP 1: Check Netlify Deployment
    // ====================
    async function checkNetlifyDeployment() {
        console.log('📡 STEP 1: Checking Netlify deployment...');
        
        try {
            const response = await fetch('https://lustrous-dolphin-447351.netlify.app/');
            const isUp = response.ok;
            
            console.log('   Netlify site status:', isUp ? '✅ Online' : '❌ Offline');
            
            // Check if our new components are loaded
            const text = await response.text();
            const hasNewComponents = text.includes('VioletRuntimeContentFixed') || 
                                   text.includes('EditableTextFixed') ||
                                   text.includes('contentPersistenceFix');
            
            console.log('   New components:', hasNewComponents ? '✅ Deployed' : '❌ Not detected');
            
            verificationResults.netlifyDeployment = isUp && hasNewComponents ? 'success' : 'partial';
            
        } catch (error) {
            console.log('   ❌ Netlify check failed:', error.message);
            verificationResults.netlifyDeployment = 'error';
        }
    }

    // ====================
    // STEP 2: Check WordPress API
    // ====================
    async function checkWordPressAPI() {
        console.log('\n📡 STEP 2: Checking WordPress API endpoints...');
        
        try {
            // Test GET endpoint
            const getResponse = await fetch('/wp-json/violet/v1/content');
            const getWorking = getResponse.ok;
            console.log('   GET /wp-json/violet/v1/content:', getWorking ? '✅ Working' : '❌ Failed');
            
            if (getWorking) {
                const content = await getResponse.json();
                console.log('   Content fields loaded:', Object.keys(content).length);
            }
            
            // Test POST endpoint
            const testData = { deployment_test: `Test ${Date.now()}` };
            const postResponse = await fetch('/wp-json/violet/v1/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData)
            });
            const postWorking = postResponse.ok;
            console.log('   POST /wp-json/violet/v1/content:', postWorking ? '✅ Working' : '❌ Failed');
            
            // Check debug endpoint
            const debugResponse = await fetch('/wp-json/violet/v1/debug');
            const debugWorking = debugResponse.ok;
            console.log('   Debug endpoint:', debugWorking ? '✅ Working' : '❌ Failed');
            
            if (debugWorking) {
                const debugData = await debugResponse.json();
                console.log('   User permissions: Upload:', debugData.user_can_upload ? '✅' : '❌', 'Edit:', debugData.user_can_edit ? '✅' : '❌');
            }
            
            verificationResults.wordpressAPI = (getWorking && postWorking) ? 'success' : 'partial';
            
        } catch (error) {
            console.log('   ❌ WordPress API check failed:', error.message);
            verificationResults.wordpressAPI = 'error';
        }
    }

    // ====================
    // STEP 3: Check React Integration
    // ====================
    async function checkReactIntegration() {
        console.log('\n📱 STEP 3: Checking React app integration...');
        
        const iframe = document.getElementById('violet-site-iframe');
        if (!iframe || !iframe.contentWindow) {
            console.log('   ❌ No iframe found - open WordPress Edit Frontend page first');
            verificationResults.reactIntegration = 'error';
            return;
        }

        return new Promise((resolve) => {
            const testId = Date.now();
            let responseReceived = false;
            
            const messageListener = (event) => {
                if (event.data?.type === 'violet-diagnostic-response' && event.data.testId === testId) {
                    window.removeEventListener('message', messageListener);
                    responseReceived = true;
                    
                    console.log('   React app response: ✅ Received');
                    console.log('   Content manager:', event.data.contentManager ? '✅ Ready' : '❌ Missing');
                    console.log('   Provider loaded:', event.data.providerLoaded ? '✅ Yes' : '❌ No');
                    console.log('   Content loaded:', event.data.contentLoaded ? '✅ Yes' : '❌ No');
                    console.log('   WordPress fields:', Object.keys(event.data.allContent || {}).length);
                    
                    const isWorking = event.data.contentManager && event.data.providerLoaded && event.data.contentLoaded;
                    verificationResults.reactIntegration = isWorking ? 'success' : 'partial';
                    resolve();
                }
            };
            
            window.addEventListener('message', messageListener);
            
            iframe.contentWindow.postMessage({
                type: 'violet-diagnostic-request',
                testId: testId,
                deployment: true
            }, '*');
            
            setTimeout(() => {
                if (!responseReceived) {
                    window.removeEventListener('message', messageListener);
                    console.log('   ⏱️ React app timeout - may still be loading');
                    verificationResults.reactIntegration = 'timeout';
                }
                resolve();
            }, 5000);
        });
    }

    // ====================
    // STEP 4: Test Content Persistence
    // ====================
    async function testContentPersistence() {
        console.log('\n💾 STEP 4: Testing content persistence...');
        
        try {
            const testField = 'deployment_verification';
            const testValue = `Deployment test ${new Date().toISOString()}`;
            
            console.log('   Testing field:', testField);
            console.log('   Test value:', testValue);
            
            // Save test data
            const saveResponse = await fetch('/wp-json/violet/v1/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [testField]: testValue })
            });
            
            if (!saveResponse.ok) {
                throw new Error('Save failed');
            }
            
            console.log('   Save operation: ✅ Success');
            
            // Verify save with fresh GET request
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const verifyResponse = await fetch('/wp-json/violet/v1/content?' + Date.now(), {
                headers: { 'Cache-Control': 'no-cache' }
            });
            
            const verifyContent = await verifyResponse.json();
            const persistenceWorking = verifyContent[testField] === testValue;
            
            console.log('   Persistence check:', persistenceWorking ? '✅ Working' : '❌ Failed');
            
            verificationResults.contentPersistence = persistenceWorking ? 'success' : 'error';
            
        } catch (error) {
            console.log('   ❌ Persistence test failed:', error.message);
            verificationResults.contentPersistence = 'error';
        }
    }

    // ====================
    // STEP 5: Test Universal Editing
    // ====================
    async function testUniversalEditing() {
        console.log('\n🎨 STEP 5: Testing universal editing system...');
        
        const iframe = document.getElementById('violet-site-iframe');
        if (!iframe) {
            console.log('   ❌ No iframe - universal editing not testable');
            verificationResults.universalEditing = 'error';
            return;
        }
        
        const iframeSrc = iframe.src;
        const hasEditParams = iframeSrc.includes('edit_mode=1') && iframeSrc.includes('wp_admin=1');
        
        console.log('   Iframe edit parameters:', hasEditParams ? '✅ Present' : '❌ Missing');
        console.log('   Iframe URL check:', iframeSrc.includes('lustrous-dolphin-447351.netlify.app') ? '✅ Correct' : '❌ Wrong URL');
        
        // Check if editing UI is available
        const editButton = document.getElementById('violet-enable-edit-btn');
        const saveButton = document.getElementById('violet-save-all-btn');
        
        console.log('   Edit button:', editButton ? '✅ Present' : '❌ Missing');
        console.log('   Save button:', saveButton ? '✅ Present' : '❌ Missing');
        
        const uiWorking = hasEditParams && editButton && saveButton;
        verificationResults.universalEditing = uiWorking ? 'success' : 'partial';
    }

    // ====================
    // GENERATE FINAL REPORT
    // ====================
    function generateFinalReport() {
        console.log('\n📊 FINAL DEPLOYMENT VERIFICATION RESULTS');
        console.log('='.repeat(60));
        
        const results = verificationResults;
        const successCount = Object.values(results).filter(status => status === 'success').length;
        const totalChecks = Object.keys(results).length - 1; // Exclude overallStatus
        
        // Determine overall status
        if (successCount === totalChecks) {
            results.overallStatus = '🎉 PERFECT - READY FOR USE';
        } else if (successCount >= totalChecks - 1) {
            results.overallStatus = '✅ GOOD - MINOR ISSUES';
        } else if (successCount >= 2) {
            results.overallStatus = '⚠️ PARTIAL - NEEDS FIXES';
        } else {
            results.overallStatus = '❌ FAILED - MAJOR ISSUES';
        }
        
        console.log(`🎯 Overall Status: ${results.overallStatus}`);
        console.log(`📈 Success Rate: ${successCount}/${totalChecks} (${Math.round(successCount/totalChecks*100)}%)`);
        
        console.log('\n📋 Detailed Results:');
        console.log('   Netlify Deployment:', getStatusIcon(results.netlifyDeployment));
        console.log('   WordPress API:', getStatusIcon(results.wordpressAPI));
        console.log('   React Integration:', getStatusIcon(results.reactIntegration));
        console.log('   Content Persistence:', getStatusIcon(results.contentPersistence));
        console.log('   Universal Editing:', getStatusIcon(results.universalEditing));
        
        // Action items based on status
        console.log('\n🚀 NEXT ACTIONS:');
        
        if (results.overallStatus.includes('PERFECT')) {
            console.log('   🎉 CONGRATULATIONS! Your universal editing system is fully operational!');
            console.log('   ✅ Content persistence is FIXED - no more reverts on refresh');
            console.log('   ✅ Universal editing is READY - edit text, images, colors, links, buttons');
            console.log('   ✅ WordPress integration is COMPLETE - professional admin interface');
            console.log('');
            console.log('   🎯 START USING:');
            console.log('   1. Click "✏️ Enable Edit Mode" button above');
            console.log('   2. Click any text, image, or element to edit it');
            console.log('   3. Make changes and click "💾 Save Changes"');
            console.log('   4. Refresh this page - changes will PERSIST! 🎉');
            
        } else {
            if (results.netlifyDeployment !== 'success') {
                console.log('   🔄 Wait for Netlify deployment to complete');
                console.log('   📱 Check: https://app.netlify.com/sites/lustrous-dolphin-447351/deploys');
            }
            
            if (results.wordpressAPI !== 'success') {
                console.log('   🔧 Update WordPress functions.php with enhanced version');
                console.log('   📁 Use content from: C:\\Users\\Leo\\violet-electric-web\\functions-enhanced.php');
            }
            
            if (results.reactIntegration !== 'success') {
                console.log('   🔄 Refresh this page and wait for React app to load');
            }
            
            console.log('   🔄 Run this verification again after fixes');
        }
        
        // Store results globally
        window.violetDeploymentVerification = results;
        console.log('\n💾 Results stored in: window.violetDeploymentVerification');
        
        console.log('\n🔍 DEPLOYMENT VERIFICATION COMPLETE');
    }
    
    function getStatusIcon(status) {
        switch (status) {
            case 'success': return '✅ Success';
            case 'partial': return '⚠️ Partial';
            case 'error': return '❌ Error';
            case 'timeout': return '⏱️ Timeout';
            case 'checking': return '🔄 Checking...';
            default: return '❓ Unknown';
        }
    }

    // ====================
    // RUN VERIFICATION
    // ====================
    async function runVerification() {
        console.log('🚀 Starting final deployment verification...\n');
        
        await checkNetlifyDeployment();
        await checkWordPressAPI();
        await checkReactIntegration();
        await testContentPersistence();
        await testUniversalEditing();
        
        generateFinalReport();
    }

    // Start verification
    runVerification();

})();