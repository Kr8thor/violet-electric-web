// ============================================================================
// 🚨 POTENTIAL IMMEDIATE FIX - Add to functions.php
// ============================================================================

// 1. Disable WordPress heartbeat on our editor page to prevent conflicts
add_action('admin_init', function() {
    if (isset($_GET['page']) && ($_GET['page'] === 'violet-universal-editor' || $_GET['page'] === 'violet-rich-text-editor')) {
        wp_deregister_script('heartbeat');
        error_log('🔇 WordPress heartbeat disabled on editor page');
    }
});

// 2. More aggressive AJAX handler registration
add_action('wp_loaded', function() {
    // Re-register our handlers with higher priority
    add_action('wp_ajax_violet_save_all_changes', 'violet_aggressive_save_handler', 1);
    add_action('wp_ajax_nopriv_violet_save_all_changes', 'violet_aggressive_save_handler', 1);
    
    error_log('🔥 Aggressive AJAX handlers registered on wp_loaded');
});

function violet_aggressive_save_handler() {
    error_log('🎯 AGGRESSIVE SAVE HANDLER EXECUTED!');
    error_log('🔍 POST action: ' . ($_POST['action'] ?? 'MISSING'));
    
    // Immediately return success to test if handler is running
    wp_send_json_success([
        'message' => 'AGGRESSIVE HANDLER WORKING!',
        'handler' => 'violet_aggressive_save_handler',
        'timestamp' => current_time('mysql'),
        'post_data' => $_POST
    ]);
}

// 3. Intercept ALL admin-ajax.php requests to debug
add_action('wp_ajax_nopriv_heartbeat', function() {
    error_log('💓 HEARTBEAT REQUEST INTERCEPTED (nopriv)');
    error_log('💓 POST data: ' . print_r($_POST, true));
});

add_action('wp_ajax_heartbeat', function() {
    error_log('💓 HEARTBEAT REQUEST INTERCEPTED (priv)');
    error_log('💓 POST data: ' . print_r($_POST, true));
});

// 4. Early hook to catch the action parameter
add_action('init', function() {
    if (defined('DOING_AJAX') && DOING_AJAX && isset($_POST['action'])) {
        error_log('🔍 AJAX ACTION DETECTED: ' . $_POST['action']);
        
        if ($_POST['action'] === 'violet_save_all_changes') {
            error_log('✅ Our action detected! Handler should run...');
        } else {
            error_log('❌ Different action: ' . $_POST['action']);
        }
    }
});

// 5. Force our handler to run if action matches
add_action('wp_ajax_nopriv_violet_save_all_changes', function() {
    error_log('🚀 NOPRIV HANDLER TRIGGERED');
    wp_send_json_success(['message' => 'NOPRIV handler working']);
});

// 6. Check if actions are being processed
add_action('wp_ajax_violet_save_all_changes', function() {
    error_log('🚀 PRIV HANDLER TRIGGERED');
    wp_send_json_success(['message' => 'PRIV handler working']);
});
