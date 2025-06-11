import React, { useState, useRef } from 'react';
import { useVioletContent } from '@/contexts/VioletRuntimeContent';

// Base editable element with visual indicators
interface EditableElementProps {
  field: string;
  children: React.ReactNode;
  onEdit?: () => void;
  editType: 'text' | 'image' | 'color' | 'button' | 'link';
  className?: string;
}

function EditableElement({ field, children, onEdit, editType, className = '' }: EditableElementProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isEditMode = window.location.search.includes('edit_mode=1');
  
  if (!isEditMode) {
    return <div className={className}>{children}</div>;
  }
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  return (
    <div
      data-violet-field={field}
      data-violet-type={editType}
      className={`relative ${className} ${isHovered ? 'violet-editing-hover' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        outline: isHovered ? '2px dashed #3b82f6' : 'none',
        outlineOffset: '2px',
        cursor: 'pointer'
      }}
    >
      {children}
      {isHovered && (
        <div className="absolute -top-8 left-0 bg-blue-600 text-white px-2 py-1 text-xs rounded z-50">
          Click to edit {editType}
        </div>
      )}
    </div>
  );
}

// Enhanced EditableImage component
interface EditableImageProps {
  field: string;
  defaultSrc?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function EditableImage({ 
  field, 
  defaultSrc = '', 
  alt = '', 
  className = '',
  width,
  height 
}: EditableImageProps) {
  const { data } = useVioletContent();
  const imageSrc = data?.[field] || defaultSrc;
  
  const handleEdit = () => {
    // Send image edit request to WordPress admin
    window.parent?.postMessage({
      type: 'violet-edit-image',
      field,
      currentSrc: imageSrc,
      alt,
      defaultSrc
    }, '*');
  };

  return (
    <EditableElement field={field} onEdit={handleEdit} editType="image" className={className}>
      <img 
        src={imageSrc} 
        alt={alt}
        className={className}
        width={width}
        height={height}
        data-violet-field={field}
        data-violet-type="image"
      />
    </EditableElement>
  );
}

// EditableColor component (for colored elements)
interface EditableColorProps {
  field: string;
  defaultColor?: string;
  children: React.ReactNode;
  property?: 'color' | 'backgroundColor' | 'borderColor';
  className?: string;
}

export function EditableColor({ 
  field, 
  defaultColor = '#000000', 
  children,
  property = 'color',
  className = ''
}: EditableColorProps) {
  const { data } = useVioletContent();
  const color = data?.[field] || defaultColor;
  
  const handleEdit = () => {
    window.parent?.postMessage({
      type: 'violet-edit-color',
      field,
      currentColor: color,
      property,
      defaultColor
    }, '*');
  };

  const style = { [property]: color };

  return (
    <EditableElement field={field} onEdit={handleEdit} editType="color" className={className}>
      <div style={style} data-violet-field={field} data-violet-type="color" className={className}>
        {children}
      </div>
    </EditableElement>
  );
}

// EditableButton component
interface EditableButtonProps {
  field: string;
  textField?: string;
  urlField?: string;
  colorField?: string;
  defaultText?: string;
  defaultUrl?: string;
  defaultColor?: string;
  className?: string;
  target?: '_blank' | '_self';
  children?: React.ReactNode;
}

export function EditableButton({ 
  field,
  textField = `${field}_text`,
  urlField = `${field}_url`, 
  colorField = `${field}_color`,
  defaultText = 'Button',
  defaultUrl = '#',
  defaultColor = '#3b82f6',
  className = '',
  target = '_self',
  children
}: EditableButtonProps) {
  const { data } = useVioletContent();
  
  const text = data?.[textField] || defaultText;
  const url = data?.[urlField] || defaultUrl;
  const color = data?.[colorField] || defaultColor;
  
  const handleEdit = () => {
    window.parent?.postMessage({
      type: 'violet-edit-button',
      field,
      textField,
      urlField,
      colorField,
      currentText: text,
      currentUrl: url,
      currentColor: color,
      defaultText,
      defaultUrl,
      defaultColor
    }, '*');
  };

  return (
    <EditableElement field={field} onEdit={handleEdit} editType="button" className={className}>
      <a 
        href={url}
        target={target}
        className={className}
        style={{ backgroundColor: color }}
        data-violet-field={field}
        data-violet-type="button"
      >
        {children || text}
      </a>
    </EditableElement>
  );
}

// EditableLink component
interface EditableLinkProps {
  field: string;
  textField?: string;
  urlField?: string;
  defaultText?: string;
  defaultUrl?: string;
  className?: string;
  target?: '_blank' | '_self';
  children?: React.ReactNode;
}

export function EditableLink({ 
  field,
  textField = `${field}_text`,
  urlField = `${field}_url`,
  defaultText = 'Link',
  defaultUrl = '#',
  className = '',
  target = '_self',
  children
}: EditableLinkProps) {
  const { data } = useVioletContent();
  
  const text = data?.[textField] || defaultText;
  const url = data?.[urlField] || defaultUrl;
  
  const handleEdit = () => {
    window.parent?.postMessage({
      type: 'violet-edit-link',
      field,
      textField,
      urlField,
      currentText: text,
      currentUrl: url,
      target,
      defaultText,
      defaultUrl
    }, '*');
  };

  return (
    <EditableElement field={field} onEdit={handleEdit} editType="link" className={className}>
      <a 
        href={url}
        target={target}
        className={className}
        data-violet-field={field}
        data-violet-type="link"
      >
        {children || text}
      </a>
    </EditableElement>
  );
}

// EditableContainer for sections
interface EditableContainerProps {
  field: string;
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function EditableContainer({ 
  field, 
  children, 
  className = '',
  as: Component = 'div'
}: EditableContainerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isEditMode = window.location.search.includes('edit_mode=1');
  
  const handleEdit = () => {
    window.parent?.postMessage({
      type: 'violet-edit-container',
      field,
      action: 'edit-section'
    }, '*');
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.parent?.postMessage({
      type: 'violet-edit-container',
      field,
      action: 'duplicate-section'
    }, '*');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this section?')) {
      window.parent?.postMessage({
        type: 'violet-edit-container',
        field,
        action: 'delete-section'
      }, '*');
    }
  };

  if (!isEditMode) {
    return React.createElement(Component, { className }, children);
  }

  return React.createElement(
    Component,
    {
      className: `${className} ${isHovered ? 'violet-container-hover' : ''}`,
      'data-violet-container': field,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onClick: handleEdit,
      style: {
        position: 'relative' as const,
        outline: isHovered ? '2px dashed #10b981' : 'none',
        outlineOffset: '4px'
      }
    },
    <>
      {children}
      {isHovered && (
        <div className="absolute -top-10 right-0 flex gap-2 z-50">
          <button
            onClick={handleEdit}
            className="bg-green-600 text-white px-2 py-1 text-xs rounded hover:bg-green-700"
          >
            ⚙️ Edit
          </button>
          <button
            onClick={handleDuplicate}
            className="bg-blue-600 text-white px-2 py-1 text-xs rounded hover:bg-blue-700"
          >
            📋 Duplicate
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </>
  );
}

// Export all components
export { EditableElement };

// Convenience exports that match your existing EditableText pattern
export const EditableH1 = ({ field, defaultValue, className, children }: any) => (
  <h1 data-violet-field={field} className={className}>
    {children || defaultValue}
  </h1>
);

export const EditableH2 = ({ field, defaultValue, className, children }: any) => (
  <h2 data-violet-field={field} className={className}>
    {children || defaultValue}
  </h2>
);

export const EditableP = ({ field, defaultValue, className, children }: any) => (
  <p data-violet-field={field} className={className}>
    {children || defaultValue}
  </p>
);
