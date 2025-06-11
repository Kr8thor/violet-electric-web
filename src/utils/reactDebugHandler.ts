/**
 * React App Debug Handler
 * Add this to your React app to respond to diagnostic messages
 */

// Enhanced debug handler for WordPressCommunication
import { wordPressCommunication } from './WordPressCommunication';

class ReactDebugHandler {
  constructor() {
    this.setupDebugHandlers();
    console.log('🔍 React Debug Handler initialized');
  }

  setupDebugHandlers() {
    // Handle debug content state requests
    wordPressCommunication.onMessage('violet-debug-content-state', (data, event) => {
      console.log('🔍 Debug content state request received');
      
      const debugData = {
        type: 'violet-debug-react-state',
        data: this.gatherDebugData(),
        timestamp: Date.now()
      };
      
      console.log('📤 Sending debug data:', debugData);
      wordPressCommunication.sendToWordPress(debugData);
    });

    // Handle force content refresh
    wordPressCommunication.onMessage('violet-force-content-refresh', (data, event) => {
      console.log('🔄 Force content refresh requested');
      
      // Trigger content refresh
      window.dispatchEvent(new CustomEvent('violet-refresh-content'));
      
      // Also reload page after short delay
      setTimeout(() => {
        console.log('🔄 Reloading page for content refresh...');
        window.location.reload();
      }, 1000);
    });

    // Handle general debug requests
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'violet-debug-content-state') {
        this.handleDebugRequest(event);
      }
    });
  }

  gatherDebugData() {
    const debugData = {
      // Check EditableText components
      editableElements: this.getEditableTextData(),
      
      // Check localStorage
      localStorage: this.getLocalStorageData(),
      
      // Check global violet variables
      globalVioletKeys: this.getGlobalVioletKeys(),
      
      // Check content provider state
      contentProviderState: this.getContentProviderState(),
      
      // General app state
      appState: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      }
    };

    return debugData;
  }

  getEditableTextData() {
    const elements = document.querySelectorAll('[data-violet-field]');
    return Array.from(elements).map(el => ({
      field: el.getAttribute('data-violet-field'),
      value: el.getAttribute('data-violet-value'),
      originalContent: el.getAttribute('data-original-content'),
      textContent: el.textContent?.trim(),
      className: el.className,
      tagName: el.tagName,
      isEditable: el.contentEditable === 'true'
    }));
  }

  getLocalStorageData() {
    try {
      const stored = localStorage.getItem('violet-content');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          raw: stored,
          parsed: parsed,
          contentKeys: parsed.content ? Object.keys(parsed.content) : [],
          version: parsed.version,
          timestamp: parsed.timestamp
        };
      }
      return { empty: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  getGlobalVioletKeys() {
    return Object.keys(window).filter(key => 
      key.toLowerCase().includes('violet') || 
      key.toLowerCase().includes('content')
    );
  }

  getContentProviderState() {
    // Try to access React context or global state
    const state = {
      violetRefreshContent: typeof window.violetRefreshContent === 'function',
      reactDevTools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
      react: !!window.React
    };

    // Check if we can access any content provider data
    try {
      // This might not work due to React's encapsulation, but worth trying
      if (window.__VIOLET_CONTENT_PROVIDER_STATE__) {
        state.providerState = window.__VIOLET_CONTENT_PROVIDER_STATE__;
      }
    } catch (error) {
      state.providerAccessError = error.message;
    }

    return state;
  }

  handleDebugRequest(event) {
    console.log('🔍 Handling debug request from WordPress admin');
    
    const debugData = this.gatherDebugData();
    
    // Send response back to WordPress
    window.parent.postMessage({
      type: 'violet-debug-react-response',
      data: debugData,
      timestamp: Date.now()
    }, '*');

    // Also log locally for debugging
    console.log('🔍 Debug data collected:', debugData);
  }
}

// Initialize debug handler
const reactDebugHandler = new ReactDebugHandler();

// Export for global access
if (typeof window !== 'undefined') {
  window.violetDebugHandler = reactDebugHandler;
}

export default reactDebugHandler;
