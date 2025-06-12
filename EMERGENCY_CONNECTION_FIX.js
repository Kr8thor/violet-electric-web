/**
 * 🚨 EMERGENCY WORDPRESS-REACT CONNECTION FIX
 * Fixes the "settings have nothing behind them" issue
 */

console.log('🚨 EMERGENCY FIX: WordPress-React Connection');
console.log('===========================================');

// PHASE 1: Fix Missing WordPress Functions
function fixWordPressFunctions() {
    console.log('🔧 Phase 1: Fixing WordPress Functions...');
    
    // Essential function: Enable/Disable Editing
    window.violetActivateEditing = function() {
        console.log('✏️ Activating editing mode...');
        const iframe = document.getElementById('violet-site-iframe');
        
        if (!iframe) {
            console.log('❌ Iframe not found');
            return;
        }
        
        // Send enable editing message
        iframe.contentWindow.postMessage({
            type: 'violet-enable-editing',
            timestamp: Date.now()
        }, '*');
        
        // Update button text
        const button = document.getElementById('violet-enable-editing');
        if (button) {
            button.textContent = '🔓 Disable Editing';
            button.onclick = violetDeactivateEditing;
        }
        
        console.log('✅ Editing mode activated');
    };
    
    window.violetDeactivateEditing = function() {
        console.log('🔒 Deactivating editing mode...');
        const iframe = document.getElementById('violet-site-iframe');
        
        if (iframe) {
            iframe.contentWindow.postMessage({
                type: 'violet-disable-editing',
                timestamp: Date.now()
            }, '*');
        }
        
        // Update button text
        const button = document.getElementById('violet-enable-editing');
        if (button) {
            button.textContent = '✏️ Enable Universal Editing';
            button.onclick = violetActivateEditing;
        }
        
        console.log('✅ Editing mode deactivated');
    };
    
    // Essential function: Save All Changes
    window.violetSaveAllChanges = function() {
        console.log('💾 Saving all changes...');
        
        const changes = window.violetPendingChanges || {};
        const changeCount = Object.keys(changes).length;
        
        if (changeCount === 0) {
            console.log('ℹ️ No changes to save');
            return;
        }
        
        // Convert to array format
        const changesArray = Object.values(changes);
        
        // Send to WordPress API
        fetch('/wp-json/violet/v1/content/save-batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': violetGetNonce()
            },
            body: JSON.stringify({ changes: changesArray })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`✅ Saved ${data.saved_count} changes successfully`);
                
                // Notify React app
                const iframe = document.getElementById('violet-site-iframe');
                if (iframe) {
                    iframe.contentWindow.postMessage({
                        type: 'violet-apply-saved-changes',
                        savedChanges: changesArray
                    }, '*');
                }
                
                // Clear pending changes
                window.violetPendingChanges = {};
                updateSaveButton();
                
            } else {
                console.log('❌ Save failed:', data.message);
            }
        })
        .catch(error => {
            console.log('❌ Save error:', error);
        });
    };
    
    // Essential function: Refresh Preview
    window.violetRefreshPreview = function() {
        console.log('🔄 Refreshing preview...');
        const iframe = document.getElementById('violet-site-iframe');
        
        if (iframe) {
            // Add cache busting parameter
            const url = new URL(iframe.src);
            url.searchParams.set('t', Date.now());
            iframe.src = url.toString();
            console.log('✅ Preview refreshed');
        }
    };
    
    // Essential function: Test Communication
    window.violetTestCommunication = function() {
        console.log('🔗 Testing communication...');
        const iframe = document.getElementById('violet-site-iframe');
        
        if (iframe) {
            iframe.contentWindow.postMessage({
                type: 'violet-test-connection',
                timestamp: Date.now()
            }, '*');
            console.log('📤 Test message sent');
        }
    };
    
    console.log('✅ WordPress functions fixed');
}

// PHASE 2: Fix Missing Variables
function fixWordPressVariables() {
    console.log('🔧 Phase 2: Fixing WordPress Variables...');
    
    // Initialize pending changes tracker
    window.violetPendingChanges = window.violetPendingChanges || {};
    
    // Initialize React app ready flag
    window.violetReactAppReady = false;
    
    // Initialize configuration
    window.violetConfig = {
        netlifyOrigin: 'https://lustrous-dolphin-447351.netlify.app',
        batchSaveUrl: '/wp-json/violet/v1/content/save-batch',
        nonce: document.querySelector('meta[name="wp-nonce"]')?.content || ''
    };
    
    console.log('✅ WordPress variables fixed');
}

// PHASE 3: Fix Missing Message Handlers
function fixMessageHandlers() {
    console.log('🔧 Phase 3: Fixing Message Handlers...');
    
    // Remove existing listeners to avoid duplicates
    window.removeEventListener('message', window.violetMessageHandler);
    
    // Create comprehensive message handler
    window.violetMessageHandler = function(event) {
        // Security check
        const allowedOrigins = [
            'https://lustrous-dolphin-447351.netlify.app',
            'https://violetrainwater.com',
            window.violetConfig?.netlifyOrigin
        ];
        
        if (!allowedOrigins.some(origin => event.origin === origin || event.origin.includes('netlify.app'))) {
            return;
        }
        
        if (!event.data?.type?.startsWith('violet-')) {
            return;
        }
        
        console.log('📨 Message received:', event.data.type, event.data);
        
        switch (event.data.type) {
            case 'violet-iframe-ready':
                window.violetReactAppReady = true;
                console.log('✅ React app ready');
                updateConnectionStatus('✅ Connected');
                break;
                
            case 'violet-access-confirmed':
                console.log('✅ Two-way communication confirmed');
                updateConnectionStatus('✅ Communication Active');
                break;
                
            case 'violet-content-changed':
                if (event.data.data) {
                    window.violetPendingChanges[event.data.data.fieldType] = {
                        field_name: event.data.data.fieldType,
                        field_value: event.data.data.value
                    };
                    updateSaveButton();
                    console.log('📝 Content changed:', event.data.data.fieldType);
                }
                break;
                
            case 'violet-edit-text':
                handleTextEdit(event.data);
                break;
                
            case 'violet-edit-image':
                handleImageEdit(event.data);
                break;
                
            case 'violet-edit-button':
                handleButtonEdit(event.data);
                break;
        }
    };
    
    // Add the message listener
    window.addEventListener('message', window.violetMessageHandler);
    
    console.log('✅ Message handlers fixed');
}

// PHASE 4: Fix UI Update Functions
function fixUIFunctions() {
    console.log('🔧 Phase 4: Fixing UI Functions...');
    
    window.updateConnectionStatus = function(status) {
        const statusElement = document.getElementById('violet-connection-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.style.color = status.includes('✅') ? '#00a32a' : '#d63939';
        }
    };
    
    window.updateSaveButton = function() {
        const saveButton = document.getElementById('violet-save-all');
        const changeCount = Object.keys(window.violetPendingChanges || {}).length;
        
        if (saveButton) {
            if (changeCount > 0) {
                saveButton.style.display = 'inline-block';
                saveButton.textContent = `💾 Save Changes (${changeCount})`;
            } else {
                saveButton.style.display = 'none';
            }
        }
    };
    
    window.violetGetNonce = function() {
        // Try multiple methods to get nonce
        const metaNonce = document.querySelector('meta[name="wp-nonce"]')?.content;
        const configNonce = window.violetConfig?.nonce;
        const scriptNonce = document.querySelector('script')?.textContent?.match(/nonce['":\s]*['"]([^'"]+)['"]/)?.[1];
        
        return metaNonce || configNonce || scriptNonce || '';
    };
    
    console.log('✅ UI functions fixed');
}

// PHASE 5: Fix Edit Handlers
function fixEditHandlers() {
    console.log('🔧 Phase 5: Fixing Edit Handlers...');
    
    window.handleTextEdit = function(data) {
        const newValue = prompt('Edit text:', data.currentValue || '');
        if (newValue !== null && newValue !== data.currentValue) {
            // Store pending change
            window.violetPendingChanges[data.field] = {
                field_name: data.field,
                field_value: newValue
            };
            
            // Update preview
            const iframe = document.getElementById('violet-site-iframe');
            if (iframe) {
                iframe.contentWindow.postMessage({
                    type: 'violet-update-preview',
                    field: data.field,
                    value: newValue,
                    contentType: 'text'
                }, '*');
            }
            
            updateSaveButton();
        }
    };
    
    window.handleImageEdit = function(data) {
        // Use WordPress media library if available
        if (typeof wp !== 'undefined' && wp.media) {
            const mediaUploader = wp.media({
                title: 'Select Image',
                button: { text: 'Use Image' },
                multiple: false
            });
            
            mediaUploader.on('select', function() {
                const attachment = mediaUploader.state().get('selection').first().toJSON();
                
                window.violetPendingChanges[data.field] = {
                    field_name: data.field,
                    field_value: attachment.url
                };
                
                // Update preview
                const iframe = document.getElementById('violet-site-iframe');
                if (iframe) {
                    iframe.contentWindow.postMessage({
                        type: 'violet-update-preview',
                        field: data.field,
                        value: attachment.url,
                        contentType: 'image'
                    }, '*');
                }
                
                updateSaveButton();
            });
            
            mediaUploader.open();
        } else {
            const newUrl = prompt('Enter image URL:', data.currentSrc || '');
            if (newUrl !== null && newUrl !== data.currentSrc) {
                window.violetPendingChanges[data.field] = {
                    field_name: data.field,
                    field_value: newUrl
                };
                updateSaveButton();
            }
        }
    };
    
    window.handleButtonEdit = function(data) {
        const newText = prompt('Button text:', data.currentText || '');
        if (newText !== null) {
            window.violetPendingChanges[data.textField] = {
                field_name: data.textField,
                field_value: newText
            };
        }
        
        const newUrl = prompt('Button URL:', data.currentUrl || '');
        if (newUrl !== null) {
            window.violetPendingChanges[data.urlField] = {
                field_name: data.urlField,
                field_value: newUrl
            };
        }
        
        updateSaveButton();
    };
    
    console.log('✅ Edit handlers fixed');
}

// PHASE 6: Fix Button Event Handlers
function fixButtonHandlers() {
    console.log('🔧 Phase 6: Fixing Button Handlers...');
    
    // Fix Enable/Disable Editing button
    const enableButton = document.getElementById('violet-enable-editing');
    if (enableButton) {
        enableButton.onclick = violetActivateEditing;
        console.log('✅ Enable editing button fixed');
    }
    
    // Fix Save All button
    const saveButton = document.getElementById('violet-save-all');
    if (saveButton) {
        saveButton.onclick = violetSaveAllChanges;
        console.log('✅ Save button fixed');
    }
    
    // Fix Refresh button
    const refreshButton = document.getElementById('violet-refresh-preview');
    if (refreshButton) {
        refreshButton.onclick = violetRefreshPreview;
        console.log('✅ Refresh button fixed');
    }
    
    // Fix Test Communication button
    const testButton = document.getElementById('violet-test-communication');
    if (testButton) {
        testButton.onclick = violetTestCommunication;
        console.log('✅ Test button fixed');
    }
    
    console.log('✅ Button handlers fixed');
}

// PHASE 7: Initialize Communication
function initializeCommunication() {
    console.log('🔧 Phase 7: Initializing Communication...');
    
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.log('❌ No iframe found - cannot initialize communication');
        return;
    }
    
    // Wait for iframe to load
    if (iframe.contentWindow) {
        console.log('📤 Sending test message to React app...');
        iframe.contentWindow.postMessage({
            type: 'violet-test-connection',
            timestamp: Date.now()
        }, '*');
        
        // Check for response
        setTimeout(() => {
            if (window.violetReactAppReady) {
                console.log('🎉 Communication initialized successfully!');
                updateConnectionStatus('✅ Ready for Editing');
            } else {
                console.log('⚠️ No response from React app - retrying...');
                
                // Force iframe refresh
                const url = new URL(iframe.src);
                url.searchParams.set('t', Date.now());
                iframe.src = url.toString();
            }
        }, 2000);
    }
    
    console.log('✅ Communication initialization started');
}

// EXECUTE ALL PHASES
function executeEmergencyFix() {
    console.log('🚨 EXECUTING EMERGENCY FIX...');
    console.log('==============================');
    
    try {
        fixWordPressFunctions();
        fixWordPressVariables();
        fixMessageHandlers();
        fixUIFunctions();
        fixEditHandlers();
        fixButtonHandlers();
        initializeCommunication();
        
        console.log('\n🎉 EMERGENCY FIX COMPLETE!');
        console.log('✅ All systems should now be operational');
        console.log('\n📋 Test the fix:');
        console.log('1. Click "Enable Universal Editing"');
        console.log('2. Look for "✅ Ready for Editing" status');
        console.log('3. Test editing by clicking elements in the iframe');
        console.log('4. Save changes with "Save Changes" button');
        
    } catch (error) {
        console.log('❌ Emergency fix failed:', error);
        console.log('💡 Try refreshing the WordPress admin page and running again');
    }
}

// AUTO-EXECUTE THE FIX
executeEmergencyFix();

// Export for manual use
window.executeEmergencyFix = executeEmergencyFix;
