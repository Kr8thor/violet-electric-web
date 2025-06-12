import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  fieldType?: string;
  autoSave?: boolean;
  onAutoSave?: (content: string) => void;
  readOnly?: boolean;
  theme?: 'snow' | 'bubble';
  height?: string;
  maxLength?: number;
  enableImages?: boolean;
  enableLinks?: boolean;
  enableLists?: boolean;
  enableCodeBlocks?: boolean;
  customToolbar?: string[][];
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  fieldType = 'default',
  autoSave = true,
  onAutoSave,
  readOnly = false,
  theme = 'snow',
  height = '300px',
  maxLength = 10000,
  enableImages = true,
  enableLinks = true,
  enableLists = true,
  enableCodeBlocks = true,
  customToolbar
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const lastSavedContent = useRef(value);

  // Define toolbar configurations based on field type
  const getToolbarConfig = useCallback(() => {
    if (customToolbar) {
      return customToolbar;
    }

    // Simple toolbar for buttons and short text
    const simpleToolbar = [
      ['bold', 'italic', 'underline'],
      ['clean']
    ];

    // Basic toolbar for titles and headings
    const basicToolbar = [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ];

    // Full toolbar for rich content
    const fullToolbar = [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      [{ 'align': [] }],
      ...(enableLists ? [[{ 'list': 'ordered'}, { 'list': 'bullet' }]] : []),
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ...(enableLinks ? [['link']] : []),
      ...(enableImages ? [['image']] : []),
      ...(enableCodeBlocks ? [['code-block']] : []),
      ['blockquote'],
      ['clean']
    ];

    switch (fieldType) {
      case 'button_text':
      case 'link_text':
      case 'nav_item':
        return simpleToolbar;
      
      case 'hero_title':
      case 'hero_subtitle':
      case 'heading':
        return basicToolbar;
      
      case 'description':
      case 'content':
      case 'article':
      default:
        return fullToolbar;
    }
  }, [fieldType, customToolbar, enableImages, enableLinks, enableLists, enableCodeBlocks]);

  // Custom image handler for WordPress media library
  const imageHandler = useCallback(() => {
    if (!enableImages) return;

    // Check if WordPress media library is available
    if (typeof window !== 'undefined' && window.wp && window.wp.media) {
      const mediaUploader = window.wp.media({
        title: 'Select Image',
        button: { text: 'Use Image' },
        multiple: false,
        library: { type: 'image' }
      });

      mediaUploader.on('select', () => {
        const attachment = mediaUploader.state().get('selection').first().toJSON();
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection();
          quill.insertEmbed(range?.index || 0, 'image', attachment.url);
        }
      });

      mediaUploader.open();
    } else {
      // Fallback to URL input
      const url = prompt('Enter image URL:');
      if (url) {
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection();
          quill.insertEmbed(range?.index || 0, 'image', url);
        }
      }
    }
  }, [enableImages]);

  // Configure Quill modules
  const modules = {
    toolbar: {
      container: getToolbarConfig(),
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    }
  };

  // Configure formats
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align',
    'code-block'
  ];

  // Handle content change with validation
  const handleChange = useCallback((content: string) => {
    // Sanitize content
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'pre', 'code', 'span', 'div'
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'src', 'alt', 'title', 'style', 'class',
        'color', 'background-color', 'font-size', 'text-align'
      ]
    });

    // Count characters (excluding HTML tags)
    const textContent = DOMPurify.sanitize(sanitizedContent, { ALLOWED_TAGS: [] });
    setCharCount(textContent.length);

    // Validate length
    if (textContent.length <= maxLength) {
      onChange(sanitizedContent);
    } else {
      // Truncate if too long
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const truncatedText = textContent.substring(0, maxLength);
        quill.setText(truncatedText);
      }
    }
  }, [onChange, maxLength]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && onAutoSave && value !== lastSavedContent.current) {
      const saveTimeout = setTimeout(() => {
        onAutoSave(value);
        lastSavedContent.current = value;
      }, 2000);

      return () => clearTimeout(saveTimeout);
    }
  }, [value, autoSave, onAutoSave]);

  // Set initial character count
  useEffect(() => {
    const textContent = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
    setCharCount(textContent.length);
  }, [value]);

  // Custom styles for the editor
  const editorStyle = {
    height: height,
    direction: 'ltr' as const,
    textAlign: 'left' as const
  };

  return (
    <div className="violet-quill-editor">
      <ReactQuill
        ref={quillRef}
        theme={theme}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
        style={editorStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      
      <div className="editor-status">
        <div className="char-count">
          <span className={charCount > maxLength * 0.9 ? 'warning' : ''}>
            {charCount}/{maxLength} characters
          </span>
        </div>
        
        {isFocused && (
          <div className="editor-tips">
            <span className="tip">
              💡 Use Ctrl+S to save, Ctrl+B for bold, Ctrl+I for italic
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        .violet-quill-editor {
          width: 100%;
          direction: ltr;
          text-align: left;
        }

        .violet-quill-editor :global(.ql-editor) {
          min-height: ${height};
          font-size: 16px;
          line-height: 1.6;
          direction: ltr !important;
          text-align: left !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .violet-quill-editor :global(.ql-editor.ql-blank::before) {
          font-style: normal;
          color: #999;
          direction: ltr;
          text-align: left;
        }

        .violet-quill-editor :global(.ql-toolbar) {
          border-top: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          background: #fafafa;
          border-radius: 8px 8px 0 0;
        }

        .violet-quill-editor :global(.ql-container) {
          border-bottom: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-radius: 0 0 8px 8px;
        }

        .violet-quill-editor :global(.ql-editor:focus) {
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 115, 170, 0.2);
        }

        .violet-quill-editor :global(.ql-toolbar .ql-picker-label) {
          border: 1px solid transparent;
          border-radius: 4px;
        }

        .violet-quill-editor :global(.ql-toolbar .ql-picker-label:hover) {
          background: rgba(0, 115, 170, 0.1);
          border-color: #0073aa;
        }

        .violet-quill-editor :global(.ql-toolbar button) {
          border-radius: 4px;
          margin: 2px;
        }

        .violet-quill-editor :global(.ql-toolbar button:hover) {
          background: rgba(0, 115, 170, 0.1);
          border-color: #0073aa;
        }

        .violet-quill-editor :global(.ql-toolbar button.ql-active) {
          background: #0073aa;
          color: white;
        }

        .editor-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: #f8f9fa;
          border: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 8px 8px;
          font-size: 12px;
          color: #666;
        }

        .char-count {
          font-weight: 500;
        }

        .char-count .warning {
          color: #e53e3e;
          font-weight: 600;
        }

        .editor-tips {
          opacity: 0.8;
        }

        .tip {
          font-style: italic;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .violet-quill-editor :global(.ql-toolbar) {
            background: #2d2d2d;
            border-color: #555;
          }

          .violet-quill-editor :global(.ql-container) {
            border-color: #555;
            background: #1a1a1a;
          }

          .violet-quill-editor :global(.ql-editor) {
            color: #e0e0e0;
          }

          .editor-status {
            background: #2d2d2d;
            border-color: #555;
            color: #ccc;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .violet-quill-editor :global(.ql-toolbar) {
            padding: 8px;
          }

          .violet-quill-editor :global(.ql-editor) {
            font-size: 16px;
            padding: 15px;
          }

          .editor-status {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .editor-tips {
            width: 100%;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .violet-quill-editor :global(.ql-toolbar),
          .violet-quill-editor :global(.ql-container) {
            border-width: 2px;
            border-color: #000;
          }

          .violet-quill-editor :global(.ql-editor:focus) {
            box-shadow: 0 0 0 3px #0073aa;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .violet-quill-editor :global(.ql-toolbar button),
          .violet-quill-editor :global(.ql-picker-label) {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default QuillEditor;
