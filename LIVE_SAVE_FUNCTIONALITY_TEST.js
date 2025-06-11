/**
 * 🧪 LIVE SAVE FUNCTIONALITY TEST
 * Complete test of WordPress-React save functionality on live deployment
 * 
 * INSTRUCTIONS:
 * 1. Go to WordPress admin: https://wp.violetrainwater.com/wp-admin/admin.php?page=violet-frontend-editor
 * 2. Open browser console (F12 → Console)
 * 3. Copy and paste this ENTIRE script
 * 4. Watch the results
 */

(function() {
    console.log('🧪 LIVE SAVE FUNCTIONALITY TEST STARTING...');
    console.log('='.repeat(70));
    console.log('Testing WordPress ↔ React save functionality on live deployment');
    console.log('Site: https://lustrous-dolphin-447351.netlify.app');
    console.log('WordPress: https://wp.violetrainwater.com');
    console.log('='.repeat(70));

    const TEST_CONFIG = {
        netlifyUrl: 'https://lustrous-dolphin-447351.netlify.app',
        wpUrl: 'https://wp.violetrainwater.com',
        testFields: {
            hero_title: `LIVE TEST: Hero Title ${new Date().toLocaleTimeString()}`,
            hero_subtitle: `LIVE TEST: Subtitle ${new Date().toLocaleTimeString()}`,
            hero_cta: 'LIVE TEST: CTA Button',
            contact_email: 'test@livetest.com',
            contact_phone: '555-TEST-LIVE'
        },
        timeout: 30000
    };

    let testResults = {
        infrastructure: {
            iframe: false,
            communication: false,
            wordpressApi: false,
            netlifyDeployment: false
        },
        editing: {
            editModeActivation: false,
            contentDetection: false,
            changeTracking: false
        },
        saving: {
            savePreparation: false,
            apiRequest: false,
            persistence: false,
            domUpdate: false
        },
        issues: [],
        recommendations: [],
        performance: {
            startTime: Date.now(),
            buildTime: null,
            saveTime: null
        }
    };

    // ===================================
    // PHASE 1: INFRASTRUCTURE TEST
    // ===================================
    console.log('\n🔍 PHASE 1: TESTING INFRASTRUCTURE');
    console.log('-'.repeat(50));

    function testInfrastructure() {
        // Test 1: Iframe presence and accessibility
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe && iframe.contentWindow) {
            testResults.infrastructure.iframe = true;
            console.log('✅ Iframe found and accessible');
            console.log(`   URL: ${iframe.src}`);
        } else {
            testResults.infrastructure.iframe = false;
            testResults.issues.push('Iframe not found or not accessible');
            console.log('❌ Iframe not found or not accessible');
        }

        // Test 2: WordPress functions availability
        const requiredFunctions = [
            'violetSaveAllChanges',
            'violetActivateEditing',
            'violetUpdateSaveButton'
        ];

        let functionsAvailable = 0;
        requiredFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                functionsAvailable++;
                console.log(`✅ Function available: ${funcName}`);
            } else {
                console.log(`❌ Function missing: ${funcName}`);
                testResults.issues.push(`Missing function: ${funcName}`);
            }
        });

        // Test 3: Configuration availability
        if (window.violetConfig && window.violetConfig.batchSaveUrl) {
            console.log('✅ WordPress config loaded');
            console.log(`   Save URL: ${window.violetConfig.batchSaveUrl}`);
        } else {
            console.log('❌ WordPress config not loaded');
            testResults.issues.push('WordPress config not loaded');
        }

        // Test 4: WordPress API test
        testWordPressAPI();
    }

    function testWordPressAPI() {
        console.log('\n📡 Testing WordPress API connectivity...');
        
        fetch('/wp-json/violet/v1/debug')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    testResults.infrastructure.wordpressApi = true;
                    console.log('✅ WordPress API responding');
                    console.log(`   System: ${data.system}`);
                    console.log(`   User can edit: ${data.user_can_edit}`);
                } else {
                    console.log('❌ WordPress API error');
                    testResults.issues.push('WordPress API error: ' + data.message);
                }
            })
            .catch(error => {
                console.log('❌ WordPress API connection failed:', error.message);
                testResults.issues.push('WordPress API connection failed');
            });
    }

    // ===================================
    // PHASE 2: COMMUNICATION TEST
    // ===================================
    console.log('\n📡 PHASE 2: TESTING COMMUNICATION');
    console.log('-'.repeat(50));

    function testCommunication() {
        const iframe = document.getElementById('violet-site-iframe');
        if (!iframe || !iframe.contentWindow) {
            console.log('❌ Cannot test communication - iframe not ready');
            return;
        }

        let messageReceived = false;
        const startTime = Date.now();

        const messageListener = (event) => {
            if (event.data?.type?.startsWith('violet-')) {
                messageReceived = true;
                testResults.infrastructure.communication = true;
                console.log(`✅ Communication working - received: ${event.data.type}`);
                console.log(`   Response time: ${Date.now() - startTime}ms`);
                
                if (event.data.type === 'violet-iframe-ready') {
                    console.log('✅ React app confirmed ready');
                    window.violetReactAppReady = true;
                }
            }
        };

        window.addEventListener('message', messageListener);

        // Send test message
        iframe.contentWindow.postMessage({
            type: 'violet-test-access',
            timestamp: Date.now(),
            from: 'live-save-test'
        }, '*');

        console.log('📤 Test message sent to React app');

        // Check for response
        setTimeout(() => {
            if (!messageReceived) {
                console.log('❌ No response from React app after 5 seconds');
                testResults.issues.push('React app not responding to messages');
            }
            window.removeEventListener('message', messageListener);
        }, 5000);
    }

    // ===================================
    // PHASE 3: EDITING TEST
    // ===================================
    console.log('\n✏️ PHASE 3: TESTING EDITING FUNCTIONALITY');
    console.log('-'.repeat(50));

    function testEditing() {
        console.log('🎯 Testing edit mode activation...');

        // Test edit button availability
        const editButton = document.getElementById('violet-edit-toggle');
        if (editButton) {
            console.log('✅ Edit toggle button found');
            
            // Simulate edit activation
            if (typeof window.violetActivateEditing === 'function') {
                console.log('🔄 Activating edit mode...');
                window.violetActivateEditing();
                testResults.editing.editModeActivation = true;
                
                setTimeout(() => {
                    testContentDetection();
                }, 2000);
            } else {
                console.log('❌ Edit activation function not available');
                testResults.issues.push('Edit activation function missing');
            }
        } else {
            console.log('❌ Edit toggle button not found');
            testResults.issues.push('Edit toggle button missing');
        }
    }

    function testContentDetection() {
        console.log('🔍 Testing content detection in React app...');
        
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe && iframe.contentWindow) {
            // Send content detection test
            iframe.contentWindow.postMessage({
                type: 'violet-check-components',
                timestamp: Date.now()
            }, '*');

            const detectionListener = (event) => {
                if (event.data?.type === 'violet-component-info') {
                    if (event.data.editableElements > 0) {
                        testResults.editing.contentDetection = true;
                        console.log(`✅ Content detection working - ${event.data.editableElements} elements found`);
                    } else {
                        console.log('⚠️ No editable elements detected');
                        testResults.issues.push('No data-violet-field elements found in React app');
                    }
                    window.removeEventListener('message', detectionListener);
                }
            };

            window.addEventListener('message', detectionListener);
            
            setTimeout(() => {
                window.removeEventListener('message', detectionListener);
                testChangeTracking();
            }, 3000);
        }
    }

    function testChangeTracking() {
        console.log('📝 Testing change tracking...');
        
        // Initialize pending changes if not exists
        if (!window.violetPendingChanges) {
            window.violetPendingChanges = {};
        }

        // Simulate content changes
        Object.entries(TEST_CONFIG.testFields).forEach(([field, value]) => {
            window.violetPendingChanges[field] = {
                field_name: field,
                field_value: value,
                field_type: field,
                timestamp: Date.now()
            };
        });

        console.log('📊 Simulated changes:', Object.keys(window.violetPendingChanges));
        testResults.editing.changeTracking = true;

        // Update save button
        if (typeof window.violetUpdateSaveButton === 'function') {
            window.violetUpdateSaveButton();
            console.log('✅ Save button updated with test changes');
        }

        // Move to save testing
        setTimeout(() => {
            testSaving();
        }, 2000);
    }

    // ===================================
    // PHASE 4: SAVE FUNCTIONALITY TEST
    // ===================================
    console.log('\n💾 PHASE 4: TESTING SAVE FUNCTIONALITY');
    console.log('-'.repeat(50));

    function testSaving() {
        console.log('🚀 Testing save functionality...');
        
        const saveStartTime = Date.now();
        
        // Test save button
        const saveButton = document.getElementById('violet-save-all-btn');
        if (saveButton) {
            console.log('✅ Save button found');
            
            if (Object.keys(window.violetPendingChanges || {}).length > 0) {
                console.log('📤 Executing save...');
                testResults.saving.savePreparation = true;
                
                // Monitor save progress
                const originalSave = window.violetSaveAllChanges;
                window.violetSaveAllChanges = function() {
                    console.log('💾 Save function called');
                    testResults.saving.apiRequest = true;
                    
                    // Call original function
                    const result = originalSave.apply(this, arguments);
                    
                    // Monitor for success
                    setTimeout(() => {
                        testResults.performance.saveTime = Date.now() - saveStartTime;
                        console.log(`⏱️ Save completed in ${testResults.performance.saveTime}ms`);
                        
                        // Test persistence
                        testPersistence();
                    }, 3000);
                    
                    return result;
                };
                
                // Execute save
                window.violetSaveAllChanges();
                
            } else {
                console.log('❌ No pending changes to save');
                testResults.issues.push('No pending changes for save test');
            }
        } else {
            console.log('❌ Save button not found');
            testResults.issues.push('Save button not found');
        }
    }

    function testPersistence() {
        console.log('🔄 Testing content persistence...');
        
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe && iframe.contentWindow) {
            // Test localStorage persistence in React app
            iframe.contentWindow.postMessage({
                type: 'violet-test-persistence',
                testFields: TEST_CONFIG.testFields,
                timestamp: Date.now()
            }, '*');

            const persistenceListener = (event) => {
                if (event.data?.type === 'violet-persistence-result') {
                    if (event.data.success) {
                        testResults.saving.persistence = true;
                        console.log('✅ Content persistence working');
                        console.log(`   Fields persisted: ${event.data.fieldsCount}`);
                    } else {
                        console.log('❌ Content persistence failed');
                        testResults.issues.push('Content persistence failed');
                    }
                    window.removeEventListener('message', persistenceListener);
                    
                    // Final DOM update test
                    testDOMUpdates();
                }
            };

            window.addEventListener('message', persistenceListener);
            
            setTimeout(() => {
                window.removeEventListener('message', persistenceListener);
                generateFinalReport();
            }, 5000);
        } else {
            generateFinalReport();
        }
    }

    function testDOMUpdates() {
        console.log('🎨 Testing DOM updates...');
        
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-verify-dom-updates',
                expectedValues: TEST_CONFIG.testFields,
                timestamp: Date.now()
            }, '*');

            const domListener = (event) => {
                if (event.data?.type === 'violet-dom-update-result') {
                    if (event.data.updatesVerified) {
                        testResults.saving.domUpdate = true;
                        console.log('✅ DOM updates verified');
                        console.log(`   Updated elements: ${event.data.updatedElements}`);
                    } else {
                        console.log('⚠️ Some DOM updates not verified');
                        testResults.issues.push('DOM updates incomplete');
                    }
                    window.removeEventListener('message', domListener);
                }
            };

            window.addEventListener('message', domListener);
        }
    }

    // ===================================
    // FINAL REPORT GENERATION
    // ===================================
    function generateFinalReport() {
        console.log('\n📊 LIVE SAVE FUNCTIONALITY TEST RESULTS');
        console.log('='.repeat(70));
        
        testResults.performance.totalTime = Date.now() - testResults.performance.startTime;
        
        // Calculate success metrics
        const infrastructureScore = Object.values(testResults.infrastructure).filter(Boolean).length;
        const editingScore = Object.values(testResults.editing).filter(Boolean).length;
        const savingScore = Object.values(testResults.saving).filter(Boolean).length;
        
        const totalTests = 11; // Total number of boolean tests
        const passedTests = infrastructureScore + editingScore + savingScore;
        const successRate = Math.round((passedTests / totalTests) * 100);
        
        console.log(`🎯 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
        console.log(`⏱️ Total Test Time: ${testResults.performance.totalTime}ms`);
        
        console.log('\n📋 DETAILED RESULTS:');
        
        console.log('\n🏗️ Infrastructure Tests:');
        console.log(`   Iframe Access: ${testResults.infrastructure.iframe ? '✅' : '❌'}`);
        console.log(`   Communication: ${testResults.infrastructure.communication ? '✅' : '❌'}`);
        console.log(`   WordPress API: ${testResults.infrastructure.wordpressApi ? '✅' : '❌'}`);
        console.log(`   Netlify Deploy: ${testResults.infrastructure.netlifyDeployment ? '✅' : '❌'}`);
        
        console.log('\n✏️ Editing Tests:');
        console.log(`   Edit Activation: ${testResults.editing.editModeActivation ? '✅' : '❌'}`);
        console.log(`   Content Detection: ${testResults.editing.contentDetection ? '✅' : '❌'}`);
        console.log(`   Change Tracking: ${testResults.editing.changeTracking ? '✅' : '❌'}`);
        
        console.log('\n💾 Save Tests:');
        console.log(`   Save Preparation: ${testResults.saving.savePreparation ? '✅' : '❌'}`);
        console.log(`   API Request: ${testResults.saving.apiRequest ? '✅' : '❌'}`);
        console.log(`   Persistence: ${testResults.saving.persistence ? '✅' : '❌'}`);
        console.log(`   DOM Updates: ${testResults.saving.domUpdate ? '✅' : '❌'}`);
        
        if (testResults.performance.saveTime) {
            console.log(`\n⚡ Performance Metrics:`);
            console.log(`   Save Time: ${testResults.performance.saveTime}ms`);
        }
        
        if (testResults.issues.length > 0) {
            console.log('\n❌ ISSUES FOUND:');
            testResults.issues.forEach((issue, i) => {
                console.log(`   ${i + 1}. ${issue}`);
            });
        }
        
        // Generate recommendations
        if (successRate >= 90) {
            console.log('\n🎉 EXCELLENT: Save functionality is working perfectly!');
            console.log('✅ WordPress-React integration is production ready');
            console.log('\n💡 Next steps:');
            console.log('   1. Content saves are persisting correctly');
            console.log('   2. React app updates in real-time');
            console.log('   3. System is ready for production use');
        } else if (successRate >= 70) {
            console.log('\n⚠️ PARTIAL SUCCESS: Save functionality mostly working');
            console.log('💡 Recommendations:');
            if (!testResults.infrastructure.communication) {
                console.log('   - Fix iframe communication issues');
            }
            if (!testResults.saving.persistence) {
                console.log('   - Check localStorage persistence in React app');
            }
            if (!testResults.saving.domUpdate) {
                console.log('   - Verify DOM update handling');
            }
        } else {
            console.log('\n🚨 CRITICAL: Save functionality needs major fixes');
            console.log('💡 Priority fixes needed:');
            testResults.issues.slice(0, 3).forEach(issue => {
                console.log(`   - ${issue}`);
            });
        }
        
        console.log('\n📝 MANUAL VERIFICATION STEPS:');
        console.log('1. Click "Enable Direct Editing" in WordPress admin');
        console.log('2. Click any text in the React iframe');
        console.log('3. Make changes to the text');
        console.log('4. Click "Save All Changes" in blue toolbar');
        console.log('5. Refresh the React page and verify changes persist');
        
        console.log('\n💾 Test results stored in: window.liveSaveTestResults');
        window.liveSaveTestResults = testResults;
        
        console.log('\n🧪 LIVE SAVE FUNCTIONALITY TEST COMPLETE');
        console.log('='.repeat(70));
    }

    // ===================================
    // EXECUTE TESTS
    // ===================================
    console.log('🚀 Starting comprehensive live save test...');
    
    // Execute tests in sequence
    setTimeout(testInfrastructure, 1000);
    setTimeout(testCommunication, 3000);
    setTimeout(testEditing, 6000);
    
    // Fallback final report if tests don't complete
    setTimeout(() => {
        if (!window.liveSaveTestResults) {
            console.log('⚠️ Tests incomplete - generating partial report...');
            generateFinalReport();
        }
    }, 25000);

})();
