import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApolloProvider } from "@apollo/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

// CRITICAL FIX: WordPress content sync
import { initializeWordPressSync } from "./utils/wordpressContentSync";
import { saveManager } from "./utils/WordPressSaveManager";

// NEW: WordPress Communication Fix
import { wordPressCommunication, isInWordPressIframe } from "./utils/WordPressCommunication";

// CRITICAL: WordPress Content Provider for dynamic content
import { VioletContentProvider } from "./contexts/VioletRuntimeContent";

const queryClient = new QueryClient();

const App = () => {
  // Check if we're in WordPress edit mode
  const isEditMode = window.location.search.includes('edit_mode=1');
  const isWordPressAdmin = window.location.search.includes('wp_admin=1');
  const inWordPressEditor = isEditMode && isWordPressAdmin;

  // Initialize debug tools in development or edit mode
  useEffect(() => {
    // For Vite, use import.meta.env.DEV instead of process.env.NODE_ENV
    const isDev = import.meta.env?.DEV || false;
    const isDebugMode = window.location.search.includes('debug=1');
    
    if (isDev || isDebugMode || inWordPressEditor) {
      initializeDebugTools();
      console.log('🛠️ Debug tools initialized');
    }
    
    // CRITICAL FIX: Initialize WordPress content sync
    initializeWordPressSync();
    
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
      
      // Set up communication ready notification
      setTimeout(() => {
        console.log('🔄 WordPress Communication ready check...');
        if (isInWordPressIframe()) {
          console.log('✅ WordPress iframe communication established');
        }
      }, 2000);
    }
  }, [inWordPressEditor]);

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
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/keynotes" element={<Keynotes />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
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
