# WordPress Admin JavaScript Enhancement
## Instructions for adding the enhanced admin interface code

### WHERE TO ADD THE CODE:
1. **Go to WordPress Admin**
   - URL: https://wp.violetrainwater.com/wp-admin/
   - Login: Leocorbett / %4dlz7pcV8Sz@WCN

2. **Navigate to Theme Editor**
   - WordPress Admin → Appearance → Theme Editor → functions.php
   
3. **Find the location** 
   - Look for line around 2500+ (near the end of the file)
   - Find this section: `// END OF CORS AND SAVE FIX`
   - Add the new code AFTER this section

### ENHANCED ADMIN JAVASCRIPT CODE TO ADD:

```php
// Enhanced WordPress Admin Interface - Add this after line 2500+
add_action('admin_head', 'violet_enhanced_admin_scripts');
function violet_enhanced_admin_scripts() {
    // Only load on Universal Editor pages
    $screen = get_current_screen();
    if (!$screen || strpos($screen->id, 'violet-universal-editor') === false) {
        return;
    }
    ?>
    <script>
    // === Enhanced WordPress Admin Interface ===
    (function() {
      // Global variables for nonces and state
      let violetNonces = {};
      let violetPendingChanges = {};

      // Initialize nonces on page load
      async function initializeNonces() {
        try {
          const response = await fetch(ajaxurl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=violet_get_nonces'
          });

          const result = await response.json();
          if (result.success) {
            violetNonces = result.data;
            console.log('✅ Nonces initialized:', Object.keys(violetNonces));
          } else {
            console.error('❌ Failed to get nonces:', result);
          }
        } catch (error) {
          console.error('❌ Error initializing nonces:', error);
        }
      }

      // Enhanced rebuild function with proper error handling
      async function triggerRebuild() {
        const rebuildBtn = document.getElementById('violet-rebuild-btn');
        const status = document.getElementById('violet-rich-status');
        
        if (!rebuildBtn || !status) return;

        // Check if we have a rebuild nonce
        if (!violetNonces.rebuild_nonce) {
          await initializeNonces();
          if (!violetNonces.rebuild_nonce) {
            status.textContent = '❌ Security token missing';
            return;
          }
        }

        // Update UI
        rebuildBtn.disabled = true;
        rebuildBtn.textContent = '🔄 Rebuilding...';
        status.textContent = '🚀 Triggering rebuild...';

        try {
          const response = await fetch(ajaxurl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              action: 'violet_trigger_rebuild',
              nonce: violetNonces.rebuild_nonce
            })
          });

          const result = await response.json();

          if (result.success) {
            status.textContent = '✅ ' + result.data.message;
            rebuildBtn.textContent = '🎉 Rebuild Triggered!';
            
            // Show additional info if available
            if (result.data.build_url) {
              console.log('🔗 Monitor build at:', result.data.build_url);
              setTimeout(() => {
                status.innerHTML = `✅ Rebuild triggered! <a href="${result.data.build_url}" target="_blank">Monitor progress →</a>`;
              }, 1000);
            }

            // Reset button after delay
            setTimeout(() => {
              rebuildBtn.textContent = '🚀 Rebuild Site';
              rebuildBtn.disabled = false;
              status.textContent = 'Ready for changes';
            }, 5000);

          } else {
            status.textContent = '❌ ' + result.data.message;
            rebuildBtn.textContent = '❌ Rebuild Failed';
            console.error('Rebuild failed:', result.data);

            // Reset button after delay
            setTimeout(() => {
              rebuildBtn.textContent = '🚀 Rebuild Site';
              rebuildBtn.disabled = false;
            }, 3000);
          }

        } catch (error) {
          console.error('❌ Rebuild request failed:', error);
          status.textContent = '❌ Network error during rebuild';
          rebuildBtn.textContent = '❌ Network Error';

          // Reset button after delay
          setTimeout(() => {
            rebuildBtn.textContent = '🚀 Rebuild Site';
            rebuildBtn.disabled = false;
          }, 3000);
        }
      }

      // Enhanced save function with rebuild option
      async function saveChangesWithRebuild(triggerRebuild = false) {
        const saveBtn = document.getElementById('violet-save-rich-changes');
        const status = document.getElementById('violet-rich-status');
        
        if (!saveBtn || !status) return;

        // Check if we have changes to save
        if (Object.keys(violetPendingChanges).length === 0) {
          status.textContent = '📝 No changes to save';
          return;
        }

        // Check for save nonce
        if (!violetNonces.save_nonce) {
          await initializeNonces();
          if (!violetNonces.save_nonce) {
            status.textContent = '❌ Security token missing';
            return;
          }
        }

        // Update UI
        saveBtn.disabled = true;
        saveBtn.textContent = triggerRebuild ? '🚀 Saving & Rebuilding...' : '💾 Saving...';
        status.textContent = 'Saving changes...';

        try {
          // Prepare changes array
          const changesArray = Object.values(violetPendingChanges);
          
          // Choose the appropriate action
          const action = triggerRebuild ? 'violet_save_and_rebuild' : 'violet_batch_save_fallback';

          const response = await fetch(ajaxurl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              action: action,
              nonce: violetNonces.save_nonce,
              changes: JSON.stringify(changesArray)
            })
          });

          const result = await response.json();

          if (result.success) {
            status.textContent = '✅ ' + result.data.message;
            saveBtn.textContent = triggerRebuild ? '🎉 Saved & Rebuilding!' : '✅ Changes Saved!';
            
            // Clear pending changes
            violetPendingChanges = {};
            
            // Notify React app that content was saved
            const iframe = document.getElementById('violet-rich-text-iframe');
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage({
                type: 'violet-content-saved',
                success: true,
                data: result.data
              }, '*');
            }

            // Reset button after delay
            setTimeout(() => {
              saveBtn.textContent = '💾 Save Changes';
              saveBtn.disabled = false;
              status.textContent = 'Ready for changes';
            }, 3000);

          } else {
            status.textContent = '❌ ' + result.data.message;
            saveBtn.textContent = '❌ Save Failed';
            console.error('Save failed:', result.data);

            // Reset button after delay
            setTimeout(() => {
              saveBtn.textContent = '💾 Save Changes';
              saveBtn.disabled = false;
            }, 3000);
          }

        } catch (error) {
          console.error('❌ Save request failed:', error);
          status.textContent = '❌ Network error during save';
          saveBtn.textContent = '❌ Network Error';

          // Reset button after delay
          setTimeout(() => {
            saveBtn.textContent = '💾 Save Changes';
            saveBtn.disabled = false;
          }, 3000);
        }
      }

      // Listen for messages from React app
      window.addEventListener('message', function(event) {
        const { type, ...data } = event.data || {};
        if (!type || !type.startsWith('violet-')) return;

        switch (type) {
          case 'violet-content-changed':
            // Store changes
            if (data.field && data.value) {
              violetPendingChanges[data.field] = {
                field_name: data.field,
                field_value: data.value
              };
              
              // Update UI
              const status = document.getElementById('violet-rich-status');
              if (status) {
                status.textContent = `Changes pending (${Object.keys(violetPendingChanges).length} fields)`;
              }
            }
            break;

          case 'violet-trigger-rebuild':
            triggerRebuild();
            break;

          case 'violet-save-content':
            saveChangesWithRebuild(false);
            break;

          case 'violet-save-and-rebuild':
            saveChangesWithRebuild(true);
            break;
        }
      });

      // Initialize everything when DOM is ready
      document.addEventListener('DOMContentLoaded', function() {
        // Initialize nonces
        initializeNonces();

        // Bind rebuild button
        const rebuildBtn = document.getElementById('violet-rebuild-btn');
        if (rebuildBtn) {
          rebuildBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Trigger a site rebuild on Netlify? This will publish all saved changes.')) {
              triggerRebuild();
            }
          });
        }

        // Bind save button
        const saveBtn = document.getElementById('violet-save-rich-changes');
        if (saveBtn) {
          saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveChangesWithRebuild(false);
          });
        }

        // Add save & rebuild button if not exists
        const toolbar = document.getElementById('violet-rich-text-toolbar');
        if (toolbar && !document.getElementById('violet-save-and-rebuild-btn')) {
          const saveAndRebuildBtn = document.createElement('button');
          saveAndRebuildBtn.id = 'violet-save-and-rebuild-btn';
          saveAndRebuildBtn.className = 'button';
          saveAndRebuildBtn.innerHTML = '💾🚀 Save & Rebuild';
          saveAndRebuildBtn.style.cssText = 'background: #ff6b35 !important; border-color: #ff6b35 !important; color: white !important; font-weight: 700; padding: 12px 24px; border-radius: 8px; margin-left: 8px;';
          
          saveAndRebuildBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Save all changes and trigger a site rebuild?')) {
              saveChangesWithRebuild(true);
            }
          });
          
          toolbar.appendChild(saveAndRebuildBtn);
        }

        console.log('🎯 WordPress admin interface initialized');
      });

    })();
    </script>
    <?php
}

// Add AJAX handlers for the enhanced interface
add_action('wp_ajax_violet_get_nonces', 'violet_provide_nonces');
function violet_provide_nonces() {
    wp_send_json_success(array(
        'save_nonce' => wp_create_nonce('violet_save_nonce'),
        'rebuild_nonce' => wp_create_nonce('violet_rebuild_nonce')
    ));
}

add_action('wp_ajax_violet_save_and_rebuild', 'violet_save_and_rebuild_handler');
function violet_save_and_rebuild_handler() {
    // First save the changes
    violet_ajax_batch_save_fallback();
    
    // Then trigger rebuild
    violet_trigger_rebuild_ajax();
}

function violet_trigger_rebuild_ajax() {
    check_ajax_referer('violet_rebuild_nonce', 'nonce');
    
    if (!current_user_can('manage_options') && !current_user_can('edit_posts')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
    }
    
    $hook_url = get_option('violet_netlify_hook');
    
    if (!$hook_url) {
        wp_send_json_error(array('message' => 'Netlify build hook not configured'));
    }
    
    $result = wp_remote_post($hook_url, array(
        'timeout' => 15,
        'method' => 'POST',
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode(array(
            'trigger' => 'wordpress_content_update',
            'timestamp' => current_time('mysql')
        ))
    ));
    
    if (is_wp_error($result)) {
        wp_send_json_error(array('message' => 'Rebuild failed: ' . $result->get_error_message()));
    }
    
    $response_code = wp_remote_retrieve_response_code($result);
    
    if ($response_code >= 200 && $response_code < 300) {
        wp_send_json_success(array(
            'message' => 'Site rebuild triggered successfully!',
            'build_url' => 'https://app.netlify.com/sites/lustrous-dolphin-447351/deploys'
        ));
    } else {
        wp_send_json_error(array('message' => "Rebuild failed with code: {$response_code}"));
    }
}
```

### AFTER ADDING THE CODE:

1. **Click "Update File"** in WordPress
2. **Test the enhanced interface:**
   - Go to Universal Editor
   - Test the save button
   - Test the rebuild button
   - Check browser console for enhanced features

### EXPECTED IMPROVEMENTS:
- ✅ Proper error handling for rebuild button
- ✅ Enhanced save functionality
- ✅ Better user feedback
- ✅ Content persistence fixes
- ✅ Improved nonce handling

### TROUBLESHOOTING:
If you see any PHP errors:
1. Check the syntax carefully
2. Ensure the code is placed in the correct location
3. Make sure all PHP tags are properly closed
4. Check WordPress error logs if needed