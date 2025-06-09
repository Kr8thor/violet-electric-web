// WordPress Save Fix - Add this to your functions.php
// This ensures content actually saves to the WordPress database

function violet_debug_save_content($request) {
    error_log('🔍 VIOLET DEBUG: Save request received');
    error_log('Request body: ' . print_r($request->get_body(), true));
    error_log('Parsed params: ' . print_r($request->get_params(), true));
    
    $changes = $request->get_param('changes');
    error_log('Changes array: ' . print_r($changes, true));
    
    if (!is_array($changes)) {
        error_log('❌ Changes is not an array!');
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Invalid changes format'
        ), 400);
    }
    
    $saved_count = 0;
    $results = array();
    
    foreach ($changes as $change) {
        error_log('Processing change: ' . print_r($change, true));
        
        if (isset($change['field_name']) && isset($change['field_value'])) {
            $field_name = sanitize_key($change['field_name']);
            $field_value = wp_kses_post($change['field_value']);
            $option_name = 'violet_' . $field_name;
            
            error_log("Saving: $option_name = $field_value");
            
            // Force update
            delete_option($option_name);
            $saved = add_option($option_name, $field_value, '', 'yes');
            
            if (!$saved) {
                $saved = update_option($option_name, $field_value);
            }
            
            // Verify save
            $verify = get_option($option_name);
            error_log("Verification: $option_name = $verify");
            
            if ($verify === $field_value) {
                $saved_count++;
                $results[$field_name] = 'saved';
            } else {
                $results[$field_name] = 'failed';
                error_log("❌ Save failed for $field_name");
            }
        }
    }
    
    error_log("✅ Save complete: $saved_count fields saved");
    error_log("Results: " . print_r($results, true));
    
    return new WP_REST_Response(array(
        'success' => $saved_count > 0,
        'saved_count' => $saved_count,
        'results' => $results
    ), 200);
}

// Add this to check what's in the database
function violet_check_saved_content() {
    global $wpdb;
    $results = $wpdb->get_results(
        "SELECT option_name, option_value 
         FROM {$wpdb->options} 
         WHERE option_name LIKE 'violet_%' 
         ORDER BY option_name"
    );
    
    echo "<h2>Violet Content in Database:</h2><pre>";
    foreach ($results as $row) {
        echo $row->option_name . " = " . $row->option_value . "\n";
    }
    echo "</pre>";
}

// Add to WordPress admin menu
add_action('admin_menu', function() {
    add_submenu_page(
        'violet-frontend-editor',
        'Debug Content',
        '🔍 Debug',
        'manage_options',
        'violet-debug-content',
        'violet_check_saved_content'
    );
});
