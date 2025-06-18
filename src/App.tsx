// File: src/App.tsx
// Modified version to load WordPress content on startup

import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider, client } from './lib/apollo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContentProvider } from './contexts/ContentContext';
import { VioletContentProvider } from './contexts/VioletRuntimeContentFixed';
import { wordpressContentFetcher } from './utils/wordpressContentFetcher';
import ContentLoader from './components/ContentLoader';
import ContentStatus from './components/ContentStatus';
import WordPressRichEditor from './components/WordPressRichEditor';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import About from './pages/About';
import './App.css';

const queryClient = new QueryClient();

// Content Provider that integrates WordPress content
function WordPressContentProvider({ children }: { children: React.ReactNode }) {
  const [contentLoaded, setContentLoaded] = useState(false);
  const [contentCount, setContentCount] = useState(0);
  
  useEffect(() => {
    // Set up content loading callback
    wordpressContentFetcher.onContentLoaded((content) => {
      setContentLoaded(true);
      setContentCount(Object.keys(content).length);
      console.log('🌍 WordPress content ready:', Object.keys(content).length, 'fields');
    });
  }, []);

  return (
    <div data-wordpress-content-loaded={contentLoaded} data-content-count={contentCount}>
      {children}
    </div>
  );
}

function App() {
  const [inWordPressEditor, setInWordPressEditor] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Check if we're in WordPress editing context
    const urlParams = new URLSearchParams(window.location.search);
    const isInEditor = urlParams.has('edit_mode') && urlParams.has('wp_admin');
    
    setInWordPressEditor(isInEditor);
    setEditMode(urlParams.get('edit_mode') === '1');

    if (isInEditor) {
      console.log('🎨 WordPress Editor Mode Activated');
      
      // Send ready message to WordPress
      if (window.parent && window.parent !== window) {
        const sendReady = () => {
          window.parent.postMessage({
            type: 'violet-iframe-ready',
            data: {
              url: window.location.href,
              timestamp: Date.now(),
              contentLoaded: true
            }
          }, '*');
        };

        // Send immediately and after delays to ensure WordPress receives it
        sendReady();
        setTimeout(sendReady, 500);
        setTimeout(sendReady, 1500);
      }
    }

    // Listen for content refresh requests from WordPress
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'violet-content-saved') {
        console.log('📝 Content saved, refreshing...');
        // Refresh WordPress content using the new fetcher
        wordpressContentFetcher.refreshContent();
        // Force re-render after short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={client}>
        <ContentProvider>
          <WordPressContentProvider>
            <VioletContentProvider>
              <ContentLoader />
              {!inWordPressEditor && <ContentStatus />}
              {inWordPressEditor && <WordPressRichEditor />}
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  {/* Add other routes as needed */}
                </Routes>
              </BrowserRouter>
            </VioletContentProvider>
          </WordPressContentProvider>
        </ContentProvider>
      </ApolloProvider>
    </QueryClientProvider>
  );
}

export default App;