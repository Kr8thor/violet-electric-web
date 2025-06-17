<?php
/**
 * 🚀 DIRECT NETLIFY REBUILD FIX
 * 
 * INSTRUCTIONS:
 * 1. Open functions.php in your text editor
 * 2. Go to the very end of the file (around line 5900+)
 * 3. Find this line:
 *    add_action('admin_footer', 'violet_manual_deployment_instructions');
 * 4. Comment it out like this:
 *    // add_action('admin_footer', 'violet_manual_deployment_instructions');
 * 5. Save the file
 * 
 * That's it! Your direct Netlify rebuilds will now work.
 */

// ============================================================================
// REPLACEMENT CODE FOR END OF FUNCTIONS.PHP
// ============================================================================

// Replace the last few lines of your functions.php with this:

        }
    });
    </script>
    <?php
}

// Hook it to admin pages - COMMENTED OUT TO ENABLE DIRECT NETLIFY REBUILDS
// add_action('admin_footer', 'violet_manual_deployment_instructions');

?>

// ============================================================================
// ALTERNATIVE: ADD THIS ENHANCED REBUILD BUTTON (OPTIONAL)
// ============================================================================

// If you want enhanced feedback in the WordPress admin, add this function:
function violet_enhanced_rebuild_button() {
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const rebuildBtn = document.getElementById('violet-rebuild-btn');
        if (rebuildBtn) {
            rebuildBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (confirm('🚀 Trigger direct Netlify rebuild?\n\nThis will deploy your saved changes to the live site.')) {
                    // Change button state
                    this.disabled = true;
                    this.innerHTML = '🔄 Building...';
                    this.style.background = '#f39c12';
                    
                    // Get nonce first
                    fetch(ajaxurl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: 'action=violet_get_nonces'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Trigger rebuild
                            return fetch(ajaxurl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                                body: new URLSearchParams({
                                    action: 'violet_trigger_rebuild',
                                    nonce: data.data.rebuild_nonce
                                })
                            });
                        } else {
                            throw new Error('Failed to get security nonce');
                        }
                    })
                    .then(response => response.json())
                    .then(result => {
                        // Reset button
                        rebuildBtn.disabled = false;
                        rebuildBtn.innerHTML = '🚀 Rebuild Site';
                        rebuildBtn.style.background = '#0073aa';
                        
                        if (result.success) {
                            alert('✅ Rebuild triggered successfully!\n\nYour changes will be live in 3-5 minutes.');
                            
                            // Update status
                            const status = document.getElementById('violet-rich-status');
                            if (status) {
                                status.textContent = '🚀 Rebuild in progress...';
                                status.style.color = '#00a32a';
                            }
                        } else {
                            alert('❌ Rebuild failed: ' + (result.data?.message || result.message || 'Unknown error'));
                        }
                    })
                    .catch(error => {
                        // Reset button on error
                        rebuildBtn.disabled = false;
                        rebuildBtn.innerHTML = '🚀 Rebuild Site';
                        rebuildBtn.style.background = '#0073aa';
                        
                        alert('❌ Rebuild error: ' + error.message);
                        console.error('Rebuild error:', error);
                    });
                }
            });
        }
    });
    </script>
    <?php
}

// To enable the enhanced rebuild button, uncomment this line:
// add_action('admin_footer', 'violet_enhanced_rebuild_button');
