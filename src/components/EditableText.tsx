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
 * 🎯 FIXED EDITABLE TEXT COMPONENT
 * 
 * FIXES APPLIED:
 * ✅ Text direction forced to LTR
 * ✅ Proper WordPress communication 
 * ✅ Enhanced visual feedback
 * ✅ Real-time content persistence
 * ✅ No content reversion issues
 */
export const EditableText = React.forwardRef<HTMLElement, EditableTextProps>(
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
        console.log(`📝 EditableText[${field}]:`, {
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
          
          // Force text direction to LTR
          editRef.current.style.direction = 'ltr';
          editRef.current.style.textAlign = 'left';
          editRef.current.style.unicodeBidi = 'normal';
          
          // Select all text
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(editRef.current);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 10);
    };

    // Handle save with enhanced WordPress communication
    const handleSave = () => {
      if (tempValue !== displayValue) {
        updateField(field, tempValue);
        console.log(`✅ Field updated: ${field} = "${tempValue}"`);
        
        // Enhanced WordPress communication
        if (window.parent !== window.self) {
          try {
            // Send content change to WordPress
            window.parent.postMessage({
              type: 'violet-content-changed',
              field: field,
              value: tempValue,
              timestamp: Date.now(),
              source: 'EditableText'
            }, '*');
            
            console.log(`📡 Sent content change to WordPress: ${field}`);
          } catch (error) {
            console.error('Failed to send content change to WordPress:', error);
          }
        }
      }
      
      setIsEditing(false);
    };

    // Handle cancel
    const handleCancel = () => {
      setTempValue(displayValue);
      setIsEditing(false);
    };

    // Handle keyboard events with better UX
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

    // Editing mode with enhanced styling and text direction fix
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
            'py-1',
            'shadow-md'
          ),
          contentEditable: true,
          suppressContentEditableWarning: true,
          onKeyDown: handleKeyDown,
          onBlur: handleBlur,
          onInput: (e) => {
            const target = e.target as HTMLElement;
            // Force LTR on every input
            target.style.direction = 'ltr';
            target.style.textAlign = 'left';
            setTempValue(target.textContent || '');
          },
          'data-violet-field': field,
          'data-violet-editing': 'true',
          style: {
            direction: 'ltr',
            textAlign: 'left',
            unicodeBidi: 'normal',
            ...props.style
          },
          ...props
        },
        tempValue
      );
    }

    // View mode with enhanced hover effects
    const viewModeClasses = cn(
      className,
      'violet-runtime-content',
      isInWordPressEditor && [
        'violet-editable',
        'cursor-pointer',
        'hover:bg-blue-50',
        'hover:outline',
        'hover:outline-2',
        'hover:outline-blue-300',
        'hover:outline-dashed',
        'rounded',
        'transition-all',
        'duration-200',
        'relative',
        'group'
      ],
      loading && 'opacity-50',
      error && 'text-red-500'
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
        style: {
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'normal',
          ...props.style
        },
        ...props
      },
      // Add edit indicator in WordPress mode
      isInWordPressEditor && displayValue ? [
        displayValue,
        React.createElement('span', {
          key: 'edit-indicator',
          className: 'absolute -top-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10',
          style: { direction: 'ltr' }
        }, '✏️ Click to edit')
      ] : displayValue
    );
  }
);

EditableText.displayName = 'EditableText';

// Convenience components for common use cases
export const EditableH1: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableText as="h1" {...props} />
);

export const EditableH2: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableText as="h2" {...props} />
);

export const EditableH3: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableText as="h3" {...props} />
);

export const EditableP: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableText as="p" {...props} />
);

export const EditableSpan: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableText as="span" {...props} />
);

export const EditableDiv: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableText as="div" {...props} />
);

// Hook to check if we're in edit mode
export const useIsEditMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('edit_mode') === '1' && urlParams.get('wp_admin') === '1';
};
