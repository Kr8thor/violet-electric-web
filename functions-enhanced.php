<?php
/**
 * 🎯 UNIVERSAL WORDPRESS-REACT EDITING SYSTEM
 * Enhanced functions.php with universal editing capabilities
 * 
 * Location: wp.violetrainwater.com → wp-admin → Appearance → Theme Editor → functions.php
 * OR: Via FTP/cPanel at: /wp-content/themes/your-theme/functions.php
 */

// ==============================================
// CORE CONTENT API ENDPOINTS
// ==============================================

// GET ENDPOINT: Fetch all content for React app
add_action( 'rest_api_init', function () {
    register_rest_route( 'violet/v1', '/content', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true', // Public endpoint
        'callback' => function () {
            // Clear any object cache to ensure fresh data
            wp_cache_flush();
            
            // Get all saved content
            $content = get_option( 'violet_all_content', [] );
            
            // Ensure we return an object with sensible defaults
            if (empty($content) || !is_array($content)) {
                $content = [
                    'hero_title' => 'Transform Your Potential',
                    'hero_subtitle' => 'Unlock your inner power with neuroscience-backed strategies',
                    'hero_subtitle_line2' => 'Change Your Life.',
                    'hero_cta' => 'Book a Discovery Call',
                    'hero_cta_secondary' => 'Watch Violet in Action',
                    'contact_email' => 'hello@violetrainwater.com',
                    'contact_phone' => '+1 (555) 123-4567',
                    'nav_about' => 'About',
                    'nav_keynotes' => 'Keynotes',
                    'nav_testimonials' => 'Testimonials',
                    'nav_contact' => 'Contact',
                    'footer_text' => '© 2025 Violet Electric. All rights reserved.',
                    'content_initialized' => '1'
                ];
                
                // Save the defaults
                update_option('violet_all_content', $content);
            }
            
            // Add headers for caching control
            header('Cache-Control: no-cache, must-revalidate');
            header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
            
            return rest_ensure_response($content);
        }
    ]);
});

// POST ENDPOINT: Save content from React app
add_action( 'rest_api_init', function () {
    register_rest_route( 'violet/v1', '/content', [
        'methods'  => 'POST',
        'permission_callback' => '__return_true', // Public for now
        'callback' => function ( $request ) {
            $data = $request->get_json_params();
            
            if (empty($data) || !is_array($data)) {
                return new WP_Error('invalid_data', 'Invalid content data', ['status' => 400]);
            }
            
            // Get current content
            $current_content = get_option('violet_all_content', []);
            
            // Merge new data with existing content
            $updated_content = array_merge($current_content, $data);
            
            // Save updated content
            $success = update_option('violet_all_content', $updated_content);
            
            if ($success) {
                // Clear any cache
                wp_cache_flush();
                
                return rest_ensure_response([
                    'success' => true,
                    'message' => 'Content saved successfully',
                    'updated_fields' => array_keys($data),
                    'timestamp' => current_time('mysql')
                ]);
            } else {
                return new WP_Error('save_failed', 'Failed to save content', ['status' => 500]);
            }
        }
    ]);
});

// ==============================================
// IMAGE UPLOAD ENDPOINT
// ==============================================

add_action( 'rest_api_init', function () {
    register_rest_route( 'violet/v1', '/upload-image', [
        'methods'  => 'POST',
        'permission_callback' => function() {
            return current_user_can('upload_files');
        },
        'callback' => function ( $request ) {
            $files = $request->get_file_params();
            $params = $request->get_params();
            
            if (empty($files['file'])) {
                return new WP_Error('no_file', 'No file uploaded', ['status' => 400]);
            }
            
            $file = $files['file'];
            $field = $params['field'] ?? 'unknown';
            
            // Handle the file upload
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            require_once(ABSPATH . 'wp-admin/includes/file.php');
            require_once(ABSPATH . 'wp-admin/includes/media.php');
            
            $upload_overrides = ['test_form' => false];
            $movefile = wp_handle_upload($file, $upload_overrides);
            
            if ($movefile && !isset($movefile['error'])) {
                // Create attachment
                $attachment = [
                    'guid'           => $movefile['url'],
                    'post_mime_type' => $movefile['type'],
                    'post_title'     => "Violet Electric - {$field}",
                    'post_content'   => '',
                    'post_status'    => 'inherit'
                ];
                
                $attach_id = wp_insert_attachment($attachment, $movefile['file']);
                
                if ($attach_id) {
                    $attach_data = wp_generate_attachment_metadata($attach_id, $movefile['file']);
                    wp_update_attachment_metadata($attach_id, $attach_data);
                    
                    return rest_ensure_response([
                        'success' => true,
                        'url' => $movefile['url'],
                        'attachment_id' => $attach_id,
                        'field' => $field,
                        'message' => 'Image uploaded successfully'
                    ]);
                }
            }
            
            return new WP_Error('upload_failed', 'File upload failed', ['status' => 500]);
        }
    ]);
});

// ==============================================
// ENHANCED WORDPRESS ADMIN INTERFACE
// ==============================================

// Add admin menu for React editor
add_action('admin_menu', function() {
    add_menu_page(
        '🎨 Edit Frontend',
        '🎨 Edit Frontend', 
        'edit_posts',
        'violet-frontend-editor',
        'violet_render_frontend_editor',
        'dashicons-edit',
        30
    );
    
    add_submenu_page(
        'violet-frontend-editor',
        'Settings',
        'Settings',
        'manage_options',
        'violet-editor-settings',
        'violet_render_editor_settings'
    );
});

// Main editor page
function violet_render_frontend_editor() {
    $iframe_url = 'https://lustrous-dolphin-447351.netlify.app/?edit_mode=1&wp_admin=1&wp_origin=' . urlencode(home_url());
    ?>
    <div class="wrap" style="margin: 0; padding: 0;">
        <div id="violet-editor-toolbar" style="background: #0073aa; color: white; padding: 10px; position: sticky; top: 32px; z-index: 9999;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <h1 style="margin: 0; color: white; font-size: 18px;">🎨 Universal Content Editor</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Click any element below to edit it</p>
                </div>
                
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div id="violet-connection-status" style="padding: 5px 10px; background: rgba(255,255,255,0.2); border-radius: 4px; font-size: 12px;">
                        ⏳ Connecting...
                    </div>
                    
                    <button id="violet-enable-edit-btn" onclick="violetEnableEditing()" 
                            style="padding: 8px 16px; background: #00a32a; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                        ✏️ Enable Edit Mode
                    </button>
                    
                    <button id="violet-save-all-btn" onclick="violetSaveAllChanges()" 
                            style="padding: 8px 16px; background: #d63638; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;" 
                            disabled>
                        💾 Save Changes (<span id="violet-change-count">0</span>)
                    </button>
                    
                    <button onclick="violetRefreshIframe()" 
                            style="padding: 8px 16px; background: transparent; color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; cursor: pointer;">
                        🔄 Refresh
                    </button>
                </div>
            </div>
        </div>
        
        <iframe id="violet-site-iframe" 
                src="<?php echo esc_url($iframe_url); ?>" 
                style="width: 100%; height: calc(100vh - 110px); border: none; display: block;"
                title="Violet Electric Website Editor">
        </iframe>
    </div>

    <script>
    // Enhanced WordPress admin interface
    let violetPendingChanges = {};
    let violetReactAppReady = false;
    let violetEditingEnabled = false;
    
    // Connection status management
    function violetUpdateConnectionStatus(status, message) {
        const statusEl = document.getElementById('violet-connection-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.style.background = status === 'connected' ? 'rgba(0, 163, 42, 0.8)' : 
                                      status === 'error' ? 'rgba(214, 54, 56, 0.8)' : 
                                      'rgba(255, 255, 255, 0.2)';
        }
    }
    
    // Enable editing mode
    function violetEnableEditing() {
        if (!violetReactAppReady) {
            alert('Please wait for the React app to finish loading.');
            return;
        }
        
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-enable-editing',
                timestamp: Date.now()
            }, '*');
            
            violetEditingEnabled = true;
            violetUpdateEditButton();
            console.log('✏️ Edit mode enabled');
        }
    }
    
    // Update edit button state
    function violetUpdateEditButton() {
        const editBtn = document.getElementById('violet-enable-edit-btn');
        if (editBtn) {
            if (violetEditingEnabled) {
                editBtn.textContent = '🚫 Disable Edit Mode';
                editBtn.onclick = violetDisableEditing;
                editBtn.style.background = '#d63638';
            } else {
                editBtn.textContent = '✏️ Enable Edit Mode';
                editBtn.onclick = violetEnableEditing;
                editBtn.style.background = '#00a32a';
            }
        }
    }
    
    // Disable editing mode
    function violetDisableEditing() {
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-disable-editing',
                timestamp: Date.now()
            }, '*');
            
            violetEditingEnabled = false;
            violetUpdateEditButton();
            console.log('🚫 Edit mode disabled');
        }
    }
    
    // Save all changes
    async function violetSaveAllChanges() {
        if (Object.keys(violetPendingChanges).length === 0) {
            alert('No changes to save.');
            return;
        }
        
        try {
            violetUpdateSaveButton('saving');
            
            console.log('💾 Saving changes to WordPress:', violetPendingChanges);
            
            // Send save request to React app
            const iframe = document.getElementById('violet-site-iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'violet-save-all-changes',
                    changes: violetPendingChanges,
                    timestamp: Date.now()
                }, '*');
            }
            
            // Also save directly to WordPress
            const response = await fetch('/wp-json/violet/v1/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(violetPendingChanges)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ WordPress save successful:', result);
                
                // Clear pending changes
                violetPendingChanges = {};
                violetUpdateSaveButton('success');
                
                // Notify React app of successful save
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'violet-save-completed',
                        success: true,
                        result: result,
                        timestamp: Date.now()
                    }, '*');
                }
                
                setTimeout(() => violetUpdateSaveButton('idle'), 2000);
                
            } else {
                throw new Error(`Save failed: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Save failed:', error);
            alert('Save failed: ' + error.message);
            violetUpdateSaveButton('error');
            setTimeout(() => violetUpdateSaveButton('idle'), 3000);
        }
    }
    
    // Update save button state
    function violetUpdateSaveButton(state = 'idle') {
        const saveBtn = document.getElementById('violet-save-all-btn');
        const countSpan = document.getElementById('violet-change-count');
        
        if (!saveBtn || !countSpan) return;
        
        const changeCount = Object.keys(violetPendingChanges).length;
        countSpan.textContent = changeCount;
        
        switch (state) {
            case 'saving':
                saveBtn.textContent = '⏳ Saving...';
                saveBtn.disabled = true;
                saveBtn.style.background = '#666';
                break;
            case 'success':
                saveBtn.textContent = '✅ Saved!';
                saveBtn.disabled = true;
                saveBtn.style.background = '#00a32a';
                break;
            case 'error':
                saveBtn.textContent = '❌ Error - Retry';
                saveBtn.disabled = false;
                saveBtn.style.background = '#d63638';
                break;
            default: // idle
                saveBtn.textContent = `💾 Save Changes (${changeCount})`;
                saveBtn.disabled = changeCount === 0;
                saveBtn.style.background = changeCount > 0 ? '#d63638' : '#666';
                break;
        }
    }
    
    // Refresh iframe
    function violetRefreshIframe() {
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe) {
            iframe.src = iframe.src;
            violetReactAppReady = false;
            violetEditingEnabled = false;
            violetUpdateConnectionStatus('connecting', '⏳ Connecting...');
            violetUpdateEditButton();
        }
    }
    
    // Message handler for React app communication
    window.addEventListener('message', function(event) {
        // Security check
        if (!event.data || typeof event.data !== 'object') return;
        
        switch (event.data.type) {
            case 'violet-iframe-ready':
                console.log('✅ React app ready for editing');
                violetReactAppReady = true;
                violetUpdateConnectionStatus('connected', '✅ Connected');
                break;
                
            case 'violet-content-changed':
                console.log('📝 Content changed:', event.data.field, '=', event.data.value);
                violetPendingChanges[event.data.field] = event.data.value;
                violetUpdateSaveButton();
                break;
                
            case 'violet-save-completed':
                console.log('💾 Save completed in React app');
                break;
                
            default:
                // Handle other violet messages
                if (event.data.type && event.data.type.startsWith('violet-')) {
                    console.log('📨 Received message:', event.data.type);
                }
                break;
        }
    });
    
    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        violetUpdateSaveButton();
        violetUpdateConnectionStatus('connecting', '⏳ Connecting...');
        
        // Set up periodic connection check
        setInterval(function() {
            if (!violetReactAppReady) {
                const iframe = document.getElementById('violet-site-iframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'violet-test-access',
                        timestamp: Date.now()
                    }, '*');
                }
            }
        }, 5000);
    });
    </script>
    <?php
}

// Settings page
function violet_render_editor_settings() {
    if ($_POST && wp_verify_nonce($_POST['_wpnonce'], 'violet_settings')) {
        update_option('violet_netlify_url', sanitize_url($_POST['netlify_url']));
        update_option('violet_auto_rebuild', isset($_POST['auto_rebuild']));
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }
    
    $netlify_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    $auto_rebuild = get_option('violet_auto_rebuild', false);
    ?>
    <div class="wrap">
        <h1>🎨 Frontend Editor Settings</h1>
        
        <form method="post">
            <?php wp_nonce_field('violet_settings'); ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row">Netlify Site URL</th>
                    <td>
                        <input type="url" name="netlify_url" value="<?php echo esc_attr($netlify_url); ?>" 
                               class="regular-text" required />
                        <p class="description">The URL of your Netlify-hosted React app</p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">Auto Rebuild</th>
                    <td>
                        <label>
                            <input type="checkbox" name="auto_rebuild" <?php checked($auto_rebuild); ?> />
                            Automatically trigger Netlify rebuild after saving changes
                        </label>
                    </td>
                </tr>
            </table>
            
            <?php submit_button(); ?>
        </form>
        
        <hr>
        
        <h2>System Status</h2>
        <div class="card">
            <h3>Content API Status</h3>
            <p><strong>GET Endpoint:</strong> <a href="/wp-json/violet/v1/content" target="_blank">/wp-json/violet/v1/content</a></p>
            <p><strong>POST Endpoint:</strong> /wp-json/violet/v1/content</p>
            <p><strong>Upload Endpoint:</strong> /wp-json/violet/v1/upload-image</p>
            
            <?php
            $content = get_option('violet_all_content', []);
            echo '<p><strong>Stored Fields:</strong> ' . count($content) . '</p>';
            ?>
        </div>
    </div>
    <?php
}

// ==============================================
// ENHANCED SECURITY & CORS
// ==============================================

// Enable CORS for Netlify
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: https://lustrous-dolphin-447351.netlify.app');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type');
        
        return $value;
    });
});

// Handle OPTIONS requests
add_action('init', function() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Origin: https://lustrous-dolphin-447351.netlify.app');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type');
        exit(0);
    }
});

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

// Clear content cache
function violet_clear_content_cache() {
    wp_cache_flush();
    delete_transient('violet_content_cache');
}

// Debug endpoint
add_action( 'rest_api_init', function () {
    register_rest_route( 'violet/v1', '/debug', [
        'methods'  => 'GET',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
        'callback' => function () {
            return rest_ensure_response([
                'wordpress_version' => get_bloginfo('version'),
                'site_url' => home_url(),
                'rest_url' => get_rest_url(),
                'content_fields' => count(get_option('violet_all_content', [])),
                'timestamp' => current_time('mysql'),
                'user_can_upload' => current_user_can('upload_files'),
                'user_can_edit' => current_user_can('edit_posts')
            ]);
        }
    ]);
});

/**
 * 🎯 SUCCESS CHECKLIST:
 * 
 * 1. ✅ Content API endpoints active
 * 2. ✅ Image upload system ready
 * 3. ✅ Universal editing interface
 * 4. ✅ Enhanced security & CORS
 * 5. ✅ Admin interface improved
 * 6. ✅ Real-time communication
 * 
 * Next: Update React components to use new system
 */
?>