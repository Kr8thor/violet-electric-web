/**
 * 🎨 Rich Text WordPress Integration Bridge
 * 
 * CRITICAL COMPONENT: Bridges WordPress admin and React rich text modal system
 * Replaces prompt() dialogs with sophisticated React rich text editing
 * 
 * INTEGRATION FEATURES:
 * ✅ Connects WordPress PostMessage to existing RichTextModal.tsx
 * ✅ Handles editor switching (Quill vs Lexical)
 * ✅ Content persistence and WordPress sync
 * ✅ Professional rich text editing experience
 * ✅ Works with existing QuillEditor.tsx and LexicalEditor.tsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import RichTextModal from './editors/RichTextModal';

interface RichTextWordPressIntegrationProps {
  onContentChange?: (field: string, content: string) => void;
}

interface ModalRequest {
  field: string;
  currentValue: string;
  fieldType: string;
  editorPreference: 'quill' | 'lexical' | 'auto';
  modalConfig: {
    title: string;
    placeholder: string;
    maxLength: number;
    allowFormatting: boolean;
    showWordCount: boolean;
  };
}

export const RichTextWordPressIntegration: React.FC<RichTextWordPressIntegrationProps> = ({
  onContentChange
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRequest, setModalRequest] = useState<ModalRequest | null>(null);
  const [editorPreference, setEditorPreference] = useState<'quill' | 'lexical' | 'auto'>('quill');

  // 🎯 CRITICAL: Handle WordPress PostMessage requests
  const handleWordPressMessage = useCallback((event: MessageEvent) => {
    // Verify origin security
    const allowedOrigins = [
      'https://wp.violetrainwater.com',
      'https://violetrainwater.com',
      window.location.origin
    ];
    
    if (!allowedOrigins.includes(event.origin)) {
      console.log('🚫 Blocked message from untrusted origin:', event.origin);
      return;
    }

    const { type, data } = event.data;
    
    console.log('🎨 Rich Text Integration received:', type, data);

    switch (type) {
      case 'violet-rich-text-test':
        // Respond to WordPress connection test
        sendToWordPress({
          type: 'violet-rich-text-ready',
          system: 'react_rich_text_integration'
        });
        break;

      case 'violet-show-rich-text-modal':
        // 🎯 CRITICAL: This replaces the old prompt() system!
        console.log('🎨 Opening rich text modal for:', event.data.field);
        setModalRequest({
          field: event.data.field,
          currentValue: event.data.currentValue || '',
          fieldType: event.data.fieldType || 'paragraph',
          editorPreference: event.data.editorPreference || editorPreference,
          modalConfig: event.data.modalConfig || {
            title: `Edit ${event.data.field}`,
            placeholder: 'Enter content...',
            maxLength: 5000,
            allowFormatting: true,
            showWordCount: true
          }
        });
        setIsModalOpen(true);
        break;

      case 'violet-editor-preference-changed':
        setEditorPreference(event.data.editorPreference);
        break;

      case 'violet-rich-text-apply-saved':
        // Handle saved changes from WordPress
        handleSavedChanges(event.data.savedChanges);
        break;
    }
  }, [editorPreference]);

  // Set up message listener
  useEffect(() => {
    window.addEventListener('message', handleWordPressMessage);
    
    // Send ready signal to WordPress
    sendToWordPress({
      type: 'violet-rich-connection-ready',
      editorPreference: editorPreference,
      system: 'react_rich_text_integration'
    });

    return () => {
      window.removeEventListener('message', handleWordPressMessage);
    };
  }, [handleWordPressMessage]);

  // 🎯 Send messages to WordPress admin
  const sendToWordPress = (data: any) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(data, '*');
        console.log('🎨 Sent to WordPress:', data.type);
      }
    } catch (error) {
      console.error('🚫 Failed to send message to WordPress:', error);
    }
  };

  // Handle rich text modal save
  const handleRichTextSave = useCallback((content: string, metadata: any) => {
    if (!modalRequest) return;

    console.log('🎨 Rich text saved:', modalRequest.field, content);

    // Notify WordPress of the save
    sendToWordPress({
      type: 'violet-rich-text-saved',
      field: modalRequest.field,
      content: content,
      editorType: metadata.editorType || editorPreference,
      formatting: metadata.formatting || {},
      wordCount: metadata.wordCount || 0,
      characterCount: metadata.characterCount || 0
    });

    // Notify parent component
    if (onContentChange) {
      onContentChange(modalRequest.field, content);
    }

    // Close modal
    setIsModalOpen(false);
    setModalRequest(null);

    // Notify WordPress modal is closed
    sendToWordPress({
      type: 'violet-rich-text-modal-closed',
      field: modalRequest.field
    });
  }, [modalRequest, editorPreference, onContentChange]);

  // Handle modal close without saving
  const handleModalClose = useCallback(() => {
    console.log('🎨 Rich text modal closed without saving');
    
    setIsModalOpen(false);
    setModalRequest(null);

    // Notify WordPress modal is closed
    sendToWordPress({
      type: 'violet-rich-text-modal-closed',
      field: modalRequest?.field || 'unknown'
    });
  }, [modalRequest]);

  // Handle saved changes from WordPress
  const handleSavedChanges = (savedChanges: any[]) => {
    console.log('🎨 Applying saved changes from WordPress:', savedChanges);
    
    savedChanges.forEach(change => {
      // Find elements with matching field names and update them
      const elements = document.querySelectorAll(`[data-violet-field="${change.field_name}"]`);
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          // Update element content
          if (change.field_type === 'rich_text') {
            element.innerHTML = change.field_value;
          } else {
            element.textContent = change.field_value;
          }
          
          // Visual feedback for successful save
          element.style.backgroundColor = '#d4edda';
          element.style.borderLeft = '4px solid #28a745';
          element.style.paddingLeft = '12px';
          
          setTimeout(() => {
            element.style.backgroundColor = '';
            element.style.borderLeft = '';
            element.style.paddingLeft = '';
          }, 2000);
        }
      });
    });
  };

  // 🎯 RENDER RICH TEXT MODAL WHEN REQUESTED
  if (!isModalOpen || !modalRequest) {
    return null; // Hidden integration component
  }

  return (
    <RichTextModal
      isOpen={isModalOpen}
      onClose={handleModalClose}
      onSave={handleRichTextSave}
      initialContent={modalRequest.currentValue}
      fieldName={modalRequest.field}
      fieldType={modalRequest.fieldType}
      editorPreference={modalRequest.editorPreference}
      config={{
        title: modalRequest.modalConfig.title,
        placeholder: modalRequest.modalConfig.placeholder,
        maxLength: modalRequest.modalConfig.maxLength,
        showWordCount: modalRequest.modalConfig.showWordCount,
        allowFormatting: modalRequest.modalConfig.allowFormatting,
        autoSave: false, // Controlled by WordPress
        minimizable: true,
        resizable: true
      }}
      className="violet-wordpress-rich-text-modal"
    />
  );
};

/**
 * 🎨 Rich Text Detection Hook
 * Detects when React app should enable rich text integration
 */
export const useRichTextIntegration = () => {
  const [isRichTextMode, setIsRichTextMode] = useState(false);
  const [editorPreference, setEditorPreference] = useState<'quill' | 'lexical' | 'auto'>('quill');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const richTextMode = urlParams.get('rich_text') === '1';
    const editMode = urlParams.get('edit_mode') === '1';
    const wpAdmin = urlParams.get('wp_admin') === '1';
    
    // Enable rich text mode when all parameters are present
    if (richTextMode && editMode && wpAdmin) {
      setIsRichTextMode(true);
      console.log('🎨 Rich text integration mode ENABLED');
    }

    // Load editor preference from URL or localStorage
    const urlEditorPref = urlParams.get('editor_preference');
    if (urlEditorPref && ['quill', 'lexical', 'auto'].includes(urlEditorPref)) {
      setEditorPreference(urlEditorPref as 'quill' | 'lexical' | 'auto');
    } else {
      const savedPref = localStorage.getItem('violet_editor_preference');
      if (savedPref && ['quill', 'lexical', 'auto'].includes(savedPref)) {
        setEditorPreference(savedPref as 'quill' | 'lexical' | 'auto');
      }
    }
  }, []);

  return {
    isRichTextMode,
    editorPreference,
    setEditorPreference
  };
};

/**
 * 🎨 Enhanced Editable Text with Rich Text Support
 * Extends existing EditableText to work with rich text modal
 */
export const RichEditableText: React.FC<{
  field: string;
  children: React.ReactNode;
  fieldType?: string;
  maxLength?: number;
  allowFormatting?: boolean;
  className?: string;
}> = ({ 
  field, 
  children, 
  fieldType = 'paragraph',
  maxLength = 5000,
  allowFormatting = true,
  className = ''
}) => {
  const { isRichTextMode } = useRichTextIntegration();

  const handleClick = useCallback(() => {
    if (!isRichTextMode) return;

    console.log('🎨 Rich text element clicked:', field);

    // Send request to WordPress to open rich text modal
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'violet-open-rich-text-modal',
        field: field,
        currentValue: (children as any)?.toString() || '',
        fieldType: fieldType,
        fieldLabel: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        maxLength: maxLength,
        allowFormatting: allowFormatting
      }, '*');
    }
  }, [field, children, fieldType, maxLength, allowFormatting, isRichTextMode]);

  if (!isRichTextMode) {
    return <>{children}</>;
  }

  return (
    <span
      data-violet-field={field}
      data-violet-rich-text="true"
      className={`violet-rich-editable ${className}`}
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        outline: '2px dashed #6f42c1',
        outlineOffset: '2px',
        padding: '4px',
        borderRadius: '4px',
        transition: 'all 0.3s ease'
      }}
      title={`Click to edit with rich text (${fieldType})`}
    >
      {children}
    </span>
  );
};

export default RichTextWordPressIntegration;