import './utils/messageInterceptor' // Load message interceptor first
import './utils/directSave' // Load direct save handler
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/autoInitDebug'
import { initializeWordPressPersistence } from './utils/contentPersistenceFix'

// Initialize WordPress persistence handler early
initializeWordPressPersistence();
console.log('🎯 WordPress persistence handler initialized in main.tsx');

// Log current state
console.log('📦 Current localStorage:', localStorage.getItem('violet-content'));

createRoot(document.getElementById("root")!).render(<App />);
