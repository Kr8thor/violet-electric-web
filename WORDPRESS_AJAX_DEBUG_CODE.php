// ============================================================================
// 🔍 WORDPRESS AJAX HANDLER DEBUG - Add to functions.php
// ============================================================================

// 1. Verify our AJAX handler is registered
add_action('init', function() {
    error_log('🔍 VIOLET DEBUG: Checking AJAX handler registration...');
    error_log('🔍 wp_ajax_violet_save_all_changes registered: ' . (has_action('wp_ajax_violet_save_all_changes') ? 'YES' : 'NO'));
    error_log('🔍 wp_ajax_nopriv_violet_save_all_changes registered: ' . (has_action('wp_ajax_nopriv_violet_save_all_changes') ? 'YES' : 'NO'));
});

// 2. Debug ALL incoming requests to admin-ajax.php
// add_action('wp_ajax_violet_save_all_changes', 'violet_debug_handler', 1);
// add_action('wp_ajax_nopriv_violet_save_all_changes', 'violet_debug_handler', 1);

function violet_debug_handler() {
    error_log('🎯 VIOLET AJAX HANDLER EXECUTED!');
    error_log('🔍 REQUEST_METHOD: ' . $_SERVER['REQUEST_METHOD']);
    error_log('🔍 POST data: ' . print_r($_POST, true));
    error_log('🔍 Action parameter: ' . ($_POST['action'] ?? 'MISSING'));
    error_log('🔍 Changes parameter: ' . ($_POST['changes'] ?? 'MISSING'));
    error_log('🔍 Current user: ' . wp_get_current_user()->user_login);
    error_log('🔍 User logged in: ' . (is_user_logged_in() ? 'YES' : 'NO'));
    error_log('🔍 User can edit: ' . (current_user_can('edit_posts') ? 'YES' : 'NO'));
    
    // Don't interfere with the actual handler - remove this debug hook
    // remove_action('wp_ajax_violet_save_all_changes', 'violet_debug_handler', 1);
    // remove_action('wp_ajax_nopriv_violet_save_all_changes', 'violet_debug_handler', 1);
}

// 3. Debug ALL admin-ajax.php requests to see what's happening
add_action('init', function() {
    if (defined('DOING_AJAX') && DOING_AJAX) {
        error_log('🔍 AJAX REQUEST DETECTED');
        error_log('🔍 Action: ' . ($_POST['action'] ?? $_GET['action'] ?? 'NO ACTION'));
        error_log('🔍 All POST data: ' . print_r($_POST, true));
    }
});

// 4. Intercept heartbeat to see if that's conflicting
add_filter('heartbeat_received', function($response, $data) {
    error_log('💓 HEARTBEAT INTERCEPTED - this might be conflicting!');
    error_log('💓 Heartbeat data: ' . print_r($data, true));
    return $response;
}, 10, 2);

// 5. Enhanced AJAX handler with more debugging
// add_action('wp_ajax_violet_save_all_changes', 'violet_save_all_changes_handler_debug');
// add_action('wp_ajax_nopriv_violet_save_all_changes', 'violet_save_all_changes_handler_debug');
// function violet_save_all_changes_handler_debug() { /* ... */ }
