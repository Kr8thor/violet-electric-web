// Add this to the end of your functions.php file temporarily to force the correct Netlify URL

// Force correct Netlify URL on every page load (temporary fix)
add_action('init', 'violet_force_correct_netlify_url');
function violet_force_correct_netlify_url() {
    $current_url = get_option('violet_netlify_url', '');
    $correct_url = 'https://lustrous-dolphin-447351.netlify.app';
    
    // Only update if it's different
    if ($current_url !== $correct_url) {
        update_option('violet_netlify_url', $correct_url);
        error_log('Violet: Forced Netlify URL update from "' . $current_url . '" to "' . $correct_url . '"');
    }
}

// Add iframe test button to admin bar (temporary)
add_action('admin_bar_menu', 'violet_add_iframe_test_button', 999);
function violet_add_iframe_test_button($wp_admin_bar) {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    $args = array(
        'id'    => 'violet-test-iframe',
        'title' => '🔍 Test Violet Iframe',
        'href'  => 'https://lustrous-dolphin-447351.netlify.app?test=' . time(),
        'meta'  => array(
            'target' => '_blank',
            'title' => 'Open Netlify site directly to test if it\'s accessible'
        )
    );
    $wp_admin_bar->add_node($args);
}

// Log iframe debugging info
add_action('admin_init', 'violet_log_iframe_debug_info');
function violet_log_iframe_debug_info() {
    if (isset($_GET['page']) && $_GET['page'] === 'violet-frontend-editor') {
        error_log('=== Violet Iframe Debug Info ===');
        error_log('Stored Netlify URL: ' . get_option('violet_netlify_url', 'NOT SET'));
        error_log('Current admin URL: ' . admin_url());
        error_log('Site URL: ' . site_url());
        error_log('User agent: ' . $_SERVER['HTTP_USER_AGENT']);
        error_log('================================');
    }
}