import React from 'react';
import { useContentField } from '@/contexts/ContentContext';
import { cn } from '@/lib/utils';

interface EditableTextProps extends React.HTMLAttributes<HTMLElement> {
  field: string;
  defaultValue: string;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

/**
 * Editable text component that uses persisted content from WordPress
 */
export const EditableText = React.forwardRef<HTMLElement, EditableTextProps>(
  ({ field, defaultValue, as: Component = 'span', className, children, ...props }, ref) => {
    const value = useContentField(field, defaultValue);
    
    // CRITICAL FIX: Use saved value if it exists, otherwise use defaultValue
    // The value from useContentField already handles this, but we need to ensure
    // empty strings don't override defaultValue
    const displayValue = value && value.trim() !== '' ? value : defaultValue;
    
    return React.createElement(
      Component,
      {
        ref,
        className: cn(className),
        'data-violet-field': field,
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

export const EditableP: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableText as="p" {...props} />
);

export const EditableButton: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableText as="button" {...props} />
);

export const EditableSpan: React.FC<Omit<EditableTextProps, 'as'>> = (props) => (
  <EditableText as="span" {...props} />
);
