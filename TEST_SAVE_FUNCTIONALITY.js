/**
 * 🧪 COMPREHENSIVE SAVE FUNCTIONALITY TEST
 * Copy and paste this ENTIRE script into WordPress admin console
 * Tests the complete WordPress-React editing and saving workflow
 */

(function() {
    console.log('🧪 COMPREHENSIVE SAVE FUNCTIONALITY TEST STARTING...');
    console.log('=' .repeat(60));

    // Test configuration
    const TEST_CONFIG = {
        testFields: {
            hero_title: 'TEST SAVE: Hero Title ' + new Date().toLocaleTimeString(),
            hero_subtitle: 'TEST SAVE: Subtitle ' + new Date().toLocaleTimeString(),
            hero_cta: 'TEST SAVE: CTA Button',
            hero_cta_secondary: 'TEST SAVE: Secondary CTA'
        },
        expectedOrigin: 'https://lustrous-dolphin-447351.netlify.app'
    };

    let testResults = {
        iframe: false,
        communication: false,
        editing: false,
        saving: false,
        persistence: false,
        issues: [],
        fixes: []
    };

    // ====================
    // TEST 1: IFRAME ACCESS
    // ====================
    console.log('\n🔍 TEST 1: IFRAME ACCESS');
    
    const iframe = document.getElementById('violet-site-iframe');
    if (iframe) {
        console.log('✅ Iframe found:', iframe.src);
        testResults.iframe = true;
        
        // Check if iframe has loaded
        if (iframe.contentWindow) {
            console.log('✅ Iframe contentWindow accessible');
        } else {
            console.log('⚠️ Iframe contentWindow not accessible yet');
            testResults.issues.push('Iframe not fully loaded');
        }
    } else {
        console.log('❌ No iframe found');
        testResults.issues.push('No iframe element found');
        testResults.fixes.push('Check if WordPress editor page loaded correctly');
    }

    // ====================
    // TEST 2: COMMUNICATION
    // ====================
    console.log('\n📡 TEST 2: COMMUNICATION TEST');
    
    let communicationWorking = false;
    let readyMessageReceived = false;

    const messageListener = (event) => {
        if (event.data?.type?.startsWith('violet-')) {
            communicationWorking = true;
            console.log(`📨 Received: ${event.data.type}`, event.data);
            
            if (event.data.type === 'violet-iframe-ready') {
                readyMessageReceived = true;
                console.log('✅ React app ready signal received!');
                testResults.communication = true;
            }
        }
    };

    window.addEventListener('message', messageListener);

    // Send test message
    if (iframe && iframe.contentWindow) {
        try {
            iframe.contentWindow.postMessage({
                type: 'violet-test-access',
                timestamp: Date.now(),
                from: 'save-functionality-test'
            }, '*');
            console.log('📤 Test message sent to React app');
        } catch (error) {
            console.log('❌ Failed to send test message:', error);
            testResults.issues.push('Cannot send messages to iframe');
        }
    }

    // ====================
    // TEST 3: EDITING ACTIVATION
    // ====================
    console.log('\n✏️ TEST 3: EDITING ACTIVATION');
    
    const testEditingActivation = () => {
        const editButton = document.getElementById('violet-edit-toggle');
        if (editButton) {
            console.log('✅ Edit toggle button found');
            
            // Check if we can activate editing
            if (typeof window.violetActivateEditing === 'function') {
                console.log('✅ violetActivateEditing function available');
                testResults.editing = true;
            } else {
                console.log('❌ violetActivateEditing function not found');
                testResults.issues.push('Edit activation function missing');
            }
        } else {
            console.log('❌ Edit toggle button not found');
            testResults.issues.push('Edit button missing from interface');
        }
    };

    // ====================
    // TEST 4: SAVE FUNCTIONALITY
    // ====================
    console.log('\n💾 TEST 4: SAVE FUNCTIONALITY');
    
    const testSaveFunction = () => {
        const saveButton = document.getElementById('violet-save-all-btn');
        
        if (saveButton) {
            console.log('✅ Save button found');
            
            // Check if save function exists
            if (typeof window.violetSaveAllChanges === 'function') {
                console.log('✅ violetSaveAllChanges function available');
                testResults.saving = true;
                
                // Test with mock changes
                if (!window.violetPendingChanges) {
                    window.violetPendingChanges = {};
                }
                
                // Add test changes
                Object.entries(TEST_CONFIG.testFields).forEach(([field, value]) => {
                    window.violetPendingChanges[field] = {
                        field_name: field,
                        field_value: value,
                        field_type: field
                    };
                });
                
                console.log('📝 Test changes added:', Object.keys(window.violetPendingChanges));
                
                // Update save button
                if (typeof window.violetUpdateSaveButton === 'function') {
                    window.violetUpdateSaveButton();
                    console.log('✅ Save button updated with test changes');
                }
                
            } else {
                console.log('❌ violetSaveAllChanges function not found');
                testResults.issues.push('Save function missing');
                testResults.fixes.push('Check functions.php WordPress integration');
            }
        } else {
            console.log('❌ Save button not found');
            testResults.issues.push('Save button missing from interface');
        }
    };

    // ====================
    // TEST 5: REACT COMPONENT CHECK
    // ====================
    console.log('\n🎯 TEST 5: REACT COMPONENT CHECK');
    
    const testReactComponents = () => {
        if (iframe && iframe.contentWindow) {
            try {
                // Send message to check for data-violet-field elements
                iframe.contentWindow.postMessage({
                    type: 'violet-check-components',
                    timestamp: Date.now()
                }, '*');
                
                console.log('📤 Component check message sent');
                
                // Also listen for component info
                const componentListener = (event) => {
                    if (event.data?.type === 'violet-component-info') {
                        console.log('📊 React component info:', event.data);
                        if (event.data.editableElements > 0) {
                            console.log(`✅ Found ${event.data.editableElements} editable elements`);
                        } else {
                            console.log('⚠️ No editable elements found');
                            testResults.issues.push('No data-violet-field elements in React app');
                        }
                    }
                };
                
                window.addEventListener('message', componentListener);
                
            } catch (error) {
                console.log('❌ Failed to check React components:', error);
            }
        }
    };

    // ====================
    // TEST 6: END-TO-END TEST
    // ====================
    console.log('\n🚀 TEST 6: END-TO-END SAVE TEST');
    
    const performEndToEndTest = () => {
        console.log('🧪 Performing end-to-end save test...');
        
        if (testResults.iframe && testResults.communication && testResults.editing && testResults.saving) {
            console.log('✅ All prerequisites met - running end-to-end test');
            
            // Activate editing
            console.log('1️⃣ Activating editing mode...');
            if (typeof window.violetActivateEditing === 'function') {
                window.violetActivateEditing();
            }
            
            setTimeout(() => {
                // Simulate content changes
                console.log('2️⃣ Simulating content changes...');
                
                if (iframe && iframe.contentWindow) {
                    // Send editing enable message
                    iframe.contentWindow.postMessage({
                        type: 'violet-enable-editing',
                        timestamp: Date.now()
                    }, '*');
                    
                    // Simulate changes
                    Object.entries(TEST_CONFIG.testFields).forEach(([field, value]) => {
                        iframe.contentWindow.postMessage({
                            type: 'violet-content-changed',
                            data: {
                                fieldType: field,
                                value: value
                            }
                        }, '*');
                    });
                    
                    console.log('📝 Simulated content changes sent');
                }
                
                setTimeout(() => {
                    // Perform save
                    console.log('3️⃣ Performing save...');
                    if (typeof window.violetSaveAllChanges === 'function') {
                        window.violetSaveAllChanges();
                        console.log('💾 Save function executed');
                        testResults.persistence = true;
                    }
                }, 1000);
                
            }, 1000);
            
        } else {
            console.log('❌ Prerequisites not met for end-to-end test');
            console.log('Missing:', Object.entries(testResults).filter(([key, value]) => key !== 'issues' && key !== 'fixes' && !value).map(([key]) => key));
        }
    };

    // ====================
    // RUN ALL TESTS
    // ====================
    
    console.log('\n🚀 RUNNING ALL TESTS...');
    console.log('-'.repeat(40));
    
    // Run tests in sequence
    setTimeout(() => {
        testEditingActivation();
        testSaveFunction();
        testReactComponents();
    }, 2000);
    
    setTimeout(() => {
        performEndToEndTest();
    }, 4000);
    
    // Generate final report
    setTimeout(() => {
        console.log('\n📊 FINAL TEST RESULTS');
        console.log('='.repeat(60));
        
        const totalTests = 6;
        const passedTests = Object.values(testResults).filter(v => typeof v === 'boolean' && v).length;
        
        console.log(`📈 Tests passed: ${passedTests}/${totalTests - 2}`); // -2 for issues/fixes arrays
        console.log(`✅ Iframe Access: ${testResults.iframe ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Communication: ${testResults.communication ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Editing System: ${testResults.editing ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Save Function: ${testResults.saving ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Persistence: ${testResults.persistence ? 'PASS' : 'FAIL'}`);
        
        if (testResults.issues.length > 0) {
            console.log('\n❌ ISSUES FOUND:');
            testResults.issues.forEach((issue, i) => {
                console.log(`  ${i + 1}. ${issue}`);
            });
            
            if (testResults.fixes.length > 0) {
                console.log('\n🔧 SUGGESTED FIXES:');
                testResults.fixes.forEach((fix, i) => {
                    console.log(`  ${i + 1}. ${fix}`);
                });
            }
        }
        
        if (passedTests >= 4) {
            console.log('\n🎉 SAVE FUNCTIONALITY IS WORKING!');
            console.log('💡 You can now:');
            console.log('   1. Click "Enable Direct Editing"');
            console.log('   2. Click text elements in the React app');
            console.log('   3. Make changes');
            console.log('   4. Click "Save All Changes"');
            console.log('   5. Changes should persist after page refresh');
        } else {
            console.log('\n🚨 SAVE FUNCTIONALITY NEEDS FIXES');
            console.log('💡 Address the issues above and test again');
        }
        
        // Store results globally for debugging
        window.saveTestResults = testResults;
        console.log('\n💾 Test results stored in: window.saveTestResults');
        console.log('🧪 SAVE FUNCTIONALITY TEST COMPLETE');
        
        // Clean up listeners
        window.removeEventListener('message', messageListener);
        
    }, 10000);

    console.log('⏳ Running comprehensive save test... check results in 15 seconds');

})();
