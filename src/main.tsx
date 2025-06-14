import './utils/messageInterceptor' // Load message interceptor first
import './utils/directSave' // Load direct save handler
import './utils/WordPressCommunication' // Initialize WordPress communication
import './utils/communicationTest' // Test WordPress communication (Phase 1)
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/autoInitDebug'
import { initializeWordPressPersistence } from './utils/contentPersistenceFix'
import { initializeWordPressSync } from './utils/wordpressContentSync'
import { wordPressCommunication } from './utils/WordPressCommunication'

// Enhanced WordPress Communication Initialization
console.log('🚀 Starting React app with WordPress integration...');

// Check if we're in WordPress editing context
const urlParams = new URLSearchParams(window.location.search);
const isWordPressContext = urlParams.has('edit_mode') && urlParams.has('wp_admin');

if (isWordPressContext) {
  console.log('🎯 WordPress editing context detected');
  console.log('📡 WordPress communication initialized');
  
  // Additional ready signals for WordPress admin
  const sendEnhancedReadySignal = () => {
    if (window.parent !== window.self) {
      // Send multiple ready signals with different formats for compatibility
      window.parent.postMessage({
        type: 'violet-iframe-ready',
        status: 'ready',
        timestamp: Date.now(),
        reactVersion: '18.x',
        capabilities: ['universal-editing', 'rich-text', 'real-time-preview']
      }, '*');
      
      window.parent.postMessage({
        type: 'violet-react-app-ready',
        data: { ready: true, timestamp: Date.now() }
      }, '*');
      
      console.log('📤 Enhanced ready signals sent to WordPress');
    }
  };
  
  // Send ready signals at different intervals
  sendEnhancedReadySignal();
  setTimeout(sendEnhancedReadySignal, 100);
  setTimeout(sendEnhancedReadySignal, 500);
  setTimeout(sendEnhancedReadySignal, 1000);
  setTimeout(sendEnhancedReadySignal, 2000);
}

// Initialize WordPress sync to fetch content on startup
initializeWordPressSync();
console.log('🔄 WordPress content sync initialized');

// Initialize WordPress persistence handler early
initializeWordPressPersistence();
console.log('🎯 WordPress persistence handler initialized in main.tsx');

// Log current state for debugging
console.log('📦 Current localStorage:', localStorage.getItem('violet-content'));
console.log('🌐 URL params:', Object.fromEntries(urlParams.entries()));
console.log('🖼️ In iframe:', window.parent !== window.self);

// Enhanced app initialization
const initApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error('❌ Root element not found');
    return;
  }
  
  console.log('✅ Initializing React root...');
  const root = createRoot(rootElement);
  root.render(<App />);
  
  // Notify WordPress that React app is fully loaded
  if (isWordPressContext) {
    setTimeout(() => {
      wordPressCommunication.sendToWordPress({
        type: 'violet-app-loaded',
        data: {
          timestamp: Date.now(),
          status: 'fully-loaded',
          ready: true
        }
      });
    }, 1000);
  }
};

// Initialize the app
initApp();