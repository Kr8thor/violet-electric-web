import React from 'react';
import { cn } from '@/lib/utils';
import { useContentFromStorage } from '@/hooks/useContentFromStorage';

interface EditableTextProps extends React.HTMLAttributes<HTMLElement> {
  field: string;
  defaultValue: string;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

/**
 * Editable text component that uses persisted content from WordPress
 * ENHANCED: Now reads from triple failsafe storage for true persistence
 */
export const EditableText = React.forwardRef<HTMLElement, EditableTextProps>(
  ({ field, defaultValue, as: Component = 'span', className, children, ...props }, ref) => {
    // Get content from storage with fallback to defaultValue
    const { get, loading, error } = useContentFromStorage();
    const value = get(field, defaultValue);
    
    // Show loading state briefly
    if (loading) {
      return React.createElement(
        Component,
        {
          ref,
          className: cn(className, 'violet-loading'),
          'data-violet-field': field,
          'data-violet-loading': 'true',
          ...props
        },
        defaultValue || children || 'Loading...'
      );
    }
    
    // Show error state with fallback
    if (error) {
      console.warn(`EditableText error for field "${field}":`, error);
      return React.createElement(
        Component,
        {
          ref,
          className: cn(className, 'violet-error'),
          'data-violet-field': field,
          'data-violet-error': 'true',
          ...props
        },
        defaultValue || children || 'Content unavailable'
      );
    }
    
    // Use stored value or fallback
    const displayValue = value || defaultValue;
    
    // Debug log in development
    if (import.meta.env?.DEV && field === 'hero_title') {
      console.log(`✅ EditableText[${field}]: "${displayValue}" (from storage: ${value ? 'YES' : 'NO'})`);
    }
    
    return React.createElement(
      Component,
      {
        ref,
        className: cn(className, 'violet-dynamic-content'),
        'data-violet-field': field,
        'data-violet-value': displayValue,
        'data-original-content': displayValue,
        ...props
      },
      displayValue || children
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

export const EditableButton: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableText as="button" {...props} />
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