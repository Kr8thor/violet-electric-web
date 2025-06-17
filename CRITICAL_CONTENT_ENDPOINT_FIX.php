<?php
/**
 * 🚨 CRITICAL FIX: Missing Content Endpoint
 * Add this code to functions.php to fix the 404 error on /wp-json/violet/v1/content
 * 
 * ISSUE: React app can't load WordPress content (404 error)
 * SOLUTION: Register the missing basic content endpoint
 * LOCATION: Add to functions.php after line 2508
 */

// ============================================================================
// CRITICAL CONTENT ENDPOINT FIX - ADD TO FUNCTIONS.PHP
// ============================================================================

/**
 * Register the basic content endpoint that React needs
 * This MUST be separate from the rich text endpoints to avoid conflicts
 */
add_action('rest_api_init', 'violet_register_basic_content_endpoint', 5); // Priority 5 to run early
function violet_register_basic_content_endpoint() {
    // Register the critical /content endpoint
    register_rest_route('violet/v1', '/content', array(
        'methods' => 'GET',
        'callback' => 'violet_get_basic_content_response',
        'permission_callback' => '__return_true', // Public endpoint
        'args' => array(
            'format' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'basic',
                'enum' => array('basic', 'detailed')
            )
        )
    ));
    
    error_log('Violet: Basic content endpoint registered successfully');
}

/**
 * Get basic content for React app (simplified and reliable)
 */
function violet_get_basic_content_response($request) {
    try {
        error_log('Violet: Basic content endpoint called');
        
        // Get unified content
        $unified_content = get_option('violet_all_content', array());
        $basic_content = array();
        
        // Process content for React app
        if (!empty($unified_content)) {
            foreach ($unified_content as $field_name => $field_data) {
                if (is_array($field_data) && isset($field_data['content'])) {
                    // Rich text field - extract just the content
                    $basic_content[$field_name] = $field_data['content'];
                } else {
                    // Plain text field
                    $basic_content[$field_name] = $field_data;
                }
            }
        }
        
        // Fallback: get individual violet_* options
        if (empty($basic_content)) {
            global $wpdb;
            $violet_options = $wpdb->get_results(
                "SELECT option_name, option_value FROM {$wpdb->options} 
                 WHERE option_name LIKE 'violet_%' 
                 AND option_name != 'violet_all_content'"
            );
            
            foreach ($violet_options as $option) {
                $field_name = str_replace('violet_', '', $option->option_name);
                $basic_content[$field_name] = $option->option_value;
            }
        }
        
        // Ensure we have some content
        if (empty($basic_content)) {
            $basic_content = array(
                'hero_title' => 'Change The Channel!',
                'hero_subtitle' => 'Transforming potential with neuroscience and heart.',
                'hero_cta' => 'Book Violet',
                'status' => 'default_content_loaded'
            );
        }
        
        // Add metadata
        $response_data = array(
            'success' => true,
            'data' => $basic_content,
            'count' => count($basic_content),
            'timestamp' => current_time('mysql'),
            'source' => !empty($unified_content) ? 'unified_content' : 'individual_options',
            'endpoint' => 'basic_content'
        );
        
        error_log('Violet: Returning ' . count($basic_content) . ' content fields');
        
        return rest_ensure_response($response_data);
        
    } catch (Exception $e) {
        error_log('Violet: Content endpoint error - ' . $e->getMessage());
        
        return rest_ensure_response(array(
            'success' => false,
            'error' => 'Failed to load content',
            'message' => $e->getMessage(),
            'data' => array(),
            'timestamp' => current_time('mysql')
        ));
    }
}

/**
 * Test the content endpoint manually
 * Call this function to debug: violet_test_content_endpoint()
 */
function violet_test_content_endpoint() {
    $request = new WP_REST_Request('GET', '/violet/v1/content');
    $response = violet_get_basic_content_response($request);
    $data = $response->get_data();
    
    error_log('Violet: Content endpoint test result: ' . json_encode($data));
    
    if (is_admin()) {
        echo '<div class="notice notice-info">';
        echo '<h3>Content Endpoint Test Results:</h3>';
        echo '<pre>' . json_encode($data, JSON_PRETTY_PRINT) . '</pre>';
        echo '</div>';
    }
    
    return $data;
}

// ============================================================================
// IMMEDIATE TESTING INSTRUCTIONS
// ============================================================================

/*
STEP 1: Add this code to functions.php after line 2508

STEP 2: Test the endpoint immediately:
curl https://wp.violetrainwater.com/wp-json/violet/v1/content

STEP 3: Expected response:
{
  "success": true,
  "data": {
    "hero_title": "Change The Channel!",
    "hero_subtitle": "Transforming potential...",
    "hero_cta": "Book Violet",
    ... more fields
  },
  "count": 20,
  "timestamp": "2024-06-11 10:30:00",
  "source": "unified_content",
  "endpoint": "basic_content"
}

STEP 4: If it works, test React app:
- WordPress Admin → Universal Editor
- Changes should now persist and appear immediately

CRITICAL: This endpoint is what makes the entire editing system work!
Without it, React shows hardcoded content instead of WordPress content.
*/
?>