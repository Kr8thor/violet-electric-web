import { useEffect } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { syncWordPressContent } from '@/utils/wordpressContentSync';

/**
 * ContentLoader Component
 * Ensures WordPress content is loaded and synced on app startup
 */
export const ContentLoader = () => {
  const { refreshContent, forceRefresh } = useContent();

  useEffect(() => {
    console.log('🚀 ContentLoader: Initializing WordPress content sync...');
    
    const initializeContent = async () => {
      try {
        // First, try to sync from WordPress
        const wpSuccess = await syncWordPressContent();
        
        if (wpSuccess) {
          console.log('✅ ContentLoader: WordPress content synced successfully');
          // Refresh context to ensure all components get updated
          await refreshContent();
          forceRefresh();
        } else {
          console.log('ℹ️ ContentLoader: Using cached content (WordPress not available)');
          // Still refresh to ensure components are initialized
          await refreshContent();
        }
      } catch (error) {
        console.error('❌ ContentLoader: Error during initialization:', error);
      }
    };

    // Initialize immediately
    initializeContent();

    // Set up message listener for WordPress saves
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'violet-apply-saved-changes') {
        console.log('💾 ContentLoader: Detected WordPress save, refreshing...');
        // Small delay to ensure WordPress has saved
        setTimeout(() => {
          syncWordPressContent().then(() => {
            refreshContent();
            forceRefresh();
          });
        }, 100);
      }
    };

    window.addEventListener('message', handleMessage);

    // Listen for custom events
    const handleContentPersisted = () => {
      console.log('📦 ContentLoader: Content persisted, forcing refresh');
      forceRefresh();
    };

    window.addEventListener('violet-content-persisted', handleContentPersisted);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('violet-content-persisted', handleContentPersisted);
    };
  }, [refreshContent, forceRefresh]);

  // This component doesn't render anything
  return null;
};

// Export a function to manually trigger content refresh
export const refreshWordPressContent = async () => {
  console.log('🔄 Manual content refresh triggered');
  const success = await syncWordPressContent();
  
  if (success) {
    // Dispatch event to trigger context refresh
    window.dispatchEvent(new CustomEvent('violet-content-synced', {
      detail: { source: 'manual', timestamp: Date.now() }
    }));
  }
  
  return success;
};
