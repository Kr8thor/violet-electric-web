import { useState, useEffect } from 'react';
import { useContentDebug, useWordPressEditMode } from '@/hooks/useWordPressContent';
import { syncWordPressContent, getLastSyncTimestamp } from '@/utils/wordpressContentSync';
import { Button } from '@/components/ui/button';

/**
 * Content Debug Panel
 * Helps diagnose content persistence issues
 */
const ContentDebugPanel = () => {
  const { content, localStorage, isLoading, isWordPressConnected, comparison } = useContentDebug();
  const { isEditMode, isInIframe } = useWordPressEditMode();
  const [isVisible, setIsVisible] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Show debug panel in development or edit mode
  useEffect(() => {
    const isDev = import.meta.env?.DEV || false;
    const hasDebugParam = window.location.search.includes('debug=1');
    
    setIsVisible(isDev || isEditMode || hasDebugParam);
    setLastSyncTime(getLastSyncTimestamp());
  }, [isEditMode]);

  // Update sync time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSyncTime(getLastSyncTimestamp());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setSyncStatus('Syncing...');
    try {
      const success = await syncWordPressContent();
      setSyncStatus(success ? '✅ Sync successful!' : '⚠️ Sync failed (WordPress unavailable?)');
      
      if (success) {
        setLastSyncTime(new Date());
        // Force reload to see changes
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      setSyncStatus('❌ Sync error: ' + error);
    }
    
    // Clear status after 3 seconds
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const handleClearCache = () => {
    if (confirm('Clear all cached content and reload?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-w-md">
      <div className="bg-black/90 text-white p-4 rounded-lg shadow-2xl backdrop-blur-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-sm">🔍 Content Debug Panel</h3>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
        
        {/* Status Information */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>WordPress Connected:</span>
            <span className={isWordPressConnected ? 'text-green-400' : 'text-yellow-400'}>
              {isWordPressConnected ? '✅ Yes' : '⚠️ No'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Edit Mode:</span>
            <span className={isEditMode ? 'text-green-400' : 'text-gray-400'}>
              {isEditMode ? '✅ Active' : '❌ Inactive'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>In iframe:</span>
            <span className={isInIframe ? 'text-green-400' : 'text-gray-400'}>
              {isInIframe ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Content Sync:</span>
            <span className={comparison.inSync ? 'text-green-400' : 'text-yellow-400'}>
              {comparison.inSync ? '✅ Synced' : '⚠️ Out of sync'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Last Sync:</span>
            <span className="text-blue-400">
              {formatTime(lastSyncTime)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Loading:</span>
            <span className={isLoading ? 'text-yellow-400' : 'text-green-400'}>
              {isLoading ? '⏳ Yes' : '✅ No'}
            </span>
          </div>
        </div>

        {/* Content Preview */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs">
            <div className="font-bold mb-1">Content Fields ({comparison.contentKeys.length}):</div>
            <div className="max-h-32 overflow-y-auto bg-black/50 p-2 rounded text-[10px] font-mono">
              {comparison.contentKeys.map(key => (
                <div key={key} className="flex justify-between gap-2">
                  <span className="text-blue-300">{key}:</span>
                  <span className="text-gray-300 truncate max-w-[200px]">
                    "{content[key] || '(empty)'}"
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sync Status */}
        {syncStatus && (
          <div className="mt-2 p-2 bg-blue-900/50 rounded text-xs">
            {syncStatus}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleManualSync}
            className="text-xs py-1 px-2 h-7"
          >
            🔄 Manual Sync
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleClearCache}
            className="text-xs py-1 px-2 h-7"
          >
            🗑️ Clear Cache
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-3 text-[10px] text-gray-400">
          💡 If content isn't updating, try Manual Sync or Clear Cache
        </div>
      </div>
    </div>
  );
};

export default ContentDebugPanel;
