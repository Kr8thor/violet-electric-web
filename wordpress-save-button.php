
<?php
/**
 * WordPress Save Button for Violet Editor
 * Add this to your WordPress admin page
 */

/**
 * Add the save button to WordPress admin toolbar
 */
function violet_add_admin_save_button() {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    ?>
    <div id="violet-admin-toolbar" style="
        position: fixed;
        top: 32px;
        right: 20px;
        z-index: 99999;
        background: #0073aa;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    ">
        <button id="violet-save-changes-btn" onclick="violetSaveAllChanges()" style="
            background: #d63939;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
        ">
            💾 Save All Changes (<span id="violet-change-count">0</span>)
        </button>
        
        <button id="violet-toggle-edit-btn" onclick="violetToggleEditMode()" style="
            background: #00a32a;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
        ">
            ✏️ Toggle Edit Mode
        </button>
    </div>
    
    <script>
    // WordPress save functionality
    let violetPendingChanges = {};
    let violetEditingEnabled = false;
    
    function violetToggleEditMode() {
        violetEditingEnabled = !violetEditingEnabled;
        const iframe = document.getElementById('violet-site-iframe');
        const btn = document.getElementById('violet-toggle-edit-btn');
        
        if (violetEditingEnabled) {
            btn.textContent = '🔒 Disable Edit Mode';
            btn.style.background = '#d63939';
            
            // Send enable message to React
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'violet-enable-editing',
                    timestamp: Date.now()
                }, '*');
            }
            console.log('✅ Edit mode enabled');
        } else {
            btn.textContent = '✏️ Enable Edit Mode';
            btn.style.background = '#00a32a';
            
            // Send disable message to React
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'violet-disable-editing',
                    timestamp: Date.now()
                }, '*');
            }
            console.log('🔒 Edit mode disabled');
        }
    }
    
    function violetSaveAllChanges() {
        console.log('💾 WordPress: Starting save process...', violetPendingChanges);
        
        if (Object.keys(violetPendingChanges).length === 0) {
            alert('No changes to save!');
            return;
        }
        
        // Convert pending changes to the format React expects
        const changesToSave = Object.entries(violetPendingChanges).map(([field_name, field_value]) => ({
            field_name,
            field_value
        }));
        
        console.log('📤 Sending changes to React:', changesToSave);
        
        // Send to React app for persistence
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'violet-apply-saved-changes',
                savedChanges: changesToSave,
                timestamp: Date.now()
            }, '*');
        }
        
        // Also save to WordPress database
        Promise.all(
            changesToSave.map(change => 
                fetch('<?php echo rest_url('violet/v1/content/enhanced'); ?>', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
                    },
                    body: JSON.stringify(change)
                })
            )
        ).then(responses => {
            console.log('✅ WordPress save completed');
            violetPendingChanges = {};
            violetUpdateChangeCount();
            alert('Changes saved successfully!');
        }).catch(error => {
            console.error('❌ WordPress save failed:', error);
            alert('Save failed. Please try again.');
        });
    }
    
    function violetUpdateChangeCount() {
        const count = Object.keys(violetPendingChanges).length;
        const countSpan = document.getElementById('violet-change-count');
        if (countSpan) {
            countSpan.textContent = count;
        }
        
        const saveBtn = document.getElementById('violet-save-changes-btn');
        if (saveBtn) {
            saveBtn.style.opacity = count > 0 ? '1' : '0.6';
            saveBtn.style.cursor = count > 0 ? 'pointer' : 'default';
        }
    }
    
    // Listen for messages from React app
    window.addEventListener('message', function(event) {
        console.log('📨 WordPress received message:', event.data);
        
        if (event.data.type === 'violet-content-changed') {
            const { field, value } = event.data;
            violetPendingChanges[field] = value;
            violetUpdateChangeCount();
            console.log('📝 Content change tracked:', field, '=', value);
        }
        
        if (event.data.type === 'violet-save-confirmation') {
            console.log('✅ React confirmed save:', event.data);
        }
    });
    
    // Initialize
    violetUpdateChangeCount();
    </script>
    <?php
}

// Add to admin pages
add_action('admin_footer', 'violet_add_admin_save_button');
