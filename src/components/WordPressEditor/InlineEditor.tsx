// InlineEditor.tsx - Phase 2 Core Inline Editing Component
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface InlineEditorProps {
  initialValue: string;
  fieldType: string;
  confidence: number;
  isMultiline: boolean;
  position: { top: number; left: number; width: number; height: number };
  onSave: (value: string) => void;
  onCancel: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

interface EditingState {
  value: string;
  isSaving: boolean;
  hasChanges: boolean;
}

export const InlineEditor: React.FC<InlineEditorProps> = ({
  initialValue,
  fieldType,
  confidence,
  isMultiline,
  position,
  onSave,
  onCancel,
  onKeyDown
}) => {
  const [state, setState] = useState<EditingState>({
    value: initialValue,
    isSaving: false,
    hasChanges: false
  });

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus and select text on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  // Handle value changes
  const handleValueChange = useCallback((newValue: string) => {
    setState(prev => ({
      ...prev,
      value: newValue,
      hasChanges: newValue !== initialValue
    }));
  }, [initialValue]);

  // Handle save operation
  const handleSave = useCallback(async () => {
    if (!state.hasChanges) {
      onCancel();
      return;
    }

    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      await onSave(state.value);
    } catch (error) {
      console.error('Save failed:', error);
      // Reset to original value on error
      setState(prev => ({
        ...prev,
        value: initialValue,
        hasChanges: false,
        isSaving: false
      }));
      return;
    }

    setState(prev => ({ ...prev, isSaving: false }));
  }, [state.value, state.hasChanges, onSave, onCancel, initialValue]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Custom handler first
    if (onKeyDown) {
      onKeyDown(e);
    }

    // Save on Ctrl+Enter
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
      return;
    }

    // Cancel on Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
      return;
    }

    // For single-line inputs, save on Enter
    if (!isMultiline && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
      return;
    }
  }, [handleSave, onCancel, onKeyDown, isMultiline]);

  // Auto-resize for textareas
  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
    handleValueChange(target.value);
  }, [handleValueChange]);

  // Get priority color based on confidence
  const getPriorityColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'border-red-500 bg-red-50';
    if (confidence >= 0.6) return 'border-yellow-500 bg-yellow-50';
    return 'border-blue-500 bg-blue-50';
  };

  // Position styles
  const positionStyles: React.CSSProperties = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    width: Math.max(position.width, 200), // Minimum width
    zIndex: 10000
  };

  return (
    <div
      ref={containerRef}
      style={positionStyles}
      className="inline-editor-container"
    >
      {/* Field type indicator */}
      <div className="mb-1 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm border">
        <span className="font-medium">{fieldType}</span>
        <span className="ml-2 text-gray-400">
          {Math.round(confidence * 100)}% confidence
        </span>
      </div>

      {/* Input/Textarea */}
      <div className="relative">
        {isMultiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={state.value}
            onChange={(e) => handleValueChange(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className={`
              w-full p-2 border-2 rounded-md resize-none overflow-hidden
              focus:outline-none focus:ring-2 focus:ring-opacity-50
              ${getPriorityColor(confidence)}
              ${state.isSaving ? 'opacity-50 cursor-wait' : ''}
            `}
            style={{
              minHeight: Math.max(position.height, 40),
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit'
            }}
            disabled={state.isSaving}
            placeholder="Enter text..."
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={state.value}
            onChange={(e) => handleValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`
              w-full p-2 border-2 rounded-md
              focus:outline-none focus:ring-2 focus:ring-opacity-50
              ${getPriorityColor(confidence)}
              ${state.isSaving ? 'opacity-50 cursor-wait' : ''}
            `}
            style={{
              height: Math.max(position.height, 40),
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}
            disabled={state.isSaving}
            placeholder="Enter text..."
          />
        )}

        {/* Save/Cancel Controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleSave}
            disabled={!state.hasChanges || state.isSaving}
            className={`
              flex items-center gap-1 px-3 py-1 rounded text-sm font-medium
              transition-colors duration-200
              ${state.hasChanges && !state.isSaving
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {state.isSaving ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <span>✓</span>
                Save
              </>
            )}
          </button>

          <button
            onClick={onCancel}
            disabled={state.isSaving}
            className="
              flex items-center gap-1 px-3 py-1 rounded text-sm font-medium
              bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <span>✕</span>
            Cancel
          </button>

          {/* Keyboard hints */}
          <div className="text-xs text-gray-500 ml-auto">
            <div>Ctrl+Enter: Save</div>
            <div>Escape: Cancel</div>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      {state.hasChanges && !state.isSaving && (
        <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
          <span>⚠️</span>
          Unsaved changes
        </div>
      )}
    </div>
  );
};