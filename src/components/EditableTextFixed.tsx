import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useVioletContent } from '@/contexts/VioletRuntimeContentFixed';

interface EditableTextProps extends React.HTMLAttributes<HTMLElement> {
  field: string;
  defaultValue?: string;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

/**
 * 🎯 ENHANCED EDITABLE TEXT COMPONENT
 * 
 * Fixed content persistence with:
 * 1. Real-time WordPress content loading
 * 2. No reliance on defaultValue after WordPress loads
 * 3. Immediate visual updates
 * 4. Proper save integration
 */
export const EditableTextFixed = React.forwardRef<HTMLElement, EditableTextProps>(
  ({ field, defaultValue = '', as: Component = 'span', className, children, ...props }, ref) => {
    const { getField, updateField, loading, error } = useVioletContent();
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState('');
    const editRef = useRef<HTMLElement>(null);
    
    // Get the current value from WordPress (never use defaultValue if WordPress has data)
    const wordPressValue = getField(field);
    const displayValue = wordPressValue || defaultValue || children || '';
    
    // Check if we're in WordPress edit mode
    const isInWordPressEditor = window.location.search.includes('edit_mode=1') && 
                                window.location.search.includes('wp_admin=1');

    // Debug logging in development
    useEffect(() => {
      if (import.meta.env?.DEV) {
        console.log(`📝 EditableTextFixed[${field}]:`, {
          wordPressValue,
          defaultValue,
          displayValue,
          loading,
          error,
          isInWordPressEditor,
          source: wordPressValue ? 'WordPress' : 'fallback'
        });
      }
    }, [field, wordPressValue, defaultValue, displayValue, loading, error, isInWordPressEditor]);

    // Handle click to edit (only in WordPress editor mode)
    const handleClick = (event: React.MouseEvent) => {
      if (!isInWordPressEditor) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      setIsEditing(true);
      setTempValue(displayValue);
      
      // Focus after state update
      setTimeout(() => {
        if (editRef.current) {
          editRef.current.focus();
          
          // Select all text
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(editRef.current);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 10);
    };

    // Handle save
    const handleSave = () => {
      if (tempValue !== displayValue) {
        updateField(field, tempValue);
        console.log(`✅ Field updated: ${field} = "${tempValue}"`);
        
        // Notify WordPress of the change
        if (window.parent !== window.self) {
          window.parent.postMessage({
            type: 'violet-content-changed',
            field: field,
            value: tempValue,
            timestamp: Date.now()
          }, '*');
        }
      }
      
      setIsEditing(false);
    };

    // Handle cancel
    const handleCancel = () => {
      setTempValue(displayValue);
      setIsEditing(false);
    };

    // Handle keyboard events
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSave();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        handleCancel();
      }
    };

    // Handle blur (save on lose focus)
    const handleBlur = () => {
      // Small delay to allow clicking save button
      setTimeout(() => {
        if (isEditing) {
          handleSave();
        }
      }, 100);
    };

    // Editing mode
    if (isEditing && isInWordPressEditor) {
      return React.createElement(
        Component,
        {
          ref: editRef,
          className: cn(
            className, 
            'violet-editing-active',
            'outline-none',
            'bg-blue-50',
            'border-2',
            'border-blue-300',
            'rounded',
            'px-2',
            'py-1'
          ),
          contentEditable: true,
          suppressContentEditableWarning: true,
          onKeyDown: handleKeyDown,
          onBlur: handleBlur,
          onInput: (e) => {
            setTempValue((e.target as HTMLElement).textContent || '');
          },
          'data-violet-field': field,
          'data-violet-editing': 'true',
          ...props
        },
        tempValue
      );
    }

    // View mode
    const viewModeClasses = cn(
      className,
      'violet-runtime-content',
      isInWordPressEditor && 'violet-editable cursor-pointer hover:bg-blue-50 hover:outline hover:outline-2 hover:outline-blue-300 hover:outline-dashed rounded transition-all duration-200',
      loading && 'opacity-50'
    );

    return React.createElement(
      Component,
      {
        ref,
        className: viewModeClasses,
        onClick: handleClick,
        'data-violet-field': field,
        'data-violet-value': displayValue,
        'data-content-source': wordPressValue ? 'wordpress' : 'fallback',
        'data-violet-editable': isInWordPressEditor ? 'true' : 'false',
        title: isInWordPressEditor ? `Click to edit ${field}` : undefined,
        ...props
      },
      displayValue
    );
  }
);

EditableTextFixed.displayName = 'EditableTextFixed';

// Convenience components for common use cases
export const EditableH1Fixed: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableTextFixed as="h1" {...props} />
);

export const EditableH2Fixed: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableTextFixed as="h2" {...props} />
);

export const EditableH3Fixed: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableTextFixed as="h3" {...props} />
);

export const EditablePFixed: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableTextFixed as="p" {...props} />
);

export const EditableButtonFixed: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableTextFixed as="button" {...props} />
);

export const EditableSpanFixed: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableTextFixed as="span" {...props} />
);

export const EditableDivFixed: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableTextFixed as="div" {...props} />
);

// Hook to check if we're in edit mode
export const useIsEditMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('edit_mode') === '1' && urlParams.get('wp_admin') === '1';
};