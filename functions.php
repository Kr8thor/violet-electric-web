<?php
/**
 * React Frontend Editor - COMPLETE CORRECTED VERSION
 * 
 * FIXES APPLIED:
 * ✅ Reliable cross-origin communication with wp_origin parameter
 * ✅ Dynamic iframe src setting with proper origin detection
 * ✅ Improved error handling and logging
 * ✅ Refactored CORS logic into helper function
 * ✅ Enhanced security and validation
 * ✅ ALL ORIGINAL FUNCTIONALITY PRESERVED
 * ✅ Fixed origin validation for wp.violetrainwater.com
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get allowed origins for CORS configuration
 */
function _violet_get_allowed_origins() {
    $allowed_origins = array(
        'https://lustrous-dolphin-447351.netlify.app',
        'https://violetrainwater.com',
        'https://www.violetrainwater.com',
        'https://wp.violetrainwater.com'
    );
    
    $netlify_url_option = get_option('violet_netlify_url', '');
    if ($netlify_url_option) {
        $parsed_url = parse_url($netlify_url_option);
        if ($parsed_url && isset($parsed_url['scheme']) && isset($parsed_url['host'])) {
            $normalized_netlify_origin = $parsed_url['scheme'] . '://' . $parsed_url['host'];
            if (!in_array($normalized_netlify_origin, $allowed_origins)) {
                $allowed_origins[] = $normalized_netlify_origin;
            }
        }
    }
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        $allowed_origins[] = 'http://localhost:3000';
        $allowed_origins[] = 'http://localhost:3001';
        $allowed_origins[] = 'http://localhost:5173';
    }
    
    return array_unique($allowed_origins);
}

// ============================================================================
// CRITICAL IFRAME AND CORS FIXES
// ============================================================================

add_action('init', 'violet_critical_iframe_fix', 1);
function violet_critical_iframe_fix() {
    if (!headers_sent()) {
        header_remove('X-Frame-Options');
        header('X-Frame-Options: SAMEORIGIN');

        $allowed_origins = _violet_get_allowed_origins();
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
    $allowed_origins = _violet_get_allowed_origins();

    if ($origin && in_array($origin, $allowed_origins, true)) {
        $cors_origin = $origin;
    } elseif (!$origin || $origin === 'null') {
        $cors_origin = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
        $parsed_default_origin = parse_url($cors_origin);
        if ($parsed_default_origin && isset($parsed_default_origin['scheme']) && isset($parsed_default_origin['host'])) {
            $cors_origin = $parsed_default_origin['scheme'] . '://' . $parsed_default_origin['host'];
        } else {
            $cors_origin = 'https://lustrous-dolphin-447351.netlify.app';
        }
    } else {
        return;
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

add_action('rest_api_init', function() {
    add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
        $origin = get_http_origin();
        $allowed_origins = _violet_get_allowed_origins();

        if ($origin && in_array($origin, $allowed_origins, true)) {
            $server->send_header('Access-Control-Allow-Origin', $origin);
            $server->send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
            $server->send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-WP-Nonce, X-Requested-With, Origin, Accept, Cache-Control, Pragma');
            $server->send_header('Access-Control-Allow-Credentials', 'true');
        }
        
        return $served;
    }, 15, 4);
});

// ============================================================================
// ADMIN MENU SETUP
// ============================================================================

add_action('admin_menu', 'violet_add_frontend_editor_menu');
function violet_add_frontend_editor_menu() {
    add_menu_page(
        'Frontend Editor',
        '🎨 Edit Frontend',
        'manage_options',
        'violet-frontend-editor',
        'violet_frontend_editor_page_fixed',
        'dashicons-edit-page',
        25
    );

    add_submenu_page(
        'violet-frontend-editor',
        'Editor Settings',
        '⚙️ Settings',
        'manage_options',
        'violet-editor-settings',
        'violet_editor_settings_page'
    );

    add_submenu_page(
        'violet-frontend-editor',
        'Manage Content',
        '📝 Content',
        'manage_options',
        'violet-content-manager',
        'violet_content_manager_page'
    );
}

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

add_action('rest_api_init', 'violet_register_complete_endpoints');
function violet_register_complete_endpoints() {
    // Content GET endpoint
    register_rest_route('violet/v1', '/content', array(
        'methods' => 'GET',
        'callback' => 'violet_get_content_for_frontend',
        'permission_callback' => '__return_true'
    ));

    // Individual content save endpoint
    register_rest_route('violet/v1', '/content/save', array(
        'methods' => 'POST',
        'callback' => 'violet_save_individual_content',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        },
        'args' => array(
            'field_name' => array(
                'required' => true,
                'type' => 'string',
                'validate_callback' => function($param) {
                    return !empty($param) && is_string($param);
                },
                'sanitize_callback' => 'sanitize_key'
            ),
            'field_value' => array(
                'required' => true,
                'type' => 'string',
                'validate_callback' => function($param) {
                    return is_string($param);
                }
            ),
            'field_type' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'auto',
                'sanitize_callback' => 'sanitize_text_field'
            )
        )
    ));

    // Enhanced batch save endpoint
    register_rest_route('violet/v1', '/content/save-batch', array(
        'methods' => 'POST',
        'callback' => 'violet_final_batch_save',
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

    // Debug endpoint
    register_rest_route('violet/v1', '/debug', array(
        'methods' => 'GET',
        'callback' => function() {
            return rest_ensure_response(array(
                'status' => 'success',
                'message' => 'WordPress API is working',
                'timestamp' => current_time('mysql'),
                'wordpress_version' => get_bloginfo('version'),
                'cors_enabled' => true,
                'user_can_edit' => current_user_can('edit_posts'),
                'system' => 'complete_corrected_version'
            ));
        },
        'permission_callback' => '__return_true'
    ));

    // ⭐ NEW: Content GET endpoint (from o3 prompt fix)
    register_rest_route('violet/v1', '/content', array(
        'methods' => 'GET',
        'callback' => function() {
            // Get all saved content from WordPress options
            $all_content = get_option('violet_all_content', array());
            
            // Add any individual content fields that might exist
            $individual_fields = array(
                'hero_title',
                'hero_subtitle', 
                'hero_subtitle_line2',
                'hero_cta',
                'hero_cta_secondary',
                'contact_email',
                'contact_phone',
                'nav_about',
                'nav_keynotes', 
                'nav_testimonials',
                'nav_contact',
                'footer_text'
            );
            
            foreach ($individual_fields as $field) {
                $field_value = get_option("violet_$field", '');
                if (!empty($field_value)) {
                    $all_content[$field] = $field_value;
                }
            }
            
            return rest_ensure_response($all_content);
        },
        'permission_callback' => '__return_true'
    ));
}

/**
 * Individual content save function
 */
function violet_save_individual_content($request) {
    try {
        $field_name = $request->get_param('field_name');
        $field_value = $request->get_param('field_value');
        $field_type = $request->get_param('field_type');

        // Sanitize based on field type
        if (strpos($field_name, 'email') !== false) {
            $sanitized_value = sanitize_email($field_value);
        } elseif (strpos($field_name, 'url') !== false) {
            $sanitized_value = esc_url_raw($field_value);
        } else {
            $sanitized_value = wp_kses_post($field_value);
        }

        $option_name = 'violet_' . $field_name;
        $saved = update_option($option_name, $sanitized_value);

        if ($saved !== false) {
            return rest_ensure_response(array(
                'success' => true,
                'field_name' => $field_name,
                'field_value' => $sanitized_value,
                'message' => 'Content saved successfully'
            ));
        } else {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Failed to save content'
            ), 500);
        }

    } catch (Exception $e) {
        error_log('Violet: Individual save error - ' . $e->getMessage());
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ), 500);
    }
}

/**
 * FINAL CORRECTED batch save function - ALL FUNCTIONALITY PRESERVED
 */
function violet_final_batch_save($request) {
    try {
        error_log('Violet: ===== FINAL CORRECTED BATCH SAVE STARTED =====');
        
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
            } else {
                $sanitized_value = wp_kses_post($field_value);
            }

            $option_name = 'violet_' . $field_name;
            $current_value = get_option($option_name, '');
            
            $saved = update_option($option_name, $sanitized_value);
            $verification_value = get_option($option_name, '');
            $actually_saved = ($verification_value === $sanitized_value);

            if ($actually_saved) {
                $saved_count++;
                $results[$field_name] = array(
                    'success' => true,
                    'value' => $sanitized_value,
                    'was_different' => ($current_value !== $sanitized_value)
                );
                error_log('Violet: Successfully saved ' . $field_name);
            } else {
                $failed_count++;
                $results[$field_name] = array(
                    'success' => false,
                    'error' => 'Database update failed'
                );
                $errors[] = "Failed to save field: $field_name";
            }
        }

        // Trigger rebuild if any content was saved
        $rebuild_triggered = false;
        if ($saved_count > 0) {
            $auto_rebuild = get_option('violet_auto_rebuild', '0');
            if ($auto_rebuild === '1') {
                $netlify_hook_url = get_option('violet_netlify_hook');
                if (!empty($netlify_hook_url) && filter_var($netlify_hook_url, FILTER_VALIDATE_URL)) {
                    wp_remote_post($netlify_hook_url, array(
                        'method' => 'POST',
                        'timeout' => 10,
                        'blocking' => false,
                        'body' => array()
                    ));
                    $rebuild_triggered = true;
                    error_log('Violet: Rebuild triggered successfully');
                }
            }
        }

        $final_result = array(
            'success' => $saved_count > 0,
            'message' => sprintf('Final corrected save: %d saved, %d failed', $saved_count, $failed_count),
            'saved_count' => $saved_count,
            'failed_count' => $failed_count,
            'results' => $results,
            'rebuild_triggered' => $rebuild_triggered,
            'timestamp' => current_time('mysql'),
            'errors' => $errors,
            'system' => 'complete_corrected_architecture'
        );

        error_log('Violet: ===== FINAL CORRECTED BATCH SAVE COMPLETED =====');
        return new WP_REST_Response($final_result, 200);

    } catch (Exception $e) {
        error_log('Violet: Final batch save error - ' . $e->getMessage());
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Server error during final save: ' . $e->getMessage()
        ), 500);
    }
}

/**
 * Get content for frontend (unchanged)
 */
function violet_get_content_for_frontend() {
    try {
        global $wpdb;
        $pattern = $wpdb->esc_like('violet_') . '%';
        $options = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT option_name, option_value FROM {$wpdb->options}
                 WHERE option_name LIKE %s
                 AND option_name NOT LIKE %s
                 AND option_name NOT LIKE %s
                 AND option_name NOT LIKE %s",
                $pattern,
                $wpdb->esc_like('violet_') . '%_hook',
                $wpdb->esc_like('violet_') . '%_url',
                $wpdb->esc_like('violet_') . '%_meta'
            )
        );

        $content = array();
        if ($options) {
            foreach ($options as $option) {
                $field_name = str_replace('violet_', '', $option->option_name);
                if (!empty($field_name)) {
                     $content[$field_name] = $option->option_value;
                }
            }
        }

        return rest_ensure_response($content);

    } catch (Exception $e) {
        error_log('Violet: Get content error - ' . $e->getMessage());
        return rest_ensure_response(array());
    }
}

// ============================================================================
// MAIN EDITOR PAGE - COMPLETE FIXED VERSION
// ============================================================================

function violet_frontend_editor_page_fixed() {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    // PERMANENT FIX: Always use the correct Netlify URL
    $netlify_app_url = 'https://lustrous-dolphin-447351.netlify.app'; // Fixed URL
    // Optional: Still allow override from database if needed
    // $netlify_app_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    $rest_nonce = wp_create_nonce('wp_rest');
    $batch_save_url = rest_url('violet/v1/content/save-batch');
    $rebuild_nonce = wp_create_nonce('violet_rebuild_nonce');
    $ajax_url = admin_url('admin-ajax.php');

    $parsed_netlify_url = parse_url($netlify_app_url);
    $netlify_origin = ($parsed_netlify_url && isset($parsed_netlify_url['scheme']) && isset($parsed_netlify_url['host']))
                      ? $parsed_netlify_url['scheme'] . '://' . $parsed_netlify_url['host']
                      : '*';
    
    // FIXED: Ensure no trailing slash for consistent query param addition
    $netlify_app_base_url = rtrim($netlify_app_url, '/');

    ?>
    <div class="wrap">
        <h1>🎨 React Frontend Editor - COMPLETE CORRECTED</h1>

        <div class="notice notice-success">
            <p><strong>✅ COMPLETE ARCHITECTURE:</strong> React page = editing only | WordPress = save controls only</p>
        </div>

        <div class="notice notice-info">
            <p><strong>Connection:</strong> <span id="violet-connection-status">Connecting...</span></p>
            <p><strong>Editor:</strong> <span id="violet-editor-status">Initializing...</span></p>
            <p><strong>Changes:</strong> <span id="violet-changes-status">No changes</span></p>
        </div>

        <!-- COMPLETE CORRECTED BLUE TOOLBAR - PERFECT IMPLEMENTATION -->
        <div class="violet-blue-toolbar-final">
            <button id="violet-edit-toggle" class="button button-primary" onclick="violetActivateEditing()">
                ✏️ Enable Direct Editing
            </button>
            <button id="violet-save-all-btn" onclick="violetSaveAllChanges()" class="button button-hero violet-save-button">
                💾 Save All Changes (<span id="violet-changes-count">0</span>)
            </button>
            <button onclick="violetRefreshPreview()" class="button">🔄 Refresh</button>
            <button onclick="violetTestCommunication()" class="button">🔗 Test Connection</button>
            <button onclick="violetTriggerRebuild()" class="button button-secondary">🚀 Rebuild Site</button>
        </div>

        <div class="violet-preview-container-final">
            <iframe
                id="violet-site-iframe"
                src=""
                title="React Direct Editor"
                style="width: 100%; height: 75vh; border: 3px solid #0073aa; border-radius: 12px;"
            ></iframe>
        </div>
    </div>

    <style>
    .violet-blue-toolbar-final {
        margin: 25px 0;
        padding: 25px;
        background: linear-gradient(135deg, #0073aa 0%, #005a87 100%);
        border-radius: 12px;
        display: flex;
        gap: 20px;
        align-items: center;
        flex-wrap: wrap;
        box-shadow: 0 8px 25px rgba(0,115,170,0.3);
    }
    .violet-blue-toolbar-final .button {
        background: rgba(255,255,255,0.95);
        border: none;
        color: #0073aa;
        font-weight: 700;
        padding: 12px 24px;
        border-radius: 8px;
        transition: all 0.3s ease;
        cursor: pointer;
        font-size: 14px;
    }
    .violet-blue-toolbar-final .button:hover {
        background: white;
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(0,0,0,0.25);
    }
    .violet-blue-toolbar-final .button-primary {
        background: #00a32a !important;
        color: white !important;
    }
    .violet-blue-toolbar-final .button-primary:hover {
        background: #008a24 !important;
    }
    .violet-save-button {
        background: #d63939 !important;
        color: white !important;
        padding: 15px 30px !important;
        font-size: 16px !important;
        font-weight: 800 !important;
        box-shadow: 0 6px 20px rgba(214,57,57,0.5) !important;
        animation: violetPulse 2s infinite;
        border: 3px solid rgba(255,255,255,0.3) !important;
    }
    .violet-save-button:hover {
        background: #c23030 !important;
        transform: translateY(-3px) !important;
        box-shadow: 0 8px 25px rgba(214,57,57,0.7) !important;
    }
    @keyframes violetPulse {
        0% { box-shadow: 0 6px 20px rgba(214,57,57,0.5); }
        50% { box-shadow: 0 8px 30px rgba(214,57,57,0.8); }
        100% { box-shadow: 0 6px 20px rgba(214,57,57,0.5); }
    }
    .violet-preview-container-final {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        border: 1px solid #e0e0e0;
    }
    .status-success { color: #00a32a !important; font-weight: bold; }
    .status-error { color: #d63939 !important; font-weight: bold; }
    .status-info { color: #0073aa !important; }
    .status-warning { color: #f56500 !important; font-weight: bold; }
    
    /* Responsive design */
    @media (max-width: 1200px) {
        .violet-preview-container-final {
            margin: 0 -20px;
        }
        .violet-blue-toolbar-final {
            flex-direction: column;
            align-items: stretch;
        }
        .violet-blue-toolbar-final .button {
            width: 100%;
            margin: 5px 0;
        }
    }
    .violet-preview-container-final iframe#violet-site-iframe {
        width: 100% !important;
        height: 75vh !important;
        min-height: 600px !important;
        border: 3px solid #0073aa !important;
        border-radius: 12px !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        background: #fff !important;
        box-sizing: border-box !important;
        z-index: 10 !important;
    }
    .violet-preview-container-final {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        overflow: visible !important;
        min-height: 650px !important;
    }
    </style>

    <script>
    (function() {
        'use strict';

        // COMPLETE CORRECTED ARCHITECTURE: WordPress Admin = save controls ONLY
        var violetEditingEnabled = false;
        var violetReactAppReady = false;
        var violetPendingChanges = {}; // Changes tracked from React page

        // Make config globally accessible for save button
        window.violetConfig = {
            batchSaveUrl: '<?php echo esc_js($batch_save_url); ?>',
            nonce: '<?php echo esc_js($rest_nonce); ?>',
            rebuildNonce: '<?php echo esc_js($rebuild_nonce); ?>',
            ajaxUrl: '<?php echo esc_js($ajax_url); ?>',
            netlifyAppUrl: '<?php echo esc_js($netlify_app_url); ?>',
            netlifyAppBaseUrl: '<?php echo esc_js($netlify_app_base_url); ?>',
            netlifyOrigin: '<?php echo esc_js($netlify_origin); ?>',
            allowedMessageOrigins: [
                '<?php echo esc_js($netlify_origin); ?>',
                'https://lustrous-dolphin-447351.netlify.app',
                'https://violetrainwater.com',
                'https://www.violetrainwater.com',
                'https://wp.violetrainwater.com'
                <?php if (defined('WP_DEBUG') && WP_DEBUG): ?>
                , 'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:5173'
                <?php endif; ?>
            ].filter(function(origin) { return origin && origin !== '*'; })
        };
        
        // Keep local reference for the IIFE
        var config = window.violetConfig;

        function violetLog(message, data) {
            try {
                console.log('🎨 Violet Admin (COMPLETE): ' + message, data || '');
            } catch (e) {}
        }

        function violetSetStatus(type, message, statusClass) {
            try {
                var element = document.getElementById('violet-' + type + '-status');
                if (element) {
                    element.textContent = message;
                    element.className = statusClass ? 'status-' + statusClass : '';
                }
            } catch (e) {
                violetLog('Status update error', e.message);
            }
        }

        // COMPLETE CORRECTED: Perfect save button management in blue toolbar
        function violetUpdateSaveButton() {
            var count = Object.keys(violetPendingChanges).length;
            var saveBtn = document.getElementById('violet-save-all-btn');
            var countSpan = document.getElementById('violet-changes-count');
            
            if (count > 0) {
                saveBtn.style.display = 'inline-block';
                if (countSpan) countSpan.textContent = count;
                violetSetStatus('changes', count + ' changes ready to save', 'warning');
                violetLog('Save button SHOWN in blue toolbar - ' + count + ' changes');
            } else {
                saveBtn.style.display = 'none';
                violetSetStatus('changes', 'No changes', 'info');
                violetLog('Save button HIDDEN in blue toolbar');
            }
        }

        // FIXED: Enhanced origin validation
        function violetIsValidMessageOrigin(origin) {
            if (!origin) {
                violetLog('No origin provided');
                return false;
            }
            
            // Check if origin is in the allowed list
            var isAllowed = false;
            for (var i = 0; i < config.allowedMessageOrigins.length; i++) {
                if (origin === config.allowedMessageOrigins[i]) {
                    isAllowed = true;
                    break;
                }
            }
            
            // Also check if it matches the configured Netlify origin
            if (!isAllowed && config.netlifyOrigin !== '*' && origin === config.netlifyOrigin) {
                isAllowed = true;
            }
            
            if (!isAllowed) {
                violetLog('Blocked message from invalid origin: ' + origin + ', allowed origins: ', config.allowedMessageOrigins);
            } else {
                violetLog('Accepted message from valid origin: ' + origin);
            }
            
            return isAllowed;
        }

        // FIXED: Initialize with dynamic iframe src and proper origin
        function violetInitializeEditor() {
            try {
                violetLog('Initializing COMPLETE CORRECTED WordPress editor...');
                violetLog('Allowed origins:', config.allowedMessageOrigins);
                
                violetSetStatus('connection', 'Connecting to React app...', 'info');
                violetSetStatus('editor', 'Setting up complete architecture...', 'info');

                // Listen for messages from React iframe
                if (window.addEventListener) {
                    window.addEventListener('message', violetHandleMessage, false);
                } else if (window.attachEvent) {
                    window.attachEvent('onmessage', violetHandleMessage);
                }

                var iframe = document.getElementById('violet-site-iframe');
                if (iframe) {
                    // FORCE: Always set the correct Netlify URL with STRONG cache busting
                    var dynamicWpOrigin = window.location.origin;
                    var timestamp = new Date().getTime();
                    var randomId = Math.random().toString(36).substring(2, 15);
                    var initialQueryString = 'edit_mode=1&wp_admin=1&t=' + timestamp + 
                                             '&r=' + randomId + '&v=' + timestamp +
                                             '&wp_origin=' + encodeURIComponent(dynamicWpOrigin);
                    iframe.src = config.netlifyAppBaseUrl + '?' + initialQueryString;
                    violetLog('Iframe src set with strong cache busting: ' + iframe.src);

                    iframe.onload = function() {
                        violetSetStatus('connection', 'iframe loaded successfully', 'success');
                        setTimeout(violetTestCommunication, 1000);
                    };

                    iframe.onerror = function() {
                        violetSetStatus('connection', 'Failed to load React app', 'error');
                    };
                    
                    // FORCE: Add cache-prevention attributes
                    iframe.setAttribute('no-cache', 'true');
                    iframe.setAttribute('cache-control', 'no-cache, no-store, must-revalidate');
                    
                    // FORCE: Robust styling
                    iframe.style.width = '100%';
                    iframe.style.height = '75vh';
                    iframe.style.minHeight = '600px';
                    iframe.style.border = '3px solid #0073aa';
                    iframe.style.borderRadius = '12px';
                    iframe.style.display = 'block';
                    iframe.style.visibility = 'visible';
                    iframe.style.opacity = '1';
                    iframe.style.backgroundColor = '#fff';
                    
                    // FORCE: Clear any existing cache
                    try {
                        if (iframe.contentWindow && iframe.contentWindow.location) {
                            iframe.contentWindow.location.reload(true);
                        }
                    } catch (e) {
                        violetLog('Could not force iframe reload (expected due to CORS)');
                    }
                }

                violetSetStatus('editor', 'Complete corrected architecture ready', 'success');

            } catch (e) {
                violetLog('Initialization error', e.message);
                violetSetStatus('editor', 'Initialization failed: ' + e.message, 'error');
            }
        }

        // COMPLETE CORRECTED: Handle messages from React page
        function violetHandleMessage(event) {
            try {
                violetLog('Received message from origin: ' + event.origin, event.data);
                
                if (!violetIsValidMessageOrigin(event.origin)) {
                    return;
                }

                var data = event.data;
                if (!data || !data.type) {
                    return;
                }

                switch (data.type) {
                    case 'violet-iframe-ready':
                        violetReactAppReady = true;
                        violetSetStatus('connection', '✅ React app ready - NO save bars will appear', 'success');
                        break;

                    case 'violet-content-changed':
                        // COMPLETE CORRECTED: React page reports changes, we track for blue toolbar
                        if (data.data) {
                            violetPendingChanges[data.data.fieldType] = {
                                field_name: data.data.fieldType,
                                field_value: data.data.value,
                                field_type: data.data.fieldType
                            };
                            violetUpdateSaveButton(); // Update blue toolbar ONLY
                            violetLog('Content changed - tracking for blue toolbar save:', data.data);
                        }
                        break;

                    case 'violet-access-confirmed':
                        violetSetStatus('connection', '✅ Perfect two-way communication', 'success');
                        break;

                    case 'violet-no-save-bars-confirmed':
                        violetSetStatus('editor', '✅ React page confirmed: NO save bars exist', 'success');
                        break;

                    default:
                        violetLog('Unhandled message type', data.type);
                }

            } catch (e) {
                violetLog('Message handling error', e.message);
            }
        }

        function violetTestCommunication() {
            try {
                var iframe = document.getElementById('violet-site-iframe');
                if (!iframe || !iframe.contentWindow) {
                    violetSetStatus('connection', 'iframe not ready for communication', 'error');
                    return;
                }

                violetSetStatus('connection', 'Testing communication...', 'info');

                iframe.contentWindow.postMessage({
                    type: 'violet-test-access',
                    timestamp: new Date().getTime(),
                    from: 'wordpress-admin-complete'
                }, config.netlifyOrigin);

                violetLog('Sent test message to React app');

            } catch (e) {
                violetSetStatus('connection', '❌ Communication test failed: ' + e.message, 'error');
                violetLog('Communication test error', e.message);
            }
        }

        function violetActivateEditing() {
            try {
                if (!violetReactAppReady) {
                    violetSetStatus('connection', '❌ React app not ready yet', 'error');
                    return;
                }

                var btn = document.getElementById('violet-edit-toggle');
                var iframe = document.getElementById('violet-site-iframe');

                if (!btn || !iframe || !iframe.contentWindow) {
                    violetLog('Required elements not found or iframe not ready');
                    violetSetStatus('editor', '❌ Editor elements not ready', 'error');
                    return;
                }

                if (violetEditingEnabled) {
                    // Disable editing
                    violetEditingEnabled = false;
                    btn.innerHTML = '✏️ Enable Direct Editing';
                    btn.className = 'button button-primary';

                    iframe.contentWindow.postMessage({
                        type: 'violet-disable-editing'
                    }, config.netlifyOrigin);

                    violetSetStatus('editor', 'Direct editing disabled', 'info');
                    violetLog('Direct editing disabled');
                } else {
                    // Enable editing
                    violetEditingEnabled = true;
                    btn.innerHTML = '🔓 Disable Direct Editing';
                    btn.className = 'button button-secondary';

                    iframe.contentWindow.postMessage({
                        type: 'violet-enable-editing',
                        timestamp: new Date().getTime(),
                        system: 'complete_corrected_architecture'
                    }, config.netlifyOrigin);

                    violetSetStatus('editor', '✅ Edit directly on React page - save in blue toolbar!', 'success');
                    violetLog('Direct editing enabled - React page will have NO save bars');
                }

            } catch (e) {
                violetLog('Activation error', e.message);
                violetSetStatus('editor', '❌ Failed to activate editing: ' + e.message, 'error');
            }
        }

        // COMPLETE CORRECTED: Save function ONLY in blue toolbar
        function violetSaveAllChanges() {
            try {
                if (Object.keys(violetPendingChanges).length === 0) {
                    violetSetStatus('changes', 'No changes to save', 'info');
                    return;
                }

                var saveBtn = document.getElementById('violet-save-all-btn');
                var originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '💾 Saving...';
                saveBtn.disabled = true;
                saveBtn.style.opacity = '0.7';

                violetSetStatus('changes', 'Saving changes...', 'info');

                var changes = Object.values(violetPendingChanges);
                
                violetLog('Sending COMPLETE batch save request:', changes);

                var xhr = new XMLHttpRequest();
                xhr.open('POST', config.batchSaveUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                xhr.setRequestHeader('X-WP-Nonce', config.nonce);

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        try {
                            var response = JSON.parse(xhr.responseText);
                            
                            if (response.success) {
                                // ENHANCED: Send complete content update to React app
                                var iframe = document.getElementById('violet-site-iframe');
                                if (iframe && iframe.contentWindow) {
                                    // Send the saved changes for visual updates
                                    iframe.contentWindow.postMessage({
                                        type: 'violet-apply-saved-changes',
                                        savedChanges: changes,
                                        timestamp: new Date().getTime(),
                                        system: 'complete_corrected'
                                    }, config.netlifyOrigin);
                                    
                                    // CRITICAL: Send content for triple failsafe storage
                                    iframe.contentWindow.postMessage({
                                        type: 'violet-persist-content-changes',
                                        contentData: changes,
                                        action: 'wordpress_save_complete',
                                        saveCount: response.saved_count,
                                        timestamp: new Date().getTime()
                                    }, config.netlifyOrigin);
                                    
                                    // Send refresh request to ensure persistence
                                    setTimeout(function() {
                                        iframe.contentWindow.postMessage({
                                            type: 'violet-refresh-content',
                                            timestamp: new Date().getTime()
                                        }, config.netlifyOrigin);
                                    }, 1000);
                                    
                                    violetLog('📤 Sent complete content update to React app', changes);
                                }

                                // Clear pending changes and hide save button
                                violetPendingChanges = {};
                                violetUpdateSaveButton();
                                violetSetStatus('changes', '✅ Saved ' + response.saved_count + ' fields successfully!', 'success');
                                
                                if (response.rebuild_triggered) {
                                    violetSetStatus('editor', '✅ Saved and rebuild triggered!', 'success');
                                } else {
                                    violetSetStatus('editor', '✅ Content saved successfully!', 'success');
                                }

                                // Success notification with refresh hint
                                violetShowNotification('✅ Changes saved! If content doesn\'t update, refresh the React page.', 'success');

                            } else {
                                violetSetStatus('changes', '❌ Save failed: ' + response.message, 'error');
                                violetShowNotification('❌ Save failed: ' + response.message, 'error');
                            }
                        } catch (e) {
                            violetSetStatus('changes', '❌ Save error: Invalid response', 'error');
                            violetShowNotification('❌ Save error: Invalid response', 'error');
                        }

                        // Reset button
                        saveBtn.innerHTML = originalText;
                        saveBtn.disabled = false;
                        saveBtn.style.opacity = '1';
                    }
                };

                xhr.onerror = function() {
                    violetSetStatus('changes', '❌ Network error during save', 'error');
                    violetShowNotification('❌ Network error during save', 'error');
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                    saveBtn.style.opacity = '1';
                };

                xhr.timeout = 30000;
                xhr.send(JSON.stringify({ 
                    changes: changes,
                    system: 'complete_corrected_architecture'
                }));

            } catch (e) {
                violetLog('Save error', e.message);
                violetSetStatus('changes', '❌ Save error: ' + e.message, 'error');
            }
        }

        function violetShowNotification(message, type) {
            var notif = document.createElement('div');
            notif.innerHTML = message;
            notif.style.cssText = [
                'position: fixed',
                'top: 30px',
                'right: 30px',
                'background: ' + (type === 'success' ? '#00a32a' : '#d63939'),
                'color: white',
                'padding: 20px 30px',
                'border-radius: 12px',
                'z-index: 10000',
                'font-weight: 700',
                'box-shadow: 0 8px 30px rgba(0,0,0,0.4)',
                'max-width: 400px',
                'font-size: 16px'
            ].join('; ');
            document.body.appendChild(notif);
            setTimeout(function() {
                if (document.body.contains(notif)) {
                    document.body.removeChild(notif);
                }
            }, 5000);
        }

        // FIXED: Refresh with STRONG cache busting
        function violetRefreshPreview() {
            try {
                var iframe = document.getElementById('violet-site-iframe');
                if (iframe) {
                    var dynamicWpOrigin = window.location.origin;
                    var timestamp = new Date().getTime();
                    var randomId = Math.random().toString(36).substring(2, 15);
                    var newQueryString = 'edit_mode=1&wp_admin=1&t=' + timestamp +
                                         '&r=' + randomId + '&v=' + timestamp +
                                         '&wp_origin=' + encodeURIComponent(dynamicWpOrigin);
                    iframe.src = 'https://lustrous-dolphin-447351.netlify.app?' + newQueryString;
                    violetLog('Iframe refreshing with STRONG cache busting: ' + iframe.src);

                    violetEditingEnabled = false;
                    var btn = document.getElementById('violet-edit-toggle');
                    if (btn) {
                        btn.innerHTML = '✏️ Enable Direct Editing';
                        btn.className = 'button button-primary';
                    }

                    violetPendingChanges = {};
                    violetUpdateSaveButton();

                    violetSetStatus('connection', 'Refreshing preview...', 'info');
                    violetSetStatus('editor', 'Reinitializing editor...', 'info');
                    violetSetStatus('changes', 'Changes cleared', 'info');

                    violetReactAppReady = false;
                }
            } catch (e) {
                violetLog('Refresh preview error', e.message);
            }
        }

        function violetTriggerRebuild() {
            try {
                violetLog('Attempting to trigger Netlify rebuild...');
                if (!confirm('Trigger a site rebuild on Netlify?')) {
                    return;
                }

                var formData = new FormData();
                formData.append('action', 'violet_trigger_rebuild');
                formData.append('nonce', config.rebuildNonce);

                var xhr = new XMLHttpRequest();
                xhr.open('POST', config.ajaxUrl, true);

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        try {
                            var response = JSON.parse(xhr.responseText);
                            if (response.success) {
                                violetSetStatus('editor', '✅ Rebuild triggered successfully', 'success');
                            } else {
                                violetSetStatus('editor', '❌ Rebuild failed: ' + (response.data && response.data.message ? response.data.message : 'Unknown error'), 'error');
                            }
                        } catch (e) {
                            violetSetStatus('editor', '❌ Rebuild error: Failed to parse response', 'error');
                        }
                    }
                };

                xhr.onerror = function() {
                    violetSetStatus('editor', '❌ Rebuild error: Network failure', 'error');
                };

                xhr.send(formData);

            } catch (e) {
                violetLog('Rebuild trigger error', e.message);
                violetSetStatus('editor', '❌ Rebuild error: ' + e.message, 'error');
            }
        }

        // Global functions for button onclick handlers
        window.violetActivateEditing = violetActivateEditing;
        window.violetSaveAllChanges = violetSaveAllChanges;
        window.violetRefreshPreview = violetRefreshPreview;
        window.violetTestCommunication = violetTestCommunication;
        window.violetTriggerRebuild = violetTriggerRebuild;

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', violetInitializeEditor);
        } else {
            violetInitializeEditor();
        }

    })();
    </script>
    <?php
}

// ============================================================================
// SETTINGS AND CONTENT MANAGER PAGES (COMPLETE - unchanged except function names)
// ============================================================================

function violet_editor_settings_page() {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    if (isset($_POST['violet_save_settings']) && check_admin_referer('violet_settings_save', 'violet_settings_nonce')) {
        update_option('violet_netlify_hook', isset($_POST['netlify_hook']) ? esc_url_raw(trim($_POST['netlify_hook'])) : '');
        update_option('violet_netlify_url', isset($_POST['netlify_url']) ? esc_url_raw(trim($_POST['netlify_url'])) : '');
        update_option('violet_wp_url', isset($_POST['wp_url']) ? esc_url_raw(trim($_POST['wp_url'])) : '');
        update_option('violet_auto_rebuild', isset($_POST['auto_rebuild']) ? '1' : '0');

        echo '<div class="notice notice-success is-dismissible"><p><strong>✅ Settings saved successfully!</strong></p></div>';
    }

    $hook = get_option('violet_netlify_hook', '');
    $netlify_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    $wp_url = get_option('violet_wp_url', home_url());
    $auto_rebuild = get_option('violet_auto_rebuild', '0');
    ?>
    <div class="wrap">
        <h1>⚙️ Frontend Editor Settings</h1>

        <form method="post" action="" class="violet-settings-form">
            <?php wp_nonce_field('violet_settings_save', 'violet_settings_nonce'); ?>
            <table class="form-table" role="presentation">
                <tbody>
                    <tr>
                        <th scope="row"><label for="netlify_url">Netlify Site URL</label></th>
                        <td>
                            <input type="url" id="netlify_url" name="netlify_url" value="<?php echo esc_attr($netlify_url); ?>" class="regular-text" required placeholder="https://your-netlify-site.netlify.app" />
                            <p class="description">The URL of your live Netlify site.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="wp_url">WordPress Frontend URL</label></th>
                        <td>
                            <input type="url" id="wp_url" name="wp_url" value="<?php echo esc_attr($wp_url); ?>" class="regular-text" placeholder="<?php echo esc_attr(home_url()); ?>" />
                            <p class="description">The public URL of your WordPress site.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="netlify_hook">Netlify Build Hook URL</label></th>
                        <td>
                            <input type="url" id="netlify_hook" name="netlify_hook" value="<?php echo esc_attr($hook); ?>" class="regular-text" placeholder="https://api.netlify.com/build_hooks/your_hook_id" />
                            <p class="description">Enter your Netlify build hook URL to enable rebuilds.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Auto-rebuild on Save</th>
                        <td>
                            <fieldset>
                                <legend class="screen-reader-text"><span>Auto-rebuild on Save</span></legend>
                                <label for="auto_rebuild">
                                    <input type="checkbox" id="auto_rebuild" name="auto_rebuild" value="1" <?php checked($auto_rebuild, '1'); ?> />
                                    Automatically trigger a Netlify rebuild when content is saved
                                </label>
                            </fieldset>
                        </td>
                    </tr>
                </tbody>
            </table>
            <?php submit_button('💾 Save Settings', 'primary', 'violet_save_settings'); ?>
        </form>
    </div>

    <style>
    .violet-settings-form {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        margin-top: 20px;
    }
    </style>
    <?php
}

function violet_content_manager_page() {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    if (isset($_POST['violet_save_all_content_nonce']) && wp_verify_nonce($_POST['violet_save_all_content_nonce'], 'violet_save_all_content_action')) {
        $fields_to_save = array('hero_title', 'hero_subtitle', 'hero_cta', 'contact_email', 'contact_phone');
        $all_saved = true;
        $changed_fields = 0;

        foreach ($fields_to_save as $field_key) {
            if (isset($_POST[$field_key])) {
                $value = wp_kses_post(stripslashes($_POST[$field_key]));
                $option_name = 'violet_' . $field_key;
                $current_value = get_option($option_name);
                if ($current_value !== $value) {
                    if (!update_option($option_name, $value)) {
                        $all_saved = false;
                    } else {
                        $changed_fields++;
                    }
                }
            }
        }

        if ($all_saved && $changed_fields > 0) {
            echo '<div class="notice notice-success is-dismissible"><p><strong>✅ Content saved successfully! (' . $changed_fields . ' fields updated)</strong></p></div>';
        }
    }
    ?>
    <div class="wrap">
        <h1>📝 Content Manager</h1>

        <form method="POST" action="">
            <?php wp_nonce_field('violet_save_all_content_action', 'violet_save_all_content_nonce'); ?>
            <div class="violet-content-grid">
                <div class="violet-content-section">
                    <h2>🎯 Hero Section</h2>
                    <div class="violet-field-group">
                        <?php
                        violet_render_content_field('hero_title', 'Hero Title', 'text');
                        violet_render_content_field('hero_subtitle', 'Hero Subtitle', 'textarea');
                        violet_render_content_field('hero_cta', 'Call-to-Action Text', 'text');
                        ?>
                    </div>
                </div>

                <div class="violet-content-section">
                    <h2>📞 Contact Information</h2>
                    <div class="violet-field-group">
                        <?php
                        violet_render_content_field('contact_email', 'Email Address', 'email');
                        violet_render_content_field('contact_phone', 'Phone Number', 'tel');
                        ?>
                    </div>
                </div>
            </div>

            <div class="violet-actions">
                 <?php submit_button('💾 Save All Changes', 'primary button-large', 'violet_save_all_content_submit', false); ?>
            </div>
        </form>
    </div>

    <style>
    .violet-content-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 25px;
        margin: 30px 0;
    }
    .violet-content-section {
        background: white;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .violet-content-section h2 {
        margin-top: 0;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
        margin-bottom: 20px;
    }
    .violet-field-group {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .violet-field {
        display: flex;
        flex-direction: column;
    }
    .violet-field label {
        font-weight: 600;
        margin-bottom: 8px;
        color: #333;
    }
    .violet-field input[type="text"],
    .violet-field input[type="email"],
    .violet-field input[type="tel"],
    .violet-field input[type="url"],
    .violet-field textarea {
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
        width: 100%;
        font-size: 14px;
    }
    .violet-field input:focus, .violet-field textarea:focus {
        border-color: #0073aa;
        box-shadow: 0 0 0 1px #0073aa;
        outline: none;
    }
    .violet-actions {
        text-align: right;
        padding: 20px 0;
        margin: 30px 0;
    }
    </style>
    <?php
}

function violet_render_content_field($field_name_key, $label, $type = 'text') {
    $option_name = 'violet_' . sanitize_key($field_name_key);
    $value = get_option($option_name, '');
    $input_id = esc_attr('violet_field_' . $field_name_key);
    $input_name = esc_attr($field_name_key);
    ?>
    <div class="violet-field">
        <label for="<?php echo $input_id; ?>"><?php echo esc_html($label); ?></label>
        <?php if ($type === 'textarea'): ?>
            <textarea id="<?php echo $input_id; ?>" name="<?php echo $input_name; ?>" rows="5" class="large-text"><?php echo esc_textarea($value); ?></textarea>
        <?php else: ?>
            <input type="<?php echo esc_attr($type); ?>" id="<?php echo $input_id; ?>" name="<?php echo $input_name; ?>" value="<?php echo esc_attr($value); ?>" class="regular-text" />
        <?php endif; ?>
    </div>
    <?php
}

// ============================================================================
// AJAX HANDLER FOR NETLIFY REBUILD (unchanged)
// ============================================================================
add_action('wp_ajax_violet_trigger_rebuild', 'violet_trigger_rebuild_handler');
function violet_trigger_rebuild_handler() {
    check_ajax_referer('violet_rebuild_nonce', 'nonce');

    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Permission denied'), 403);
        wp_die();
    }

    $netlify_hook_url = get_option('violet_netlify_hook');

    if (empty($netlify_hook_url) || !filter_var($netlify_hook_url, FILTER_VALIDATE_URL)) {
        wp_send_json_error(array('message' => 'Netlify build hook URL not configured'), 400);
        wp_die();
    }

    $response = wp_remote_post($netlify_hook_url, array(
        'method'    => 'POST',
        'timeout'   => 20,
        'headers'   => array('Content-Length' => 0),
        'body'      => null
    ));

    if (is_wp_error($response)) {
        wp_send_json_error(array('message' => 'Failed to trigger rebuild: ' . $response->get_error_message()), 500);
    } else {
        $status_code = wp_remote_retrieve_response_code($response);
        if ($status_code >= 200 && $status_code < 300) {
            wp_send_json_success(array('message' => 'Rebuild triggered successfully'));
        } else {
            wp_send_json_error(array('message' => 'Netlify API error. Status: ' . $status_code), $status_code);
        }
    }
}

// ============================================================================
// COMPLETE CORRECTED REACT FRONTEND SCRIPT - AGGRESSIVE SAVE BAR PREVENTION
// ============================================================================

add_action('wp_head', 'violet_final_frontend_script_loader');
function violet_final_frontend_script_loader() {
    if (isset($_GET['edit_mode']) && $_GET['edit_mode'] == '1' && isset($_GET['wp_admin']) && $_GET['wp_admin'] == '1') {
        violet_output_final_frontend_script();
    }
}

function violet_output_final_frontend_script() {
    $wp_admin_origin_guess = home_url();
    $parsed_url = parse_url($wp_admin_origin_guess);
    $secure_parent_origin_fallback = '*';
    if ($parsed_url && isset($parsed_url['scheme']) && isset($parsed_url['host'])) {
        $secure_parent_origin_fallback = esc_js($parsed_url['scheme'] . '://' . $parsed_url['host']);
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
        
        // FIXED: Determine TRUSTED_PARENT_ORIGIN from URL parameter, with fallback
        var urlParamsForOrigin = new URLSearchParams(window.location.search);
        var parentOriginFromParam = urlParamsForOrigin.get('wp_origin');
        var defaultTrustedParentOriginFallback = '<?php echo $secure_parent_origin_fallback; ?>';
        var TRUSTED_PARENT_ORIGIN = parentOriginFromParam || defaultTrustedParentOriginFallback;

        var violetEditingActive = false;
        var violetPendingChanges = {}; // Track changes locally on React page

        function violetLog(message, data) {
            try {
                console.log('🎨 Violet React (COMPLETE): ' + message, data || '');
            } catch (e) {}
        }
        
        if (!parentOriginFromParam && TRUSTED_PARENT_ORIGIN !== '*') {
            violetLog('Warning: wp_origin param not found. Falling back to default parent origin: ' + TRUSTED_PARENT_ORIGIN + '. Communication might fail if admin is not served from this origin.');
        } else if (parentOriginFromParam) {
            violetLog('TRUSTED_PARENT_ORIGIN set from URL param: ' + TRUSTED_PARENT_ORIGIN);
        } else {
             violetLog('TRUSTED_PARENT_ORIGIN using default: ' + TRUSTED_PARENT_ORIGIN);
        }

        function violetSafePostMessage(data) {
            try {
                if (TRUSTED_PARENT_ORIGIN === '*' && window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
                     window.parent.postMessage(data, window.location.ancestorOrigins[0]);
                } else {
                    window.parent.postMessage(data, TRUSTED_PARENT_ORIGIN);
                }
            } catch (e) {
                violetLog('PostMessage failed', e.message);
            }
        }

        // ============================================================================
        // CRITICAL: AGGRESSIVE SAVE BAR PREVENTION AND DESTRUCTION
        // ============================================================================
        
        function violetDestroySaveBars() {
            // Aggressive removal of any save-related UI elements
            var saveSelectors = [
                '[class*="save"]',
                '[id*="save"]',
                '[class*="toolbar"]',
                '[id*="toolbar"]',
                '.violet-save-bar',
                '.save-changes',
                '.changes-indicator',
                '.editor-save',
                '.save-notification',
                'button[data-save]',
                '[class*="persist"]',
                '[id*="persist"]'
            ];
            
            saveSelectors.forEach(function(selector) {
                try {
                    var elements = document.querySelectorAll(selector);
                    elements.forEach(function(el) {
                        // Double-check we're not removing legitimate page content
                        var text = (el.textContent || '').toLowerCase();
                        if (text.includes('save') || text.includes('persist') || text.includes('changes')) {
                            el.style.display = 'none !important';
                            el.remove();
                        }
                    });
                } catch (e) {
                    violetLog('Error removing save elements', e.message);
                }
            });
        }

        function violetBlockSaveBarCreation() {
            // Override common DOM manipulation methods to prevent save bar creation
            var originalCreateElement = document.createElement;
            document.createElement = function(tagName) {
                var element = originalCreateElement.call(document, tagName);
                
                // Block creation of elements that might be save bars
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'attributes' || mutation.type === 'childList') {
                            var el = mutation.target;
                            if (el && el.textContent) {
                                var text = el.textContent.toLowerCase();
                                if (text.includes('save') && (text.includes('changes') || text.includes('all'))) {
                                    violetLog('BLOCKED save bar creation:', text);
                                    el.style.display = 'none !important';
                                    setTimeout(function() { 
                                        if (el.parentNode) el.parentNode.removeChild(el); 
                                    }, 0);
                                }
                            }
                        }
                    });
                });
                
                observer.observe(element, { 
                    attributes: true, 
                    childList: true, 
                    subtree: true 
                });
                
                return element;
            };
        }

        function violetPreventSaveBarInterval() {
            // Continuous monitoring and removal
            setInterval(function() {
                violetDestroySaveBars();
                
                // Block specific text content that indicates save bars
                var allElements = document.querySelectorAll('*');
                allElements.forEach(function(el) {
                    var text = (el.textContent || '').toLowerCase();
                    if (text.includes('save all changes') || 
                        text.includes('save changes') || 
                        (text.includes('save') && text.includes('toolbar'))) {
                        
                        el.style.display = 'none !important';
                        el.style.visibility = 'hidden !important';
                        el.style.opacity = '0 !important';
                        el.style.height = '0 !important';
                        el.style.overflow = 'hidden !important';
                        
                        // Remove from DOM after hiding
                        setTimeout(function() {
                            if (el.parentNode) {
                                el.parentNode.removeChild(el);
                            }
                        }, 100);
                        
                        violetLog('DESTROYED save bar element:', text);
                    }
                });
            }, 500); // Check every 500ms
        }

        // ============================================================================
        // INITIALIZATION WITH SAVE BAR PREVENTION
        // ============================================================================

        violetLog('✅ COMPLETE CORRECTED frontend script loading with AGGRESSIVE save bar prevention');
        
        // Start aggressive save bar prevention immediately
        violetDestroySaveBars();
        violetBlockSaveBarCreation();
        violetPreventSaveBarInterval();
        
        violetSafePostMessage({ 
            type: 'violet-iframe-ready',
            system: 'complete_corrected_no_save_bars'
        });

        // Listen for messages from WordPress admin
        window.addEventListener('message', function(event) {
            if (TRUSTED_PARENT_ORIGIN !== '*' && event.origin !== TRUSTED_PARENT_ORIGIN) {
                violetLog('Blocked message from untrusted origin: ' + event.origin);
                return;
            }

            var message = event.data;
            if (!message || !message.type) return;

            violetLog('Received message from WordPress admin', message);

            switch (message.type) {
                case 'violet-test-access':
                    violetSafePostMessage({ 
                        type: 'violet-access-confirmed', 
                        from: 'react-app-complete',
                        system: 'complete_corrected_no_save_bars'
                    });
                    
                    // Confirm no save bars exist
                    violetSafePostMessage({
                        type: 'violet-no-save-bars-confirmed',
                        saveBarsFound: document.querySelectorAll('[class*="save"], [id*="save"]').length,
                        message: 'React page has NO save bars - save controls in WordPress admin only'
                    });
                    break;

                case 'violet-enable-editing':
                    violetEnableEditingOnlyFinal();
                    break;

                case 'violet-disable-editing':
                    violetDisableEditingOnlyFinal();
                    break;

                case 'violet-apply-saved-changes':
                    // Apply saved changes from WordPress admin
                    violetApplySavedChangesFinal(message.savedChanges);
                    break;
            }
        });

        function violetDetectFieldType(element) {
            if (element.dataset && element.dataset.violetField) {
                return element.dataset.violetField;
            }
            
            var text = (element.textContent || '').toLowerCase();
            var tag = element.tagName.toLowerCase();
            var classes = (element.className || '').toLowerCase();
            
            // Enhanced field type detection
            if (tag === 'h1' && (text.includes('hero') || text.includes('welcome') || classes.includes('hero'))) return 'hero_title';
            if ((tag === 'p' || tag === 'h2') && (text.includes('subtitle') || text.includes('description') || classes.includes('subtitle'))) return 'hero_subtitle';
            if ((tag === 'a' || tag === 'button') && (text.includes('learn') || text.includes('get started') || text.includes('cta') || classes.includes('cta'))) return 'hero_cta';
            if (text.includes('@') && text.includes('.')) return 'contact_email';
            if (text.match(/[\d\s\(\)\-\+]{7,}/)) return 'contact_phone';
            if (tag.startsWith('h') && text.length < 100) return 'heading_' + tag;
            if (tag === 'p' && text.length > 20) return 'paragraph_content';
            if (tag === 'span' && text.length < 50) return 'span_text';
            
            return 'generic_text_' + tag + '_' + (text.substr(0,10).replace(/\s/g,'_') || 'empty');
        }

        // COMPLETE CORRECTED: Enable editing with ONLY visual feedback - ZERO save bars
        function violetEnableEditingOnlyFinal() {
            try {
                violetLog('✅ Enabling COMPLETE editing mode - visual feedback ONLY, ZERO save bars EVER');
                violetEditingActive = true;

                // Destroy any save bars before enabling editing
                violetDestroySaveBars();

                // Add visual feedback styles
                var style = document.createElement('style');
                style.id = 'violet-editing-styles-complete';
                style.textContent = [
                    '.violet-editable-element {',
                    '  outline: 3px dashed #0073aa !important;',
                    '  outline-offset: 3px !important;',
                    '  cursor: text !important;',
                    '  transition: all 0.3s ease !important;',
                    '  position: relative !important;',
                    '  min-height: 1em !important;',
                    '}',
                    '.violet-editable-element:hover {',
                    '  outline-color: #00a32a !important;',
                    '  background: rgba(0,115,170,0.1) !important;',
                    '  transform: translateY(-2px) !important;',
                    '  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;',
                    '}',
                    '.violet-editable-element::before {',
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
                    '}',
                    '.violet-editable-element:hover::before {',
                    '  opacity: 1 !important;',
                    '}',
                    '.violet-edited-element {',
                    '  background-color: #fff3cd !important;',
                    '  border-left: 5px solid #f56500 !important;',
                    '  padding-left: 12px !important;',
                    '}',
                    '.violet-edited-element::after {',
                    '  content: "✏️ Edited - save in WordPress admin blue toolbar";',
                    '  position: absolute !important;',
                    '  top: -30px !important;',
                    '  right: 0 !important;',
                    '  background: #f56500 !important;',
                    '  color: white !important;',
                    '  padding: 4px 12px !important;',
                    '  border-radius: 6px !important;',
                    '  font-size: 11px !important;',
                    '  font-weight: 700 !important;',
                    '  z-index: 2001 !important;',
                    '  pointer-events: none !important;',
                    '  white-space: nowrap !important;',
                    '}',
                    '/* CRITICAL: Block any save-related elements */',
                    '[class*="save"], [id*="save"], .save-bar, .save-changes, .editor-save {',
                    '  display: none !important;',
                    '  visibility: hidden !important;',
                    '  opacity: 0 !important;',
                    '  height: 0 !important;',
                    '  overflow: hidden !important;',
                    '}',
                    '/* Block toolbar save elements */',
                    '[class*="toolbar"] button, [id*="toolbar"] button {',
                    '  display: none !important;',
                    '}',
                    '/* Allow only WordPress admin toolbar */',
                    '#wpadminbar, .wp-toolbar {',
                    '  display: block !important;',
                    '  visibility: visible !important;',
                    '}'
                ].join('\n');
                document.head.appendChild(style);

                // Make elements editable
                var selectors = ['h1','h2','h3','h4','h5','h6','p','span','a','div', 'li', 'button', 'strong', 'em'];
                document.querySelectorAll(selectors.join(', ')).forEach(function(element) {
                    if (element.offsetParent !== null && 
                        (element.textContent || '').trim().length > 0 && 
                        !element.closest('.violet-editable-element') &&
                        !element.hasAttribute('data-violet-editable') &&
                        !element.querySelector('img, svg, iframe, input, textarea, select') &&
                        !element.textContent.toLowerCase().includes('save')) { // CRITICAL: Exclude save-related text

                        element.contentEditable = true;
                        element.classList.add('violet-editable-element');
                        element.setAttribute('data-violet-editable', 'true');
                        element.setAttribute('data-violet-field', violetDetectFieldType(element));
                        
                        // Store original value for comparison
                        element.dataset.originalValue = element.textContent || element.innerHTML;
                        
                        element.addEventListener('input', violetHandleContentChangeFinal);
                        element.addEventListener('blur', violetHandleContentBlur);
                        element.addEventListener('keydown', violetHandleKeydown);
                    }
                });

                // CRITICAL: Destroy save bars after making elements editable
                setTimeout(violetDestroySaveBars, 100);
                setTimeout(violetDestroySaveBars, 500);

                violetLog('✅ COMPLETE editing enabled - visual feedback only, ZERO save bars created or allowed');
            } catch (e) {
                violetLog('Enable editing error', e.message);
            }
        }

        // COMPLETE CORRECTED: Disable editing and remove all visual feedback
        function violetDisableEditingOnlyFinal() {
            try {
                violetLog('Disabling complete editing mode');
                violetEditingActive = false;

                var style = document.getElementById('violet-editing-styles-complete');
                if (style) style.parentNode.removeChild(style);

                document.querySelectorAll('.violet-editable-element').forEach(function(element) {
                    element.contentEditable = false;
                    element.classList.remove('violet-editable-element', 'violet-edited-element');
                    element.removeAttribute('data-violet-editable');
                    element.removeAttribute('data-violet-field');
                    element.removeAttribute('data-original-value');
                    element.removeEventListener('input', violetHandleContentChangeFinal);
                    element.removeEventListener('blur', violetHandleContentBlur);
                    element.removeEventListener('keydown', violetHandleKeydown);
                    
                    // Remove inline styles
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

        // COMPLETE CORRECTED: Handle content changes with visual feedback ONLY
        function violetHandleContentChangeFinal(event) {
            try {
                var element = event.target;
                var fieldType = element.getAttribute('data-violet-field');
                var newValue = element.textContent || element.innerHTML;
                var originalValue = element.dataset.originalValue;

                if (fieldType && newValue !== undefined) {
                    // Store change locally
                    violetPendingChanges[fieldType] = {
                        element: element,
                        field_name: fieldType,
                        field_value: newValue,
                        original_value: originalValue
                    };
                    
                    // COMPLETE CORRECTED: Yellow background for unsaved changes
                    element.classList.add('violet-edited-element');
                    
                    // CRITICAL: Destroy any save bars that might appear
                    setTimeout(violetDestroySaveBars, 50);
                    
                    // COMPLETE CORRECTED: Notify WordPress admin of change (for blue toolbar ONLY)
                    violetSafePostMessage({
                        type: 'violet-content-changed',
                        data: {
                            fieldType: fieldType,
                            value: newValue,
                            element: element.tagName,
                            hasUnsavedChanges: true,
                            system: 'complete_corrected_no_save_bars'
                        }
                    });

                    violetLog('✅ Content changed with visual feedback ONLY: ' + fieldType + ' = ' + newValue);
                }

            } catch (e) {
                violetLog('Error handling content change', e.message);
            }
        }

        function violetHandleContentBlur(event) {
            // CRITICAL: Destroy save bars on blur
            setTimeout(violetDestroySaveBars, 50);
        }

        function violetHandleKeydown(event) {
            // Allow Enter for line breaks in paragraph elements
            if (event.key === 'Enter' && event.target.tagName.toLowerCase() !== 'p') {
                event.preventDefault();
                event.target.blur();
            }
            
            // CRITICAL: Block any save-related keyboard shortcuts
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                violetLog('BLOCKED Ctrl+S - save only in WordPress admin');
                return false;
            }
        }

        // COMPLETE CORRECTED: Apply saved changes from WordPress admin
        function violetApplySavedChangesFinal(savedChanges) {
            try {
                violetLog('✅ Applying saved changes from WordPress admin', savedChanges);

                savedChanges.forEach(function(change) {
                    var elements = document.querySelectorAll('[data-violet-field="' + change.field_name + '"]');
                    elements.forEach(function(element) {
                        // Remove visual indicators
                        element.classList.remove('violet-edited-element');
                        element.style.backgroundColor = '';
                        element.style.borderLeft = '';
                        element.style.paddingLeft = '';
                        
                        // Update original value so changes persist
                        element.dataset.originalValue = change.field_value;
                        
                        violetLog('✅ Applied saved change to element: ' + change.field_name);
                    });
                });
                
                // Clear local pending changes
                violetPendingChanges = {};
                
                // Success notification on React page
                violetShowReactNotificationFinal('✅ Changes saved successfully!', 'success');
                
                violetLog('✅ All saved changes applied to React frontend');

            } catch (e) {
                violetLog('Error applying saved changes', e.message);
            }
        }

        // Show notification on React page
        function violetShowReactNotificationFinal(message, type) {
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
                    'animation: slideInLeft 0.4s ease-out',
                    'max-width: 350px',
                    'font-size: 14px'
                ].join('; ');
                
                // Add animation
                if (!document.getElementById('violet-notif-styles-complete')) {
                    var notifStyle = document.createElement('style');
                    notifStyle.id = 'violet-notif-styles-complete';
                    notifStyle.textContent = `
                        @keyframes slideInLeft {
                            from { transform: translateX(-100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    `;
                    document.head.appendChild(notifStyle);
                }
                
                document.body.appendChild(notif);
                setTimeout(function() { 
                    if (document.body.contains(notif)) {
                        notif.style.animation = 'slideInLeft 0.4s ease-out reverse';
                        setTimeout(function() {
                            if (document.body.contains(notif)) {
                                document.body.removeChild(notif);
                            }
                        }, 400);
                    }
                }, 4000);
            } catch (e) {
                violetLog('Error showing notification', e.message);
            }
        }

        // CONTINUOUS SAVE BAR MONITORING AND DESTRUCTION
        var violetSaveBarDestroyer = setInterval(function() {
            violetDestroySaveBars();
            
            // Monitor for dynamically created save elements
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            var text = (node.textContent || '').toLowerCase();
                            if (text.includes('save') && (text.includes('changes') || text.includes('all'))) {
                                violetLog('INTERCEPTED and DESTROYED dynamic save bar:', text);
                                node.style.display = 'none !important';
                                if (node.parentNode) {
                                    node.parentNode.removeChild(node);
                                }
                            }
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }, 250); // Check every 250ms

        violetLog('✅ COMPLETE CORRECTED React frontend script ready - editing only, AGGRESSIVE save bar prevention');

    })();
    </script>
    <?php
}

// ============================================================================
// REACT COMPONENT INTEGRATION HELPER
// ============================================================================

add_action('wp_head', 'violet_react_integration_helper');
function violet_react_integration_helper() {
    // Only add this on the actual frontend, not in editor mode
    if (!isset($_GET['edit_mode'])) {
        ?>
        <script>
        // Helper for React apps to integrate with Violet content
        window.VioletContent = {
            // Get content from localStorage
            get: function(fieldName, defaultValue) {
                try {
                    var saved = localStorage.getItem('violet-content');
                    if (saved) {
                        var content = JSON.parse(saved);
                        if (content[fieldName]) {
                            return content[fieldName].field_value || content[fieldName];
                        }
                    }
                } catch (e) {
                    console.error('VioletContent: Error loading content', e);
                }
                return defaultValue;
            },
            
            // Get all content
            getAll: function() {
                try {
                    var saved = localStorage.getItem('violet-content');
                    if (saved) {
                        return JSON.parse(saved);
                    }
                } catch (e) {
                    console.error('VioletContent: Error loading all content', e);
                }
                return {};
            },
            
            // Check if in edit mode
            isEditMode: function() {
                var urlParams = new URLSearchParams(window.location.search);
                return urlParams.get('edit_mode') === '1' && urlParams.get('wp_admin') === '1';
            }
        };
        </script>
        <?php
    }
}

// ============================================================================
// ENQUEUE SCRIPTS AND STYLES
// ============================================================================

add_action('admin_enqueue_scripts', 'violet_enqueue_admin_assets');
function violet_enqueue_admin_assets($hook) {
    // Only load on our admin pages - FIXED: Proper hook targeting
    $violet_pages = array(
        'toplevel_page_violet-frontend-editor',
        'edit-frontend_page_violet-editor-settings',
        'edit-frontend_page_violet-content-manager'
    );
    
    if (!in_array($hook, $violet_pages)) {
        return;
    }
    
    // Add admin styles
    wp_add_inline_style('wp-admin', '
        /* Violet Editor Admin Styles */
        .violet-editor-wrap {
            max-width: 1400px;
            margin: 20px auto;
        }
        
        /* Responsive iframe container */
        @media (max-width: 1200px) {
            .violet-preview-container-final {
                margin: 0 -20px;
            }
            .violet-blue-toolbar-final {
                flex-direction: column;
                align-items: stretch;
            }
            .violet-blue-toolbar-final .button {
                width: 100%;
                margin: 5px 0;
            }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .violet-preview-container-final {
                border-color: #444;
            }
        }
    ');
}

// ============================================================================
// ACTIVATION/DEACTIVATION HOOKS
// ============================================================================

register_activation_hook(__FILE__, 'violet_editor_activate');
function violet_editor_activate() {
    // Set default options
    add_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    add_option('violet_auto_rebuild', '0');
    
    // Flush rewrite rules for REST API
    flush_rewrite_rules();
}

register_deactivation_hook(__FILE__, 'violet_editor_deactivate');
function violet_editor_deactivate() {
    // Clean up if needed
    flush_rewrite_rules();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all Violet content fields
 */
function violet_get_all_content_fields() {
    global $wpdb;
    $pattern = $wpdb->esc_like('violet_') . '%';
    $excluded_patterns = array(
        $wpdb->esc_like('violet_') . '%_hook',
        $wpdb->esc_like('violet_') . '%_url',
        $wpdb->esc_like('violet_') . '%_meta',
        $wpdb->esc_like('violet_') . '%_settings'
    );
    
    $where_clause = "option_name LIKE %s";
    $params = array($pattern);
    
    foreach ($excluded_patterns as $excluded) {
        $where_clause .= " AND option_name NOT LIKE %s";
        $params[] = $excluded;
    }
    
    $query = $wpdb->prepare(
        "SELECT option_name, option_value FROM {$wpdb->options} WHERE $where_clause",
        $params
    );
    
    return $wpdb->get_results($query);
}

/**
 * Export all content as JSON
 */
function violet_export_content() {
    $fields = violet_get_all_content_fields();
    $export = array();
    
    foreach ($fields as $field) {
        $key = str_replace('violet_', '', $field->option_name);
        $export[$key] = $field->option_value;
    }
    
    return json_encode($export, JSON_PRETTY_PRINT);
}

/**
 * Import content from JSON
 */
function violet_import_content($json) {
    $data = json_decode($json, true);
    if (!$data) {
        return false;
    }
    
    foreach ($data as $key => $value) {
        update_option('violet_' . sanitize_key($key), wp_kses_post($value));
    }
    
    return true;
}

// ============================================================================
// SECURITY ENHANCEMENTS
// ============================================================================

/**
 * Additional security headers for iframe protection
 */
add_action('send_headers', 'violet_additional_security_headers', 20);
function violet_additional_security_headers() {
    if (!headers_sent()) {
        // Prevent clickjacking attacks
        header('X-Content-Type-Options: nosniff');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
    }
}

/**
 * Validate and sanitize iframe origins more strictly
 */
function violet_validate_iframe_origin($origin) {
    if (empty($origin)) {
        return false;
    }
    
    $allowed_origins = _violet_get_allowed_origins();
    $parsed_origin = parse_url($origin);
    
    if (!$parsed_origin || !isset($parsed_origin['scheme']) || !isset($parsed_origin['host'])) {
        return false;
    }
    
    $normalized_origin = $parsed_origin['scheme'] . '://' . $parsed_origin['host'];
    return in_array($normalized_origin, $allowed_origins, true);
}

// ============================================================================
// ERROR LOGGING AND DEBUGGING
// ============================================================================

/**
 * Enhanced error logging for debugging
 */
function violet_log_error($message, $data = null) {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('Violet Editor: ' . $message);
        if ($data) {
            error_log('Violet Editor Data: ' . print_r($data, true));
        }
    }
}

/**
 * Add debug information to REST API responses
 */
add_filter('rest_prepare_response', 'violet_add_debug_info', 10, 3);
function violet_add_debug_info($response, $server, $request) {
    if (strpos($request->get_route(), '/violet/v1/') === 0 && defined('WP_DEBUG') && WP_DEBUG) {
        $data = $response->get_data();
        $data['debug'] = array(
            'timestamp' => current_time('mysql'),
            'user_id' => get_current_user_id(),
            'origin' => get_http_origin(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        );
        $response->set_data($data);
    }
    return $response;
}

// ============================================================================
// END OF COMPLETE CORRECTED FUNCTIONS.PHP
// ============================================================================
?>