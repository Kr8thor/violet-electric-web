<?php
/**
 * ENHANCED WORDPRESS FUNCTIONS - UNIVERSAL EDITING SUPPORT
 * Add this to your existing functions.php file
 * 
 * IMPORTANT: This enhances your existing functions.php - don't replace it entirely!
 * Add these functions AFTER your existing Violet API code.
 */

// ==============================================
// IMAGE MANAGEMENT ENDPOINT
// ==============================================
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/images', array(
        'methods' => array('GET', 'POST'),
        'callback' => 'violet_handle_images',
        'permission_callback' => function() {
            return current_user_can('upload_files');
        }
    ));
});

function violet_handle_images($request) {
    if ($request->get_method() === 'GET') {
        // Return all image fields
        $content = get_option('violet_all_content', array());
        $images = array();
        
        foreach ($content as $key => $value) {
            if (strpos($key, '_image') !== false || strpos($key, '_icon') !== false || strpos($key, '_logo') !== false) {
                $images[$key] = $value;
            }
        }
        
        return new WP_REST_Response($images, 200);
    } else {
        // Handle image upload
        $field = $request->get_param('field');
        $files = $request->get_file_params();
        
        if (isset($files['image'])) {
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            require_once(ABSPATH . 'wp-admin/includes/file.php');
            require_once(ABSPATH . 'wp-admin/includes/media.php');
            
            $attachment_id = media_handle_upload('image', 0);
            
            if (!is_wp_error($attachment_id)) {
                $image_url = wp_get_attachment_url($attachment_id);
                
                // Save to content array
                $content = get_option('violet_all_content', array());
                $content[$field] = $image_url;
                update_option('violet_all_content', $content);
                
                // Clear cache
                wp_cache_flush();
                
                return new WP_REST_Response(array(
                    'success' => true,
                    'field' => $field,
                    'url' => $image_url,
                    'attachment_id' => $attachment_id
                ), 200);
            } else {
                return new WP_Error('upload_failed', $attachment_id->get_error_message(), array('status' => 400));
            }
        }
        
        return new WP_Error('no_image', 'No image file provided', array('status' => 400));
    }
}

// ==============================================
// COLOR MANAGEMENT ENDPOINT
// ==============================================
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/colors', array(
        'methods' => array('GET', 'POST'),
        'callback' => 'violet_handle_colors',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        }
    ));
});

function violet_handle_colors($request) {
    if ($request->get_method() === 'GET') {
        // Return all color fields
        $content = get_option('violet_all_content', array());
        $colors = array();
        
        foreach ($content as $key => $value) {
            if (strpos($key, '_color') !== false || strpos($key, '_bg') !== false) {
                $colors[$key] = $value;
            }
        }
        
        return new WP_REST_Response($colors, 200);
    } else {
        $field = $request->get_param('field');
        $color = $request->get_param('color');
        
        if (preg_match('/^#[a-fA-F0-9]{6}$/', $color)) {
            $content = get_option('violet_all_content', array());
            $content[$field] = sanitize_hex_color($color);
            update_option('violet_all_content', $content);
            wp_cache_flush();
            
            return new WP_REST_Response(array(
                'success' => true,
                'field' => $field,
                'color' => $color
            ), 200);
        }
        
        return new WP_Error('invalid_color', 'Invalid color format', array('status' => 400));
    }
}

// ==============================================
// ENHANCED WORDPRESS ADMIN INTERFACE
// ==============================================
add_action('admin_menu', function() {
    add_menu_page(
        'Universal Editor',
        '🎨 Universal Editor',
        'manage_options',
        'violet-universal-editor',
        'violet_render_universal_editor_page',
        'dashicons-edit',
        30
    );
    
    add_submenu_page(
        'violet-universal-editor',
        'Editor Settings',
        'Settings',
        'manage_options',
        'violet-editor-settings',
        'violet_render_settings_page'
    );
});

function violet_render_universal_editor_page() {
    $netlify_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    $editing_params = '?edit_mode=1&wp_admin=1&wp_origin=' . urlencode(admin_url());
    ?>
    <div class="wrap">
        <h1>🎨 Universal Frontend Editor</h1>
        
        <div id="violet-editor-controls" style="margin-bottom: 20px; padding: 15px; background: #f1f1f1; border-radius: 5px;">
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <button id="violet-enable-editing" class="button button-primary">Enable Universal Editing</button>
                <button id="violet-save-all" class="button button-secondary">Save All Changes</button>
                <button id="violet-refresh-preview" class="button">Refresh Preview</button>
                <span id="violet-status" style="margin-left: 10px; font-weight: bold;">Ready to edit</span>
                <span id="violet-connection-status" style="margin-left: 10px; color: #666;">Testing connection...</span>
            </div>
            
            <div style="margin-top: 10px; font-size: 13px; color: #666;">
                <strong>Instructions:</strong> Click "Enable Universal Editing" then click any text, image, button, or colored element to edit it.
            </div>
        </div>
        
        <iframe 
            id="violet-site-iframe" 
            src="<?php echo esc_url($netlify_url . $editing_params); ?>" 
            style="width: 100%; height: 80vh; border: 1px solid #ddd; border-radius: 5px;">
        </iframe>
    </div>
    
    <script>
    // Enhanced editing interface with universal support
    let editingEnabled = false;
    let pendingChanges = {};
    let connectionReady = false;
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        initializeUniversalEditor();
    });
    
    function initializeUniversalEditor() {
        console.log('🚀 Initializing Universal Editor...');
        
        // Set up all event listeners
        document.getElementById('violet-enable-editing').addEventListener('click', toggleEditing);
        document.getElementById('violet-save-all').addEventListener('click', saveAllChanges);
        document.getElementById('violet-refresh-preview').addEventListener('click', refreshPreview);
        
        // Listen for all edit requests from React app
        window.addEventListener('message', function(event) {
            handleEditRequest(event.data);
        });
        
        // Test connection after iframe loads
        setTimeout(testConnection, 2000);
    }
    
    function testConnection() {
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-test-connection'
            }, '*');
            
            setTimeout(() => {
                if (!connectionReady) {
                    document.getElementById('violet-connection-status').textContent = '⚠️ Connection issues - refresh page';
                    document.getElementById('violet-connection-status').style.color = '#d63384';
                }
            }, 3000);
        }
    }
    
    function toggleEditing() {
        editingEnabled = !editingEnabled;
        const iframe = document.getElementById('violet-site-iframe');
        const button = document.getElementById('violet-enable-editing');
        
        iframe.contentWindow.postMessage({
            type: editingEnabled ? 'violet-enable-editing' : 'violet-disable-editing'
        }, '*');
        
        button.textContent = editingEnabled ? 'Disable Editing' : 'Enable Universal Editing';
        button.className = editingEnabled ? 'button button-secondary' : 'button button-primary';
        
        updateStatus(editingEnabled ? '✏️ Universal editing active - click any element to edit' : 'Ready to edit');
        
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
    
    function handleEditRequest(data) {
        if (!data || !data.type || !data.type.startsWith('violet-')) return;
        
        switch(data.type) {
            case 'violet-connection-ready':
                connectionReady = true;
                document.getElementById('violet-connection-status').textContent = '✅ Connected';
                document.getElementById('violet-connection-status').style.color = '#198754';
                break;
                
            case 'violet-edit-text':
                editText(data);
                break;
                
            case 'violet-edit-image':
                editImage(data);
                break;
                
            case 'violet-edit-color':
                editColor(data);
                break;
                
            case 'violet-edit-button':
                editButton(data);
                break;
                
            case 'violet-edit-link':
                editLink(data);
                break;
                
            case 'violet-edit-container':
                editContainer(data);
                break;
        }
    }
    
    function editText(data) {
        const newValue = prompt('Edit text:', data.currentValue || data.defaultValue || '');
        if (newValue !== null && newValue !== data.currentValue) {
            pendingChanges[data.field] = newValue;
            updatePreview(data.field, newValue, 'text');
            updateStatus(`Text updated: ${data.field}`);
            updateSaveButton();
        }
    }
    
    function editImage(data) {
        // Trigger WordPress media library
        if (typeof wp !== 'undefined' && wp.media) {
            const mediaUploader = wp.media({
                title: 'Select Image',
                button: { text: 'Use Image' },
                multiple: false
            });
            
            mediaUploader.on('select', function() {
                const attachment = mediaUploader.state().get('selection').first().toJSON();
                pendingChanges[data.field] = attachment.url;
                updatePreview(data.field, attachment.url, 'image');
                updateStatus(`Image updated: ${data.field}`);
                updateSaveButton();
            });
            
            mediaUploader.open();
        } else {
            const newUrl = prompt('Enter image URL:', data.currentSrc || data.defaultSrc || '');
            if (newUrl !== null && newUrl !== data.currentSrc) {
                pendingChanges[data.field] = newUrl;
                updatePreview(data.field, newUrl, 'image');
                updateStatus(`Image updated: ${data.field}`);
                updateSaveButton();
            }
        }
    }
    
    function editColor(data) {
        // Create a simple color picker input
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = data.currentColor || data.defaultColor || '#000000';
        
        colorInput.addEventListener('change', function() {
            const newColor = colorInput.value;
            pendingChanges[data.field] = newColor;
            updatePreview(data.field, newColor, 'color');
            updateStatus(`Color updated: ${data.field}`);
            updateSaveButton();
        });
        
        colorInput.click();
    }
    
    function editButton(data) {
        const newText = prompt('Button text:', data.currentText || data.defaultText || '');
        if (newText !== null && newText !== data.currentText) {
            pendingChanges[data.textField] = newText;
        }
        
        const newUrl = prompt('Button URL:', data.currentUrl || data.defaultUrl || '');
        if (newUrl !== null && newUrl !== data.currentUrl) {
            pendingChanges[data.urlField] = newUrl;
        }
        
        const newColor = prompt('Button color (hex):', data.currentColor || data.defaultColor || '');
        if (newColor && newColor !== data.currentColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
            pendingChanges[data.colorField] = newColor;
        }
        
        updateStatus(`Button updated: ${data.field}`);
        updateSaveButton();
    }
    
    function editLink(data) {
        const newText = prompt('Link text:', data.currentText || data.defaultText || '');
        if (newText !== null && newText !== data.currentText) {
            pendingChanges[data.textField] = newText;
        }
        
        const newUrl = prompt('Link URL:', data.currentUrl || data.defaultUrl || '');
        if (newUrl !== null && newUrl !== data.currentUrl) {
            pendingChanges[data.urlField] = newUrl;
        }
        
        updateStatus(`Link updated: ${data.field}`);
        updateSaveButton();
    }
    
    function editContainer(data) {
        switch(data.action) {
            case 'edit-section':
                alert('Section editing: This will open advanced layout controls (coming soon)');
                break;
            case 'duplicate-section':
                alert('Section duplication: This will duplicate the entire section (coming soon)');
                break;
            case 'delete-section':
                alert('Section deletion: This will remove the section (coming soon)');
                break;
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
        document.getElementById('violet-status').textContent = message;
    }
    
    function updateSaveButton() {
        const saveButton = document.getElementById('violet-save-all');
        const changeCount = Object.keys(pendingChanges).length;
        
        if (changeCount > 0) {
            saveButton.style.backgroundColor = '#e74c3c';
            saveButton.style.color = 'white';
            saveButton.textContent = `Save Changes (${changeCount})`;
        } else {
            saveButton.style.backgroundColor = '';
            saveButton.style.color = '';
            saveButton.textContent = 'Save All Changes';
        }
    }
    
    function saveAllChanges() {
        if (Object.keys(pendingChanges).length === 0) {
            updateStatus('No changes to save');
            return;
        }
        
        updateStatus('💾 Saving changes...');
        
        // Convert pending changes to the format expected by the API
        const changes = Object.entries(pendingChanges).map(([field, value]) => ({
            field_name: field,
            field_value: value
        }));
        
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
                updateStatus('✅ All changes saved successfully!');
                
                // Notify React app of successful save
                const iframe = document.getElementById('violet-site-iframe');
                iframe.contentWindow.postMessage({
                    type: 'violet-content-saved',
                    savedFields: data
                }, '*');
                
                // Auto-refresh content after a delay
                setTimeout(() => {
                    iframe.contentWindow.postMessage({
                        type: 'violet-refresh-content'
                    }, '*');
                }, 1000);
                
            } else {
                updateStatus('❌ Save failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Save failed:', error);
            updateStatus('❌ Save failed: Network error');
        });
    }
    </script>
    
    <?php
    // Enqueue WordPress media library for image uploads
    wp_enqueue_media();
}

function violet_render_settings_page() {
    if (isset($_POST['save_settings'])) {
        update_option('violet_netlify_url', esc_url_raw($_POST['netlify_url']));
        update_option('violet_netlify_hook_url', esc_url_raw($_POST['netlify_hook_url']));
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }
    
    $netlify_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    $netlify_hook_url = get_option('violet_netlify_hook_url', '');
    ?>
    <div class="wrap">
        <h1>Universal Editor Settings</h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th>Netlify Site URL</th>
                    <td>
                        <input type="url" name="netlify_url" value="<?php echo esc_attr($netlify_url); ?>" class="regular-text" required />
                        <p class="description">Your React app's Netlify URL (e.g., https://your-site.netlify.app)</p>
                    </td>
                </tr>
                <tr>
                    <th>Netlify Build Hook URL (Optional)</th>
                    <td>
                        <input type="url" name="netlify_hook_url" value="<?php echo esc_attr($netlify_hook_url); ?>" class="regular-text" />
                        <p class="description">Netlify build hook URL for automatic rebuilds after content changes</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Settings', 'primary', 'save_settings'); ?>
        </form>
        
        <hr>
        
        <h2>System Status</h2>
        <table class="form-table">
            <tr>
                <th>Content API</th>
                <td>
                    <a href="<?php echo home_url('/wp-json/violet/v1/content'); ?>" target="_blank" class="button button-secondary">
                        Test Content API
                    </a>
                </td>
            </tr>
            <tr>
                <th>Total Content Fields</th>
                <td><?php echo count(get_option('violet_all_content', [])); ?> fields stored</td>
            </tr>
            <tr>
                <th>WordPress Version</th>
                <td><?php echo get_bloginfo('version'); ?></td>
            </tr>
        </table>
    </div>
    <?php
}

// ==============================================
// ADDITIONAL HELPER FUNCTIONS
// ==============================================

// Helper function to get content with fallback
function violet_get_content($field, $default = '') {
    $content = get_option('violet_all_content', array());
    return isset($content[$field]) ? $content[$field] : $default;
}

// Helper function to update single content field
function violet_update_content($field, $value) {
    $content = get_option('violet_all_content', array());
    $content[$field] = $value;
    update_option('violet_all_content', $content);
    wp_cache_flush();
    return true;
}

// Helper function for theme developers
function violet_content($field, $default = '', $echo = true) {
    $value = violet_get_content($field, $default);
    if ($echo) {
        echo esc_html($value);
    }
    return $value;
}

/**
 * INSTALLATION INSTRUCTIONS:
 * 
 * 1. BACKUP your current functions.php file!
 * 
 * 2. Add this code to the END of your existing functions.php file
 *    (after your existing Violet API code)
 * 
 * 3. Go to WordPress Admin → Universal Editor
 * 
 * 4. Test the enhanced editing interface
 * 
 * 5. Click "Enable Universal Editing" and test editing different elements
 */
?>
