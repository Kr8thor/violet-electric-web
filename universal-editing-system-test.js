/**
 * 🎯 UNIVERSAL WORDPRESS-REACT EDITING SYSTEM TEST
 * Complete test and verification of the new content persistence system
 * 
 * Run this in WordPress admin console: wp.violetrainwater.com/wp-admin
 */

(function() {
    console.log('🚀 UNIVERSAL EDITING SYSTEM TEST STARTING...');
    console.log('='.repeat(80));

    let testResults = {
        wordpressAPI: null,
        imageUpload: null,
        reactCommunication: null,
        contentPersistence: null,
        universalEditing: null,
        issues: [],
        recommendations: [],
        overallStatus: 'unknown'
    };

    // ====================
    // TEST 1: WORDPRESS API ENHANCED ENDPOINTS
    // ====================
    async function testWordPressAPI() {
        console.log('\n🔍 TEST 1: WORDPRESS API ENHANCED ENDPOINTS');
        console.log('-'.repeat(60));
        
        try {
            // Test GET endpoint
            console.log('📡 Testing GET /wp-json/violet/v1/content...');
            const getResponse = await fetch('/wp-json/violet/v1/content');
            const getContent = await getResponse.json();
            
            console.log('✅ GET Response:', getResponse.status);
            console.log('📋 Content fields:', Object.keys(getContent).length);
            
            // Test POST endpoint
            console.log('\n📡 Testing POST /wp-json/violet/v1/content...');
            const testData = {
                test_field: `Test value ${Date.now()}`,
                hero_title: 'Test Hero Title Updated'
            };
            
            const postResponse = await fetch('/wp-json/violet/v1/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData)
            });
            
            const postResult = await postResponse.json();
            
            console.log('✅ POST Response:', postResponse.status);
            console.log('💾 Save result:', postResult);
            
            // Verify the save worked
            const verifyResponse = await fetch('/wp-json/violet/v1/content');
            const verifyContent = await verifyResponse.json();
            
            const saveWorked = verifyContent.test_field === testData.test_field;
            console.log('🔍 Save verification:', saveWorked ? '✅ SUCCESS' : '❌ FAILED');
            
            testResults.wordpressAPI = {
                status: 'success',
                getEndpoint: getResponse.status === 200,
                postEndpoint: postResponse.status === 200,
                saveVerification: saveWorked,
                fieldsCount: Object.keys(getContent).length
            };
            
            if (!saveWorked) {
                testResults.issues.push('Content save verification failed');
            }
            
        } catch (error) {
            console.log('❌ WordPress API Test Failed:', error);
            testResults.wordpressAPI = {
                status: 'error',
                error: error.message
            };
            testResults.issues.push('WordPress API endpoints not working');
        }
    }

    // ====================
    // TEST 2: IMAGE UPLOAD CAPABILITY
    // ====================
    async function testImageUpload() {
        console.log('\n🔍 TEST 2: IMAGE UPLOAD CAPABILITY');
        console.log('-'.repeat(60));
        
        try {
            // Check if user can upload
            const debugResponse = await fetch('/wp-json/violet/v1/debug');
            const debugData = await debugResponse.json();
            
            console.log('👤 User upload permission:', debugData.user_can_upload);
            console.log('✏️ User edit permission:', debugData.user_can_edit);
            
            testResults.imageUpload = {
                status: 'ready',
                canUpload: debugData.user_can_upload,
                canEdit: debugData.user_can_edit,
                endpoint: '/wp-json/violet/v1/upload-image'
            };
            
            if (!debugData.user_can_upload) {
                testResults.issues.push('User cannot upload images');
                testResults.recommendations.push('Grant upload_files capability to editing user');
            }
            
        } catch (error) {
            console.log('❌ Image Upload Test Failed:', error);
            testResults.imageUpload = {
                status: 'error',
                error: error.message
            };
            testResults.issues.push('Image upload endpoint not accessible');
        }
    }

    // ====================
    // TEST 3: REACT APP COMMUNICATION
    // ====================
    async function testReactCommunication() {
        console.log('\n🔍 TEST 3: REACT APP COMMUNICATION');
        console.log('-'.repeat(60));
        
        const iframe = document.getElementById('violet-site-iframe');
        if (!iframe || !iframe.contentWindow) {
            console.log('❌ No iframe found or not accessible');
            testResults.reactCommunication = { status: 'error', error: 'No iframe access' };
            testResults.issues.push('React app iframe not accessible');
            return;
        }

        return new Promise((resolve) => {
            const testId = Date.now();
            let responseReceived = false;
            
            // Listen for response
            const messageListener = (event) => {
                if (event.data?.type === 'violet-diagnostic-response' && event.data.testId === testId) {
                    window.removeEventListener('message', messageListener);
                    responseReceived = true;
                    
                    console.log('✅ React App Response Received:');
                    console.log('   Content Manager:', event.data.contentManager ? '✅ Ready' : '❌ Missing');
                    console.log('   Provider loaded:', event.data.providerLoaded);
                    console.log('   Content loaded:', event.data.contentLoaded);
                    console.log('   All content:', Object.keys(event.data.allContent || {}).length, 'fields');
                    console.log('   Pending changes:', Object.keys(event.data.pendingChanges || {}).length);
                    
                    testResults.reactCommunication = {
                        status: 'success',
                        data: event.data,
                        contentManager: !!event.data.contentManager,
                        contentLoaded: event.data.contentLoaded
                    };
                    
                    if (!event.data.contentLoaded) {
                        testResults.issues.push('React app not loading WordPress content');
                    }
                    
                    resolve(event.data);
                }
            };
            
            window.addEventListener('message', messageListener);
            
            // Send diagnostic request
            iframe.contentWindow.postMessage({
                type: 'violet-diagnostic-request',
                testId: testId,
                enhanced: true
            }, '*');
            
            // Timeout after 8 seconds
            setTimeout(() => {
                if (!responseReceived) {
                    window.removeEventListener('message', messageListener);
                    console.log('⏱️ React communication timed out');
                    testResults.reactCommunication = { status: 'timeout' };
                    testResults.issues.push('React app not responding to enhanced diagnostics');
                }
                resolve(null);
            }, 8000);
        });
    }

    // ====================
    // TEST 4: CONTENT PERSISTENCE CYCLE
    // ====================
    async function testContentPersistence() {
        console.log('\n🔍 TEST 4: CONTENT PERSISTENCE CYCLE');
        console.log('-'.repeat(60));
        
        try {
            const testValue = `Persistence test ${Date.now()}`;
            const testField = 'hero_title';
            
            console.log(`🔄 Testing full persistence cycle for field: ${testField}`);
            console.log(`📝 Test value: "${testValue}"`);
            
            // Step 1: Save via WordPress API
            console.log('\n📤 Step 1: Save via WordPress API...');
            const saveResponse = await fetch('/wp-json/violet/v1/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [testField]: testValue })
            });
            
            if (!saveResponse.ok) {
                throw new Error(`Save failed: ${saveResponse.status}`);
            }
            
            console.log('✅ WordPress save successful');
            
            // Step 2: Verify save via GET
            console.log('\n📥 Step 2: Verify via GET request...');
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
            
            const getResponse = await fetch('/wp-json/violet/v1/content', {
                headers: { 'Cache-Control': 'no-cache' }
            });
            const getContent = await getResponse.json();
            
            const saveVerified = getContent[testField] === testValue;
            console.log('🔍 WordPress verification:', saveVerified ? '✅ PASS' : '❌ FAIL');
            
            // Step 3: Test React app receives the change
            console.log('\n📱 Step 3: Test React app receives change...');
            const iframe = document.getElementById('violet-site-iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'violet-refresh-content',
                    timestamp: Date.now()
                }, '*');
                
                // Wait for refresh
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Check if React app has the new content
                const reactResponse = await new Promise((resolve) => {
                    const testId = Date.now();
                    
                    const messageListener = (event) => {
                        if (event.data?.type === 'violet-diagnostic-response' && event.data.testId === testId) {
                            window.removeEventListener('message', messageListener);
                            resolve(event.data);
                        }
                    };
                    
                    window.addEventListener('message', messageListener);
                    
                    iframe.contentWindow.postMessage({
                        type: 'violet-diagnostic-request',
                        testId: testId
                    }, '*');
                    
                    setTimeout(() => resolve(null), 3000);
                });
                
                if (reactResponse && reactResponse.allContent) {
                    const reactHasNewValue = reactResponse.allContent[testField] === testValue;
                    console.log('🔍 React app verification:', reactHasNewValue ? '✅ PASS' : '❌ FAIL');
                    
                    testResults.contentPersistence = {
                        status: 'success',
                        wordpressSave: true,
                        wordpressVerify: saveVerified,
                        reactReceive: reactHasNewValue,
                        testField: testField,
                        testValue: testValue
                    };
                    
                    if (!saveVerified || !reactHasNewValue) {
                        testResults.issues.push('Content persistence cycle incomplete');
                    }
                } else {
                    testResults.issues.push('React app not responding to persistence test');
                }
            }
            
        } catch (error) {
            console.log('❌ Content Persistence Test Failed:', error);
            testResults.contentPersistence = {
                status: 'error',
                error: error.message
            };
            testResults.issues.push('Content persistence system not working');
        }
    }

    // ====================
    // TEST 5: UNIVERSAL EDITING FEATURES
    // ====================
    async function testUniversalEditing() {
        console.log('\n🔍 TEST 5: UNIVERSAL EDITING FEATURES');
        console.log('-'.repeat(60));
        
        const iframe = document.getElementById('violet-site-iframe');
        if (!iframe) {
            testResults.universalEditing = { status: 'error', error: 'No iframe available' };
            return;
        }
        
        try {
            console.log('🎨 Testing universal editing capabilities...');
            
            // Check if React app has universal editing components
            const editingResponse = await new Promise((resolve) => {
                const testId = Date.now();
                
                const messageListener = (event) => {
                    if (event.data?.type === 'violet-editing-capabilities-response' && event.data.testId === testId) {
                        window.removeEventListener('message', messageListener);
                        resolve(event.data);
                    }
                };
                
                window.addEventListener('message', messageListener);
                
                iframe.contentWindow.postMessage({
                    type: 'violet-test-editing-capabilities',
                    testId: testId
                }, '*');
                
                setTimeout(() => resolve({ capabilities: 'unknown' }), 3000);
            });
            
            console.log('🎯 Editing system status:', editingResponse.capabilities || 'Available');
            
            // Test iframe communication
            const iframeSrc = iframe.src;
            const hasEditParams = iframeSrc.includes('edit_mode=1') && iframeSrc.includes('wp_admin=1');
            
            console.log('🔗 Iframe configuration:');
            console.log('   Edit parameters:', hasEditParams ? '✅ Present' : '❌ Missing');
            console.log('   Origin parameter:', iframeSrc.includes('wp_origin') ? '✅ Present' : '❌ Missing');
            
            testResults.universalEditing = {
                status: 'ready',
                iframeConfigured: hasEditParams,
                editingCapabilities: editingResponse.capabilities || 'available',
                features: [
                    'Text editing',
                    'Image replacement',
                    'Color picker',
                    'Link editor',
                    'Button styling'
                ]
            };
            
            if (!hasEditParams) {
                testResults.issues.push('Iframe missing edit mode parameters');
                testResults.recommendations.push('Ensure iframe URL includes edit_mode=1&wp_admin=1');
            }
            
        } catch (error) {
            console.log('❌ Universal Editing Test Failed:', error);
            testResults.universalEditing = {
                status: 'error',
                error: error.message
            };
        }
    }

    // ====================
    // GENERATE COMPREHENSIVE REPORT
    // ====================
    function generateFinalReport() {
        console.log('\n📊 UNIVERSAL EDITING SYSTEM TEST RESULTS');
        console.log('='.repeat(80));
        
        const totalTests = 5;
        const passedTests = Object.values(testResults).filter(test => 
            test && typeof test === 'object' && (test.status === 'success' || test.status === 'ready')
        ).length;
        
        const issuesCount = testResults.issues.length;
        
        // Determine overall status
        if (passedTests === totalTests && issuesCount === 0) {
            testResults.overallStatus = 'perfect';
        } else if (passedTests >= 4 && issuesCount <= 2) {
            testResults.overallStatus = 'good';
        } else if (passedTests >= 3) {
            testResults.overallStatus = 'fair';
        } else {
            testResults.overallStatus = 'poor';
        }
        
        console.log(`📈 Test Results: ${passedTests}/${totalTests} passed`);
        console.log(`❌ Issues Found: ${issuesCount}`);
        console.log(`🎯 Overall Status: ${testResults.overallStatus.toUpperCase()}`);
        
        // Status-specific messaging
        switch (testResults.overallStatus) {
            case 'perfect':
                console.log('\n🎉 PERFECT! Universal editing system is fully operational!');
                console.log('✅ All systems working correctly');
                console.log('✅ Content persistence fixed');
                console.log('✅ Universal editing ready');
                console.log('✅ WordPress-React integration complete');
                break;
                
            case 'good':
                console.log('\n✅ GOOD! System is mostly working with minor issues.');
                console.log('🔧 Minor fixes needed for optimal performance');
                break;
                
            case 'fair':
                console.log('\n⚠️ FAIR! Core functionality works but needs improvement.');
                console.log('🔧 Several issues need to be addressed');
                break;
                
            case 'poor':
                console.log('\n❌ POOR! Major issues prevent proper operation.');
                console.log('🚨 Significant fixes required');
                break;
        }
        
        // List issues
        if (testResults.issues.length > 0) {
            console.log('\n🚨 ISSUES TO ADDRESS:');
            testResults.issues.forEach((issue, i) => {
                console.log(`   ${i + 1}. ${issue}`);
            });
        }
        
        // List recommendations
        if (testResults.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            testResults.recommendations.forEach((rec, i) => {
                console.log(`   ${i + 1}. ${rec}`);
            });
        }
        
        // Implementation checklist
        console.log('\n✅ IMPLEMENTATION CHECKLIST:');
        console.log('   📄 WordPress functions.php:', testResults.wordpressAPI?.status === 'success' ? '✅ Updated' : '❌ Needs update');
        console.log('   📱 React components:', testResults.reactCommunication?.status === 'success' ? '✅ Connected' : '❌ Needs fix');
        console.log('   💾 Content persistence:', testResults.contentPersistence?.status === 'success' ? '✅ Working' : '❌ Broken');
        console.log('   🎨 Universal editing:', testResults.universalEditing?.status === 'ready' ? '✅ Ready' : '❌ Not ready');
        console.log('   🖼️ Image uploads:', testResults.imageUpload?.canUpload ? '✅ Enabled' : '❌ Disabled');
        
        // Next steps
        console.log('\n🚀 NEXT STEPS:');
        if (testResults.overallStatus === 'perfect') {
            console.log('   1. ✅ System is ready for production use!');
            console.log('   2. 🎨 Start editing content through WordPress admin');
            console.log('   3. 📚 Train users on the new editing interface');
        } else {
            console.log('   1. 🔧 Address the issues listed above');
            console.log('   2. 🔄 Run this test again after fixes');
            console.log('   3. 📖 Check implementation guide for help');
        }
        
        // Store results globally
        window.violetUniversalEditingTest = testResults;
        console.log('\n💾 Full test results stored in: window.violetUniversalEditingTest');
        
        console.log('\n🔍 UNIVERSAL EDITING SYSTEM TEST COMPLETE');
        console.log('='.repeat(80));
    }

    // ====================
    // RUN ALL TESTS
    // ====================
    async function runAllTests() {
        console.log('🚀 Starting comprehensive test suite...\n');
        
        try {
            await testWordPressAPI();
            await testImageUpload();
            await testReactCommunication();
            await testContentPersistence();
            await testUniversalEditing();
        } catch (error) {
            console.error('❌ Test suite error:', error);
            testResults.issues.push(`Test suite error: ${error.message}`);
        }
        
        generateFinalReport();
    }

    // Start the test suite
    runAllTests();

})();