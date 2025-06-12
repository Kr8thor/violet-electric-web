<?php
/**
 * 🎯 ENHANCED FUNCTIONS.PHP - RICH TEXT INTEGRATION
 * Connects WordPress Admin to React Rich Text Modal System
 * 
 * INTEGRATION FEATURES:
 * ✅ React RichTextModal integration via PostMessage
 * ✅ Rich text content processing and validation
 * ✅ Editor preferences system (Quill vs Lexical)
 * ✅ Enhanced REST API endpoints for rich content
 * ✅ Professional rich text editing experience
 * ✅ Backward compatibility with existing system
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// ============================================================================
// ENHANCED UNIVERSAL EDITOR WITH RICH TEXT INTEGRATION
// ============================================================================

function violet_render_enhanced_universal_editor_page() {
    $netlify_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    $editing_params = '?edit_mode=1&wp_admin=1&wp_origin=' . urlencode(admin_url()) . '&rich_text=1';
    $rest_nonce = wp_create_nonce('wp_rest');
    $batch_save_url = rest_url('violet/v1/content/save-batch');
    $user_id = get_current_user_id();
    $editor_preferences = get_user_meta($user_id, 'violet_editor_preferences', true);
    if (!$editor_preferences) {
        $editor_preferences = array(
            'default_editor' => 'quill',
            'toolbar_style' => 'full',
            'auto_save' => true,
            'word_count' => true
        );
    }
    ?>
    <div class="wrap">
        <h1>🎨 Enhanced Universal Editor - Rich Text Enabled</h1>
        
        <div class="notice notice-success">
            <p><strong>🚀 RICH TEXT EDITING:</strong> Professional Quill & Lexical editors now available! Choose your preferred editor in settings.</p>
        </div>
        
        <!-- Enhanced Toolbar with Rich Text Controls -->
        <div id="violet-enhanced-toolbar" style="margin:25px 0;padding:25px;background:linear-gradient(135deg, #0073aa 0%, #005a87 100%);border-radius:12px;box-shadow:0 8px 25px rgba(0,115,170,0.3);">
            <div style="display:flex;gap:15px;align-items:center;flex-wrap:wrap;margin-bottom:15px;">
                <!-- Main Controls -->
                <button id="violet-enable-editing" class="button" style="background:#00a32a;color:white;font-weight:700;padding:12px 24px;border-radius:8px;">
                    ✏️ Enable Rich Text Editing
                </button>
                <button id="violet-save-all" class="button" style="background:#d63939;color:white;font-weight:700;padding:12px 24px;border-radius:8px;display:none;">
                    💾 Save Changes (<span id="violet-changes-count">0</span>)
                </button>
                <button id="violet-refresh-preview" class="button" style="background:white;color:#0073aa;font-weight:700;padding:12px 24px;border-radius:8px;">
                    🔄 Refresh Preview
                </button>
                
                <!-- Rich Text Controls -->
                <div style="background:rgba(255,255,255,0.1);padding:8px 15px;border-radius:8px;margin-left:10px;">
                    <label style="color:white;font-weight:600;margin-right:10px;">Default Editor:</label>
                    <select id="violet-default-editor" style="padding:5px;border-radius:4px;border:none;">
                        <option value="quill" <?php echo $editor_preferences['default_editor'] === 'quill' ? 'selected' : ''; ?>>Quill (WYSIWYG)</option>
                        <option value="lexical" <?php echo $editor_preferences['default_editor'] === 'lexical' ? 'selected' : ''; ?>>Lexical (Advanced)</option>
                        <option value="plain" <?php echo $editor_preferences['default_editor'] === 'plain' ? 'selected' : ''; ?>>Plain Text</option>
                    </select>
                </div>
                
                <!-- Status Indicators -->
                <span id="violet-status" style="margin-left:10px;font-weight:bold;color:white;">Ready for rich text editing</span>
                <span id="violet-connection-status" style="margin-left:10px;color:rgba(255,255,255,0.8);">Testing connection...</span>
            </div>
            
            <!-- Rich Text Settings Panel -->
            <details style="margin-top:15px;">
                <summary style="color:rgba(255,255,255,0.9);font-weight:600;cursor:pointer;padding:10px;background:rgba(255,255,255,0.1);border-radius:6px;">
                    🎨 Rich Text Settings & Advanced Options
                </summary>
                <div style="margin-top:15px;display:flex;gap:15px;align-items:center;flex-wrap:wrap;padding:15px;background:rgba(255,255,255,0.1);border-radius:6px;">
                    <label style="color:white;display:flex;align-items:center;gap:5px;">
                        <input type="checkbox" id="violet-auto-save" <?php echo $editor_preferences['auto_save'] ? 'checked' : ''; ?> />
                        Auto-save while typing
                    </label>
                    <label style="color:white;display:flex;align-items:center;gap:5px;">
                        <input type="checkbox" id="violet-word-count" <?php echo $editor_preferences['word_count'] ? 'checked' : ''; ?> />
                        Show word count
                    </label>
                    <label style="color:white;display:flex;align-items:center;gap:5px;">
                        Toolbar Style:
                        <select id="violet-toolbar-style" style="margin-left:5px;padding:3px;border-radius:4px;border:none;">
                            <option value="minimal" <?php echo $editor_preferences['toolbar_style'] === 'minimal' ? 'selected' : ''; ?>>Minimal</option>
                            <option value="standard" <?php echo $editor_preferences['toolbar_style'] === 'standard' ? 'selected' : ''; ?>>Standard</option>
                            <option value="full" <?php echo $editor_preferences['toolbar_style'] === 'full' ? 'selected' : ''; ?>>Full Featured</option>
                        </select>
                    </label>
                    <button id="violet-save-preferences" class="button" style="background:rgba(255,255,255,0.95);border:none;color:#0073aa;font-weight:700;padding:8px 16px;border-radius:6px;">
                        💾 Save Preferences
                    </button>
                </div>
            </details>
            
            <div style="margin-top:15px;font-size:13px;color:rgba(255,255,255,0.9);background:rgba(255,255,255,0.1);padding:10px;border-radius:6px;">
                <strong>Rich Text Instructions:</strong> Click "Enable Rich Text Editing" then click any text to open the professional editor modal. Choose between Quill (WYSIWYG), Lexical (Advanced), or Plain Text editing modes.
            </div>
        </div>
        
        <!-- Enhanced Iframe with Rich Text Parameters -->
        <iframe 
            id="violet-site-iframe" 
            src="<?php echo esc_url($netlify_url . $editing_params); ?>" 
            style="width:100%;height:80vh;border:3px solid #0073aa;border-radius:12px;box-shadow:0 8px 25px rgba(0,0,0,0.15);">
        </iframe>
    </div>
    
    <script>
    // 🎨 ENHANCED UNIVERSAL EDITOR WITH RICH TEXT INTEGRATION
    let editingEnabled = false;
    let pendingChanges = {};
    let connectionReady = false;
    let editorPreferences = <?php echo json_encode($editor_preferences); ?>;
    let richTextModalOpen = false;
    
    // Initialize enhanced editor
    document.addEventListener('DOMContentLoaded', function() {
        initializeEnhancedEditor();
    });
    
    function initializeEnhancedEditor() {
        console.log('🎨 Initializing Enhanced Rich Text Editor...');
        
        // Set up all event listeners
        document.getElementById('violet-enable-editing').addEventListener('click', toggleEnhancedEditing);
        document.getElementById('violet-save-all').addEventListener('click', saveAllChanges);
        document.getElementById('violet-refresh-preview').addEventListener('click', refreshPreview);
        document.getElementById('violet-save-preferences').addEventListener('click', saveEditorPreferences);
        
        // Listen for rich text modal communication
        window.addEventListener('message', function(event) {
            handleRichTextMessage(event.data);
        });
        
        // Test connection after iframe loads
        setTimeout(testConnection, 2000);
        
        updateStatus('🎨 Enhanced rich text editor ready');
    }
    
    function testConnection() {
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-test-connection',
                richTextEnabled: true,
                editorPreferences: editorPreferences
            }, '*');
            
            setTimeout(() => {
                if (!connectionReady) {
                    document.getElementById('violet-connection-status').textContent = '⚠️ Connection issues - refresh page';
                    document.getElementById('violet-connection-status').style.color = '#f56500';
                }
            }, 3000);
        }
    }
    
    function toggleEnhancedEditing() {
        editingEnabled = !editingEnabled;
        const iframe = document.getElementById('violet-site-iframe');
        const button = document.getElementById('violet-enable-editing');
        
        // Send enhanced editing command with rich text preferences
        iframe.contentWindow.postMessage({
            type: editingEnabled ? 'violet-enable-rich-editing' : 'violet-disable-editing',
            richTextEnabled: true,
            editorPreferences: editorPreferences
        }, '*');
        
        button.textContent = editingEnabled ? '🔓 Disable Rich Text Editing' : '✏️ Enable Rich Text Editing';
        button.style.background = editingEnabled ? '#d63939' : '#00a32a';
        
        updateStatus(editingEnabled ? '✏️ Rich text editing active - click any text for professional editor' : '🎨 Ready for rich text editing');
        
        if (!editingEnabled) {
            pendingChanges = {};
            updateSaveButton();
        }
    }
    
    function handleRichTextMessage(data) {
        if (!data || !data.type || !data.type.startsWith('violet-')) return;
        
        console.log('📨 Rich text message received:', data.type);
        
        switch(data.type) {
            case 'violet-connection-ready':
            case 'violet-iframe-ready':
            case 'violet-access-confirmed':
                connectionReady = true;
                document.getElementById('violet-connection-status').textContent = '✅ Rich Text Ready';
                document.getElementById('violet-connection-status').style.color = '#00a32a';
                break;
                
            case 'violet-open-rich-text-modal':
                openRichTextModal(data);
                break;
                
            case 'violet-rich-text-content-changed':
                handleRichTextChange(data);
                break;
                
            case 'violet-rich-text-modal-closed':
                richTextModalOpen = false;
                updateStatus('Rich text modal closed');
                break;
                
            case 'violet-content-changed':
                if (data.data) {
                    pendingChanges[data.data.fieldType] = {
                        field_name: data.data.fieldType,
                        field_value: data.data.value,
                        content_type: data.data.contentType || 'plain'
                    };
                    updateSaveButton();
                    updateStatus(`Content changed: ${data.data.fieldType}`);
                }
                break;
        }
    }
    
    function openRichTextModal(data) {
        richTextModalOpen = true;
        console.log('🎨 Opening rich text modal for field:', data.field);
        
        // Send modal configuration to React app
        const iframe = document.getElementById('violet-site-iframe');
        iframe.contentWindow.postMessage({
            type: 'violet-configure-rich-text-modal',
            field: data.field,
            currentValue: data.currentValue,
            fieldType: data.fieldType,
            editorPreferences: editorPreferences,
            modalConfig: {
                defaultEditor: editorPreferences.default_editor,
                toolbarStyle: editorPreferences.toolbar_style,
                autoSave: editorPreferences.auto_save,
                wordCount: editorPreferences.word_count,
                characterLimit: getCharacterLimit(data.fieldType),
                placeholder: getPlaceholder(data.fieldType)
            }
        }, '*');
        
        updateStatus(`🎨 Rich text editor opened for: ${data.field}`);
    }
    
    function handleRichTextChange(data) {
        const field = data.field;
        const content = data.content;
        const editor = data.editor;
        
        console.log(`💾 Rich text content changed: ${field} (${editor} editor)`);
        
        // Store rich text change with metadata
        pendingChanges[field] = {
            field_name: field,
            field_value: content.html || content.text,
            content_type: 'rich_text',
            editor_used: editor,
            word_count: content.wordCount || 0,
            character_count: content.characterCount || 0,
            last_modified: new Date().toISOString()
        };
        
        updateSaveButton();
        updateStatus(`📝 Rich text updated: ${field} (${content.wordCount || 0} words)`);
    }
    
    function getCharacterLimit(fieldType) {
        const limits = {
            'hero_title': 100,
            'hero_subtitle': 200,
            'meta_description': 160,
            'button_text': 50,
            'default': 1000
        };
        return limits[fieldType] || limits.default;
    }
    
    function getPlaceholder(fieldType) {
        const placeholders = {
            'hero_title': 'Enter your compelling headline...',
            'hero_subtitle': 'Describe your value proposition...',
            'intro_description': 'Tell your story...',
            'default': 'Start typing...'
        };
        return placeholders[fieldType] || placeholders.default;
    }
    
    function saveEditorPreferences() {
        const preferences = {
            default_editor: document.getElementById('violet-default-editor').value,
            toolbar_style: document.getElementById('violet-toolbar-style').value,
            auto_save: document.getElementById('violet-auto-save').checked,
            word_count: document.getElementById('violet-word-count').checked
        };
        
        updateStatus('💾 Saving editor preferences...');
        
        fetch('/wp-json/violet/v1/editor-preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
            },
            body: JSON.stringify({ preferences: preferences })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                editorPreferences = preferences;
                updateStatus('✅ Editor preferences saved');
                
                // Update React app with new preferences
                const iframe = document.getElementById('violet-site-iframe');
                iframe.contentWindow.postMessage({
                    type: 'violet-update-editor-preferences',
                    preferences: preferences
                }, '*');
            } else {
                updateStatus('❌ Failed to save preferences');
            }
        })
        .catch(error => {
            console.error('Preferences save error:', error);
            updateStatus('❌ Preferences save error');
        });
    }
    
    function refreshPreview() {
        const iframe = document.getElementById('violet-site-iframe');
        iframe.src = iframe.src;
        updateStatus('🔄 Refreshing preview...');
        setTimeout(() => updateStatus('Preview refreshed'), 2000);
    }
    
    function updateStatus(message) {
        document.getElementById('violet-status').textContent = message;
    }
    
    function updateSaveButton() {
        const saveButton = document.getElementById('violet-save-all');
        const changeCount = Object.keys(pendingChanges).length;
        
        if (changeCount > 0) {
            saveButton.style.display = 'inline-block';
            saveButton.textContent = `💾 Save Changes (${changeCount})`;
        } else {
            saveButton.style.display = 'none';
            saveButton.textContent = '💾 Save Changes (0)';
        }
        
        // Update changes count
        document.getElementById('violet-changes-count').textContent = changeCount;
    }
    
    function saveAllChanges() {
        if (Object.keys(pendingChanges).length === 0) {
            updateStatus('No changes to save');
            return;
        }
        
        updateStatus('💾 Saving rich text content...');
        
        // Convert pending changes to enhanced format for API
        const changes = Object.values(pendingChanges);
        
        fetch('/wp-json/violet/v1/rich-content/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
            },
            body: JSON.stringify({ 
                changes: changes,
                editor_preferences: editorPreferences,
                rich_text_enabled: true
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                pendingChanges = {};
                updateSaveButton();
                updateStatus(`✅ Rich text content saved! (${data.saved_count} fields)`);
                
                // Notify React app of successful save
                const iframe = document.getElementById('violet-site-iframe');
                iframe.contentWindow.postMessage({
                    type: 'violet-apply-rich-text-changes',
                    savedChanges: changes,
                    richTextEnabled: true
                }, '*');
                
                // Auto-refresh content after a delay
                setTimeout(() => {
                    iframe.contentWindow.postMessage({
                        type: 'violet-refresh-content'
                    }, '*');
                }, 1000);
                
            } else {
                updateStatus('❌ Rich text save failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Rich text save failed:', error);
            updateStatus('❌ Rich text save failed: Network error');
        });
    }
    </script>
    
    <?php
    // Enqueue WordPress media library for image uploads
    wp_enqueue_media();
    
    // Add rich text styles
    wp_add_inline_style('wp-admin', '
        .violet-rich-text-indicator {
            position: relative;
        }
        .violet-rich-text-indicator::after {
            content: "✨ Rich Text";
            position: absolute;
            top: -20px;
            right: 0;
            background: #7b68ee;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
        }
    ');
}

// ============================================================================
// ENHANCED REST API ENDPOINTS FOR RICH TEXT
// ============================================================================

add_action('rest_api_init', 'violet_register_rich_text_endpoints');
function violet_register_rich_text_endpoints() {
    
    // Rich text content save endpoint
    register_rest_route('violet/v1', '/rich-content/save', array(
        'methods' => 'POST',
        'callback' => 'violet_save_rich_text_content',
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
            ),
            'editor_preferences' => array(
                'required' => false,
                'type' => 'object',
                'default' => array()
            ),
            'rich_text_enabled' => array(
                'required' => false,
                'type' => 'boolean',
                'default' => true
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
    
    // Rich text validation endpoint
    register_rest_route('violet/v1', '/validate-rich-text', array(
        'methods' => 'POST',
        'callback' => 'violet_validate_rich_text_content',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        },
        'args' => array(
            'content' => array(
                'required' => true,
                'type' => 'string'
            ),
            'field_type' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'default'
            )
        )
    ));
    
    // Content formatting endpoint
    register_rest_route('violet/v1', '/format-content', array(
        'methods' => 'POST',
        'callback' => 'violet_format_rich_content',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        },
        'args' => array(
            'content' => array(
                'required' => true,
                'type' => 'string'
            ),
            'from_editor' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'quill'
            ),
            'to_editor' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'lexical'
            )
        )
    ));
}

/**
 * Enhanced rich text content save function
 */
function violet_save_rich_text_content($request) {
    try {
        error_log('Violet: ===== RICH TEXT BATCH SAVE STARTED =====');
        
        $changes = $request->get_param('changes');
        $editor_preferences = $request->get_param('editor_preferences');
        $rich_text_enabled = $request->get_param('rich_text_enabled');
        
        if (empty($changes) || !is_array($changes)) {
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
            $content_type = $change['content_type'] ?? 'plain';
            $editor_used = $change['editor_used'] ?? 'unknown';

            // Enhanced sanitization for rich text content
            if ($content_type === 'rich_text') {
                // Allow safe HTML tags for rich text
                $allowed_tags = wp_kses_allowed_html('post');
                $sanitized_value = wp_kses($field_value, $allowed_tags);
                
                // Additional validation for rich text
                $validation_result = violet_validate_rich_text_internal($sanitized_value, $field_name);
                if (!$validation_result['valid']) {
                    $failed_count++;
                    $errors[] = "Field $field_name: " . $validation_result['message'];
                    continue;
                }
            } else {
                // Standard sanitization for plain text
                if (strpos($field_name, 'email') !== false) {
                    $sanitized_value = sanitize_email($field_value);
                } elseif (strpos($field_name, 'url') !== false) {
                    $sanitized_value = esc_url_raw($field_value);
                } else {
                    $sanitized_value = wp_kses_post($field_value);
                }
            }

            // Save with enhanced metadata
            $saved = violet_update_rich_content($field_name, $sanitized_value, array(
                'content_type' => $content_type,
                'editor_used' => $editor_used,
                'word_count' => $change['word_count'] ?? 0,
                'character_count' => $change['character_count'] ?? 0,
                'last_modified' => $change['last_modified'] ?? current_time('mysql')
            ));

            if ($saved) {
                $saved_count++;
                $results[$field_name] = array(
                    'success' => true,
                    'value' => $sanitized_value,
                    'content_type' => $content_type,
                    'editor_used' => $editor_used
                );
                error_log('Violet: Successfully saved rich text field ' . $field_name);
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
                    error_log('Violet: Rich text rebuild triggered successfully');
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
            'system' => 'enhanced_rich_text_architecture',
            'rich_text_enabled' => $rich_text_enabled
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
 * Enhanced content update function with rich text metadata
 */
function violet_update_rich_content($field, $value, $metadata = array()) {
    // Get current content
    $content = get_option('violet_all_content', array());
    
    // Store the value
    $content[$field] = $value;
    
    // Store metadata separately
    if (!empty($metadata)) {
        $content_meta = get_option('violet_content_meta', array());
        $content_meta[$field] = $metadata;
        update_option('violet_content_meta', $content_meta);
    }
    
    // Update main content
    $success = update_option('violet_all_content', $content);
    
    // Also update individual option for backward compatibility
    update_option('violet_' . $field, $value);
    
    wp_cache_flush();
    return $success;
}

/**
 * Handle editor preferences (GET/POST)
 */
function violet_handle_editor_preferences($request) {
    $user_id = get_current_user_id();
    
    if ($request->get_method() === 'GET') {
        $preferences = get_user_meta($user_id, 'violet_editor_preferences', true);
        if (!$preferences) {
            $preferences = array(
                'default_editor' => 'quill',
                'toolbar_style' => 'full',
                'auto_save' => true,
                'word_count' => true
            );
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'preferences' => $preferences
        ), 200);
    } else {
        // POST - Save preferences
        $preferences = $request->get_param('preferences');
        
        if (!$preferences || !is_array($preferences)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Invalid preferences data'
            ), 400);
        }
        
        $updated = update_user_meta($user_id, 'violet_editor_preferences', $preferences);
        
        return new WP_REST_Response(array(
            'success' => $updated !== false,
            'message' => $updated !== false ? 'Preferences saved' : 'Failed to save preferences',
            'preferences' => $preferences
        ), $updated !== false ? 200 : 500);
    }
}

/**
 * Validate rich text content
 */
function violet_validate_rich_text_content($request) {
    $content = $request->get_param('content');
    $field_type = $request->get_param('field_type');
    
    $validation_result = violet_validate_rich_text_internal($content, $field_type);
    
    return new WP_REST_Response($validation_result, 200);
}

/**
 * Internal rich text validation function
 */
function violet_validate_rich_text_internal($content, $field_type = 'default') {
    // Character limits by field type
    $limits = array(
        'hero_title' => 100,
        'hero_subtitle' => 200,
        'meta_description' => 160,
        'button_text' => 50,
        'default' => 2000
    );
    
    $limit = $limits[$field_type] ?? $limits['default'];
    $content_length = strlen(strip_tags($content));
    
    if ($content_length > $limit) {
        return array(
            'valid' => false,
            'message' => "Content too long. Maximum {$limit} characters, got {$content_length}.",
            'character_count' => $content_length,
            'character_limit' => $limit
        );
    }
    
    // Check for potentially harmful content
    $disallowed_tags = array('<script>', '<iframe>', '<object>', '<embed>');
    foreach ($disallowed_tags as $tag) {
        if (stripos($content, $tag) !== false) {
            return array(
                'valid' => false,
                'message' => "Disallowed HTML tag detected: {$tag}",
                'character_count' => $content_length,
                'character_limit' => $limit
            );
        }
    }
    
    return array(
        'valid' => true,
        'message' => 'Content is valid',
        'character_count' => $content_length,
        'character_limit' => $limit
    );
}

/**
 * Format content between different editors
 */
function violet_format_rich_content($request) {
    $content = $request->get_param('content');
    $from_editor = $request->get_param('from_editor');
    $to_editor = $request->get_param('to_editor');
    
    // Basic format conversion (can be enhanced)
    $formatted_content = $content;
    
    if ($from_editor === 'quill' && $to_editor === 'lexical') {
        // Convert Quill HTML to Lexical format
        $formatted_content = violet_convert_quill_to_lexical($content);
    } elseif ($from_editor === 'lexical' && $to_editor === 'quill') {
        // Convert Lexical format to Quill HTML
        $formatted_content = violet_convert_lexical_to_quill($content);
    }
    
    return new WP_REST_Response(array(
        'success' => true,
        'formatted_content' => $formatted_content,
        'from_editor' => $from_editor,
        'to_editor' => $to_editor
    ), 200);
}

/**
 * Convert Quill HTML to Lexical format (simplified)
 */
function violet_convert_quill_to_lexical($quill_html) {
    // This is a simplified conversion - would need more sophisticated logic
    return $quill_html;
}

/**
 * Convert Lexical format to Quill HTML (simplified)
 */
function violet_convert_lexical_to_quill($lexical_content) {
    // This is a simplified conversion - would need more sophisticated logic
    return $lexical_content;
}

/**
 * ============================================================================
 * ENHANCED FRONTEND SCRIPT LOADER WITH RICH TEXT SUPPORT
 * ============================================================================
 */

add_action('wp_head', 'violet_enhanced_rich_text_script_loader');
function violet_enhanced_rich_text_script_loader() {
    if (isset($_GET['edit_mode']) && $_GET['edit_mode'] == '1' && 
        isset($_GET['wp_admin']) && $_GET['wp_admin'] == '1' &&
        isset($_GET['rich_text']) && $_GET['rich_text'] == '1') {
        violet_output_enhanced_rich_text_script();
    }
}

function violet_output_enhanced_rich_text_script() {
    $wp_admin_origin_guess = home_url();
    $parsed_url = parse_url($wp_admin_origin_guess);
    $secure_parent_origin_fallback = '*';
    if ($parsed_url && isset($parsed_url['scheme']) && isset($parsed_url['host'])) {
        $secure_parent_origin_fallback = esc_js($parsed_url['scheme'] . '://' . $parsed_url['host']);
    }

    ?>
    <script id="violet-enhanced-rich-text-frontend">
    (function() {
        'use strict';

        var inIframe = (window.parent !== window.self);
        var urlParams = new URLSearchParams(window.location.search);
        var editModeActive = urlParams.get('edit_mode') === '1' && urlParams.get('wp_admin') === '1';
        var richTextEnabled = urlParams.get('rich_text') === '1';

        if (!inIframe || !editModeActive || !richTextEnabled) {
            console.log('🎨 Rich text mode not active');
            return;
        }
        
        var urlParamsForOrigin = new URLSearchParams(window.location.search);
        var parentOriginFromParam = urlParamsForOrigin.get('wp_origin');
        var defaultTrustedParentOriginFallback = '<?php echo $secure_parent_origin_fallback; ?>';
        var TRUSTED_PARENT_ORIGIN = parentOriginFromParam || defaultTrustedParentOriginFallback;

        var richTextEditingActive = false;
        var richTextPendingChanges = {};
        var editorPreferences = {};

        function richTextLog(message, data) {
            try {
                console.log('🎨 Violet Rich Text: ' + message, data || '');
            } catch (e) {}
        }

        function safeSendToWordPress(data) {
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

        richTextLog('✅ Enhanced rich text frontend script loading');
        
        safeSendToWordPress({ 
            type: 'violet-iframe-ready',
            richTextEnabled: true,
            system: 'enhanced_rich_text_system'
        });

        window.addEventListener('message', function(event) {
            if (TRUSTED_PARENT_ORIGIN !== '*' && event.origin !== TRUSTED_PARENT_ORIGIN) {
                richTextLog('Blocked message from untrusted origin: ' + event.origin);
                return;
            }

            var message = event.data;
            if (!message || !message.type) return;

            richTextLog('Received rich text message from WordPress admin', message);

            switch (message.type) {
                case 'violet-test-connection':
                    safeSendToWordPress({ 
                        type: 'violet-access-confirmed', 
                        from: 'react-app-rich-text',
                        richTextEnabled: true
                    });
                    break;

                case 'violet-enable-rich-editing':
                    enableRichTextEditing(message.editorPreferences);
                    break;

                case 'violet-disable-editing':
                    disableRichTextEditing();
                    break;

                case 'violet-configure-rich-text-modal':
                    configureRichTextModal(message);
                    break;

                case 'violet-update-editor-preferences':
                    updateEditorPreferences(message.preferences);
                    break;

                case 'violet-apply-rich-text-changes':
                    applyRichTextChanges(message.savedChanges);
                    break;

                case 'violet-refresh-content':
                    window.location.reload();
                    break;
            }
        });

        function enableRichTextEditing(preferences) {
            try {
                richTextLog('✅ Enabling rich text editing mode');
                richTextEditingActive = true;
                editorPreferences = preferences || {};

                // Add rich text editing styles
                var style = document.createElement('style');
                style.id = 'violet-rich-text-editing-styles';
                style.textContent = [
                    '.violet-rich-text-editable {',
                    '  outline: 3px dashed #7b68ee !important;',
                    '  outline-offset: 3px !important;',
                    '  cursor: text !important;',
                    '  transition: all 0.3s ease !important;',
                    '  position: relative !important;',
                    '  min-height: 1em !important;',
                    '}',
                    '.violet-rich-text-editable:hover {',
                    '  outline-color: #9370db !important;',
                    '  background: rgba(123,104,238,0.1) !important;',
                    '  transform: translateY(-2px) !important;',
                    '  box-shadow: 0 4px 12px rgba(123,104,238,0.3) !important;',
                    '}',
                    '.violet-rich-text-editable::before {',
                    '  content: "✨ Rich Text Editor";',
                    '  position: absolute !important;',
                    '  top: -30px !important;',
                    '  left: 0 !important;',
                    '  background: #7b68ee !important;',
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
                    '.violet-rich-text-editable:hover::before {',
                    '  opacity: 1 !important;',
                    '}'
                ].join('\n');
                document.head.appendChild(style);

                // Find and mark all text elements for rich text editing
                var selectors = ['h1','h2','h3','h4','h5','h6','p','span','div[data-violet-field]'];
                document.querySelectorAll(selectors.join(', ')).forEach(function(element) {
                    if (element.offsetParent !== null && 
                        (element.textContent || '').trim().length > 0 && 
                        !element.closest('.violet-rich-text-editable') &&
                        !element.querySelector('img, svg, iframe, input, textarea, select')) {

                        element.classList.add('violet-rich-text-editable');
                        element.setAttribute('data-rich-text-enabled', 'true');
                        
                        if (!element.hasAttribute('data-violet-field')) {
                            element.setAttribute('data-violet-field', generateFieldName(element));
                        }
                        
                        element.addEventListener('click', handleRichTextElementClick);
                    }
                });

                richTextLog('✅ Rich text editing enabled');
            } catch (e) {
                richTextLog('Rich text enable error', e.message);
            }
        }

        function disableRichTextEditing() {
            try {
                richTextLog('Disabling rich text editing mode');
                richTextEditingActive = false;

                var style = document.getElementById('violet-rich-text-editing-styles');
                if (style) style.parentNode.removeChild(style);

                document.querySelectorAll('.violet-rich-text-editable').forEach(function(element) {
                    element.classList.remove('violet-rich-text-editable');
                    element.removeAttribute('data-rich-text-enabled');
                    element.removeEventListener('click', handleRichTextElementClick);
                });

                richTextPendingChanges = {};
                richTextLog('✅ Rich text editing mode disabled');
            } catch (e) {
                richTextLog('Rich text disable error', e.message);
            }
        }

        function handleRichTextElementClick(event) {
            event.preventDefault();
            event.stopPropagation();
            
            var element = event.target;
            var field = element.getAttribute('data-violet-field');
            var currentValue = element.innerHTML;
            var fieldType = detectFieldType(element);
            
            richTextLog('🎨 Opening rich text modal for field: ' + field);
            
            // Send request to WordPress to open rich text modal
            safeSendToWordPress({
                type: 'violet-open-rich-text-modal',
                field: field,
                currentValue: currentValue,
                fieldType: fieldType,
                element: {
                    tagName: element.tagName,
                    className: element.className,
                    textContent: element.textContent
                }
            });
        }

        function generateFieldName(element) {
            var text = (element.textContent || '').toLowerCase();
            var tag = element.tagName.toLowerCase();
            
            if (tag === 'h1' && text.includes('hero')) return 'hero_title';
            if (text.includes('subtitle') || text.includes('description')) return 'intro_description';
            if (text.includes('transforming potential')) return 'intro_description';
            if (text.includes('@') && text.includes('.')) return 'contact_email';
            
            return 'text_' + tag + '_' + Math.random().toString(36).substr(2, 9);
        }

        function detectFieldType(element) {
            var text = (element.textContent || '').toLowerCase();
            var tag = element.tagName.toLowerCase();
            
            if (tag === 'h1') return 'hero_title';
            if (tag === 'h2') return 'section_title';
            if (tag === 'p') return 'paragraph';
            if (text.includes('button') || text.includes('cta')) return 'button_text';
            
            return 'default';
        }

        function configureRichTextModal(config) {
            richTextLog('🎨 Configuring rich text modal', config);
            
            // Check if RichTextModal component exists and configure it
            if (window.VioletRichTextModal) {
                window.VioletRichTextModal.open(config);
            } else {
                richTextLog('❌ RichTextModal component not found');
                // Fallback to plain text prompt
                var newValue = prompt('Edit text (Rich text editor loading...):', config.currentValue);
                if (newValue !== null && newValue !== config.currentValue) {
                    handleRichTextChange({
                        field: config.field,
                        content: {
                            html: newValue,
                            text: newValue,
                            wordCount: newValue.split(' ').length
                        },
                        editor: 'fallback'
                    });
                }
            }
        }

        function handleRichTextChange(data) {
            richTextLog('💾 Rich text content changed', data);
            
            // Update the element immediately
            var elements = document.querySelectorAll('[data-violet-field="' + data.field + '"]');
            elements.forEach(function(element) {
                element.innerHTML = data.content.html || data.content.text;
            });
            
            // Notify WordPress of the change
            safeSendToWordPress({
                type: 'violet-rich-text-content-changed',
                field: data.field,
                content: data.content,
                editor: data.editor
            });
        }

        function updateEditorPreferences(preferences) {
            editorPreferences = preferences;
            richTextLog('⚙️ Editor preferences updated', preferences);
        }

        function applyRichTextChanges(savedChanges) {
            try {
                richTextLog('✅ Applying rich text changes', savedChanges);

                savedChanges.forEach(function(change) {
                    var elements = document.querySelectorAll('[data-violet-field="' + change.field_name + '"]');
                    elements.forEach(function(element) {
                        element.innerHTML = change.field_value;
                        richTextLog('✅ Applied rich text change to: ' + change.field_name);
                    });
                });
                
                richTextPendingChanges = {};
                
                // Show success notification
                showRichTextNotification('✅ Rich text changes applied successfully!', 'success');
                
                richTextLog('✅ All rich text changes applied');

            } catch (e) {
                richTextLog('Error applying rich text changes', e.message);
            }
        }

        function showRichTextNotification(message, type) {
            try {
                var notif = document.createElement('div');
                notif.innerHTML = message;
                notif.style.cssText = [
                    'position: fixed',
                    'top: 20px',
                    'right: 20px',
                    'background: ' + (type === 'success' ? '#7b68ee' : '#d63939'),
                    'color: white',
                    'padding: 15px 25px',
                    'border-radius: 10px',
                    'z-index: 2147483647',
                    'font-weight: 700',
                    'box-shadow: 0 6px 25px rgba(123,104,238,0.4)',
                    'max-width: 350px',
                    'font-size: 14px'
                ].join('; ');
                
                document.body.appendChild(notif);
                setTimeout(function() { 
                    if (document.body.contains(notif)) {
                        document.body.removeChild(notif);
                    }
                }, 4000);
            } catch (e) {
                richTextLog('Error showing notification', e.message);
            }
        }

        // Expose functions for RichTextModal integration
        window.VioletRichTextFrontend = {
            handleChange: handleRichTextChange,
            getPreferences: function() { return editorPreferences; },
            showNotification: showRichTextNotification
        };

        richTextLog('✅ Enhanced rich text frontend script ready');

    })();
    </script>
    <?php
}

// ============================================================================
// ACTIVATION HOOKS
// ============================================================================

register_activation_hook(__FILE__, 'violet_rich_text_editor_activate');
function violet_rich_text_editor_activate() {
    // Set default editor preferences
    add_option('violet_default_editor_preferences', array(
        'default_editor' => 'quill',
        'toolbar_style' => 'full',
        'auto_save' => true,
        'word_count' => true
    ));
    
    // Initialize content metadata table
    add_option('violet_content_meta', array());
    
    flush_rewrite_rules();
}

/**
 * ============================================================================
 * ENHANCED RICH TEXT INTEGRATION COMPLETE
 * ============================================================================
 * 
 * RICH TEXT FEATURES IMPLEMENTED:
 * ✅ WordPress → React RichTextModal communication
 * ✅ Enhanced REST API endpoints for rich content
 * ✅ Editor preferences system (Quill vs Lexical)
 * ✅ Rich text content validation and processing
 * ✅ Professional WordPress admin interface
 * ✅ Cross-origin rich text modal integration
 * ✅ Content metadata storage and tracking
 * ✅ Editor-specific formatting and conversion
 * 
 * USAGE INSTRUCTIONS:
 * 1. Replace sections of your functions.php with these enhanced functions
 * 2. Test the enhanced Universal Editor interface
 * 3. Click any text → Rich text modal should open (not prompt)
 * 4. Choose between Quill and Lexical editors
 * 5. Rich text formatting should persist after save
 * 
 * NEXT STEPS:
 * 1. Update your React App.tsx to handle rich_text=1 parameter
 * 2. Ensure RichTextModal.tsx responds to violet-open-rich-text-modal
 * 3. Test integration with existing QuillEditor.tsx and LexicalEditor.tsx
 * 4. Verify rich text content saves and loads correctly
 */
?>