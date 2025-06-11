import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useVioletContent } from '@/contexts/VioletRuntimeContentFixed';

/**
 * 🎯 UNIVERSAL EDITING SYSTEM
 * Supports editing of text, images, colors, links, and more
 */

export interface EditableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  field: string;
  defaultSrc?: string;
  alt?: string;
}

export interface EditableColorProps extends React.HTMLAttributes<HTMLDivElement> {
  field: string;
  defaultColor?: string;
  property?: 'backgroundColor' | 'color' | 'borderColor';
  children?: React.ReactNode;
}

export interface EditableLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  field: string;
  defaultHref?: string;
  textField?: string;
  defaultText?: string;
  children?: React.ReactNode;
}

/**
 * EDITABLE IMAGE COMPONENT
 */
export const EditableImage: React.FC<EditableImageProps> = ({
  field,
  defaultSrc = '',
  alt = '',
  className,
  ...props
}) => {
  const { getField, updateField } = useVioletContent();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const imageSrc = getField(field, defaultSrc);
  const isInWordPressEditor = window.location.search.includes('edit_mode=1') && 
                              window.location.search.includes('wp_admin=1');

  const handleImageClick = () => {
    if (!isInWordPressEditor) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('field', field);

      // Upload to WordPress media library
      const response = await fetch('/wp-json/violet/v1/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Update the field with new image URL
      updateField(field, result.url);
      
      console.log(`✅ Image uploaded for field ${field}:`, result.url);

    } catch (error) {
      console.error('❌ Image upload failed:', error);
      alert('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          className,
          isInWordPressEditor && 'cursor-pointer hover:opacity-80 hover:outline hover:outline-2 hover:outline-blue-300 transition-all duration-200',
          isUploading && 'opacity-50'
        )}
        onClick={handleImageClick}
        data-violet-field={field}
        data-violet-type="image"
        title={isInWordPressEditor ? `Click to change image (${field})` : undefined}
        {...props}
      />
      
      {isInWordPressEditor && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      )}
      
      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

/**
 * EDITABLE COLOR COMPONENT
 */
export const EditableColor: React.FC<EditableColorProps> = ({
  field,
  defaultColor = '#000000',
  property = 'backgroundColor',
  className,
  style,
  children,
  ...props
}) => {
  const { getField, updateField } = useVioletContent();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  
  const color = getField(field, defaultColor);
  const isInWordPressEditor = window.location.search.includes('edit_mode=1') && 
                              window.location.search.includes('wp_admin=1');

  const handleColorClick = () => {
    if (!isInWordPressEditor) return;
    setShowColorPicker(true);
    setTimeout(() => colorPickerRef.current?.click(), 10);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    updateField(field, newColor);
    console.log(`🎨 Color updated for field ${field}:`, newColor);
  };

  const colorStyle = {
    ...style,
    [property]: color
  };

  return (
    <div
      className={cn(
        className,
        isInWordPressEditor && 'cursor-pointer hover:outline hover:outline-2 hover:outline-blue-300 transition-all duration-200'
      )}
      style={colorStyle}
      onClick={handleColorClick}
      data-violet-field={field}
      data-violet-type="color"
      title={isInWordPressEditor ? `Click to change color (${field})` : undefined}
      {...props}
    >
      {children}
      
      {isInWordPressEditor && (
        <input
          ref={colorPickerRef}
          type="color"
          value={color}
          onChange={handleColorChange}
          className="hidden"
        />
      )}
    </div>
  );
};

/**
 * EDITABLE LINK COMPONENT
 */
export const EditableLink: React.FC<EditableLinkProps> = ({
  field,
  defaultHref = '#',
  textField,
  defaultText = '',
  className,
  children,
  ...props
}) => {
  const { getField, updateField } = useVioletContent();
  const [isEditing, setIsEditing] = useState(false);
  const [tempHref, setTempHref] = useState('');
  const [tempText, setTempText] = useState('');
  
  const href = getField(field, defaultHref);
  const text = textField ? getField(textField, defaultText) : children;
  const isInWordPressEditor = window.location.search.includes('edit_mode=1') && 
                              window.location.search.includes('wp_admin=1');

  const handleLinkClick = (event: React.MouseEvent) => {
    if (!isInWordPressEditor) return;
    
    event.preventDefault();
    setIsEditing(true);
    setTempHref(href);
    setTempText(text?.toString() || '');
  };

  const handleSave = () => {
    updateField(field, tempHref);
    if (textField) {
      updateField(textField, tempText);
    }
    setIsEditing(false);
    console.log(`🔗 Link updated: ${field} = "${tempHref}"`);
  };

  const handleCancel = () => {
    setTempHref(href);
    setTempText(text?.toString() || '');
    setIsEditing(false);
  };

  if (isEditing && isInWordPressEditor) {
    return (
      <div className="inline-block border-2 border-blue-300 rounded p-2 bg-blue-50">
        <div className="space-y-2">
          <input
            type="url"
            value={tempHref}
            onChange={(e) => setTempHref(e.target.value)}
            placeholder="Enter URL"
            className="block w-full px-2 py-1 border rounded text-sm"
          />
          {textField && (
            <input
              type="text"
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              placeholder="Enter link text"
              className="block w-full px-2 py-1 border rounded text-sm"
            />
          )}
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={href}
      className={cn(
        className,
        isInWordPressEditor && 'hover:outline hover:outline-2 hover:outline-blue-300 hover:outline-dashed transition-all duration-200'
      )}
      onClick={handleLinkClick}
      data-violet-field={field}
      data-violet-type="link"
      title={isInWordPressEditor ? `Click to edit link (${field})` : undefined}
      {...props}
    >
      {text || children}
    </a>
  );
};

/**
 * EDITABLE BUTTON COMPONENT
 */
export interface EditableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  textField: string;
  colorField?: string;
  backgroundField?: string;
  defaultText?: string;
  defaultColor?: string;
  defaultBackground?: string;
}

export const EditableButton: React.FC<EditableButtonProps> = ({
  textField,
  colorField,
  backgroundField,
  defaultText = 'Button',
  defaultColor = '#ffffff',
  defaultBackground = '#000000',
  className,
  style,
  children,
  ...props
}) => {
  const { getField, updateField } = useVioletContent();
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState('');
  const [tempColor, setTempColor] = useState('');
  const [tempBackground, setTempBackground] = useState('');
  
  const text = getField(textField, defaultText);
  const color = colorField ? getField(colorField, defaultColor) : defaultColor;
  const background = backgroundField ? getField(backgroundField, defaultBackground) : defaultBackground;
  
  const isInWordPressEditor = window.location.search.includes('edit_mode=1') && 
                              window.location.search.includes('wp_admin=1');

  const handleButtonClick = (event: React.MouseEvent) => {
    if (!isInWordPressEditor) return;
    
    event.preventDefault();
    setIsEditing(true);
    setTempText(text);
    setTempColor(color);
    setTempBackground(background);
  };

  const handleSave = () => {
    updateField(textField, tempText);
    if (colorField) updateField(colorField, tempColor);
    if (backgroundField) updateField(backgroundField, tempBackground);
    setIsEditing(false);
    console.log(`🔘 Button updated: ${textField} = "${tempText}"`);
  };

  const handleCancel = () => {
    setTempText(text);
    setTempColor(color);
    setTempBackground(background);
    setIsEditing(false);
  };

  const buttonStyle = {
    ...style,
    color: color,
    backgroundColor: background
  };

  if (isEditing && isInWordPressEditor) {
    return (
      <div className="inline-block border-2 border-blue-300 rounded p-3 bg-blue-50">
        <div className="space-y-2">
          <input
            type="text"
            value={tempText}
            onChange={(e) => setTempText(e.target.value)}
            placeholder="Button text"
            className="block w-full px-2 py-1 border rounded text-sm"
          />
          {colorField && (
            <div className="flex items-center space-x-2">
              <label className="text-xs">Text:</label>
              <input
                type="color"
                value={tempColor}
                onChange={(e) => setTempColor(e.target.value)}
                className="w-8 h-8 border rounded"
              />
            </div>
          )}
          {backgroundField && (
            <div className="flex items-center space-x-2">
              <label className="text-xs">Background:</label>
              <input
                type="color"
                value={tempBackground}
                onChange={(e) => setTempBackground(e.target.value)}
                className="w-8 h-8 border rounded"
              />
            </div>
          )}
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      className={cn(
        className,
        isInWordPressEditor && 'hover:outline hover:outline-2 hover:outline-blue-300 hover:outline-dashed transition-all duration-200'
      )}
      style={buttonStyle}
      onClick={handleButtonClick}
      data-violet-field={textField}
      data-violet-type="button"
      title={isInWordPressEditor ? `Click to edit button (${textField})` : undefined}
      {...props}
    >
      {text || children}
    </button>
  );
};