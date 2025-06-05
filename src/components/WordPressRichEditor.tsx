import React, { useState, useEffect, useRef, useCallback } from 'react';
import './WordPressEditor.css';
import EditorToolbar from './EditorToolbar';

interface RichEditableElement extends HTMLElement {
  dataset: DOMStringMap & {
    violetEditable?: string;
    violetOriginal?: string;
  };
}

interface EditorState {
  isEditMode: boolean;
  currentElement: HTMLElement | null;
  selection: Selection | null;
  showToolbar: boolean;
  toolbarPosition: { top: number; left: number };
  selectedText: string;
}

const WordPressRichEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>({
    isEditMode: false,
    currentElement: null,
    selection: null,
    showToolbar: false,
    toolbarPosition: { top: 0, left: 0 },
    selectedText: ''
  });

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Enable/disable edit mode based on messages from WordPress
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type } = event.data;
      
      if (type === 'violet-enable-editing') {
        enableEditMode();
      } else if (type === 'violet-disable-editing') {
        disableEditMode();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const enableEditMode = () => {
    console.log('🎨 Enabling rich text editing mode');
    setEditorState(prev => ({ ...prev, isEditMode: true }));
    
    // Make elements editable
    const editableSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'li', 'td', 'th'];
    
    editableSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach((element) => {
        const el = element as RichEditableElement;
        const text = el.textContent?.trim();
        
        if (text && text.length > 0 && !el.querySelector('img, svg, iframe')) {
          el.dataset.violetEditable = 'true';
          el.dataset.violetOriginal = el.innerHTML;
          el.contentEditable = 'true';
          el.style.outline = '2px dashed #0073aa';
          el.style.outlineOffset = '2px';
          el.style.cursor = 'text';
          
          // Add event listeners
          el.addEventListener('focus', handleElementFocus);
          el.addEventListener('blur', handleElementBlur);
          el.addEventListener('mouseup', handleTextSelection);
          el.addEventListener('keyup', handleTextSelection);
          el.addEventListener('input', handleContentChange);
        }
      });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
  };

  const disableEditMode = () => {
    console.log('🔒 Disabling rich text editing mode');
    setEditorState(prev => ({ ...prev, isEditMode: false, showToolbar: false }));
    
    document.querySelectorAll('[data-violet-editable]').forEach((element) => {
      const el = element as RichEditableElement;
      el.contentEditable = 'false';
      el.style.outline = '';
      el.style.cursor = '';
      el.removeEventListener('focus', handleElementFocus);
      el.removeEventListener('blur', handleElementBlur);
      el.removeEventListener('mouseup', handleTextSelection);
      el.removeEventListener('keyup', handleTextSelection);
      el.removeEventListener('input', handleContentChange);
    });

    document.removeEventListener('keydown', handleKeyboardShortcuts);
  };

  const handleElementFocus = (event: Event) => {
    const element = event.target as HTMLElement;
    setEditorState(prev => ({ ...prev, currentElement: element }));
  };

  const handleElementBlur = (event: Event) => {
    // Keep toolbar visible when clicking on it
    setTimeout(() => {
      if (!toolbarRef.current?.contains(document.activeElement)) {
        setEditorState(prev => ({ ...prev, showToolbar: false }));
      }
    }, 200);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setEditorState(prev => ({
        ...prev,
        selection,
        selectedText: selection.toString(),
        showToolbar: true,
        toolbarPosition: {
          top: rect.top - 60 + window.scrollY,
          left: rect.left + (rect.width / 2) + window.scrollX
        }
      }));
    }
  };

  const handleContentChange = (event: Event) => {
    const element = event.target as HTMLElement;
    const fieldType = detectFieldType(element);
    
    // Send update to WordPress
    if (window.parent !== window.self) {
      window.parent.postMessage({
        type: 'violet-save-content',
        data: {
          fieldType,
          value: element.innerHTML,
          text: element.textContent,
          id: `change-${Date.now()}`
        }
      }, '*');
    }
  };

  const handleKeyboardShortcuts = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'b':
          event.preventDefault();
          document.execCommand('bold');
          break;
        case 'i':
          event.preventDefault();
          document.execCommand('italic');
          break;
        case 'u':
          event.preventDefault();
          document.execCommand('underline');
          break;
        case 'z':
          if (event.shiftKey) {
            event.preventDefault();
            document.execCommand('redo');
          } else {
            event.preventDefault();
            document.execCommand('undo');
          }
          break;
        case 'y':
          event.preventDefault();
          document.execCommand('redo');
          break;
      }
    }
  };

  const handleStyleChange = useCallback((property: string, value: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      if (property === 'createLink') {
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          document.execCommand('createLink', false, url);
        }
      } else if (property === 'fontSize') {
        // Wrap selection in span with font-size
        const span = document.createElement('span');
        span.style.fontSize = value;
        range.surroundContents(span);
      } else if (property === 'fontFamily') {
        // Wrap selection in span with font-family
        const span = document.createElement('span');
        span.style.fontFamily = value;
        range.surroundContents(span);
      } else if (property === 'color') {
        document.execCommand('foreColor', false, value);
      } else if (property === 'backgroundColor') {
        document.execCommand('hiliteColor', false, value);
      } else if (property.startsWith('justify')) {
        document.execCommand(property);
      } else {
        // For other commands like bold, italic, etc.
        document.execCommand(property);
      }
      
      // Trigger save
      if (editorState.currentElement) {
        handleContentChange({ target: editorState.currentElement } as any);
      }
    }
  }, [editorState.currentElement]);

  const detectFieldType = (element: HTMLElement): string => {
    const text = element.textContent?.toLowerCase() || '';
    const tag = element.tagName.toLowerCase();
    const classes = element.className?.toLowerCase() || '';
    
    if (tag === 'h1' || classes.includes('hero')) return 'hero_title';
    if (text.includes('transform') || text.includes('potential')) return 'hero_subtitle';
    if (tag === 'button' || (tag === 'a' && classes.includes('button'))) return 'hero_cta';
    if (text.includes('@')) return 'contact_email';
    if (text.match(/[\d\s\(\)\-\+]{7,}/)) return 'contact_phone';
    
    return 'generic_content';
  };

  // Notify WordPress that we're ready
  useEffect(() => {
    if (window.parent !== window.self) {
      window.parent.postMessage({
        type: 'violet-iframe-ready',
        enhanced: true,
        features: ['rich-text', 'formatting', 'colors', 'fonts', 'alignment']
      }, '*');
    }
  }, []);

  return (
    <>
      {editorState.showToolbar && (
        <EditorToolbar
          ref={toolbarRef}
          position={editorState.toolbarPosition}
          onStyleChange={handleStyleChange}
          selectedText={editorState.selectedText}
        />
      )}
    </>
  );
};

export default WordPressRichEditor;