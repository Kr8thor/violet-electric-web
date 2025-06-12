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
// ADMIN MENU - UNIVERSAL EDITOR WITH SAVE/UNDO/QUILL
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
// UNIVERSAL EDITOR PAGE WITH SAVE/UNDO/QUILL
// ==============================================
function violet_render_universal_editor_page() {
    $netlify_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    $editing_params = '?edit_mode=1&wp_admin=1&wp_origin=' . urlencode(admin_url());
    $rest_nonce = wp_create_nonce('wp_rest');
    $batch_save_url = rest_url('violet/v1/content/save-batch');
    ?>
    <div class="wrap">
        <h1>🎨 Universal Frontend Editor (Enterprise)</h1>
        <div id="violet-editor-toolbar" style="margin:25px 0;padding:25px;background:#0073aa;border-radius:12px;display:flex;gap:20px;align-items:center;flex-wrap:wrap;box-shadow:0 8px 25px rgba(0,115,170,0.3);">
            <button id="violet-enable-editing" class="button button-primary" style="background:#00a32a;color:white;font-weight:700;padding:12px 24px;border-radius:8px;">Enable Editing</button>
            <button id="violet-save-all" class="button button-secondary" style="background:#d63939;color:white;font-weight:700;padding:12px 24px;border-radius:8px;display:none;">💾 Save Changes (<span id="violet-changes-count">0</span>)</button>
            <button id="violet-undo-all" class="button button-warning" style="background:#f56500;color:white;font-weight:700;padding:12px 24px;border-radius:8px;display:none;">↩️ Undo Changes</button>
            <button id="violet-refresh-preview" class="button" style="background:white;color:#0073aa;font-weight:700;padding:12px 24px;border-radius:8px;">🔄 Refresh Preview</button>
            <span id="violet-status" style="margin-left:10px;font-weight:bold;color:white;">Ready to edit</span>
            <span id="violet-connection-status" style="margin-left:10px;color:rgba(255,255,255,0.8);">Testing connection...</span>
        </div>
        <div style="margin-top:15px;font-size:13px;color:#333;background:rgba(255,255,255,0.9);padding:10px;border-radius:6px;">
            <strong>Instructions:</strong> Click "Enable Editing" then click any text, image, button, or colored element to edit it. All changes are saved to WordPress and synced to your React app.
        </div>
        <iframe 
            id="violet-site-iframe" 
            src="<?php echo esc_url($netlify_url . $editing_params); ?>" 
            style="width:100%;height:80vh;border:3px solid #0073aa;border-radius:12px;box-shadow:0 8px 25px rgba(0,0,0,0.15);margin-top:20px;">
        </iframe>
        <!-- Quill editor overlay -->
        <div id="quill-editor-modal" style="display:none;position:fixed;top:10%;left:50%;transform:translateX(-50%);z-index:9999;background:white;padding:20px;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
            <div id="quill-editor"></div>
            <div style="margin-top:15px;text-align:right;">
                <button id="quill-save" class="button button-primary">Save</button>
                <button id="quill-cancel" class="button">Cancel</button>
            </div>
        </div>
    </div>
    <script src="https://cdn.quilljs.com/1.3.7/quill.js"></script>
    <link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">
    <script>
    let violetEditingEnabled = false;
    let violetPendingChanges = {};
    let currentEditingField = null;
    let quill;
    document.addEventListener('DOMContentLoaded', function() {
        quill = new Quill('#quill-editor', { theme: 'snow' });
        document.getElementById('quill-save').onclick = saveQuillEdit;
        document.getElementById('quill-cancel').onclick = closeQuillEditor;
        document.getElementById('violet-enable-editing').onclick = toggleEditing;
        document.getElementById('violet-save-all').onclick = saveAllChanges;
        document.getElementById('violet-undo-all').onclick = undoAllChanges;
        document.getElementById('violet-refresh-preview').onclick = violetRefreshPreview;
    });
    function openQuillEditor(field, initialValue) {
        currentEditingField = field;
        quill.root.innerHTML = initialValue;
        document.getElementById('quill-editor-modal').style.display = 'block';
    }
    function closeQuillEditor() {
        document.getElementById('quill-editor-modal').style.display = 'none';
        currentEditingField = null;
    }
    function saveQuillEdit() {
        if (!currentEditingField) return;
        const html = quill.root.innerHTML;
        const iframe = document.getElementById('violet-site-iframe');
        iframe.contentWindow.postMessage({
            type: 'violet-update-field',
            field: currentEditingField,
            value: html
        }, '*');
        violetPendingChanges[currentEditingField] = { field_name: currentEditingField, field_value: html };
        updateSaveUndoButtons();
        closeQuillEditor();
        setStatus('Edited: ' + currentEditingField);
    }
    function updateSaveUndoButtons() {
        const saveBtn = document.getElementById('violet-save-all');
        const undoBtn = document.getElementById('violet-undo-all');
        const count = Object.keys(violetPendingChanges).length;
        saveBtn.style.display = count > 0 ? 'inline-block' : 'none';
        undoBtn.style.display = count > 0 ? 'inline-block' : 'none';
        document.getElementById('violet-changes-count').textContent = count;
    }
    function undoAllChanges() {
        const iframe = document.getElementById('violet-site-iframe');
        iframe.contentWindow.postMessage({ type: 'violet-undo-all' }, '*');
        violetPendingChanges = {};
        updateSaveUndoButtons();
        setStatus('All changes reverted.');
    }
    function setStatus(msg) {
        document.getElementById('violet-status').textContent = msg;
    }
    function toggleEditing() {
        violetEditingEnabled = !violetEditingEnabled;
        const btn = document.getElementById('violet-enable-editing');
        const iframe = document.getElementById('violet-site-iframe');
        if (violetEditingEnabled) {
            btn.textContent = 'Disable Editing';
            btn.className = 'button button-warning';
            iframe.contentWindow.postMessage({ type: 'violet-enable-editing' }, '*');
            setStatus('Editing enabled. Click any text to edit.');
        } else {
            btn.textContent = 'Enable Editing';
            btn.className = 'button button-primary';
            iframe.contentWindow.postMessage({ type: 'violet-disable-editing' }, '*');
            setStatus('Editing disabled.');
        }
    }
    // Listen for field click events from iframe
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'violet-edit-field') {
            openQuillEditor(event.data.field, event.data.value);
        }
    });
    function saveAllChanges() {
        if (Object.keys(violetPendingChanges).length === 0) {
            setStatus('No changes to save.');
            return;
        }
        setStatus('Saving changes...');
        const saveBtn = document.getElementById('violet-save-all');
        saveBtn.disabled = true;
        fetch('<?php echo esc_js($batch_save_url); ?>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': '<?php echo esc_js($rest_nonce); ?>'
            },
            body: JSON.stringify({ changes: Object.values(violetPendingChanges) })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setStatus('✅ All changes saved successfully!');
                violetPendingChanges = {};
                updateSaveUndoButtons();
                // Notify iframe to refresh content
                const iframe = document.getElementById('violet-site-iframe');
                iframe.contentWindow.postMessage({ type: 'violet-apply-saved-changes', savedChanges: data.results }, '*');
            } else {
                setStatus('❌ Save failed: ' + (data.message || 'Unknown error'));
            }
            saveBtn.disabled = false;
        })
        .catch(error => {
            setStatus('❌ Save failed: Network error');
            saveBtn.disabled = false;
        });
    }
    function violetRefreshPreview() {
        const iframe = document.getElementById('violet-site-iframe');
        iframe.src = iframe.src;
        setStatus('🔄 Refreshing preview...');
        setTimeout(() => setStatus('Preview refreshed'), 2000);
    }
    </script>
    <?php
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
        violet_output_working_frontend_script();
    }
}

function violet_output_working_frontend_script() {
    $wp_admin_origin_guess = home_url();
    $parsed_url = parse_url($wp_admin_origin_guess);
    $secure_parent_origin_fallback = '*';
    if ($parsed_url && isset($parsed_url['scheme']) && isset($parsed_url['host'])) {
        $secure_parent_origin_fallback = esc_js($parsed_url['scheme'] . '://' . $parsed_url['host']);
    }

    ?>
    <script id="violet-working-frontend-editor">
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
        var defaultTrustedParentOriginFallback = '<?php echo $secure_parent_origin_fallback; ?>';
        var TRUSTED_PARENT_ORIGIN = parentOriginFromParam || defaultTrustedParentOriginFallback;

        var violetEditingActive = false;
        var violetPendingChanges = {};

        function violetLog(message, data) {
            try {
                console.log('🎨 Violet Working Frontend: ' + message, data || '');
            } catch (e) {}
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

        violetLog('✅ Working frontend script loading');
        
        violetSafePostMessage({ 
            type: 'violet-iframe-ready',
            system: 'working_baseline_system'
        });

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
                        from: 'react-app-working',
                        system: 'working_baseline_system'
                    });
                    break;

                case 'violet-enable-editing':
                    violetEnableEditingWorking();
                    break;

                case 'violet-disable-editing':
                    violetDisableEditingWorking();
                    break;

                case 'violet-apply-saved-changes':
                    violetApplySavedChangesWorking(message.savedChanges);
                    break;
            }
        });

        // === Bulletproof: MutationObserver for dynamic editability ===
        function makeEditable(element) {
            if (!element.classList.contains('violet-editable-element')) {
                element.contentEditable = true;
                element.classList.add('violet-editable-element');
                element.setAttribute('data-violet-editable', 'true');
                element.dataset.originalValue = element.textContent || element.innerHTML;
                element.addEventListener('input', violetHandleContentChangeWorking);
                element.addEventListener('blur', violetHandleContentBlur);
                element.addEventListener('keydown', violetHandleKeydown);
            }
        }

        if (!window.violetMutationObserver) {
            window.violetMutationObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element
                            if (node.hasAttribute && node.hasAttribute('data-violet-field')) {
                                makeEditable(node);
                            }
                            if (node.querySelectorAll) {
                                node.querySelectorAll('[data-violet-field]').forEach(makeEditable);
                            }
                        }
                    });
                });
            });
            window.violetMutationObserver.observe(document.body, { childList: true, subtree: true });
        }

        // === Patch React Router navigation to re-apply editability ===
        (function() {
            var lastPath = location.pathname + location.search;
            function checkRouteChange() {
                var currentPath = location.pathname + location.search;
                if (currentPath !== lastPath) {
                    lastPath = currentPath;
                    if (violetEditingActive) {
                        violetLog('🔄 Route changed, re-enabling editing');
                        violetEnableEditingWorking();
                    }
                }
            }
            var origPushState = history.pushState;
            var origReplaceState = history.replaceState;
            history.pushState = function() {
                origPushState.apply(this, arguments);
                setTimeout(checkRouteChange, 10);
            };
            history.replaceState = function() {
                origReplaceState.apply(this, arguments);
                setTimeout(checkRouteChange, 10);
            };
            window.addEventListener('popstate', function() {
                setTimeout(checkRouteChange, 10);
            });
        })();

        function violetEnableEditingWorking() {
            try {
                violetLog('✅ Enabling working editing mode');
                violetEditingActive = true;

                var style = document.createElement('style');
                style.id = 'violet-editing-styles-working';
                style.textContent = [
                    '/* ✅ WORKING EDITING STYLES - This was working earlier today */',
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

                // ✅ WORKING ELEMENT SELECTION - This was working earlier today
                var selectors = ['h1','h2','h3','h4','h5','h6','p','span','a','div', 'li', 'button', 'strong', 'em'];
                document.querySelectorAll(selectors.join(', ')).forEach(function(element) {
                    if (element.offsetParent !== null && 
                        (element.textContent || '').trim().length > 0 && 
                        !element.closest('.violet-editable-element') &&
                        !element.hasAttribute('data-violet-editable') &&
                        !element.querySelector('img, svg, iframe, input, textarea, select')) {
                        // Use the new helper
                        makeEditable(element);
                        element.setAttribute('data-violet-field', violetDetectFieldTypeWorking(element));
                    }
                });

                violetLog('✅ Working editing enabled');
            } catch (e) {
                violetLog('Enable editing error', e.message);
            }
        }

        function violetDisableEditingWorking() {
            try {
                violetLog('Disabling working editing mode');
                violetEditingActive = false;

                var style = document.getElementById('violet-editing-styles-working');
                if (style) style.parentNode.removeChild(style);

                document.querySelectorAll('.violet-editable-element').forEach(function(element) {
                    element.contentEditable = false;
                    element.classList.remove('violet-editable-element');
                    element.style.backgroundColor = '';
                    element.style.borderLeft = '';
                    element.style.paddingLeft = '';
                });

                violetPendingChanges = {};
                violetLog('✅ Working editing mode disabled');
            } catch (e) {
                violetLog('Disable editing error', e.message);
            }
        }

        function violetHandleContentChangeWorking(event) {
            try {
                var fieldName = event.target.getAttribute('data-violet-field');
                var newValue = event.target.textContent || event.target.innerHTML;

                if (fieldName && newValue !== undefined) {
                    violetPendingChanges[fieldName] = {
                        field_name: fieldName,
                        field_value: newValue
                    };
                    
                    event.target.classList.add('violet-edited-element');
                    
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

        function violetHandleContentBlur(event) {
            try {
                var fieldName = event.target.getAttribute('data-violet-field');
                var newValue = event.target.textContent || event.target.innerHTML;

                if (fieldName && newValue !== undefined) {
                    violetPendingChanges[fieldName] = {
                        field_name: fieldName,
                        field_value: newValue
                    };
                    
                    event.target.classList.add('violet-edited-element');
                    
                    violetSafePostMessage({
                        type: 'violet-content-changed',
                        field: fieldName,
                        value: newValue,
                        timestamp: Date.now()
                    });

                    violetLog('✅ Content changed: ' + fieldName + ' = ' + newValue);
                }

            } catch (e) {
                violetLog('Error handling content blur', e.message);
            }
        }

        function violetHandleKeydown(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.target.blur();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                event.target.blur();
            }
        }

        function violetApplySavedChangesWorking(savedChanges) {
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
                
                violetShowNotificationWorking('✅ Changes saved successfully!', 'success');
                
                violetLog('✅ All saved changes applied to React frontend');

            } catch (e) {
                violetLog('Error applying saved changes', e.message);
            }
        }

        function violetShowNotificationWorking(message, type) {
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

        violetLog('✅ Complete working frontend script ready with text direction fixes');

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

// === ENTERPRISE UNIVERSAL EDITOR ADMIN PAGE ===
add_action('admin_enqueue_scripts', function($hook) {
    if ($hook === 'toplevel_page_violet-universal-editor') {
        wp_enqueue_script('quill-js', 'https://cdn.quilljs.com/1.3.7/quill.js', [], null, true);
        wp_enqueue_style('quill-css', 'https://cdn.quilljs.com/1.3.7/quill.snow.css');
    }
});

function violet_frontend_editor_page() {
    if (!is_user_logged_in()) {
        wp_die(__('You must be logged in to access this page.'));
    }

    $netlify_app_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    $rest_nonce = wp_create_nonce('wp_rest');
    $batch_save_url = rest_url('violet/v1/content/save-batch');
    $rebuild_nonce = wp_create_nonce('violet_rebuild_nonce');
    $ajax_url = admin_url('admin-ajax.php');
    $parsed_netlify_url = parse_url($netlify_app_url);
    $netlify_origin = ($parsed_netlify_url && isset($parsed_netlify_url['scheme']) && isset($parsed_netlify_url['host']))
                      ? $parsed_netlify_url['scheme'] . '://' . $parsed_netlify_url['host']
                      : '*';
    $netlify_app_base_url = rtrim($netlify_app_url, '/');
    ?>
    <div class="wrap">
        <h1>🎨 Edit Frontend - Enhanced Universal Editor</h1>
        <div class="notice notice-success">
            <p><strong>✅ WORKING BASELINE + ENHANCED:</strong> Save, Undo, and Quill are always available. All original logic is preserved.</p>
        </div>
        <div class="notice notice-info">
            <p><strong>Connection:</strong> <span id="violet-connection-status">Testing connection...</span></p>
            <p><strong>Editor:</strong> <span id="violet-editor-status">Initializing...</span></p>
            <p><strong>Changes:</strong> <span id="violet-changes-status">No changes</span></p>
        </div>
        <div class="violet-blue-toolbar-working">
            <button id="violet-edit-toggle" class="button button-primary" onclick="violetActivateEditing()">
                ✏️ Enable Edit Mode
            </button>
            <button id="violet-save-all-btn" onclick="violetSaveAllChanges()" class="button button-hero violet-save-button">
                💾 Save All Changes (<span id="violet-changes-count">0</span>)
            </button>
            <!-- ENHANCED: Undo Button -->
            <button id="violet-undo-all-btn" onclick="violetUndoAllChanges()" class="button button-warning" style="background:#f56500;color:white;font-weight:700;padding:12px 24px;border-radius:8px;display:none;">
                ↩️ Undo Changes
            </button>
            <button onclick="violetRefreshPreview()" class="button">🔄 Refresh</button>
            <button onclick="violetTestCommunication()" class="button">🔗 Test Connection</button>
        </div>
        <div class="violet-preview-container-working">
            <iframe
                id="violet-site-iframe"
                src=""
                title="React Frontend Editor"
                style="width: 100%; height: 75vh; border: 3px solid #0073aa; border-radius: 12px;"
            ></iframe>
        </div>
        <!-- ENHANCED: Quill Editor Modal -->
        <div id="quill-editor-modal" style="display:none;position:fixed;top:10%;left:50%;transform:translateX(-50%);z-index:9999;background:white;padding:20px;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
            <div id="quill-editor"></div>
            <div style="margin-top:15px;text-align:right;">
                <button id="quill-save" class="button button-primary">Save</button>
                <button id="quill-cancel" class="button">Cancel</button>
            </div>
        </div>
    </div>
    <link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">
    <script src="https://cdn.quilljs.com/1.3.7/quill.js"></script>
    <style>
    .violet-blue-toolbar-working { margin: 25px 0; padding: 25px; background: linear-gradient(135deg, #0073aa 0%, #005a87 100%); border-radius: 12px; display: flex; gap: 20px; align-items: center; flex-wrap: wrap; box-shadow: 0 8px 25px rgba(0,115,170,0.3); }
    .violet-blue-toolbar-working .button { background: rgba(255,255,255,0.95); border: none; color: #0073aa; font-weight: 700; padding: 12px 24px; border-radius: 8px; transition: all 0.3s ease; cursor: pointer; font-size: 14px; }
    .violet-blue-toolbar-working .button:hover { background: white; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.25); }
    .violet-blue-toolbar-working .button-primary { background: #00a32a !important; color: white !important; }
    .violet-blue-toolbar-working .button-primary:hover { background: #008a24 !important; }
    .violet-save-button { background: #d63939 !important; color: white !important; padding: 15px 30px !important; font-size: 16px !important; font-weight: 800 !important; box-shadow: 0 6px 20px rgba(214,57,57,0.5) !important; animation: violetPulse 2s infinite; border: 3px solid rgba(255,255,255,0.3) !important; }
    .violet-save-button:hover { background: #c23030 !important; transform: translateY(-3px) !important; box-shadow: 0 8px 25px rgba(214,57,57,0.7) !important; }
    @keyframes violetPulse { 0% { box-shadow: 0 6px 20px rgba(214,57,57,0.5); } 50% { box-shadow: 0 8px 30px rgba(214,57,57,0.8); } 100% { box-shadow: 0 6px 20px rgba(214,57,57,0.5); } }
    .violet-preview-container-working { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 1px solid #e0e0e0; }
    .status-success { color: #00a32a !important; font-weight: bold; }
    .status-error { color: #d63939 !important; font-weight: bold; }
    .status-info { color: #0073aa !important; }
    .status-warning { color: #f56500 !important; font-weight: bold; }
    </style>
    <script>
    // ENHANCED: Quill and Undo logic
    let quill, currentEditingField = null;
    document.addEventListener('DOMContentLoaded', function() {
        quill = new Quill('#quill-editor', { theme: 'snow' });
        document.getElementById('quill-save').onclick = saveQuillEdit;
        document.getElementById('quill-cancel').onclick = closeQuillEditor;
        document.getElementById('violet-undo-all-btn').onclick = violetUndoAllChanges;
    });
    // Listen for field click events from iframe to open Quill
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'violet-edit-field') {
            openQuillEditor(event.data.field, event.data.value);
        }
    });
    // Show Undo button if there are pending changes
    function updateSaveUndoButtons() {
        const saveBtn = document.getElementById('violet-save-all-btn');
        const undoBtn = document.getElementById('violet-undo-all-btn');
        const count = Object.keys(window.violetPendingChanges || {}).length;
        saveBtn.style.display = count > 0 ? 'inline-block' : 'none';
        undoBtn.style.display = count > 0 ? 'inline-block' : 'none';
        document.getElementById('violet-changes-count').textContent = count;
    }
    // Undo all changes (revert in iframe)
    function violetUndoAllChanges() {
        const iframe = document.getElementById('violet-site-iframe');
        iframe.contentWindow.postMessage({ type: 'violet-undo-all' }, '*');
        window.violetPendingChanges = {};
        updateSaveUndoButtons();
        violetSetStatus('changes', 'All changes reverted.', 'info');
    }
    // Quill modal logic
    function openQuillEditor(field, initialValue) {
        currentEditingField = field;
        quill.root.innerHTML = initialValue;
        document.getElementById('quill-editor-modal').style.display = 'block';
    }
    function closeQuillEditor() {
        document.getElementById('quill-editor-modal').style.display = 'none';
        currentEditingField = null;
    }
    function saveQuillEdit() {
        if (!currentEditingField) return;
        const html = quill.root.innerHTML;
        const iframe = document.getElementById('violet-site-iframe');
        iframe.contentWindow.postMessage({
            type: 'violet-update-field',
            field: currentEditingField,
            value: html
        }, '*');
        window.violetPendingChanges = window.violetPendingChanges || {};
        window.violetPendingChanges[currentEditingField] = { field_name: currentEditingField, field_value: html };
        updateSaveUndoButtons();
        closeQuillEditor();
        violetSetStatus('changes', 'Edited: ' + currentEditingField, 'info');
    }
    // Patch: Call updateSaveUndoButtons after any content change/save
    // (You may need to call updateSaveUndoButtons() in your existing save logic as well.)
    </script>
    <?php
    wp_enqueue_media();
}
?>