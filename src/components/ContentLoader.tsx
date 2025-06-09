import React, { useEffect } from 'react';
import { getAllContent, hasContent, getAllContentSync } from '@/utils/contentStorage';

/**
 * Component that loads persisted content on app startup
 */
export const ContentLoader: React.FC = () => {
  useEffect(() => {
    // Log content status on load
    console.log('🎨 Violet Content Loader initialized');
    
    const contentExists = hasContent();
    console.log('📦 Has saved content:', contentExists);
    
    // Try both methods to get content
    const content = getAllContent();
    const syncContent = getAllContentSync();
    
    console.log('📄 getAllContent result:', content);
    console.log('📄 getAllContentSync result:', syncContent);
    
    if (content && Object.keys(content).length > 0) {
      console.log('📄 Loaded content fields:', Object.keys(content));
      console.log('📄 Hero title from content:', content.hero_title);
    } else {
      console.log('⚠️ No content loaded or content is empty');
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
