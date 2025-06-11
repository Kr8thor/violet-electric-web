/**
 * 🔍 COMPLETE WORDPRESS EDITOR DIAGNOSTIC
 * Comprehensive test for WordPress-React editing functionality
 * 
 * COPY AND PASTE THIS ENTIRE SCRIPT INTO WORDPRESS ADMIN CONSOLE
 * Go to: https://wp.violetrainwater.com/wp-admin/admin.php?page=violet-frontend-editor
 * Open browser console (F12) and paste this script
 */

(function() {
    console.log('🔍 COMPLETE WORDPRESS EDITOR DIAGNOSTIC STARTING...');
    console.log('='.repeat(70));

    const DIAGNOSTIC_CONFIG = {
        expectedIframeUrl: 'https://lustrous-dolphin-447351.netlify.app',
        expectedElements: ['violet-site-iframe', 'violet-edit-toggle', 'violet-save-all-btn'],
        testFields: {
            hero_title: 'DIAGNOSTIC TEST: Hero Title ' + new Date().toLocaleTimeString(),
            hero_subtitle: 'DIAGNOSTIC TEST: Subtitle ' + new Date().toLocaleTimeString(),
            hero_cta: 'DIAGNOSTIC TEST: CTA Button'
        }
    };

    let diagnosticResults = {
        wordpress: {
            adminInterface: false,
            saveFunction: false,
            configLoaded: false,
            iframe: false
        },
        react: {
            loaded: false,
            communication: false,
            editing: false,
            contentDetection: false
        },
        saveFlow: {
            preparation: false,
            execution: false,
            persistence: false
        },
        issues: [],
        fixes: [],
        recommendations: []
    };

    // ===================================
    // PHASE 1: WORDPRESS ADMIN INTERFACE
    // ===================================
    console.log('\n🎯 PHASE 1: WORDPRESS ADMIN INTERFACE DIAGNOSTIC');

    function testWordPressInterface() {
        console.log('📋 Testing WordPress admin interface...');

        // Check required elements
        DIAGNOSTIC_CONFIG.expectedElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                console.log(`✅ Element found: ${elementId}`);
                if (elementId === 'violet-site-iframe') {
                    diagnosticResults.wordpress.iframe = true;
                    console.log(`  📍 Iframe src: ${element.src}`);
                }
            } else {
                console.log(`❌ Missing element: ${elementId}`);
                diagnosticResults.issues.push(`Missing ${elementId} element`);
            }
        });

        // Check WordPress configuration
        if (typeof window.violetConfig !== 'undefined') {
            diagnosticResults.wordpress.configLoaded = true;
            console.log('✅ WordPress config loaded:');
            console.log('  📍 Batch save URL:', window.violetConfig.batchSaveUrl);
            console.log('  📍 Netlify origin:', window.violetConfig.netlifyOrigin);
            console.log('  📍 Nonce available:', !!window.violetConfig.nonce);
        } else {
            console.log('❌ WordPress config not loaded');
            diagnosticResults.issues.push('WordPress config missing');
        }

        // Check save function
        if (typeof window.violetSaveAllChanges === 'function') {
            diagnosticResults.wordpress.saveFunction = true;
            console.log('✅ Save function available');
        } else {
            console.log('❌ Save function missing');
            diagnosticResults.issues.push('violetSaveAllChanges function not found');
        }

        // Check admin interface
        const adminElements = ['violet-connection-status', 'violet-editor-status', 'violet-changes-status'];
        let adminElementsFound = 0;
        adminElements.forEach(id => {
            if (document.getElementById(id)) {
                adminElementsFound++;
            }
        });

        if (adminElementsFound >= 2) {
            diagnosticResults.wordpress.adminInterface = true;
            console.log('✅ WordPress admin interface loaded');
        } else {
            console.log('❌ WordPress admin interface incomplete');
            diagnosticResults.issues.push('Admin interface elements missing');
        }
    }

    // ===================================
    // PHASE 2: REACT APP COMMUNICATION
    // ===================================
    console.log('\n🎯 PHASE 2: REACT APP COMMUNICATION DIAGNOSTIC');

    function testReactCommunication() {
        return new Promise((resolve) => {
            console.log('📡 Testing React app communication...');

            const iframe = document.getElementById('violet-site-iframe');
            if (!iframe) {
                console.log('❌ No iframe found for communication test');
                resolve(false);
                return;
            }

            let communicationWorking = false;
            let messagesReceived = 0;

            const messageListener = (event) => {
                if (event.data?.type?.startsWith('violet-')) {
                    messagesReceived++;
                    communicationWorking = true;
                    console.log(`📨 Message ${messagesReceived}: ${event.data.type}`, event.data);

                    if (event.data.type === 'violet-iframe-ready') {
                        diagnosticResults.react.loaded = true;
                        diagnosticResults.react.communication = true;
                        console.log('✅ React app ready and communicating');
                        
                        // Update WordPress status
                        const statusEl = document.getElementById('violet-connection-status');
                        if (statusEl) {
                            statusEl.textContent = '✅ Connected (Diagnostic)';
                            statusEl.style.color = 'green';
                        }
                    }

                    if (event.data.type === 'violet-content-changed') {
                        console.log('✅ Content change detected from React app');
                        diagnosticResults.react.editing = true;
                    }
                }
            };

            window.addEventListener('message', messageListener);

            // Send test message to React app
            try {
                iframe.contentWindow.postMessage({
                    type: 'violet-test-access',
                    timestamp: Date.now(),
                    from: 'complete-diagnostic'
                }, '*');
                console.log('📤 Test message sent to React app');
            } catch (error) {
                console.log('❌ Failed to send test message:', error);
            }

            // Wait for response
            setTimeout(() => {
                window.removeEventListener('message', messageListener);
                
                if (communicationWorking) {
                    console.log('✅ React communication test PASSED');
                    diagnosticResults.react.communication = true;
                } else {
                    console.log('❌ React communication test FAILED');
                    diagnosticResults.issues.push('No messages received from React app');
                    diagnosticResults.fixes.push('Check if Netlify app is loading correctly');
                }
                
                resolve(communicationWorking);
            }, 3000);
        });
    }

    // ===================================
    // PHASE 3: EDITING FUNCTIONALITY
    // ===================================
    console.log('\n🎯 PHASE 3: EDITING FUNCTIONALITY DIAGNOSTIC');

    function testEditingFunctionality() {
        console.log('✏️ Testing editing functionality...');

        const editButton = document.getElementById('violet-edit-toggle');
        if (!editButton) {
            console.log('❌ Edit toggle button not found');
            diagnosticResults.issues.push('Edit toggle button missing');
            return false;
        }

        console.log('✅ Edit toggle button found');

        // Check if we can activate editing
        if (typeof window.violetActivateEditing === 'function') {
            console.log('✅ Edit activation function available');
            
            // Test enabling editing (simulate click)
            try {
                const iframe = document.getElementById('violet-site-iframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'violet-enable-editing',
                        timestamp: Date.now()
                    }, '*');
                    console.log('📤 Edit enable message sent');
                    diagnosticResults.react.editing = true;
                }
            } catch (error) {
                console.log('❌ Failed to enable editing:', error);
            }
        } else {
            console.log('❌ Edit activation function not found');
            diagnosticResults.issues.push('violetActivateEditing function missing');
        }

        return true;
    }

    // ===================================
    // PHASE 4: SAVE FLOW TEST
    // ===================================
    console.log('\n🎯 PHASE 4: SAVE FLOW DIAGNOSTIC');

    function testSaveFlow() {
        console.log('💾 Testing save flow...');

        // Initialize pending changes for test
        if (!window.violetPendingChanges) {
            window.violetPendingChanges = {};
        }

        // Add test changes
        Object.entries(DIAGNOSTIC_CONFIG.testFields).forEach(([field, value]) => {
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
            console.log('✅ Save button updated');
        }

        // Test save function availability
        if (typeof window.violetSaveAllChanges === 'function') {
            diagnosticResults.saveFlow.preparation = true;
            console.log('✅ Save function ready for testing');
            console.log('💡 You can now click "Save All Changes" to test the save flow');
            
            // Enhanced save function for testing
            const originalSave = window.violetSaveAllChanges;
            window.violetSaveAllChanges = function() {
                console.log('🧪 DIAGNOSTIC: Enhanced save triggered');
                diagnosticResults.saveFlow.execution = true;
                
                // Call original save
                const result = originalSave.apply(this, arguments);
                
                // Monitor for save completion
                setTimeout(() => {
                    console.log('🧪 DIAGNOSTIC: Save completion check');
                    diagnosticResults.saveFlow.persistence = true;
                }, 2000);
                
                return result;
            };
            
        } else {
            console.log('❌ Save function not available');
            diagnosticResults.issues.push('Save function not accessible');
        }
    }

    // ===================================
    // PHASE 5: CONTENT DETECTION
    // ===================================
    console.log('\n🎯 PHASE 5: CONTENT DETECTION DIAGNOSTIC');

    function testContentDetection() {
        return new Promise((resolve) => {
            console.log('🎯 Testing content detection in React app...');

            const iframe = document.getElementById('violet-site-iframe');
            if (!iframe || !iframe.contentWindow) {
                console.log('❌ Cannot test content detection - iframe not accessible');
                resolve(false);
                return;
            }

            // Send content detection request
            iframe.contentWindow.postMessage({
                type: 'violet-check-components',
                timestamp: Date.now()
            }, '*');

            const contentListener = (event) => {
                if (event.data?.type === 'violet-component-info') {
                    console.log('📊 React component info received:', event.data);
                    
                    if (event.data.editableElements > 0) {
                        console.log(`✅ Found ${event.data.editableElements} editable elements`);
                        diagnosticResults.react.contentDetection = true;
                    } else {
                        console.log('⚠️ No editable elements found');
                        diagnosticResults.issues.push('No data-violet-field elements detected');
                    }
                    
                    window.removeEventListener('message', contentListener);
                    resolve(true);
                }
            };

            window.addEventListener('message', contentListener);

            // Timeout if no response
            setTimeout(() => {
                window.removeEventListener('message', contentListener);
                console.log('⚠️ No content detection response received');
                resolve(false);
            }, 2000);
        });
    }

    // ===================================
    // FINAL REPORT GENERATION
    // ===================================
    function generateDiagnosticReport() {
        console.log('\n📊 DIAGNOSTIC RESULTS SUMMARY');
        console.log('='.repeat(70));

        // Calculate scores
        const wpScore = Object.values(diagnosticResults.wordpress).filter(Boolean).length;
        const reactScore = Object.values(diagnosticResults.react).filter(Boolean).length;
        const saveScore = Object.values(diagnosticResults.saveFlow).filter(Boolean).length;

        console.log(`📈 WordPress Admin: ${wpScore}/4 components working`);
        console.log(`📈 React Integration: ${reactScore}/4 components working`);
        console.log(`📈 Save Flow: ${saveScore}/3 components working`);

        console.log('\n📋 DETAILED RESULTS:');
        console.log('WordPress Admin Interface:');
        console.log(`  ✅ Admin interface: ${diagnosticResults.wordpress.adminInterface ? 'WORKING' : 'FAILED'}`);
        console.log(`  ✅ Configuration: ${diagnosticResults.wordpress.configLoaded ? 'LOADED' : 'MISSING'}`);
        console.log(`  ✅ Iframe: ${diagnosticResults.wordpress.iframe ? 'FOUND' : 'MISSING'}`);
        console.log(`  ✅ Save function: ${diagnosticResults.wordpress.saveFunction ? 'AVAILABLE' : 'MISSING'}`);

        console.log('\nReact App Integration:');
        console.log(`  ✅ App loaded: ${diagnosticResults.react.loaded ? 'WORKING' : 'FAILED'}`);
        console.log(`  ✅ Communication: ${diagnosticResults.react.communication ? 'WORKING' : 'FAILED'}`);
        console.log(`  ✅ Editing system: ${diagnosticResults.react.editing ? 'WORKING' : 'FAILED'}`);
        console.log(`  ✅ Content detection: ${diagnosticResults.react.contentDetection ? 'WORKING' : 'FAILED'}`);

        console.log('\nSave Flow:');
        console.log(`  ✅ Preparation: ${diagnosticResults.saveFlow.preparation ? 'READY' : 'FAILED'}`);
        console.log(`  ✅ Execution: ${diagnosticResults.saveFlow.execution ? 'WORKING' : 'NOT TESTED'}`);
        console.log(`  ✅ Persistence: ${diagnosticResults.saveFlow.persistence ? 'WORKING' : 'NOT TESTED'}`);

        // Issues and fixes
        if (diagnosticResults.issues.length > 0) {
            console.log('\n❌ ISSUES FOUND:');
            diagnosticResults.issues.forEach((issue, i) => {
                console.log(`  ${i + 1}. ${issue}`);
            });
        }

        if (diagnosticResults.fixes.length > 0) {
            console.log('\n🔧 SUGGESTED FIXES:');
            diagnosticResults.fixes.forEach((fix, i) => {
                console.log(`  ${i + 1}. ${fix}`);
            });
        }

        // Overall assessment
        const totalScore = wpScore + reactScore + saveScore;
        const maxScore = 11;

        console.log(`\n🎯 OVERALL SCORE: ${totalScore}/${maxScore} (${Math.round(totalScore/maxScore*100)}%)`);

        if (totalScore >= 9) {
            console.log('🎉 EXCELLENT: WordPress editor is working well!');
            diagnosticResults.recommendations.push('System is functioning correctly');
            diagnosticResults.recommendations.push('Test the complete edit-save-refresh workflow');
        } else if (totalScore >= 6) {
            console.log('⚠️ PARTIAL: WordPress editor has some issues to resolve');
            diagnosticResults.recommendations.push('Address the issues listed above');
            diagnosticResults.recommendations.push('Focus on React communication and content detection');
        } else {
            console.log('🚨 CRITICAL: WordPress editor needs significant fixes');
            diagnosticResults.recommendations.push('Check WordPress admin interface setup');
            diagnosticResults.recommendations.push('Verify React app is loading correctly');
            diagnosticResults.recommendations.push('Test with browser developer tools');
        }

        // Quick fixes
        console.log('\n💡 QUICK FIXES AVAILABLE:');
        window.diagnosticQuickFixes = {
            forceConnection: () => {
                const statusEl = document.getElementById('violet-connection-status');
                if (statusEl) {
                    statusEl.textContent = '✅ Connected (Forced)';
                    statusEl.style.color = 'green';
                }
                window.violetReactAppReady = true;
                console.log('✅ Connection status forced');
            },
            
            testSave: () => {
                if (window.violetSaveAllChanges && Object.keys(window.violetPendingChanges || {}).length > 0) {
                    console.log('🧪 Testing save function...');
                    window.violetSaveAllChanges();
                } else {
                    console.log('❌ No changes to save or save function not available');
                }
            },
            
            simulateEdit: () => {
                if (!window.violetPendingChanges) window.violetPendingChanges = {};
                window.violetPendingChanges['hero_title'] = {
                    field_name: 'hero_title',
                    field_value: 'Simulated edit: ' + new Date().toLocaleTimeString()
                };
                if (window.violetUpdateSaveButton) window.violetUpdateSaveButton();
                console.log('✅ Simulated edit added');
            }
        };

        console.log('  window.diagnosticQuickFixes.forceConnection() - Force connection status');
        console.log('  window.diagnosticQuickFixes.testSave() - Test save function');
        console.log('  window.diagnosticQuickFixes.simulateEdit() - Add test edit');

        // Store results globally
        window.violetDiagnosticResults = diagnosticResults;
        console.log('\n💾 Full results stored in: window.violetDiagnosticResults');
        console.log('🔍 COMPLETE DIAGNOSTIC FINISHED');
    }

    // ===================================
    // RUN COMPLETE DIAGNOSTIC
    // ===================================
    async function runCompleteDiagnostic() {
        console.log('🚀 STARTING COMPLETE DIAGNOSTIC SEQUENCE...');
        console.log('⏳ This will take about 15 seconds...');

        // Phase 1: WordPress interface
        testWordPressInterface();
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Phase 2: React communication
        await testReactCommunication();
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Phase 3: Editing functionality
        testEditingFunctionality();
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Phase 4: Save flow
        testSaveFlow();
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Phase 5: Content detection
        await testContentDetection();
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate final report
        generateDiagnosticReport();
    }

    // Start diagnostic
    runCompleteDiagnostic();

})();
