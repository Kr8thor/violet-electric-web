import React from 'react';
import { useContentField } from '@/hooks/useContentField';
import { cn } from '@/lib/utils';

interface EditableTextProps extends React.HTMLAttributes<HTMLElement> {
  field: string;
  defaultValue: string;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

/**
 * Editable text component that uses persisted content from WordPress
 * FIXED: Removed broken memo that was preventing updates
 */
export const EditableText = React.forwardRef<HTMLElement, EditableTextProps>(
  ({ field, defaultValue, as: Component = 'span', className, children, ...props }, ref) => {
    // This hook will cause re-render when content changes
    const value = useContentField(field, defaultValue);
    
    // Always use the value from the hook - it handles defaultValue fallback
    const displayValue = value;
    
    // Debug log in development
    if (import.meta.env?.DEV && field === 'hero_title') {
      console.log(`EditableText[${field}]: "${displayValue}"`);
    }
    
    return React.createElement(
      Component,
      {
        ref,
        className: cn(className),
        'data-violet-field': field,
        'data-violet-value': displayValue,
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