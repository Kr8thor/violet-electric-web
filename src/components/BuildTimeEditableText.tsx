import React from 'react';
import { cn } from '@/lib/utils';
import { getWordPressField } from '@/wordpress-content';

interface BuildTimeEditableTextProps extends React.HTMLAttributes<HTMLElement> {
  field: string;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  // Remove defaultValue - it's now fetched at build time
}

/**
 * Build-Time Editable Text Component
 * Uses WordPress content fetched at BUILD TIME - no runtime API calls needed
 * Content is baked into the static build, ensuring perfect persistence
 */
export const BuildTimeEditableText = React.forwardRef<HTMLElement, BuildTimeEditableTextProps>(
  ({ field, as: Component = 'span', className, children, ...props }, ref) => {
    
    // Get content from build-time WordPress fetch (via environment variables)
    const buildTimeContent = getWordPressField(field as any);
    
    // Debug logging in development
    if (import.meta.env?.DEV) {
      console.log(`🏗️ BuildTimeEditableText[${field}]: "${buildTimeContent}" (from build-time fetch)`);
    }
    
    return React.createElement(
      Component,
      {
        ref,
        className: cn(className, 'violet-build-time-content'),
        'data-violet-field': field,
        'data-violet-value': buildTimeContent,
        'data-content-source': 'build-time',
        ...props
      },
      buildTimeContent || children
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
    
    // In WordPress editor mode, use runtime editing for live editing
    const isWordPressEditor = new URLSearchParams(window.location.search).has('edit_mode');
    
    if (isWordPressEditor && enableRuntimeEditing) {
      // Import the original EditableText for editing mode
      const RuntimeEditableText = React.lazy(() => import('./EditableText').then(mod => ({ default: mod.EditableText })));
      
      return (
        <React.Suspense fallback={<span>Loading...</span>}>
          <RuntimeEditableText 
            field={field} 
            defaultValue={defaultValue || getWordPressField(field as any)}
            as={Component}
            className={className}
            {...props}
          >
            {children}
          </RuntimeEditableText>
        </React.Suspense>
      );
    }
    
    // For production/static builds, use build-time content
    return (
      <BuildTimeEditableText 
        field={field}
        as={Component}
        className={className}
        {...props}
      >
        {children}
      </BuildTimeEditableText>
    );
  }
);

HybridEditableText.displayName = 'HybridEditableText';