<?php
/**
 * 🔐 API KEY AUTHENTICATION SYSTEM FOR VIOLET EDITOR
 * This code snippet adds API key authentication to secure save operations
 * Add this to your functions.php file
 */

// 1. Generate and store API key on activation
function violet_generate_api_key() {
    $existing_key = get_option('violet_api_key');
    if (!$existing_key) {
        // Generate a strong 32-character API key
        $api_key = bin2hex(random_bytes(16)); // 32 character hex string
        update_option('violet_api_key', $api_key);
        return $api_key;
    }
    return $existing_key;
}

// Initialize API key on theme/plugin activation
add_action('init', function() {
    if (!get_option('violet_api_key')) {
        violet_generate_api_key();
    }
});

// 2. API Key validation function
function violet_validate_api_key($provided_key = null) {
    // Get API key from multiple sources
    if (!$provided_key) {
        $provided_key = $_SERVER['HTTP_X_VIOLET_API_KEY'] ?? $_POST['api_key'] ?? $_GET['api_key'] ?? '';
    }
    
    // Get the stored API key
    $real_key = get_option('violet_api_key', '');
    
    // Validate
    if (!$real_key || !$provided_key || !hash_equals($real_key, $provided_key)) {
        return false;
    }
    
    return true;
}

// 3. Enhanced permission callback for REST endpoints
function violet_api_key_permission_callback($request) {
    // Check API key first
    if (violet_validate_api_key()) {
        return true;
    }
    
    // Check if request is from WordPress admin (fallback)
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    if (strpos($referer, 'wp.violetrainwater.com/wp-admin') !== false && current_user_can('edit_posts')) {
        return true;
    }
    
    // Check origin for trusted sources
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed_origins = array(
        'https://lustrous-dolphin-447351.netlify.app',
        'https://violetrainwater.com',
        'https://www.violetrainwater.com'
    );
    
    if (in_array($origin, $allowed_origins) && current_user_can('edit_posts')) {
        return true;
    }
    
    return false;
}

// 4. API Key management admin page
add_action('admin_menu', function() {
    add_submenu_page(
        'violet-universal-editor',
        'API Security',
        '🔐 API Security',
        'manage_options',
        'violet-api-security',
        'violet_api_security_page'
    );
});

function violet_api_security_page() {
    // Handle form submission
    if (isset($_POST['regenerate_api_key'])) {
        check_admin_referer('violet_regenerate_api_key');
        
        // Generate new API key
        $new_key = bin2hex(random_bytes(16));
        update_option('violet_api_key', $new_key);
        
        echo '<div class="updated notice"><p>✅ New API key generated successfully!</p></div>';
    }
    
    $api_key = get_option('violet_api_key', '');
    ?>
    <div class="wrap">
        <h1>🔐 API Security Management</h1>
        
        <div class="card" style="max-width: 800px;">
            <h2>Current API Key</h2>
            <p>This API key secures communication between your React frontend and WordPress backend.</p>
            
            <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>API Key:</strong><br>
                <code style="font-size: 14px; word-break: break-all;"><?php echo esc_html($api_key); ?></code>
            </div>
            
            <form method="post" action="">
                <?php wp_nonce_field('violet_regenerate_api_key'); ?>
                <p>
                    <input 
                        type="submit" 
                        name="regenerate_api_key" 
                        class="button button-secondary" 
                        value="🔄 Regenerate API Key"
                        onclick="return confirm('Are you sure? This will invalidate the current key and may break frontend access until updated.');"
                    >
                </p>
            </form>
            
            <h3>📋 Implementation Instructions</h3>
            <ol>
                <li><strong>Copy the API key above</strong></li>
                <li><strong>Add it to your React app environment variables</strong></li>
                <li><strong>Update your frontend code to send the key in requests</strong></li>
                <li><strong>Test the authentication</strong></li>
            </ol>
            
            <h3>🔧 Frontend Implementation</h3>
            <p>In your React app, send the API key as a header:</p>
            <pre style="background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto;"><code>fetch('/wp-json/violet/v1/save-batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Violet-API-Key': '<?php echo esc_js($api_key); ?>'
  },
  body: JSON.stringify(changes)
});</code></pre>

            <h3>⚠️ Security Notes</h3>
            <ul>
                <li>Keep this API key secure and never commit it to public repositories</li>
                <li>Regenerate the key if you suspect it's been compromised</li>
                <li>The key allows full content editing access</li>
                <li>Monitor your site logs for unauthorized access attempts</li>
            </ul>
        </div>
    </div>
    <?php
}

// 5. Test endpoint for API key validation
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/test-auth', array(
        'methods' => 'GET',
        'callback' => function() {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'API key authentication successful',
                'timestamp' => current_time('mysql')
            ));
        },
        'permission_callback' => 'violet_api_key_permission_callback'
    ));
});

// 6. Log authentication attempts (optional)
function violet_log_auth_attempt($success, $source = '') {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        $log_entry = array(
            'timestamp' => current_time('mysql'),
            'success' => $success,
            'source' => $source,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        );
        
        error_log('Violet Auth: ' . json_encode($log_entry));
    }
}

?>
