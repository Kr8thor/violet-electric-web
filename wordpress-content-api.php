<?php
/**
 * WordPress REST API endpoint for Violet content
 * Add this to your theme's functions.php file
 */

// Add unified GET endpoint for all content
add_action( 'rest_api_init', function () {
  register_rest_route( 'violet/v1', '/content', [
    'methods'  => 'GET',
    'permission_callback' => '__return_true',
    'callback' => function () {
      wp_cache_flush(); // clear object cache
      $content = get_option( 'violet_all_content', [] );
      
      // Ensure we return an object, not an array
      if (empty($content) || !is_array($content)) {
        $content = [
          'hero_title' => 'Welcome',
          'hero_subtitle' => 'Loading from WordPress...',
          'hero_subtitle_line2' => 'Please wait',
          'hero_cta' => 'Get Started',
          'hero_cta_secondary' => 'Learn More'
        ];
      }
      
      return rest_ensure_response($content);
    },
  ] );
} );

// Update save-batch to flush cache after save
add_action( 'rest_api_init', function() {
    register_rest_route( 'violet/v1', '/content/save-batch', array(
        'methods' => 'POST',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        },
        'callback' => function($request) {
            $changes = $request->get_param('changes');
            
            if (!$changes || !is_array($changes)) {
                return new WP_Error('invalid_data', 'No changes provided', array('status' => 400));
            }
            
            // Get existing content
            $existing_content = get_option('violet_all_content', array());
            
            // Apply changes
            foreach ($changes as $change) {
                if (isset($change['field_name']) && isset($change['field_value'])) {
                    $existing_content[$change['field_name']] = $change['field_value'];
                }
            }
            
            // Save updated content
            update_option('violet_all_content', $existing_content);
            wp_cache_flush(); // Clear cache so GET sees fresh data
            
            // Trigger any post-save hooks
            do_action('violet_after_save', $existing_content);
            
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Content saved successfully',
                'saved_count' => count($changes)
            ));
        }
    ));
});

// Optional: Netlify rebuild hook (background)
add_action( 'violet_after_save', function () {
  $hook_url = get_option('violet_netlify_hook_url');
  if ($hook_url) {
    wp_remote_post( $hook_url, [
      'blocking' => false,
      'timeout'  => 5,
    ] );
  }
});
?>