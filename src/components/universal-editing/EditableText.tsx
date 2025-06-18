// Updated EditableText Component with integrated save system
import React, { useState, useEffect } from 'react';
import { useVioletContent } from '../../contexts/VioletRuntimeContentFixed';

export interface EditableTextProps {
  field: string;
  element?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div';
  className?: string;
  placeholder?: string;
  children?: React.ReactNode;
  maxLength?: number;
  onEdit?: (value: string) => void;
  validation?: (value: string) => boolean;
}

export function EditableText({
  field,
  element: Element = 'p',
  className = '',
  placeholder = '',
  children,
  maxLength = 1000,
  onEdit,
  validation
}: EditableTextProps) {
  const { getContent, updateContent, isEditing } = useVioletContent();
  const [localValue, setLocalValue] = useState<string>('');

  // Get content from context
  const content = getContent(field, children?.toString() || placeholder);

  // Update local value when content changes
  useEffect(() => {
    setLocalValue(content);
  }, [content]);

  const handleContentChange = (newValue: string) => {
    // Validate if validation function provided
    if (validation && !validation(newValue)) {
      console.warn(`Validation failed for field: ${field}`);
      return;
    }

    // Check max length
    if (maxLength && newValue.length > maxLength) {
      console.warn(`Content exceeds max length (${maxLength}) for field: ${field}`);
      return;
    }

    // Update local state immediately for responsive UI
    setLocalValue(newValue);

    // Update context (which triggers save system)
    updateContent(field, newValue);

    // Call custom onEdit handler if provided
    if (onEdit) {
      onEdit(newValue);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing) return;

    e.preventDefault();
    e.stopPropagation();

    // Send edit request to WordPress parent window
    window.parent.postMessage({
      type: 'violet-edit-request',
      payload: {
        field,
        currentValue: localValue,
        elementType: Element,
        maxLength,
        timestamp: Date.now()
      }
    }, '*');
  };

  // Listen for content updates from WordPress
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'violet-update-field' && 
          event.data?.payload?.field === field) {
        const newValue = event.data.payload.value;
        handleContentChange(newValue);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [field]);

  // Generate classes for editing state
  const getElementClasses = () => {
    const baseClasses = className;
    const editingClasses = isEditing ? 'violet-editable cursor-pointer' : '';
    
    return `${baseClasses} ${editingClasses}`.trim();
  };

  // Generate styles for editing state
  const getElementStyles = (): React.CSSProperties => {
    if (!isEditing) return {};

    return {
      outline: 'none',
      transition: 'all 0.2s ease',
      position: 'relative'
    };
  };

  const elementProps = {
    'data-violet-field': field,
    className: getElementClasses(),
    style: getElementStyles(),
    onClick: handleClick,
    title: isEditing ? `Click to edit ${field}` : undefined,
    children: localValue || placeholder
  };

  // Add hover effects for editing mode
  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!isEditing) return;
    
    const element = e.currentTarget;
    element.style.outline = '2px dashed #3b82f6';
    element.style.outlineOffset = '2px';
    
    // Add tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'violet-edit-tooltip';
    tooltip.textContent = `Edit ${field}`;
    tooltip.style.cssText = `
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 1000;
      pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.appendChild(tooltip);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (!isEditing) return;
    
    const element = e.currentTarget;
    element.style.outline = 'none';
    
    // Remove tooltip
    const tooltip = element.querySelector('.violet-edit-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  };

  return React.createElement(Element, {
    ...elementProps,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  });
}

export default EditableText;