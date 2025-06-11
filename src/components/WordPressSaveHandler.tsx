/**
 * 🎯 WORDPRESS SAVE INTEGRATION HANDLER
 * This component integrates with the WordPress admin interface
 * to handle save operations and content synchronization
 */

import React, { useEffect, useState, useRef } from 'react';
import { useVioletContent } from '@/contexts/VioletRuntimeContentFixed';
import { contentManager } from '@/utils/contentPersistenceFix';

interface WordPressSaveHandlerProps {
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
}

export const WordPressSaveHandler: React.FC<WordPressSaveHandlerProps> = ({
  onSaveSuccess,
  onSaveError
}) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Check if we're in WordPress editor
  const isInWordPressEditor = window.location.search.includes('edit_mode=1') && 
                              window.location.search.includes('wp_admin=1');

  useEffect(() => {
    if (!isInWordPressEditor) return;

    console.log('🔗 WordPress Save Handler initialized');

    // Handle save requests from WordPress admin
    const handleWordPressMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'violet-save-all-changes') {
        console.log('💾 WordPress requesting save of all changes');
        await handleSaveRequest();
      }
      
      if (event.data?.type === 'violet-prepare-triple-failsafe-save') {
        console.log('🔄 WordPress requesting save preparation');
        await prepareSaveData();
      }
    };

    // Handle save events
    const handleSaveEvent = async (event: CustomEvent) => {
      console.log('💾 Save event triggered:', event.detail);
      await handleSaveRequest();
    };

    // Listen for messages and events
    window.addEventListener('message', handleWordPressMessage);
    window.addEventListener('violet-prepare-save', handleSaveEvent as EventListener);

    // Notify WordPress that the handler is ready
    setTimeout(() => {
      if (window.parent !== window.self) {
        window.parent.postMessage({
          type: 'violet-save-handler-ready',
          timestamp: Date.now()
        }, '*');
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleWordPressMessage);
      window.removeEventListener('violet-prepare-save', handleSaveEvent as EventListener);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isInWordPressEditor]);

  /**
   * Prepare save data for WordPress
   */
  const prepareSaveData = async (): Promise<void> => {
    try {
      const pendingChanges = contentManager.getPendingChanges();
      const changesArray = Array.from(pendingChanges.entries()).map(([field, value]) => ({
        field_name: field,
        field_value: value,
        timestamp: Date.now()
      }));

      console.log('📋 Prepared save data:', changesArray);

      // Send to WordPress
      if (window.parent !== window.self) {
        window.parent.postMessage({
          type: 'violet-save-data-prepared',
          changes: changesArray,
          count: changesArray.length
        }, '*');
      }

    } catch (error) {
      console.error('❌ Failed to prepare save data:', error);
    }
  };

  /**
   * Handle save request
   */
  const handleSaveRequest = async (): Promise<void> => {
    try {
      setSaveStatus('saving');
      
      console.log('💾 Starting save process...');

      // Save to WordPress via content manager
      const success = await contentManager.saveToWordPress();

      if (success) {
        setSaveStatus('success');
        setLastSaveTime(new Date());
        console.log('✅ Save completed successfully');

        // Notify WordPress of successful save
        if (window.parent !== window.self) {
          window.parent.postMessage({
            type: 'violet-save-completed',
            success: true,
            timestamp: Date.now()
          }, '*');
        }

        // Call success callback
        onSaveSuccess?.();

        // Reset status after delay
        saveTimeoutRef.current = setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);

      } else {
        throw new Error('Save operation failed');
      }

    } catch (error) {
      console.error('❌ Save failed:', error);
      setSaveStatus('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Notify WordPress of save failure
      if (window.parent !== window.self) {
        window.parent.postMessage({
          type: 'violet-save-completed',
          success: false,
          error: errorMessage,
          timestamp: Date.now()
        }, '*');
      }

      // Call error callback
      onSaveError?.(errorMessage);

      // Reset status after delay
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 5000);
    }
  };

  /**
   * Force save all current content
   */
  const forceSave = async (): Promise<void> => {
    await handleSaveRequest();
  };

  // Only render in WordPress editor mode
  if (!isInWordPressEditor) {
    return null;
  }

  // Render save status indicator (for debugging)
  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-3 border">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          saveStatus === 'idle' ? 'bg-gray-300' :
          saveStatus === 'saving' ? 'bg-yellow-400 animate-pulse' :
          saveStatus === 'success' ? 'bg-green-400' :
          'bg-red-400'
        }`} />
        
        <span className="text-sm font-medium">
          {saveStatus === 'idle' && 'Ready'}
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'success' && 'Saved!'}
          {saveStatus === 'error' && 'Error'}
        </span>
        
        {lastSaveTime && (
          <span className="text-xs text-gray-500">
            {lastSaveTime.toLocaleTimeString()}
          </span>
        )}
      </div>
      
      {saveStatus === 'error' && (
        <button
          onClick={forceSave}
          className="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Retry Save
        </button>
      )}
    </div>
  );
};

export default WordPressSaveHandler;