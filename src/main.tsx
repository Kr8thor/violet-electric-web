import './utils/messageInterceptor' // Load message interceptor first
import './utils/directSave' // Load direct save handler
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/autoInitDebug'
import { initializeWordPressPersistence } from './utils/contentPersistenceFix'
import { initializeWordPressSync } from './utils/wordpressContentSync'
import { initializeContentWithFallback } from './utils/enhancedContentSync'
import './utils/contentPersistenceTest' // Load test utilities

// Initialize content with fallback support (ensures content is always available)
initializeContentWithFallback();
console.log('🚀 Enhanced content initialization started');

// Initialize WordPress sync to fetch content on startup
initializeWordPressSync();
console.log('🔄 WordPress content sync initialized');

// Initialize WordPress persistence handler early
initializeWordPressPersistence();
console.log('🎯 WordPress persistence handler initialized in main.tsx');

// Log current state
console.log('📦 Current localStorage:', localStorage.getItem('violet-content'));

createRoot(document.getElementById("root")!).render(<App />);
