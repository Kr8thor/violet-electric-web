import './utils/messageInterceptor' // Load message interceptor first
import './utils/directSave' // Load direct save handler
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/autoInitDebug'
import { initializeWordPressSync } from './utils/wordpressContentSync'
import { initializeContentWithFallback } from './utils/enhancedContentSync'
import './utils/contentPersistenceTest' // Load test utilities

// CRITICAL FIX: WordPress Communication initialization
import { wordPressCommunication } from './utils/WordPressCommunication'
import { saveFlowManager } from './utils/saveFlowManager'
import EnhancedPersistence from './utils/enhancedPersistence'
import './utils/reactDebugHandler' // Initialize debug handler

console.log('🚀 Violet Electric Web - Starting with WordPress Integration');

// Check if we're in WordPress editor mode
const urlParams = new URLSearchParams(window.location.search);
const inWordPressEditor = urlParams.has('edit_mode') && urlParams.has('wp_admin');

if (inWordPressEditor) {
  console.log('🎨 WordPress Editor Mode detected - initializing communication');
  
  // ENHANCED: Multiple ready message attempts with retry mechanism
  let communicationAttempts = 0;
  const maxAttempts = 10;
  
  const sendReadyMessage = () => {
    communicationAttempts++;
    console.log(`📡 Sending ready message (attempt ${communicationAttempts}/${maxAttempts})`);
    
    try {
      window.parent.postMessage({
        type: 'violet-iframe-ready',
        data: {
          url: window.location.href,
          timestamp: Date.now(),
          attempt: communicationAttempts,
          reactAppReady: true,
          tripleFailsafeEnabled: true,
          version: '2.0'
        }
      }, '*');
      
      console.log('✅ Ready message sent to WordPress');
    } catch (error) {
      console.error('❌ Failed to send ready message:', error);
    }
    
    // Retry with exponential backoff
    if (communicationAttempts < maxAttempts) {
      const delay = Math.min(1000 * Math.pow(1.5, communicationAttempts), 10000);
      setTimeout(sendReadyMessage, delay);
    }
  };
  
  // Send immediately and on different browser events
  sendReadyMessage();
  
  // Also send on load events
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sendReadyMessage);
  } else {
    setTimeout(sendReadyMessage, 100);
  }
  
  // And after a guaranteed delay
  setTimeout(sendReadyMessage, 2000);
  
  // Add diagnostic ping responder
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'violet-diagnostic-ping') {
      console.log('📨 Diagnostic ping received, sending pong');
      window.parent.postMessage({
        type: 'violet-diagnostic-pong',
        timestamp: Date.now(),
        status: 'alive'
      }, '*');
    }
  });
  
  console.log('📡 Enhanced WordPress communication system active');
}

// Initialize content with fallback support (ensures content is always available)
initializeContentWithFallback();
console.log('🚀 Enhanced content initialization started');

// Initialize WordPress sync to fetch content on startup
initializeWordPressSync();
console.log('🔄 WordPress content sync initialized');

// Log current state
console.log('📦 Current localStorage:', localStorage.getItem('violet-content'));

createRoot(document.getElementById("root")!).render(<App />);
