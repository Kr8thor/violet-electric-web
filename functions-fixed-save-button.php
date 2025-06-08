px !important;',
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
                    '  content: "✏️ Edited - save in WordPress admin";',
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
                        !element.querySelector('img, svg, iframe, input, textarea, select')) {

                        element.contentEditable = true;
                        element.classList.add('violet-editable-element');
                        element.setAttribute('data-violet-editable', 'true');
                        element.setAttribute('data-violet-field', violetDetectFieldType(element));
                        
                        // Store original value for comparison
                        element.dataset.originalValue = element.textContent || element.innerHTML;
                        
                        element.addEventListener('input', violetHandleContentChangeFixed);
                        element.addEventListener('blur', violetHandleContentBlur);
                        element.addEventListener('keydown', violetHandleKeydown);
                    }
                });

                violetLog('✅ SAVE FIXED editing enabled');
            } catch (e) {
                violetLog('Enable editing error', e.message);
            }
        }

        // SAVE BUTTON FIXED: Disable editing and remove all visual feedback
        function violetDisableEditingFixed() {
            try {
                violetLog('Disabling save fixed editing mode');
                violetEditingActive = false;

                var style = document.getElementById('violet-editing-styles-save-fixed');
                if (style) style.parentNode.removeChild(style);

                document.querySelectorAll('.violet-editable-element').forEach(function(element) {
                    element.contentEditable = false;
                    element.classList.remove('violet-editable-element', 'violet-edited-element');
                    element.removeAttribute('data-violet-editable');
                    element.removeAttribute('data-violet-field');
                    element.removeAttribute('data-original-value');
                    element.removeEventListener('input', violetHandleContentChangeFixed);
                    element.removeEventListener('blur', violetHandleContentBlur);
                    element.removeEventListener('keydown', violetHandleKeydown);
                    
                    // Remove inline styles
                    element.style.backgroundColor = '';
                    element.style.borderLeft = '';
                    element.style.paddingLeft = '';
                });

                violetPendingChanges = {};
                violetLog('✅ Save fixed editing mode disabled');
            } catch (e) {
                violetLog('Disable editing error', e.message);
            }
        }

        // SAVE BUTTON FIXED: Handle content changes with tracking
        function violetHandleContentChangeFixed(event) {
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
                    
                    // SAVE BUTTON FIXED: Yellow background for unsaved changes
                    element.classList.add('violet-edited-element');
                    
                    // SAVE BUTTON FIXED: Notify WordPress admin of change
                    violetSafePostMessage({
                        type: 'violet-content-changed',
                        data: {
                            fieldType: fieldType,
                            value: newValue,
                            element: element.tagName,
                            hasUnsavedChanges: true,
                            system: 'save_button_fixed'
                        }
                    });

                    violetLog('✅ Content changed (SAVE FIXED): ' + fieldType + ' = ' + newValue);
                }

            } catch (e) {
                violetLog('Error handling content change', e.message);
            }
        }

        function violetHandleContentBlur(event) {
            // Additional handling on blur if needed
        }

        function violetHandleKeydown(event) {
            // Allow Enter for line breaks in paragraph elements
            if (event.key === 'Enter' && event.target.tagName.toLowerCase() !== 'p') {
                event.preventDefault();
                event.target.blur();
            }
            
            // Block Ctrl+S - save only in WordPress admin
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                violetLog('BLOCKED Ctrl+S - save only in WordPress admin');
                return false;
            }
        }

        // SAVE BUTTON FIXED: Apply saved changes from WordPress admin
        function violetApplySavedChangesFixed(savedContent) {
            try {
                violetLog('✅ SAVE FIXED: Applying saved changes from WordPress admin', savedContent);

                // Store all saved content in localStorage
                var existingContent = {};
                try {
                    var stored = localStorage.getItem('violet-content');
                    if (stored) {
                        existingContent = JSON.parse(stored);
                    }
                } catch (e) {
                    violetLog('Error loading existing content from localStorage', e.message);
                }

                // Merge new content with existing
                Object.keys(savedContent).forEach(function(fieldName) {
                    existingContent[fieldName] = savedContent[fieldName];
                    
                    // Update elements on page immediately
                    var elements = document.querySelectorAll('[data-violet-field="' + fieldName + '"]');
                    elements.forEach(function(element) {
                        // Remove visual indicators
                        element.classList.remove('violet-edited-element');
                        element.style.backgroundColor = '';
                        element.style.borderLeft = '';
                        element.style.paddingLeft = '';
                        
                        // Update original value so changes persist
                        element.dataset.originalValue = savedContent[fieldName];
                        
                        violetLog('✅ Applied saved change to element: ' + fieldName);
                    });
                });
                
                // Save to localStorage for persistence
                localStorage.setItem('violet-content', JSON.stringify(existingContent));
                
                // Clear local pending changes
                violetPendingChanges = {};
                
                // Success notification on React page
                violetShowReactNotificationFixed('✅ Changes saved successfully!', 'success');
                
                violetLog('✅ All saved changes applied and stored in localStorage');

            } catch (e) {
                violetLog('Error applying saved changes', e.message);
            }
        }

        // Show notification on React page
        function violetShowReactNotificationFixed(message, type) {
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
                if (!document.getElementById('violet-notif-styles-save-fixed')) {
                    var notifStyle = document.createElement('style');
                    notifStyle.id = 'violet-notif-styles-save-fixed';
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

        violetLog('✅ SAVE BUTTON FIXED React frontend script ready');

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
        // SAVE BUTTON FIXED: Helper for React apps to integrate with Violet content
        window.VioletContent = {
            // Get content from localStorage
            get: function(fieldName, defaultValue) {
                try {
                    var saved = localStorage.getItem('violet-content');
                    if (saved) {
                        var content = JSON.parse(saved);
                        if (content[fieldName]) {
                            return content[fieldName];
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
            },
            
            // Set content (for programmatic updates)
            set: function(fieldName, value) {
                try {
                    var content = this.getAll();
                    content[fieldName] = value;
                    localStorage.setItem('violet-content', JSON.stringify(content));
                    return true;
                } catch (e) {
                    console.error('VioletContent: Error setting content', e);
                    return false;
                }
            }
        };

        console.log('✅ VioletContent helper loaded (SAVE BUTTON FIXED)');
        </script>
        <?php
    }
}

// ============================================================================
// ENQUEUE SCRIPTS AND STYLES
// ============================================================================

add_action('admin_enqueue_scripts', 'violet_enqueue_admin_assets');
function violet_enqueue_admin_assets($hook) {
    // Only load on our admin pages
    $violet_pages = array(
        'toplevel_page_violet-frontend-editor',
        'violet-frontend-editor_page_violet-editor-settings',
        'violet-frontend-editor_page_violet-content-manager'
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
            .violet-preview-container-fixed {
                margin: 0 -20px;
            }
            .violet-blue-toolbar-fixed {
                flex-direction: column;
                align-items: stretch;
            }
            .violet-blue-toolbar-fixed .button {
                width: 100%;
                margin: 5px 0;
            }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .violet-preview-container-fixed {
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
add_action('send_headers', 'violet_additional_security_headers');
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
        error_log('Violet Editor (Save Fixed): ' . $message);
        if ($data) {
            error_log('Violet Editor Data: ' . print_r($data, true));
        }
    }
}

/**
 * Add debug information to REST API responses
 */
add_filter('rest_prepare_response', 'violet_add_debug_info', 10, 3);
function violet_add_debug_info($response, $post, $request) {
    if (strpos($request->get_route(), '/violet/v1/') === 0 && defined('WP_DEBUG') && WP_DEBUG) {
        $data = $response->get_data();
        $data['debug'] = array(
            'timestamp' => current_time('mysql'),
            'user_id' => get_current_user_id(),
            'origin' => get_http_origin(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'system' => 'save_button_fixed_version'
        );
        $response->set_data($data);
    }
    return $response;
}

// ============================================================================
// END OF SAVE BUTTON FIXED FUNCTIONS.PHP
// ============================================================================
?>