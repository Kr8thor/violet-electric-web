import React, { useEffect } from 'react';
import { getAllContent, hasContent, getAllContentSync, saveContent } from '@/utils/contentStorage';
import { useContent } from '@/contexts/ContentContext';

/**
 * Component that loads persisted content on app startup
 */
export const ContentLoader: React.FC = () => {
  const { updateContent } = useContent();
  
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
    
    // CRITICAL FIX: Fetch fresh content from WordPress on load
    const fetchWordPressContent = async () => {
      try {
        console.log('🔄 Fetching fresh content from WordPress...');
        const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content');
        if (response.ok) {
          const wpContent = await response.json();
          console.log('✅ WordPress content received:', wpContent);
          
          if (wpContent && Object.keys(wpContent).length > 0) {
            // Save to localStorage and update context
            saveContent(wpContent, false); // false = don't merge, replace completely
            updateContent(wpContent);
            console.log('💾 WordPress content saved and applied');
          }
        }
      } catch (error) {
        console.log('⚠️ Could not fetch WordPress content (this is normal if not on WordPress):', error);
      }
    };
    
    // Fetch WordPress content on load
    fetchWordPressContent();

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
  }, [updateContent]);

  return null;
};

// Add default export
export default ContentLoader;
