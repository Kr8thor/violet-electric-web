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
import WordPressEditor from "./components/WordPressEditor";
import WordPressRichEditor from "./components/WordPressRichEditor";
import { ContentLoader } from "./components/ContentLoader";
import { ContentProvider } from "./contexts/ContentContext";
import { ContentStatus } from "./components/ContentStatus";

// CRITICAL FIX: WordPress content sync
import { initializeWordPressSync } from "./utils/wordpressContentSync";
import { saveManager } from "./utils/WordPressSaveManager";

// FAILSAFE INTEGRATION - Triple Layer Protection
import { tripleFailsafe } from "./utils/tripleFailsafeSystem";
import { FailsafeTestComponent } from "./components/FailsafeTestComponent";
import "./utils/wordpressEditorFailsafe";

const queryClient = new QueryClient();

const App = () => {
  // Initialize debug tools in development or edit mode
  useEffect(() => {
    // For Vite, use import.meta.env.DEV instead of process.env.NODE_ENV
    const isDev = import.meta.env?.DEV || false;
    const isDebugMode = window.location.search.includes('debug=1');
    const isEditMode = window.location.search.includes('edit_mode=1');
    
    if (isDev || isDebugMode || isEditMode) {
      initializeDebugTools();
      console.log('🛠️ Debug tools initialized');
    }
    
    // CRITICAL FIX: Initialize WordPress content sync
    initializeWordPressSync();
    
    // Initialize save manager if in edit mode
    if (isEditMode && window.parent !== window) {
      saveManager.init();
      console.log('💾 Save manager initialized for edit mode');
      
      // TRIPLE FAILSAFE: Ensure system is initialized for WordPress editor
      tripleFailsafe.initialize().then(() => {
        console.log('🛡️ Triple Failsafe initialized for WordPress editor');
        
        // Make it globally available
        (window as any).violetTripleFailsafe = {
          system: tripleFailsafe,
          getContent: () => tripleFailsafe.loadContentWithFailover(),
          testSave: async (field: string, value: string) => {
            await tripleFailsafe.saveToAllLayers([{
              field_name: field,
              field_value: value
            }]);
          },
          clearAll: () => tripleFailsafe.clearAll(),
          forceRefresh: () => tripleFailsafe.forceRefresh()
        };
      });
    }
  }, []);

  // FAILSAFE: Listen for WordPress saves and handle with triple redundancy
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Handle WordPress saves with triple failsafe system
      if (event.data.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
        console.log('💾 TRIPLE FAILSAFE: Processing WordPress save in App.tsx');
        
        // Use triple failsafe storage to ensure persistence
        const updates = event.data.savedChanges.map((change: any) => ({
          field_name: change.field_name,
          field_value: change.field_value
        }));
        
        await tripleFailsafe.saveToAllLayers(updates);
        
        // Force a slight delay then reload to ensure all components update
        setTimeout(() => {
          console.log('🔄 TRIPLE FAILSAFE: Forcing content refresh');
          window.location.reload();
        }, 500);
      }
      
      // Handle force refresh requests
      if (event.data.type === 'violet-force-hard-refresh') {
        console.log('🔄 TRIPLE FAILSAFE: Force refresh requested');
        window.location.reload();
      }
      
      // Handle content verification requests
      if (event.data.type === 'violet-request-content-verification') {
        const content = await tripleFailsafe.loadContentWithFailover();
        window.parent.postMessage({
          type: 'violet-content-verification-response',
          content: content,
          timestamp: Date.now()
        }, '*');
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Also add triple failsafe debug utilities
    if (import.meta.env?.DEV || window.location.search.includes('debug=1')) {
      (window as any).violetTripleFailsafe = {
        system: tripleFailsafe,
        getContent: () => tripleFailsafe.loadContentWithFailover(),
        testSave: async (field: string, value: string) => {
          await tripleFailsafe.saveToAllLayers([{
            field_name: field,
            field_value: value
          }]);
        },
        clearAll: () => tripleFailsafe.clearAll(),
        forceRefresh: () => tripleFailsafe.forceRefresh()
      };
      console.log('🛡️ Triple Failsafe debug utilities available at window.violetTripleFailsafe');
    }
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // WordPress Editing Integration
  const isEditMode = window.location.search.includes('edit_mode=1');
  const isRichEditMode = window.location.search.includes('rich_edit=1');
  const isDebugMode = window.location.search.includes('debug=1');
  const showFailsafeTest = isEditMode || isDebugMode || import.meta.env?.DEV;

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={client}>
        <ContentProvider>
          <ContentLoader />
          <ContentStatus />
          {/* Triple Failsafe Test Component */}
          {showFailsafeTest && <FailsafeTestComponent />}
          {/* {!isEditMode && !isRichEditMode && <ContentDebugger />} */}
          <BrowserRouter>
            {/* WordPress Editor Integration */}
            <WordPressEditor />
            {/* {!isEditMode && !isRichEditMode && <WordPressRichEditor />} */}
            
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
      </ApolloProvider>
    </QueryClientProvider>
  );
};

export default App;
