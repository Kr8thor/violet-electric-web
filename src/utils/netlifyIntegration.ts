/**
 * Netlify Build Hook Integration
 * Provides functions to trigger Netlify rebuilds when WordPress content changes
 */

interface NetlifyBuildConfig {
  buildHookUrl: string;
  siteName: string;
  maxRetries?: number;
  retryDelay?: number;
}

class NetlifyIntegration {
  private config: NetlifyBuildConfig;

  constructor(config: NetlifyBuildConfig) {
    this.config = {
      maxRetries: 3,
      retryDelay: 2000,
      ...config
    };
  }

  /**
   * Trigger a Netlify build
   */
  async triggerBuild(reason: string = 'WordPress content updated'): Promise<boolean> {
    console.log(`🚀 Triggering Netlify build: ${reason}`);
    
    for (let attempt = 1; attempt <= this.config.maxRetries!; attempt++) {
      try {
        const response = await fetch(this.config.buildHookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trigger: 'wordpress-content-update',
            reason: reason,
            timestamp: new Date().toISOString(),
            attempt: attempt
          })
        });

        if (response.ok) {
          console.log(`✅ Netlify build triggered successfully (attempt ${attempt})`);
          return true;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

      } catch (error) {
        console.error(`❌ Build trigger attempt ${attempt} failed:`, error);
        
        if (attempt < this.config.maxRetries!) {
          console.log(`⏳ Retrying in ${this.config.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }

    console.error(`❌ Failed to trigger build after ${this.config.maxRetries} attempts`);
    return false;
  }

  /**
   * Get build status from Netlify
   */
  async getBuildStatus(): Promise<string> {
    // This would require Netlify API access token
    // For now, return a simple status
    return 'triggered';
  }

  /**
   * Create WordPress integration code
   */
  generateWordPressIntegration(): string {
    return `
<?php
/**
 * WordPress - Netlify Integration
 * Add this to your WordPress functions.php file
 */

// Trigger Netlify rebuild when content is saved
add_action('violet_content_saved', 'trigger_netlify_rebuild');

function trigger_netlify_rebuild($saved_content) {
    $build_hook_url = '${this.config.buildHookUrl}';
    
    $response = wp_remote_post($build_hook_url, array(
        'method' => 'POST',
        'timeout' => 45,
        'redirection' => 5,
        'httpversion' => '1.0',
        'blocking' => true,
        'headers' => array(
            'Content-Type' => 'application/json',
        ),
        'body' => json_encode(array(
            'trigger' => 'wordpress-content-update',
            'reason' => 'Content saved in WordPress',
            'timestamp' => current_time('c'),
            'content_fields' => array_keys($saved_content)
        ))
    ));
    
    if (is_wp_error($response)) {
        error_log('Netlify build trigger failed: ' . $response->get_error_message());
        return false;
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    
    if ($response_code === 200) {
        error_log('Netlify build triggered successfully');
        return true;
    } else {
        error_log('Netlify build trigger failed with code: ' . $response_code);
        return false;
    }
}

// Add admin notice when build is triggered
add_action('admin_notices', function() {
    if (isset($_GET['netlify_build']) && $_GET['netlify_build'] === 'triggered') {
        echo '<div class="notice notice-success is-dismissible">';
        echo '<p><strong>Netlify Build Triggered!</strong> Your changes will be live in 2-5 minutes.</p>';
        echo '</div>';
    }
});

// Add manual trigger button to admin
add_action('admin_bar_menu', function($wp_admin_bar) {
    $wp_admin_bar->add_node(array(
        'id' => 'trigger-netlify-build',
        'title' => 'Rebuild Site',
        'href' => admin_url('admin-post.php?action=trigger_netlify_build'),
        'meta' => array(
            'title' => 'Trigger Netlify rebuild with latest content'
        )
    ));
}, 100);

// Handle manual trigger
add_action('admin_post_trigger_netlify_build', function() {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }
    
    // Get all current content
    $current_content = array();
    // Add your content fields here
    $fields = ['hero_title', 'hero_subtitle', 'hero_cta', 'hero_cta_secondary'];
    
    foreach ($fields as $field) {
        $current_content[$field] = get_option('violet_' . $field, '');
    }
    
    $success = trigger_netlify_rebuild($current_content);
    
    $redirect_url = admin_url('admin.php?page=violet-frontend-editor');
    if ($success) {
        $redirect_url = add_query_arg('netlify_build', 'triggered', $redirect_url);
    } else {
        $redirect_url = add_query_arg('netlify_build', 'failed', $redirect_url);
    }
    
    wp_redirect($redirect_url);
    exit;
});
?>`;
  }

  /**
   * Test the build hook
   */
  async testBuildHook(): Promise<boolean> {
    console.log('🧪 Testing Netlify build hook...');
    return await this.triggerBuild('Test build from integration');
  }
}

// Export for use in Node.js or browser environments
export { NetlifyIntegration };

// For browser/WordPress use
if (typeof window !== 'undefined') {
  (window as any).NetlifyIntegration = NetlifyIntegration;
}

export default NetlifyIntegration;