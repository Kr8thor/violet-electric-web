// Save Button Component
// A complete UI component for saving content with status feedback

import React from 'react';
import { useVioletContent } from '../contexts/VioletRuntimeContentFixed';

export interface SaveButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  showStatus?: boolean;
  showAutoSave?: boolean;
  triggerRebuild?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function SaveButton({
  variant = 'primary',
  size = 'medium',
  showStatus = true,
  showAutoSave = true,
  triggerRebuild = false,
  className = '',
  children
}: SaveButtonProps) {
  const {
    save,
    saveAndRebuild,
    isSaving,
    isAutoSaving,
    isDirty,
    error,
    lastSaveTime,
    saveCount,
    hasUnsavedChanges,
    clearError
  } = useVioletContent();

  const handleSave = async () => {
    try {
      clearError();
      
      if (triggerRebuild) {
        await saveAndRebuild();
      } else {
        await save();
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const getButtonText = () => {
    if (children) return children;
    
    if (isSaving) {
      return triggerRebuild ? 'Saving & Building...' : 'Saving...';
    }
    
    if (!isDirty && !hasUnsavedChanges) {
      return '✅ Saved';
    }
    
    return triggerRebuild ? 'Save & Rebuild' : 'Save Changes';
  };

  const getButtonClass = () => {
    const baseClasses = 'violet-save-button transition-all duration-200 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // Size classes
    const sizeClasses = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-6 py-3 text-lg'
    };
    
    // Variant classes
    const variantClasses = {
      primary: isDirty || hasUnsavedChanges
        ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
        : 'bg-green-600 text-white cursor-default',
      secondary: isDirty || hasUnsavedChanges
        ? 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500'
        : 'bg-green-600 text-white cursor-default',
      minimal: isDirty || hasUnsavedChanges
        ? 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300 focus:ring-gray-500'
        : 'bg-transparent text-green-600 border border-green-300 cursor-default'
    };
    
    // Disabled state
    const disabledClasses = (isSaving || (!isDirty && !hasUnsavedChanges))
      ? 'opacity-75 cursor-not-allowed'
      : 'cursor-pointer';
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`;
  };

  const formatLastSaveTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="violet-save-button-container">
      <button
        onClick={handleSave}
        disabled={isSaving || (!isDirty && !hasUnsavedChanges)}
        className={getButtonClass()}
        title={
          isDirty || hasUnsavedChanges
            ? 'Click to save your changes'
            : 'No changes to save'
        }
      >
        {isSaving && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {getButtonText()}
      </button>
      
      {showStatus && (
        <div className="violet-save-status mt-2 text-sm">
          {error && (
            <div className="text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          {!error && (isDirty || hasUnsavedChanges) && (
            <div className="text-orange-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Unsaved changes
            </div>
          )}
          
          {!error && !isDirty && !hasUnsavedChanges && lastSaveTime && (
            <div className="text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Last saved: {formatLastSaveTime(lastSaveTime)}
            </div>
          )}
          
          {showAutoSave && isAutoSaving && (
            <div className="text-blue-600 flex items-center">
              <svg className="animate-pulse w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Auto-saving...
            </div>
          )}
          
          {saveCount > 0 && (
            <div className="text-gray-500 text-xs mt-1">
              Save count: {saveCount}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SaveButton;