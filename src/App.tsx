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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={client}>
        <ContentProvider>
          <ContentLoader />
          <ContentStatus />
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
      </ApolloProvider>
    </QueryClientProvider>
  );
};

export default App;
