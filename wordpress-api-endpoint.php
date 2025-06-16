
<?php
/**
 * WordPress API Endpoint for Violet Content
 * Add this to your WordPress functions.php file
 */

// Register the missing violet/v1/content endpoint
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/content', [
        'methods' => 'GET',
        'callback' => 'violet_get_all_content',
        'permission_callback' => '__return_true'
    ]);
});

/**
 * Get all violet content for React app
 */
function violet_get_all_content($request) {
    global $wpdb;
    
    // Get all violet options from WordPress database
    $options = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT option_name, option_value FROM {$wpdb->options} 
             WHERE option_name LIKE %s 
             AND option_name NOT LIKE %s 
             AND option_name NOT LIKE %s",
            'violet_%', '%_hook', '%_url'
        )
    );
    
    $content = [];
    foreach ($options as $option) {
        $field_name = str_replace('violet_', '', $option->option_name);
        $content[$field_name] = $option->option_value;
    }
    
    // Log the request for debugging
    error_log("Violet API: Serving content to React app - " . count($content) . " fields");
    
    return rest_ensure_response($content);
}

/**
 * Enhanced save endpoint with better error handling
 */
function violet_enhanced_save_content($request) {
    $field_name = sanitize_text_field($request->get_param('field_name'));
    $field_value = sanitize_textarea_field($request->get_param('field_value'));
    $field_type = sanitize_text_field($request->get_param('field_type'));
    
    if (empty($field_name) || empty($field_value)) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Field name and value are required'
        ], 400);
    }
    
    // Save to WordPress options table
    $option_name = 'violet_' . $field_name;
    $saved = update_option($option_name, $field_value);
    
    if ($saved) {
        error_log("Violet: Saved {$field_name} = {$field_value}");
        
        // Trigger Netlify rebuild if configured
        $netlify_hook = get_option('violet_netlify_hook');
        if ($netlify_hook) {
            wp_remote_post($netlify_hook, [
                'timeout' => 15,
                'method' => 'POST'
            ]);
        }
        
        return new WP_REST_Response([
            'success' => true,
            'message' => 'Content saved successfully',
            'field_name' => $field_name
        ], 200);
    } else {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Failed to save content'
        ], 500);
    }
}

// Register enhanced save endpoint
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/content/enhanced', [
        'methods' => 'POST',
        'callback' => 'violet_enhanced_save_content',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
        'args' => array(
            'field_name' => array(
                'required' => true,
                'type' => 'string'
            ),
            'field_value' => array(
                'required' => true,
                'type' => 'string'
            ),
            'field_type' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'text'
            )
        )
    ]);
});
