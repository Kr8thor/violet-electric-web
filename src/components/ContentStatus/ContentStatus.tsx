import React from 'react';
import { useEditMode, useWordPressConnection } from '@/contexts/ContentContext';
import { motion, AnimatePresence } from 'framer-motion';

export function ContentStatus() {
  const { isEditing, hasUnsavedChanges } = useEditMode();
  const { isConnected, lastSync } = useWordPressConnection();
  
  // Only show when editing
  if (!isEditing) return null;
  
  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-4 bg-white shadow-xl rounded-lg p-4 z-50 min-w-[250px] border border-gray-200"
        >
          {/* Status Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-800">Edit Mode</span>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges ? (
                <>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-sm text-yellow-700 font-medium">Unsaved</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-700 font-medium">Saved</span>
                </>
              )}
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center justify-between">
              <span>WordPress:</span>
              <span className={isConnected ? 'text-green-600' : 'text-gray-400'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {isConnected && (
              <div className="flex items-center justify-between">
                <span>Last sync:</span>
                <span className="text-gray-500">{formatLastSync(lastSync)}</span>
              </div>
            )}
          </div>
          
          {/* Save Instructions */}
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-gray-200"
            >
              <p className="text-xs text-gray-600">
                Click "Save All Changes" in the WordPress toolbar to save your edits.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}