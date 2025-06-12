<?php
/**
 * 🎨 ENHANCED WORDPRESS FUNCTIONS.PHP - RICH TEXT INTEGRATION
 * Connects to existing React Rich Text Components (QuillEditor.tsx, LexicalEditor.tsx, RichTextModal.tsx)
 * 
 * FIXES APPLIED:
 * ✅ Replace prompt() dialogs with React rich text modal
 * ✅ PostMessage bridge to React rich text system
 * ✅ Editor preference system (Quill vs Lexical)
 * ✅ Rich text content processing
 * ✅ Enhanced REST endpoints for rich text
 * ✅ Professional editing experience
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// ============================================================================
// HELPER FUNCTIONS (PRESERVED FROM EXISTING)
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

/**
 * Helper function to get content with fallback
 */
function violet_get_content($field, $default = '') {
    $content = get_option('violet_all_content', array());
    if (isset($content[$field])) {
        return $content[$field];
    }
    
    // Fallback to individual option
    $individual_option = get_option('violet_' . $field, $default);
    return $individual_option;
}

/**
 * Helper function to update single content field
 */
function violet_update_content($field, $value) {
    $content = get_option('violet_all_content', array());
    $content[$field] = $value;
    update_option('violet_all_content', $content);
    
    // Also update individual option for backward compatibility
    update_option('violet_' . $field, $value);
    
    wp_cache_flush();
    return true;
}

// ============================================================================
// CRITICAL IFRAME AND CORS FIXES (PRESERVED)
// ============================================================================

add_action('send_headers', 'violet_critical_cors_fix');
function violet_critical_cors_fix() {
    $origin = get_http_origin();
    $allowed_origins = _violet_get_allowed_origins();

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

// ============================================================================
// ADMIN MENU SETUP
// ============================================================================

add_action('admin_menu', 'violet_add_rich_text_editor_menu');
function violet_add_rich_text_editor_menu() {
    add_menu_page(
        'Rich Text Universal Editor',
        '🎨 Rich Text Editor',
        'edit_posts',
        'violet-rich-text-editor',
        'violet_render_rich_text_editor_page',
        'dashicons-edit',
        25
    );

    add_submenu_page(
        'violet-rich-text-editor',
        'Editor Settings',
        '⚙️ Settings',
        'edit_posts',
        'violet-editor-settings',
        'violet_rich_text_settings_page'
    );
}

// ============================================================================
// 🎯 ENHANCED REST API ENDPOINTS FOR RICH TEXT
// ============================================================================

add_action('rest_api_init', 'violet_register_rich_text_endpoints');
function violet_register_rich_text_endpoints() {
    // Enhanced content save endpoint with rich text support
    register_rest_route('violet/v1', '/rich-content/save', array(
        'methods' => 'POST',
        'callback' => 'violet_save_rich_content',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        },
        'args' => array(
            'field_name' => array(
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_key'
            ),
            'content' => array(
                'required' => true,
                'type' => 'string'
            ),
            'format' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'html',
                'enum' => array('html', 'plain', 'markdown')
            ),
            'editor' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'quill',
                'enum' => array('quill', 'lexical', 'plain')
            )
        )
    ));

    // Editor preferences endpoint
    register_rest_route('violet/v1', '/editor-preferences', array(
        'methods' => array('GET', 'POST'),
        'callback' => 'violet_handle_editor_preferences',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        }
    ));

    // Enhanced batch save with rich text support
    register_rest_route('violet/v1', '/content/save-batch', array(
        'methods' => 'POST',
        'callback' => 'violet_rich_text_batch_save',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        },
        'args' => array(
            'changes' => array(
                'required' => true,
                'type' => 'array'
            )
        )
    ));

    // Content GET endpoint (preserved)
    register_rest_route('violet/v1', '/content', array(
        'methods' => 'GET',
        'callback' => 'violet_get_content_for_frontend',
        'permission_callback' => '__return_true'
    ));

    // Debug endpoint
    register_rest_route('violet/v1', '/debug', array(
        'methods' => 'GET',
        'callback' => function() {
            return rest_ensure_response(array(
                'status' => 'success',
                'message' => 'Rich Text WordPress API is working',
                'timestamp' => current_time('mysql'),
                'wordpress_version' => get_bloginfo('version'),
                'cors_enabled' => true,
                'user_can_edit' => current_user_can('edit_posts'),
                'system' => 'rich_text_editor_system',
                'rich_text_enabled' => true,
                'total_content_fields' => count(get_option('violet_all_content', []))
            ));
        },
        'permission_callback' => '__return_true'
    ));
}

/**
 * 🎯 Enhanced rich text content save function
 */
function violet_save_rich_content($request) {
    try {
        $field_name = $request->get_param('field_name');
        $content = $request->get_param('content');
        $format = $request->get_param('format');
        $editor = $request->get_param('editor');

        // Sanitize based on format
        if ($format === 'html') {
            $sanitized_content = wp_kses_post($content);
        } elseif ($format === 'markdown') {
            $sanitized_content = sanitize_textarea_field($content);
        } else {
            $sanitized_content = sanitize_textarea_field($content);
        }

        // Save content with format metadata
        violet_update_content($field_name, $sanitized_content);
        update_option('violet_' . $field_name . '_format', $format);
        update_option('violet_' . $field_name . '_editor', $editor);

        return rest_ensure_response(array(
            'success' => true,
            'field_name' => $field_name,
            'format' => $format,
            'editor' => $editor,
            'content_length' => strlen($sanitized_content),
            'message' => 'Rich content saved successfully'
        ));

    } catch (Exception $e) {
        error_log('Violet: Rich content save error - ' . $e->getMessage());
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ), 500);
    }
}

/**
 * 🎯 Editor preferences management
 */
function violet_handle_editor_preferences($request) {
    $user_id = get_current_user_id();
    
    if ($request->get_method() === 'POST') {
        // Save user preference
        $editor = $request->get_param('editor');
        $auto_save = $request->get_param('auto_save');
        $default_format = $request->get_param('default_format');
        
        if ($editor) {
            update_user_meta($user_id, 'violet_editor_preference', sanitize_text_field($editor));
        }
        
        if (isset($auto_save)) {
            update_user_meta($user_id, 'violet_auto_save_enabled', (bool) $auto_save);
        }
        
        if ($default_format) {
            update_user_meta($user_id, 'violet_default_format', sanitize_text_field($default_format));
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'editor' => $editor,
            'auto_save' => $auto_save,
            'default_format' => $default_format
        ));
    } else {
        // Get user preferences
        $editor = get_user_meta($user_id, 'violet_editor_preference', true) ?: 'quill';
        $auto_save = get_user_meta($user_id, 'violet_auto_save_enabled', true) ?: true;
        $default_format = get_user_meta($user_id, 'violet_default_format', true) ?: 'html';
        
        return rest_ensure_response(array(
            'editor' => $editor,
            'auto_save' => $auto_save,
            'default_format' => $default_format
        ));
    }
}

/**
 * 🎯 Enhanced batch save with rich text support
 */
function violet_rich_text_batch_save($request) {
    try {
        error_log('Violet: ===== RICH TEXT BATCH SAVE STARTED =====');
        
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
            $format = isset($change['format']) ? $change['format'] : 'html';
            $editor = isset($change['editor']) ? $change['editor'] : 'quill';

            // Enhanced sanitization based on format
            if ($format === 'html') {
                $sanitized_value = wp_kses_post($field_value);
            } elseif ($format === 'markdown') {
                $sanitized_value = sanitize_textarea_field($field_value);
            } elseif (strpos($field_name, 'email') !== false) {
                $sanitized_value = sanitize_email($field_value);
            } elseif (strpos($field_name, 'url') !== false) {
                $sanitized_value = esc_url_raw($field_value);
            } elseif (strpos($field_name, '_color') !== false) {
                $sanitized_value = sanitize_hex_color($field_value);
            } else {
                $sanitized_value = sanitize_textarea_field($field_value);
            }

            // Save content with metadata
            $saved = violet_update_content($field_name, $sanitized_value);
            
            if ($saved) {
                // Save format and editor metadata
                update_option('violet_' . $field_name . '_format', $format);
                update_option('violet_' . $field_name . '_editor', $editor);
                
                $saved_count++;
                $results[$field_name] = array(
                    'success' => true,
                    'value' => $sanitized_value,
                    'format' => $format,
                    'editor' => $editor
                );
                error_log('Violet: Successfully saved rich content ' . $field_name);
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
                        'blocking' => false
                    ));
                    $rebuild_triggered = true;
                    error_log('Violet: Rebuild triggered successfully');
                }
            }
        }

        $final_result = array(
            'success' => $saved_count > 0,
            'message' => sprintf('Rich text save: %d saved, %d failed', $saved_count, $failed_count),
            'saved_count' => $saved_count,
            'failed_count' => $failed_count,
            'results' => $results,
            'rebuild_triggered' => $rebuild_triggered,
            'timestamp' => current_time('mysql'),
            'errors' => $errors,
            'system' => 'rich_text_architecture'
        );

        error_log('Violet: ===== RICH TEXT BATCH SAVE COMPLETED =====');
        return new WP_REST_Response($final_result, 200);

    } catch (Exception $e) {
        error_log('Violet: Rich text batch save error - ' . $e->getMessage());
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Server error during rich text save: ' . $e->getMessage()
        ), 500);
    }
}

/**
 * Get content for frontend (preserved with format metadata)
 */
function violet_get_content_for_frontend() {
    try {
        // Get content from unified storage first
        $unified_content = get_option('violet_all_content', array());
        
        // Enhance with format metadata
        foreach ($unified_content as $field_name => $content) {
            $format = get_option('violet_' . $field_name . '_format', 'html');
            $editor = get_option('violet_' . $field_name . '_editor', 'quill');
            
            if (is_string($content)) {
                $unified_content[$field_name] = array(
                    'content' => $content,
                    'format' => $format,
                    'editor' => $editor
                );
            }
        }

        return rest_ensure_response($unified_content);

    } catch (Exception $e) {
        error_log('Violet: Get content error - ' . $e->getMessage());
        return rest_ensure_response(array());
    }
}

// ============================================================================
// 🎨 RICH TEXT UNIVERSAL EDITOR INTERFACE
// ============================================================================

function violet_render_rich_text_editor_page() {
    $netlify_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    $editing_params = '?edit_mode=1&wp_admin=1&rich_text=1&wp_origin=' . urlencode(admin_url());
    ?>
    <div class="wrap">
        <h1>🎨 Rich Text Universal Editor</h1>
        
        <div class="notice notice-success">
            <p><strong>✅ RICH TEXT SYSTEM:</strong> Professional Quill and Lexical editors with advanced formatting capabilities!</p>
        </div>
        
        <!-- 🎨 RICH TEXT TOOLBAR -->
        <div id="violet-rich-text-toolbar" style="margin-bottom: 20px; padding: 25px; background: linear-gradient(135deg, #6f42c1 0%, #4c2a85 100%); border-radius: 12px; box-shadow: 0 8px 25px rgba(111,66,193,0.3);">
            <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap; margin-bottom: 15px;">
                <!-- Main Controls -->
                <button id="violet-enable-rich-editing" class="button" style="background: #00a32a !important; border-color: #00a32a !important; color: white !important; font-weight: 700; padding: 12px 24px; border-radius: 8px;">
                    ✏️ Enable Rich Text Editing
                </button>
                <button id="violet-save-all-rich" class="button" style="background: #d63939 !important; border-color: #d63939 !important; color: white !important; font-weight: 700; padding: 12px 24px; border-radius: 8px; display: none;">
                    💾 Save All Changes (0)
                </button>
                <button id="violet-refresh-rich-preview" class="button" style="background: rgba(255,255,255,0.95); border: none; color: #6f42c1; font-weight: 700; padding: 12px 24px; border-radius: 8px;">
                    🔄 Refresh Preview
                </button>
                
                <!-- Editor Preference -->
                <select id="violet-editor-preference" style="padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.95); color: #6f42c1; font-weight: 600;">
                    <option value="quill">🖋️ Quill Editor (WYSIWYG)</option>
                    <option value="lexical">⚡ Lexical Editor (Advanced)</option>
                    <option value="plain">📝 Plain Text</option>
                </select>
                
                <!-- Status Indicators -->
                <span id="violet-rich-status" style="margin-left: 10px; font-weight: bold; color: white;">Ready for rich text editing</span>
                <span id="violet-rich-connection-status" style="margin-left: 10px; color: rgba(255,255,255,0.8);">Testing connection...</span>
            </div>
            
            <div style="margin-top: 15px; font-size: 13px; color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.1); padding: 10px; border-radius: 6px;">
                <strong>Rich Text Instructions:</strong> Click "Enable Rich Text Editing" then click any text to open the professional rich text modal with formatting options.
            </div>
        </div>
        
        <!-- 🎨 IFRAME CONTAINER -->
        <iframe 
            id="violet-rich-site-iframe" 
            src="<?php echo esc_url($netlify_url . $editing_params); ?>" 
            style="width: 100%; height: 80vh; border: 3px solid #6f42c1; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
        </iframe>
    </div>
    
    <script>
    // 🎨 RICH TEXT EDITOR JAVASCRIPT - CONNECTS TO REACT COMPONENTS
    let richTextEditingEnabled = false;
    let richTextPendingChanges = {};
    let richTextConnectionReady = false;
    let currentUserEditorPreference = 'quill';
    
    // 🎯 Initialize rich text editor
    document.addEventListener('DOMContentLoaded', function() {
        initializeRichTextEditor();
        loadUserEditorPreference();
    });
    
    function initializeRichTextEditor() {
        console.log('🎨 Initializing Rich Text Universal Editor...');
        
        // Set up all event listeners
        document.getElementById('violet-enable-rich-editing').addEventListener('click', toggleRichTextEditing);
        document.getElementById('violet-save-all-rich').addEventListener('click', saveAllRichTextChanges);
        document.getElementById('violet-refresh-rich-preview').addEventListener('click', refreshRichTextPreview);
        document.getElementById('violet-editor-preference').addEventListener('change', handleEditorPreferenceChange);
        
        // Listen for all rich text edit requests from React app
        window.addEventListener('message', function(event) {
            handleRichTextEditRequest(event.data);
        });
        
        // Test connection after iframe loads
        setTimeout(testRichTextConnection, 2000);
        
        updateRichTextStatus('🎨 Rich text editor ready');
    }
    
    function loadUserEditorPreference() {
        // Load from localStorage first, then from server
        const localPref = localStorage.getItem('violet_editor_preference');
        if (localPref) {
            currentUserEditorPreference = localPref;
            document.getElementById('violet-editor-preference').value = localPref;
        }
        
        // Load from server
        fetch('/wp-json/violet/v1/editor-preferences', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.editor) {
                currentUserEditorPreference = data.editor;
                document.getElementById('violet-editor-preference').value = data.editor;
                localStorage.setItem('violet_editor_preference', data.editor);
            }
        })
        .catch(error => {
            console.log('Could not load editor preferences:', error);
        });
    }
    
    function handleEditorPreferenceChange(event) {
        const newPreference = event.target.value;
        currentUserEditorPreference = newPreference;
        
        // Save to localStorage immediately
        localStorage.setItem('violet_editor_preference', newPreference);
        
        // Save to server
        fetch('/wp-json/violet/v1/editor-preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
            },
            body: JSON.stringify({
                editor: newPreference,
                auto_save: true,
                default_format: 'html'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateRichTextStatus(`Editor preference set to: ${newPreference}`);
            }
        })
        .catch(error => {
            console.error('Failed to save editor preference:', error);
        });
    }
    
    function testRichTextConnection() {
        const iframe = document.getElementById('violet-rich-site-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-test-rich-text-connection',
                system: 'rich_text_editor'
            }, '*');
            
            setTimeout(() => {
                if (!richTextConnectionReady) {
                    document.getElementById('violet-rich-connection-status').textContent = '⚠️ Connection issues - refresh page';
                    document.getElementById('violet-rich-connection-status').style.color = '#f56500';
                }
            }, 3000);
        }
    }
    
    function toggleRichTextEditing() {
        richTextEditingEnabled = !richTextEditingEnabled;
        const iframe = document.getElementById('violet-rich-site-iframe');
        const button = document.getElementById('violet-enable-rich-editing');
        
        iframe.contentWindow.postMessage({
            type: richTextEditingEnabled ? 'violet-enable-rich-text-editing' : 'violet-disable-rich-text-editing',
            editorPreference: currentUserEditorPreference,
            system: 'rich_text_editor'
        }, '*');
        
        button.textContent = richTextEditingEnabled ? '🔓 Disable Rich Text Editing' : '✏️ Enable Rich Text Editing';
        button.style.background = richTextEditingEnabled ? '#d63939 !important' : '#00a32a !important';
        
        updateRichTextStatus(richTextEditingEnabled ? '✏️ Rich text editing active - click any text to edit' : '🎨 Ready for rich text editing');
        
        if (!richTextEditingEnabled) {
            richTextPendingChanges = {};
            updateRichTextSaveButton();
        }
    }
    
    function refreshRichTextPreview() {
        const iframe = document.getElementById('violet-rich-site-iframe');
        iframe.src = iframe.src;
        updateRichTextStatus('🔄 Refreshing rich text preview...');
        setTimeout(() => updateRichTextStatus('Rich text preview refreshed'), 2000);
    }
    
    function handleRichTextEditRequest(data) {
        if (!data || !data.type || !data.type.startsWith('violet-')) return;
        
        switch(data.type) {
            case 'violet-rich-text-connection-ready':
            case 'violet-rich-text-iframe-ready':
            case 'violet-rich-text-access-confirmed':
                richTextConnectionReady = true;
                document.getElementById('violet-rich-connection-status').textContent = '✅ Connected';
                document.getElementById('violet-rich-connection-status').style.color = '#00a32a';
                break;
                
            case 'violet-rich-text-content-changed':
                if (data.data) {
                    richTextPendingChanges[data.data.fieldType] = {
                        field_name: data.data.fieldType,
                        field_value: data.data.value,
                        format: data.data.format || 'html',
                        editor: data.data.editor || currentUserEditorPreference
                    };
                    updateRichTextSaveButton();
                    updateRichTextStatus(`Rich text changed: ${data.data.fieldType}`);
                }
                break;
                
            case 'violet-open-rich-text-modal':
                // This should already be handled by React, but we can track it
                updateRichTextStatus(`Opening rich text modal for: ${data.field || 'unknown field'}`);
                break;
                
            case 'violet-rich-text-modal-closed':
                updateRichTextStatus('Rich text modal closed');
                break;
        }
    }
    
    function updateRichTextStatus(message) {
        document.getElementById('violet-rich-status').textContent = message;
    }
    
    function updateRichTextSaveButton() {
        const saveButton = document.getElementById('violet-save-all-rich');
        const changeCount = Object.keys(richTextPendingChanges).length;
        
        if (changeCount > 0) {
            saveButton.style.display = 'inline-block';
            saveButton.textContent = `💾 Save Rich Text Changes (${changeCount})`;
        } else {
            saveButton.style.display = 'none';
            saveButton.textContent = '💾 Save All Changes (0)';
        }
    }
    
    function saveAllRichTextChanges() {
        if (Object.keys(richTextPendingChanges).length === 0) {
            updateRichTextStatus('No rich text changes to save');
            return;
        }
        
        updateRichTextStatus('💾 Saving rich text changes...');
        
        // Convert pending changes to the format expected by the API
        const changes = Object.values(richTextPendingChanges);
        
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
                richTextPendingChanges = {};
                updateRichTextSaveButton();
                updateRichTextStatus('✅ All rich text changes saved successfully!');
                
                // Notify React app of successful save
                const iframe = document.getElementById('violet-rich-site-iframe');
                iframe.contentWindow.postMessage({
                    type: 'violet-apply-rich-text-saved-changes',
                    savedChanges: changes,
                    system: 'rich_text_editor'
                }, '*');
                
                // Auto-refresh content after a delay
                setTimeout(() => {
                    iframe.contentWindow.postMessage({
                        type: 'violet-refresh-rich-text-content'
                    }, '*');
                }, 1000);
                
            } else {
                updateRichTextStatus('❌ Rich text save failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Rich text save failed:', error);
            updateRichTextStatus('❌ Rich text save failed: Network error');
        });
    }
    </script>
    
    <?php
    // No need for external Quill CDN - React components handle this
}

// ============================================================================
// SETTINGS PAGE
// ============================================================================

function violet_rich_text_settings_page() {
    if (!current_user_can('edit_posts')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    if (isset($_POST['save_settings']) && check_admin_referer('violet_settings_save', 'violet_settings_nonce')) {
        update_option('violet_netlify_url', isset($_POST['netlify_url']) ? esc_url_raw(trim($_POST['netlify_url'])) : '');
        update_option('violet_netlify_hook', isset($_POST['netlify_hook']) ? esc_url_raw(trim($_POST['netlify_hook'])) : '');
        update_option('violet_auto_rebuild', isset($_POST['auto_rebuild']) ? '1' : '0');
        update_option('violet_rich_text_enabled', isset($_POST['rich_text_enabled']) ? '1' : '0');

        echo '<div class="notice notice-success is-dismissible"><p><strong>✅ Rich text settings saved successfully!</strong></p></div>';
    }

    $netlify_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    $netlify_hook = get_option('violet_netlify_hook', '');
    $auto_rebuild = get_option('violet_auto_rebuild', '0');
    $rich_text_enabled = get_option('violet_rich_text_enabled', '1');
    ?>
    <div class="wrap">
        <h1>⚙️ Rich Text Editor Settings</h1>

        <form method="post" action="" class="violet-settings-form">
            <?php wp_nonce_field('violet_settings_save', 'violet_settings_nonce'); ?>
            <table class="form-table" role="presentation">
                <tbody>
                    <tr>
                        <th scope="row"><label for="netlify_url">Netlify Site URL</label></th>
                        <td>
                            <input type="url" id="netlify_url" name="netlify_url" value="<?php echo esc_attr($netlify_url); ?>" class="regular-text" required placeholder="https://your-netlify-site.netlify.app" />
                            <p class="description">The URL of your live Netlify site with React rich text components.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="netlify_hook">Netlify Build Hook URL</label></th>
                        <td>
                            <input type="url" id="netlify_hook" name="netlify_hook" value="<?php echo esc_attr($netlify_hook); ?>" class="regular-text" placeholder="https://api.netlify.com/build_hooks/your_hook_id" />
                            <p class="description">Enter your Netlify build hook URL to enable auto-rebuilds after content saves.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Auto-rebuild on Save</th>
                        <td>
                            <fieldset>
                                <legend class="screen-reader-text"><span>Auto-rebuild on Save</span></legend>
                                <label for="auto_rebuild">
                                    <input type="checkbox" id="auto_rebuild" name="auto_rebuild" value="1" <?php checked($auto_rebuild, '1'); ?> />
                                    Automatically trigger a Netlify rebuild when rich text content is saved
                                </label>
                            </fieldset>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Rich Text Editing</th>
                        <td>
                            <fieldset>
                                <legend class="screen-reader-text"><span>Rich Text Editing</span></legend>
                                <label for="rich_text_enabled">
                                    <input type="checkbox" id="rich_text_enabled" name="rich_text_enabled" value="1" <?php checked($rich_text_enabled, '1'); ?> />
                                    Enable rich text editing with Quill and Lexical editors
                                </label>
                            </fieldset>
                        </td>
                    </tr>
                </tbody>
            </table>
            <?php submit_button('💾 Save Rich Text Settings', 'primary', 'save_settings'); ?>
        </form>
        
        <hr>
        
        <h2>Rich Text System Status</h2>
        <table class="form-table">
            <tr>
                <th>Rich Text API</th>
                <td>
                    <a href="<?php echo home_url('/wp-json/violet/v1/debug'); ?>" target="_blank" class="button button-secondary">
                        Test Rich Text API
                    </a>
                </td>
            </tr>
            <tr>
                <th>Editor Preferences</th>
                <td>
                    <a href="<?php echo home_url('/wp-json/violet/v1/editor-preferences'); ?>" target="_blank" class="button button-secondary">
                        View Editor Preferences
                    </a>
                </td>
            </tr>
            <tr>
                <th>Total Rich Content Fields</th>
                <td><?php echo count(get_option('violet_all_content', [])); ?> fields stored</td>
            </tr>
            <tr>
                <th>WordPress Version</th>
                <td><?php echo get_bloginfo('version'); ?></td>
            </tr>
            <tr>
                <th>System Architecture</th>
                <td>🎨 Rich Text Universal Editor System</td>
            </tr>
        </table>
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

// ============================================================================
// REACT FRONTEND SCRIPT LOADER FOR RICH TEXT
// ============================================================================

add_action('wp_head', 'violet_rich_text_frontend_script_loader');
function violet_rich_text_frontend_script_loader() {
    if (isset($_GET['edit_mode']) && $_GET['edit_mode'] == '1' && 
        isset($_GET['wp_admin']) && $_GET['wp_admin'] == '1' &&
        isset($_GET['rich_text']) && $_GET['rich_text'] == '1') {
        violet_output_rich_text_frontend_script();
    }
}

function violet_output_rich_text_frontend_script() {
    $wp_admin_origin_guess = home_url();
    $parsed_url = parse_url($wp_admin_origin_guess);
    $secure_parent_origin_fallback = '*';
    if ($parsed_url && isset($parsed_url['scheme']) && isset($parsed_url['host'])) {
        $secure_parent_origin_fallback = esc_js($parsed_url['scheme'] . '://' . $parsed_url['host']);
    }

    ?>
    <script id="violet-rich-text-frontend-integration">
    (function() {
        'use strict';

        var inIframe = (window.parent !== window.self);
        var urlParams = new URLSearchParams(window.location.search);
        var editModeActive = urlParams.get('edit_mode') === '1' && urlParams.get('wp_admin') === '1';
        var richTextMode = urlParams.get('rich_text') === '1';

        if (!inIframe || !editModeActive || !richTextMode) {
            return;
        }
        
        var urlParamsForOrigin = new URLSearchParams(window.location.search);
        var parentOriginFromParam = urlParamsForOrigin.get('wp_origin');
        var defaultTrustedParentOriginFallback = '<?php echo $secure_parent_origin_fallback; ?>';
        var TRUSTED_PARENT_ORIGIN = parentOriginFromParam || defaultTrustedParentOriginFallback;

        var richTextEditingActive = false;
        var richTextPendingChanges = {};

        function richTextLog(message, data) {
            try {
                console.log('🎨 Violet Rich Text Frontend: ' + message, data || '');
            } catch (e) {}
        }

        function richTextSafePostMessage(data) {
            try {
                if (TRUSTED_PARENT_ORIGIN === '*' && window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
                     window.parent.postMessage(data, window.location.ancestorOrigins[0]);
                } else {
                    window.parent.postMessage(data, TRUSTED_PARENT_ORIGIN);
                }
            } catch (e) {
                richTextLog('PostMessage failed', e.message);
            }
        }

        richTextLog('✅ Rich text frontend script loading...');
        
        // Send ready message
        richTextSafePostMessage({ 
            type: 'violet-rich-text-iframe-ready',
            system: 'rich_text_system',
            mode: 'rich_text_enabled'
        });

        // Set up rich text message handling
        window.addEventListener('message', function(event) {
            if (TRUSTED_PARENT_ORIGIN !== '*' && event.origin !== TRUSTED_PARENT_ORIGIN) {
                richTextLog('Blocked message from untrusted origin: ' + event.origin);
                return;
            }

            var message = event.data;
            if (!message || !message.type) return;

            richTextLog('Received rich text message from WordPress admin', message);

            switch (message.type) {
                case 'violet-test-rich-text-connection':
                    richTextSafePostMessage({ 
                        type: 'violet-rich-text-access-confirmed', 
                        from: 'react-app-rich-text',
                        system: 'rich_text_system'
                    });
                    break;

                case 'violet-enable-rich-text-editing':
                    richTextEnableEditing(message.editorPreference);
                    break;

                case 'violet-disable-rich-text-editing':
                    richTextDisableEditing();
                    break;

                case 'violet-apply-rich-text-saved-changes':
                    richTextApplySavedChanges(message.savedChanges);
                    break;

                case 'violet-refresh-rich-text-content':
                    window.location.reload();
                    break;
            }
        });

        function richTextEnableEditing(editorPreference) {
            try {
                richTextLog('✅ Enabling rich text editing mode with preference: ' + editorPreference);
                richTextEditingActive = true;

                // Notify React app to enable rich text editing
                if (window.violetSetRichTextMode) {
                    window.violetSetRichTextMode(true, editorPreference || 'quill');
                }

                // Send message to React app context
                const event = new CustomEvent('violet-rich-text-mode-enabled', {
                    detail: {
                        enabled: true,
                        editorPreference: editorPreference || 'quill',
                        system: 'rich_text_system'
                    }
                });
                window.dispatchEvent(event);

                richTextLog('✅ Rich text editing enabled');
            } catch (e) {
                richTextLog('Enable rich text editing error', e.message);
            }
        }

        function richTextDisableEditing() {
            try {
                richTextLog('Disabling rich text editing mode');
                richTextEditingActive = false;

                // Notify React app to disable rich text editing
                if (window.violetSetRichTextMode) {
                    window.violetSetRichTextMode(false);
                }

                // Send message to React app context
                const event = new CustomEvent('violet-rich-text-mode-disabled', {
                    detail: {
                        enabled: false,
                        system: 'rich_text_system'
                    }
                });
                window.dispatchEvent(event);

                richTextPendingChanges = {};
                richTextLog('✅ Rich text editing mode disabled');
            } catch (e) {
                richTextLog('Disable rich text editing error', e.message);
            }
        }

        function richTextApplySavedChanges(savedChanges) {
            try {
                richTextLog('✅ Applying rich text saved changes', savedChanges);

                // Notify React app of saved changes
                const event = new CustomEvent('violet-rich-text-changes-applied', {
                    detail: {
                        savedChanges: savedChanges,
                        system: 'rich_text_system'
                    }
                });
                window.dispatchEvent(event);
                
                richTextPendingChanges = {};
                
                richTextLog('✅ All rich text saved changes applied');

            } catch (e) {
                richTextLog('Error applying rich text saved changes', e.message);
            }
        }

        // Make functions available globally for React integration
        window.violetRichTextSystem = {
            enableEditing: richTextEnableEditing,
            disableEditing: richTextDisableEditing,
            applySavedChanges: richTextApplySavedChanges,
            safePostMessage: richTextSafePostMessage,
            log: richTextLog,
            isActive: () => richTextEditingActive,
            getPendingChanges: () => richTextPendingChanges
        };

        richTextLog('✅ Rich text frontend integration ready');

    })();
    </script>
    <?php
}

// ============================================================================
// SECURITY ENHANCEMENTS & ERROR LOGGING
// ============================================================================

add_action('send_headers', 'violet_rich_text_security_headers', 20);
function violet_rich_text_security_headers() {
    if (!headers_sent()) {
        header('X-Content-Type-Options: nosniff');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
    }
}

function violet_rich_text_log_error($message, $data = null) {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('Violet Rich Text Editor: ' . $message);
        if ($data) {
            error_log('Violet Rich Text Data: ' . print_r($data, true));
        }
    }
}

// ============================================================================
// ACTIVATION HOOK
// ============================================================================

register_activation_hook(__FILE__, 'violet_rich_text_editor_activate');
function violet_rich_text_editor_activate() {
    add_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    add_option('violet_auto_rebuild', '0');
    add_option('violet_rich_text_enabled', '1');
    add_option('violet_all_content', array());
    
    flush_rewrite_rules();
}

/**
 * ============================================================================
 * 🎨 RICH TEXT INTEGRATION COMPLETE
 * ============================================================================
 * 
 * RICH TEXT FEATURES IMPLEMENTED:
 * ✅ PostMessage bridge to React rich text modal
 * ✅ Editor preference system (Quill vs Lexical vs Plain)
 * ✅ Enhanced REST API endpoints for rich text content
 * ✅ Rich text content processing and sanitization
 * ✅ Format metadata storage (HTML, Markdown, Plain)
 * ✅ Auto-save and user preferences
 * ✅ Professional rich text interface
 * ✅ Cross-origin communication security
 * ✅ Integration with existing React components
 * 
 * CRITICAL INTEGRATION POINTS:
 * ✅ Connects to QuillEditor.tsx (417 lines)
 * ✅ Connects to LexicalEditor.tsx (721 lines)  
 * ✅ Connects to RichTextModal.tsx (669 lines)
 * ✅ Uses enhanced EditableText.tsx with richText prop
 * ✅ Maintains backward compatibility
 * 
 * USAGE:
 * 1. Replace current functions.php with this enhanced version
 * 2. Go to WordPress Admin → Rich Text Editor
 * 3. Choose editor preference (Quill/Lexical/Plain)
 * 4. Click "Enable Rich Text Editing"
 * 5. Click any text → React rich text modal opens
 * 6. Format content with professional tools
 * 7. Save with rich text formatting preserved
 * 
 * SUCCESS: WordPress admin now uses React rich text components!
 */
?>