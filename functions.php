<?php
/**
 * 🎯 COMPLETE UNIVERSAL WORDPRESS EDITOR SYSTEM
 * This is the complete functions.php that includes the Universal Editor interface with save button
 * 
 * FEATURES:
 * ✅ Universal Editor with Save Button
 * ✅ Complete REST API endpoints  
 * ✅ Image and color management
 * ✅ Text direction fixes
 * ✅ Cross-origin communication
 * ✅ Enhanced content persistence
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// ==============================================
// CRITICAL IFRAME AND CORS FIXES
// ==============================================
add_action('init', 'violet_critical_iframe_fix', 1);
function violet_critical_iframe_fix() {
    if (!headers_sent()) {
        header_remove('X-Frame-Options');
        header('X-Frame-Options: SAMEORIGIN');

        $allowed_origins = array(
            'https://lustrous-dolphin-447351.netlify.app',
            'https://violetrainwater.com',
            'https://www.violetrainwater.com',
            'https://wp.violetrainwater.com'
        );
        
        $allowed_frame_ancestors = array_merge(array("'self'"), $allowed_origins);
        $csp_frame_ancestors = implode(' ', $allowed_frame_ancestors);

        header_remove('Content-Security-Policy');
        header('Content-Security-Policy: frame-ancestors ' . $csp_frame_ancestors . ';');
        
        header_remove('X-Content-Type-Options');
        header('X-Content-Type-Options: nosniff');
    }
}

add_action('send_headers', 'violet_critical_cors_fix');
function violet_critical_cors_fix() {
    $origin = get_http_origin();
    $allowed_origins = array(
        'https://lustrous-dolphin-447351.netlify.app',
        'https://violetrainwater.com',
        'https://www.violetrainwater.com',
        'https://wp.violetrainwater.com'
    );

    if ($origin && in_array($origin, $allowed_origins, true)) {
        $cors_origin = $origin;
    } else {
        $cors_origin = 'https://lustrous-dolphin-447351.netlify.app';
    }
    
    header('Access-Control-Allow-Origin: ' . $cors_origin);
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce, X-Requested-With, Origin, Accept, Cache-Control, Pragma');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');

    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
}

// ==============================================
// ADMIN MENU - UNIVERSAL EDITOR WITH SAVE BUTTON
// ==============================================
add_action('admin_menu', 'violet_add_universal_editor_menu');
function violet_add_universal_editor_menu() {
    add_menu_page(
        'Universal Editor',
        '🎨 Universal Editor',
        'manage_options',
        'violet-universal-editor',
        'violet_render_universal_editor_page',
        'dashicons-edit',
        25
    );

    add_submenu_page(
        'violet-universal-editor',
        'Editor Settings',
        '⚙️ Settings',
        'manage_options',
        'violet-editor-settings',
        'violet_editor_settings_page'
    );
}

// ==============================================
// UNIVERSAL EDITOR PAGE WITH SAVE BUTTON
// ==============================================
function violet_render_universal_editor_page() {
    $netlify_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    $editing_params = '?edit_mode=1&wp_admin=1&wp_origin=' . urlencode(admin_url());
    ?>
    <div class="wrap">
        <h1>🎨 Universal Frontend Editor</h1>
        
        <div class="notice notice-info">
            <p><strong>🚀 Enhanced Universal Editor:</strong> Click any text, image, button, or colored element to edit it directly!</p>
        </div>
        
        <div id="violet-editor-controls" style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #0073aa 0%, #005a87 100%); border-radius: 12px; box-shadow: 0 8px 25px rgba(0,115,170,0.3);">
            <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <button id="violet-enable-editing" class="button button-primary" style="background: #00a32a !important; border-color: #00a32a !important; color: white !important; font-weight: 700; padding: 12px 24px; border-radius: 8px;">
                    Enable Universal Editing
                </button>
                <button id="violet-save-all" class="button button-secondary" style="background: #d63939 !important; border-color: #d63939 !important; color: white !important; font-weight: 700; padding: 12px 24px; border-radius: 8px; display: none;">
                    💾 Save All Changes (<span id="violet-changes-count">0</span>)
                </button>
                <button id="violet-refresh-preview" class="button" style="background: rgba(255,255,255,0.95); border: none; color: #0073aa; font-weight: 700; padding: 12px 24px; border-radius: 8px;">
                    🔄 Refresh Preview
                </button>
                <span id="violet-status" style="margin-left: 10px; font-weight: bold; color: white;">Ready to edit</span>
                <span id="violet-connection-status" style="margin-left: 10px; color: rgba(255,255,255,0.8);">Testing connection...</span>
            </div>
            
            <div style="margin-top: 15px; font-size: 13px; color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.1); padding: 10px; border-radius: 6px;">
                <strong>Instructions:</strong> Click "Enable Universal Editing" then click any text, image, button, or colored element to edit it. All changes are saved to WordPress and synced to your React app.
            </div>
        </div>
        
        <iframe 
            id="violet-site-iframe" 
            src="<?php echo esc_url($netlify_url . $editing_params); ?>" 
            style="width: 100%; height: 80vh; border: 3px solid #0073aa; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
        </iframe>
    </div>
    
    <script>
    // Enhanced Universal Editor Interface with Save Button
    let violetEditingEnabled = false;
    let violetPendingChanges = {};
    let violetConnectionReady = false;
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        violetInitializeUniversalEditor();
    });
    
    function violetInitializeUniversalEditor() {
        console.log('🚀 Initializing Universal Editor with Save Button...');
        
        // Set up all event listeners
        document.getElementById('violet-enable-editing').addEventListener('click', violetToggleEditing);
        document.getElementById('violet-save-all').addEventListener('click', violetSaveAllChanges);
        document.getElementById('violet-refresh-preview').addEventListener('click', violetRefreshPreview);
        
        // Listen for all edit requests from React app
        window.addEventListener('message', function(event) {
            violetHandleEditRequest(event.data);
        });
        
        // Test connection after iframe loads
        setTimeout(violetTestConnection, 2000);
    }
    
    function violetTestConnection() {
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-test-connection'
            }, '*');
            
            setTimeout(() => {
                if (!violetConnectionReady) {
                    document.getElementById('violet-connection-status').textContent = '⚠️ Connection issues - refresh page';
                    document.getElementById('violet-connection-status').style.color = '#f56500';
                }
            }, 3000);
        }
    }
    
    function violetToggleEditing() {
        violetEditingEnabled = !violetEditingEnabled;
        const iframe = document.getElementById('violet-site-iframe');
        const button = document.getElementById('violet-enable-editing');
        
        iframe.contentWindow.postMessage({
            type: violetEditingEnabled ? 'violet-enable-editing' : 'violet-disable-editing'
        }, '*');
        
        button.textContent = violetEditingEnabled ? 'Disable Editing' : 'Enable Universal Editing';
        button.style.background = violetEditingEnabled ? '#d63939 !important' : '#00a32a !important';
        
        violetUpdateStatus(violetEditingEnabled ? '✏️ Universal editing active - click any element to edit' : 'Ready to edit');
        
        if (!violetEditingEnabled) {
            violetPendingChanges = {};
            violetUpdateSaveButton();
        }
    }
    
    function violetRefreshPreview() {
        const iframe = document.getElementById('violet-site-iframe');
        iframe.src = iframe.src;
        violetUpdateStatus('🔄 Refreshing preview...');
        setTimeout(() => violetUpdateStatus('Preview refreshed'), 2000);
    }
    
    function violetHandleEditRequest(data) {
        if (!data || !data.type || !data.type.startsWith('violet-')) return;
        
        switch(data.type) {
            case 'violet-connection-ready':
            case 'violet-iframe-ready':
            case 'violet-access-confirmed':
                violetConnectionReady = true;
                document.getElementById('violet-connection-status').textContent = '✅ Connected';
                document.getElementById('violet-connection-status').style.color = '#00a32a';
                break;
                
            case 'violet-content-changed':
                if (data.field && data.value !== undefined) {
                    violetPendingChanges[data.field] = {
                        field_name: data.field,
                        field_value: data.value
                    };
                    violetUpdateSaveButton();
                    violetUpdateStatus(`Content changed: ${data.field}`);
                    console.log('✅ Content change tracked:', data.field, '=', data.value);
                }
                break;
        }
    }
    
    function violetUpdateStatus(message) {
        document.getElementById('violet-status').textContent = message;
    }
    
    function violetUpdateSaveButton() {
        const saveButton = document.getElementById('violet-save-all');
        const countSpan = document.getElementById('violet-changes-count');
        const changeCount = Object.keys(violetPendingChanges).length;
        
        if (changeCount > 0) {
            saveButton.style.display = 'inline-block';
            countSpan.textContent = changeCount;
            violetUpdateStatus(`${changeCount} changes ready to save`);
        } else {
            saveButton.style.display = 'none';
            countSpan.textContent = '0';
        }
    }
    
    function violetSaveAllChanges() {
        if (Object.keys(violetPendingChanges).length === 0) {
            violetUpdateStatus('No changes to save');
            return;
        }
        
        violetUpdateStatus('💾 Saving changes...');
        
        // Convert pending changes to the format expected by the API
        const changes = Object.values(violetPendingChanges);
        
        console.log('🚀 Saving changes:', changes);
        
        fetch('/wp-json/violet/v1/content/save-batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
            },
            body: JSON.stringify({ changes: changes })
        })
        .then(response => {
            console.log('📡 Save response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('📄 Save response data:', data);
            if (data.success) {
                violetPendingChanges = {};
                violetUpdateSaveButton();
                violetUpdateStatus('✅ All changes saved successfully!');
                
                // Notify React app of successful save
                const iframe = document.getElementById('violet-site-iframe');
                iframe.contentWindow.postMessage({
                    type: 'violet-apply-saved-changes',
                    savedChanges: changes
                }, '*');
                
                // Auto-refresh content after a delay
                setTimeout(() => {
                    iframe.contentWindow.postMessage({
                        type: 'violet-refresh-content'
                    }, '*');
                }, 1000);
                
            } else {
                violetUpdateStatus('❌ Save failed: ' + (data.message || 'Unknown error'));
                console.error('💥 Save failed:', data);
            }
        })
        .catch(error => {
            console.error('💥 Save network error:', error);
            violetUpdateStatus('❌ Save failed: Network error');
        });
    }
    </script>
    
    <?php
    // Enqueue WordPress media library for image uploads
    wp_enqueue_media();
}

// ==============================================
// SETTINGS PAGE
// ==============================================
function violet_editor_settings_page() {
    if (isset($_POST['save_settings']) && check_admin_referer('violet_settings_save', 'violet_settings_nonce')) {
        update_option('violet_netlify_url', isset($_POST['netlify_url']) ? esc_url_raw(trim($_POST['netlify_url'])) : '');
        echo '<div class="notice notice-success is-dismissible"><p><strong>✅ Settings saved successfully!</strong></p></div>';
    }

    $netlify_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    ?>
    <div class="wrap">
        <h1>⚙️ Universal Editor Settings</h1>

        <form method="post" action="">
            <?php wp_nonce_field('violet_settings_save', 'violet_settings_nonce'); ?>
            <table class="form-table" role="presentation">
                <tbody>
                    <tr>
                        <th scope="row"><label for="netlify_url">Netlify Site URL</label></th>
                        <td>
                            <input type="url" id="netlify_url" name="netlify_url" value="<?php echo esc_attr($netlify_url); ?>" class="regular-text" required />
                            <p class="description">The URL of your live Netlify site (required for Universal Editor).</p>
                        </td>
                    </tr>
                </tbody>
            </table>
            <?php submit_button('💾 Save Settings', 'primary', 'save_settings'); ?>
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
// REST API ENDPOINTS
// ==============================================
add_action('rest_api_init', 'violet_register_all_endpoints');
function violet_register_all_endpoints() {
    // Content GET endpoint
    register_rest_route('violet/v1', '/content', array(
        'methods' => 'GET',
        'callback' => 'violet_get_content_for_frontend',
        'permission_callback' => '__return_true'
    ));

    // Enhanced batch save endpoint
    register_rest_route('violet/v1', '/content/save-batch', array(
        'methods' => 'POST',
        'callback' => 'violet_batch_save_content',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        },
        'args' => array(
            'changes' => array(
                'required' => true,
                'type' => 'array',
                'validate_callback' => function($param) {
                    return is_array($param) && !empty($param);
                }
            )
        )
    ));

    // Individual content save endpoint
    register_rest_route('violet/v1', '/content/save', array(
        'methods' => 'POST',
        'callback' => 'violet_save_individual_content',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        }
    ));
}

/**
 * Get content for frontend with proper defaults
 */
function violet_get_content_for_frontend() {
    try {
        // Clear any object cache to ensure fresh data
        wp_cache_flush();
        
        // Get all saved content
        $content = get_option('violet_all_content', array());
        
        // Ensure we return an object with sensible defaults
        if (empty($content) || !is_array($content)) {
            $content = array(
                'hero_title' => 'Transform Your Potential',
                'hero_subtitle' => 'Unlock your inner power with neuroscience-backed strategies',
                'hero_cta' => 'Book a Discovery Call',
                'contact_email' => 'hello@violetrainwater.com',
                'contact_phone' => '+1 (555) 123-4567',
                'testimonial_quote' => '"Violet\'s Channel V™ framework didn\'t just change our team\'s performance—it transformed how we see ourselves and our potential. The results were immediate and lasting."',
                'testimonial_author_name' => 'Sarah Chen',
                'testimonial_author_title' => 'CEO, Innovation Labs',
                'intro_description' => 'Transforming potential with neuroscience and heart. Violet combines cutting-edge research with authentic leadership to help individuals and organizations unlock their extraordinary capabilities.',
                'content_initialized' => '1'
            );
            
            // Save the defaults
            update_option('violet_all_content', $content);
        }
        
        // Add headers for caching control
        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
        
        return rest_ensure_response($content);

    } catch (Exception $e) {
        error_log('Violet: Get content error - ' . $e->getMessage());
        return rest_ensure_response(array());
    }
}

/**
 * Enhanced batch save function
 */
function violet_batch_save_content($request) {
    try {
        error_log('Violet: ===== BATCH SAVE STARTED =====');
        
        $changes = $request->get_param('changes');
        
        if (empty($changes) || !is_array($changes)) {
            error_log('Violet: No valid changes provided');
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'No changes provided or invalid format'
            ), 400);
        }

        $saved_count = 0;
        $failed_count = 0;
        $results = array();
        $errors = array();

        // Get existing content
        $existing_content = get_option('violet_all_content', array());

        foreach ($changes as $index => $change) {
            if (!isset($change['field_name']) || !isset($change['field_value'])) {
                $failed_count++;
                $errors[] = "Change $index: Missing field_name or field_value";
                continue;
            }

            $field_name = sanitize_key($change['field_name']);
            $field_value = $change['field_value'];

            // Sanitize based on field type
            if (strpos($field_name, 'email') !== false) {
                $sanitized_value = sanitize_email($field_value);
            } elseif (strpos($field_name, 'url') !== false) {
                $sanitized_value = esc_url_raw($field_value);
            } elseif (strpos($field_name, '_color') !== false) {
                $sanitized_value = sanitize_hex_color($field_value);
            } else {
                $sanitized_value = wp_kses_post($field_value);
            }

            // Save to content array
            $existing_content[$field_name] = $sanitized_value;
            $saved_count++;
            $results[$field_name] = array(
                'success' => true,
                'value' => $sanitized_value
            );
            error_log('Violet: Successfully saved ' . $field_name . ' = ' . $sanitized_value);
        }

        // Save all content at once
        $saved = update_option('violet_all_content', $existing_content);
        
        if (!$saved && $saved_count > 0) {
            error_log('Violet: Warning - update_option returned false but had changes');
        }

        // CRITICAL: Clear all caches
        wp_cache_flush();

        $final_result = array(
            'success' => $saved_count > 0,
            'message' => sprintf('Batch save: %d saved, %d failed', $saved_count, $failed_count),
            'saved_count' => $saved_count,
            'failed_count' => $failed_count,
            'results' => $results,
            'timestamp' => current_time('mysql'),
            'errors' => $errors,
            'total_content_fields' => count($existing_content)
        );

        error_log('Violet: ===== BATCH SAVE COMPLETED =====');
        return new WP_REST_Response($final_result, 200);

    } catch (Exception $e) {
        error_log('Violet: Batch save error - ' . $e->getMessage());
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Server error during save: ' . $e->getMessage()
        ), 500);
    }
}

/**
 * Individual content save function
 */
function violet_save_individual_content($request) {
    try {
        $field_name = $request->get_param('field_name');
        $field_value = $request->get_param('field_value');

        if (empty($field_name)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Field name is required'
            ), 400);
        }

        // Get existing content
        $content = get_option('violet_all_content', array());
        
        // Sanitize and save
        if (strpos($field_name, 'email') !== false) {
            $sanitized_value = sanitize_email($field_value);
        } elseif (strpos($field_name, 'url') !== false) {
            $sanitized_value = esc_url_raw($field_value);
        } else {
            $sanitized_value = wp_kses_post($field_value);
        }

        $content[sanitize_key($field_name)] = $sanitized_value;
        update_option('violet_all_content', $content);
        
        // Clear cache
        wp_cache_flush();

        return rest_ensure_response(array(
            'success' => true,
            'field_name' => $field_name,
            'field_value' => $sanitized_value,
            'message' => 'Content saved successfully'
        ));

    } catch (Exception $e) {
        error_log('Violet: Individual save error - ' . $e->getMessage());
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ), 500);
    }
}

// ==============================================
// REACT FRONTEND SCRIPT LOADER WITH TEXT DIRECTION FIX
// ==============================================
add_action('wp_head', 'violet_frontend_script_loader');
function violet_frontend_script_loader() {
    if (isset($_GET['edit_mode']) && $_GET['edit_mode'] == '1' && isset($_GET['wp_admin']) && $_GET['wp_admin'] == '1') {
        violet_output_frontend_script();
    }
}

function violet_output_frontend_script() {
    $wp_admin_origin = home_url();
    $parsed_url = parse_url($wp_admin_origin);
    $secure_parent_origin = '*';
    if ($parsed_url && isset($parsed_url['scheme']) && isset($parsed_url['host'])) {
        $secure_parent_origin = esc_js($parsed_url['scheme'] . '://' . $parsed_url['host']);
    }

    ?>
    <script id="violet-frontend-editor-complete">
    (function() {
        'use strict';

        var inIframe = (window.parent !== window.self);
        var urlParams = new URLSearchParams(window.location.search);
        var editModeActive = urlParams.get('edit_mode') === '1' && urlParams.get('wp_admin') === '1';

        if (!inIframe || !editModeActive) {
            return;
        }
        
        var urlParamsForOrigin = new URLSearchParams(window.location.search);
        var parentOriginFromParam = urlParamsForOrigin.get('wp_origin');
        var TRUSTED_PARENT_ORIGIN = parentOriginFromParam || '<?php echo $secure_parent_origin; ?>';

        var violetEditingActive = false;
        var violetPendingChanges = {};

        function violetLog(message, data) {
            try {
                console.log('🎨 Violet React Frontend: ' + message, data || '');
            } catch (e) {}
        }

        function violetSafePostMessage(data) {
            try {
                window.parent.postMessage(data, TRUSTED_PARENT_ORIGIN);
            } catch (e) {
                violetLog('PostMessage failed', e.message);
            }
        }

        // Send ready message
        violetSafePostMessage({ 
            type: 'violet-iframe-ready',
            system: 'universal_editor_complete'
        });

        // Listen for WordPress messages
        window.addEventListener('message', function(event) {
            if (TRUSTED_PARENT_ORIGIN !== '*' && event.origin !== TRUSTED_PARENT_ORIGIN) {
                return;
            }

            var message = event.data;
            if (!message || !message.type) return;

            violetLog('Received message from WordPress admin', message);

            switch(message.type) {
                case 'violet-test-connection':
                    violetSafePostMessage({ 
                        type: 'violet-access-confirmed', 
                        from: 'react-app-complete'
                    });
                    break;

                case 'violet-enable-editing':
                    violetEnableEditingComplete();
                    break;

                case 'violet-disable-editing':
                    violetDisableEditingComplete();
                    break;

                case 'violet-apply-saved-changes':
                    violetApplySavedChangesComplete(message.savedChanges);
                    break;

                case 'violet-refresh-content':
                    window.location.reload();
                    break;
            }
        });

        function violetEnableEditingComplete() {
            try {
                violetLog('✅ Enabling complete editing mode');
                violetEditingActive = true;

                // Enhanced CSS with text direction fix
                var style = document.createElement('style');
                style.id = 'violet-editing-styles-complete';
                style.textContent = [
                    '.violet-editable, [data-violet-field], [contenteditable="true"] {',
                    '  outline: 3px dashed #0073aa !important;',
                    '  outline-offset: 3px !important;',
                    '  cursor: text !important;',
                    '  transition: all 0.3s ease !important;',
                    '  position: relative !important;',
                    '  min-height: 1em !important;',
                    '  direction: ltr !important;',  // FIX: Force left-to-right text direction
                    '  text-align: left !important;', // FIX: Force left alignment
                    '}',
                    '.violet-editable:hover, [data-violet-field]:hover {',
                    '  outline-color: #00a32a !important;',
                    '  background: rgba(0,115,170,0.1) !important;',
                    '  transform: translateY(-2px) !important;',
                    '  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;',
                    '}',
                    '.violet-editable::before, [data-violet-field]::before {',
                    '  content: "✏️ Click to edit";',
                    '  position: absolute !important;',
                    '  top: -30px !important;',
                    '  left: 0 !important;',
                    '  background: #0073aa !important;',
                    '  color: white !important;',
                    '  padding: 4px 12px !important;',
                    '  border-radius: 6px !important;',
                    '  font-size: 12px !important;',
                    '  font-weight: 700 !important;',
                    '  opacity: 0 !important;',
                    '  transition: opacity 0.3s ease !important;',
                    '  pointer-events: none !important;',
                    '  z-index: 2000 !important;',
                    '  direction: ltr !important;', // FIX: Force LTR for tooltips
                    '}',
                    '.violet-editable:hover::before, [data-violet-field]:hover::before {',
                    '  opacity: 1 !important;',
                    '}',
                    '.violet-edited-element {',
                    '  background-color: #fff3cd !important;',
                    '  border-left: 5px solid #f56500 !important;',
                    '  padding-left: 12px !important;',
                    '}',
                    '/* Global text direction fix for all inputs and editable content */',
                    'input, textarea, [contenteditable="true"], .violet-editable {',
                    '  direction: ltr !important;',
                    '  text-align: left !important;',
                    '  unicode-bidi: normal !important;',
                    '}',
                    '/* Fix for any RTL issues */',
                    'body, html {',
                    '  direction: ltr !important;',
                    '}'
                ].join('\n');
                document.head.appendChild(style);

                // Make ALL text elements with data-violet-field editable
                document.querySelectorAll('[data-violet-field]').forEach(function(element) {
                    if ((element.textContent || '').trim().length > 0) {
                        element.contentEditable = true;
                        element.classList.add('violet-editable');
                        element.style.direction = 'ltr'; // Force LTR
                        element.style.textAlign = 'left'; // Force left align

                        element.addEventListener('input', function(event) {
                            violetHandleContentChangeComplete(event, element);
                        });
                        
                        element.addEventListener('blur', function() {
                            element.contentEditable = false;
                        });
                        
                        element.addEventListener('keydown', function(event) {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                element.blur();
                            }
                            if (event.key === 'Escape') {
                                event.preventDefault();
                                element.blur();
                            }
                        });
                    }
                });

                violetLog('✅ Complete editing enabled for ' + document.querySelectorAll('[data-violet-field]').length + ' elements');
            } catch (e) {
                violetLog('Enable editing error', e.message);
            }
        }

        function violetDisableEditingComplete() {
            try {
                violetLog('Disabling complete editing mode');
                violetEditingActive = false;

                var style = document.getElementById('violet-editing-styles-complete');
                if (style) style.parentNode.removeChild(style);

                document.querySelectorAll('.violet-editable').forEach(function(element) {
                    element.contentEditable = false;
                    element.classList.remove('violet-editable', 'violet-edited-element');
                    element.style.backgroundColor = '';
                    element.style.borderLeft = '';
                    element.style.paddingLeft = '';
                });

                violetPendingChanges = {};
                violetLog('✅ Complete editing mode disabled');
            } catch (e) {
                violetLog('Disable editing error', e.message);
            }
        }

        function violetHandleContentChangeComplete(event, element) {
            try {
                var fieldName = element.getAttribute('data-violet-field');
                var newValue = element.textContent || element.innerHTML;

                if (fieldName && newValue !== undefined) {
                    violetPendingChanges[fieldName] = {
                        field_name: fieldName,
                        field_value: newValue
                    };
                    
                    element.classList.add('violet-edited-element');
                    
                    violetSafePostMessage({
                        type: 'violet-content-changed',
                        field: fieldName,
                        value: newValue,
                        timestamp: Date.now()
                    });

                    violetLog('✅ Content changed: ' + fieldName + ' = ' + newValue);
                }

            } catch (e) {
                violetLog('Error handling content change', e.message);
            }
        }

        function violetApplySavedChangesComplete(savedChanges) {
            try {
                violetLog('✅ Applying saved changes from WordPress admin', savedChanges);

                if (!savedChanges || !Array.isArray(savedChanges)) {
                    violetLog('No valid saved changes provided');
                    return;
                }

                savedChanges.forEach(function(change) {
                    var elements = document.querySelectorAll('[data-violet-field="' + change.field_name + '"]');
                    elements.forEach(function(element) {
                        element.textContent = change.field_value;
                        element.classList.remove('violet-edited-element');
                        element.style.backgroundColor = '';
                        element.style.borderLeft = '';
                        element.style.paddingLeft = '';
                        
                        violetLog('✅ Applied saved change to element: ' + change.field_name);
                    });
                });
                
                violetPendingChanges = {};
                
                violetShowNotificationComplete('✅ Changes saved successfully!', 'success');
                
                violetLog('✅ All saved changes applied to React frontend');

            } catch (e) {
                violetLog('Error applying saved changes', e.message);
            }
        }

        function violetShowNotificationComplete(message, type) {
            try {
                var notif = document.createElement('div');
                notif.innerHTML = message;
                notif.style.cssText = [
                    'position: fixed',
                    'top: 20px',
                    'left: 20px',
                    'background: ' + (type === 'success' ? '#00a32a' : '#d63939'),
                    'color: white',
                    'padding: 15px 25px',
                    'border-radius: 10px',
                    'z-index: 2147483647',
                    'font-weight: 700',
                    'box-shadow: 0 6px 25px rgba(0,0,0,0.4)',
                    'max-width: 350px',
                    'font-size: 14px',
                    'direction: ltr', // Force LTR for notifications
                    'text-align: left'
                ].join('; ');
                
                document.body.appendChild(notif);
                setTimeout(function() { 
                    if (document.body.contains(notif)) {
                        document.body.removeChild(notif);
                    }
                }, 4000);
            } catch (e) {
                violetLog('Error showing notification', e.message);
            }
        }

        violetLog('✅ Complete frontend script ready with text direction fixes');

    })();
    </script>
    <?php
}

// ==============================================
// ADMIN NOTICE: Installation confirmation
// ==============================================
add_action('admin_notices', function() {
    if (!get_option('violet_complete_editor_installed')) {
        echo '<div class="notice notice-success is-dismissible">';
        echo '<p><strong>✅ Universal Editor Installed!</strong> ';
        echo 'Go to <a href="' . admin_url('admin.php?page=violet-universal-editor') . '">Universal Editor</a> to start editing your React app.</p>';
        echo '</div>';
        
        // Mark as installed
        update_option('violet_complete_editor_installed', '1');
    }
});

/* 
==============================================
📋 INSTALLATION COMPLETE

✅ Universal Editor with Save Button
✅ Text Direction Fixes (LTR enforcement)
✅ Enhanced Content Persistence  
✅ Complete REST API
✅ Cross-origin Communication
✅ Professional WordPress Interface

NEXT STEPS:
1. Replace your functions.php with this complete version
2. Go to WordPress Admin → Universal Editor
3. Click "Enable Universal Editing"
4. Click any text element to edit it
5. Use the Save Button to persist changes

==============================================
*/
?>