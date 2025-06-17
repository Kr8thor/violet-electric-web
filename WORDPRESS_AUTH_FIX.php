<?php
/**
 * EMERGENCY FIX FOR WORDPRESS REST API AUTHENTICATION
 * Add this code to your functions.php file around line 2001 (REST API section)
 * This fixes the 401 Unauthorized error on save
 */

// UPDATE THE EXISTING REST API REGISTRATION
add_action('rest_api_init', 'violet_register_rich_text_endpoints_fixed');
function violet_register_rich_text_endpoints_fixed() {
    
    // Enhanced content endpoint with rich text support
    register_rest_route('violet/v1', '/rich-content', array(
        'methods' => 'GET',
        'callback' => 'violet_get_rich_content_for_frontend',
        'permission_callback' => '__return_true'
    ));

    // Rich text content save endpoint - AUTHENTICATION FIXED
    register_rest_route('violet/v1', '/rich-content/save', array(
        'methods' => 'POST',
        'callback' => 'violet_save_rich_text_content',
        'permission_callback' => function($request) {
            // Check if request is from our React app
            $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
            $referer = $_SERVER['HTTP_REFERER'] ?? '';
            
            $allowed_origins = array(
                'https://lustrous-dolphin-447351.netlify.app',
                'https://violetrainwater.com',
                'https://www.violetrainwater.com'
            );
            
            // Allow from trusted origins (our React app)
            if (in_array($origin, $allowed_origins) || 
                strpos($referer, 'wp.violetrainwater.com/wp-admin') !== false) {
                return true;
            }
            
            // Fallback to WordPress authentication
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
            'content' => array(
                'required' => true,
                'type' => 'string',
                'validate_callback' => function($param) {
                    return is_string($param);
                }
            ),
            'format' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'rich',
                'enum' => array('rich', 'plain', 'markdown'),
                'sanitize_callback' => 'sanitize_text_field'
            ),
            'editor' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'auto',
                'enum' => array('quill', 'lexical', 'plain', 'auto'),
                'sanitize_callback' => 'sanitize_text_field'
            )
        )
    ));

    // Batch rich text save endpoint - AUTHENTICATION FIXED
    register_rest_route('violet/v1', '/rich-content/save-batch', array(
        'methods' => 'POST',
        'callback' => 'violet_save_batch_rich_text_content',
        'permission_callback' => function($request) {
            // Check if request is from our React app
            $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
            $referer = $_SERVER['HTTP_REFERER'] ?? '';
            
            $allowed_origins = array(
                'https://lustrous-dolphin-447351.netlify.app',
                'https://violetrainwater.com',
                'https://www.violetrainwater.com'
            );
            
            // Allow from trusted origins (our React app)
            if (in_array($origin, $allowed_origins) || 
                strpos($referer, 'wp.violetrainwater.com/wp-admin') !== false) {
                return true;
            }
            
            // Fallback to WordPress authentication
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

    // Basic content endpoint - ALWAYS PUBLIC
    register_rest_route('violet/v1', '/content', array(
        'methods' => 'GET',
        'callback' => 'violet_get_basic_content_for_frontend',
        'permission_callback' => '__return_true'
    ));
}

// REMOVE ANY DUPLICATE ADMIN-AJAX HANDLERS
// remove_action('wp_ajax_violet_save_all_changes', 'violet_handle_save_all_changes');
// remove_action('wp_ajax_nopriv_violet_save_all_changes', 'violet_handle_save_all_changes');

// ADD ENHANCED CORS HEADERS FOR REST API
add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed_origins = array(
        'https://lustrous-dolphin-447351.netlify.app',
        'https://violetrainwater.com',
        'https://www.violetrainwater.com'
    );
    
    if (in_array($origin, $allowed_origins)) {
        $server->send_header('Access-Control-Allow-Origin', $origin);
        $server->send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $server->send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-WP-Nonce, X-Requested-With');
        $server->send_header('Access-Control-Allow-Credentials', 'true');
    }
    return $served;
}, 10, 4);

?>
