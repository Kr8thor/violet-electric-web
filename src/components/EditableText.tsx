import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useVioletContent } from '@/contexts/VioletRuntimeContentFixed';
import RichTextModal from './editors/RichTextModal';
import { getFieldConfig, getEditorTitle } from '@/utils/editorConfig';
import DOMPurify from 'dompurify';
import { useEditModeContext } from '@/contexts/EditModeContext';

interface EditableTextProps {
  field: string;
  defaultValue?: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  richText?: boolean; // New prop to enable rich text editing
  maxLength?: number;
  allowedFormats?: string[];
  placeholder?: string;
  preferredEditor?: 'quill' | 'lexical';
}

/**
 * 🎯 ENHANCED EDITABLE TEXT COMPONENT WITH RICH TEXT SUPPORT
 * 
 * NEW FEATURES:
 * ✅ Rich text editing with Quill & Lexical
 * ✅ Beautiful modal interface  
 * ✅ Content sanitization & validation
 * ✅ Field-specific configurations
 * ✅ Auto-save and draft management
 * ✅ Text direction enforcement (LTR)
 * ✅ WordPress integration maintained
 * ✅ Backward compatibility with plain text
 */
const EditableText: React.FC<EditableTextProps> = ({ 
  field, 
  defaultValue = '', 
  as = 'span', 
  className = '',
  richText = false,
  maxLength,
  allowedFormats,
  placeholder,
  preferredEditor
}) => {
  const { getField, updateField, loading, error } = useVioletContent();
  const { isEditing } = useEditModeContext();
  const [value, setValue] = useState<string>(defaultValue);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const originalValue = useRef<string>(defaultValue);
  const Tag = as as any;

  // Get field configuration
  const fieldConfig = getFieldConfig(field);
  const finalMaxLength = maxLength || fieldConfig.maxLength;
  const finalAllowedFormats = allowedFormats || fieldConfig.allowedFormats;
  const finalPlaceholder = placeholder || fieldConfig.placeholder;
  const allowedEditors = ['quill', 'lexical', 'plain'];
  let finalPreferredEditor: 'quill' | 'lexical' | 'plain' = 'quill';
  if (preferredEditor && allowedEditors.includes(preferredEditor)) {
    finalPreferredEditor = preferredEditor as 'quill' | 'lexical' | 'plain';
  } else if (fieldConfig.preferredEditor && allowedEditors.includes(fieldConfig.preferredEditor)) {
    finalPreferredEditor = fieldConfig.preferredEditor as 'quill' | 'lexical' | 'plain';
  }

  // Get the current value from WordPress (never use defaultValue if WordPress has data)
  const wordPressValue = getField(field);
  const displayValue = wordPressValue || defaultValue || '';
  
  // Update local value when WordPress value changes
  useEffect(() => {
    setValue(displayValue);
    // Extra debug logging
    try {
      const pageCtx = (window as any).contentManager?.getCurrentPage?.() || '';
      // eslint-disable-next-line no-console
      console.log(`[EditableText] field=${field} value="${displayValue}" isEditing=${isEditing} page=${pageCtx}`);
    } catch {}
  }, [displayValue, isEditing, field]);

  // Debug logging in development
  useEffect(() => {
    if (import.meta.env?.DEV) {
      console.log(`📝 EditableText[${field}]:`, {
        wordPressValue,
        defaultValue,
        displayValue,
        richText,
        fieldConfig,
        loading,
        error,
        source: wordPressValue ? 'WordPress' : 'fallback'
      });
    }
  }, [field, wordPressValue, defaultValue, displayValue, richText, fieldConfig, loading, error]);

  // Listen for parent messages
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data) return;
      
      switch (event.data.type) {
        case 'violet-update-field':
          if (event.data.field === field) {
            setValue(event.data.value);
          }
          break;
          
        case 'violet-undo-all':
          setValue(originalValue.current);
          break;
          
        case 'violet-apply-saved-changes':
          if (event.data.savedChanges) {
            const fieldData = event.data.savedChanges.find((change: any) => change.field_name === field);
            if (fieldData && fieldData.field_value !== undefined) {
              setValue(fieldData.field_value);
            }
          }
          break;
          
        case 'violet-edit-text':
          if (event.data.field === field) {
            setShowModal(true);
          }
          break;
      }
    }
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [field]);

  // Handle click to edit
  const handleClick = () => {
    if (!isEditing) return;
    if (richText) {
      setShowModal(true);
    } else {
      const newValue = prompt(`Edit ${field}:`, value);
      if (newValue !== null && newValue !== value) {
        handleSave(newValue);
      }
    }
  };

  // Handle save from modal or prompt
  const handleSave = async (newContent: string) => {
    try {
      setIsSaving(true);
      
      // Sanitize content if it's rich text
      const sanitizedContent = richText 
        ? DOMPurify.sanitize(newContent, {
            ALLOWED_TAGS: [
              'p', 'br', 'strong', 'em', 'u', 's', 'ol', 'ul', 'li',
              'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
              'a', 'blockquote', 'code', 'pre', 'span', 'div'
            ],
            ALLOWED_ATTR: [
              'href', 'target', 'class', 'style', 'data-*'
            ],
            ALLOWED_URI_REGEXP: /^https?:\/\/|^\/|^#/
          })
        : newContent;

      // Update local state immediately for responsiveness
      setValue(sanitizedContent);
      
      // Update WordPress content
      await updateField(field, sanitizedContent);
      
      // Notify parent of change for save batch
      window.parent.postMessage({
        type: 'violet-content-changed',
        data: {
          fieldType: field,
          value: sanitizedContent,
          element: as,
          hasUnsavedChanges: true,
          system: 'rich_text_editor'
        }
      }, '*');

    } catch (err) {
      console.error('Failed to save content:', err);
      // Revert on error
      setValue(displayValue);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Render content (handle both plain text and rich text)
  const renderContent = () => {
    if (richText && value) {
      // For rich text, render HTML safely
      return <span dangerouslySetInnerHTML={{ __html: value }} />;
    } else {
      // For plain text, render as text
      return value || finalPlaceholder;
    }
  };

  // Get appropriate title for modal
  const modalTitle = getEditorTitle(field);

  // Editing mode with enhanced styling and text direction fix
  if (isEditing) {
    return (
      <>
        <Tag
          data-violet-field={field}
          data-violet-rich-text={richText}
          tabIndex={0}
          className={cn(
            className, 
            'violet-editing-active',
            'outline-none',
            'bg-blue-50',
            'border-2',
            'border-blue-300',
            'rounded',
            'px-2',
            'py-1',
            'shadow-md',
            'transition-all',
            'duration-200',
            'relative',
            'group',
            isSaving && 'opacity-50'
          )}
          style={{
            outline: '3px dashed #0073aa',
            cursor: 'pointer',
            minHeight: '1em',
            direction: 'ltr',
            textAlign: 'left',
            unicodeBidi: 'normal',
          }}
          onClick={handleClick}
          aria-label={`Editable field: ${field} (${richText ? 'Rich Text' : 'Plain Text'})`}
          suppressContentEditableWarning
        >
          {renderContent()}
          
          {/* Edit indicator */}
          <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium">
              {richText ? '📝 Rich Text' : '✏️ Text'} - Click to edit
            </div>
          </div>
          
          {/* Saving indicator */}
          {isSaving && (
            <div className="absolute -top-6 right-0">
              <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                💾 Saving...
              </div>
            </div>
          )}
        </Tag>

        {/* Rich Text Modal */}
        {richText && (
          <RichTextModal
            isOpen={showModal}
            onClose={handleCloseModal}
            onSave={handleSave}
            initialContent={value}
            field={field}
            fieldLabel={modalTitle}
            maxLength={finalMaxLength}
            preferredEditor={finalPreferredEditor}
          />
        )}
      </>
    );
  }

  // View mode with enhanced hover effects
  const viewModeClasses = cn(
    className,
    'violet-runtime-content',
    richText && 'rich-text-content',
    isEditing && [
      'violet-editable',
      'cursor-pointer',
      'hover:bg-blue-50',
      'hover:outline',
      'hover:outline-2',
      'hover:outline-blue-300',
      'hover:outline-dashed',
      'rounded',
      'transition-all',
      'duration-200',
      'relative',
      'group'
    ],
    loading && 'opacity-50',
    error && 'text-red-500'
  );

  return (
    <Tag
      data-violet-field={field}
      data-violet-value={displayValue}
      data-violet-rich-text={richText}
      data-content-source={wordPressValue ? 'wordpress' : 'fallback'}
      data-violet-editable={isEditing ? 'true' : 'false'}
      title={isEditing ? `Click to edit ${field} (${richText ? 'Rich Text' : 'Plain Text'})` : undefined}
      tabIndex={isEditing ? 0 : -1}
      className={viewModeClasses}
      style={{
        direction: 'ltr',
        textAlign: 'left',
        unicodeBidi: 'normal',
      }}
      onClick={handleClick}
      aria-label={`Editable field: ${field}`}
    >
      {renderContent()}
      
      {/* Edit hint for WordPress editor */}
      {isEditing && (
        <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md font-medium whitespace-nowrap">
            {richText ? '📝 Rich Text Editor' : '✏️ Text Editor'} - Click to edit
          </div>
        </div>
      )}
    </Tag>
  );
};

export default EditableText;

// Enhanced convenience components with rich text support
export const EditableH1: React.FC<Omit<EditableTextProps, 'as'> & { richText?: boolean }> = (props) => (
  <EditableText as="h1" {...props} />
);

export const EditableH2: React.FC<Omit<EditableTextProps, 'as'> & { richText?: boolean }> = (props) => (
  <EditableText as="h2" {...props} />
);

export const EditableH3: React.FC<Omit<EditableTextProps, 'as'> & { richText?: boolean }> = (props) => (
  <EditableText as="h3" {...props} />
);

export const EditableP: React.FC<Omit<EditableTextProps, 'as'> & { richText?: boolean }> = (props) => (
  <EditableText as="p" richText={true} {...props} />
);

export const EditableSpan: React.FC<Omit<EditableTextProps, 'as'> & { richText?: boolean }> = (props) => (
  <EditableText as="span" {...props} />
);

export const EditableDiv: React.FC<Omit<EditableTextProps, 'as'> & { richText?: boolean }> = (props) => (
  <EditableText as="div" richText={true} {...props} />
);

// Rich text specific components
export const RichEditableH1: React.FC<Omit<EditableTextProps, 'as' | 'richText'>> = (props) => (
  <EditableText as="h1" richText={true} {...props} />
);

export const RichEditableH2: React.FC<Omit<EditableTextProps, 'as' | 'richText'>> = (props) => (
  <EditableText as="h2" richText={true} {...props} />
);

export const RichEditableP: React.FC<Omit<EditableTextProps, 'as' | 'richText'>> = (props) => (
  <EditableText as="p" richText={true} {...props} />
);

export const RichEditableDiv: React.FC<Omit<EditableTextProps, 'as' | 'richText'>> = (props) => (
  <EditableText as="div" richText={true} {...props} />
);

// Hook to get field configuration
export const useFieldConfig = (field: string) => {
  return getFieldConfig(field);
};