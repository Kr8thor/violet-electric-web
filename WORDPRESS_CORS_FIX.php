<?php
/**
 * CORS Fix for Violet Electric Web - WordPress Backend
 * Add this code to your WordPress functions.php file IMMEDIATELY
 */

// Fix CORS for Violet React App
add_action('init', 'violet_cors_fix');
function violet_cors_fix() {
    // Allow specific origins
    $allowed_origins = array(
        'https://lustrous-dolphin-447351.netlify.app',
        'https://violetrainwater.com',
        'https://www.violetrainwater.com',
        'http://localhost:5173',  // For development
        'http://localhost:3000',  // For development
        'http://localhost:8080'   // For development
    );
    
    $origin = get_http_origin();
    
    if ($origin && in_array($origin, $allowed_origins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce, X-Requested-With, X-Violet-API-Key');
        header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours
    }
    
    // Handle preflight OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
}

// Additional CORS fix for REST API specifically
add_filter('rest_pre_serve_request', 'violet_rest_cors_fix', 10, 4);
function violet_rest_cors_fix($served, $result, $request, $server) {
    $allowed_origins = array(
        'https://lustrous-dolphin-447351.netlify.app',
        'https://violetrainwater.com',
        'https://www.violetrainwater.com',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8080'
    );
    
    $origin = get_http_origin();
    
    if ($origin && in_array($origin, $allowed_origins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce, X-Requested-With, X-Violet-API-Key');
    }
    
    return $served;
}

// Emergency CORS fix - use only if above doesn't work
add_action('send_headers', 'violet_emergency_cors_fix');
function violet_emergency_cors_fix() {
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/violet/') !== false) {
        $allowed_origins = array(
            'https://lustrous-dolphin-447351.netlify.app',
            'https://violetrainwater.com',
            'https://www.violetrainwater.com'
        );
        
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
        
        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce, X-Requested-With, X-Violet-API-Key');
        }
    }
}

/**
 * Violet Save System - REST API Endpoints
 * Add this complete save system to your functions.php
 */

// Register the save-batch endpoint
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/save-batch', array(
        'methods' => array('POST', 'OPTIONS'),
        'callback' => 'violet_save_batch_content',
        'permission_callback' => 'violet_check_save_permissions',
        'args' => array(
            'changes' => array(
                'required' => true,
                'type' => 'array',
                'validate_callback' => 'violet_validate_changes'
            ),
            'trigger_rebuild' => array(
                'required' => false,
                'type' => 'boolean',
                'default' => false
            )
        )
    ));
    
    // Content endpoint
    register_rest_route('violet/v1', '/content', array(
        'methods' => array('GET', 'OPTIONS'),
        'callback' => 'violet_get_all_content',
        'permission_callback' => '__return_true'
    ));
    
    // Debug endpoint
    register_rest_route('violet/v1', '/debug', array(
        'methods' => array('GET', 'OPTIONS'),
        'callback' => 'violet_debug_endpoint',
        'permission_callback' => '__return_true'
    ));
});

/**
 * Handle OPTIONS requests for all Violet endpoints
 */
add_action('rest_api_init', function() {
    // Handle preflight for save-batch
    register_rest_route('violet/v1', '/save-batch', array(
        'methods' => 'OPTIONS',
        'callback' => 'violet_handle_options_request',
        'permission_callback' => '__return_true'
    ));
    
    // Handle preflight for content
    register_rest_route('violet/v1', '/content', array(
        'methods' => 'OPTIONS',
        'callback' => 'violet_handle_options_request',
        'permission_callback' => '__return_true'
    ));
    
    // Handle preflight for debug
    register_rest_route('violet/v1', '/debug', array(
        'methods' => 'OPTIONS',
        'callback' => 'violet_handle_options_request',
        'permission_callback' => '__return_true'
    ));
});

function violet_handle_options_request($request) {
    return new WP_REST_Response(null, 200);
}

/**
 * Main save batch function
 */
function violet_save_batch_content($request) {
    try {
        $changes = $request->get_param('changes');
        $trigger_rebuild = $request->get_param('trigger_rebuild');
        
        if (empty($changes) || !is_array($changes)) {
            return new WP_Error(
                'invalid_changes',
                'Changes parameter is required and must be an array',
                array('status' => 400)
            );
        }
        
        $saved_count = 0;
        $failed_count = 0;
        $errors = array();
        $results = array();
        
        // Get current content
        $current_content = get_option('violet_all_content', array());
        
        // Process each change
        foreach ($changes as $change) {
            if (!is_array($change) || !isset($change['field_name']) || !isset($change['field_value'])) {
                $errors[] = 'Invalid change format';
                $failed_count++;
                continue;
            }
            
            $field_name = sanitize_text_field($change['field_name']);
            $field_value = $change['field_value'];
            $field_type = isset($change['field_type']) ? $change['field_type'] : 'text';
            
            try {
                // Sanitize the value based on type
                $sanitized_value = violet_sanitize_field_value($field_value, $field_type);
                
                // Save individual field option (for backup)
                update_option("violet_{$field_name}", $sanitized_value);
                
                // Update main content array
                $current_content[$field_name] = $sanitized_value;
                
                $results[$field_name] = array(
                    'success' => true,
                    'new_value' => $sanitized_value
                );
                
                $saved_count++;
                
            } catch (Exception $e) {
                $errors[] = "Field '{$field_name}': " . $e->getMessage();
                $failed_count++;
                
                $results[$field_name] = array(
                    'success' => false,
                    'error' => $e->getMessage()
                );
            }
        }
        
        // Save the complete content array
        if ($saved_count > 0) {
            update_option('violet_all_content', $current_content);
            update_option('violet_last_save', current_time('mysql'));
        }
        
        // Prepare response
        $response_data = array(
            'success' => true,
            'saved_count' => $saved_count,
            'failed_count' => $failed_count,
            'total_count' => count($changes),
            'errors' => $errors,
            'results' => $results,
            'timestamp' => current_time('c')
        );
        
        return new WP_REST_Response($response_data, 200);
        
    } catch (Exception $e) {
        return new WP_Error(
            'save_failed',
            'Save operation failed: ' . $e->getMessage(),
            array('status' => 500)
        );
    }
}

/**
 * Check permissions for save operations
 */
function violet_check_save_permissions($request) {
    // For now, allow all requests - you can add authentication later
    return true;
    
    // Uncomment below for proper authentication
    /*
    if (!is_user_logged_in()) {
        return new WP_Error('not_logged_in', 'Authentication required', array('status' => 401));
    }
    
    if (!current_user_can('edit_posts')) {
        return new WP_Error('insufficient_permissions', 'Insufficient permissions', array('status' => 403));
    }
    
    return true;
    */
}

/**
 * Validate changes array structure
 */
function violet_validate_changes($changes) {
    if (!is_array($changes)) {
        return false;
    }
    
    foreach ($changes as $change) {
        if (!is_array($change) || 
            !isset($change['field_name']) || 
            !isset($change['field_value'])) {
            return false;
        }
    }
    
    return true;
}

/**
 * Sanitize field value based on type
 */
function violet_sanitize_field_value($value, $type) {
    switch ($type) {
        case 'html':
            return wp_kses_post($value);
            
        case 'url':
            return esc_url_raw($value);
            
        case 'email':
            return sanitize_email($value);
            
        case 'color':
            return sanitize_hex_color($value);
            
        case 'text':
        default:
            return sanitize_text_field($value);
    }
}

/**
 * Get all content endpoint
 */
function violet_get_all_content($request) {
    $content = get_option('violet_all_content', array());
    
    $response_data = array_merge($content, array(
        '_metadata' => array(
            'last_updated' => get_option('violet_last_save', ''),
            'total_fields' => count($content),
            'timestamp' => current_time('c')
        )
    ));
    
    return new WP_REST_Response($response_data, 200);
}

/**
 * Debug endpoint
 */
function violet_debug_endpoint($request) {
    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'Violet API is working correctly',
        'wordpress_version' => get_bloginfo('version'),
        'user_logged_in' => is_user_logged_in(),
        'user_can_edit' => current_user_can('edit_posts'),
        'cors_origin' => get_http_origin(),
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'endpoints_available' => array(
            'save-batch',
            'content',
            'debug'
        ),
        'last_save' => get_option('violet_last_save', 'Never'),
        'content_fields' => count(get_option('violet_all_content', array())),
        'timestamp' => current_time('c')
    ), 200);
}

// Log CORS issues for debugging
add_action('wp_loaded', function() {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('Violet CORS Debug - Origin: ' . (get_http_origin() ?: 'none'));
        error_log('Violet CORS Debug - Request URI: ' . $_SERVER['REQUEST_URI']);
        error_log('Violet CORS Debug - Method: ' . $_SERVER['REQUEST_METHOD']);
    }
});
?>