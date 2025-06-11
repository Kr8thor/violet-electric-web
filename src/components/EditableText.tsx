import React from 'react';
import { cn } from '@/lib/utils';
import { useVioletContent } from '@/contexts/VioletRuntimeContent';

interface EditableTextProps extends React.HTMLAttributes<HTMLElement> {
  field: string;
  defaultValue?: string;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

/**
 * 🎯 RUNTIME-ONLY: Editable text component with zero static imports
 * 
 * Loading hierarchy (runtime wins):
 * 1. WordPress API content (authoritative, fetched on every load)  
 * 2. localStorage cache (offline fallback)
 * 3. defaultValue prop (last resort only)
 */
export const EditableText = React.forwardRef<HTMLElement, EditableTextProps>(
  ({ field, defaultValue = '', as: Component = 'span', className, children, ...props }, ref) => {
    const { data, loading, error } = useVioletContent();
    
    // Get the runtime content (WordPress API or cached)
    const runtimeValue = data?.[field];
    
    // Runtime content wins, defaultValue only if WordPress has no data for this field
    const displayValue = runtimeValue || defaultValue || children || '';
    
    // Debug logging in development
    if (import.meta.env?.DEV) {
      console.log(`📝 EditableText[${field}]:`, {
        runtimeValue,
        defaultValue,
        displayValue,
        loading,
        error,
        source: runtimeValue ? 'WordPress/Cache' : 'fallback'
      });
    }
    
    // Don't show loading state - parent provider handles that
    return React.createElement(
      Component,
      {
        ref,
        className: cn(className, 'violet-runtime-content'),
        'data-violet-field': field,
        'data-violet-value': displayValue,
        'data-content-source': runtimeValue ? 'wordpress' : 'fallback',
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