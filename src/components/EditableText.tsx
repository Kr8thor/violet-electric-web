import React from 'react';
import { cn } from '@/lib/utils';
import { useVioletContent } from '@/contexts/WordPressContentProvider';

interface EditableTextProps extends React.HTMLAttributes<HTMLElement> {
  field: string;
  defaultValue?: string;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

/**
 * 🎯 FIXED: Editable text component that prioritizes WordPress runtime content
 * 
 * Loading hierarchy (runtime wins):
 * 1. WordPress API content (authoritative, freshest)  
 * 2. localStorage cache (fast, offline, survives reload)
 * 3. Static fallback (only so page never 404s if WP unreachable)
 */
export const EditableText = React.forwardRef<HTMLElement, EditableTextProps>(
  ({ field, defaultValue = '', as: Component = 'span', className, children, ...props }, ref) => {
    const { content, loading, error } = useVioletContent();
    
    // Get the runtime content (WordPress API or cached)
    const runtimeValue = content[field as keyof typeof content];
    
    // 🏆 Runtime content always wins over defaultValue
    const displayValue = runtimeValue || defaultValue || children;
    
    // Debug logging in development
    if (import.meta.env?.DEV) {
      console.log(`📝 EditableText[${field}]:`, {
        runtimeValue,
        defaultValue,
        displayValue,
        loading,
        error,
        source: runtimeValue ? 'WordPress/Cache' : 'Static fallback'
      });
    }
    
    // Show loading state briefly
    if (loading) {
      return React.createElement(
        Component,
        {
          ref,
          className: cn(className, 'violet-loading animate-pulse'),
          'data-violet-field': field,
          'data-violet-loading': 'true',
          ...props
        },
        defaultValue || children || 'Loading...'
      );
    }
    
    return React.createElement(
      Component,
      {
        ref,
        className: cn(className, 'violet-dynamic-content'),
        'data-violet-field': field,
        'data-violet-value': displayValue,
        'data-original-content': displayValue,
        'data-content-source': runtimeValue ? 'wordpress' : 'static',
        ...props
      },
      displayValue
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