// File: src/components/EditableText.tsx
// Updated to load content from WordPress instead of hardcoded values

import React, { useState, useEffect, useRef } from 'react';

interface EditableTextProps {
  field: string;
  defaultValue?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  placeholder?: string;
}

export function EditableText({ 
  field, 
  defaultValue = '', 
  className = '', 
  style = {}, 
  children,
  as: Component = 'span',
  placeholder = 'Click to edit...'
}: EditableTextProps) {
  const [content, setContent] = useState<string>(defaultValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isInEditMode, setIsInEditMode] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  // Load content from WordPress on mount
  useEffect(() => {
    const loadContent = () => {
      // Use the new global content fetcher
      const getContent = (window as any).violetGetContent;
      
      if (getContent && typeof getContent === 'function') {
        const wordpressContent = getContent(field, defaultValue);
        if (wordpressContent && wordpressContent !== defaultValue) {
          setContent(wordpressContent);
          console.log(`📝 Loaded content for ${field}:`, wordpressContent.substring(0, 50) + '...');
          return true;
        }
      }

      // If content fetcher is available, try to get content directly
      const contentFetcher = (window as any).violetContentFetcher;
      if (contentFetcher) {
        const wordpressContent = contentFetcher.getContent(field, defaultValue);
        if (wordpressContent && wordpressContent !== defaultValue) {
          setContent(wordpressContent);
          console.log(`📝 Loaded content via fetcher for ${field}:`, wordpressContent.substring(0, 50) + '...');
          return true;
        }
      }

      // Fallback: Try localStorage
      const fallbackContent = localStorage.getItem('violet-wordpress-content');
      if (fallbackContent) {
        try {
          const parsedContent = JSON.parse(fallbackContent);
          if (parsedContent[field]) {
            setContent(parsedContent[field]);
            console.log(`📦 Loaded fallback content for ${field}`);
            return true;
          }
        } catch (error) {
          console.error('Error parsing fallback content:', error);
        }
      }

      // Final fallback: children or defaultValue
      if (children && typeof children === 'string') {
        setContent(children);
      } else if (defaultValue) {
        setContent(defaultValue);
      }
      return false;
    };

    // Load immediately
    loadContent();

    // Set up content loading callback if available
    const contentFetcher = (window as any).violetContentFetcher;
    if (contentFetcher && contentFetcher.onContentLoaded) {
      contentFetcher.onContentLoaded((allContent: any) => {
        if (allContent[field]) {
          setContent(allContent[field]);
          console.log(`🔄 Content updated for ${field}:`, allContent[field].substring(0, 50) + '...');
        }
      });
    }

    // Backup: Also try periodic loading for initial content
    const checkInterval = setInterval(() => {
      if (loadContent()) {
        clearInterval(checkInterval);
      }
    }, 1000);

    // Clean up interval after 10 seconds
    setTimeout(() => clearInterval(checkInterval), 10000);

    return () => clearInterval(checkInterval);
  }, [field, defaultValue, children]);

  // Check if we're in WordPress edit mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('edit_mode') === '1';
    setIsInEditMode(editMode);

    if (editMode) {
      // Listen for edit mode changes
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'violet-enable-editing') {
          setIsInEditMode(true);
        } else if (event.data?.type === 'violet-disable-editing') {
          setIsInEditMode(false);
          setIsEditing(false);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isInEditMode) return;

    setIsEditing(true);
    
    // Send edit request to WordPress
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'violet-edit-request',
        field: field,
        currentValue: content,
        fieldType: 'text'
      }, '*');
    }
  };

  const applyEditingStyles = () => {
    if (!isInEditMode) return {};

    return {
      outline: isEditing ? '2px solid #00a32a' : '2px dashed #0073aa',
      outlineOffset: '2px',
      cursor: 'text',
      transition: 'all 0.2s ease',
      backgroundColor: isEditing ? 'rgba(0, 163, 42, 0.05)' : 'transparent',
      transform: isEditing ? 'translateY(-1px)' : 'none',
      boxShadow: isEditing ? '0 2px 8px rgba(0, 115, 170, 0.15)' : 'none',
      direction: 'ltr' as const,
      textAlign: 'left' as const,
      unicodeBidi: 'normal' as const,
      ...style
    };
  };

  // Listen for content updates from WordPress
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'violet-content-updated' && event.data?.field === field) {
        setContent(event.data.content);
        setIsEditing(false);
        console.log(`✅ Content updated for ${field}:`, event.data.content);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [field]);

  return (
    <Component
      ref={elementRef}
      className={`violet-editable ${className}`}
      style={applyEditingStyles()}
      onClick={handleClick}
      data-violet-field={field}
      data-violet-editable={isInEditMode}
      data-violet-editing={isEditing}
      data-violet-original={defaultValue}
      data-violet-field-type="text"
      suppressContentEditableWarning={true}
      // Don't make it contentEditable in React - let WordPress handle editing
    >
      {content || placeholder}
    </Component>
  );
}

// Named exports for convenience
export default EditableText;

// Convenient components for common HTML elements  
export const EditableH1 = (props: Omit<EditableTextProps, 'as'>) => (
  <EditableText {...props} as="h1" />
);

export const EditableH2 = (props: Omit<EditableTextProps, 'as'>) => (
  <EditableText {...props} as="h2" />
);

export const EditableH3 = (props: Omit<EditableTextProps, 'as'>) => (
  <EditableText {...props} as="h3" />
);

export const EditableP = (props: Omit<EditableTextProps, 'as'>) => (
  <EditableText {...props} as="p" />
);

export const EditableSpan = (props: Omit<EditableTextProps, 'as'>) => (
  <EditableText {...props} as="span" />
);

export const EditableDiv = (props: Omit<EditableTextProps, 'as'>) => (
  <EditableText {...props} as="div" />
);