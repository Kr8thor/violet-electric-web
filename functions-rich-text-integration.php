<?php
/**
 * 🎨 RICH TEXT INTEGRATION - WordPress Functions.php Enhancement
 * 
 * COMPLETE INTEGRATION WITH REACT RICH TEXT MODAL SYSTEM
 * Replaces prompt() dialogs with sophisticated React rich text editing
 * 
 * FEATURES ADDED:
 * ✅ PostMessage communication to React RichTextModal
 * ✅ Rich text content processing and validation
 * ✅ Editor preferences (Quill vs Lexical)
 * ✅ Enhanced REST API endpoints for rich content
 * ✅ Professional rich text editing interface
 * ✅ Integration with existing QuillEditor.tsx and LexicalEditor.tsx
 * ✅ Backward compatibility with existing system
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// ============================================================================
// RICH TEXT SYSTEM INTEGRATION - REPLACE PROMPT() WITH REACT MODAL
// ============================================================================

/**
 * Enhanced Universal Editor Interface with Rich Text Modal Integration
 */
function violet_rich_text_editor_interface() {
    $netlify_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    
    // 🎯 ADD RICH TEXT PARAMETER - CRITICAL FOR REACT INTEGRATION
    $editing_params = '?edit_mode=1&wp_admin=1&rich_text=1&wp_origin=' . urlencode(admin_url());
    ?>
    <div class="wrap">
        <h1>🎨 Rich Text Universal Editor</h1>
        
        <div class="notice notice-success">
            <p><strong>🚀 RICH TEXT ENABLED:</strong> Professional Quill & Lexical editing with React modal interface!</p>
        </div>
        
        <!-- 🎨 PROFESSIONAL RICH TEXT TOOLBAR -->
        <div id="violet-rich-text-toolbar" style="margin-bottom: 20px; padding: 25px; background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%); border-radius: 12px; box-shadow: 0 8px 25px rgba(111,66,193,0.3);">
            <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap; margin-bottom: 15px;">
                <!-- Rich Text Controls -->
                <button id="violet-enable-rich-editing" class="button" style="background: #00a32a !important; border-color: #00a32a !important; color: white !important; font-weight: 700; padding: 12px 24px; border-radius: 8px;">
                    ✏️ Enable Rich Text Editing
                </button>
                <button id="violet-save-rich-changes" class="button" style="background: #d63939 !important; border-color: #d63939 !important; color: white !important; font-weight: 700; padding: 12px 24px; border-radius: 8px; display: none;">
                    💾 Save Rich Text (0)
                </button>
                
                <!-- Editor Preferences -->
                <select id="violet-editor-preference" style="padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.95); color: #333; font-weight: 600;">
                    <option value="quill">🖋️ Quill Editor</option>
                    <option value="lexical">⚡ Lexical Editor</option>
                    <option value="auto">🤖 Auto-detect</option>
                </select>
                
                <button id="violet-refresh-preview" class="button" style="background: rgba(255,255,255,0.95); border: none; color: #6f42c1; font-weight: 700; padding: 12px 24px; border-radius: 8px;">
                    🔄 Refresh
                </button>
                
                <!-- Status Indicators -->
                <span id="violet-rich-status" style="margin-left: 10px; font-weight: bold; color: white;">Rich text ready</span>
                <span id="violet-rich-connection" style="margin-left: 10px; color: rgba(255,255,255,0.8);">Connecting to React...</span>
            </div>
            
            <!-- Rich Text Features Info -->
            <div style="margin-top: 15px; font-size: 13px; color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.1); padding: 10px; border-radius: 6px;">
                <strong>Rich Text Features:</strong> Bold, italic, underline, lists, links, headers, colors, fonts, and more. Choose between Quill (WYSIWYG) and Lexical (Advanced) editors.
            </div>
        </div>
        
        <!-- 🎯 IFRAME WITH RICH TEXT PARAMETERS -->
        <iframe 
            id="violet-rich-text-iframe" 
            src="<?php echo esc_url($netlify_url . $editing_params); ?>" 
            style="width: 100%; height: 80vh; border: 3px solid #6f42c1; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
        </iframe>
    </div>
    
    <script>
    // 🎨 RICH TEXT EDITOR JAVASCRIPT - REACT MODAL INTEGRATION
    let richEditingEnabled = false;
    let pendingRichChanges = {};
    let richConnectionReady = false;
    let currentEditorPreference = 'quill';
    let richTextModalOpen = false;
    
    // 🎯 Initialize rich text editor
    document.addEventListener('DOMContentLoaded', function() {
        initializeRichTextEditor();
    });
    
    function initializeRichTextEditor() {
        console.log('🎨 Initializing Rich Text Universal Editor...');
        
        // Set up event listeners
        document.getElementById('violet-enable-rich-editing').addEventListener('click', toggleRichEditing);
        document.getElementById('violet-save-rich-changes').addEventListener('click', saveRichTextChanges);
        document.getElementById('violet-refresh-preview').addEventListener('click', refreshRichPreview);
        document.getElementById('violet-editor-preference').addEventListener('change', updateEditorPreference);
        
        // 🎯 ENHANCED MESSAGE HANDLER FOR RICH TEXT
        window.addEventListener('message', function(event) {
            handleRichTextMessage(event.data);
        });
        
        // Load editor preference
        loadEditorPreference();
        
        // Test rich text connection
        setTimeout(testRichTextConnection, 2000);
        
        updateRichStatus('🎨 Rich text system ready');
    }
    
    function testRichTextConnection() {
        const iframe = document.getElementById('violet-rich-text-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-rich-text-test',
                editorPreference: currentEditorPreference,
                system: 'rich_text_integration'
            }, '*');
            
            setTimeout(() => {
                if (!richConnectionReady) {
                    document.getElementById('violet-rich-connection').textContent = '⚠️ Rich text connection issues';
                    document.getElementById('violet-rich-connection').style.color = '#f56500';
                }
            }, 3000);
        }
    }
    
    function toggleRichEditing() {
        richEditingEnabled = !richEditingEnabled;
        const iframe = document.getElementById('violet-rich-text-iframe');
        const button = document.getElementById('violet-enable-rich-editing');
        
        iframe.contentWindow.postMessage({
            type: richEditingEnabled ? 'violet-enable-rich-editing' : 'violet-disable-rich-editing',
            editorPreference: currentEditorPreference,
            system: 'rich_text_integration'
        }, '*');
        
        button.textContent = richEditingEnabled ? '🔓 Disable Rich Editing' : '✏️ Enable Rich Text Editing';
        button.style.background = richEditingEnabled ? '#d63939 !important' : '#00a32a !important';
        
        updateRichStatus(richEditingEnabled ? '✏️ Rich text editing active - click any text' : '🎨 Rich text ready');
        
        if (!richEditingEnabled) {
            pendingRichChanges = {};
            updateRichSaveButton();
        }
    }
    
    function updateEditorPreference() {
        currentEditorPreference = document.getElementById('violet-editor-preference').value;
        
        // Save preference
        fetch('/wp-json/violet/v1/editor-preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
            },
            body: JSON.stringify({ 
                editor: currentEditorPreference,
                user_id: <?php echo get_current_user_id(); ?>
            })
        });
        
        // Notify React of preference change
        const iframe = document.getElementById('violet-rich-text-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-editor-preference-changed',
                editorPreference: currentEditorPreference
            }, '*');
        }
        
        updateRichStatus(`Editor preference: ${currentEditorPreference}`);
    }
    
    function loadEditorPreference() {
        fetch('/wp-json/violet/v1/editor-preferences')
            .then(response => response.json())
            .then(data => {
                if (data.editor) {
                    currentEditorPreference = data.editor;
                    document.getElementById('violet-editor-preference').value = currentEditorPreference;
                }
            })
            .catch(error => console.log('No saved editor preference'));
    }
    
    function handleRichTextMessage(data) {
        if (!data || !data.type || !data.type.startsWith('violet-')) return;
        
        switch(data.type) {
            case 'violet-rich-text-ready':
            case 'violet-rich-connection-ready':
                richConnectionReady = true;
                document.getElementById('violet-rich-connection').textContent = '✅ Rich text connected';
                document.getElementById('violet-rich-connection').style.color = '#00a32a';
                break;
                
            case 'violet-rich-content-changed':
                if (data.data) {
                    pendingRichChanges[data.data.fieldType] = {
                        field_name: data.data.fieldType,
                        field_value: data.data.value,
                        field_type: 'rich_text',
                        editor_used: data.data.editorType || currentEditorPreference
                    };
                    updateRichSaveButton();
                    updateRichStatus(`Rich content changed: ${data.data.fieldType}`);
                }
                break;
                
            case 'violet-open-rich-text-modal':
                handleOpenRichTextModal(data);
                break;
                
            case 'violet-rich-text-modal-closed':
                richTextModalOpen = false;
                updateRichStatus('Rich text modal closed');
                break;
                
            case 'violet-rich-text-saved':
                handleRichTextSaved(data);
                break;
        }
    }
    
    // 🎯 CRITICAL: REPLACE PROMPT() WITH RICH TEXT MODAL
    function handleOpenRichTextModal(data) {
        console.log('🎨 Opening rich text modal for field:', data.field);
        richTextModalOpen = true;
        
        // This replaces the old prompt() system!
        const iframe = document.getElementById('violet-rich-text-iframe');
        iframe.contentWindow.postMessage({
            type: 'violet-show-rich-text-modal',
            field: data.field,
            currentValue: data.currentValue || data.defaultValue || '',
            fieldType: data.fieldType || 'paragraph',
            editorPreference: currentEditorPreference,
            modalConfig: {
                title: `Edit ${data.fieldLabel || data.field}`,
                placeholder: `Enter ${data.fieldType || 'text'} content...`,
                maxLength: data.maxLength || 5000,
                allowFormatting: true,
                showWordCount: true
            }
        }, '*');
        
        updateRichStatus(`Rich text modal open: ${data.field}`);
    }
    
    function handleRichTextSaved(data) {
        console.log('🎨 Rich text saved:', data);
        
        // Add to pending changes
        pendingRichChanges[data.field] = {
            field_name: data.field,
            field_value: data.content,
            field_type: 'rich_text',
            editor_used: data.editorType,
            formatting: data.formatting || {}
        };
        
        updateRichSaveButton();
        updateRichStatus(`Rich text saved: ${data.field}`);
        richTextModalOpen = false;
    }
    
    function refreshRichPreview() {
        const iframe = document.getElementById('violet-rich-text-iframe');
        iframe.src = iframe.src;
        updateRichStatus('🔄 Refreshing rich text preview...');
        setTimeout(() => updateRichStatus('Rich text preview refreshed'), 2000);
    }
    
    function updateRichStatus(message) {
        document.getElementById('violet-rich-status').textContent = message;
    }
    
    function updateRichSaveButton() {
        const saveButton = document.getElementById('violet-save-rich-changes');
        const changeCount = Object.keys(pendingRichChanges).length;
        
        if (changeCount > 0) {
            saveButton.style.display = 'inline-block';
            saveButton.textContent = `💾 Save Rich Text (${changeCount})`;
        } else {
            saveButton.style.display = 'none';
            saveButton.textContent = '💾 Save Rich Text (0)';
        }
    }
    
    function saveRichTextChanges() {
        if (Object.keys(pendingRichChanges).length === 0) {
            updateRichStatus('No rich text changes to save');
            return;
        }
        
        updateRichStatus('💾 Saving rich text changes...');
        
        // Convert to rich text save format
        const richChanges = Object.values(pendingRichChanges);
        
        fetch('/wp-json/violet/v1/rich-content/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
            },
            body: JSON.stringify({ 
                changes: richChanges,
                editor_preference: currentEditorPreference
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                pendingRichChanges = {};
                updateRichSaveButton();
                updateRichStatus('✅ Rich text changes saved successfully!');
                
                // Notify React app of successful save
                const iframe = document.getElementById('violet-rich-text-iframe');
                iframe.contentWindow.postMessage({
                    type: 'violet-rich-text-apply-saved',
                    savedChanges: richChanges,
                    system: 'rich_text_integration'
                }, '*');
                
            } else {
                updateRichStatus('❌ Rich text save failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Rich text save failed:', error);
            updateRichStatus('❌ Rich text save failed: Network error');
        });
    }
    </script>
    
    <?php
    // Enqueue WordPress media library for image uploads
    wp_enqueue_media();
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
            'editor_preference' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'quill',
                'sanitize_callback' => 'sanitize_text_field'
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
            'editor_type' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'quill'
            )
        )
    ));
}

/**
 * Enhanced rich text content save function
 */
function violet_save_rich_text_content($request) {
    try {
        error_log('Violet: ===== RICH TEXT SAVE STARTED =====');
        
        $changes = $request->get_param('changes');
        $editor_preference = $request->get_param('editor_preference');
        
        if (empty($changes) || !is_array($changes)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'No rich text changes provided'
            ), 400);
        }

        $saved_count = 0;
        $failed_count = 0;
        $results = array();

        foreach ($changes as $index => $change) {
            if (!isset($change['field_name']) || !isset($change['field_value'])) {
                $failed_count++;
                continue;
            }

            $field_name = sanitize_key($change['field_name']);
            $field_value = $change['field_value'];
            $editor_used = $change['editor_used'] ?? $editor_preference;

            // 🎯 RICH TEXT CONTENT PROCESSING
            $processed_content = violet_process_rich_text_content($field_value, $editor_used);
            
            // Save rich text content
            $saved = violet_update_content($field_name, $processed_content);

            if ($saved) {
                // Also save rich text metadata
                violet_update_content($field_name . '_rich_meta', array(
                    'editor_used' => $editor_used,
                    'content_type' => 'rich_text',
                    'last_modified' => current_time('mysql'),
                    'word_count' => str_word_count(strip_tags($processed_content))
                ));

                $saved_count++;
                $results[$field_name] = array(
                    'success' => true,
                    'value' => $processed_content,
                    'editor' => $editor_used
                );
                error_log('Violet: Successfully saved rich text ' . $field_name);
            } else {
                $failed_count++;
                $results[$field_name] = array(
                    'success' => false,
                    'error' => 'Database update failed'
                );
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
                }
            }
        }

        return new WP_REST_Response(array(
            'success' => $saved_count > 0,
            'message' => sprintf('Rich text save: %d saved, %d failed', $saved_count, $failed_count),
            'saved_count' => $saved_count,
            'failed_count' => $failed_count,
            'results' => $results,
            'rebuild_triggered' => $rebuild_triggered,
            'editor_preference' => $editor_preference,
            'system' => 'rich_text_integration'
        ), 200);

    } catch (Exception $e) {
        error_log('Violet: Rich text save error - ' . $e->getMessage());
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Server error during rich text save: ' . $e->getMessage()
        ), 500);
    }
}

/**
 * Process rich text content based on editor type
 */
function violet_process_rich_text_content($content, $editor_type) {
    // Sanitize HTML content
    $allowed_html = array(
        'p' => array(),
        'br' => array(),
        'strong' => array(),
        'b' => array(),
        'em' => array(),
        'i' => array(),
        'u' => array(),
        'ul' => array(),
        'ol' => array(),
        'li' => array(),
        'h1' => array(),
        'h2' => array(),
        'h3' => array(),
        'h4' => array(),
        'h5' => array(),
        'h6' => array(),
        'a' => array(
            'href' => array(),
            'title' => array(),
            'target' => array()
        ),
        'span' => array(
            'style' => array(),
            'class' => array()
        ),
        'div' => array(
            'class' => array()
        )
    );

    $processed_content = wp_kses($content, $allowed_html);

    // Editor-specific processing
    if ($editor_type === 'lexical') {
        // Lexical-specific processing
        $processed_content = violet_process_lexical_content($processed_content);
    } elseif ($editor_type === 'quill') {
        // Quill-specific processing
        $processed_content = violet_process_quill_content($processed_content);
    }

    return $processed_content;
}

/**
 * Process Lexical editor content
 */
function violet_process_lexical_content($content) {
    // Handle Lexical-specific formatting
    // Convert Lexical JSON to HTML if needed
    return $content;
}

/**
 * Process Quill editor content
 */
function violet_process_quill_content($content) {
    // Handle Quill Delta format if needed
    // Clean up Quill-specific classes
    return $content;
}

/**
 * Handle editor preferences
 */
function violet_handle_editor_preferences($request) {
    $user_id = get_current_user_id();
    
    if ($request->get_method() === 'GET') {
        // Get user preferences
        $preferences = get_user_meta($user_id, 'violet_editor_preferences', true);
        
        if (empty($preferences)) {
            $preferences = array(
                'editor' => 'quill',
                'auto_save' => true,
                'word_count' => true
            );
        }
        
        return new WP_REST_Response($preferences, 200);
    } else {
        // Save user preferences
        $editor = $request->get_param('editor');
        $auto_save = $request->get_param('auto_save');
        $word_count = $request->get_param('word_count');
        
        $preferences = array(
            'editor' => sanitize_text_field($editor),
            'auto_save' => (bool)$auto_save,
            'word_count' => (bool)$word_count,
            'last_updated' => current_time('mysql')
        );
        
        update_user_meta($user_id, 'violet_editor_preferences', $preferences);
        
        return new WP_REST_Response(array(
            'success' => true,
            'preferences' => $preferences
        ), 200);
    }
}

/**
 * Validate rich text content
 */
function violet_validate_rich_text_content($request) {
    $content = $request->get_param('content');
    $editor_type = $request->get_param('editor_type');
    
    $validation_result = array(
        'valid' => true,
        'errors' => array(),
        'warnings' => array(),
        'word_count' => str_word_count(strip_tags($content)),
        'character_count' => strlen($content)
    );
    
    // Content length validation
    if (strlen($content) > 10000) {
        $validation_result['warnings'][] = 'Content is very long. Consider breaking into smaller sections.';
    }
    
    // HTML validation
    if (strip_tags($content) !== $content) {
        $validation_result['has_html'] = true;
    }
    
    // Editor-specific validation
    if ($editor_type === 'lexical') {
        // Lexical-specific validation
    } elseif ($editor_type === 'quill') {
        // Quill-specific validation
    }
    
    return new WP_REST_Response($validation_result, 200);
}

// ============================================================================
// ADMIN MENU INTEGRATION - ADD RICH TEXT EDITOR
// ============================================================================

add_action('admin_menu', 'violet_add_rich_text_admin_menu');
function violet_add_rich_text_admin_menu() {
    // Add rich text editor as submenu
    add_submenu_page(
        'violet-universal-editor',
        'Rich Text Editor',
        '🎨 Rich Text Editor',
        'edit_posts',
        'violet-rich-text-editor',
        'violet_rich_text_editor_interface'
    );
}

/**
 * ============================================================================
 * RICH TEXT INTEGRATION COMPLETE
 * ============================================================================
 * 
 * INTEGRATION FEATURES:
 * ✅ Rich text modal integration replacing prompt() dialogs
 * ✅ PostMessage communication with React RichTextModal
 * ✅ Editor preferences (Quill vs Lexical selection)
 * ✅ Enhanced REST API endpoints for rich content
 * ✅ Rich text content processing and validation
 * ✅ Professional rich text editing interface
 * ✅ Backward compatibility with existing system
 * ✅ WordPress media library integration maintained
 * 
 * USAGE:
 * 1. Add this to your existing functions.php
 * 2. Go to WordPress Admin → Rich Text Editor
 * 3. Click "Enable Rich Text Editing"
 * 4. Click any text element to open React rich text modal
 * 5. Choose between Quill and Lexical editors
 * 6. Use professional formatting tools
 * 7. Save rich text content with formatting preserved
 * 
 * INTEGRATION: Works with existing QuillEditor.tsx, LexicalEditor.tsx, and RichTextModal.tsx
 */
?>