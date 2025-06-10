<?php
/**
 * Violet Frontend Editor - Database Diagnostic
 * Add this temporarily to your theme's functions.php or run via wp-admin
 */

add_action('admin_notices', 'violet_diagnostic_admin_notice');
function violet_diagnostic_admin_notice() {
    // Only show on the Violet editor page
    $screen = get_current_screen();
    if ($screen && $screen->id === 'toplevel_page_violet-frontend-editor') {
        
        // Get all relevant options
        $netlify_url = get_option('violet_netlify_url', 'NOT SET');
        $wp_url = get_option('violet_wp_url', 'NOT SET');
        $netlify_hook = get_option('violet_netlify_hook', 'NOT SET');
        $auto_rebuild = get_option('violet_auto_rebuild', '0');
        
        // Get the hardcoded URL from functions.php
        $hardcoded_url = 'https://lustrous-dolphin-447351.netlify.app';
        
        ?>
        <div class="notice notice-info" style="padding: 20px;">
            <h3>🔍 Violet Editor Diagnostic Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Database Netlify URL:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;"><?php echo esc_html($netlify_url); ?></td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Hardcoded URL:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;"><?php echo esc_html($hardcoded_url); ?></td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>WP URL:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;"><?php echo esc_html($wp_url); ?></td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Current Origin:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;"><?php echo esc_url($_SERVER['HTTP_HOST']); ?></td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Auto Rebuild:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;"><?php echo $auto_rebuild === '1' ? '✅ Enabled' : '❌ Disabled'; ?></td>
                </tr>
            </table>
            
            <h4 style="margin-top: 20px;">🛠️ Quick Actions:</h4>
            <div style="margin: 10px 0;">
                <button class="button button-primary" onclick="violet_force_correct_url()">Force Correct Netlify URL</button>
                <button class="button" onclick="violet_clear_cache()">Clear Browser Cache</button>
                <button class="button" onclick="violet_test_iframe()">Test Iframe Loading</button>
            </div>
            
            <script>
            function violet_force_correct_url() {
                // This will update the option via AJAX
                if (confirm('This will set the Netlify URL to: <?php echo esc_js($hardcoded_url); ?>')) {
                    jQuery.post(ajaxurl, {
                        action: 'violet_force_url_update',
                        nonce: '<?php echo wp_create_nonce('violet_force_url'); ?>'
                    }, function(response) {
                        if (response.success) {
                            alert('URL updated! Refreshing page...');
                            location.reload();
                        }
                    });
                }
            }
            
            function violet_clear_cache() {
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                    });
                }
                localStorage.clear();
                sessionStorage.clear();
                alert('Cache cleared! Refreshing page...');
                location.reload();
            }
            
            function violet_test_iframe() {
                const testUrl = '<?php echo esc_js($hardcoded_url); ?>?test=' + Date.now();
                window.open(testUrl, '_blank');
            }
            </script>
        </div>
        <?php
    }
}

// AJAX handler to force update the URL
add_action('wp_ajax_violet_force_url_update', 'violet_handle_force_url_update');
function violet_handle_force_url_update() {
    check_ajax_referer('violet_force_url', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_die();
    }
    
    update_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
    wp_send_json_success();
}

// Add debug info to the console
add_action('admin_footer', 'violet_debug_console_info');
function violet_debug_console_info() {
    $screen = get_current_screen();
    if ($screen && $screen->id === 'toplevel_page_violet-frontend-editor') {
        ?>
        <script>
        console.log('🔍 Violet Debug Info:');
        console.log('=====================================');
        console.log('PHP Variables:');
        console.log('Netlify URL: <?php echo esc_js(get_option('violet_netlify_url', 'NOT SET')); ?>');
        console.log('Hardcoded URL: https://lustrous-dolphin-447351.netlify.app');
        console.log('Current Page URL:', window.location.href);
        console.log('=====================================');
        </script>
        <?php
    }
}
