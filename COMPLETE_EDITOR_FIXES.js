/**
 * 🔧 COMPLETE WORDPRESS EDITOR FIXES
 * Comprehensive fixes for WordPress-React editing functionality
 * 
 * RUN THIS AFTER THE DIAGNOSTIC TO FIX ANY ISSUES FOUND
 * Copy and paste into WordPress admin console after running the diagnostic
 */

(function() {
    console.log('🔧 COMPLETE WORDPRESS EDITOR FIXES STARTING...');
    console.log('='.repeat(60));

    const FIXES_CONFIG = {
        netlifyOrigin: 'https://lustrous-dolphin-447351.netlify.app',
        wpOrigin: 'https://wp.violetrainwater.com',
        timeout: 10000
    };

    let fixResults = {
        applied: [],
        skipped: [],
        failed: [],
        success: false
    };

    // ===================================
    // FIX 1: FORCE IFRAME COMMUNICATION
    // ===================================
    function fixIframeCommunication() {
        console.log('\n🔧 FIX 1: IFRAME COMMUNICATION');
        
        try {
            const iframe = document.getElementById('violet-site-iframe');
            if (!iframe) {
                fixResults.skipped.push('Iframe communication (no iframe found)');
                return false;
            }

            // Enhanced message listener
            let messageCount = 0;
            const enhancedListener = (event) => {
                if (event.data?.type?.startsWith('violet-')) {
                    messageCount++;
                    console.log(`📨 Enhanced listener message ${messageCount}:`, event.data.type);
                    
                    // Update connection status immediately
                    if (event.data.type === 'violet-iframe-ready') {
                        const statusEl = document.getElementById('violet-connection-status');
                        if (statusEl) {
                            statusEl.textContent = '✅ Connected (Fixed)';
                            statusEl.style.color = 'green';
                            statusEl.style.fontWeight = 'bold';
                        }
                        window.violetReactAppReady = true;
                        console.log('✅ React app connection established');
                    }
                    
                    // Handle content changes
                    if (event.data.type === 'violet-content-changed' && event.data.data) {
                        if (!window.violetPendingChanges) window.violetPendingChanges = {};
                        
                        window.violetPendingChanges[event.data.data.fieldType] = {
                            field_name: event.data.data.fieldType,
                            field_value: event.data.data.value,
                            field_type: event.data.data.fieldType
                        };
                        
                        if (window.violetUpdateSaveButton) {
                            window.violetUpdateSaveButton();
                        }
                        
                        console.log('📝 Content change tracked:', event.data.data.fieldType);
                    }
                }
            };

            // Remove old listeners and add enhanced one
            window.removeEventListener('message', window.violetHandleMessage);
            window.addEventListener('message', enhancedListener);

            // Force iframe to send ready message
            setTimeout(() => {
                iframe.contentWindow.postMessage({
                    type: 'violet-force-ready',
                    timestamp: Date.now()
                }, '*');
                console.log('📤 Forced ready message sent');
            }, 1000);

            fixResults.applied.push('Enhanced iframe communication');
            console.log('✅ Iframe communication fix applied');
            return true;

        } catch (error) {
            console.log('❌ Iframe communication fix failed:', error);
            fixResults.failed.push('Iframe communication: ' + error.message);
            return false;
        }
    }

    // ===================================
    // FIX 2: ENHANCE SAVE FUNCTIONALITY
    // ===================================
    function fixSaveFunctionality() {
        console.log('\n🔧 FIX 2: SAVE FUNCTIONALITY');
        
        try {
            if (!window.violetSaveAllChanges) {
                console.log('❌ Save function not found');
                fixResults.failed.push('Save function not available');
                return false;
            }

            // Enhance the save function
            const originalSave = window.violetSaveAllChanges;
            
            window.violetSaveAllChanges = function() {
                console.log('💾 ENHANCED SAVE triggered');
                console.log('💾 Saving changes:', window.violetPendingChanges);
                
                if (!window.violetPendingChanges || Object.keys(window.violetPendingChanges).length === 0) {
                    console.log('⚠️ No changes to save');
                    return;
                }
                
                // Call original save
                const result = originalSave.apply(this, arguments);
                
                // Enhanced post-save handling
                setTimeout(() => {
                    const iframe = document.getElementById('violet-site-iframe');
                    if (iframe && iframe.contentWindow) {
                        const changes = Object.values(window.violetPendingChanges);
                        
                        // Send multiple persistence messages
                        const persistenceMessages = [
                            {
                                type: 'violet-apply-saved-changes',
                                savedChanges: changes,
                                timestamp: Date.now()
                            },
                            {
                                type: 'violet-persist-content-changes',
                                contentData: changes,
                                timestamp: Date.now()
                            },
                            {
                                type: 'violet-refresh-content',
                                timestamp: Date.now()
                            }
                        ];
                        
                        persistenceMessages.forEach((message, index) => {
                            setTimeout(() => {
                                iframe.contentWindow.postMessage(message, '*');
                                console.log(`✅ Persistence message ${index + 1} sent:`, message.type);
                            }, index * 200);
                        });
                    }
                }, 500);
                
                return result;
            };

            fixResults.applied.push('Enhanced save functionality');
            console.log('✅ Save functionality fix applied');
            return true;

        } catch (error) {
            console.log('❌ Save functionality fix failed:', error);
            fixResults.failed.push('Save functionality: ' + error.message);
            return false;
        }
    }

    // ===================================
    // FIX 3: FORCE EDITING ACTIVATION
    // ===================================
    function fixEditingActivation() {
        console.log('\n🔧 FIX 3: EDITING ACTIVATION');
        
        try {
            const editButton = document.getElementById('violet-edit-toggle');
            if (!editButton) {
                fixResults.skipped.push('Editing activation (no edit button found)');
                return false;
            }

            // Enhance edit toggle function
            if (!window.violetActivateEditing) {
                window.violetActivateEditing = function() {
                    const iframe = document.getElementById('violet-site-iframe');
                    if (!iframe || !iframe.contentWindow) {
                        console.log('❌ Cannot activate editing - iframe not ready');
                        return;
                    }

                    // Toggle editing state
                    if (window.violetEditingEnabled) {
                        // Disable editing
                        window.violetEditingEnabled = false;
                        editButton.innerHTML = '✏️ Enable Direct Editing';
                        editButton.className = 'button button-primary';
                        
                        iframe.contentWindow.postMessage({
                            type: 'violet-disable-editing',
                            timestamp: Date.now()
                        }, '*');
                        
                        console.log('🔒 Editing disabled');
                    } else {
                        // Enable editing
                        window.violetEditingEnabled = true;
                        editButton.innerHTML = '🔓 Disable Direct Editing';
                        editButton.className = 'button button-secondary';
                        
                        iframe.contentWindow.postMessage({
                            type: 'violet-enable-editing',
                            timestamp: Date.now()
                        }, '*');
                        
                        console.log('✏️ Editing enabled');
                    }
                };
            }

            // Add click handler if missing
            if (!editButton.onclick) {
                editButton.onclick = window.violetActivateEditing;
            }

            fixResults.applied.push('Editing activation function');
            console.log('✅ Editing activation fix applied');
            return true;

        } catch (error) {
            console.log('❌ Editing activation fix failed:', error);
            fixResults.failed.push('Editing activation: ' + error.message);
            return false;
        }
    }

    // ===================================
    // FIX 4: CONNECTION STATUS MONITOR
    // ===================================
    function fixConnectionStatus() {
        console.log('\n🔧 FIX 4: CONNECTION STATUS MONITOR');
        
        try {
            const statusEl = document.getElementById('violet-connection-status');
            if (!statusEl) {
                fixResults.skipped.push('Connection status (element not found)');
                return false;
            }

            // Status monitoring function
            const monitorConnection = () => {
                if (window.violetReactAppReady) {
                    statusEl.textContent = '✅ Connected';
                    statusEl.style.color = 'green';
                    statusEl.style.fontWeight = 'bold';
                } else if (statusEl.textContent === 'Testing connection...') {
                    statusEl.textContent = '🔄 Connecting...';
                    statusEl.style.color = 'orange';
                }
            };

            // Monitor connection status every 2 seconds
            setInterval(monitorConnection, 2000);

            // Initial status update
            monitorConnection();

            fixResults.applied.push('Connection status monitor');
            console.log('✅ Connection status fix applied');
            return true;

        } catch (error) {
            console.log('❌ Connection status fix failed:', error);
            fixResults.failed.push('Connection status: ' + error.message);
            return false;
        }
    }

    // ===================================
    // FIX 5: WORDPRESS CONFIG VALIDATION
    // ===================================
    function fixWordPressConfig() {
        console.log('\n🔧 FIX 5: WORDPRESS CONFIG VALIDATION');
        
        try {
            // Ensure config exists
            if (!window.violetConfig) {
                window.violetConfig = {
                    batchSaveUrl: '/wp-json/violet/v1/content/save-batch',
                    netlifyOrigin: FIXES_CONFIG.netlifyOrigin,
                    netlifyAppUrl: FIXES_CONFIG.netlifyOrigin,
                    nonce: document.querySelector('meta[name=\"wp-rest-nonce\"]')?.content || '',
                    allowedMessageOrigins: [FIXES_CONFIG.netlifyOrigin, FIXES_CONFIG.wpOrigin]
                };
                console.log('✅ WordPress config created');
            }

            // Ensure pending changes exists
            if (!window.violetPendingChanges) {
                window.violetPendingChanges = {};
                console.log('✅ Pending changes object created');
            }

            // Ensure global variables exist
            if (typeof window.violetReactAppReady === 'undefined') {
                window.violetReactAppReady = false;
            }
            
            if (typeof window.violetEditingEnabled === 'undefined') {
                window.violetEditingEnabled = false;
            }

            fixResults.applied.push('WordPress config validation');
            console.log('✅ WordPress config fix applied');
            return true;

        } catch (error) {
            console.log('❌ WordPress config fix failed:', error);
            fixResults.failed.push('WordPress config: ' + error.message);
            return false;
        }
    }

    // ===================================
    // FIX 6: SAVE BUTTON UPDATER
    // ===================================
    function fixSaveButtonUpdater() {
        console.log('\n🔧 FIX 6: SAVE BUTTON UPDATER');
        
        try {
            if (!window.violetUpdateSaveButton) {
                window.violetUpdateSaveButton = function() {
                    const saveButton = document.getElementById('violet-save-all-btn');
                    if (!saveButton) return;

                    const changeCount = Object.keys(window.violetPendingChanges || {}).length;
                    
                    if (changeCount > 0) {
                        saveButton.innerHTML = `💾 Save All Changes (${changeCount})`;
                        saveButton.disabled = false;
                        saveButton.style.opacity = '1';
                        saveButton.className = 'button violet-save-button';
                        
                        // Update status
                        const statusEl = document.getElementById('violet-changes-status');
                        if (statusEl) {
                            statusEl.textContent = `${changeCount} changes ready to save`;
                            statusEl.style.color = '#d63939';
                            statusEl.style.fontWeight = 'bold';
                        }
                    } else {
                        saveButton.innerHTML = '💾 Save All Changes';
                        saveButton.disabled = true;
                        saveButton.style.opacity = '0.5';
                        
                        // Update status
                        const statusEl = document.getElementById('violet-changes-status');
                        if (statusEl) {
                            statusEl.textContent = 'No changes to save';
                            statusEl.style.color = '#666';
                            statusEl.style.fontWeight = 'normal';
                        }
                    }
                };
                
                console.log('✅ Save button updater function created');
            }

            // Add click handler to save button if missing
            const saveButton = document.getElementById('violet-save-all-btn');
            if (saveButton && !saveButton.onclick) {
                saveButton.onclick = function() {
                    if (window.violetSaveAllChanges) {
                        window.violetSaveAllChanges();
                    }
                };
                console.log('✅ Save button click handler added');
            }

            fixResults.applied.push('Save button updater');
            console.log('✅ Save button updater fix applied');
            return true;

        } catch (error) {
            console.log('❌ Save button updater fix failed:', error);
            fixResults.failed.push('Save button updater: ' + error.message);
            return false;
        }
    }

    // ===================================
    // FIX 7: EMERGENCY QUICK FUNCTIONS
    // ===================================
    function addEmergencyFunctions() {
        console.log('\n🔧 FIX 7: EMERGENCY QUICK FUNCTIONS');
        
        try {
            window.violetEmergencyFixes = {
                forceConnect: () => {
                    window.violetReactAppReady = true;
                    const statusEl = document.getElementById('violet-connection-status');
                    if (statusEl) {
                        statusEl.textContent = '✅ Connected (Forced)';
                        statusEl.style.color = 'green';
                    }
                    console.log('✅ Connection forced');
                },
                
                testEdit: () => {
                    if (!window.violetPendingChanges) window.violetPendingChanges = {};
                    window.violetPendingChanges['test_field'] = {
                        field_name: 'test_field',
                        field_value: 'Emergency test: ' + new Date().toLocaleTimeString(),
                        field_type: 'test'
                    };
                    if (window.violetUpdateSaveButton) window.violetUpdateSaveButton();
                    console.log('✅ Test edit added');
                },
                
                forceSave: () => {
                    if (window.violetSaveAllChanges && Object.keys(window.violetPendingChanges || {}).length > 0) {
                        window.violetSaveAllChanges();
                        console.log('✅ Save forced');
                    } else {
                        console.log('❌ No changes to save');
                    }
                },
                
                reloadIframe: () => {
                    const iframe = document.getElementById('violet-site-iframe');
                    if (iframe) {
                        const currentSrc = iframe.src;
                        iframe.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + 'reload=' + Date.now();
                        console.log('✅ Iframe reloaded');
                    }
                },
                
                status: () => {
                    console.log('📊 SYSTEM STATUS:');
                    console.log('  React ready:', !!window.violetReactAppReady);
                    console.log('  Editing enabled:', !!window.violetEditingEnabled);
                    console.log('  Pending changes:', Object.keys(window.violetPendingChanges || {}).length);
                    console.log('  Save function:', typeof window.violetSaveAllChanges);
                    console.log('  Config loaded:', !!window.violetConfig);
                }
            };

            fixResults.applied.push('Emergency quick functions');
            console.log('✅ Emergency functions fix applied');
            return true;

        } catch (error) {
            console.log('❌ Emergency functions fix failed:', error);
            fixResults.failed.push('Emergency functions: ' + error.message);
            return false;
        }
    }

    // ===================================
    // RUN ALL FIXES
    // ===================================
    async function runAllFixes() {
        console.log('🚀 APPLYING ALL FIXES...');
        console.log('⏳ This will take about 10 seconds...');

        const fixes = [
            { name: 'WordPress Config', func: fixWordPressConfig },
            { name: 'Connection Status', func: fixConnectionStatus },
            { name: 'Iframe Communication', func: fixIframeCommunication },
            { name: 'Save Functionality', func: fixSaveFunctionality },
            { name: 'Editing Activation', func: fixEditingActivation },
            { name: 'Save Button Updater', func: fixSaveButtonUpdater },
            { name: 'Emergency Functions', func: addEmergencyFunctions }
        ];

        for (const fix of fixes) {
            console.log(`\n🔧 Applying ${fix.name}...`);
            const success = fix.func();
            if (success) {
                console.log(`✅ ${fix.name} applied successfully`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Generate final report
        generateFixReport();
    }

    function generateFixReport() {
        console.log('\n📊 FIXES APPLIED SUMMARY');
        console.log('='.repeat(60));

        console.log(`✅ Successfully applied: ${fixResults.applied.length} fixes`);
        fixResults.applied.forEach((fix, i) => {
            console.log(`  ${i + 1}. ${fix}`);
        });

        if (fixResults.skipped.length > 0) {
            console.log(`\n⏭️ Skipped: ${fixResults.skipped.length} fixes`);
            fixResults.skipped.forEach((fix, i) => {
                console.log(`  ${i + 1}. ${fix}`);
            });
        }

        if (fixResults.failed.length > 0) {
            console.log(`\n❌ Failed: ${fixResults.failed.length} fixes`);
            fixResults.failed.forEach((fix, i) => {
                console.log(`  ${i + 1}. ${fix}`);
            });
        }

        const successRate = (fixResults.applied.length / (fixResults.applied.length + fixResults.failed.length)) * 100;
        console.log(`\n🎯 Success Rate: ${Math.round(successRate)}%`);

        if (successRate >= 85) {
            console.log('🎉 EXCELLENT: WordPress editor should now be fully functional!');
            console.log('\n📋 Next steps:');
            console.log('  1. Click "Enable Direct Editing"');
            console.log('  2. Click any text in the React iframe');
            console.log('  3. Make changes');
            console.log('  4. Click "Save All Changes"');
            console.log('  5. Refresh page to verify persistence');
            fixResults.success = true;
        } else if (successRate >= 60) {
            console.log('⚠️ PARTIAL: WordPress editor has improved but may need additional work');
            console.log('\n💡 Try these emergency functions:');
            console.log('  window.violetEmergencyFixes.status() - Check system status');
            console.log('  window.violetEmergencyFixes.forceConnect() - Force connection');
            console.log('  window.violetEmergencyFixes.testEdit() - Add test edit');
        } else {
            console.log('🚨 CRITICAL: WordPress editor still has significant issues');
            console.log('\n🆘 Emergency recovery:');
            console.log('  window.violetEmergencyFixes.reloadIframe() - Reload iframe');
            console.log('  window.violetEmergencyFixes.status() - Check system status');
        }

        console.log('\n🔧 COMPLETE WORDPRESS EDITOR FIXES FINISHED');
        
        // Store results globally
        window.violetFixResults = fixResults;
        console.log('💾 Results stored in: window.violetFixResults');
    }

    // Start fixes
    runAllFixes();

})();
