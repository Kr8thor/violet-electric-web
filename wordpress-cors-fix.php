<?php
/**
 * 🚨 CRITICAL CORS FIX for WordPress AJAX
 * Add this to functions.php to fix 403 Forbidden on OPTIONS requests
 */

// URGENT: Handle OPTIONS preflight requests for CORS
add_action('init', 'violet_handle_cors_preflight');
function violet_handle_cors_preflight() {
    // Handle OPTIONS request for CORS preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        // Get the origin
        $origin = get_http_origin();
        $allowed_origins = array(
            'https://lustrous-dolphin-447351.netlify.app',
            'https://violetrainwater.com',
            'https://www.violetrainwater.com'
        );
        
        // Check if origin is allowed
        if ($origin && in_array($origin, $allowed_origins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }
        
        // Required CORS headers for preflight
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-WP-Nonce');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400'); // 24 hours
        
        // Return 200 OK for OPTIONS requests
        status_header(200);
        exit();
    }
}

// Enhanced CORS headers for all requests
add_action('send_headers', 'violet_send_cors_headers');
function violet_send_cors_headers() {
    $origin = get_http_origin();
    $allowed_origins = array(
        'https://lustrous-dolphin-447351.netlify.app',
        'https://violetrainwater.com', 
        'https://www.violetrainwater.com'
    );
    
    if ($origin && in_array($origin, $allowed_origins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-WP-Nonce');
    }
}

// Also handle AJAX requests specifically  
// add_action('wp_ajax_violet_save_all_changes', 'violet_cors_ajax_handler', 1);
// add_action('wp_ajax_nopriv_violet_save_all_changes', 'violet_cors_ajax_handler', 1);

// Emergency debug for CORS issues
add_action('init', function() {
    if (isset($_GET['violet_cors_debug'])) {
        error_log('VIOLET CORS DEBUG:');
        error_log('Request Method: ' . $_SERVER['REQUEST_METHOD']);
        error_log('Origin: ' . (get_http_origin() ?: 'None'));
        error_log('User Agent: ' . $_SERVER['HTTP_USER_AGENT']);
        error_log('Referer: ' . ($_SERVER['HTTP_REFERER'] ?? 'None'));
    }
});
?>
