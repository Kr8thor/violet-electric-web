import React, { useState, useEffect, useRef, useCallback } from 'react';
import './WordPressEditor.css';
import EditorToolbar from './EditorToolbar';

interface RichEditableElement extends HTMLElement {
  dataset: DOMStringMap & {
    violetEditable?: string;
    violetOriginal?: string;
    violetFieldType?: string;
  };
}

interface EditorState {
  isEditMode: boolean;
  currentElement: HTMLElement | null;
  selection: Selection | null;
  showToolbar: boolean;
  toolbarPosition: { top: number; left: number };
  selectedText: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

interface HistoryEntry {
  element: HTMLElement;
  content: string;
  fieldType: string;
  timestamp: number;
}

const WordPressRichEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>({
    isEditMode: false,
    currentElement: null,
    selection: null,
    showToolbar: false,
    toolbarPosition: { top: 0, left: 0 },
    selectedText: '',
    hasUnsavedChanges: false,
    isSaving: false
  });

  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);
  const [changedElements, setChangedElements] = useState<Set<HTMLElement>>(new Set());
  
  const toolbarRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enable/disable edit mode based on messages from WordPress
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type } = event.data;
      
      if (type === 'violet-enable-editing') {
        enableEditMode();
      } else if (type === 'violet-disable-editing') {
        disableEditMode();
      } else if (type === 'violet-save-response') {
        handleSaveResponse(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Keyboard shortcuts for save and undo/redo
  useEffect(() => {
    const handleGlobalKeyboard = (event: KeyboardEvent) => {
      if (!editorState.isEditMode) return;

      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 's':
            event.preventDefault();
            saveAllChanges();
            break;
          case 'z':
            event.preventDefault();
            if (event.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            event.preventDefault();
            redo();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyboard);
    return () => document.removeEventListener('keydown', handleGlobalKeyboard);
  }, [editorState.isEditMode, undoStack, redoStack]);

  const enableEditMode = () => {
    console.log('🎨 Enabling rich text editing mode');
    setEditorState(prev => ({ ...prev, isEditMode: true }));
    setUndoStack([]);
    setRedoStack([]);
    setChangedElements(new Set());
    
    // Make elements editable
    const editableSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'li', 'td', 'th'];
    
    editableSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach((element) => {
        const el = element as RichEditableElement;
        const text = el.textContent?.trim();
        
        if (text && text.length > 0 && !el.querySelector('img, svg, iframe')) {
          el.dataset.violetEditable = 'true';
          el.dataset.violetOriginal = el.innerHTML;
          el.dataset.violetFieldType = detectFieldType(el);
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
          el.addEventListener('beforeinput', handleBeforeInput);
        }
      });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Show edit mode indicator
    showEditModeIndicator();
  };

  const disableEditMode = () => {
    console.log('🔒 Disabling rich text editing mode');
    
    // Check for unsaved changes
    if (editorState.hasUnsavedChanges) {
      const confirmSave = window.confirm('You have unsaved changes. Do you want to save them before exiting edit mode?');
      if (confirmSave) {
        saveAllChanges();
      }
    }
    
    setEditorState(prev => ({ ...prev, isEditMode: false, showToolbar: false, hasUnsavedChanges: false }));
    
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
      el.removeEventListener('beforeinput', handleBeforeInput);
    });

    document.removeEventListener('keydown', handleKeyboardShortcuts);
    hideEditModeIndicator();
  };

  const handleBeforeInput = (event: Event) => {
    const element = event.target as RichEditableElement;
    
    // Save state before change for undo
    addToUndoStack(element);
  };

  const addToUndoStack = (element: RichEditableElement) => {
    const entry: HistoryEntry = {
      element,
      content: element.innerHTML,
      fieldType: element.dataset.violetFieldType || 'generic_content',
      timestamp: Date.now()
    };
    
    setUndoStack(prev => [...prev, entry]);
    setRedoStack([]); // Clear redo stack on new change
    
    // Limit undo stack size
    if (undoStack.length > 50) {
      setUndoStack(prev => prev.slice(-50));
    }
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    
    const lastEntry = undoStack[undoStack.length - 1];
    const currentContent = lastEntry.element.innerHTML;
    
    // Save current state to redo stack
    setRedoStack(prev => [...prev, {
      element: lastEntry.element,
      content: currentContent,
      fieldType: lastEntry.fieldType,
      timestamp: Date.now()
    }]);
    
    // Restore previous state
    lastEntry.element.innerHTML = lastEntry.content;
    
    // Remove from undo stack
    setUndoStack(prev => prev.slice(0, -1));
    
    // Mark as changed
    markElementAsChanged(lastEntry.element);
    
    console.log('↩️ Undo performed');
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const lastEntry = redoStack[redoStack.length - 1];
    
    // Save current state to undo stack
    addToUndoStack(lastEntry.element as RichEditableElement);
    
    // Restore redo state
    lastEntry.element.innerHTML = lastEntry.content;
    
    // Remove from redo stack
    setRedoStack(prev => prev.slice(0, -1));
    
    // Mark as changed
    markElementAsChanged(lastEntry.element);
    
    console.log('↪️ Redo performed');
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
    markElementAsChanged(element);
    
    // Clear existing auto-save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new auto-save timeout (3 seconds)
    saveTimeoutRef.current = setTimeout(() => {
      saveAllChanges();
    }, 3000);
  };

  const markElementAsChanged = (element: HTMLElement) => {
    setChangedElements(prev => new Set(prev).add(element));
    setEditorState(prev => ({ ...prev, hasUnsavedChanges: true }));
    
    // Add visual indicator
    element.style.borderLeft = '4px solid #f0ad4e';
  };

  const saveAllChanges = async () => {
    if (changedElements.size === 0) {
      console.log('📝 No changes to save');
      return;
    }
    
    console.log(`💾 Saving ${changedElements.size} changed elements...`);
    setEditorState(prev => ({ ...prev, isSaving: true }));
    
    // Show saving indicator
    showSavingIndicator();
    
    const savePromises = Array.from(changedElements).map(element => {
      const fieldType = detectFieldType(element);
      
      return new Promise((resolve) => {
        if (window.parent !== window.self) {
          window.parent.postMessage({
            type: 'violet-save-content',
            data: {
              fieldType,
              value: element.innerHTML,
              text: element.textContent,
              html: element.innerHTML,
              id: `save-${Date.now()}-${Math.random()}`
            }
          }, '*');
        }
        
        // Assume success after timeout (real response handled by handleSaveResponse)
        setTimeout(resolve, 500);
      });
    });
    
    await Promise.all(savePromises);
    
    // Clear changed indicators
    changedElements.forEach(element => {
      element.style.borderLeft = '';
    });
    
    setChangedElements(new Set());
    setEditorState(prev => ({ 
      ...prev, 
      hasUnsavedChanges: false,
      isSaving: false 
    }));
    
    hideSavingIndicator();
    showSaveSuccessIndicator();
  };

  const handleSaveResponse = (data: any) => {
    if (data.success) {
      console.log('✅ Content saved successfully');
    } else {
      console.error('❌ Save failed:', data.error);
      showSaveErrorIndicator();
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
      }
    }
  };

  const handleStyleChange = useCallback((property: string, value: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Save state for undo before making changes
      if (editorState.currentElement) {
        addToUndoStack(editorState.currentElement as RichEditableElement);
      }
      
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
      
      // Mark as changed
      if (editorState.currentElement) {
        markElementAsChanged(editorState.currentElement);
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

  // Visual indicators
  const showEditModeIndicator = () => {
    const indicator = document.createElement('div');
    indicator.id = 'violet-edit-mode-indicator';
    indicator.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: #0073aa; color: white; padding: 12px 20px; border-radius: 8px; display: flex; align-items: center; gap: 10px; z-index: 999999; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
        <span>✏️ Edit Mode</span>
        <button onclick="document.getElementById('violet-save-button').click()" style="background: white; color: #0073aa; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">Save (Ctrl+S)</button>
        <span style="opacity: 0.7; font-size: 12px;">Undo: Ctrl+Z | Redo: Ctrl+Y</span>
      </div>
      <button id="violet-save-button" style="display: none;"></button>
    `;
    document.body.appendChild(indicator);
    
    // Add save button handler
    const saveButton = document.getElementById('violet-save-button');
    if (saveButton) {
      saveButton.addEventListener('click', saveAllChanges);
    }
  };

  const hideEditModeIndicator = () => {
    const indicator = document.getElementById('violet-edit-mode-indicator');
    if (indicator) indicator.remove();
  };

  const showSavingIndicator = () => {
    const indicator = document.createElement('div');
    indicator.id = 'violet-saving-indicator';
    indicator.innerHTML = `
      <div style="position: fixed; bottom: 20px; right: 20px; background: #f0ad4e; color: white; padding: 12px 20px; border-radius: 8px; z-index: 999999; box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 10px;">
        <div class="violet-spinner"></div>
        <span>Saving changes...</span>
      </div>
    `;
    document.body.appendChild(indicator);
  };

  const hideSavingIndicator = () => {
    const indicator = document.getElementById('violet-saving-indicator');
    if (indicator) indicator.remove();
  };

  const showSaveSuccessIndicator = () => {
    const indicator = document.createElement('div');
    indicator.id = 'violet-success-indicator';
    indicator.innerHTML = `
      <div style="position: fixed; bottom: 20px; right: 20px; background: #5cb85c; color: white; padding: 12px 20px; border-radius: 8px; z-index: 999999; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
        ✅ All changes saved!
      </div>
    `;
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      const successIndicator = document.getElementById('violet-success-indicator');
      if (successIndicator) successIndicator.remove();
    }, 3000);
  };

  const showSaveErrorIndicator = () => {
    const indicator = document.createElement('div');
    indicator.id = 'violet-error-indicator';
    indicator.innerHTML = `
      <div style="position: fixed; bottom: 20px; right: 20px; background: #d9534f; color: white; padding: 12px 20px; border-radius: 8px; z-index: 999999; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
        ❌ Save failed. Please try again.
      </div>
    `;
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      const errorIndicator = document.getElementById('violet-error-indicator');
      if (errorIndicator) errorIndicator.remove();
    }, 5000);
  };

  // Notify WordPress that we're ready
  useEffect(() => {
    if (window.parent !== window.self) {
      window.parent.postMessage({
        type: 'violet-iframe-ready',
        enhanced: true,
        features: ['rich-text', 'formatting', 'colors', 'fonts', 'alignment', 'save', 'undo', 'redo']
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
      
      {/* Inline CSS for spinner */}
      <style>{`
        .violet-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: violet-spin 0.8s linear infinite;
        }
        
        @keyframes violet-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default WordPressRichEditor;