import React, { useEffect } from 'react';
import { getAllContent, hasContent } from '@/utils/contentStorage';

/**
 * Component that loads persisted content on app startup
 */
export const ContentLoader: React.FC = () => {
  useEffect(() => {
    // Log content status on load
    const contentExists = hasContent();
    const content = getAllContent();
    
    console.log('🎨 Violet Content Loader initialized');
    console.log('📦 Has saved content:', contentExists);
    
    if (contentExists) {
      console.log('📄 Loaded content fields:', Object.keys(content));
    }

    // Also listen for WordPress editor ready signal
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'violet-request-content') {
        // Send current content back to WordPress
        event.source?.postMessage({
          type: 'violet-current-content',
          content: content,
          timestamp: Date.now()
        }, event.origin as WindowPostMessageOptions);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return null;
};
