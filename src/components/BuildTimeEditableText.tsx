import React from 'react';
import { cn } from '@/lib/utils';
import { useVioletContent } from '@/contexts/VioletRuntimeContent';

interface BuildTimeEditableTextProps extends React.HTMLAttributes<HTMLElement> {
  field: string;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  // Remove defaultValue - it's now fetched at build time
}

/**
 * Runtime Editable Text Component (formerly build-time, now unified)
 * Uses WordPress content fetched at RUNTIME - no more static imports
 */
export const BuildTimeEditableText = React.forwardRef<HTMLElement, BuildTimeEditableTextProps>(
  ({ field, as: Component = 'span', className, children, ...props }, ref) => {
    
    const { data } = useVioletContent();
    
    // Get content from runtime WordPress fetch
    const runtimeContent = data?.[field] || '';
    
    // Debug logging in development
    if (import.meta.env?.DEV) {
      console.log(`🏗️ BuildTimeEditableText[${field}]: "${runtimeContent}" (from runtime fetch)`);
    }
    
    return React.createElement(
      Component,
      {
        ref,
        className: cn(className, 'violet-runtime-content'),
        'data-violet-field': field,
        'data-violet-value': runtimeContent,
        'data-content-source': 'runtime',
        ...props
      },
      runtimeContent || children
    );
  }
);

BuildTimeEditableText.displayName = 'BuildTimeEditableText';

// Convenience components for common use cases
export const BuildTimeEditableH1: React.FC<Omit<BuildTimeEditableTextProps, 'as'>> = (props) => (
  <BuildTimeEditableText as="h1" {...props} />
);

export const BuildTimeEditableH2: React.FC<Omit<BuildTimeEditableTextProps, 'as'>> = (props) => (
  <BuildTimeEditableText as="h2" {...props} />
);

export const BuildTimeEditableH3: React.FC<Omit<BuildTimeEditableTextProps, 'as'>> = (props) => (
  <BuildTimeEditableText as="h3" {...props} />
);

export const BuildTimeEditableP: React.FC<Omit<BuildTimeEditableTextProps, 'as'>> = (props) => (
  <BuildTimeEditableText as="p" {...props} />
);

export const BuildTimeEditableButton: React.FC<Omit<BuildTimeEditableTextProps, 'as'>> = (props) => (
  <BuildTimeEditableText as="button" {...props} />
);

export const BuildTimeEditableSpan: React.FC<Omit<BuildTimeEditableTextProps, 'as'>> = (props) => (
  <BuildTimeEditableText as="span" {...props} />
);

export const BuildTimeEditableDiv: React.FC<Omit<BuildTimeEditableTextProps, 'as'>> = (props) => (
  <BuildTimeEditableText as="div" {...props} />
);

// Hybrid component that supports both runtime and build-time modes
export const HybridEditableText = React.forwardRef<HTMLElement, BuildTimeEditableTextProps & { 
  defaultValue?: string;
  enableRuntimeEditing?: boolean; 
}>(
  ({ field, defaultValue, enableRuntimeEditing = false, as: Component = 'span', className, children, ...props }, ref) => {
    
    const { data } = useVioletContent();
    
    // In WordPress editor mode, use runtime editing for live editing
    const isWordPressEditor = new URLSearchParams(window.location.search).has('edit_mode');
    
    // Always use runtime content - no more build-time static content
    const runtimeContent = data?.[field] || '';
    const displayValue = runtimeContent || defaultValue || children;
    
    // Debug logging
    if (import.meta.env?.DEV) {
      console.log(`🔧 HybridEditableText[${field}]: "${displayValue}" (WordPress Editor: ${isWordPressEditor})`);
    }
    
    return React.createElement(
      Component,
      {
        ref,
        className: cn(className, 'violet-runtime-content'),
        'data-violet-field': field,
        'data-violet-value': displayValue,
        'data-content-source': 'runtime',
        'data-enable-editing': enableRuntimeEditing && isWordPressEditor,
        ...props
      },
      displayValue
    );
  }
);

HybridEditableText.displayName = 'HybridEditableText';