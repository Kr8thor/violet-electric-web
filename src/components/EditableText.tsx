
import React from 'react';
import { useContentField } from '@/contexts/ContentContext';
import { cn } from '@/lib/utils';

interface EditableTextProps extends React.AllHTMLAttributes<HTMLElement> {
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
    
    // CRITICAL FIX: Strip HTML tags and editing attributes from stored content
    // Only use clean text content, ignore any HTML markup or editing attributes
    let displayValue = defaultValue;
    
    if (value && value.trim() !== '') {
      // If the stored value contains HTML tags or editing attributes, extract only the text content
      if (value.includes('<') || value.includes('data-violet')) {
        // Create a temporary element to extract text content only
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = value;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        // Use extracted text if it's not empty and different from editing artifacts
        if (textContent && 
            textContent.trim() !== '' && 
            !textContent.includes('data-violet') &&
            !textContent.includes('contenteditable') &&
            textContent !== '🐛 Debug Content') {
          displayValue = textContent.trim();
        }
      } else {
        // Use the stored value if it's clean text
        displayValue = value;
      }
    }
    
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
