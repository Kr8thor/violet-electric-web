import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApolloProvider } from "@apollo/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { client } from "./lib/graphql-client";
import { useEffect } from "react";

// Keep your existing beautiful pages
import Index from "./pages/Index";
import About from "./pages/About";
import Keynotes from "./pages/Keynotes";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Debug component (remove in production)
// import WordPressBackendStatus from "./components/WordPressBackendStatus";
import ContentDebugPanel from "./components/ContentDebugPanel";
import { ContentTestComponent } from "./components/ContentTestComponent";
import ContentDebugger from "./components/ContentDebugger";
import initializeDebugTools from "./utils/debugTools";

// WordPress Editor Communication
import WordPressRichEditor from "./components/WordPressRichEditor";
import { ContentLoader } from "./components/ContentLoader";
import { ContentProvider } from "./contexts/ContentContext";
import { ContentStatus } from "./components/ContentStatus";

// NEW: Rich Text WordPress Integration
import RichTextWordPressIntegration, { useRichTextIntegration } from "./components/RichTextWordPressIntegration";

// CRITICAL FIX: WordPress content sync
import { initializeWordPressSync } from "./utils/wordpressContentSync";
import { saveManager } from "./utils/WordPressSaveManager";

// NEW: WordPress Communication Fix
import { wordPressCommunication, isInWordPressIframe } from "./utils/WordPressCommunication";

// CRITICAL: WordPress Content Provider for dynamic content
import { VioletContentProvider } from "./contexts/VioletRuntimeContentFixed";
import WordPressSaveHandler from "./components/WordPressSaveHandler";
import { initializeContentPersistence } from "./utils/contentPersistenceFix";

// NEW: Universal Editing System
import universalEditingHandler from "./utils/UniversalEditingHandler";

const queryClient = new QueryClient();

// --- Add this hook for robust iframe-parent communication ---
function useNotifyParentOnRouteChange() {
  const location = useLocation();
  useEffect(() => {
    if (window.parent !== window.self) {
      window.parent.postMessage(
        {
          type: "violet-iframe-ready",
          url: window.location.href,
          title: document.title,
          timestamp: Date.now(),
        },
        "*"
      );
    }
  }, [location]);
}

const App = () => {
  // Check if we're in WordPress edit mode
  const isEditMode = window.location.search.includes('edit_mode=1');
  const isWordPressAdmin = window.location.search.includes('wp_admin=1');
  const inWordPressEditor = isEditMode && isWordPressAdmin;
  
  // NEW: Use rich text integration hook for proper detection
  const { isRichTextMode, editorPreference } = useRichTextIntegration();
  const richTextEnabled = inWordPressEditor && isRichTextMode;

  // Initialize debug tools in development or edit mode
  useEffect(() => {
    // For Vite, use import.meta.env.DEV instead of process.env.NODE_ENV
    const isDev = import.meta.env?.DEV || false;
    const isDebugMode = window.location.search.includes('debug=1');
    
    if (isDev || isDebugMode || inWordPressEditor) {
      initializeDebugTools();
      console.log('🛠️ Debug tools initialized');
    }
    
    // CRITICAL FIX: Initialize content persistence system
    initializeContentPersistence();
    
    // CRITICAL FIX: Initialize WordPress content sync
    initializeWordPressSync();
    
    // NEW: Initialize Universal Editing System
    if (inWordPressEditor) {
      console.log('🎨 WordPress Universal Editor Mode detected');
      
      // Universal editing handler is automatically initialized
      console.log('✅ Universal editing system ready');
      
      // Set up communication ready notification
      setTimeout(() => {
        console.log('🔄 WordPress Communication ready check...');
        if (isInWordPressIframe()) {
          console.log('✅ WordPress iframe communication established');
          
          // Send ready signal for universal editing
          wordPressCommunication.sendToWordPress({
            type: 'violet-universal-editing-ready',
            data: {
              timestamp: Date.now(),
              editingCapabilities: [
                'text',
                'image', 
                'color',
                'button',
                'link',
                'container'
              ],
              componentsReady: true
            }
          });
        }
      }, 2000);
    }
    
    // WordPress Editor specific initialization
    if (inWordPressEditor) {
      console.log('🎨 WordPress Editor Mode detected - initializing editing capabilities');
      
      // Initialize WordPress communication handlers
      wordPressCommunication.onMessage('violet-test-access', (data, event) => {
        console.log('📨 Received test access message');
        wordPressCommunication.confirmAccessReady();
      });
      
      wordPressCommunication.onMessage('violet-enable-editing', (data, event) => {
        console.log('✏️ Editing enabled from WordPress');
        // Trigger editing mode in the app
        document.body.classList.add('wordpress-editing-enabled');
      });
      
      wordPressCommunication.onMessage('violet-disable-editing', (data, event) => {
        console.log('🚫 Editing disabled from WordPress');
        document.body.classList.remove('wordpress-editing-enabled');
        window.dispatchEvent(new CustomEvent('violet-disable-editing'));
      });

      // CRITICAL: Handle save requests from WordPress
      wordPressCommunication.onMessage('violet-prepare-triple-failsafe-save', (data, event) => {
        console.log('💾 WordPress requesting save preparation');
        // Dispatch event for components to prepare for save
        window.dispatchEvent(new CustomEvent('violet-prepare-save', { detail: data }));
      });

      wordPressCommunication.onMessage('violet-apply-saved-changes', (data, event) => {
        console.log('✅ Applying saved changes from WordPress');
        // Dispatch event for components to apply saved changes
        window.dispatchEvent(new CustomEvent('violet-apply-changes', { detail: data }));
      });
    }
    
    // NEW: Rich text content change handler
    if (richTextEnabled) {
      console.log('🎨 Rich text mode enabled - setting up advanced editing');
    }
  }, [inWordPressEditor, richTextEnabled]);
  
  // NEW: Handle rich text content changes
  const handleRichTextContentChange = (field: string, content: string) => {
    console.log('💾 Rich text content changed in App:', field, content);
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('violet-rich-text-changed', {
      detail: { field, content, editorPreference }
    }));
  };

  // --- Use the route change notifier inside the router ---
  const RouterWithNotifier = () => {
    useNotifyParentOnRouteChange();
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/keynotes" element={<Keynotes />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={client}>
        <VioletContentProvider>
          <ContentProvider>
            <ContentLoader />
            {/* NEVER show ContentStatus in WordPress editor mode - all UI should be in WordPress admin */}
            {!inWordPressEditor && <ContentStatus />}
            {/* WordPress Rich Editor - only render when in WordPress edit mode */}
            {inWordPressEditor && <WordPressRichEditor />}
            {/* WordPress Save Handler - handles save operations */}
            {inWordPressEditor && <WordPressSaveHandler />}
            
            {/* NEW: Rich Text WordPress Integration - Advanced modal editing */}
            {richTextEnabled && (
              <RichTextWordPressIntegration
                onContentChange={handleRichTextContentChange}
              />
            )}
            
            {/* Universal Editing Indicator */}
            {inWordPressEditor && (
              <div id="violet-universal-editing-indicator" style={{ display: 'none' }}>
                <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                  ✏️ Universal Editing Mode Active
                  <div className="text-xs mt-1">Click any element to edit</div>
                </div>
              </div>
            )}
            
            <BrowserRouter>
              <RouterWithNotifier />
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </ContentProvider>
        </VioletContentProvider>
      </ApolloProvider>
    </QueryClientProvider>
  );
};

export default App;
