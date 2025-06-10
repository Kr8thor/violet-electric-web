import React from 'react';
import { useContentFromStorage } from '../hooks/useContentFromStorage';

interface DynamicContentProps {
  fieldName: string;
  defaultValue?: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * Dynamic content component that loads from storage instead of hardcoded text
 * Replaces static text with content that persists from WordPress edits
 */
export function DynamicContent({ 
  fieldName, 
  defaultValue = '', 
  as: Component = 'span',
  className = '',
  children,
  ...props 
}: DynamicContentProps) {
  const { get, loading, error } = useContentFromStorage();

  // Get content with fallback hierarchy
  const content = get(fieldName, defaultValue);

  // If loading, show placeholder or children
  if (loading) {
    return (
      <Component className={`${className} violet-loading`} {...props}>
        {children || defaultValue || 'Loading...'}
      </Component>
    );
  }

  // If error, show fallback content
  if (error) {
    console.warn(`DynamicContent error for field "${fieldName}":`, error);
    return (
      <Component className={`${className} violet-error`} {...props}>
        {children || defaultValue || 'Content unavailable'}
      </Component>
    );
  }

  // Show dynamic content with editing attributes
  return (
    <Component 
      className={`${className} violet-dynamic-content`}
      data-violet-field={fieldName}
      data-original-content={content}
      {...props}
    >
      {content || children || defaultValue}
    </Component>
  );
}

// Convenience components for common use cases
export const DynamicHeading = (props: Omit<DynamicContentProps, 'as'>) => (
  <DynamicContent as="h1" {...props} />
);

export const DynamicText = (props: Omit<DynamicContentProps, 'as'>) => (
  <DynamicContent as="p" {...props} />
);

export const DynamicButton = (props: Omit<DynamicContentProps, 'as'>) => (
  <DynamicContent as="button" {...props} />
);

export const DynamicLink = (props: Omit<DynamicContentProps, 'as'>) => (
  <DynamicContent as="a" {...props} />
);

// Higher-order component to make any component dynamic
export function withDynamicContent<T extends {}>(
  WrappedComponent: React.ComponentType<T>,
  fieldName: string,
  contentProp: string = 'children'
) {
  return function DynamicWrapper(props: T) {
    const { get } = useContentFromStorage();
    const dynamicContent = get(fieldName);
    
    const enhancedProps = {
      ...props,
      [contentProp]: dynamicContent || (props as any)[contentProp]
    } as T;

    return <WrappedComponent {...enhancedProps} />;
  };
}
