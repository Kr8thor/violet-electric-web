/**
 * Comprehensive Content Persistence Debugger
 * Inject this into your React app to debug content flow
 */

window.VioletDebugger = (() => {
  const VERSION = '1.0.0';
  
  // Color codes for console
  const colors = {
    success: 'background: #28a745; color: white; padding: 2px 6px; border-radius: 3px;',
    error: 'background: #dc3545; color: white; padding: 2px 6px; border-radius: 3px;',
    warning: 'background: #ffc107; color: black; padding: 2px 6px; border-radius: 3px;',
    info: 'background: #17a2b8; color: white; padding: 2px 6px; border-radius: 3px;',
    debug: 'background: #6c757d; color: white; padding: 2px 6px; border-radius: 3px;'
  };

  const log = (message, type = 'info', data = null) => {
    console.log(`%c[VioletDebugger]`, colors[type], message, data || '');
  };

  // Test utilities
  const tests = {
    // Check if content is loading from WordPress
    checkWordPressContent: async () => {
      log('Testing WordPress API...', 'info');
      try {
        const response = await fetch('/wp-json/violet/v1/content');
        const data = await response.json();
        
        if (response.ok) {
          log(`✅ WordPress API working! Found ${Object.keys(data).length} fields`, 'success', data);
          return data;
        } else {
          log(`❌ WordPress API error: ${response.status}`, 'error');
          return null;
        }
      } catch (error) {
        log(`❌ WordPress API failed: ${error.message}`, 'error');
        return null;
      }
    },

    // Check localStorage content
    checkLocalStorage: () => {
      log('Checking localStorage...', 'info');
      
      const violetContent = localStorage.getItem('violet-content');
      if (violetContent) {
        try {
          const parsed = JSON.parse(violetContent);
          const content = parsed.content || parsed;
          log(`✅ Found content in localStorage (${Object.keys(content).length} fields)`, 'success', content);
          return content;
        } catch (e) {
          log('❌ Failed to parse localStorage content', 'error', e);
          return null;
        }
      } else {
        log('⚠️ No content in localStorage', 'warning');
        return null;
      }
    },

    // Check what React components are displaying
    checkComponentValues: () => {
      log('Analyzing React components...', 'info');
      
      const components = document.querySelectorAll('[data-violet-field]');
      const values = {};
      
      components.forEach(comp => {
        const field = comp.dataset.violetField;
        const value = comp.textContent || comp.innerText;
        values[field] = value;
      });
      
      log(`Found ${components.length} EditableText components`, 'success', values);
      return values;
    },

    // Compare all three sources
    compareContentSources: async () => {
      log('🔍 Comparing content sources...', 'info');
      
      const wordpress = await tests.checkWordPressContent();
      const localStorage = tests.checkLocalStorage();
      const components = tests.checkComponentValues();
      
      const comparison = {
        wordpress: wordpress || {},
        localStorage: localStorage || {},
        components: components || {}
      };
      
      // Find discrepancies
      const allFields = new Set([
        ...Object.keys(comparison.wordpress),
        ...Object.keys(comparison.localStorage),
        ...Object.keys(comparison.components)
      ]);
      
      const discrepancies = [];
      allFields.forEach(field => {
        const wp = comparison.wordpress[field] || '';
        const ls = comparison.localStorage[field] || '';
        const comp = comparison.components[field] || '';
        
        if (wp !== ls || ls !== comp) {
          discrepancies.push({
            field,
            wordpress: wp,
            localStorage: ls,
            component: comp,
            synced: wp === ls && ls === comp
          });
        }
      });
      
      if (discrepancies.length > 0) {
        log(`⚠️ Found ${discrepancies.length} discrepancies`, 'warning', discrepancies);
      } else {
        log('✅ All content sources are in sync!', 'success');
      }
      
      return comparison;
    },

    // Simulate a WordPress save
    simulateSave: (fieldName = 'hero_title', value = 'TEST: ' + new Date().toLocaleTimeString()) => {
      log(`Simulating WordPress save: ${fieldName} = "${value}"`, 'info');
      
      const changes = [{
        field_name: fieldName,
        field_value: value
      }];
      
      // Send postMessage (if in iframe)
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'violet-apply-saved-changes',
          savedChanges: changes,
          timestamp: Date.now()
        }, '*');
        log('📤 Sent save message to parent', 'success');
      }
      
      // Dispatch custom event
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          type: 'violet-apply-saved-changes',
          savedChanges: changes,
          timestamp: Date.now()
        },
        origin: window.location.origin
      }));
      
      log('📤 Dispatched save event', 'success');
    },

    // Force content refresh
    forceRefresh: () => {
      log('Forcing content refresh...', 'info');
      
      // Try multiple refresh methods
      window.dispatchEvent(new CustomEvent('violet-content-updated'));
      window.dispatchEvent(new CustomEvent('violet-refresh-content'));
      
      // If ContentContext exists, try to use it
      if (window.__VIOLET_CONTENT_CONTEXT__) {
        window.__VIOLET_CONTENT_CONTEXT__.refreshContent();
        log('✅ Called ContentContext.refreshContent()', 'success');
      }
      
      // Force React re-render if possible
      const root = document.querySelector('#root');
      if (root && root._reactRootContainer) {
        log('🔄 Attempting React force update...', 'info');
      }
    },

    // Monitor content changes
    startMonitoring: () => {
      log('👁️ Starting content monitoring...', 'info');
      
      // Monitor localStorage changes
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        if (key === 'violet-content') {
          log('💾 localStorage updated', 'debug', { key, value: value.substring(0, 100) + '...' });
        }
        originalSetItem.apply(this, arguments);
      };
      
      // Monitor custom events
      const events = [
        'violet-content-updated',
        'violet-content-synced',
        'violet-wordpress-save-complete',
        'violet-wordpress-changes-applied'
      ];
      
      events.forEach(eventName => {
        window.addEventListener(eventName, (e) => {
          log(`📢 Event: ${eventName}`, 'debug', e.detail);
        });
      });
      
      // Monitor postMessages
      window.addEventListener('message', (e) => {
        if (e.data && e.data.type && e.data.type.includes('violet')) {
          log(`📨 Message: ${e.data.type}`, 'debug', e.data);
        }
      });
      
      // Monitor DOM changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'characterData' || mutation.type === 'childList') {
            const target = mutation.target;
            if (target.dataset?.violetField) {
              log(`🔄 Component updated: ${target.dataset.violetField}`, 'debug');
            }
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      log('✅ Monitoring started', 'success');
    },

    // Fix common issues
    autoFix: async () => {
      log('🔧 Attempting auto-fix...', 'info');
      
      // 1. Sync WordPress content to localStorage
      const wpContent = await tests.checkWordPressContent();
      if (wpContent && Object.keys(wpContent).length > 0) {
        const storageData = {
          version: 'v1',
          timestamp: Date.now(),
          content: wpContent
        };
        localStorage.setItem('violet-content', JSON.stringify(storageData));
        log('✅ Synced WordPress content to localStorage', 'success');
        
        // 2. Dispatch update event
        window.dispatchEvent(new CustomEvent('violet-content-updated', { detail: wpContent }));
        
        // 3. Force refresh
        tests.forceRefresh();
        
        log('✅ Auto-fix complete - refresh the page to see changes', 'success');
      } else {
        log('❌ No WordPress content found to sync', 'error');
      }
    }
  };

  // Create debug panel
  const createDebugPanel = () => {
    const panel = document.createElement('div');
    panel.id = 'violet-debugger-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 15px;
      z-index: 99999;
      max-width: 400px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      font-family: monospace;
      font-size: 12px;
    `;
    
    panel.innerHTML = `
      <h3 style="margin: 0 0 10px 0;">🔍 Violet Debugger v${VERSION}</h3>
      <div style="display: grid; gap: 5px;">
        <button onclick="VioletDebugger.checkWordPressContent()">Check WordPress API</button>
        <button onclick="VioletDebugger.checkLocalStorage()">Check localStorage</button>
        <button onclick="VioletDebugger.checkComponentValues()">Check Components</button>
        <button onclick="VioletDebugger.compareContentSources()">Compare All Sources</button>
        <button onclick="VioletDebugger.simulateSave()">Simulate Save</button>
        <button onclick="VioletDebugger.forceRefresh()">Force Refresh</button>
        <button onclick="VioletDebugger.autoFix()">Auto-Fix Issues</button>
        <button onclick="VioletDebugger.startMonitoring()">Start Monitoring</button>
        <button onclick="document.getElementById('violet-debugger-panel').remove()">Close</button>
      </div>
      <div id="violet-debug-output" style="margin-top: 10px; max-height: 200px; overflow-y: auto;"></div>
    `;
    
    document.body.appendChild(panel);
    
    // Style buttons
    panel.querySelectorAll('button').forEach(btn => {
      btn.style.cssText = `
        background: #007bff;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      `;
      btn.onmouseover = () => btn.style.background = '#0056b3';
      btn.onmouseout = () => btn.style.background = '#007bff';
    });
  };

  // Public API
  return {
    version: VERSION,
    ...tests,
    showPanel: createDebugPanel,
    hidePanel: () => {
      const panel = document.getElementById('violet-debugger-panel');
      if (panel) panel.remove();
    },
    help: () => {
      console.log(`
🔍 Violet Debugger Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VioletDebugger.checkWordPressContent()  - Test WordPress API
VioletDebugger.checkLocalStorage()      - Check localStorage content
VioletDebugger.checkComponentValues()   - Get current component values
VioletDebugger.compareContentSources()  - Compare all content sources
VioletDebugger.simulateSave(field, value) - Simulate a WordPress save
VioletDebugger.forceRefresh()          - Force content refresh
VioletDebugger.autoFix()               - Attempt to fix sync issues
VioletDebugger.startMonitoring()       - Monitor all content changes
VioletDebugger.showPanel()             - Show debug panel
VioletDebugger.hidePanel()             - Hide debug panel

Example usage:
VioletDebugger.simulateSave('hero_title', 'New Title');
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    }
  };
})();

// Auto-initialize
console.log('%c🔍 Violet Debugger loaded! Type VioletDebugger.help() for commands', 
  'background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');

// Show panel if in debug mode
if (window.location.search.includes('debug=1')) {
  setTimeout(() => VioletDebugger.showPanel(), 1000);
}

// Export for use
export default window.VioletDebugger;