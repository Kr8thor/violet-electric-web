import React, { useCallback, useEffect, useRef, useState } from 'react';
import { $getRoot, $getSelection, EditorState, LexicalEditor } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Lexical nodes
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { $convertFromMarkdownString, $convertToMarkdownString } from '@lexical/markdown';

import DOMPurify from 'dompurify';

interface VioletLexicalEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  fieldType?: string;
  autoSave?: boolean;
  onAutoSave?: (content: string) => void;
  enableMarkdown?: boolean;
  enableRichText?: boolean;
  readOnly?: boolean;
  height?: string;
  maxLength?: number;
  autoFocus?: boolean;
}

// Custom toolbar component
function ToolbarPlugin({ fieldType }: { fieldType?: string }) {
  const [editor] = useLexicalComposerContext();
  const [isRedo, setIsRedo] = useState(false);
  const [isUndo, setIsUndo] = useState(false);

  const formatText = useCallback(
    (format: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          switch (format) {
            case 'bold':
              selection.formatText('bold');
              break;
            case 'italic':
              selection.formatText('italic');
              break;
            case 'underline':
              selection.formatText('underline');
              break;
            case 'strikethrough':
              selection.formatText('strikethrough');
              break;
            case 'code':
              selection.formatText('code');
              break;
          }
        }
      });
    },
    [editor]
  );

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          selection.insertText(url);
        }
      });
    }
  }, [editor]);

  const undo = useCallback(() => {
    editor.dispatchCommand({ type: 'UNDO_COMMAND' }, undefined);
  }, [editor]);

  const redo = useCallback(() => {
    editor.dispatchCommand({ type: 'REDO_COMMAND' }, undefined);
  }, [editor]);

  // Simple toolbar for basic text fields
  if (fieldType === 'button_text' || fieldType === 'link_text' || fieldType === 'nav_item') {
    return (
      <div className="lexical-toolbar simple">
        <button onClick={() => formatText('bold')} className="toolbar-btn">
          <strong>B</strong>
        </button>
        <button onClick={() => formatText('italic')} className="toolbar-btn">
          <em>I</em>
        </button>
        <button onClick={() => formatText('underline')} className="toolbar-btn">
          <u>U</u>
        </button>
      </div>
    );
  }

  // Full toolbar for rich content
  return (
    <div className="lexical-toolbar">
      <div className="toolbar-group">
        <button onClick={undo} disabled={!isUndo} className="toolbar-btn">
          ↶
        </button>
        <button onClick={redo} disabled={!isRedo} className="toolbar-btn">
          ↷
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button onClick={() => formatText('bold')} className="toolbar-btn">
          <strong>B</strong>
        </button>
        <button onClick={() => formatText('italic')} className="toolbar-btn">
          <em>I</em>
        </button>
        <button onClick={() => formatText('underline')} className="toolbar-btn">
          <u>U</u>
        </button>
        <button onClick={() => formatText('strikethrough')} className="toolbar-btn">
          <s>S</s>
        </button>
        <button onClick={() => formatText('code')} className="toolbar-btn">
          {'</>'}
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button onClick={insertLink} className="toolbar-btn">
          🔗
        </button>
      </div>
    </div>
  );
}

// Plugin to handle content changes
function OnContentChangePlugin({ 
  onChange, 
  maxLength 
}: { 
  onChange: (content: string) => void;
  maxLength?: number;
}) {
  const handleChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      editorState.read(() => {
        const root = $getRoot();
        const htmlContent = root.getTextContent();
        
        // Check length limits
        if (maxLength && htmlContent.length > maxLength) {
          // Truncate content if too long
          editor.update(() => {
            const truncatedContent = htmlContent.substring(0, maxLength);
            root.clear();
            root.append(
              // This is simplified - in real implementation you'd preserve formatting
              ...truncatedContent.split('\n').map(line => {
                const paragraph = document.createElement('p');
                paragraph.textContent = line;
                return paragraph;
              })
            );
          });
          return;
        }

        // Convert to HTML and sanitize
        const htmlString = root.getTextContent(); // Simplified - would use proper HTML serialization
        const sanitizedContent = DOMPurify.sanitize(htmlString);
        onChange(sanitizedContent);
      });
    },
    [onChange, maxLength]
  );

  return <OnChangePlugin onChange={handleChange} />;
}

// Character count plugin
function CharacterCountPlugin({ 
  maxLength,
  onCharCountChange 
}: { 
  maxLength?: number;
  onCharCountChange?: (count: number) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();
        const count = textContent.length;
        setCharCount(count);
        onCharCountChange?.(count);
      });
    });
  }, [editor, onCharCountChange]);

  if (!maxLength) return null;

  return (
    <div className="character-count">
      <span className={charCount > maxLength * 0.9 ? 'warning' : ''}>
        {charCount}/{maxLength} characters
      </span>
    </div>
  );
}

// Auto-save plugin
function AutoSavePlugin({ 
  autoSave, 
  onAutoSave, 
  delay = 2000 
}: { 
  autoSave?: boolean;
  onAutoSave?: (content: string) => void;
  delay?: number;
}) {
  const [editor] = useLexicalComposerContext();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!autoSave || !onAutoSave) return;

    return editor.registerUpdateListener(({ editorState }) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        editorState.read(() => {
          const root = $getRoot();
          const content = root.getTextContent(); // Simplified
          onAutoSave(content);
        });
      }, delay);
    });
  }, [editor, autoSave, onAutoSave, delay]);

  return null;
}

const VioletLexicalEditor: React.FC<VioletLexicalEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  fieldType = 'default',
  autoSave = true,
  onAutoSave,
  enableMarkdown = true,
  enableRichText = true,
  readOnly = false,
  height = '300px',
  maxLength = 10000,
  autoFocus = false
}) => {
  const [charCount, setCharCount] = useState(0);

  // Editor configuration
  const initialConfig = {
    namespace: 'VioletLexicalEditor',
    theme: {
      root: 'violet-lexical-root',
      paragraph: 'violet-lexical-paragraph',
      heading: {
        h1: 'violet-lexical-h1',
        h2: 'violet-lexical-h2',
        h3: 'violet-lexical-h3',
        h4: 'violet-lexical-h4',
        h5: 'violet-lexical-h5',
        h6: 'violet-lexical-h6',
      },
      list: {
        nested: {
          listitem: 'violet-lexical-nested-listitem',
        },
        ol: 'violet-lexical-list-ol',
        ul: 'violet-lexical-list-ul',
        listitem: 'violet-lexical-listitem',
      },
      link: 'violet-lexical-link',
      text: {
        bold: 'violet-lexical-text-bold',
        italic: 'violet-lexical-text-italic',
        underline: 'violet-lexical-text-underline',
        strikethrough: 'violet-lexical-text-strikethrough',
        code: 'violet-lexical-text-code',
      },
      code: 'violet-lexical-code',
      quote: 'violet-lexical-quote',
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      AutoLinkNode,
    ],
    editorState: value ? () => $convertFromMarkdownString(value, TRANSFORMERS) : undefined,
    onError: (error: Error) => {
      console.error('Lexical Editor Error:', error);
    },
  };

  return (
    <div className="violet-lexical-editor">
      <LexicalComposer initialConfig={initialConfig}>
        {enableRichText && <ToolbarPlugin fieldType={fieldType} />}
        
        <div className="editor-container">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="violet-lexical-content-editable"
                style={{ 
                  minHeight: height,
                  direction: 'ltr',
                  textAlign: 'left'
                }}
                readOnly={readOnly}
              />
            }
            placeholder={
              <div className="violet-lexical-placeholder">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          
          <OnContentChangePlugin onChange={onChange} maxLength={maxLength} />
          
          {autoFocus && <AutoFocusPlugin />}
          
          <HistoryPlugin />
          
          {enableRichText && (
            <>
              <LinkPlugin />
              <ListPlugin />
            </>
          )}
          
          {enableMarkdown && enableRichText && (
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          )}
          
          <AutoSavePlugin 
            autoSave={autoSave}
            onAutoSave={onAutoSave}
          />
          
          <CharacterCountPlugin 
            maxLength={maxLength}
            onCharCountChange={setCharCount}
          />
        </div>

        {maxLength && (
          <div className="editor-footer">
            <div className="editor-stats">
              <span className={charCount > maxLength * 0.9 ? 'warning' : ''}>
                {charCount}/{maxLength} characters
              </span>
            </div>
            
            {enableMarkdown && (
              <div className="editor-tips">
                <span className="tip">
                  💡 Supports Markdown: **bold**, *italic*, # headings, - lists
                </span>
              </div>
            )}
          </div>
        )}
      </LexicalComposer>

      <style jsx>{`
        .violet-lexical-editor {
          width: 100%;
          direction: ltr;
          text-align: left;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .lexical-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          flex-wrap: wrap;
        }

        .lexical-toolbar.simple {
          padding: 8px 12px;
        }

        .toolbar-group {
          display: flex;
          gap: 4px;
        }

        .toolbar-separator {
          width: 1px;
          height: 24px;
          background: #ddd;
          margin: 0 4px;
        }

        .toolbar-btn {
          padding: 6px 10px;
          border: 1px solid transparent;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
          min-width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toolbar-btn:hover {
          background: rgba(0, 115, 170, 0.1);
          border-color: #0073aa;
        }

        .toolbar-btn:active {
          background: #0073aa;
          color: white;
        }

        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .editor-container {
          position: relative;
          border: 1px solid #ddd;
          border-radius: 0 0 8px 8px;
          background: white;
        }

        .violet-lexical-editor :global(.violet-lexical-content-editable) {
          padding: 15px;
          font-size: 16px;
          line-height: 1.6;
          outline: none;
          direction: ltr !important;
          text-align: left !important;
        }

        .violet-lexical-editor :global(.violet-lexical-content-editable:focus) {
          box-shadow: 0 0 0 2px rgba(0, 115, 170, 0.2);
        }

        .violet-lexical-editor :global(.violet-lexical-placeholder) {
          position: absolute;
          top: 15px;
          left: 15px;
          color: #999;
          pointer-events: none;
          font-size: 16px;
          direction: ltr;
          text-align: left;
        }

        .violet-lexical-editor :global(.violet-lexical-paragraph) {
          margin: 0 0 8px 0;
        }

        .violet-lexical-editor :global(.violet-lexical-h1) {
          font-size: 28px;
          font-weight: 700;
          margin: 16px 0 12px 0;
          line-height: 1.2;
        }

        .violet-lexical-editor :global(.violet-lexical-h2) {
          font-size: 24px;
          font-weight: 600;
          margin: 14px 0 10px 0;
          line-height: 1.3;
        }

        .violet-lexical-editor :global(.violet-lexical-h3) {
          font-size: 20px;
          font-weight: 600;
          margin: 12px 0 8px 0;
          line-height: 1.4;
        }

        .violet-lexical-editor :global(.violet-lexical-text-bold) {
          font-weight: 700;
        }

        .violet-lexical-editor :global(.violet-lexical-text-italic) {
          font-style: italic;
        }

        .violet-lexical-editor :global(.violet-lexical-text-underline) {
          text-decoration: underline;
        }

        .violet-lexical-editor :global(.violet-lexical-text-strikethrough) {
          text-decoration: line-through;
        }

        .violet-lexical-editor :global(.violet-lexical-text-code) {
          background: #f1f3f4;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 14px;
        }

        .violet-lexical-editor :global(.violet-lexical-link) {
          color: #0073aa;
          text-decoration: underline;
        }

        .violet-lexical-editor :global(.violet-lexical-link:hover) {
          color: #005a87;
        }

        .violet-lexical-editor :global(.violet-lexical-list-ul),
        .violet-lexical-editor :global(.violet-lexical-list-ol) {
          margin: 8px 0;
          padding-left: 24px;
        }

        .violet-lexical-editor :global(.violet-lexical-listitem) {
          margin: 4px 0;
        }

        .violet-lexical-editor :global(.violet-lexical-quote) {
          border-left: 4px solid #0073aa;
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          color: #555;
        }

        .violet-lexical-editor :global(.violet-lexical-code) {
          background: #f8f9fa;
          border: 1px solid #e1e1e1;
          border-radius: 6px;
          padding: 12px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          margin: 12px 0;
          overflow-x: auto;
        }

        .editor-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 8px 8px;
          font-size: 12px;
          color: #666;
        }

        .editor-stats .warning {
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
          .lexical-toolbar {
            background: #2d2d2d;
            border-color: #555;
          }

          .toolbar-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: #777;
          }

          .toolbar-separator {
            background: #555;
          }

          .editor-container {
            border-color: #555;
            background: #1a1a1a;
          }

          .violet-lexical-editor :global(.violet-lexical-content-editable) {
            color: #e0e0e0;
          }

          .violet-lexical-editor :global(.violet-lexical-placeholder) {
            color: #888;
          }

          .editor-footer {
            background: #2d2d2d;
            border-color: #555;
            color: #ccc;
          }

          .violet-lexical-editor :global(.violet-lexical-text-code) {
            background: #333;
            color: #e0e0e0;
          }

          .violet-lexical-editor :global(.violet-lexical-code) {
            background: #2d2d2d;
            border-color: #555;
            color: #e0e0e0;
          }

          .violet-lexical-editor :global(.violet-lexical-quote) {
            border-left-color: #0073aa;
            color: #ccc;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .lexical-toolbar {
            padding: 8px;
            gap: 4px;
          }

          .toolbar-btn {
            min-width: 28px;
            height: 28px;
            font-size: 12px;
            padding: 4px 6px;
          }

          .violet-lexical-editor :global(.violet-lexical-content-editable) {
            padding: 12px;
            font-size: 16px;
          }

          .violet-lexical-editor :global(.violet-lexical-placeholder) {
            top: 12px;
            left: 12px;
          }

          .editor-footer {
            flex-direction: column;
            gap: 6px;
            align-items: flex-start;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .lexical-toolbar,
          .editor-container {
            border-width: 2px;
            border-color: #000;
          }

          .violet-lexical-editor :global(.violet-lexical-content-editable:focus) {
            box-shadow: 0 0 0 3px #0073aa;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .toolbar-btn {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default VioletLexicalEditor;
