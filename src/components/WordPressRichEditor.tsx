import React, { useState, useEffect, useRef, useCallback } from 'react';
import './WordPressEditor.css';
import EditorToolbar from './EditorToolbar';
import { WP_JWT_TOKEN } from '../utils/wpJwtToken';
import { saveToWordPressAPI, elementToSaveChange, testWordPressAPI } from '../utils/directWordPressSave';
import { wordPressCommunication } from '../utils/WordPressCommunication';

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
        console.log('🟢 Enabling rich text editing mode');
        enableEditMode();
        // Notify WordPress that editing is enabled
        wordPressCommunication.sendToWordPress({
          type: 'violet-editing-enabled',
          data: { timestamp: Date.now() }
        });
      } else if (type === 'violet-disable-editing') {
        console.log('🔴 Disabling rich text editing mode');
        disableEditMode();
        // Notify WordPress that editing is disabled
        wordPressCommunication.sendToWordPress({
          type: 'violet-editing-disabled',
          data: { timestamp: Date.now() }
        });
      } else if (type === 'violet-save-response') {
        handleSaveResponse(event.data);
      } else if (type === 'violet-test-api') {
        // Test API connection when requested
        testWordPressAPI().then(result => {
          console.log('🧪 API Test Result:', result);
          if (window.parent !== window.self) {
            window.parent.postMessage({
              type: 'violet-api-test-result',
              data: result
            }, '*');
          }
        });
      } else if (type === 'violet-open-rich-text-modal') {
        console.log('📝 Rich text modal requested for field:', event.data.field);
        // Handle rich text modal opening
        handleRichTextModalRequest(event.data);
      }
    };

    // Listen for WordPress messages
    window.addEventListener('message', handleMessage);
    
    // Also listen for enhanced communication events
    const handleWordPressEvent = (event: CustomEvent) => {
      handleMessage({ data: { type: event.detail.type, ...event.detail.data } } as MessageEvent);
    };
    
    window.addEventListener('wordpress-message', handleWordPressEvent as EventListener);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('wordpress-message', handleWordPressEvent as EventListener);
    };
  }, []);

  // Test API connection on component mount
  useEffect(() => {
    console.log('🔌 Testing WordPress API connection on mount...');
    testWordPressAPI().then(result => {
      if (result.success) {
        console.log('✅ WordPress API connected successfully:', result.data);
      } else {
        console.warn('⚠️ WordPress API connection failed:', result.message);
      }
    });
  }, []);

  // Keyboard shortcuts for undo/redo only (no save)
  useEffect(() => {
    const handleGlobalKeyboard = (event: KeyboardEvent) => {
      if (!editorState.isEditMode) return;

      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 's':
            // Prevent default save behavior - saves happen from WordPress admin only
            event.preventDefault();
            console.log('💡 Save using the WordPress admin toolbar');
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
    
    try {
      // Convert changed elements to save format
      const changes = Array.from(changedElements).map(element => elementToSaveChange(element));
      
      // Save directly to WordPress API using JWT
      const result = await saveToWordPressAPI(changes);
      
      if (result.success) {
        console.log('✅ Content saved successfully to WordPress API');
        
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
        
        // Also notify parent window for backwards compatibility
        if (window.parent !== window.self) {
          window.parent.postMessage({
            type: 'violet-content-saved',
            data: { success: true, changes: changes }
          }, '*');
        }
        
      } else {
        console.error('❌ Save failed:', result.message);
        setEditorState(prev => ({ ...prev, isSaving: false }));
        hideSavingIndicator();
        showSaveErrorIndicator();
      }
      
    } catch (error) {
      console.error('❌ Save error:', error);
      setEditorState(prev => ({ ...prev, isSaving: false }));
      hideSavingIndicator();
      showSaveErrorIndicator();
    }
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
    // Remove the save bar completely - saves should only happen from WordPress admin
    console.log('✏️ Edit mode active - save controls are in WordPress admin only');
  };

  const hideEditModeIndicator = () => {
    // Nothing to remove since we're not showing any save bars on React side
    console.log('🔒 Edit mode disabled');
  };

  const showSavingIndicator = () => {
    console.log('💾 Saving changes...');
    // Floating indicator removed - save only via WordPress admin toolbar
  };

  const hideSavingIndicator = () => {
    console.log('💾 Save process completed');
    // Floating indicator removed - save only via WordPress admin toolbar
  };

  const showSaveSuccessIndicator = () => {
    console.log('✅ All changes saved successfully!');
    // Floating indicator removed - save only via WordPress admin toolbar
  };

  const showSaveErrorIndicator = () => {
    console.log('❌ Save failed. Please try again.');
    // Floating indicator removed - save only via WordPress admin toolbar
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

  // Add robust message handler for save and rebuild
  useEffect(() => {
    async function handleSaveContent() {
      // Gather all editable content
      const editableElements = document.querySelectorAll('[data-violet-editable]');
      const changes = Array.from(editableElements).map((el) => {
        const element = el as HTMLElement;
        return {
          field_name: element.dataset.violetFieldType || 'generic_content',
          content: element.innerHTML,
          format: 'rich',
          editor: 'rich',
        };
      });
      try {
        console.log('[VIOLET] Attempting to save content:', changes);
        const res = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/rich-content/save-batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${WP_JWT_TOKEN}`
          },
          body: JSON.stringify({ changes })
        });
        const data = await res.json();
        console.log('[VIOLET] Save API response:', data);
        if (data.success) {
          window.parent.postMessage({ type: 'violet-content-saved', success: true, details: data }, '*');
          return true;
        } else {
          window.parent.postMessage({ type: 'violet-content-saved', success: false, error: data.message || 'Save failed', details: data }, '*');
          alert('[VIOLET] Save failed: ' + (data.message || 'Unknown error'));
          return false;
        }
      } catch (err) {
        console.error('[VIOLET] Save error:', err);
        window.parent.postMessage({ type: 'violet-content-saved', success: false, error: err?.message || 'Save error', details: err }, '*');
        alert('[VIOLET] Save error: ' + (err?.message || err));
        return false;
      }
    }

    async function handleRebuildSite() {
      const saved = await handleSaveContent();
      if (!saved) {
        window.parent.postMessage({ type: 'violet-content-live', success: false, error: 'Save failed, rebuild aborted' }, '*');
        return;
      }
      // Trigger Netlify rebuild via AJAX endpoint
      try {
        const nonce = (window as any).VioletRichTextConfig?.nonce || '';
        const formData = new FormData();
        formData.append('action', 'violet_trigger_rebuild');
        formData.append('nonce', nonce);
        const res = await fetch('/wp-admin/admin-ajax.php', {
          method: 'POST',
          credentials: 'same-origin',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          window.parent.postMessage({ type: 'violet-content-live', success: true, details: data }, '*');
        } else {
          window.parent.postMessage({ type: 'violet-content-live', success: false, error: data.data?.message || 'Rebuild failed' }, '*');
        }
      } catch (err) {
        window.parent.postMessage({ type: 'violet-content-live', success: false, error: err?.message || 'Rebuild error' }, '*');
      }
    }

    function onMessage(event: MessageEvent) {
      console.log('[VIOLET] Received message:', event.data);
      if (!event.data || typeof event.data.type !== 'string') return;
      switch (event.data.type) {
        case 'violet-save-content':
          handleSaveContent();
          break;
        case 'violet-trigger-rebuild':
          handleRebuildSite();
          break;
        case 'violet-open-rich-text-modal':
          console.log('📝 Rich text modal requested:', event.data);
          // Acknowledge the request
          wordPressCommunication.sendToWordPress({
            type: 'violet-rich-text-modal-acknowledged',
            data: {
              field: event.data.field || 'unknown',
              status: 'communication-working',
              message: 'Rich text modal communication established',
              timestamp: Date.now()
            }
          });
          break;
        default:
          break;
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
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