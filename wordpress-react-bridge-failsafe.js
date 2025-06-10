/**
 * WordPress-React Bridge Failsafe
 * 
 * This script ensures WordPress saves are ALWAYS communicated to the React app
 * Add this to your WordPress admin JavaScript
 */

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

  /**
   * Enhanced save function that ensures React gets the update
   */
  window.violetFailsafeSave = function(changes) {
    console.log('💾 BRIDGE: Starting failsafe save', changes);
    
    saveInProgress = true;
    lastSaveData = changes;
    saveAttempts = 0;

    // First, do the normal WordPress save
    performWordPressSave(changes);
  };

  /**
   * Perform WordPress save with enhanced error handling
   */
  function performWordPressSave(changes) {
    const saveUrl = violetConfig?.batchSaveUrl || '/wp-json/violet/v1/content/save-batch';
    const nonce = violetConfig?.nonce || '';

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
        
        // Ensure React gets the update
        notifyReactApp(changes, response);
        
        // Schedule verification
        setTimeout(() => verifyReactUpdate(changes), BRIDGE_CONFIG.forceRefreshDelay);
      },
      error: function(xhr, status, error) {
        console.error('❌ BRIDGE: WordPress save failed', { status, error });
        
        // Retry if needed
        if (saveAttempts < BRIDGE_CONFIG.retryAttempts) {
          saveAttempts++;
          console.log(`🔄 BRIDGE: Retrying save (attempt ${saveAttempts}/${BRIDGE_CONFIG.retryAttempts})`);
          setTimeout(() => performWordPressSave(changes), BRIDGE_CONFIG.retryDelay);
        } else {
          // Even if WordPress save failed, try to update React locally
          notifyReactAppFallback(changes);
        }
      }
    });
  }

  /**
   * Notify React app of the changes
   */
  function notifyReactApp(changes, response) {
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe || !iframe.contentWindow) {
      console.error('❌ BRIDGE: iframe not found');
      return;
    }

    // Send to all possible origins
    BRIDGE_CONFIG.reactOrigins.forEach(origin => {
      try {
        console.log(`📤 BRIDGE: Notifying React at ${origin}`);
        
        // Send the save notification
        iframe.contentWindow.postMessage({
          type: 'violet-apply-saved-changes',
          savedChanges: changes,
          response: response,
          timestamp: Date.now(),
          source: 'wordpress-bridge-failsafe'
        }, origin);

        // Also send a force refresh command
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

  /**
   * Fallback notification when WordPress save fails
   */
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

  /**
   * Verify React received and applied the update
   */
  function verifyReactUpdate(changes) {
    console.log('🔍 BRIDGE: Verifying React update...');
    
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe || !iframe.contentWindow) return;

    // Request current content from React
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

    // If no response in 2 seconds, force refresh
    setTimeout(() => {
      if (saveInProgress) {
        console.log('⚠️ BRIDGE: No verification response, forcing refresh');
        forceReactRefresh();
      }
    }, 2000);
  }

  /**
   * Force React app to refresh
   */
  function forceReactRefresh() {
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) return;

    console.log('🔄 BRIDGE: Forcing React refresh');
    
    // Method 1: Send refresh command
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

    // Method 2: Reload iframe (last resort)
    setTimeout(() => {
      if (saveInProgress) {
        console.log('🔄 BRIDGE: Reloading iframe');
        const currentSrc = iframe.src;
        iframe.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + 't=' + Date.now();
        saveInProgress = false;
      }
    }, 1000);
  }

  /**
   * Listen for responses from React
   */
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

  /**
   * Override the existing save function
   */
  if (window.violetSaveAllChanges) {
    const originalSave = window.violetSaveAllChanges;
    
    window.violetSaveAllChanges = function() {
      console.log('🌉 BRIDGE: Intercepting save function');
      
      // Get pending changes
      const changes = Object.values(window.violetPendingChanges || {});
      
      if (changes.length > 0) {
        // Use our failsafe save
        violetFailsafeSave(changes);
      }
      
      // Call original function
      return originalSave.apply(this, arguments);
    };
  }

  /**
   * Add debug commands
   */
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
