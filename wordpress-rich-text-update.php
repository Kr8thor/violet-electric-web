<?php
/**
 * Add this to your existing functions.php after the current React Frontend Editor code
 * This enhances it to handle rich text formatting
 */

// ============================================================================
// RICH TEXT CONTENT HANDLER
// ============================================================================

/**
 * Enhanced content save endpoint for rich text
 */
function violet_enhanced_save_rich_content($request) {
    $field_name = sanitize_text_field($request->get_param('field_name'));
    $field_value = wp_kses_post($request->get_param('field_value')); // Allows safe HTML
    $field_type = sanitize_text_field($request->get_param('field_type'));
    $field_html = $request->get_param('field_html'); // Raw HTML content
    
    if (empty($field_name) || empty($field_value)) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Field name and value are required'
        ], 400);
    }
    
    // Save both plain text and HTML versions
    $option_name = 'violet_' . $field_name;
    $saved_text = update_option($option_name, $field_value);
    $saved_html = update_option($option_name . '_html', $field_html);
    
    // Save metadata including formatting info
    $metadata = array(
        'field_type' => $field_type,
        'updated' => current_time('mysql'),
        'has_formatting' => ($field_html !== strip_tags($field_html)),
        'char_count' => strlen($field_value),
        'word_count' => str_word_count($field_value)
    );
    update_option($option_name . '_meta', $metadata);
    
    if ($saved_text || $saved_html) {
        // Log the save
        error_log("Violet Rich Text: Saved {$field_name} with formatting");
        
        // Trigger rebuild if configured
        $auto_rebuild = get_option('violet_auto_rebuild', '1');
        if ($auto_rebuild === '1') {
            violet_trigger_netlify_rebuild();
        }
        
        return new WP_REST_Response([
            'success' => true,
            'message' => 'Rich content saved successfully',
            'field_name' => $field_name,
            'field_type' => $field_type,
            'has_formatting' => $metadata['has_formatting']
        ], 200);
    } else {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Failed to save rich content'
        ], 500);
    }
}

// Register the enhanced endpoint
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/content/rich', [
        'methods' => 'POST',
        'callback' => 'violet_enhanced_save_rich_content',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
        'args' => array(
            'field_name' => array(
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field'
            ),
            'field_value' => array(
                'required' => true,
                'type' => 'string'
            ),
            'field_html' => array(
                'required' => false,
                'type' => 'string'
            ),
            'field_type' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'auto',
                'sanitize_callback' => 'sanitize_text_field'
            )
        )
    ]);
});

// ============================================================================
// FRONTEND MESSAGE HANDLER UPDATE
// ============================================================================

// Update the message handler in violet_frontend_editor_page_fixed() function
// Find this part and replace:
?>

<script>
// Add this to the existing violetHandleSaveRequest function
function violetHandleSaveRequest(data) {
    console.log('💾 Handling rich text save request:', data);
    
    // Determine if this is rich text or plain text
    const isRichText = data.html && data.html !== data.value;
    const endpoint = isRichText ? 'violet/v1/content/rich' : 'violet/v1/content/enhanced';
    
    // Save to WordPress via REST API
    fetch('<?php echo rest_url(); ?>' + endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
        },
        body: JSON.stringify({
            field_name: data.fieldType || data.field,
            field_value: data.text || data.value,
            field_html: data.html || data.value,
            field_type: data.fieldType
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            console.log('✅ Rich content saved to WordPress');
            
            // Visual feedback
            const iframe = document.getElementById('violet-site-iframe');
            iframe.style.borderColor = '#00a32a';
            setTimeout(() => {
                iframe.style.borderColor = '#0073aa';
            }, 1000);
            
            // Send success response to React app
            iframe.contentWindow.postMessage({
                type: 'violet-save-response',
                id: data.id,
                success: true,
                hasFormatting: result.has_formatting
            }, '*');
            
        } else {
            console.error('❌ WordPress save failed:', result.message);
            
            // Send error response to React app
            const iframe = document.getElementById('violet-site-iframe');
            iframe.contentWindow.postMessage({
                type: 'violet-save-response',
                id: data.id,
                success: false,
                error: result.message
            }, '*');
        }
    })
    .catch(error => {
        console.error('❌ Save request error:', error);
    });
}
</script>

<?php

// ============================================================================
// NETLIFY REBUILD HELPER
// ============================================================================

function violet_trigger_netlify_rebuild() {
    $hook_url = get_option('violet_netlify_hook');
    if (!$hook_url) {
        return false;
    }
    
    wp_remote_post($hook_url, [
        'timeout' => 15,
        'method' => 'POST',
        'headers' => ['Content-Type' => 'application/json'],
        'body' => json_encode([
            'trigger' => 'wordpress_rich_content_update',
            'timestamp' => current_time('mysql')
        ])
    ]);
    
    return true;
}

// ============================================================================
// RICH TEXT CONTENT DISPLAY
// ============================================================================

/**
 * Get content for frontend with HTML formatting
 */
function violet_get_rich_content_for_frontend() {
    global $wpdb;
    $options = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT option_name, option_value FROM {$wpdb->options} 
             WHERE option_name LIKE %s 
             AND (option_name NOT LIKE %s AND option_name NOT LIKE %s)
             AND option_name NOT LIKE %s
             AND option_name NOT LIKE %s",
            'violet_%', '%_hook', '%_url', '%_meta', '%_html'
        )
    );
    
    $content = [];
    foreach ($options as $option) {
        $field_name = str_replace('violet_', '', $option->option_name);
        
        // Get HTML version if exists
        $html_version = get_option('violet_' . $field_name . '_html');
        
        $content[$field_name] = array(
            'text' => $option->option_value,
            'html' => $html_version ?: $option->option_value,
            'has_formatting' => !empty($html_version) && $html_version !== $option->option_value
        );
    }
    
    return rest_ensure_response($content);
}

// Register the rich content endpoint
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/content/rich-display', [
        'methods' => 'GET',
        'callback' => 'violet_get_rich_content_for_frontend',
        'permission_callback' => '__return_true'
    ]);
});

?>