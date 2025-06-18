<?php
/**
 * WordPress REST API Endpoint for Violet Save System
 * Add this to your WordPress functions.php file
 */

// Register the save-batch endpoint
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/save-batch', array(
        'methods' => 'POST',
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
});

/**
 * Main save batch function
 */
function violet_save_batch_content($request) {
    try {
        $changes = $request->get_param('changes');
        // Accept object or array for changes
        if (!is_array($changes)) {
            if (is_object($changes)) {
                $changes = (array)$changes;
            } else {
                return new WP_Error('invalid_changes', 'Invalid changes format', array('status' => 400));
            }
        }
        // If associative array/object, convert to indexed array
        if (array_keys($changes) !== range(0, count($changes) - 1)) {
            $changes = array_map(function($k, $v) {
                return array_merge(['field_name' => $k], (array)$v);
            }, array_keys($changes), array_values($changes));
        }
        $trigger_rebuild = $request->get_param('trigger_rebuild');
        $save_type = $request->get_param('save_type') ?: 'manual'; // 'auto' or 'manual'
        $saved_count = 0;
        $failed_count = 0;
        $errors = array();
        $results = array();
        $current_content = get_option('violet_all_content', array());
        foreach ($changes as $change) {
            $field_name = sanitize_text_field($change['field_name']);
            $field_value = $change['field_value'];
            $field_type = isset($change['field_type']) ? $change['field_type'] : 'text';
            try {
                $validation_result = violet_validate_field($field_name, $field_value, $field_type);
                if (!$validation_result['valid']) {
                    $errors[] = "Field '{$field_name}': " . $validation_result['error'];
                    $failed_count++;
                    continue;
                }
                $sanitized_value = violet_sanitize_field_value($field_value, $field_type);
                // Save individual field option (for backup/fallback)
                update_option("violet_{$field_name}", $sanitized_value);
                $current_content[$field_name] = $sanitized_value;
                $results[$field_name] = array(
                    'success' => true,
                    'old_value' => get_option("violet_{$field_name}", ''),
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
            if (!update_option('violet_all_content', $current_content)) {
                // Fallback: try saving each field individually
                foreach ($current_content as $k => $v) {
                    update_option("violet_{$k}", $v);
                }
                $errors[] = 'Failed to update main content array, fallback to individual fields.';
            }
            update_option('violet_last_save', current_time('mysql'));
            violet_log_save_operation($saved_count, $failed_count, $errors, $save_type);
        }
        $rebuild_triggered = false;
        if ($trigger_rebuild && $saved_count > 0) {
            $rebuild_result = violet_trigger_netlify_rebuild();
            $rebuild_triggered = $rebuild_result['success'];
        }
        $response_data = array(
            'success' => $failed_count === 0,
            'saved_count' => $saved_count,
            'failed_count' => $failed_count,
            'total_count' => count($changes),
            'errors' => $errors,
            'results' => $results,
            'rebuild_triggered' => $rebuild_triggered,
            'timestamp' => current_time('c'),
            'save_type' => $save_type
        );
        $status_code = $failed_count === 0 ? 200 : 207; // 207: Multi-Status
        return new WP_REST_Response($response_data, $status_code);
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
    // API key authentication (preferred for React app)
    if (violet_check_api_key_header($request)) {
        return true;
    }
    // Fallback: logged-in user with edit_posts
    if (!is_user_logged_in()) {
        return new WP_Error(
            'not_logged_in',
            'You must be logged in or provide a valid API key to save content',
            array('status' => 401)
        );
    }
    if (!current_user_can('edit_posts')) {
        return new WP_Error(
            'insufficient_permissions',
            'You do not have permission to edit content',
            array('status' => 403)
        );
    }
    // Verify nonce
    $nonce = $request->get_header('X-WP-Nonce');
    if (!$nonce || !wp_verify_nonce($nonce, 'wp_rest')) {
        return new WP_Error(
            'invalid_nonce',
            'Invalid security token',
            array('status' => 403)
        );
    }
    // Rate limiting check
    $user_id = get_current_user_id();
    if (!violet_check_rate_limit($user_id)) {
        return new WP_Error(
            'rate_limit_exceeded',
            'Rate limit exceeded. Please wait before making more changes.',
            array('status' => 429)
        );
    }
    return true;
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
 * Validate individual field
 */
function violet_validate_field($field_name, $field_value, $field_type) {
    // Define validation rules
    $validation_rules = array(
        'hero_title' => array(
            'max_length' => 100,
            'required' => false,
            'type' => 'text'
        ),
        'hero_subtitle' => array(
            'max_length' => 200,
            'required' => false,
            'type' => 'text'
        ),
        'hero_cta_text' => array(
            'max_length' => 50,
            'required' => false,
            'type' => 'text'
        ),
        'hero_cta_url' => array(
            'required' => false,
            'type' => 'url'
        ),
        'contact_email' => array(
            'required' => false,
            'type' => 'email'
        )
    );
    
    // Get rules for this field (or defaults)
    $rules = isset($validation_rules[$field_name]) 
        ? $validation_rules[$field_name] 
        : array('type' => $field_type, 'max_length' => 1000);
    
    // Check required
    if (!empty($rules['required']) && empty($field_value)) {
        return array('valid' => false, 'error' => 'Field is required');
    }
    
    // Check max length
    if (isset($rules['max_length']) && strlen($field_value) > $rules['max_length']) {
        return array(
            'valid' => false, 
            'error' => "Field exceeds maximum length of {$rules['max_length']} characters"
        );
    }
    
    // Validate by type
    switch ($rules['type']) {
        case 'url':
            if (!empty($field_value) && !filter_var($field_value, FILTER_VALIDATE_URL)) {
                return array('valid' => false, 'error' => 'Invalid URL format');
            }
            break;
            
        case 'email':
            if (!empty($field_value) && !filter_var($field_value, FILTER_VALIDATE_EMAIL)) {
                return array('valid' => false, 'error' => 'Invalid email format');
            }
            break;
            
        case 'color':
            if (!empty($field_value) && !preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $field_value)) {
                return array('valid' => false, 'error' => 'Invalid color format');
            }
            break;
    }
    
    return array('valid' => true);
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
 * Rate limiting check
 */
function violet_check_rate_limit($user_id) {
    $rate_limit_key = "violet_rate_limit_{$user_id}";
    $attempts = get_transient($rate_limit_key);
    
    if ($attempts === false) {
        set_transient($rate_limit_key, 1, MINUTE_IN_SECONDS);
        return true;
    }
    
    if ($attempts >= 60) { // Max 60 save operations per minute
        return false;
    }
    
    set_transient($rate_limit_key, $attempts + 1, MINUTE_IN_SECONDS);
    return true;
}

/**
 * Log save operations for debugging
 */
function violet_log_save_operation($saved_count, $failed_count, $errors, $save_type = 'manual') {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        $log_entry = array(
            'timestamp' => current_time('c'),
            'user_id' => get_current_user_id(),
            'saved_count' => $saved_count,
            'failed_count' => $failed_count,
            'errors' => $errors,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'save_type' => $save_type
        );
        
        error_log('Violet Save Operation: ' . json_encode($log_entry));
    }
}

/**
 * Trigger Netlify rebuild
 */
function violet_trigger_netlify_rebuild() {
    $netlify_hook = get_option('violet_netlify_hook', '');
    
    if (empty($netlify_hook)) {
        return array(
            'success' => false,
            'error' => 'Netlify build hook not configured'
        );
    }
    
    $response = wp_remote_post($netlify_hook, array(
        'method' => 'POST',
        'timeout' => 30,
        'headers' => array(
            'Content-Type' => 'application/json'
        ),
        'body' => json_encode(array(
            'trigger' => 'content_update',
            'timestamp' => current_time('c')
        ))
    ));
    
    if (is_wp_error($response)) {
        return array(
            'success' => false,
            'error' => $response->get_error_message()
        );
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    
    if ($response_code === 200 || $response_code === 201) {
        return array(
            'success' => true,
            'response_code' => $response_code
        );
    } else {
        return array(
            'success' => false,
            'error' => "HTTP {$response_code}",
            'response_code' => $response_code
        );
    }
}

/**
 * Get content endpoint (for loading)
 */
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/content', array(
        'methods' => 'GET',
        'callback' => 'violet_get_all_content',
        'permission_callback' => '__return_true' // Public endpoint
    ));
});

function violet_get_all_content($request) {
    $content = get_option('violet_all_content', array());
    
    // Add metadata
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
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/debug', array(
        'methods' => 'GET',
        'callback' => 'violet_debug_endpoint',
        'permission_callback' => '__return_true'
    ));
});

function violet_debug_endpoint($request) {
    return new WP_REST_Response(array(
        'success' => true,
        'wordpress_version' => get_bloginfo('version'),
        'user_logged_in' => is_user_logged_in(),
        'user_can_edit' => current_user_can('edit_posts'),
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

// === VIOLET API KEY AUTHENTICATION ===
function violet_check_api_key_header($request = null) {
    $provided = null;
    // Check header (for REST)
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['X-Violet-API-Key'])) {
            $provided = $headers['X-Violet-API-Key'];
        }
    }
    // Check param (for AJAX fallback)
    if (!$provided && isset($_POST['api_key'])) {
        $provided = $_POST['api_key'];
    }
    // Get stored key
    $expected = defined('VIOLET_API_KEY') ? VIOLET_API_KEY : get_option('violet_api_key');
    if (!$expected || !$provided || !hash_equals($expected, $provided)) {
        return false;
    }
    return true;
}
?>