<?php
/**
 * 🎯 O3.1 WORDPRESS API INTEGRATION
 * Add this code to your WordPress functions.php file
 * 
 * Location: wp.violetrainwater.com → wp-admin → Appearance → Theme Editor → functions.php
 * OR: Via FTP/cPanel at: /wp-content/themes/your-theme/functions.php
 */

// ==============================================
// GET ENDPOINT: Fetch all content for React app
// ==============================================
add_action( 'rest_api_init', function () {
    register_rest_route( 'violet/v1', '/content', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true', // Public endpoint
        'callback' => function () {
            // Clear any object cache to ensure fresh data
            wp_cache_flush();
            
            // Get all saved content
            $content = get_option( 'violet_all_content', [] );
            
            // Ensure we return an object with sensible defaults
            if (empty($content) || !is_array($content)) {
                $content = [
                    'hero_title' => 'Transform Your Potential',
                    'hero_subtitle' => 'Unlock your inner power with neuroscience-backed strategies',
                    'hero_subtitle_line2' => 'Change Your Life.',
                    'hero_cta' => 'Book a Discovery Call',
                    'hero_cta_secondary' => 'Watch Violet in Action',
                    'contact_email' => 'hello@violetrainwater.com',
                    'contact_phone' => '+1 (555) 123-4567',
                    'nav_about' => 'About',
                    'nav_keynotes' => 'Keynotes',
                    'nav_testimonials' => 'Testimonials',
                    'nav_contact' => Contact',
                    'footer_text' => '© 2025 Violet Electric. All rights reserved.',
                    'content_initialized' => '1'
                ];
                
                // Save the defaults
                update_option('violet_all_content', $content);
            }
            
            // Add headers for caching control
            header('Cache-Control: no-cache, must-revalidate');
            header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
            
            return rest_ensure_response($content);
        },
    ] );
} );

// ==============================================
// POST ENDPOINT: Save content with cache busting
// ==============================================
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
            
            // Apply all changes
            foreach ($changes as $change) {
                if (isset($change['field_name']) && isset($change['field_value'])) {
                    $existing_content[$change['field_name']] = $change['field_value'];
                }
            }
            
            // Save updated content
            $save_result = update_option('violet_all_content', $existing_content);
            
            // CRITICAL: Clear all caches so GET endpoint sees fresh data
            wp_cache_flush();
            
            // Clear any plugin caches
            if (function_exists('wp_cache_clear_cache')) {
                wp_cache_clear_cache();
            }
            
            // Clear object cache
            if (function_exists('wp_cache_init')) {
                wp_cache_init();
            }
            
            // Trigger any post-save hooks for Netlify rebuilds
            do_action('violet_after_save', $existing_content);
            
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Content saved successfully',
                'saved_count' => count($changes),
                'total_fields' => count($existing_content),
                'timestamp' => current_time('mysql')
            ));
        }
    ));
});

// ==============================================
// CORS HEADERS: Allow Netlify domain access
// ==============================================
add_action( 'rest_api_init', function() {
    remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
    add_filter( 'rest_pre_serve_request', function( $value ) {
        $allowed_origins = [
            'https://lustrous-dolphin-447351.netlify.app',
            'https://violetrainwater.com',
            'http://localhost:8080',
            'http://localhost:8081'
        ];
        
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array($origin, $allowed_origins)) {
            header( 'Access-Control-Allow-Origin: ' . $origin );
        }
        
        header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE' );
        header( 'Access-Control-Allow-Credentials: true' );
        header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce' );
        
        if ( 'OPTIONS' === $_SERVER['REQUEST_METHOD'] ) {
            status_header( 200 );
            exit();
        }
        
        return $value;
    }, 15 );
});

// ==============================================
// OPTIONAL: Netlify rebuild trigger on save
// ==============================================
add_action( 'violet_after_save', function( $saved_content ) {
    // Add your Netlify build hook URL here if you want automatic rebuilds
    $netlify_hook_url = get_option( 'violet_netlify_hook_url', '' );
    
    if ( $netlify_hook_url ) {
        wp_remote_post( $netlify_hook_url, [
            'blocking' => false,  // Don't wait for response
            'timeout'  => 5,
            'body'     => json_encode([
                'trigger' => 'wordpress-content-update',
                'fields_updated' => count($saved_content),
                'timestamp' => current_time('c')
            ]),
            'headers'  => [
                'Content-Type' => 'application/json'
            ]
        ] );
    }
});

// ==============================================
// ADMIN NOTICE: Installation confirmation
// ==============================================
add_action( 'admin_notices', function() {
    if ( !get_option('violet_api_installed') ) {
        echo '<div class=\"notice notice-success is-dismissible\">';
        echo '<p><strong>✅ Violet Content API Installed!</strong> ';
        echo 'Test endpoint: <a href=\"' . home_url('/wp-json/violet/v1/content') . '\" target=\"_blank\">/wp-json/violet/v1/content</a></p>';
        echo '</div>';
        
        // Mark as installed
        update_option('violet_api_installed', '1');
    }
});

// ==============================================
// DEBUG: Add admin menu for testing
// ==============================================
add_action( 'admin_menu', function() {
    add_submenu_page(
        'tools.php',
        'Violet Content API',
        'Violet Content API', 
        'manage_options',
        'violet-content-api',
        function() {
            echo '<div class=\"wrap\">';
            echo '<h1>🎯 Violet Content API</h1>';
            
            $content = get_option('violet_all_content', []);
            $endpoint_url = home_url('/wp-json/violet/v1/content');
            
            echo '<h2>📡 API Status</h2>';
            echo '<p><strong>Endpoint:</strong> <a href=\"' . $endpoint_url . '\" target=\"_blank\">' . $endpoint_url . '</a></p>';
            echo '<p><strong>Content Fields:</strong> ' . count($content) . '</p>';
            
            echo '<h2>📋 Current Content</h2>';
            echo '<pre style=\"background: #f0f0f0; padding: 15px; overflow-x: auto;\">';
            echo htmlspecialchars(json_encode($content, JSON_PRETTY_PRINT));
            echo '</pre>';
            
            echo '<h2>🧪 Test API</h2>';
            echo '<button onclick=\"testAPI()\" class=\"button button-primary\">Test GET Endpoint</button>';
            echo '<div id=\"api-test-result\" style=\"margin-top: 10px;\"></div>';
            
            echo '<script>
                function testAPI() {
                    document.getElementById(\"api-test-result\").innerHTML = \"Testing...\";
                    fetch(\"' . $endpoint_url . '\")
                        .then(r => r.json())
                        .then(data => {
                            document.getElementById(\"api-test-result\").innerHTML = 
                                \"<div style=\\\"background:#d4edda;padding:10px;border-radius:5px;\\\">\" +
                                \"<strong>✅ API Working!</strong><br>\" +
                                \"Fields returned: \" + Object.keys(data).length + \"<br>\" +
                                \"Sample: \" + JSON.stringify(data).substr(0, 100) + \"...\" +
                                \"</div>\";
                        })
                        .catch(e => {
                            document.getElementById(\"api-test-result\").innerHTML = 
                                \"<div style=\\\"background:#f8d7da;padding:10px;border-radius:5px;\\\">\" +
                                \"<strong>❌ API Error:</strong> \" + e.message +
                                \"</div>\";
                        });
                }
            </script>';
            
            echo '</div>';
        }
    );
});

/* 
==============================================
📋 INSTALLATION INSTRUCTIONS:

1. BACKUP your current functions.php file first!

2. Add this entire code block to the END of your functions.php file
   (before the closing ?> tag if it exists)

3. Visit wp-admin → Tools → Violet Content API to test

4. Test the endpoint directly: 
   https://wp.violetrainwater.com/wp-json/violet/v1/content

5. If you see JSON data, the API is working! ✅

==============================================
*/
?>
