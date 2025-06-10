import React, { useEffect, useState } from 'react';
import { useContent, useEditMode } from '@/contexts/ContentContext';

// Add debug logging to monitor content changes
export const ContentDebugger: React.FC = () => {
  const { content, isLoading, isWordPressConnected, lastSync, getField } = useContent();
  const { isEditing, hasUnsavedChanges } = useEditMode();
  const [messageLog, setMessageLog] = useState<string[]>([]);
  const [gracePeriodActive, setGracePeriodActive] = useState(false);
  const [gracePeriodEnd, setGracePeriodEnd] = useState<number | null>(null);

  useEffect(() => {
    // Log all content changes
    console.log('🔄 ContentDebugger: Content updated', {
      content,
      isLoading,
      isWordPressConnected,
      lastSync,
      isEditing,
      hasUnsavedChanges
    });

    // Check for specific hero_title
    const heroTitle = getField('hero_title', 'Default');
    console.log('📝 Current hero_title:', heroTitle);
  }, [content, isLoading, isWordPressConnected, lastSync, isEditing, hasUnsavedChanges, getField]);

  useEffect(() => {
    // Monitor messages from WordPress
    const handleMessage = (event: MessageEvent) => {
      const msg = `[${new Date().toISOString()}] ${event.data.type || 'Unknown message'}`;
      setMessageLog(prev => [...prev.slice(-9), msg]);

      // Track grace period
      if (event.data.type === 'violet-apply-saved-changes') {
        console.log('💾 ContentDebugger: Save message received', event.data);
        setGracePeriodActive(true);
        const syncDelay = typeof event.data.syncDelay === 'number' ? event.data.syncDelay : 30000;
        const endTime = Date.now() + syncDelay;
        setGracePeriodEnd(endTime);

        // Clear grace period after delay
        setTimeout(() => {
          setGracePeriodActive(false);
          setGracePeriodEnd(null);
        }, syncDelay);
      }
    };

    window.addEventListener('message', handleMessage);

    // Monitor localStorage changes
    const checkLocalStorage = () => {
      const stored = localStorage.getItem('violet-content');
      const state = localStorage.getItem('violet-content-state');
      const graceEnd = localStorage.getItem('violet-content-cache_grace_end');

      if (graceEnd) {
        const remaining = parseInt(graceEnd) - Date.now();
        if (remaining > 0) {
          setGracePeriodActive(true);
          setGracePeriodEnd(parseInt(graceEnd));
        }
      }

      console.log('📦 ContentDebugger: localStorage check', {
        hasContent: !!stored,
        hasState: !!state,
        graceEnd: graceEnd ? new Date(parseInt(graceEnd)).toISOString() : null
      });
    };

    const interval = setInterval(checkLocalStorage, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, []);

  // Calculate grace period remaining
  const graceRemaining = gracePeriodEnd ? Math.max(0, Math.round((gracePeriodEnd - Date.now()) / 1000)) : 0;

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg max-w-md z-[9999]">
      <h3 className="font-bold text-sm mb-2">🔍 Content Debugger</h3>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>WordPress:</span>
          <span className={isWordPressConnected ? 'text-green-400' : 'text-red-400'}>
            {isWordPressConnected ? '✅ Connected' : '❌ Disconnected'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Edit Mode:</span>
          <span className={isEditing ? 'text-yellow-400' : 'text-gray-400'}>
            {isEditing ? '✏️ Active' : '🔒 Inactive'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Unsaved:</span>
          <span className={hasUnsavedChanges ? 'text-orange-400' : 'text-gray-400'}>
            {hasUnsavedChanges ? '⚠️ Yes' : '✅ No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Grace Period:</span>
          <span className={gracePeriodActive ? 'text-yellow-400' : 'text-gray-400'}>
            {gracePeriodActive ? `⏰ ${graceRemaining}s` : '✅ Ready'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Last Sync:</span>
          <span className="text-gray-300">
            {lastSync ? lastSync.toLocaleTimeString() : 'Never'}
          </span>
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="font-semibold">Current Content:</div>
          <div className="text-yellow-300">hero_title: "{getField('hero_title', 'Default')}"</div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="font-semibold">Recent Messages:</div>
          <div className="max-h-20 overflow-y-auto">
            {messageLog.map((msg, i) => (
              <div key={i} className="text-gray-300 truncate">{msg}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Auto-inject in development
if (import.meta.env.DEV || window.location.search.includes('debug=1')) {
  // Wait for React to mount
  setTimeout(() => {
    const debugContainer = document.createElement('div');
    debugContainer.id = 'content-debugger-root';
    document.body.appendChild(debugContainer);
    
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(debugContainer);
      root.render(
        <React.StrictMode>
          <ContentDebugger />
        </React.StrictMode>
      );
    });
  }, 1000);
}

export default ContentDebugger;
