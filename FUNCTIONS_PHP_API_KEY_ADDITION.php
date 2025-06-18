/**
 * 🔐 ADD THIS TO YOUR FUNCTIONS.PHP FILE
 * Complete API Key Authentication System for Violet Editor
 * Insert this code after line 200 in functions.php
 */

// ============================================================================
// API KEY AUTHENTICATION SYSTEM
// ============================================================================

/**
 * Generate and store API key on activation
 */
function violet_generate_api_key() {
    $existing_key = get_option('violet_api_key');
    if (!$existing_key) {
        // Generate a strong 32-character API key
        $api_key = bin2hex(random_bytes(16)); // 32 character hex string
        update_option('violet_api_key', $api_key);
        error_log('Violet: Generated new API key: ' . $api_key);
        return $api_key;
    }
    return $existing_key;
}

/**
 * Initialize API key on theme/plugin activation
 */
add_action('init', function() {
    if (!get_option('violet_api_key')) {
        violet_generate_api_key();
    }
});

/**
 * API Key validation function
 */
function violet_validate_api_key($provided_key = null) {
    // Get API key from multiple sources (header preferred, then POST, then GET)
    if (!$provided_key) {
        $provided_key = $_SERVER['HTTP_X_VIOLET_API_KEY'] ?? 
                       $_POST['api_key'] ?? 
                       $_GET['api_key'] ?? 
                       '';
    }
    
    // Get the stored API key
    $real_key = get_option('violet_api_key', '');
    
    // Validate using timing-safe comparison
    if (!$real_key || !$provided_key || !hash_equals($real_key, $provided_key)) {
        // Log failed attempts for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Violet Auth Failed: ' . json_encode(array(
                'provided_key' => substr($provided_key, 0, 8) . '...',
                'real_key_exists' => !empty($real_key),
                'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? 'unknown', 0, 100)
            )));
        }
        return false;
    }
    
    // Log successful authentication
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('Violet Auth Success: API key validated');
    }
    
    return true;
}

/**
 * Enhanced permission callback for REST endpoints
 */
function violet_api_key_permission_callback($request = null) {
    // Method 1: Check API key first (preferred for public access)
    if (violet_validate_api_key()) {
        return true;
    }
    
    // Method 2: Check if request is from WordPress admin (fallback)
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    if (strpos($referer, 'wp.violetrainwater.com/wp-admin') !== false && is_user_logged_in() && current_user_can('edit_posts')) {
        return true;
    }
    
    // Method 3: Check origin for trusted sources with user authentication
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed_origins = array(
        'https://lustrous-dolphin-447351.netlify.app',
        'https://violetrainwater.com',
        'https://www.violetrainwater.com'
    );
    
    if (in_array($origin, $allowed_origins) && is_user_logged_in() && current_user_can('edit_posts')) {
        return true;
    }
    
    // All methods failed
    return false;
}

/**
 * API Key management admin page
 */
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
        
        echo '<div class="updated notice"><p>✅ New API key generated successfully! Make sure to update your frontend code.</p></div>';
    }
    
    $api_key = get_option('violet_api_key', '');
    if (empty($api_key)) {
        $api_key = violet_generate_api_key();
    }
    ?>
    <div class="wrap">
        <h1>🔐 API Security Management</h1>
        
        <div class="card" style="max-width: 800px;">
            <h2>Current API Key</h2>
            <p>This API key secures communication between your React frontend and WordPress backend.</p>
            
            <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>API Key:</strong><br>
                <code style="font-size: 14px; word-break: break-all; user-select: all;" onclick="this.select()"><?php echo esc_html($api_key); ?></code>
                <button onclick="navigator.clipboard.writeText('<?php echo esc_js($api_key); ?>'); this.textContent='✅ Copied!'; setTimeout(() => this.textContent='📋 Copy', 2000)" style="margin-left: 10px;" class="button button-small">📋 Copy</button>
            </div>
            
            <form method="post" action="">
                <?php wp_nonce_field('violet_regenerate_api_key'); ?>
                <p>
                    <input 
                        type="submit" 
                        name="regenerate_api_key" 
                        class="button button-secondary" 
                        value="🔄 Regenerate API Key"
                        onclick="return confirm('⚠️ Are you sure? This will invalidate the current key and may break frontend access until updated.');"
                    >
                </p>
            </form>
            
            <h3>📋 Frontend Implementation</h3>
            <p>Add the API key to your React app environment variables or directly in the code:</p>
            
            <h4>Method 1: Environment Variable (Recommended)</h4>
            <pre style="background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto;"><code>// In your .env file:
VITE_VIOLET_API_KEY=<?php echo esc_html($api_key); ?>

// In your React code:
const API_KEY = import.meta.env.VITE_VIOLET_API_KEY;</code></pre>

            <h4>Method 2: Direct Implementation</h4>
            <pre style="background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto;"><code>// In your fetch requests:
fetch('/wp-json/violet/v1/save-batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Violet-API-Key': '<?php echo esc_js($api_key); ?>'
  },
  body: JSON.stringify(changes)
});</code></pre>

            <h4>Method 3: WordPress Communication Utility</h4>
            <pre style="background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto;"><code>// Update WordPressCommunication.ts:
const API_KEY = '<?php echo esc_js($api_key); ?>';

async function saveToWordPress(data) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Violet-API-Key': API_KEY
    },
    body: JSON.stringify(data)
  });
  return response.json();
}</code></pre>

            <h3>🧪 Test Authentication</h3>
            <p>Test the API key authentication:</p>
            <button onclick="testApiAuth()" class="button button-primary">🧪 Test API Key</button>
            <div id="auth-test-result" style="margin-top: 10px;"></div>
            
            <script>
            async function testApiAuth() {
                const resultDiv = document.getElementById('auth-test-result');
                resultDiv.innerHTML = '⏳ Testing...';
                
                try {
                    const response = await fetch('/wp-json/violet/v1/test-auth', {
                        headers: {
                            'X-Violet-API-Key': '<?php echo esc_js($api_key); ?>'
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        resultDiv.innerHTML = '<div style="color: green; background: #d4edda; padding: 10px; border-radius: 5px;">✅ API Key authentication successful!</div>';
                    } else {
                        resultDiv.innerHTML = '<div style="color: red; background: #f8d7da; padding: 10px; border-radius: 5px;">❌ Authentication failed. Status: ' + response.status + '</div>';
                    }
                } catch (error) {
                    resultDiv.innerHTML = '<div style="color: red; background: #f8d7da; padding: 10px; border-radius: 5px;">❌ Test failed: ' + error.message + '</div>';
                }
            }
            </script>

            <h3>⚠️ Security Notes</h3>
            <ul>
                <li><strong>Keep secure:</strong> Never commit the API key to public repositories</li>
                <li><strong>Regenerate if compromised:</strong> Create a new key if you suspect unauthorized access</li>
                <li><strong>Monitor access:</strong> Check WordPress logs for authentication attempts</li>
                <li><strong>Full access:</strong> This key allows complete content editing permissions</li>
            </ul>
        </div>
    </div>
    <?php
}

/**
 * Test endpoint for API key validation
 */
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/test-auth', array(
        'methods' => array('GET', 'POST'),
        'callback' => function($request) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'API key authentication successful',
                'timestamp' => current_time('mysql'),
                'method' => $request->get_method(),
                'authenticated_via' => 'api_key'
            ));
        },
        'permission_callback' => 'violet_api_key_permission_callback'
    ));
});

// ============================================================================
// UPDATE EXISTING REST ENDPOINTS TO USE API KEY AUTHENTICATION
// ============================================================================

/**
 * REPLACE the existing permission_callback functions in your REST endpoints with:
 * 'permission_callback' => 'violet_api_key_permission_callback'
 * 
 * This applies to these endpoints:
 * - /rich-content/save
 * - /rich-content/save-batch  
 * - /save-batch
 * - /auto-save
 * - Any other violet REST endpoints
 */

// ============================================================================
// ENHANCED BATCH SAVE WITH API KEY AUTHENTICATION
// ============================================================================

/**
 * Enhanced batch save endpoint with API key authentication
 */
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/secure-save-batch', array(
        'methods' => 'POST',
        'callback' => 'violet_secure_batch_save',
        'permission_callback' => 'violet_api_key_permission_callback',
        'args' => array(
            'changes' => array(
                'required' => true,
                'type' => 'array',
                'validate_callback' => function($param) {
                    return is_array($param) && !empty($param);
                }
            ),
            'trigger_rebuild' => array(
                'required' => false,
                'type' => 'boolean',
                'default' => false
            )
        )
    ));
});

function violet_secure_batch_save($request) {
    try {
        error_log('Violet: ===== SECURE BATCH SAVE STARTED =====');
        
        $changes = $request->get_param('changes');
        $trigger_rebuild = $request->get_param('trigger_rebuild');
        
        if (empty($changes) || !is_array($changes)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'No changes provided or invalid format'
            ), 400);
        }

        $saved_count = 0;
        $failed_count = 0;
        $results = array();

        // Get current content to merge with
        $current_content = get_option('violet_all_content', array());

        foreach ($changes as $change) {
            if (!isset($change['field_name']) || !isset($change['field_value'])) {
                $failed_count++;
                continue;
            }

            $field_name = sanitize_key($change['field_name']);
            $field_value = wp_kses_post($change['field_value']);

            // Update unified content
            $current_content[$field_name] = $field_value;

            // Also update individual option for backward compatibility
            update_option('violet_' . $field_name, $field_value);

            $saved_count++;
            $results[$field_name] = array(
                'success' => true,
                'value' => $field_value
            );
            
            error_log('Violet: Saved field ' . $field_name);
        }

        // Save unified content
        $unified_saved = update_option('violet_all_content', $current_content);
        
        // Clear any caches
        wp_cache_flush();

        // Trigger rebuild if requested
        $rebuild_triggered = false;
        if ($trigger_rebuild && $saved_count > 0) {
            $netlify_hook_url = get_option('violet_netlify_hook');
            if (!empty($netlify_hook_url) && filter_var($netlify_hook_url, FILTER_VALIDATE_URL)) {
                $rebuild_response = wp_remote_post($netlify_hook_url, array(
                    'method' => 'POST',
                    'timeout' => 10,
                    'blocking' => false,
                    'body' => array(
                        'trigger' => 'secure_api_save',
                        'changes' => $saved_count
                    )
                ));
                
                if (!is_wp_error($rebuild_response)) {
                    $rebuild_triggered = true;
                    error_log('Violet: Rebuild triggered after secure save');
                }
            }
        }

        $response = array(
            'success' => $saved_count > 0,
            'message' => sprintf('Secure save: %d saved, %d failed', $saved_count, $failed_count),
            'saved_count' => $saved_count,
            'failed_count' => $failed_count,
            'results' => $results,
            'rebuild_triggered' => $rebuild_triggered,
            'unified_saved' => $unified_saved,
            'authenticated_via' => 'api_key',
            'timestamp' => current_time('mysql')
        );

        error_log('Violet: ===== SECURE BATCH SAVE COMPLETED =====');

        return new WP_REST_Response($response, 200);

    } catch (Exception $e) {
        error_log('Violet: Secure batch save error - ' . $e->getMessage());
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ), 500);
    }
}

// ============================================================================
// ADMIN NOTICES AND SETUP GUIDANCE
// ============================================================================

/**
 * Admin notice to guide API key setup
 */
add_action('admin_notices', function() {
    if (!get_option('violet_api_key_setup_complete')) {
        ?>
        <div class="notice notice-warning is-dismissible">
            <p>
                <strong>🔐 Violet Editor Security:</strong> 
                <a href="<?php echo admin_url('admin.php?page=violet-api-security'); ?>">Configure your API key</a> 
                to secure frontend-backend communication.
                <a href="<?php echo add_query_arg('violet_dismiss_api_notice', '1'); ?>" style="float: right;">Dismiss</a>
            </p>
        </div>
        <?php
    }
});

// Handle notice dismissal
add_action('admin_init', function() {
    if (isset($_GET['violet_dismiss_api_notice'])) {
        update_option('violet_api_key_setup_complete', true);
        wp_redirect(remove_query_arg('violet_dismiss_api_notice'));
        exit;
    }
});

/**
 * NEXT STEP: Add this code to your functions.php file, then update your React frontend
 * to send the API key in requests.
 */
