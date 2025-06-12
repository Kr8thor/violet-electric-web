import React, { useState, useEffect, useCallback, useRef } from 'react';
import QuillEditor from './QuillEditor';
import VioletLexicalEditor from './LexicalEditor';
import DOMPurify from 'dompurify';

interface RichTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  field: string;
  fieldLabel?: string;
  initialContent?: string;
  fieldType?: string;
  preferredEditor?: 'quill' | 'lexical' | 'plain';
  enableAutoSave?: boolean;
  enableMarkdown?: boolean;
  maxLength?: number;
  showWordCount?: boolean;
  className?: string;
}

type EditorType = 'quill' | 'lexical' | 'plain';

const RichTextModal: React.FC<RichTextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  field,
  fieldLabel,
  initialContent = '',
  fieldType = 'default',
  preferredEditor = 'quill',
  enableAutoSave = true,
  enableMarkdown = true,
  maxLength = 10000,
  showWordCount = true,
  className = ''
}) => {
  const [currentEditor, setCurrentEditor] = useState<EditorType>(preferredEditor);
  const [content, setContent] = useState(initialContent);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'modified' | 'error'>('saved');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate word and character counts
  const updateCounts = useCallback((htmlContent: string) => {
    const textContent = DOMPurify.sanitize(htmlContent, { ALLOWED_TAGS: [] });
    const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
    const chars = textContent.length;
    
    setWordCount(words);
    setCharCount(chars);
    
    // Validate content length
    const errors: string[] = [];
    if (chars > maxLength) {
      errors.push(`Content exceeds maximum length of ${maxLength} characters`);
    }
    setValidationErrors(errors);
  }, [maxLength]);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsModified(true);
    setAutoSaveStatus('modified');
    updateCounts(newContent);

    // Schedule auto-save
    if (enableAutoSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave(newContent);
      }, 3000); // 3 second delay
    }
  }, [enableAutoSave, updateCounts]);

  // Handle auto-save
  const handleAutoSave = useCallback(async (contentToSave: string) => {
    setAutoSaveStatus('saving');
    
    try {
      // Here you would implement the actual auto-save logic
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  }, []);

  // Handle editor switch
  const handleEditorSwitch = useCallback((newEditor: EditorType) => {
    if (newEditor === currentEditor) return;
    
    // Convert content between editors if needed
    let convertedContent = content;
    
    if (currentEditor === 'plain' && newEditor !== 'plain') {
      // Convert plain text to HTML
      convertedContent = content.replace(/\n/g, '<br>');
    } else if (currentEditor !== 'plain' && newEditor === 'plain') {
      // Convert HTML to plain text
      convertedContent = DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
    }
    
    setCurrentEditor(newEditor);
    setContent(convertedContent);
  }, [currentEditor, content]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (validationErrors.length > 0) {
      alert('Please fix validation errors before saving.');
      return;
    }

    setIsSaving(true);
    
    try {
      const sanitizedContent = DOMPurify.sanitize(content);
      await onSave(sanitizedContent);
      setIsModified(false);
      setAutoSaveStatus('saved');
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [content, validationErrors, onSave, onClose]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (isModified) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [isModified, onClose]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSave, handleClose]);

  // Initialize content and counts
  useEffect(() => {
    setContent(initialContent);
    updateCounts(initialContent);
    setIsModified(false);
    setAutoSaveStatus('saved');
  }, [initialContent, updateCounts]);

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Handle click outside to close
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      handleClose();
    }
  }, [handleClose]);

  if (!isOpen) return null;

  const getEditorPlaceholder = () => {
    switch (fieldType) {
      case 'hero_title': return 'Enter your compelling headline...';
      case 'hero_subtitle': return 'Add a supporting description...';
      case 'button_text': return 'Button text';
      case 'link_text': return 'Link text';
      case 'description': return 'Write your content here...';
      default: return 'Start writing...';
    }
  };

  const renderEditor = () => {
    const editorProps = {
      value: content,
      onChange: handleContentChange,
      placeholder: getEditorPlaceholder(),
      fieldType,
      autoSave: enableAutoSave,
      onAutoSave: handleAutoSave
    };

    switch (currentEditor) {
      case 'quill':
        return <QuillEditor {...editorProps} />;
      
      case 'lexical':
        return (
          <VioletLexicalEditor 
            {...editorProps}
            enableMarkdown={enableMarkdown}
            enableRichText={fieldType !== 'button_text' && fieldType !== 'link_text'}
          />
        );
      
      case 'plain':
        return (
          <textarea
            value={DOMPurify.sanitize(content, { ALLOWED_TAGS: [] })}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={getEditorPlaceholder()}
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'monospace',
              lineHeight: '1.5',
              resize: 'vertical',
              direction: 'ltr',
              textAlign: 'left'
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      ref={modalRef}
      className={`violet-rich-text-modal-overlay ${className}`}
      onClick={handleOverlayClick}
    >
      <div className={`violet-rich-text-modal ${isMinimized ? 'minimized' : ''}`}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2 className="modal-title">
              Edit {fieldLabel || field}
            </h2>
            <div className="header-tools">
              <select
                value={currentEditor}
                onChange={(e) => handleEditorSwitch(e.target.value as EditorType)}
                className="editor-selector"
              >
                <option value="quill">Quill Editor</option>
                <option value="lexical">Lexical Editor</option>
                <option value="plain">Plain Text</option>
              </select>
              
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="btn-minimize"
                title={isMinimized ? 'Restore' : 'Minimize'}
              >
                {isMinimized ? '□' : '−'}
              </button>
              
              <button
                onClick={handleClose}
                className="btn-close"
                title="Close"
              >
                ×
              </button>
            </div>
          </div>
          
          {enableAutoSave && (
            <div className="auto-save-status">
              <span className={`status-indicator ${autoSaveStatus}`}>
                {autoSaveStatus === 'saved' && '✓ Saved'}
                {autoSaveStatus === 'saving' && '⏳ Saving...'}
                {autoSaveStatus === 'modified' && '● Unsaved changes'}
                {autoSaveStatus === 'error' && '⚠ Save failed'}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="editor-container">
            {renderEditor()}
          </div>
          
          {validationErrors.length > 0 && (
            <div className="validation-errors">
              {validationErrors.map((error, index) => (
                <div key={index} className="error-message">
                  ⚠ {error}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="footer-stats">
            {showWordCount && (
              <>
                <span className="stat-item">{wordCount} words</span>
                <span className="stat-item">
                  {charCount}/{maxLength} characters
                </span>
              </>
            )}
          </div>
          
          <div className="footer-actions">
            <button
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={isSaving}
            >
              Cancel
            </button>
            
            <button
              onClick={() => handleAutoSave(content)}
              className="btn btn-secondary"
              disabled={isSaving || !enableAutoSave}
            >
              Save Draft
            </button>
            
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={isSaving || validationErrors.length > 0}
            >
              {isSaving ? 'Saving...' : 'Save Content'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .violet-rich-text-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          padding: 20px;
        }

        .violet-rich-text-modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          animation: modalAppear 0.3s ease;
          transition: all 0.3s ease;
        }

        .violet-rich-text-modal.minimized {
          height: 80px;
          overflow: hidden;
        }

        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-header {
          padding: 20px 25px;
          border-bottom: 1px solid #e1e1e1;
          background: linear-gradient(135deg, #0073aa 0%, #005a87 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .modal-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .header-tools {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .editor-selector {
          padding: 8px 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
          cursor: pointer;
        }

        .editor-selector option {
          background: #0073aa;
          color: white;
        }

        .btn-minimize,
        .btn-close {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .btn-minimize:hover,
        .btn-close:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .auto-save-status {
          font-size: 13px;
          opacity: 0.9;
        }

        .status-indicator {
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .status-indicator.saved {
          background: rgba(0, 163, 42, 0.2);
          color: #00a32a;
        }

        .status-indicator.saving {
          background: rgba(0, 115, 170, 0.2);
          color: #0073aa;
        }

        .status-indicator.modified {
          background: rgba(245, 101, 0, 0.2);
          color: #f56500;
        }

        .status-indicator.error {
          background: rgba(214, 57, 57, 0.2);
          color: #d63939;
        }

        .modal-body {
          flex: 1;
          padding: 25px;
          overflow: auto;
        }

        .editor-container {
          margin-bottom: 20px;
        }

        .validation-errors {
          margin-top: 15px;
          padding: 12px;
          background: #fff5f5;
          border: 1px solid #feb2b2;
          border-radius: 8px;
        }

        .error-message {
          color: #e53e3e;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .error-message:last-child {
          margin-bottom: 0;
        }

        .modal-footer {
          padding: 20px 25px;
          border-top: 1px solid #e1e1e1;
          background: #f8f9fa;
          border-radius: 0 0 12px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-stats {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: #666;
        }

        .stat-item {
          display: flex;
          align-items: center;
        }

        .footer-actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #0073aa;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #005a87;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #f3f3f3;
          color: #333;
          border: 1px solid #ddd;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e8e8e8;
          border-color: #bbb;
        }

        @media (max-width: 768px) {
          .violet-rich-text-modal {
            width: 95%;
            max-height: 95vh;
          }

          .modal-header {
            padding: 15px 20px;
          }

          .modal-title {
            font-size: 18px;
          }

          .header-tools {
            gap: 8px;
          }

          .editor-selector {
            font-size: 13px;
            padding: 6px 10px;
          }

          .btn-minimize,
          .btn-close {
            width: 28px;
            height: 28px;
            font-size: 14px;
          }

          .modal-body {
            padding: 20px;
          }

          .modal-footer {
            padding: 15px 20px;
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .footer-stats {
            justify-content: center;
          }

          .footer-actions {
            justify-content: center;
          }

          .btn {
            padding: 12px 16px;
            min-width: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default RichTextModal;
