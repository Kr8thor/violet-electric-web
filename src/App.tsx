import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApolloProvider } from "@apollo/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { client } from "./lib/graphql-client";

// Keep your existing beautiful pages
import Index from "./pages/Index";
import About from "./pages/About";
import Keynotes from "./pages/Keynotes";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Debug component (remove in production)
// import WordPressBackendStatus from "./components/WordPressBackendStatus";

// WordPress Editor Communication
import WordPressEditor from "./components/WordPressEditor";
import WordPressRichEditor from "./components/WordPressRichEditor";
import { ContentLoader } from "./components/ContentLoader";
import { ContentProvider } from "./contexts/ContentContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ApolloProvider client={client}>
      <ContentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Keep your exact same routing - just WordPress-powered content */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/keynotes" element={<Keynotes />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Content Loader - Loads persisted content on startup */}
          <ContentLoader />

          {/* WordPress Editor Communication - Invisible component */}
          <WordPressEditor />
          
          {/* Rich Text Editor - Enhanced editing capabilities */}
          <WordPressRichEditor />

          {/* Debug status - remove in production */}
          {/* <div className="fixed bottom-4 right-4 z-50">
            <WordPressBackendStatus />
          </div> */}
        </BrowserRouter>
      </ContentProvider>
    </ApolloProvider>
  </QueryClientProvider>
);

export default App;
