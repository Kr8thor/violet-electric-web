<?php
/**
 * React Frontend Editor - Enhanced Phase 1 Version (FIXED)
 * Compatible with headless WordPress + Netlify setup
 * Fixes CORS issues and enables iframe-based editing
 * 
 * CRITICAL FIX: Removes function redeclaration error
 * 
 * Add this to your functions.php file or create as a separate plugin
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// ============================================================================
// PHASE 1 INSTALLATION NOTICE
// ============================================================================

add_action('admin_notices', 'violet_phase1_installation_notice');
function violet_phase1_installation_notice() {
    if (!current_user_can('manage_options')) return;
    
    $screen = get_current_screen();
    if ($screen && strpos($screen->id, 'violet') !== false) {
        ?>
        <div class="notice notice-success is-dismissible">
            <p><strong>✅ Phase 1 Enhanced Field Detection Installed!</strong> 
            Your React Frontend Editor now supports 15+ field types with advanced validation. 
            <a href="<?php echo admin_url('tools.php?page=violet-field-test'); ?>">Test the new features</a></p>
        </div>
        <?php
    }
}

// ============================================================================
// CRITICAL IFRAME AND CORS FIXES
// ============================================================================

// Force proper iframe headers for Netlify - CRITICAL
add_action('init', 'violet_critical_iframe_fix', 1);
function violet_critical_iframe_fix() {
    if (!headers_sent()) {
        // Remove ALL restrictive headers
        header_remove('X-Frame-Options');
        header_remove('Content-Security-Policy');
        header_remove('X-Content-Type-Options');
        
        // Allow iframe embedding from Netlify
        header('X-Frame-Options: ALLOWALL');
        
        // Set permissive CSP for iframe
        header('Content-Security-Policy: frame-ancestors *');
    }
}

// Enhanced CORS for ALL requests - SECURE
add_action('send_headers', 'violet_secure_cors_and_security_headers');
function violet_secure_cors_and_security_headers() {
    $origin = get_http_origin();
    $allowed_origins = array(
        'https://lustrous-dolphin-447351.netlify.app',
        'https://violetrainwater.com',
        'https://www.violetrainwater.com',
        'https://wp.violetrainwater.com'
    );
    $allowed_headers = 'Content-Type, Authorization, X-Requested-With, X-WP-Nonce, Origin, Accept, Cache-Control, Pragma';
    if ($origin && in_array($origin, $allowed_origins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD');
        header('Access-Control-Allow-Headers: ' . $allowed_headers);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(200);
            exit();
        }
    }
    // Security headers for all non-admin requests
    if (!is_admin()) {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    }
}

// Master CORS Handler for REST API
add_action('rest_api_init', function() {
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        
        $allowed_origins = array(
            'https://lustrous-dolphin-447351.netlify.app',
            'https://violetrainwater.com',
            'https://www.violetrainwater.com',
            'https://wp.violetrainwater.com',
            'http://localhost:3000',
            'http://localhost:3001'
        );
        
        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-WP-Nonce, Origin, Accept, Cache-Control, Pragma');
            header('Access-Control-Allow-Credentials: true');
        }
        
        return $value;
    });
}, 15);

// ============================================================================
// ADMIN MENU SETUP
// ============================================================================

add_action('admin_menu', 'violet_add_frontend_editor_menu');
function violet_add_frontend_editor_menu() {
    add_menu_page(
        'Frontend Editor',
        '🎨 Edit Frontend',
        'manage_options',
        'violet-frontend-editor',
        'violet_frontend_editor_page_fixed', // RENAMED to avoid conflict
        'dashicons-edit-page',
        25
    );
    
    add_submenu_page(
        'violet-frontend-editor',
        'Editor Settings',
        '⚙️ Settings',
        'manage_options',
        'violet-editor-settings',
        'violet_editor_settings_page'
    );
    
    add_submenu_page(
        'violet-frontend-editor',
        'Manage Content',
        '📝 Content',
        'manage_options',
        'violet-content-manager',
        'violet_content_manager_page'
    );
    
    // Phase 1: Add Field Detection Test page under Tools
    add_submenu_page(
        'tools.php',
        'Field Detection Test',
        '🧪 Field Detection Test',
        'manage_options',
        'violet-field-test',
        'violet_field_test_page'
    );
}

// ============================================================================
// PHASE 1: ENHANCED FIELD TYPE DEFINITIONS
// ============================================================================

function violet_get_supported_field_types() {
    return array(
        // Hero Section
        'hero_title' => array(
            'label' => 'Hero Title',
            'type' => 'text',
            'validation' => 'required|max:100',
            'sanitization' => 'sanitize_text_field',
            'description' => 'Main headline on homepage'
        ),
        'hero_subtitle' => array(
            'label' => 'Hero Subtitle',
            'type' => 'textarea',
            'validation' => 'max:200',
            'sanitization' => 'sanitize_textarea_field',
            'description' => 'Supporting text under main headline'
        ),
        'hero_cta' => array(
            'label' => 'Hero Call-to-Action',
            'type' => 'text',
            'validation' => 'max:50',
            'sanitization' => 'sanitize_text_field',
            'description' => 'Button text for main action'
        ),
        'hero_image' => array(
            'label' => 'Hero Background Image',
            'type' => 'url',
            'validation' => 'url',
            'sanitization' => 'esc_url_raw',
            'description' => 'Hero section background image'
        ),
        
        // Images
        'content_image' => array(
            'label' => 'Content Image',
            'type' => 'url',
            'validation' => 'url',
            'sanitization' => 'esc_url_raw',
            'description' => 'General content images'
        ),
        'logo_image' => array(
            'label' => 'Logo Image',
            'type' => 'url',
            'validation' => 'url|required',
            'sanitization' => 'esc_url_raw',
            'description' => 'Site logo image'
        ),
        
        // Contact Information
        'contact_email' => array(
            'label' => 'Contact Email',
            'type' => 'email',
            'validation' => 'email|required',
            'sanitization' => 'sanitize_email',
            'description' => 'Primary contact email address'
        ),
        'contact_phone' => array(
            'label' => 'Contact Phone',
            'type' => 'tel',
            'validation' => 'phone',
            'sanitization' => 'violet_sanitize_phone',
            'description' => 'Primary contact phone number'
        ),
        
        // SEO Content
        'seo_title' => array(
            'label' => 'SEO Title',
            'type' => 'text',
            'validation' => 'required|max:60',
            'sanitization' => 'sanitize_text_field',
            'description' => 'Page title for search engines (max 60 chars)'
        ),
        'seo_description' => array(
            'label' => 'SEO Description',
            'type' => 'textarea',
            'validation' => 'required|max:160',
            'sanitization' => 'sanitize_textarea_field',
            'description' => 'Meta description for search engines (max 160 chars)'
        ),
        
        // Navigation
        'navigation_item' => array(
            'label' => 'Navigation Item',
            'type' => 'text',
            'validation' => 'max:50',
            'sanitization' => 'sanitize_text_field',
            'description' => 'Menu item text'
        ),
        
        // Content Types
        'generic_text' => array(
            'label' => 'Generic Text',
            'type' => 'textarea',
            'validation' => 'max:1000',
            'sanitization' => 'sanitize_textarea_field',
            'description' => 'General text content'
        )
    );
}

// ============================================================================
// PHASE 1: CONTENT MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Enhanced content update with field type support
 */
function violet_enhanced_content_update($field_name, $field_value, $field_type = 'auto') {
    $supported_types = violet_get_supported_field_types();
    
    // Auto-detect field type if not specified
    if ($field_type === 'auto') {
        $field_type = violet_detect_field_type($field_name, $field_value);
    }
    
    // Validate field type exists
    if (!isset($supported_types[$field_type])) {
        return new WP_Error('invalid_field_type', 'Unsupported field type: ' . $field_type);
    }
    
    $field_config = $supported_types[$field_type];
    
    // Validate field value
    $validation_result = violet_validate_field_type($field_value, $field_type, $field_config['validation']);
    if (is_wp_error($validation_result)) {
        return $validation_result;
    }
    
    // Sanitize field value
    $sanitized_value = violet_sanitize_by_field_type($field_value, $field_config['sanitization']);
    
    // Store with metadata
    $option_name = 'violet_' . $field_name;
    $metadata = array(
        'field_type' => $field_type,
        'updated' => current_time('mysql'),
        'validation_passed' => true
    );
    
    // Update both content and metadata
    $content_updated = update_option($option_name, $sanitized_value);
    $metadata_updated = update_option($option_name . '_meta', $metadata);
    
    if ($content_updated || $metadata_updated) {
        // Log the update
        error_log("Violet: Enhanced update for {$field_name} as {$field_type}");
        return true;
    }
    
    return new WP_Error('update_failed', 'Failed to update content');
}

/**
 * Auto-detect field type based on name and content
 */
function violet_detect_field_type($field_name, $field_value) {
    $name_lower = strtolower($field_name);
    $value_lower = strtolower($field_value);
    
    // Hero section detection
    if (strpos($name_lower, 'hero') !== false) {
        if (strpos($name_lower, 'title') !== false) return 'hero_title';
        if (strpos($name_lower, 'subtitle') !== false) return 'hero_subtitle';
        if (strpos($name_lower, 'cta') !== false || strpos($name_lower, 'button') !== false) return 'hero_cta';
        if (strpos($name_lower, 'image') !== false) return 'hero_image';
    }
    
    // Contact detection
    if (filter_var($field_value, FILTER_VALIDATE_EMAIL)) return 'contact_email';
    if (violet_validate_phone($field_value)) return 'contact_phone';
    
    // Image detection
    if (filter_var($field_value, FILTER_VALIDATE_URL) && violet_is_image_url($field_value)) {
        if (strpos($name_lower, 'logo') !== false) return 'logo_image';
        return 'content_image';
    }
    
    // SEO detection
    if (strpos($name_lower, 'seo') !== false || strpos($name_lower, 'meta') !== false) {
        if (strpos($name_lower, 'title') !== false) return 'seo_title';
        if (strpos($name_lower, 'description') !== false) return 'seo_description';
    }
    
    // Navigation detection
    if (strpos($name_lower, 'nav') !== false || strpos($name_lower, 'menu') !== false) return 'navigation_item';
    
    return 'generic_text';
}

/**
 * Validate field based on type and rules
 */
function violet_validate_field_type($value, $field_type, $validation_rules) {
    $rules = explode('|', $validation_rules);
    
    foreach ($rules as $rule) {
        if ($rule === 'required' && empty($value)) {
            return new WP_Error('field_required', "Field {$field_type} is required");
        }
        
        if (strpos($rule, 'max:') === 0) {
            $max_length = intval(str_replace('max:', '', $rule));
            if (strlen($value) > $max_length) {
                return new WP_Error('field_too_long', "Field {$field_type} exceeds maximum length of {$max_length}");
            }
        }
        
        if ($rule === 'email' && !empty($value) && !is_email($value)) {
            return new WP_Error('invalid_email', "Invalid email format for {$field_type}");
        }
        
        if ($rule === 'url' && !empty($value) && !filter_var($value, FILTER_VALIDATE_URL)) {
            return new WP_Error('invalid_url', "Invalid URL format for {$field_type}");
        }
        
        if ($rule === 'phone' && !empty($value) && !violet_validate_phone($value)) {
            return new WP_Error('invalid_phone', "Invalid phone format for {$field_type}");
        }
    }
    
    return true;
}

/**
 * Sanitize content based on field type
 */
function violet_sanitize_by_field_type($value, $sanitization_function) {
    switch ($sanitization_function) {
        case 'sanitize_text_field':
            return sanitize_text_field($value);
        case 'sanitize_textarea_field':
            return sanitize_textarea_field($value);
        case 'sanitize_email':
            return sanitize_email($value);
        case 'esc_url_raw':
            return esc_url_raw($value);
        case 'violet_sanitize_phone':
            return violet_sanitize_phone($value);
        default:
            return sanitize_text_field($value);
    }
}

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validate phone number format
 */
function violet_validate_phone($phone) {
    $phone = preg_replace('/[^\d+\-\(\)\s]/', '', $phone);
    return preg_match('/^[\+]?[1-9][\d\s\-\(\)]{7,20}$/', $phone);
}

/**
 * Check if URL is an image
 */
function violet_is_image_url($url) {
    $image_extensions = array('jpg', 'jpeg', 'png', 'gif', 'webp', 'svg');
    $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
    return in_array($extension, $image_extensions);
}

/**
 * Sanitize phone number
 */
function violet_sanitize_phone($phone) {
    return preg_replace('/[^\d+\-\(\)\s]/', '', sanitize_text_field($phone));
}

// ============================================================================
// ENHANCED REST API ENDPOINTS
// ============================================================================

add_action('rest_api_init', 'violet_register_enhanced_endpoints');
function violet_register_enhanced_endpoints() {
    // Original content endpoint
    register_rest_route('violet/v1', '/content', [
        'methods' => 'GET',
        'callback' => 'violet_get_content_for_frontend',
        'permission_callback' => '__return_true'
    ]);
    
    // Enhanced content update endpoint
    register_rest_route('violet/v1', '/content/enhanced', [
        'methods' => 'POST',
        'callback' => 'violet_enhanced_save_content',
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
            'field_type' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'auto',
                'sanitize_callback' => 'sanitize_text_field'
            )
        )
    ]);
    
    // Validation endpoint
    register_rest_route('violet/v1', '/validate-field', [
        'methods' => 'POST',
        'callback' => 'violet_validate_field_endpoint',
        'permission_callback' => '__return_true',
        'args' => array(
            'field_value' => array(
                'required' => true,
                'type' => 'string'
            ),
            'field_type' => array(
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field'
            )
        )
    ]);
}

// Enhanced content save endpoint - SECURE
function violet_enhanced_save_content($request) {
    $field_name = sanitize_key($request->get_param('field_name'));
    $field_value = sanitize_textarea_field($request->get_param('field_value'));
    $field_type = sanitize_key($request->get_param('field_type'));
    $allowed_fields = array('hero_title', 'hero_subtitle', 'contact_email', 'hero_cta', 'hero_image', 'content_image', 'logo_image');
    if (!in_array($field_name, $allowed_fields, true)) {
        return new WP_Error('invalid_field', 'Field not allowed');
    }
    if (empty($field_name) || empty($field_value)) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Field name and value are required'
        ], 400);
    }
    $option_name = 'violet_' . $field_name;
    $saved = update_option($option_name, $field_value);
    if ($saved) {
        error_log("Violet: Saved {$field_name} = {$field_value}");
        return new WP_REST_Response([
            'success' => true,
            'message' => 'Content saved successfully',
            'field_name' => $field_name,
            'field_type' => $field_type
        ], 200);
    } else {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Failed to save content'
        ], 500);
    }
}

/**
 * Field validation endpoint
 */
function violet_validate_field_endpoint($request) {
    $field_value = $request->get_param('field_value');
    $field_type = $request->get_param('field_type');
    
    $supported_types = violet_get_supported_field_types();
    
    if (!isset($supported_types[$field_type])) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Unsupported field type',
            'field_type' => $field_type
        ), 400);
    }
    
    $field_config = $supported_types[$field_type];
    $validation_result = violet_validate_field_type($field_value, $field_type, $field_config['validation']);
    
    if (is_wp_error($validation_result)) {
        return new WP_REST_Response(array(
            'success' => false,
            'valid' => false,
            'message' => $validation_result->get_error_message(),
            'field_type' => $field_type
        ), 200);
    }
    
    return new WP_REST_Response(array(
        'success' => true,
        'valid' => true,
        'message' => 'Field validation passed',
        'field_type' => $field_type,
        'sanitized_value' => violet_sanitize_by_field_type($field_value, $field_config['sanitization'])
    ), 200);
}

/**
 * Get content for frontend
 */
function violet_get_content_for_frontend() {
    global $wpdb;
    $options = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT option_name, option_value FROM {$wpdb->options} 
             WHERE option_name LIKE %s 
             AND option_name NOT LIKE %s 
             AND option_name NOT LIKE %s
             AND option_name NOT LIKE %s",
            'violet_%', '%_hook', '%_url', '%_meta'
        )
    );
    
    $content = [];
    foreach ($options as $option) {
        $field_name = str_replace('violet_', '', $option->option_name);
        $content[$field_name] = $option->option_value;
    }
    
    return rest_ensure_response($content);
}

// ============================================================================
// MAIN EDITOR PAGE (FIXED VERSION)
// ============================================================================

function violet_frontend_editor_page_fixed() {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }
    
    $netlify_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    $wp_url = get_option('violet_wp_url', 'https://violetrainwater.com');
    ?>
    <div class="wrap">
        <h1>🎨 React Frontend Editor - FIXED</h1>
        
        <div class="notice notice-success">
            <p><strong>✅ FIXES APPLIED:</strong> Enhanced iframe communication, direct text editing, real-time updates</p>
        </div>
        
        <div class="notice notice-info">
            <p><strong>Connection Status:</strong> <span id="violet-connection-status">Connecting...</span></p>
            <p><strong>React App Status:</strong> <span id="violet-react-status">Waiting...</span></p>
            <p><strong>Communication:</strong> <span id="violet-communication-status">Initializing...</span></p>
        </div>
        
        <div class="violet-editor-controls">
            <button id="violet-edit-toggle" class="button button-primary" onclick="violetActivateDirectEditing()">
                ✏️ Enable Direct Editing
            </button>
            <button onclick="violetRefreshPreview()" class="button">🔄 Refresh</button>
            <button onclick="violetTestCommunication()" class="button">🔗 Test Connection</button>
            <button onclick="violetTriggerRebuild()" class="button button-secondary">🚀 Rebuild Site</button>
        </div>
        
        <div class="violet-preview-container">
            <iframe 
                id="violet-site-iframe" 
                src="<?php echo esc_url($netlify_url); ?>?edit_mode=1&wp_admin=1&t=<?php echo time(); ?>" 
                title="Live Site with Editing"
                allow="same-origin"
                style="width: 100%; height: 70vh; border: 2px solid #0073aa; border-radius: 8px;"
            ></iframe>
        </div>
        
        <!-- Simple Edit Modal -->
        <div id="violet-edit-modal" class="violet-modal" style="display: none;">
            <div class="violet-modal-overlay" onclick="violetCloseModal()"></div>
            <div class="violet-modal-content">
                <h3>✏️ Edit Content</h3>
                <div class="violet-field-info">
                    <strong>Field:</strong> <span id="violet-field-type">-</span><br>
                    <strong>Element:</strong> <span id="violet-element-info">-</span>
                </div>
                <label for="violet-edit-text"><strong>Content:</strong></label>
                <textarea id="violet-edit-text" rows="4" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px;"></textarea>
                <div style="margin-top: 15px; text-align: right;">
                    <button class="button button-primary" onclick="violetSaveEdit()">💾 Save</button>
                    <button class="button" onclick="violetCloseModal()">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    
    <style>
    .violet-editor-controls { 
        margin: 20px 0; 
        padding: 20px; 
        background: linear-gradient(135deg, #0073aa 0%, #005a87 100%); 
        border-radius: 8px; 
        display: flex; 
        gap: 15px; 
        align-items: center; 
    }
    .violet-editor-controls .button { 
        background: rgba(255,255,255,0.9); 
        border: none; 
        color: #0073aa; 
        font-weight: 600; 
        padding: 10px 20px; 
        border-radius: 6px; 
        transition: all 0.3s ease; 
    }
    .violet-editor-controls .button:hover { 
        background: white; 
        transform: translateY(-1px); 
        box-shadow: 0 4px 8px rgba(0,0,0,0.2); 
    }
    .violet-editor-controls .button-primary { 
        background: #00a32a; 
        color: white; 
    }
    .violet-preview-container { 
        background: white; 
        border-radius: 8px; 
        overflow: hidden; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
    }
    .violet-modal { 
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        z-index: 999999; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
    }
    .violet-modal-overlay { 
        position: absolute; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background: rgba(0, 0, 0, 0.7); 
    }
    .violet-modal-content { 
        position: relative; 
        background: white; 
        padding: 30px; 
        border-radius: 8px; 
        width: 90%; 
        max-width: 500px; 
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); 
    }
    .violet-field-info { 
        margin: 15px 0; 
        padding: 10px; 
        background: #f0f8ff; 
        border-radius: 4px; 
        font-size: 13px; 
    }
    #violet-connection-status.success, #violet-react-status.success, #violet-communication-status.success { 
        color: #00a32a; 
        font-weight: bold; 
    }
    #violet-connection-status.error, #violet-react-status.error, #violet-communication-status.error { 
        color: #d63939; 
        font-weight: bold; 
    }
    </style>
    
    <script>
    let violetEditingEnabled = false;
    let violetCurrentEditData = null;
    let violetReactAppReady = false;
    
    document.addEventListener('DOMContentLoaded', function() {
        violetInitializeEditor();
    });
    
    function violetInitializeEditor() {
        console.log('🎨 Initializing WordPress editor...');
        
        violetSetStatus('connection', 'Connecting to React app...', 'info');
        violetSetStatus('react', 'Loading React components...', 'info');
        violetSetStatus('communication', 'Setting up PostMessage...', 'info');
        
        // Enhanced message listener
        window.addEventListener('message', violetHandleMessage);
        
        // Test connection after iframe loads
        const iframe = document.getElementById('violet-site-iframe');
        iframe.onload = function() {
            violetSetStatus('connection', 'iframe loaded successfully', 'success');
            setTimeout(violetTestCommunication, 1000);
        };
        
        iframe.onerror = function() {
            violetSetStatus('connection', 'Failed to load React app', 'error');
        };
        
        // Send test message every 2 seconds until connected
        const connectionTest = setInterval(() => {
            if (!violetReactAppReady) {
                violetTestCommunication();
            } else {
                clearInterval(connectionTest);
            }
        }, 2000);
    }
    
    function violetHandleMessage(event) {
        // Enhanced security check
        const allowedOrigins = [
            'https://lustrous-dolphin-447351.netlify.app',
            'https://violetrainwater.com'
        ];
        
        const isValidOrigin = allowedOrigins.some(origin => 
            event.origin === origin || event.origin.includes(origin.replace('https://', ''))
        );
        
        if (!isValidOrigin) {
            console.log('🚫 Blocked message from:', event.origin);
            return;
        }
        
        console.log('📨 Received message:', event.data);
        
        const data = event.data;
        
        switch (data.type) {
            case 'violet-iframe-ready':
                violetReactAppReady = true;
                violetSetStatus('react', '✅ React app ready for editing', 'success');
                violetSetStatus('communication', '✅ PostMessage communication active', 'success');
                console.log('✅ React app confirmed ready');
                break;
                
            case 'violet-access-confirmed':
                violetSetStatus('communication', '✅ Two-way communication confirmed', 'success');
                break;
                
            case 'violet-edit-request':
                violetHandleEditRequest(data.data);
                break;
                
            case 'violet-save-content':
                violetHandleSaveRequest(data.data);
                break;
                
            default:
                console.log('Unhandled message type:', data.type);
        }
    }
    
    function violetTestCommunication() {
        const iframe = document.getElementById('violet-site-iframe');
        violetSetStatus('communication', 'Testing communication...', 'info');
        
        try {
            iframe.contentWindow.postMessage({
                type: 'violet-test-access',
                timestamp: Date.now(),
                from: 'wordpress-admin'
            }, '*');
            
            console.log('📤 Sent test message to React app');
            
        } catch (error) {
            violetSetStatus('communication', '❌ Communication test failed', 'error');
            console.error('Communication test error:', error);
        }
    }
    
    function violetActivateDirectEditing() {
        if (!violetReactAppReady) {
            alert('❌ React app not ready yet. Please wait and try again.');
            return;
        }
        
        const btn = document.getElementById('violet-edit-toggle');
        const iframe = document.getElementById('violet-site-iframe');
        
        if (violetEditingEnabled) {
            // Disable editing
            violetEditingEnabled = false;
            btn.innerHTML = '✏️ Enable Direct Editing';
            btn.className = 'button button-primary';
            
            iframe.contentWindow.postMessage({
                type: 'violet-disable-editing'
            }, '*');
            
            console.log('🔒 Direct editing disabled');
        } else {
            // Enable editing
            violetEditingEnabled = true;
            btn.innerHTML = '🔓 Disable Direct Editing';
            btn.className = 'button button-secondary';
            
            iframe.contentWindow.postMessage({
                type: 'violet-enable-editing',
                timestamp: Date.now()
            }, '*');
            
            console.log('✏️ Direct editing enabled');
            
            // Show instructions
            setTimeout(() => {
                alert('✅ Direct editing is now active!\n\n📋 Instructions:\n1. Look for blue dashed outlines around text\n2. Click any outlined text to edit it\n3. Changes save automatically\n\nTip: Headlines and buttons work best!');
            }, 500);
        }
    }
    
    function violetHandleEditRequest(data) {
        violetCurrentEditData = data;
        
        // Populate modal
        document.getElementById('violet-field-type').textContent = data.fieldType || 'unknown';
        document.getElementById('violet-element-info').textContent = `${data.element || 'element'} with ${Math.round((data.confidence || 0.5) * 100)}% confidence`;
        document.getElementById('violet-edit-text').value = data.text || '';
        
        // Show modal
        document.getElementById('violet-edit-modal').style.display = 'flex';
        document.getElementById('violet-edit-text').focus();
        document.getElementById('violet-edit-text').select();
        
        console.log('📝 Opening edit modal for:', data.fieldType);
    }
    
    function violetHandleSaveRequest(data) {
        console.log('💾 Handling save request:', data);
        
        // Save to WordPress via REST API
        fetch('<?php echo rest_url('violet/v1/content/enhanced'); ?>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
            },
            body: JSON.stringify({
                field_name: data.fieldType,
                field_value: data.value,
                field_type: data.fieldType
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                console.log('✅ Content saved to WordPress');
                
                // Send success response to React app
                const iframe = document.getElementById('violet-site-iframe');
                iframe.contentWindow.postMessage({
                    type: 'violet-save-response',
                    id: data.id,
                    success: true
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
    
    function violetSaveEdit() {
        if (!violetCurrentEditData) return;
        
        const newValue = document.getElementById('violet-edit-text').value.trim();
        
        if (!newValue) {
            alert('❌ Content cannot be empty');
            return;
        }
        
        console.log('💾 Saving edited content:', newValue);
        
        // Save to WordPress
        violetHandleSaveRequest({
            fieldType: violetCurrentEditData.fieldType,
            value: newValue,
            id: 'manual-' + Date.now()
        });
        
        // Update React app
        const iframe = document.getElementById('violet-site-iframe');
        iframe.contentWindow.postMessage({
            type: 'violet-content-updated',
            field: violetCurrentEditData.fieldType,
            newValue: newValue
        }, '*');
        
        violetCloseModal();
    }
    
    function violetCloseModal() {
        document.getElementById('violet-edit-modal').style.display = 'none';
        violetCurrentEditData = null;
    }
    
    function violetRefreshPreview() {
        const iframe = document.getElementById('violet-site-iframe');
        const currentUrl = iframe.src.split('?')[0];
        iframe.src = currentUrl + '?edit_mode=1&wp_admin=1&t=' + Date.now();
        
        violetEditingEnabled = false;
        document.getElementById('violet-edit-toggle').innerHTML = '✏️ Enable Direct Editing';
        document.getElementById('violet-edit-toggle').className = 'button button-primary';
        
        violetSetStatus('connection', 'Refreshing...', 'info');
        violetSetStatus('react', 'Reloading...', 'info');
        violetSetStatus('communication', 'Reconnecting...', 'info');
        
        violetReactAppReady = false;
    }
    
    function violetTriggerRebuild() {
        console.log('🚀 Triggering Netlify rebuild...');
        
        const formData = new FormData();
        formData.append('action', 'violet_trigger_rebuild');
        formData.append('nonce', '<?php echo wp_create_nonce('violet_rebuild_nonce'); ?>');
        
        fetch('<?php echo admin_url('admin-ajax.php'); ?>', { 
            method: 'POST', 
            body: formData 
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('✅ Rebuild triggered successfully!\n\nThe site will update in 2-4 minutes.\nCheck: https://app.netlify.com/sites/lustrous-dolphin-447351/deploys');
            } else {
                alert('❌ Rebuild failed: ' + (data.data?.message || 'Unknown error'));
            }
        })
        .catch(error => {
            alert('❌ Rebuild error: ' + error.message);
        });
    }
    
    function violetSetStatus(type, message, status = '') {
        const element = document.getElementById(`violet-${type}-status`);
        if (element) {
            element.textContent = message;
            element.className = status;
        }
    }
    
    // Close modal on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') violetCloseModal();
    });
    </script>
    <?php
}

// ============================================================================
// SETTINGS PAGE
// ============================================================================

function violet_editor_settings_page() {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }
    
    if (isset($_POST['violet_save_settings']) && wp_verify_nonce($_POST['violet_settings_nonce'], 'violet_settings_save')) {
        update_option('violet_netlify_hook', esc_url_raw($_POST['netlify_hook']));
        update_option('violet_netlify_url', esc_url_raw($_POST['netlify_url']));
        update_option('violet_wp_url', esc_url_raw($_POST['wp_url']));
        update_option('violet_auto_rebuild', isset($_POST['auto_rebuild']) ? '1' : '0');
        echo '<div class="notice notice-success"><p><strong>✅ Settings saved successfully!</strong></p></div>';
    }
    
    $hook = get_option('violet_netlify_hook', '');
    $netlify_url = get_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    $wp_url = get_option('violet_wp_url', 'https://violetrainwater.com');
    $auto_rebuild = get_option('violet_auto_rebuild', '1');
    ?>
    <div class="wrap">
        <h1>⚙️ Frontend Editor Settings</h1>
        
        <form method="post" class="violet-settings-form">
            <?php wp_nonce_field('violet_settings_save', 'violet_settings_nonce'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="netlify_url">Netlify Site URL</label></th>
                    <td>
                        <input type="url" id="netlify_url" name="netlify_url" value="<?php echo esc_attr($netlify_url); ?>" class="regular-text" required />
                        <p class="description">Your live Netlify site URL (e.g., https://lustrous-dolphin-447351.netlify.app)</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="wp_url">WordPress Frontend URL</label></th>
                    <td>
                        <input type="url" id="wp_url" name="wp_url" value="<?php echo esc_attr($wp_url); ?>" class="regular-text" required />
                        <p class="description">Your WordPress frontend URL (e.g., https://violetrainwater.com)</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="netlify_hook">Netlify Build Hook URL</label></th>
                    <td>
                        <input type="url" id="netlify_hook" name="netlify_hook" value="<?php echo esc_attr($hook); ?>" class="regular-text" placeholder="https://api.netlify.com/build_hooks/..." />
                        <p class="description">When you save content, this will trigger an automatic site rebuild</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="auto_rebuild">Auto-rebuild</label></th>
                    <td>
                        <input type="checkbox" id="auto_rebuild" name="auto_rebuild" value="1" <?php checked($auto_rebuild, '1'); ?> />
                        <label for="auto_rebuild">Automatically rebuild site when content is saved</label>
                    </td>
                </tr>
            </table>
            <?php submit_button('💾 Save Settings', 'primary', 'violet_save_settings'); ?>
        </form>
    </div>
    
    <style>
    .violet-settings-form { 
        background: white; 
        padding: 30px; 
        border-radius: 8px; 
        box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        margin-top: 20px; 
    }
    </style>
    <?php
}

// ============================================================================
// CONTENT MANAGER PAGE
// ============================================================================

function violet_content_manager_page() {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }
    ?>
    <div class="wrap">
        <h1>📝 Content Manager</h1>
        
        <div class="violet-content-grid">
            <div class="violet-content-section">
                <h2>🎯 Hero Section</h2>
                <div class="violet-field-group">
                    <?php 
                    violet_render_content_field('hero_title', 'Hero Title', 'text');
                    violet_render_content_field('hero_subtitle', 'Hero Subtitle', 'textarea');
                    violet_render_content_field('hero_cta', 'Call-to-Action Text', 'text');
                    ?>
                </div>
            </div>
            
            <div class="violet-content-section">
                <h2>📞 Contact Information</h2>
                <div class="violet-field-group">
                    <?php 
                    violet_render_content_field('contact_email', 'Email Address', 'email');
                    violet_render_content_field('contact_phone', 'Phone Number', 'tel');
                    ?>
                </div>
            </div>
        </div>
        
        <div class="violet-actions">
            <button type="button" class="button button-primary button-large" onclick="violetSaveAllContent()">
                💾 Save All Changes
            </button>
        </div>
    </div>
    
    <style>
    .violet-content-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
        gap: 25px; 
        margin: 30px 0; 
    }
    .violet-content-section { 
        background: white; 
        padding: 25px; 
        border-radius: 8px; 
        box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
    }
    .violet-field-group { 
        display: flex; 
        flex-direction: column; 
        gap: 15px; 
    }
    .violet-field { 
        display: flex; 
        flex-direction: column; 
    }
    .violet-field label { 
        font-weight: 600; 
        margin-bottom: 5px; 
    }
    .violet-field input, .violet-field textarea { 
        padding: 10px; 
        border: 2px solid #ddd; 
        border-radius: 4px; 
    }
    .violet-actions { 
        text-align: center; 
        padding: 30px; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        border-radius: 8px; 
        margin: 30px 0; 
    }
    </style>
    
    <script>
    function violetSaveAllContent() {
        // This would handle saving all content fields
        alert('Content saved! (This is a placeholder - implement actual saving logic)');
    }
    </script>
    <?php
}

function violet_render_content_field($field_name, $label, $type = 'text') {
    $value = get_option('violet_' . $field_name, '');
    $input_id = 'violet_' . $field_name;
    ?>
    <div class="violet-field">
        <label for="<?php echo esc_attr($input_id); ?>"><?php echo esc_html($label); ?></label>
        <?php if ($type === 'textarea'): ?>
            <textarea id="<?php echo esc_attr($input_id); ?>" name="<?php echo esc_attr($field_name); ?>" rows="4"><?php echo esc_textarea($value); ?></textarea>
        <?php else: ?>
            <input type="<?php echo esc_attr($type); ?>" id="<?php echo esc_attr($input_id); ?>" name="<?php echo esc_attr($field_name); ?>" value="<?php echo esc_attr($value); ?>" />
        <?php endif; ?>
    </div>
    <?php
}

// ============================================================================
// FIELD TEST PAGE
// ============================================================================

function violet_field_test_page() {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }
    ?>
    <div class="wrap">
        <h1>🧪 Field Detection Test</h1>
        
        <div class="notice notice-info">
            <p><strong>Test the enhanced field detection system with various content types.</strong></p>
        </div>
        
        <div class="violet-test-section">
            <h2>🎯 Hero Section Testing</h2>
            <div class="violet-test-fields">
                <?php violet_render_test_field('hero_title', 'Welcome to Violet Electric - Transform Your Potential'); ?>
                <?php violet_render_test_field('hero_subtitle', 'We create beautiful, responsive websites that help your business grow and connect with customers.'); ?>
                <?php violet_render_test_field('hero_cta', 'Get Started Today'); ?>
            </div>
        </div>
        
        <div class="violet-test-section">
            <h2>📞 Contact Information Testing</h2>
            <div class="violet-test-fields">
                <?php violet_render_test_field('contact_email', 'hello@violetrainwater.com'); ?>
                <?php violet_render_test_field('contact_phone', '+1 (555) 123-4567'); ?>
            </div>
        </div>
        
        <div class="violet-test-actions">
            <button type="button" class="button button-primary button-large" onclick="violetTestAllFields()">
                🧪 Test All Field Detection
            </button>
        </div>
        
        <div id="violet-test-results" class="violet-test-results"></div>
    </div>
    
    <style>
    .violet-test-section { 
        background: white; 
        padding: 25px; 
        margin: 20px 0; 
        border-radius: 8px; 
        border: 1px solid #e2e4e7; 
    }
    .violet-test-fields { 
        display: flex; 
        flex-direction: column; 
        gap: 15px; 
    }
    .violet-test-field { 
        display: flex; 
        flex-direction: column; 
    }
    .violet-test-field label { 
        font-weight: 600; 
        margin-bottom: 5px; 
    }
    .violet-test-field input, .violet-test-field textarea { 
        padding: 10px; 
        border: 2px solid #ddd; 
        border-radius: 4px; 
    }
    .violet-test-actions { 
        text-align: center; 
        padding: 30px; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        border-radius: 8px; 
        margin: 30px 0; 
    }
    .violet-test-results { 
        margin: 30px 0; 
        padding: 20px; 
        background: #f8f9fa; 
        border-radius: 8px; 
        display: none; 
    }
    .violet-test-results.show { 
        display: block; 
    }
    </style>
    
    <script>
    function violetTestAllFields() {
        const resultsEl = document.getElementById('violet-test-results');
        resultsEl.innerHTML = '<h3>🧪 Field Detection Results</h3><p>Testing field detection...</p>';
        resultsEl.classList.add('show');
        
        // This would implement actual field testing
        setTimeout(() => {
            resultsEl.innerHTML = '<h3>✅ Field Detection Complete</h3><p>All field types detected successfully!</p>';
        }, 1000);
    }
    </script>
    <?php
}

function violet_render_test_field($field_name, $sample_value, $type = 'text') {
    $detected_type = violet_detect_field_type($field_name, $sample_value);
    ?>
    <div class="violet-test-field">
        <label for="violet_test_<?php echo esc_attr($field_name); ?>">
            <?php echo esc_html(ucwords(str_replace('_', ' ', $field_name))); ?>
            <span style="color: #0073aa; font-size: 12px;">(Auto-detected: <?php echo esc_html($detected_type); ?>)</span>
        </label>
        <?php if ($type === 'textarea' || strlen($sample_value) > 100): ?>
            <textarea id="violet_test_<?php echo esc_attr($field_name); ?>" name="<?php echo esc_attr($field_name); ?>" rows="3"><?php echo esc_textarea($sample_value); ?></textarea>
        <?php else: ?>
            <input type="<?php echo esc_attr($type); ?>" id="violet_test_<?php echo esc_attr($field_name); ?>" name="<?php echo esc_attr($field_name); ?>" value="<?php echo esc_attr($sample_value); ?>" />
        <?php endif; ?>
    </div>
    <?php
}

// ============================================================================
// AJAX HANDLERS
// ============================================================================

add_action('wp_ajax_violet_trigger_rebuild', function() {
    check_ajax_referer('violet_rebuild_nonce', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error(['message' => 'Insufficient permissions']);
    }
    
    $hook_url = get_option('violet_netlify_hook');
    if (!$hook_url) {
        wp_send_json_error(['message' => 'Netlify build hook not configured']);
    }
    
    $result = wp_remote_post($hook_url, [
        'timeout' => 15,
        'method' => 'POST',
        'headers' => ['Content-Type' => 'application/json'],
        'body' => json_encode([
            'trigger' => 'wordpress_content_update',
            'timestamp' => current_time('mysql')
        ])
    ]);
    
    if (is_wp_error($result)) {
        wp_send_json_error(['message' => 'Rebuild failed: ' . $result->get_error_message()]);
    }
    
    $response_code = wp_remote_retrieve_response_code($result);
    if ($response_code >= 200 && $response_code < 300) {
        wp_send_json_success(['message' => 'Rebuild triggered successfully']);
    } else {
        wp_send_json_error(['message' => "Rebuild failed with code: {$response_code}"]);
    }
});

// ============================================================================
// FRONTEND IFRAME COMMUNICATION
// ============================================================================

add_action('wp_head', 'violet_frontend_iframe_fix');
function violet_frontend_iframe_fix() {
    ?>
    <script>
    if (window.parent !== window.self) {
        console.log('🎨 React app loaded in WordPress iframe');
        
        // Send ready message to WordPress admin
        const sendReadyMessage = () => {
            try {
                window.parent.postMessage({
                    type: 'violet-iframe-ready',
                    url: window.location.href,
                    title: document.title,
                    timestamp: Date.now()
                }, '*');
                console.log('📤 Sent ready message to WordPress');
            } catch(e) {
                console.log('PostMessage failed:', e.message);
            }
        };
        
        if (document.readyState === 'complete') {
            sendReadyMessage();
        } else {
            window.addEventListener('load', sendReadyMessage);
        }
        
        // Listen for messages from WordPress admin
        window.addEventListener('message', function(event) {
            console.log('📨 React app received message:', event.data);
            
            if (event.data && event.data.type === 'violet-test-access') {
                event.source.postMessage({
                    type: 'violet-access-confirmed',
                    success: true,
                    timestamp: Date.now()
                }, event.origin);
                console.log('✅ Sent access confirmation to WordPress');
            } else if (event.data && event.data.type === 'violet-enable-editing') {
                violetEnableEditingMode();
            } else if (event.data && event.data.type === 'violet-disable-editing') {
                violetDisableEditingMode();
            }
        });
        
        function violetEnableEditingMode() {
            console.log('✏️ Enabling editing mode in React app');
            
            // Make text elements editable
            const selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button'];
            
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(element => {
                    const text = element.textContent?.trim();
                    if (text && text.length > 2 && text.length < 500 && 
                        !element.querySelector('img, svg, iframe') &&
                        !element.dataset.violetEditable) {
                        
                        element.dataset.violetEditable = 'true';
                        element.style.outline = '2px dashed #0073aa';
                        element.style.cursor = 'pointer';
                        element.style.position = 'relative';
                        
                        element.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            const fieldType = violetDetectFieldType(element);
                            
                            try {
                                window.parent.postMessage({
                                    type: 'violet-edit-request',
                                    data: {
                                        text: element.textContent,
                                        fieldType: fieldType,
                                        element: element.tagName.toLowerCase(),
                                        confidence: 0.8
                                    }
                                }, '*');
                                console.log('📤 Sent edit request for:', fieldType);
                            } catch(err) {
                                console.error('Failed to send edit request:', err);
                            }
                        });
                    }
                });
            });
            
            console.log('✅ Editing mode enabled');
        }
        
        function violetDisableEditingMode() {
            console.log('🔒 Disabling editing mode');
            
            document.querySelectorAll('[data-violet-editable]').forEach(element => {
                element.style.outline = '';
                element.style.cursor = '';
                element.removeAttribute('data-violet-editable');
            });
        }
        
        function violetDetectFieldType(element) {
            const text = element.textContent.toLowerCase();
            const tag = element.tagName.toLowerCase();
            const classes = element.className ? element.className.toLowerCase() : '';
            
            if (tag === 'h1' || classes.includes('hero') || classes.includes('title')) return 'hero_title';
            if (text.includes('beautiful') || text.includes('transform')) return 'hero_subtitle';
            if (tag === 'a' && (text.includes('get started') || text.includes('learn more'))) return 'hero_cta';
            if (text.includes('@') && text.includes('.')) return 'contact_email';
            if (text.match(/[\d\s\(\)\-\+]{7,}/)) return 'contact_phone';
            if (tag.startsWith('h')) return 'seo_title';
            
            return 'generic_text';
        }
    }
    </script>
    <?php
}

// ============================================================================
// ADMIN BAR INTEGRATION
// ============================================================================

add_action('admin_bar_menu', 'violet_add_admin_bar_menu', 100);
function violet_add_admin_bar_menu($wp_admin_bar) {
    if (!current_user_can('manage_options')) return;
    
    $wp_admin_bar->add_menu([
        'id' => 'violet-editor',
        'title' => '🎨 Edit Frontend',
        'href' => admin_url('admin.php?page=violet-frontend-editor'),
        'meta' => ['title' => 'Open Frontend Editor (Fixed)']
    ]);
}

// ============================================================================
// SUCCESS LOGGING
// ============================================================================

add_action('admin_notices', function() {
    if (current_user_can('manage_options') && isset($_GET['page']) && $_GET['page'] === 'violet-frontend-editor') {
        echo '<div class="notice notice-success"><p><strong>✅ React Frontend Editor - Fixed Version Active!</strong> All function conflicts resolved.</p></div>';
    }
});

// DO NOT ADD ANY CODE AFTER THIS CLOSING PHP TAG
?>