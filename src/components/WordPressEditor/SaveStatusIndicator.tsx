// SaveStatusIndicator.tsx - Phase 2 Save Status Display Component
import React, { useState, useEffect } from 'react';

interface SaveStatusIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
  pendingChanges?: number;
  optimisticUpdates?: number;
  onRetry?: () => void;
}

interface StatusConfig {
  icon: string;
  text: string;
  bgColor: string;
  textColor: string;
  autoHide: boolean;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  lastSaved,
  error,
  pendingChanges = 0,
  optimisticUpdates = 0,
  onRetry
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  // Determine if we should show the indicator
  useEffect(() => {
    const hasActivity = status !== 'idle' || pendingChanges > 0 || optimisticUpdates > 0;
    setShouldShow(hasActivity);
  }, [status, pendingChanges, optimisticUpdates]);

  // Handle visibility with animation
  useEffect(() => {
    if (shouldShow) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow for fade out animation
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  // Auto-hide success status after 3 seconds
  useEffect(() => {
    if (status === 'saved') {
      const timer = setTimeout(() => {
        setShouldShow(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Get status configuration
  const getStatusConfig = (): StatusConfig => {
    switch (status) {
      case 'saving':
        return {
          icon: '💾',
          text: 'Saving...',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          autoHide: false
        };
      case 'saved':
        return {
          icon: '✅',
          text: getLastSavedText(),
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          autoHide: true
        };
      case 'error':
        return {
          icon: '❌',
          text: 'Save failed',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          autoHide: false
        };
      default:
        if (pendingChanges > 0 || optimisticUpdates > 0) {
          return {
            icon: '⏳',
            text: `${pendingChanges + optimisticUpdates} unsaved changes`,
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-800',
            autoHide: false
          };
        }
        return {
          icon: '',
          text: '',
          bgColor: '',
          textColor: '',
          autoHide: true
        };
    }
  };

  // Format last saved time
  const getLastSavedText = (): string => {
    if (!lastSaved) return 'Saved';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) {
      return 'Saved just now';
    } else if (diffMinutes < 60) {
      return `Saved ${diffMinutes}m ago`;
    } else {
      return `Saved at ${lastSaved.toLocaleTimeString()}`;
    }
  };

  const config = getStatusConfig();

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 min-w-48 max-w-80
        transition-all duration-300 ease-in-out transform
        ${shouldShow ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
      `}
    >
      <div
        className={`
          ${config.bgColor} ${config.textColor}
          border border-current border-opacity-20
          rounded-lg shadow-lg px-4 py-3
          backdrop-blur-sm
        `}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Main status */}
          <div className="flex items-center gap-2">
            {config.icon && (
              <span className="text-lg" role="img" aria-label="Status">
                {config.icon}
              </span>
            )}
            <span className="font-medium text-sm">
              {config.text}
            </span>
          </div>

          {/* Loading spinner for saving state */}
          {status === 'saving' && (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}

          {/* Error retry button */}
          {status === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className="
                text-xs px-2 py-1 bg-current bg-opacity-10 
                hover:bg-opacity-20 rounded transition-colors
                font-medium
              "
            >
              Retry
            </button>
          )}
        </div>

        {/* Additional info */}
        {(status === 'error' && error) && (
          <div className="mt-2 text-xs opacity-80 border-t border-current border-opacity-10 pt-2">
            {error}
          </div>
        )}

        {/* Breakdown of changes */}
        {(pendingChanges > 0 || optimisticUpdates > 0) && status === 'idle' && (
          <div className="mt-2 text-xs opacity-80 border-t border-current border-opacity-10 pt-2">
            <div className="flex justify-between items-center">
              <span>Changes pending:</span>
              <span className="font-medium">
                {pendingChanges + optimisticUpdates}
              </span>
            </div>
            {optimisticUpdates > 0 && (
              <div className="flex justify-between items-center mt-1">
                <span>• Optimistic updates:</span>
                <span>{optimisticUpdates}</span>
              </div>
            )}
            {pendingChanges > 0 && (
              <div className="flex justify-between items-center mt-1">
                <span>• Pending saves:</span>
                <span>{pendingChanges}</span>
              </div>
            )}
          </div>
        )}

        {/* Progress indicator for multiple changes */}
        {status === 'saving' && (pendingChanges > 1 || optimisticUpdates > 1) && (
          <div className="mt-2 pt-2 border-t border-current border-opacity-10">
            <div className="flex justify-between text-xs opacity-80">
              <span>Processing changes...</span>
              <span>{pendingChanges + optimisticUpdates} remaining</span>
            </div>
            <div className="mt-1 w-full bg-current bg-opacity-10 rounded-full h-1">
              <div
                className="bg-current h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(10, 100 - ((pendingChanges + optimisticUpdates) * 10))}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Warning on page unload with unsaved changes */}
      {(pendingChanges > 0 || optimisticUpdates > 0) && (
        <div className="mt-2 text-xs text-gray-600 bg-white bg-opacity-90 rounded px-2 py-1 text-center">
          ⚠️ Don't close this page - you have unsaved changes
        </div>
      )}
    </div>
  );
};

// Hook to handle page unload warning
export const useUnsavedChangesWarning = (hasUnsavedChanges: boolean) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
};