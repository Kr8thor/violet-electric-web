<?php
// Add this to your WordPress theme's functions.php file
// This loads the failsafe bridge script in the admin area

add_action('admin_footer', 'violet_load_failsafe_bridge_script');
function violet_load_failsafe_bridge_script() {
    // Only load on the frontend editor page
    $screen = get_current_screen();
    if ($screen && $screen->id === 'toplevel_page_violet-frontend-editor') {
        ?>
        <script>
        // WordPress-React Bridge Failsafe (inline version)
        (function() {
            'use strict';

            console.log('🌉 WordPress-React Bridge Failsafe initializing...');

            // Configuration
            const BRIDGE_CONFIG = {
                reactOrigins: [
                    'https://lustrous-dolphin-447351.netlify.app',
                    'https://violetrainwater.com',
                    'http://localhost:5173',
                    'http://localhost:3000'
                ],
                retryAttempts: 3,
                retryDelay: 1000,
                forceRefreshDelay: 2000,
                debugMode: true
            };

            // Track save state
            let saveInProgress = false;
            let lastSaveData = null;
            let saveAttempts = 0;

            // Enhanced save function
            window.violetFailsafeSave = function(changes) {
                console.log('💾 BRIDGE: Starting failsafe save', changes);
                
                saveInProgress = true;
                lastSaveData = changes;
                saveAttempts = 0;

                performWordPressSave(changes);
            };

            // Perform WordPress save with retries
            function performWordPressSave(changes) {
                const saveUrl = typeof violetConfig !== 'undefined' ? violetConfig.batchSaveUrl : '/wp-json/violet/v1/content/save-batch';
                const nonce = typeof violetConfig !== 'undefined' ? violetConfig.nonce : '';

                console.log('📤 BRIDGE: Sending to WordPress API', saveUrl);

                jQuery.ajax({
                    url: saveUrl,
                    method: 'POST',
                    headers: {
                        'X-WP-Nonce': nonce,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({ changes: changes }),
                    success: function(response) {
                        console.log('✅ BRIDGE: WordPress save successful', response);
                        
                        // Ensure React gets the update with multiple attempts
                        notifyReactApp(changes, response);
                        
                        // Schedule verification
                        setTimeout(() => verifyReactUpdate(changes), BRIDGE_CONFIG.forceRefreshDelay);
                    },
                    error: function(xhr, status, error) {
                        console.error('❌ BRIDGE: WordPress save failed', { status, error });
                        
                        if (saveAttempts < BRIDGE_CONFIG.retryAttempts) {
                            saveAttempts++;
                            console.log(`🔄 BRIDGE: Retrying save (attempt ${saveAttempts}/${BRIDGE_CONFIG.retryAttempts})`);
                            setTimeout(() => performWordPressSave(changes), BRIDGE_CONFIG.retryDelay);
                        } else {
                            notifyReactAppFallback(changes);
                        }
                    }
                });
            }

            // Notify React app with multiple origin attempts
            function notifyReactApp(changes, response) {
                const iframe = document.getElementById('violet-site-iframe');
                if (!iframe || !iframe.contentWindow) {
                    console.error('❌ BRIDGE: iframe not found');
                    return;
                }

                BRIDGE_CONFIG.reactOrigins.forEach(origin => {
                    try {
                        console.log(`📤 BRIDGE: Notifying React at ${origin}`);
                        
                        iframe.contentWindow.postMessage({
                            type: 'violet-apply-saved-changes',
                            savedChanges: changes,
                            response: response,
                            timestamp: Date.now(),
                            source: 'wordpress-bridge-failsafe'
                        }, origin);

                        setTimeout(() => {
                            iframe.contentWindow.postMessage({
                                type: 'violet-force-refresh',
                                reason: 'wordpress-save-complete',
                                timestamp: Date.now()
                            }, origin);
                        }, 100);

                    } catch (e) {
                        console.error(`❌ BRIDGE: Failed to notify ${origin}`, e);
                    }
                });
            }

            // Fallback notification
            function notifyReactAppFallback(changes) {
                console.log('🚨 BRIDGE: Using fallback notification');
                
                const iframe = document.getElementById('violet-site-iframe');
                if (!iframe || !iframe.contentWindow) return;

                BRIDGE_CONFIG.reactOrigins.forEach(origin => {
                    try {
                        iframe.contentWindow.postMessage({
                            type: 'violet-apply-saved-changes-fallback',
                            savedChanges: changes,
                            timestamp: Date.now(),
                            source: 'wordpress-bridge-failsafe-fallback'
                        }, origin);
                    } catch (e) {
                        console.error(`❌ BRIDGE: Fallback notification failed for ${origin}`, e);
                    }
                });
            }

            // Verify React received update
            function verifyReactUpdate(changes) {
                console.log('🔍 BRIDGE: Verifying React update...');
                
                const iframe = document.getElementById('violet-site-iframe');
                if (!iframe || !iframe.contentWindow) return;

                BRIDGE_CONFIG.reactOrigins.forEach(origin => {
                    try {
                        iframe.contentWindow.postMessage({
                            type: 'violet-request-content-verification',
                            expectedChanges: changes,
                            timestamp: Date.now()
                        }, origin);
                    } catch (e) {
                        console.error(`❌ BRIDGE: Verification request failed for ${origin}`, e);
                    }
                });

                setTimeout(() => {
                    if (saveInProgress) {
                        console.log('⚠️ BRIDGE: No verification response, forcing refresh');
                        forceReactRefresh();
                    }
                }, 2000);
            }

            // Force React refresh
            function forceReactRefresh() {
                const iframe = document.getElementById('violet-site-iframe');
                if (!iframe) return;

                console.log('🔄 BRIDGE: Forcing React refresh');
                
                BRIDGE_CONFIG.reactOrigins.forEach(origin => {
                    try {
                        iframe.contentWindow.postMessage({
                            type: 'violet-force-hard-refresh',
                            timestamp: Date.now()
                        }, origin);
                    } catch (e) {
                        console.error(`❌ BRIDGE: Force refresh failed for ${origin}`, e);
                    }
                });

                setTimeout(() => {
                    if (saveInProgress) {
                        console.log('🔄 BRIDGE: Reloading iframe');
                        const currentSrc = iframe.src;
                        iframe.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + 't=' + Date.now();
                        saveInProgress = false;
                    }
                }, 1000);
            }

            // Listen for responses
            window.addEventListener('message', function(event) {
                if (!BRIDGE_CONFIG.reactOrigins.includes(event.origin)) return;

                if (event.data.type === 'violet-content-verification-response') {
                    console.log('✅ BRIDGE: React verified content update');
                    saveInProgress = false;
                }

                if (event.data.type === 'violet-refresh-complete') {
                    console.log('✅ BRIDGE: React refresh complete');
                    saveInProgress = false;
                }
            });

            // Override existing save function
            if (window.violetSaveAllChanges) {
                const originalSave = window.violetSaveAllChanges;
                
                window.violetSaveAllChanges = function() {
                    console.log('🌉 BRIDGE: Intercepting save function');
                    
                    const changes = Object.values(window.violetPendingChanges || {});
                    
                    if (changes.length > 0) {
                        violetFailsafeSave(changes);
                    }
                    
                    return originalSave.apply(this, arguments);
                };
            }

            // Debug commands
            window.violetBridge = {
                testSave: function(fieldName, value) {
                    violetFailsafeSave([{
                        field_name: fieldName || 'hero_title',
                        field_value: value || 'Test from Bridge ' + Date.now()
                    }]);
                },
                
                forceRefresh: forceReactRefresh,
                
                getStatus: function() {
                    return {
                        saveInProgress,
                        lastSaveData,
                        saveAttempts,
                        config: BRIDGE_CONFIG
                    };
                }
            };

            console.log('✅ WordPress-React Bridge Failsafe ready!');
            console.log('💡 Test with: violetBridge.testSave("hero_title", "Your text")');

        })();
        </script>
        <?php
    }
}

// Also ensure the main editor page loads with correct parameters
add_filter('violet_editor_iframe_src', 'violet_add_failsafe_params');
function violet_add_failsafe_params($src) {
    // Add timestamp to prevent caching
    $separator = strpos($src, '?') !== false ? '&' : '?';
    return $src . $separator . 'failsafe=1&t=' . time();
}
