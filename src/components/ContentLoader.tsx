import React, { useEffect } from 'react';
import { getAllContent, hasContent, initializeContent, reloadContentFromWordPress } from '@/utils/contentStorage';

/**
 * Enhanced component that loads persisted content on app startup
 * and handles WordPress save completion
 */
export const ContentLoader: React.FC = () => {
  useEffect(() => {
    // Initialize content system
    const initContent = async () => {
      try {
        console.log('🚀 ContentLoader: Initializing content system...');
        
        // Check existing content
        const contentExists = hasContent();
        const currentContent = getAllContent();
        
        console.log('📦 ContentLoader: Has saved content:', contentExists);
        
        if (contentExists) {
          console.log('📄 ContentLoader: Available content fields:', Object.keys(await currentContent));
        }

        // Initialize the content system (loads from WordPress)
        await initializeContent();
        
        console.log('✅ ContentLoader: Content system initialized');
      } catch (error) {
        console.error('❌ ContentLoader: Initialization failed:', error);
      }
    };

    initContent();

    // Enhanced message handling for WordPress communication
    const handleMessage = (event: MessageEvent) => {
      // Security check for trusted origins
      const trustedOrigins = [
        'https://wp.violetrainwater.com',
        'https://violetrainwater.com'
      ];
      
      if (!trustedOrigins.some(origin => event.origin.includes(origin))) {
        return;
      }

      console.log('📨 ContentLoader: Received WordPress message:', event.data);

      switch (event.data.type) {
        case 'violet-request-content':
          // WordPress is requesting current content
          getAllContent().then(content => {
            event.source?.postMessage({
              type: 'violet-current-content',
              content: content,
              timestamp: Date.now(),
              hasContent: Object.keys(content).length > 0
            }, event.origin as WindowPostMessageOptions);
            
            console.log('📤 ContentLoader: Sent current content to WordPress');
          });
          break;

        case 'violet-save-completed':
          // WordPress has completed a save operation
          console.log('💾 ContentLoader: Save completed, reloading content...');
          
          // Reload content from WordPress after a save
          setTimeout(async () => {
            try {
              await reloadContentFromWordPress();
              console.log('✅ ContentLoader: Content reloaded after save');
              
              // Notify any listeners that content was refreshed
              window.dispatchEvent(new CustomEvent('violet-content-refreshed', {
                detail: { source: 'save-completion', timestamp: Date.now() }
              }));
            } catch (error) {
              console.error('❌ ContentLoader: Failed to reload after save:', error);
            }
          }, 1000); // Delay to ensure WordPress has processed the save
          break;

        case 'violet-content-changed':
          // Individual content field was changed
          console.log('📝 ContentLoader: Content field changed:', event.data.data);
          break;

        case 'violet-refresh-request':
          // WordPress is requesting a content refresh
          console.log('🔄 ContentLoader: Refresh requested by WordPress');
          reloadContentFromWordPress().then(() => {
            event.source?.postMessage({
              type: 'violet-refresh-completed',
              success: true,
              timestamp: Date.now()
            }, event.origin as WindowPostMessageOptions);
          }).catch(error => {
            console.error('❌ ContentLoader: Refresh failed:', error);
            event.source?.postMessage({
              type: 'violet-refresh-completed',
              success: false,
              error: error.message,
              timestamp: Date.now()
            }, event.origin as WindowPostMessageOptions);
          });
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    // Also listen for browser focus events to potentially refresh content
    const handleFocus = () => {
      // Check if content is stale (older than 5 minutes)
      const metadata = localStorage.getItem('violet-content-timestamp');
      if (metadata) {
        const lastUpdate = parseInt(metadata);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        
        if (lastUpdate < fiveMinutesAgo) {
          console.log('🔄 ContentLoader: Content is stale, refreshing...');
          reloadContentFromWordPress().catch(error => {
            console.warn('⚠️ ContentLoader: Background refresh failed:', error);
          });
        }
      }
    };

    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return null;
};

/**
 * Debug component to show content loading status
 */
export const ContentDebugInfo: React.FC = () => {
  const [debugInfo, setDebugInfo] = React.useState<any>(null);

  useEffect(() => {
    const updateDebugInfo = async () => {
      try {
        const content = await getAllContent();
        const metadata = localStorage.getItem('violet-content-timestamp');
        const source = localStorage.getItem('violet-content-source');
        
        setDebugInfo({
          contentFields: Object.keys(content).length,
          hasContent: Object.keys(content).length > 0,
          lastUpdate: metadata ? new Date(parseInt(metadata)).toLocaleTimeString() : 'Never',
          source: source || 'Unknown',
          sampleField: content.hero_title || 'No hero_title'
        });
      } catch (error) {
        setDebugInfo({ error: error.message });
      }
    };

    updateDebugInfo();

    // Update debug info when content changes
    const handleContentUpdate = () => updateDebugInfo();
    window.addEventListener('violet-content-updated', handleContentUpdate);
    
    return () => window.removeEventListener('violet-content-updated', handleContentUpdate);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !debugInfo) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '60px',
      left: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '11px',
      zIndex: 9999,
      maxWidth: '250px',
      fontFamily: 'monospace'
    }}>
      <div><strong>🎨 Violet Content Debug</strong></div>
      <div>Fields: {debugInfo.contentFields}</div>
      <div>Has Content: {debugInfo.hasContent ? '✅' : '❌'}</div>
      <div>Last Update: {debugInfo.lastUpdate}</div>
      <div>Source: {debugInfo.source}</div>
      <div>Sample: {debugInfo.sampleField}</div>
      {debugInfo.error && <div style={{color: 'red'}}>Error: {debugInfo.error}</div>}
    </div>
  );
};
