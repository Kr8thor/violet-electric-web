/**
 * 🚨 PERMANENT POPUP ELIMINATION - Enhanced Functions.php
 * This replaces all prompt() dialogs with seamless inline editing
 * Copy this section to replace the problematic JavaScript in your functions.php
 */

// Add this JavaScript section to your functions.php (replace existing editing JavaScript)

function violet_popup_free_editor_script() {
    ?>
    <script id="violet-popup-free-editor">
    // 🚫 POPUP-FREE UNIVERSAL EDITING SYSTEM
    let editingEnabled = false;
    let pendingChanges = {};
    let connectionReady = false;
    
    // Initialize popup-free editor
    document.addEventListener('DOMContentLoaded', function() {
        initializePopupFreeEditor();
    });
    
    function initializePopupFreeEditor() {
        console.log('🚫 Initializing Popup-Free Universal Editor...');
        
        // Set up all event listeners
        document.getElementById('violet-enable-editing')?.addEventListener('click', toggleSeamlessEditing);
        document.getElementById('violet-save-all')?.addEventListener('click', saveAllChanges);
        document.getElementById('violet-refresh-preview')?.addEventListener('click', refreshPreview);
        
        // Listen for edit requests from React app
        window.addEventListener('message', function(event) {
            handleSeamlessEditRequest(event.data);
        });
        
        // Test connection after iframe loads
        setTimeout(testConnection, 2000);
        
        updateStatus('🚫 Popup-free editor ready - no more annoying dialogs!');
    }
    
    function testConnection() {
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-test-connection',
                system: 'popup_free_editor'
            }, '*');
            
            setTimeout(() => {
                if (!connectionReady) {
                    document.getElementById('violet-connection-status').textContent = '⚠️ Connection issues - refresh page';
                }
            }, 3000);
        }
    }
    
    function toggleSeamlessEditing() {
        editingEnabled = !editingEnabled;
        const iframe = document.getElementById('violet-site-iframe');
        const button = document.getElementById('violet-enable-editing');
        
        iframe.contentWindow.postMessage({
            type: editingEnabled ? 'violet-enable-seamless-editing' : 'violet-disable-editing',
            system: 'popup_free_editor'
        }, '*');
        
        button.textContent = editingEnabled ? '🔓 Disable Seamless Editing' : '✏️ Enable Seamless Editing';
        button.style.background = editingEnabled ? '#d63939 !important' : '#00a32a !important';
        
        updateStatus(editingEnabled ? '✏️ Seamless editing active - click any element to edit directly' : '🚫 Ready for popup-free editing');
        
        if (!editingEnabled) {
            pendingChanges = {};
            updateSaveButton();
        }
    }
    
    function refreshPreview() {
        const iframe = document.getElementById('violet-site-iframe');
        iframe.src = iframe.src;
        updateStatus('🔄 Refreshing preview...');
        setTimeout(() => updateStatus('Preview refreshed'), 2000);
    }
    
    // 🚫 SEAMLESS EDIT REQUEST HANDLER - NO POPUPS!
    function handleSeamlessEditRequest(data) {
        if (!data || !data.type || !data.type.startsWith('violet-')) return;
        
        switch(data.type) {
            case 'violet-connection-ready':
            case 'violet-iframe-ready':
            case 'violet-access-confirmed':
                connectionReady = true;
                document.getElementById('violet-connection-status').textContent = '✅ Connected';
                break;
                
            case 'violet-content-changed':
                if (data.data) {
                    pendingChanges[data.data.fieldType] = {
                        field_name: data.data.fieldType,
                        field_value: data.data.value
                    };
                    updateSaveButton();
                    updateStatus(`Content changed: ${data.data.fieldType}`);
                }
                break;
                
            // 🚫 NO MORE POPUP DIALOGS - SEAMLESS EDITING ONLY
            case 'violet-edit-text':
                enableDirectTextEditing(data);
                break;
                
            case 'violet-edit-image':
                enableSeamlessImageEditing(data);
                break;
                
            case 'violet-edit-color':
                enableDirectColorEditing(data);
                break;
                
            case 'violet-edit-button':
                enableSeamlessButtonEditing(data);
                break;
                
            case 'violet-edit-link':
                enableSeamlessLinkEditing(data);
                break;
        }
    }
    
    // 🚫 DIRECT TEXT EDITING - NO POPUP
    function enableDirectTextEditing(data) {
        console.log('✏️ Enabling direct text editing for:', data.field);
        
        // Send message to React app to make element directly editable
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-make-directly-editable',
                field: data.field,
                currentValue: data.currentValue || data.defaultValue || ''
            }, '*');
        }
        
        updateStatus(`✏️ Click the text to edit directly - no popup needed`);
    }
    
    // 🚫 SEAMLESS IMAGE EDITING - NO POPUP
    function enableSeamlessImageEditing(data) {
        console.log('🖼️ Opening media library for:', data.field);
        
        // Use WordPress media library directly - no popup
        if (typeof wp !== 'undefined' && wp.media) {
            const mediaUploader = wp.media({
                title: 'Select Image',
                button: { text: 'Use Image' },
                multiple: false
            });
            
            mediaUploader.on('select', function() {
                const attachment = mediaUploader.state().get('selection').first().toJSON();
                
                pendingChanges[data.field] = {
                    field_name: data.field,
                    field_value: attachment.url
                };
                
                // Update preview immediately
                updatePreview(data.field, attachment.url, 'image');
                updateStatus(`Image updated: ${data.field}`);
                updateSaveButton();
            });
            
            mediaUploader.open();
        } else {
            updateStatus('📸 Media library not available - image editing skipped');
        }
    }
    
    // 🚫 DIRECT COLOR EDITING - NO POPUP
    function enableDirectColorEditing(data) {
        console.log('🎨 Opening color picker for:', data.field);
        
        // Create color picker input directly - no popup
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = data.currentColor || data.defaultColor || '#000000';
        colorInput.style.position = 'fixed';
        colorInput.style.top = '100px';
        colorInput.style.left = '100px';
        colorInput.style.zIndex = '99999';
        
        colorInput.addEventListener('change', function() {
            const newColor = colorInput.value;
            
            pendingChanges[data.field] = {
                field_name: data.field,
                field_value: newColor
            };
            
            updatePreview(data.field, newColor, 'color');
            updateStatus(`Color updated: ${data.field} = ${newColor}`);
            updateSaveButton();
            
            // Remove color picker
            document.body.removeChild(colorInput);
        });
        
        colorInput.addEventListener('blur', function() {
            // Remove color picker if user clicks away
            if (document.body.contains(colorInput)) {
                document.body.removeChild(colorInput);
            }
        });
        
        document.body.appendChild(colorInput);
        colorInput.click();
    }
    
    // 🚫 SEAMLESS BUTTON EDITING - NO POPUP
    function enableSeamlessButtonEditing(data) {
        console.log('🔘 Enabling seamless button editing for:', data.field);
        
        // Create a simple inline editor panel - no popup
        const panel = createInlineEditorPanel('Edit Button', [
            {
                label: 'Button Text:',
                value: data.currentText || data.defaultText || '',
                onchange: (value) => {
                    if (data.textField) {
                        pendingChanges[data.textField] = {
                            field_name: data.textField,
                            field_value: value
                        };
                    }
                }
            },
            {
                label: 'Button URL:',
                value: data.currentUrl || data.defaultUrl || '',
                onchange: (value) => {
                    if (data.urlField) {
                        pendingChanges[data.urlField] = {
                            field_name: data.urlField,
                            field_value: value
                        };
                    }
                }
            }
        ], () => {
            updateStatus(`Button updated: ${data.field}`);
            updateSaveButton();
        });
    }
    
    // 🚫 SEAMLESS LINK EDITING - NO POPUP
    function enableSeamlessLinkEditing(data) {
        console.log('🔗 Enabling seamless link editing for:', data.field);
        
        // Create a simple inline editor panel - no popup
        const panel = createInlineEditorPanel('Edit Link', [
            {
                label: 'Link Text:',
                value: data.currentText || data.defaultText || '',
                onchange: (value) => {
                    if (data.textField) {
                        pendingChanges[data.textField] = {
                            field_name: data.textField,
                            field_value: value
                        };
                    }
                }
            },
            {
                label: 'Link URL:',
                value: data.currentUrl || data.defaultUrl || '',
                onchange: (value) => {
                    if (data.urlField) {
                        pendingChanges[data.urlField] = {
                            field_name: data.urlField,
                            field_value: value
                        };
                    }
                }
            }
        ], () => {
            updateStatus(`Link updated: ${data.field}`);
            updateSaveButton();
        });
    }
    
    // 🔧 INLINE EDITOR PANEL CREATOR - NO POPUP
    function createInlineEditorPanel(title, fields, onSave) {
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 50px;
            left: 50px;
            background: white;
            border: 2px solid #0073aa;
            border-radius: 8px;
            padding: 20px;
            z-index: 99999;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            min-width: 300px;
        `;
        
        panel.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #0073aa;">${title}</h3>
            <div id="panel-fields"></div>
            <div style="margin-top: 15px; text-align: right;">
                <button id="panel-save" style="background: #00a32a; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 8px; cursor: pointer;">Save</button>
                <button id="panel-cancel" style="background: #666; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Cancel</button>
            </div>
        `;
        
        const fieldsContainer = panel.querySelector('#panel-fields');
        
        fields.forEach((field, index) => {
            const fieldDiv = document.createElement('div');
            fieldDiv.style.marginBottom = '10px';
            fieldDiv.innerHTML = `
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">${field.label}</label>
                <input type="text" id="field-${index}" value="${field.value}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            `;
            fieldsContainer.appendChild(fieldDiv);
            
            const input = fieldDiv.querySelector('input');
            input.addEventListener('input', () => field.onchange(input.value));
        });
        
        panel.querySelector('#panel-save').addEventListener('click', () => {
            onSave();
            document.body.removeChild(panel);
        });
        
        panel.querySelector('#panel-cancel').addEventListener('click', () => {
            document.body.removeChild(panel);
        });
        
        document.body.appendChild(panel);
        
        // Focus first input
        const firstInput = panel.querySelector('input');
        if (firstInput) {
            firstInput.focus();
            firstInput.select();
        }
    }
    
    function updatePreview(field, value, type) {
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-update-preview',
                field: field,
                value: value,
                contentType: type
            }, '*');
        }
    }
    
    function updateStatus(message) {
        const statusElement = document.getElementById('violet-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
    
    function updateSaveButton() {
        const saveButton = document.getElementById('violet-save-all');
        const changeCount = Object.keys(pendingChanges).length;
        
        if (saveButton) {
            if (changeCount > 0) {
                saveButton.style.display = 'inline-block';
                saveButton.textContent = `💾 Save Changes (${changeCount})`;
            } else {
                saveButton.style.display = 'none';
                saveButton.textContent = '💾 Save All Changes (0)';
            }
        }
    }
    
    function saveAllChanges() {
        if (Object.keys(pendingChanges).length === 0) {
            updateStatus('No changes to save');
            return;
        }
        
        updateStatus('💾 Saving changes...');
        
        // Convert pending changes to the format expected by the API
        const changes = Object.values(pendingChanges);
        
        fetch('/wp-json/violet/v1/content/save-batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
            },
            body: JSON.stringify({ changes: changes })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                pendingChanges = {};
                updateSaveButton();
                updateStatus('✅ All changes saved successfully - no popups needed!');
                
                // Notify React app of successful save
                const iframe = document.getElementById('violet-site-iframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'violet-apply-saved-changes',
                        savedChanges: changes,
                        system: 'popup_free_editor'
                    }, '*');
                }
                
            } else {
                updateStatus('❌ Save failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Save failed:', error);
            updateStatus('❌ Save failed: Network error');
        });
    }
    
    console.log('🚫 Popup-Free Universal Editor Ready!');
    console.log('✅ No more annoying prompt() dialogs');
    console.log('🎯 All editing is now seamless and inline');
    
    </script>
    <?php
}

// Add this to your main functions.php file
add_action('admin_footer', 'violet_popup_free_editor_script');
