<?php
/**
 * 🎯 ULTIMATE WORDPRESS-REACT RICH TEXT EDITING SYSTEM
 * Version 2.0 - With Quill & Lexical Support
 * 
 * COMPLETE FEATURES:
 * ✅ Rich Text Editing with Quill & Lexical
 * ✅ Beautiful Modal Interface (replaces prompt)
 * ✅ Content Sanitization & Security
 * ✅ Advanced REST API Endpoints
 * ✅ User Preferences & Settings
 * ✅ WordPress Media Library Integration
 * ✅ Format Validation & Processing
 * ✅ Auto-save & Draft Management
 * ✅ Professional Admin Interface
 * ✅ Enhanced CORS & Security
 * ✅ All Original Functionality Preserved
 * 
 * TABLE OF CONTENTS:
 * Lines 1-150:    Core Setup & Security
 * Lines 151-400:  Rich Text Editor Integration
 * Lines 401-650:  Enhanced REST API Endpoints
 * Lines 651-900:  Modal & UI System
 * Lines 901-1150: Content Processing & Sanitization
 * Lines 1151-1400: User Preferences & Settings
 * Lines 1401-1650: WordPress Admin Interfaces
 * Lines 1651-1900: Advanced Communication System
 * Lines 1901-2150: Asset Management & Media
 * Lines 2151-2400: JavaScript Integration
 * Lines 2401-2650: Security & Validation
 * Lines 2651-2900: Performance & Caching
 * Lines 2901-3000: Activation & Utilities
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// ============================================================================
// SECTION 1: CORE SETUP & SECURITY (Lines 1-150)
// ============================================================================

// Plugin version and constants
define('VIOLET_RICHTEXT_VERSION', '2.0.0');
define('VIOLET_RICHTEXT_PLUGIN_URL', plugin_dir_url(__FILE__));
define('VIOLET_RICHTEXT_PLUGIN_PATH', plugin_dir_path(__FILE__));

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
 * Enhanced content helper with rich text support
 */
function violet_get_content($field, $default = '', $format = 'auto') {
    $content = get_option('violet_all_content', array());
    $value = isset($content[$field]) ? $content[$field] : get_option('violet_' . $field, $default);
    
    // Format based on field type
    if ($format === 'rich' || (strpos($field, '_rich') !== false)) {
        return wp_kses_post($value);
    } elseif ($format === 'plain') {
        return wp_strip_all_tags($value);
    }
    
    return $value;
}

/**
 * Enhanced content update with rich text support
 */
function violet_update_content($field, $value, $format = 'auto') {
    // Determine content type
    $is_rich_text = ($format === 'rich') || 
                   (strpos($field, '_rich') !== false) ||
                   (strpos($value, '<') !== false && strpos($value, '>') !== false);
    
    // Sanitize based on content type
    if ($is_rich_text) {
        $sanitized_value = violet_sanitize_rich_content($value);
    } else {
        $sanitized_value = sanitize_text_field($value);
    }
    
    // Save to both storage methods
    $content = get_option('violet_all_content', array());
    $content[$field] = $sanitized_value;
    $content[$field . '_format'] = $is_rich_text ? 'rich' : 'plain';
    $content[$field . '_updated'] = current_time('mysql');
    
    update_option('violet_all_content', $content);
    update_option('violet_' . $field, $sanitized_value);
    
    // Clear relevant caches
    wp_cache_delete('violet_content_' . $field, 'violet');
    wp_cache_flush();
    
    return true;
}

/**
 * Rich content sanitization
 */
function violet_sanitize_rich_content($content) {
    $allowed_tags = array(
        'p' => array('class' => true, 'style' => true),
        'br' => array(),
        'strong' => array('class' => true),
        'em' => array('class' => true),
        'u' => array('class' => true),
        's' => array('class' => true),
        'ol' => array('class' => true),
        'ul' => array('class' => true),
        'li' => array('class' => true),
        'h1' => array('class' => true, 'style' => true),
        'h2' => array('class' => true, 'style' => true),
        'h3' => array('class' => true, 'style' => true),
        'h4' => array('class' => true, 'style' => true),
        'h5' => array('class' => true, 'style' => true),
        'h6' => array('class' => true, 'style' => true),
        'a' => array('href' => true, 'target' => true, 'rel' => true, 'class' => true),
        'img' => array('src' => true, 'alt' => true, 'width' => true, 'height' => true, 'class' => true),
        'blockquote' => array('class' => true),
        'code' => array('class' => true),
        'pre' => array('class' => true),
        'span' => array('class' => true, 'style' => true),
        'div' => array('class' => true, 'style' => true)
    );
    
    return wp_kses($content, $allowed_tags);
}

// ============================================================================
// SECTION 2: ENHANCED IFRAME AND CORS FIXES (Lines 151-300)
// ============================================================================

add_action('init', 'violet_enhanced_iframe_fix', 1);
function violet_enhanced_iframe_fix() {
    if (!headers_sent()) {
        header_remove('X-Frame-Options');
        
        $allowed_origins = _violet_get_allowed_origins();
        $allowed_frame_ancestors = array_merge(array("'self'"), $allowed_origins);
        $csp_frame_ancestors = implode(' ', $allowed_frame_ancestors);

        header_remove('Content-Security-Policy');
        header('Content-Security-Policy: frame-ancestors ' . $csp_frame_ancestors . ';');
        
        header_remove('X-Content-Type-Options');
        header('X-Content-Type-Options: nosniff');
        
        // Additional security headers for rich text editing
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
    }
}

add_action('send_headers', 'violet_enhanced_cors_fix');
function violet_enhanced_cors_fix() {
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
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce, X-Requested-With, Origin, Accept, Cache-Control, Pragma, X-Editor-Type, X-Rich-Text');
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
            $server->send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-WP-Nonce, X-Requested-With, Origin, Accept, Cache-Control, Pragma, X-Editor-Type, X-Rich-Text');
            $server->send_header('Access-Control-Allow-Credentials', 'true');
            $server->send_header('Access-Control-Expose-Headers', 'X-Rich-Text-Support, X-Editor-Version');
        }
        
        return $served;
    }, 15, 4);
});

// ============================================================================
// SECTION 3: RICH TEXT ADMIN MENU SYSTEM (Lines 301-450)
// ============================================================================

add_action('admin_menu', 'violet_richtext_admin_menu');
function violet_richtext_admin_menu() {
    // Main Rich Text Editor page
    add_menu_page(
        'Rich Text Editor',
        '📝 Rich Text Editor',
        'edit_posts',
        'violet-richtext-editor',
        'violet_richtext_editor_interface',
        'dashicons-editor-richtext',
        25
    );

    // Universal Editor (legacy support)
    add_submenu_page(
        'violet-richtext-editor',
        'Universal Editor',
        '🎨 Universal Editor',
        'edit_posts',
        'violet-universal-editor',
        'violet_universal_editor_interface'
    );

    // Editor Settings
    add_submenu_page(
        'violet-richtext-editor',
        'Editor Settings',
        '⚙️ Editor Settings',
        'edit_posts',
        'violet-editor-settings',
        'violet_richtext_settings_page'
    );

    // Content Manager
    add_submenu_page(
        'violet-richtext-editor',
        'Content Manager',
        '📋 Content Manager',
        'edit_posts',
        'violet-content-manager',
        'violet_richtext_content_manager'
    );

    // Field Configuration
    add_submenu_page(
        'violet-richtext-editor',
        'Field Configuration',
        '🔧 Field Config',
        'edit_posts',
        'violet-field-config',
        'violet_field_configuration_page'
    );
}

// ============================================================================
// SECTION 4: ENHANCED REST API ENDPOINTS (Lines 451-700)
// ============================================================================

add_action('rest_api_init', 'violet_register_richtext_endpoints');
function violet_register_richtext_endpoints() {
    // Rich text content endpoint
    register_rest_route('violet/v2', '/rich-content', array(
        'methods' => 'GET',
        'callback' => 'violet_get_rich_content',
        'permission_callback' => '__return_true'
    ));

    // Rich text save endpoint
    register_rest_route('violet/v2', '/rich-content/save', array(
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
            'field_value' => array(
                'required' => true,
                'type' => 'string'
            ),
            'editor_type' => array(
                'required' => false,
                'type' => 'string',
                'enum' => array('quill', 'lexical', 'plain'),
                'default' => 'quill'
            ),
            'format_type' => array(
                'required' => false,
                'type' => 'string',
                'enum' => array('rich', 'plain', 'auto'),
                'default' => 'auto'
            )
        )
    ));

    // Batch rich text save endpoint
    register_rest_route('violet/v2', '/rich-content/save-batch', array(
        'methods' => 'POST',
        'callback' => 'violet_save_rich_content_batch',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        },
        'args' => array(
            'changes' => array(
                'required' => true,
                'type' => 'array'
            ),
            'editor_preferences' => array(
                'required' => false,
                'type' => 'object'
            )
        )
    ));

    // Editor preferences endpoint
    register_rest_route('violet/v2', '/editor-preferences', array(
        'methods' => array('GET', 'POST'),
        'callback' => 'violet_handle_editor_preferences',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        }
    ));

    // Field configuration endpoint
    register_rest_route('violet/v2', '/field-config', array(
        'methods' => 'GET',
        'callback' => 'violet_get_field_configurations',
        'permission_callback' => '__return_true'
    ));

    // Content validation endpoint
    register_rest_route('violet/v2', '/validate-content', array(
        'methods' => 'POST',
        'callback' => 'violet_validate_rich_content',
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
                'type' => 'string'
            )
        )
    ));

    // Media library integration endpoint
    register_rest_route('violet/v2', '/media-library', array(
        'methods' => array('GET', 'POST'),
        'callback' => 'violet_handle_media_library',
        'permission_callback' => function() {
            return current_user_can('upload_files');
        }
    ));

    // Enhanced debug endpoint
    register_rest_route('violet/v2', '/debug', array(
        'methods' => 'GET',
        'callback' => function() {
            return rest_ensure_response(array(
                'status' => 'success',
                'message' => 'Rich Text WordPress API is working',
                'version' => VIOLET_RICHTEXT_VERSION,
                'timestamp' => current_time('mysql'),
                'wordpress_version' => get_bloginfo('version'),
                'editors_supported' => array('quill', 'lexical', 'plain'),
                'rich_text_enabled' => true,
                'cors_enabled' => true,
                'user_can_edit' => current_user_can('edit_posts'),
                'total_content_fields' => count(get_option('violet_all_content', [])),
                'rich_text_fields' => violet_count_rich_text_fields(),
                'system' => 'rich_text_editor_v2'
            ));
        },
        'permission_callback' => '__return_true'
    ));
}

/**
 * Get rich content with formatting information
 */
function violet_get_rich_content($request) {
    try {
        $content = get_option('violet_all_content', array());
        $formatted_content = array();
        
        foreach ($content as $key => $value) {
            if (strpos($key, '_format') === false && strpos($key, '_updated') === false) {
                $formatted_content[$key] = array(
                    'value' => $value,
                    'format' => isset($content[$key . '_format']) ? $content[$key . '_format'] : 'auto',
                    'updated' => isset($content[$key . '_updated']) ? $content[$key . '_updated'] : null,
                    'word_count' => str_word_count(wp_strip_all_tags($value)),
                    'char_count' => strlen(wp_strip_all_tags($value))
                );
            }
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'content' => $formatted_content,
            'total_fields' => count($formatted_content),
            'system' => 'rich_text_v2'
        ));
        
    } catch (Exception $e) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Failed to retrieve content: ' . $e->getMessage()
        ), 500);
    }
}

/**
 * Save rich content with enhanced processing
 */
function violet_save_rich_content($request) {
    try {
        $field_name = $request->get_param('field_name');
        $field_value = $request->get_param('field_value');
        $editor_type = $request->get_param('editor_type');
        $format_type = $request->get_param('format_type');

        // Enhanced validation
        if (empty($field_name)) {
            return new WP_Error('invalid_field_name', 'Field name is required', array('status' => 400));
        }

        // Process content based on format
        if ($format_type === 'rich' || strpos($field_value, '<') !== false) {
            $processed_value = violet_sanitize_rich_content($field_value);
            $final_format = 'rich';
        } else {
            $processed_value = sanitize_text_field($field_value);
            $final_format = 'plain';
        }

        // Save with metadata
        $success = violet_update_content($field_name, $processed_value, $final_format);
        
        // Save editor preference for this field
        if ($success && $editor_type) {
            violet_save_field_editor_preference($field_name, $editor_type);
        }

        if ($success) {
            return rest_ensure_response(array(
                'success' => true,
                'field_name' => $field_name,
                'field_value' => $processed_value,
                'format' => $final_format,
                'editor_type' => $editor_type,
                'word_count' => str_word_count(wp_strip_all_tags($processed_value)),
                'char_count' => strlen(wp_strip_all_tags($processed_value)),
                'message' => 'Rich content saved successfully'
            ));
        } else {
            throw new Exception('Failed to save content to database');
        }

    } catch (Exception $e) {
        error_log('Violet Rich Text Save Error: ' . $e->getMessage());
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ), 500);
    }
}

/**
 * Enhanced batch save with rich text support
 */
function violet_save_rich_content_batch($request) {
    try {
        error_log('Violet: ===== RICH TEXT BATCH SAVE STARTED =====');
        
        $changes = $request->get_param('changes');
        $editor_preferences = $request->get_param('editor_preferences');
        
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
            $editor_type = isset($change['editor_type']) ? $change['editor_type'] : 'auto';
            $format_type = isset($change['format_type']) ? $change['format_type'] : 'auto';

            try {
                // Determine if content is rich text
                $is_rich = ($format_type === 'rich') || 
                          (strpos($field_value, '<') !== false && strpos($field_value, '>') !== false) ||
                          (strpos($field_name, '_rich') !== false);

                // Process content
                if ($is_rich) {
                    $processed_value = violet_sanitize_rich_content($field_value);
                    $final_format = 'rich';
                } else {
                    $processed_value = sanitize_text_field($field_value);
                    $final_format = 'plain';
                }

                // Save content
                $saved = violet_update_content($field_name, $processed_value, $final_format);

                if ($saved) {
                    $saved_count++;
                    $results[$field_name] = array(
                        'success' => true,
                        'value' => $processed_value,
                        'format' => $final_format,
                        'editor_type' => $editor_type,
                        'word_count' => str_word_count(wp_strip_all_tags($processed_value)),
                        'char_count' => strlen(wp_strip_all_tags($processed_value))
                    );
                    
                    // Save editor preference
                    if ($editor_type && $editor_type !== 'auto') {
                        violet_save_field_editor_preference($field_name, $editor_type);
                    }
                    
                    error_log('Violet: Successfully saved rich text field ' . $field_name);
                } else {
                    $failed_count++;
                    $results[$field_name] = array(
                        'success' => false,
                        'error' => 'Database update failed'
                    );
                    $errors[] = "Failed to save field: $field_name";
                }

            } catch (Exception $e) {
                $failed_count++;
                $results[$field_name] = array(
                    'success' => false,
                    'error' => $e->getMessage()
                );
                $errors[] = "Error saving $field_name: " . $e->getMessage();
                error_log('Violet: Error saving field ' . $field_name . ': ' . $e->getMessage());
            }
        }

        // Save global editor preferences
        if ($editor_preferences && is_array($editor_preferences)) {
            violet_save_global_editor_preferences($editor_preferences);
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
                        'body' => array('trigger' => 'rich_text_save')
                    ));
                    $rebuild_triggered = true;
                    error_log('Violet: Rich text rebuild triggered successfully');
                }
            }
        }

        $final_result = array(
            'success' => $saved_count > 0,
            'message' => sprintf('Rich text batch save: %d saved, %d failed', $saved_count, $failed_count),
            'saved_count' => $saved_count,
            'failed_count' => $failed_count,
            'results' => $results,
            'rebuild_triggered' => $rebuild_triggered,
            'timestamp' => current_time('mysql'),
            'errors' => $errors,
            'system' => 'rich_text_batch_v2'
        );

        error_log('Violet: ===== RICH TEXT BATCH SAVE COMPLETED =====');
        return new WP_REST_Response($final_result, 200);

    } catch (Exception $e) {
        error_log('Violet: Rich text batch save error - ' . $e->getMessage());
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Server error during rich text batch save: ' . $e->getMessage()
        ), 500);
    }
}

/**
 * Handle editor preferences
 */
function violet_handle_editor_preferences($request) {
    $user_id = get_current_user_id();
    
    if ($request->get_method() === 'GET') {
        $preferences = get_user_meta($user_id, 'violet_editor_preferences', true);
        $default_preferences = array(
            'default_editor' => 'quill',
            'theme' => 'light',
            'auto_save' => true,
            'show_preview' => false,
            'show_word_count' => true,
            'spell_check' => true,
            'toolbar_style' => 'full'
        );
        
        $final_preferences = wp_parse_args($preferences, $default_preferences);
        
        return rest_ensure_response(array(
            'success' => true,
            'preferences' => $final_preferences
        ));
    } else {
        // POST - Save preferences
        $preferences = $request->get_json_params();
        
        if ($preferences) {
            $sanitized_preferences = array(
                'default_editor' => in_array($preferences['default_editor'], array('quill', 'lexical')) ? $preferences['default_editor'] : 'quill',
                'theme' => in_array($preferences['theme'], array('light', 'dark')) ? $preferences['theme'] : 'light',
                'auto_save' => (bool) $preferences['auto_save'],
                'show_preview' => (bool) $preferences['show_preview'],
                'show_word_count' => (bool) $preferences['show_word_count'],
                'spell_check' => (bool) $preferences['spell_check'],
                'toolbar_style' => in_array($preferences['toolbar_style'], array('minimal', 'standard', 'full')) ? $preferences['toolbar_style'] : 'full'
            );
            
            update_user_meta($user_id, 'violet_editor_preferences', $sanitized_preferences);
            
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Preferences saved successfully',
                'preferences' => $sanitized_preferences
            ));
        } else {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Invalid preferences data'
            ), 400);
        }
    }
}

/**
 * Get field configurations
 */
function violet_get_field_configurations() {
    $configurations = get_option('violet_field_configurations', array());
    
    // Default configurations
    $default_configs = array(
        'hero_title' => array(
            'max_length' => 100,
            'allowed_formats' => array('bold', 'italic', 'underline'),
            'preferred_editor' => 'quill',
            'placeholder' => 'Enter your hero title...'
        ),
        'hero_subtitle' => array(
            'max_length' => 200,
            'allowed_formats' => array('bold', 'italic', 'underline', 'color'),
            'preferred_editor' => 'quill',
            'placeholder' => 'Enter your hero subtitle...'
        ),
        'intro_description' => array(
            'max_length' => 500,
            'allowed_formats' => array('bold', 'italic', 'underline', 'color', 'link', 'list'),
            'preferred_editor' => 'lexical',
            'placeholder' => 'Enter your introduction...'
        ),
        'about_content' => array(
            'max_length' => 1000,
            'allowed_formats' => array('header', 'bold', 'italic', 'underline', 'list', 'link', 'blockquote'),
            'preferred_editor' => 'lexical',
            'placeholder' => 'Enter about content...'
        )
    );
    
    $final_configs = wp_parse_args($configurations, $default_configs);
    
    return rest_ensure_response(array(
        'success' => true,
        'configurations' => $final_configs
    ));
}

/**
 * Validate rich content
 */
function violet_validate_rich_content($request) {
    $content = $request->get_param('content');
    $field_type = $request->get_param('field_type');
    
    $validation_result = array(
        'is_valid' => true,
        'errors' => array(),
        'warnings' => array(),
        'stats' => array()
    );
    
    // Basic validation
    if (empty($content)) {
        $validation_result['errors'][] = 'Content cannot be empty';
        $validation_result['is_valid'] = false;
    }
    
    // Check for potentially dangerous content
    $dangerous_tags = array('<script', '<iframe', '<object', '<embed');
    foreach ($dangerous_tags as $tag) {
        if (stripos($content, $tag) !== false) {
            $validation_result['errors'][] = 'Content contains potentially dangerous tags';
            $validation_result['is_valid'] = false;
        }
    }
    
    // Generate statistics
    $text_content = wp_strip_all_tags($content);
    $validation_result['stats'] = array(
        'word_count' => str_word_count($text_content),
        'char_count' => strlen($text_content),
        'char_count_with_html' => strlen($content),
        'has_html' => $content !== $text_content,
        'estimated_reading_time' => ceil(str_word_count($text_content) / 200) // 200 WPM average
    );
    
    // Field-specific validation
    if ($field_type) {
        $field_configs = get_option('violet_field_configurations', array());
        if (isset($field_configs[$field_type])) {
            $config = $field_configs[$field_type];
            
            if (isset($config['max_length']) && strlen($text_content) > $config['max_length']) {
                $validation_result['errors'][] = "Content exceeds maximum length of {$config['max_length']} characters";
                $validation_result['is_valid'] = false;
            }
        }
    }
    
    return rest_ensure_response($validation_result);
}

/**
 * Count rich text fields
 */
function violet_count_rich_text_fields() {
    $content = get_option('violet_all_content', array());
    $rich_count = 0;
    
    foreach ($content as $key => $value) {
        if (strpos($key, '_format') === false && strpos($key, '_updated') === false) {
            $format = isset($content[$key . '_format']) ? $content[$key . '_format'] : 'auto';
            if ($format === 'rich' || (strpos($value, '<') !== false && strpos($value, '>') !== false)) {
                $rich_count++;
            }
        }
    }
    
    return $rich_count;
}

/**
 * Save field editor preference
 */
function violet_save_field_editor_preference($field_name, $editor_type) {
    $preferences = get_option('violet_field_editor_preferences', array());
    $preferences[$field_name] = $editor_type;
    update_option('violet_field_editor_preferences', $preferences);
}

/**
 * Save global editor preferences
 */
function violet_save_global_editor_preferences($preferences) {
    $user_id = get_current_user_id();
    $existing = get_user_meta($user_id, 'violet_editor_preferences', true) ?: array();
    $updated = array_merge($existing, $preferences);
    update_user_meta($user_id, 'violet_editor_preferences', $updated);
}

// Continue in next chunk...
?>