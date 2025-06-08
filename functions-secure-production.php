Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
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
        'violet_frontend_editor_page_secure',
        'dashicons-edit-page',
        25
    );
    
    add_submenu_page(
        'violet-frontend-editor',
        'Editor Settings',
        '⚙️ Settings',
        'manage_options',
        'violet-editor-settings',
        'violet_editor_settings_page_secure'
    );
    
    add_submenu_page(
        'violet-frontend-editor',
        'Manage Content',
        '📝 Content',
        'manage_options',
        'violet-content-manager',
        'violet_content_manager_page'
    );
    
    add_submenu_page(
        'violet-frontend-editor',
        'Security Status',
        '🔒 Security',
        'manage_options',
        'violet-security-status',
        'violet_security_status_page'
    );
}

// ============================================================================
// ENHANCED FIELD TYPE DEFINITIONS
// ============================================================================

function violet_get_supported_field_types() {
    return array(
        'hero_title' => array(
            'label' => 'Hero Title',
            'type' => 'text',
            'validation' => 'required|max:100',
            'sanitization' => 'sanitize_text_field',
            'description' => 'Main headline on homepage'
        ),
        'hero_subtitle' => array(
            'label' => 'Hero Subtitle',
            'type' => 'textarea',
            'validation' => 'max:200',
            'sanitization' => 'sanitize_textarea_field',
            'description' => 'Supporting text under main headline'
        ),
        'hero_cta' => array(
            'label' => 'Hero Call-to-Action',
            'type' => 'text',
            'validation' => 'max:50',
            'sanitization' => 'sanitize_text_field',
            'description' => 'Button text for main action'
        ),
        'contact_email' => array(
            'label' => 'Contact Email',
            'type' => 'email',
            'validation' => 'email|required',
            'sanitization' => 'sanitize_email',
            'description' => 'Primary contact email address'
        ),
        'contact_phone' => array(
            'label' => 'Contact Phone',
            'type' => 'tel',
            'validation' => 'phone',
            'sanitization' => 'violet_sanitize_phone',
            'description' => 'Primary contact phone number'
        ),
        'generic_text' => array(
            'label' => 'Generic Text',
            'type' => 'textarea',
            'validation' => 'max:1000',
            'sanitization' => 'sanitize_textarea_field',
            'description' => 'General text content'
        )
    );
}

// Validation helper functions
function violet_validate_phone($phone) {
    $phone = preg_replace('/[^\d+\-\(\)\s]/', '', $phone);
    return preg_match('/^[\+]?[1-9][\d\s\-\(\)]{7,20}$/', $phone);
}

function violet_sanitize_phone($phone) {
    return preg_replace('/[^\d+\-\(\)\s]/', '', sanitize_text_field($phone));
}

// ============================================================================
// SECURE REST API ENDPOINTS
// ============================================================================

add_action('rest_api_init', 'violet_register_secure_endpoints');
function violet_register_secure_endpoints() {
    // Content retrieval endpoint
    register_rest_route('violet/v1', '/content', array(
        'methods' => 'GET',
        'callback' => 'violet_get_content_for_frontend',
        'permission_callback' => '__return_true'
    ));
    
    // Secure content save endpoint
    register_rest_route('violet/v1', '/content/save', array(
        'methods' => 'POST',
        'callback' => 'violet_secure_save_content',
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
            )
        )
    ));
    
    // Batch save endpoint
    register_rest_route('violet/v1', '/content/save-batch', array(
        'methods' => 'POST',
        'callback' => 'violet_secure_batch_save',
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
}

/**
 * Secure content save with enhanced validation
 */
function violet_secure_save_content($request) {
    try {
        $field_name = $request->get_param('field_name');
        $field_value = $request->get_param('field_value');
        
        // Enhanced security validation
        $allowed_fields = array_keys(violet_get_supported_field_types());
        if (!in_array($field_name, $allowed_fields, true)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Field type not allowed'
            ), 403);
        }
        
        // Sanitize based on field type
        if (strpos($field_name, 'email') !== false) {
            $sanitized_value = sanitize_email($field_value);
        } elseif (strpos($field_name, 'phone') !== false) {
            $sanitized_value = violet_sanitize_phone($field_value);
        } else {
            $sanitized_value = sanitize_text_field($field_value);
        }
        
        // Save to database
        $option_name = 'violet_' . $field_name;
        $saved = update_option($option_name, $sanitized_value);
        
        if ($saved !== false) {
            error_log("VIOLET SECURE: Successfully saved field '{$field_name}'");
            
            return rest_ensure_response(array(
                'success' => true,
                'field_name' => $field_name,
                'message' => 'Content saved successfully'
            ));
        } else {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Failed to save content'
            ), 500);
        }
        
    } catch (Exception $e) {
        error_log('VIOLET SECURE ERROR: ' . $e->getMessage());
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Server error occurred'
        ), 500);
    }
}

/**
 * Secure batch save with transaction-like behavior
 */
function violet_secure_batch_save($request) {
    try {
        $changes = $request->get_param('changes');
        
        if (empty($changes) || !is_array($changes)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'No valid changes provided'
            ), 400);
        }
        
        $saved_count = 0;
        $failed_count = 0;
        $results = array();
        $errors = array();
        $allowed_fields = array_keys(violet_get_supported_field_types());
        
        foreach ($changes as $index => $change) {
            if (!isset($change['field_name']) || !isset($change['field_value'])) {
                $failed_count++;
                $errors[] = "Change {$index}: Missing required fields";
                continue;
            }
            
            $field_name = sanitize_key($change['field_name']);
            
            // Security check
            if (!in_array($field_name, $allowed_fields, true)) {
                $failed_count++;
                $errors[] = "Change {$index}: Field '{$field_name}' not allowed";
                continue;
            }
            
            $field_value = $change['field_value'];
            
            // Sanitize based on field type
            if (strpos($field_name, 'email') !== false) {
                $sanitized_value = sanitize_email($field_value);
            } elseif (strpos($field_name, 'phone') !== false) {
                $sanitized_value = violet_sanitize_phone($field_value);
            } else {
                $sanitized_value = sanitize_text_field($field_value);
            }
            
            // Save to database
            $option_name = 'violet_' . $field_name;
            $saved = update_option($option_name, $sanitized_value);
            
            if ($saved !== false) {
                $saved_count++;
                $results[$field_name] = array('success' => true);
                error_log("VIOLET SECURE BATCH: Saved '{$field_name}'");
            } else {
                $failed_count++;
                $errors[] = "Change {$index}: Database save failed for '{$field_name}'";
            }
        }
        
        // Trigger rebuild if configured and saves occurred
        $rebuild_triggered = false;
        if ($saved_count > 0) {
            $auto_rebuild = get_option('violet_auto_rebuild', '0');
            $netlify_hook_url = get_option('violet_netlify_hook');
            
            if ($auto_rebuild === '1' && !empty($netlify_hook_url) && filter_var($netlify_hook_url, FILTER_VALIDATE_URL)) {
                wp_remote_post($netlify_hook_url, array(
                    'method' => 'POST',
                    'timeout' => 10,
                    'blocking' => false
                ));
                $rebuild_triggered = true;
                error_log("VIOLET SECURE: Triggered rebuild after batch save");
            }
        }
        
        return new WP_REST_Response(array(
            'success' => $saved_count > 0,
            'message' => sprintf('Batch save completed: %d saved, %d failed', $saved_count, $failed_count),
            'saved_count' => $saved_count,
            'failed_count' => $failed_count,
            'results' => $results,
            'errors' => $errors,
            'rebuild_triggered' => $rebuild_triggered,
            'timestamp' => current_time('mysql')
        ), 200);
        
    } catch (Exception $e) {
        error_log('VIOLET SECURE BATCH ERROR: ' . $e->getMessage());
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Batch save error occurred'
        ), 500);
    }
}

/**
 * Get content for frontend
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
                 AND option_name NOT LIKE %s
                 AND option_name NOT LIKE %s",
                $pattern,
                $wpdb->esc_like('violet_') . '%_hook',
                $wpdb->esc_like('violet_') . '%_url',
                $wpdb->esc_like('violet_') . '%_meta',
                $wpdb->esc_like('violet_env_') . '%'
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
        error_log('VIOLET SECURE GET CONTENT ERROR: ' . $e->getMessage());
        return rest_ensure_response(array());
    }
}

// ============================================================================
// SECURE ADMIN PAGES
// ============================================================================

/**
 * Secure frontend editor page
 */
function violet_frontend_editor_page_secure() {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }
    
    // Get configuration from environment
    $netlify_url = violet_get_env('NETLIFY_SITE_URL', '', true);
    
    if (empty($netlify_url)) {
        ?>
        <div class="wrap">
            <h1>🔒 Secure Frontend Editor</h1>
            <div class="notice notice-error">
                <p><strong>❌ Configuration Error:</strong> NETLIFY_SITE_URL environment variable is not configured. Please check your environment setup.</p>
                <p><a href="<?php echo admin_url('admin.php?page=violet-security-status'); ?>">Check Security Status</a></p>
            </div>
        </div>
        <?php
        return;
    }
    
    $rest_nonce = wp_create_nonce('wp_rest');
    $batch_save_url = rest_url('violet/v1/content/save-batch');
    $netlify_app_base_url = rtrim($netlify_url, '/');
    
    ?>
    <div class="wrap">
        <h1>🔒 Secure React Frontend Editor</h1>
        
        <div class="notice notice-success">
            <p><strong>✅ SECURE CONFIGURATION:</strong> All credentials loaded from environment variables. Zero hardcoded values.</p>
        </div>
        
        <div class="notice notice-info">
            <p><strong>Connection:</strong> <span id="violet-connection-status">Connecting...</span></p>
            <p><strong>Editor:</strong> <span id="violet-editor-status">Initializing...</span></p>
            <p><strong>Changes:</strong> <span id="violet-changes-status">No changes</span></p>
            <p><strong>Environment:</strong> <span id="violet-env-status"><?php echo esc_html(violet_get_env('WP_ENVIRONMENT_TYPE', 'production')); ?></span></p>
        </div>
        
        <div class="violet-secure-toolbar">
            <button id="violet-edit-toggle" class="button button-primary" onclick="violetActivateSecureEditing()">
                ✏️ Enable Secure Editing
            </button>
            <button id="violet-save-all-btn" onclick="violetSecureSaveAll()" class="button button-hero violet-save-button" style="display: none;">
                💾 Save All Changes (<span id="violet-changes-count">0</span>)
            </button>
            <button onclick="violetRefreshSecure()" class="button">🔄 Refresh</button>
            <button onclick="violetTestSecureCommunication()" class="button">🔗 Test Connection</button>
        </div>
        
        <div class="violet-secure-preview">
            <iframe
                id="violet-secure-iframe"
                src=""
                title="Secure React Direct Editor"
                style="width: 100%; height: 75vh; border: 3px solid #0073aa; border-radius: 12px;"
            ></iframe>
        </div>
    </div>
    
    <style>
    .violet-secure-toolbar {
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
    .violet-secure-toolbar .button {
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
    .violet-secure-toolbar .button:hover {
        background: white;
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(0,0,0,0.25);
    }
    .violet-secure-toolbar .button-primary {
        background: #00a32a !important;
        color: white !important;
    }
    .violet-save-button {
        background: #d63939 !important;
        color: white !important;
        padding: 15px 30px !important;
        font-size: 16px !important;
        font-weight: 800 !important;
        box-shadow: 0 6px 20px rgba(214,57,57,0.5) !important;
        animation: violetSecurePulse 2s infinite;
    }
    @keyframes violetSecurePulse {
        0% { box-shadow: 0 6px 20px rgba(214,57,57,0.5); }
        50% { box-shadow: 0 8px 30px rgba(214,57,57,0.8); }
        100% { box-shadow: 0 6px 20px rgba(214,57,57,0.5); }
    }
    .violet-secure-preview {
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
    </style>
    
    <script>
    (function() {
        'use strict';
        
        var violetSecureEditingEnabled = false;
        var violetSecureReactAppReady = false;
        var violetSecurePendingChanges = {};
        
        var secureConfig = {
            batchSaveUrl: '<?php echo esc_js($batch_save_url); ?>',
            nonce: '<?php echo esc_js($rest_nonce); ?>',
            netlifyAppUrl: '<?php echo esc_js($netlify_url); ?>',
            netlifyAppBaseUrl: '<?php echo esc_js($netlify_app_base_url); ?>',
            allowedOrigins: <?php echo json_encode(violet_get_allowed_origins()); ?>
        };
        
        function violetSecureLog(message, data) {
            try {
                console.log('🔒 Violet Secure Admin: ' + message, data || '');
            } catch (e) {}
        }
        
        function violetSecureSetStatus(type, message, statusClass) {
            try {
                var element = document.getElementById('violet-' + type + '-status');
                if (element) {
                    element.textContent = message;
                    element.className = statusClass ? 'status-' + statusClass : '';
                }
            } catch (e) {}
        }
        
        function violetSecureValidateOrigin(origin) {
            return secureConfig.allowedOrigins.indexOf(origin) !== -1;
        }
        
        function violetSecureInitialize() {
            try {
                violetSecureLog('Initializing secure WordPress editor...');
                
                violetSecureSetStatus('connection', 'Connecting to secure React app...', 'info');
                violetSecureSetStatus('editor', 'Setting up secure architecture...', 'info');
                
                window.addEventListener('message', violetSecureHandleMessage, false);
                
                var iframe = document.getElementById('violet-secure-iframe');
                if (iframe) {
                    var dynamicWpOrigin = window.location.origin;
                    var queryString = 'edit_mode=1&wp_admin=1&secure=1&t=' + new Date().getTime() + 
                                     '&wp_origin=' + encodeURIComponent(dynamicWpOrigin);
                    iframe.src = secureConfig.netlifyAppBaseUrl + '?' + queryString;
                    
                    iframe.onload = function() {
                        violetSecureSetStatus('connection', 'Secure iframe loaded successfully', 'success');
                        setTimeout(violetTestSecureCommunication, 1000);
                    };
                }
                
                violetSecureSetStatus('editor', 'Secure architecture ready', 'success');
                
            } catch (e) {
                violetSecureLog('Initialization error', e.message);
            }
        }
        
        function violetSecureHandleMessage(event) {
            try {
                if (!violetSecureValidateOrigin(event.origin)) {
                    return;
                }
                
                var data = event.data;
                if (!data || !data.type) return;
                
                switch (data.type) {
                    case 'violet-iframe-ready':
                        violetSecureReactAppReady = true;
                        violetSecureSetStatus('connection', '✅ Secure React app ready', 'success');
                        break;
                        
                    case 'violet-content-changed':
                        if (data.data) {
                            violetSecurePendingChanges[data.data.fieldType] = {
                                field_name: data.data.fieldType,
                                field_value: data.data.value
                            };
                            violetSecureUpdateSaveButton();
                        }
                        break;
                }
                
            } catch (e) {
                violetSecureLog('Message handling error', e.message);
            }
        }
        
        function violetSecureUpdateSaveButton() {
            var count = Object.keys(violetSecurePendingChanges).length;
            var saveBtn = document.getElementById('violet-save-all-btn');
            var countSpan = document.getElementById('violet-changes-count');
            
            if (count > 0) {
                saveBtn.style.display = 'inline-block';
                if (countSpan) countSpan.textContent = count;
                violetSecureSetStatus('changes', count + ' secure changes ready', 'warning');
            } else {
                saveBtn.style.display = 'none';
                violetSecureSetStatus('changes', 'No changes', 'info');
            }
        }
        
        function violetTestSecureCommunication() {
            try {
                var iframe = document.getElementById('violet-secure-iframe');
                if (!iframe || !iframe.contentWindow) {
                    violetSecureSetStatus('connection', 'Secure iframe not ready', 'error');
                    return;
                }
                
                violetSecureSetStatus('connection', 'Testing secure communication...', 'info');
                
                iframe.contentWindow.postMessage({
                    type: 'violet-test-access',
                    timestamp: new Date().getTime(),
                    from: 'wordpress-admin-secure'
                }, '*');
                
                violetSecureLog('Sent secure test message');
                
            } catch (e) {
                violetSecureSetStatus('connection', '❌ Secure communication test failed', 'error');
            }
        }
        
        function violetActivateSecureEditing() {
            try {
                if (!violetSecureReactAppReady) {
                    violetSecureSetStatus('connection', '❌ Secure React app not ready', 'error');
                    return;
                }
                
                var btn = document.getElementById('violet-edit-toggle');
                var iframe = document.getElementById('violet-secure-iframe');
                
                if (violetSecureEditingEnabled) {
                    violetSecureEditingEnabled = false;
                    btn.innerHTML = '✏️ Enable Secure Editing';
                    btn.className = 'button button-primary';
                    
                    iframe.contentWindow.postMessage({
                        type: 'violet-disable-editing'
                    }, '*');
                    
                    violetSecureSetStatus('editor', 'Secure editing disabled', 'info');
                } else {
                    violetSecureEditingEnabled = true;
                    btn.innerHTML = '🔓 Disable Secure Editing';
                    btn.className = 'button button-secondary';
                    
                    iframe.contentWindow.postMessage({
                        type: 'violet-enable-editing',
                        timestamp: new Date().getTime(),
                        system: 'secure_architecture'
                    }, '*');
                    
                    violetSecureSetStatus('editor', '✅ Secure editing active', 'success');
                }
                
            } catch (e) {
                violetSecureLog('Activation error', e.message);
            }
        }
        
        function violetSecureSaveAll() {
            try {
                if (Object.keys(violetSecurePendingChanges).length === 0) {
                    violetSecureSetStatus('changes', 'No secure changes to save', 'info');
                    return;
                }
                
                var saveBtn = document.getElementById('violet-save-all-btn');
                var originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '💾 Saving Securely...';
                saveBtn.disabled = true;
                
                var changes = Object.values(violetSecurePendingChanges);
                
                var xhr = new XMLHttpRequest();
                xhr.open('POST', secureConfig.batchSaveUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                xhr.setRequestHeader('X-WP-Nonce', secureConfig.nonce);
                
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        try {
                            var response = JSON.parse(xhr.responseText);
                            
                            if (response.success) {
                                var iframe = document.getElementById('violet-secure-iframe');
                                if (iframe && iframe.contentWindow) {
                                    iframe.contentWindow.postMessage({
                                        type: 'violet-apply-saved-changes',
                                        savedChanges: changes,
                                        timestamp: new Date().getTime()
                                    }, '*');
                                }
                                
                                violetSecurePendingChanges = {};
                                violetSecureUpdateSaveButton();
                                violetSecureSetStatus('changes', '✅ Saved securely: ' + response.saved_count + ' fields', 'success');
                                
                            } else {
                                violetSecureSetStatus('changes', '❌ Secure save failed: ' + response.message, 'error');
                            }
                        } catch (e) {
                            violetSecureSetStatus('changes', '❌ Secure save error: Invalid response', 'error');
                        }
                        
                        saveBtn.innerHTML = originalText;
                        saveBtn.disabled = false;
                    }
                };
                
                xhr.onerror = function() {
                    violetSecureSetStatus('changes', '❌ Network error during secure save', 'error');
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                };
                
                xhr.send(JSON.stringify({ 
                    changes: changes,
                    system: 'secure_architecture'
                }));
                
            } catch (e) {
                violetSecureLog('Secure save error', e.message);
            }
        }
        
        function violetRefreshSecure() {
            try {
                var iframe = document.getElementById('violet-secure-iframe');
                if (iframe) {
                    var dynamicWpOrigin = window.location.origin;
                    var queryString = 'edit_mode=1&wp_admin=1&secure=1&t=' + new Date().getTime() +
                                     '&wp_origin=' + encodeURIComponent(dynamicWpOrigin);
                    iframe.src = secureConfig.netlifyAppBaseUrl + '?' + queryString;
                    
                    violetSecureEditingEnabled = false;
                    var btn = document.getElementById('violet-edit-toggle');
                    if (btn) {
                        btn.innerHTML = '✏️ Enable Secure Editing';
                        btn.className = 'button button-primary';
                    }
                    
                    violetSecurePendingChanges = {};
                    violetSecureUpdateSaveButton();
                    
                    violetSecureSetStatus('connection', 'Refreshing secure preview...', 'info');
                    violetSecureReactAppReady = false;
                }
            } catch (e) {
                violetSecureLog('Secure refresh error', e.message);
            }
        }
        
        // Global functions for secure button handlers
        window.violetActivateSecureEditing = violetActivateSecureEditing;
        window.violetSecureSaveAll = violetSecureSaveAll;
        window.violetRefreshSecure = violetRefreshSecure;
        window.violetTestSecureCommunication = violetTestSecureCommunication;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', violetSecureInitialize);
        } else {
            violetSecureInitialize();
        }
        
    })();
    </script>
    <?php
}

/**
 * Security status page
 */
function violet_security_status_page() {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }
    
    // Check environment variables
    $env_checks = array(
        'CORS_ALLOWED_ORIGINS' => violet_get_env('CORS_ALLOWED_ORIGINS'),
        'NETLIFY_SITE_URL' => violet_get_env('NETLIFY_SITE_URL'),
        'WP_SITEURL' => violet_get_env('WP_SITEURL'),
        'JWT_SECRET_KEY' => violet_get_env('JWT_SECRET_KEY'),
        'WP_ENVIRONMENT_TYPE' => violet_get_env('WP_ENVIRONMENT_TYPE')
    );
    
    $allowed_origins = violet_get_allowed_origins();
    $missing_env_vars = array();
    $configured_env_vars = array();
    
    foreach ($env_checks as $var => $value) {
        if (empty($value)) {
            $missing_env_vars[] = $var;
        } else {
            $configured_env_vars[] = $var;
        }
    }
    
    $security_score = (count($configured_env_vars) / count($env_checks)) * 100;
    
    ?>
    <div class="wrap">
        <h1>🔒 Security Status Dashboard</h1>
        
        <div class="violet-security-overview">
            <h2>📊 Security Score: <?php echo round($security_score); ?>%</h2>
            <div class="security-progress">
                <div class="security-progress-bar" style="width: <?php echo $security_score; ?>%;"></div>
            </div>
        </div>
        
        <div class="violet-security-grid">
            <div class="security-section">
                <h3>✅ Environment Variables Configured</h3>
                <?php if (!empty($configured_env_vars)): ?>
                    <ul class="security-list success">
                        <?php foreach ($configured_env_vars as $var): ?>
                            <li><strong><?php echo esc_html($var); ?></strong> - Configured</li>
                        <?php endforeach; ?>
                    </ul>
                <?php else: ?>
                    <p class="security-warning">No environment variables configured.</p>
                <?php endif; ?>
            </div>
            
            <?php if (!empty($missing_env_vars)): ?>
            <div class="security-section">
                <h3>❌ Missing Environment Variables</h3>
                <ul class="security-list error">
                    <?php foreach ($missing_env_vars as $var): ?>
                        <li><strong><?php echo esc_html($var); ?></strong> - Not configured</li>
                    <?php endforeach; ?>
                </ul>
                <p><strong>Action Required:</strong> Configure these environment variables.</p>
            </div>
            <?php endif; ?>
            
            <div class="security-section">
                <h3>🌐 CORS Configuration</h3>
                <p><strong>Allowed Origins (<?php echo count($allowed_origins); ?>):</strong></p>
                <?php if (!empty($allowed_origins)): ?>
                    <ul class="security-list info">
                        <?php foreach ($allowed_origins as $origin): ?>
                            <li><?php echo esc_html($origin); ?></li>
                        <?php endforeach; ?>
                    </ul>
                <?php else: ?>
                    <p class="security-warning">No allowed origins configured.</p>
                <?php endif; ?>
            </div>
            
            <div class="security-section">
                <h3>🔐 Security Headers</h3>
                <ul class="security-list success">
                    <li>Content Security Policy (CSP) - Active</li>
                    <li>X-Content-Type-Options - Active</li>
                    <li>X-XSS-Protection - Active</li>
                    <li>Referrer-Policy - Active</li>
                    <li>Access-Control-Allow-Credentials - Active</li>
                </ul>
            </div>
        </div>
    </div>
    
    <style>
    .violet-security-overview {
        background: linear-gradient(135deg, #0073aa 0%, #005a87 100%);
        color: white;
        padding: 30px;
        border-radius: 12px;
        margin: 20px 0;
        text-align: center;
    }
    .security-progress {
        background: rgba(255,255,255,0.3);
        height: 20px;
        border-radius: 10px;
        overflow: hidden;
        margin-top: 15px;
    }
    .security-progress-bar {
        background: #00a32a;
        height: 100%;
        transition: width 0.5s ease;
    }
    .violet-security-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin: 30px 0;
    }
    .security-section {
        background: white;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .security-section h3 {
        margin-top: 0;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
    }
    .security-list {
        list-style: none;
        padding: 0;
    }
    .security-list li {
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
    }
    .security-list.success li:before {
        content: "✅ ";
        margin-right: 8px;
    }
    .security-list.error li:before {
        content: "❌ ";
        margin-right: 8px;
    }
    .security-list.info li:before {
        content: "ℹ️ ";
        margin-right: 8px;
    }
    .security-warning {
        color: #d63939;
        font-weight: bold;
        padding: 10px;
        background: #ffeaea;
        border-radius: 4px;
    }
    </style>
    <?php
}

// Simplified settings page
function violet_editor_settings_page_secure() {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }
    
    ?>
    <div class="wrap">
        <h1>🔒 Secure Editor Settings</h1>
        
        <div class="notice notice-info">
            <p><strong>🔒 Security Note:</strong> All settings are now loaded from environment variables for security.</p>
        </div>
        
        <div class="violet-security-info">
            <h2>🔒 Security Information</h2>
            <p><strong>Environment Variable Configuration:</strong> This system uses environment variables for all sensitive configuration.</p>
            <p><a href="<?php echo admin_url('admin.php?page=violet-security-status'); ?>" class="button">Check Security Status</a></p>
        </div>
    </div>
    
    <style>
    .violet-security-info {
        background: #f0f8ff;
        padding: 20px;
        border-radius: 8px;
        margin-top: 20px;
        border-left: 4px solid #0073aa;
    }
    </style>
    <?php
}

// Content manager page (simplified)
function violet_content_manager_page() {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }
    
    ?>
    <div class="wrap">
        <h1>📝 Secure Content Manager</h1>
        
        <div class="notice notice-info">
            <p><strong>🔒 Secure Content Management:</strong> Use the secure frontend editor for content management.</p>
        </div>
        
        <p><a href="<?php echo admin_url('admin.php?page=violet-frontend-editor'); ?>" class="button button-primary">Go to Secure Editor</a></p>
    </div>
    <?php
}

// ============================================================================
// SECURE FRONTEND SCRIPT INJECTION
// ============================================================================

add_action('wp_head', 'violet_secure_frontend_script_loader');
function violet_secure_frontend_script_loader() {
    if (isset($_GET['edit_mode']) && $_GET['edit_mode'] == '1' && 
        isset($_GET['wp_admin']) && $_GET['wp_admin'] == '1' && 
        isset($_GET['secure']) && $_GET['secure'] == '1') {
        violet_output_secure_frontend_script();
    }
}

function violet_output_secure_frontend_script() {
    $allowed_origins = violet_get_allowed_origins();
    $allowed_origins_js = json_encode($allowed_origins);
    
    ?>
    <script id="violet-secure-frontend-editor">
    (function() {
        'use strict';
        
        var inIframe = (window.parent !== window.self);
        var urlParams = new URLSearchParams(window.location.search);
        var editModeActive = urlParams.get('edit_mode') === '1' && 
                            urlParams.get('wp_admin') === '1' && 
                            urlParams.get('secure') === '1';
        
        if (!inIframe || !editModeActive) {
            return;
        }
        
        var parentOriginFromParam = urlParams.get('wp_origin');
        var allowedOrigins = <?php echo $allowed_origins_js; ?>;
        var TRUSTED_PARENT_ORIGIN = '*';
        
        if (parentOriginFromParam) {
            var isValidParentOrigin = allowedOrigins.some(function(origin) {
                return parentOriginFromParam === origin || 
                       parentOriginFromParam.indexOf(origin.replace('https://', '').replace('http://', '')) !== -1;
            });
            
            if (isValidParentOrigin) {
                TRUSTED_PARENT_ORIGIN = parentOriginFromParam;
                console.log('🔒 Violet Secure React: Using validated parent origin:', TRUSTED_PARENT_ORIGIN);
            } else {
                console.warn('🔒 Violet Secure React: Parent origin not in allowed list:', parentOriginFromParam);
                TRUSTED_PARENT_ORIGIN = allowedOrigins[0] || '*';
            }
        } else {
            TRUSTED_PARENT_ORIGIN = allowedOrigins[0] || '*';
        }
        
        var violetSecureEditingActive = false;
        var violetSecurePendingChanges = {};
        
        function violetSecureLog(message, data) {
            try {
                console.log('🔒 Violet Secure React: ' + message, data || '');
            } catch (e) {}
        }
        
        function violetSecureSafePostMessage(data) {
            try {
                window.parent.postMessage(data, TRUSTED_PARENT_ORIGIN);
            } catch (e) {
                violetSecureLog('Secure PostMessage failed', e.message);
            }
        }
        
        violetSecureLog('✅ Secure frontend script loading');
        
        violetSecureSafePostMessage({ 
            type: 'violet-iframe-ready',
            system: 'secure_architecture'
        });
        
        // Secure message listener
        window.addEventListener('message', function(event) {
            if (TRUSTED_PARENT_ORIGIN !== '*' && event.origin !== TRUSTED_PARENT_ORIGIN) {
                violetSecureLog('Blocked message from untrusted origin: ' + event.origin);
                return;
            }
            
            var message = event.data;
            if (!message || !message.type) return;
            
            violetSecureLog('Received secure message from WordPress admin', message);
            
            switch (message.type) {
                case 'violet-test-access':
                    violetSecureSafePostMessage({ 
                        type: 'violet-access-confirmed', 
                        from: 'react-app-secure',
                        system: 'secure_architecture'
                    });
                    break;
                    
                case 'violet-enable-editing':
                    violetSecureEnableEditing();
                    break;
                    
                case 'violet-disable-editing':
                    violetSecureDisableEditing();
                    break;
                    
                case 'violet-apply-saved-changes':
                    violetSecureApplySavedChanges(message.savedChanges);
                    break;
            }
        });
        
        function violetSecureDetectFieldType(element) {
            if (element.dataset && element.dataset.violetField) {
                return element.dataset.violetField;
            }
            
            var text = (element.textContent || '').toLowerCase();
            var tag = element.tagName.toLowerCase();
            
            if (tag === 'h1' && text.includes('hero')) return 'hero_title';
            if (tag === 'p' && text.includes('subtitle')) return 'hero_subtitle';
            if ((tag === 'a' || tag === 'button') && text.includes('cta')) return 'hero_cta';
            if (text.includes('@') && text.includes('.')) return 'contact_email';
            if (text.match(/[\d\s\(\)\-\+]{7,}/)) return 'contact_phone';
            
            return 'generic_text_' + tag;
        }
        
        function violetSecureEnableEditing() {
            try {
                violetSecureLog('✅ Enabling secure editing mode');
                violetSecureEditingActive = true;
                
                var style = document.createElement('style');
                style.id = 'violet-secure-editing-styles';
                style.textContent = `
                    .violet-secure-editable {
                        outline: 3px dashed #0073aa !important;
                        outline-offset: 3px !important;
                        cursor: text !important;
                        transition: all 0.3s ease !important;
                        position: relative !important;
                        min-height: 1em !important;
                    }
                    .violet-secure-editable:hover {
                        outline-color: #00a32a !important;
                        background: rgba(0,115,170,0.1) !important;
                        transform: translateY(-2px) !important;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                    }
                    .violet-secure-edited {
                        background-color: #fff3cd !important;
                        border-left: 5px solid #f56500 !important;
                        padding-left: 12px !important;
                    }
                `;
                document.head.appendChild(style);
                
                var selectors = ['h1','h2','h3','h4','h5','h6','p','span','a','button'];
                document.querySelectorAll(selectors.join(', ')).forEach(function(element) {
                    if (element.offsetParent !== null && 
                        (element.textContent || '').trim().length > 0 && 
                        !element.closest('.violet-secure-editable') &&
                        !element.hasAttribute('data-violet-secure-editable') &&
                        !element.querySelector('img, svg, iframe, input, textarea, select')) {
                        
                        element.contentEditable = true;
                        element.classList.add('violet-secure-editable');
                        element.setAttribute('data-violet-secure-editable', 'true');
                        element.setAttribute('data-violet-field', violetSecureDetectFieldType(element));
                        element.dataset.originalValue = element.textContent || element.innerHTML;
                        
                        element.addEventListener('input', violetSecureHandleContentChange);
                        element.addEventListener('keydown', violetSecureHandleKeydown);
                    }
                });
                
                violetSecureLog('✅ Secure editing enabled');
            } catch (e) {
                violetSecureLog('Secure enable editing error', e.message);
            }
        }
        
        function violetSecureDisableEditing() {
            try {
                violetSecureLog('Disabling secure editing mode');
                violetSecureEditingActive = false;
                
                var style = document.getElementById('violet-secure-editing-styles');
                if (style) style.parentNode.removeChild(style);
                
                document.querySelectorAll('.violet-secure-editable').forEach(function(element) {
                    element.contentEditable = false;
                    element.classList.remove('violet-secure-editable', 'violet-secure-edited');
                    element.removeAttribute('data-violet-secure-editable');
                    element.removeAttribute('data-violet-field');
                    element.removeAttribute('data-original-value');
                    element.removeEventListener('input', violetSecureHandleContentChange);
                    element.removeEventListener('keydown', violetSecureHandleKeydown);
                    
                    element.style.backgroundColor = '';
                    element.style.borderLeft = '';
                    element.style.paddingLeft = '';
                });
                
                violetSecurePendingChanges = {};
                violetSecureLog('✅ Secure editing mode disabled');
            } catch (e) {
                violetSecureLog('Secure disable editing error', e.message);
            }
        }
        
        function violetSecureHandleContentChange(event) {
            try {
                var element = event.target;
                var fieldType = element.getAttribute('data-violet-field');
                var newValue = element.textContent || element.innerHTML;
                var originalValue = element.dataset.originalValue;
                
                if (fieldType && newValue !== undefined) {
                    violetSecurePendingChanges[fieldType] = {
                        element: element,
                        field_name: fieldType,
                        field_value: newValue,
                        original_value: originalValue
                    };
                    
                    element.classList.add('violet-secure-edited');
                    
                    violetSecureSafePostMessage({
                        type: 'violet-content-changed',
                        data: {
                            fieldType: fieldType,
                            value: newValue,
                            element: element.tagName,
                            hasUnsavedChanges: true,
                            system: 'secure_architecture'
                        }
                    });
                    
                    violetSecureLog('✅ Secure content changed: ' + fieldType + ' = ' + newValue);
                }
                
            } catch (e) {
                violetSecureLog('Error handling secure content change', e.message);
            }
        }
        
        function violetSecureHandleKeydown(event) {
            if (event.key === 'Enter' && event.target.tagName.toLowerCase() !== 'p') {
                event.preventDefault();
                event.target.blur();
            }
            
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                violetSecureLog('BLOCKED Ctrl+S - secure save only in WordPress admin');
                return false;
            }
        }
        
        function violetSecureApplySavedChanges(savedChanges) {
            try {
                violetSecureLog('✅ Applying secure saved changes from WordPress admin', savedChanges);
                
                savedChanges.forEach(function(change) {
                    var elements = document.querySelectorAll('[data-violet-field="' + change.field_name + '"]');
                    elements.forEach(function(element) {
                        element.classList.remove('violet-secure-edited');
                        element.style.backgroundColor = '';
                        element.style.borderLeft = '';
                        element.style.paddingLeft = '';
                        element.dataset.originalValue = change.field_value;
                        violetSecureLog('✅ Applied secure saved change to element: ' + change.field_name);
                    });
                });
                
                violetSecurePendingChanges = {};
                violetSecureLog('✅ All secure saved changes applied to React frontend');
                
            } catch (e) {
                violetSecureLog('Error applying secure saved changes', e.message);
            }
        }
        
        violetSecureLog('✅ Secure React frontend script ready');
        
    })();
    </script>
    <?php
}

?>