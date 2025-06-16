import React from 'react';
import { useContentField } from '@/contexts/ContentContext';
import { cn } from '@/lib/utils';

interface EditableTextProps extends React.AllHTMLAttributes<HTMLElement> {
  field: string;
  defaultValue: string;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  href?: string; // Add support for href when using as="a"
  target?: string; // Add support for target when using as="a"
  rel?: string; // Add support for rel when using as="a"
}

/**
 * Helper function to strip HTML tags from content
 * This prevents saved HTML markup from displaying as text
 */
const stripHtmlTags = (html: string): string => {
  // Create a temporary div to parse the HTML
  if (typeof window !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }
  // Fallback for SSR - basic regex strip
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Editable text component that uses persisted content from WordPress
 */
export const EditableText = React.forwardRef<HTMLElement, EditableTextProps>(
  ({ field, defaultValue, as: Component = 'span', className, children, ...props }, ref) => {
    const value = useContentField(field, defaultValue);
    
    // Use saved value if it exists, otherwise use defaultValue
    let displayValue = value && value.trim() !== '' ? value : defaultValue;
    // Always strip HTML tags from the value before display
    if (displayValue && displayValue.includes('<')) {
      displayValue = stripHtmlTags(displayValue);
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
