import React, { useState, useEffect, useRef, useCallback } from 'react';
import './WordPressEditor.css';
import EditorToolbar from './EditorToolbar';
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

interface ChangeEntry {
  fieldType: string;
  element: HTMLElement;
  originalValue: string;
  currentValue: string;
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
  const [pendingChanges, setPendingChanges] = useState<Map<string, ChangeEntry>>(new Map());
  
  const toolbarRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for custom events from App.tsx
  useEffect(() => {
    const handleEnableEditing = () => enableEditMode();
    const handleDisableEditing = () => disableEditMode();
    const handlePrepareSave = (event: any) => handleSavePreparation(event.detail);
    const handleApplyChanges = (event: any) => handleApplySavedChanges(event.detail);

    window.addEventListener('violet-enable-editing', handleEnableEditing);
    window.addEventListener('violet-disable-editing', handleDisableEditing);
    window.addEventListener('violet-prepare-save', handlePrepareSave);
    window.addEventListener('violet-apply-changes', handleApplyChanges);

    return () => {
      window.removeEventListener('violet-enable-editing', handleEnableEditing);
      window.removeEventListener('violet-disable-editing', handleDisableEditing);
      window.removeEventListener('violet-prepare-save', handlePrepareSave);
      window.removeEventListener('violet-apply-changes', handleApplyChanges);
    };
  }, []);

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
      } else if (type === 'violet-persist-content-changes') {
        handleContentPersistence(event.data);
      } else if (type === 'violet-refresh-content') {
        handleContentRefresh(event.data);
      } else if (type === 'violet-apply-saved-changes') {
        handleApplySavedChanges(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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
    setPendingChanges(new Map());
    
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
        // Since saves happen in WordPress, just notify
        console.log('💡 Please save using the WordPress admin toolbar before disabling edit mode');
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

  // CRITICAL: Handle save preparation from WordPress
  const handleSavePreparation = (data: any) => {
    console.log('💾 Preparing all changes for WordPress save...');
    setEditorState(prev => ({ ...prev, isSaving: true }));
    
    // Collect all changes
    const allChanges: any[] = [];
    pendingChanges.forEach((change, fieldType) => {
      allChanges.push({
        field_name: fieldType,
        field_value: change.currentValue
      });
    });

    console.log('📊 Collected changes for save:', allChanges);

    // Report back to WordPress that we're ready
    wordPressCommunication.sendToWordPress({
      type: 'violet-triple-failsafe-ready',
      data: {
        savedCount: allChanges.length,
        changes: allChanges,
        timestamp: Date.now()
      }
    });
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
    const element = event.target as RichEditableElement;
    const fieldType = element.dataset.violetFieldType || 'generic_content';
    const originalValue = element.dataset.violetOriginal || '';
    const currentValue = element.innerHTML;

    // Track the change
    const changeEntry: ChangeEntry = {
      fieldType,
      element,
      originalValue,
      currentValue,
      timestamp: Date.now()
    };

    setPendingChanges(prev => {
      const updated = new Map(prev);
      updated.set(fieldType, changeEntry);
      return updated;
    });

    markElementAsChanged(element);
    setEditorState(prev => ({ ...prev, hasUnsavedChanges: true }));

    // Report change to WordPress
    wordPressCommunication.reportContentChange(fieldType, currentValue);

    console.log('📝 Content changed:', fieldType, currentValue.substring(0, 50) + '...');
  };

  const markElementAsChanged = (element: HTMLElement) => {
    setChangedElements(prev => new Set(prev).add(element));
    element.style.backgroundColor = '#fff3cd';
    element.style.borderLeft = '4px solid #f39c12';
    element.style.paddingLeft = '8px';
  };

  const handleApplySavedChanges = (data: any) => {
    console.log('✅ Applying saved changes from WordPress:', data);
    setEditorState(prev => ({ ...prev, isSaving: false, hasUnsavedChanges: false }));
    
    // Clear change tracking
    setPendingChanges(new Map());
    setChangedElements(new Set());
    
    // Remove visual change indicators
    document.querySelectorAll('[data-violet-editable]').forEach((element) => {
      const el = element as HTMLElement;
      el.style.backgroundColor = '';
      el.style.borderLeft = '';
      el.style.paddingLeft = '';
    });

    if (data.savedChanges) {
      data.savedChanges.forEach((change: any) => {
        // Find elements matching this field type and update them
        document.querySelectorAll(`[data-violet-field-type="${change.field_name}"]`).forEach((element) => {
          const el = element as RichEditableElement;
          el.innerHTML = change.field_value;
          el.dataset.violetOriginal = change.field_value;
        });
      });
    }

    console.log('🎉 All changes applied successfully');
  };

  const handleSaveResponse = (data: any) => {
    if (data.success) {
      console.log('✅ Save successful');
    } else {
      console.error('❌ Save failed:', data.error);
    }
    setEditorState(prev => ({ ...prev, isSaving: false }));
  };

  const handleContentPersistence = (data: any) => {
    console.log('💾 Persisting content changes');
    // Handle content persistence if needed
  };

  const handleContentRefresh = (data: any) => {
    console.log('🔄 Refreshing content');
    // Handle content refresh if needed
  };

  const detectFieldType = (element: HTMLElement): string => {
    const tag = element.tagName.toLowerCase();
    const text = element.textContent?.toLowerCase() || '';
    const classes = element.className.toLowerCase();
    const id = element.id.toLowerCase();

    // Enhanced field type detection
    if (tag === 'h1' || classes.includes('hero-title') || classes.includes('main-title')) {
      return 'hero_title';
    }
    if (tag === 'h2' && (classes.includes('hero') || classes.includes('subtitle'))) {
      return 'hero_subtitle';
    }
    if ((tag === 'a' || tag === 'button') && (text.includes('contact') || text.includes('get started') || classes.includes('cta'))) {
      return 'hero_cta';
    }
    if (text.includes('@') && text.includes('.')) {
      return 'contact_email';
    }
    if (text.match(/[\d\s\(\)\-\+]{7,}/)) {
      return 'contact_phone';
    }
    if (tag.startsWith('h')) {
      return `heading_${tag}`;
    }
    if (tag === 'p') {
      return 'paragraph_content';
    }
    
    return `${tag}_content`;
  };

  const showEditModeIndicator = () => {
    const indicator = document.createElement('div');
    indicator.id = 'violet-edit-mode-indicator';
    indicator.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #0073aa;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-size: 14px;
      ">
        ✏️ Edit Mode Active - Changes: ${pendingChanges.size}
      </div>
    `;
    document.body.appendChild(indicator);
  };

  const hideEditModeIndicator = () => {
    const indicator = document.getElementById('violet-edit-mode-indicator');
    if (indicator) {
      indicator.remove();
    }
  };

  const handleKeyboardShortcuts = (event: KeyboardEvent) => {
    // Handle any additional keyboard shortcuts
  };

  // Update edit mode indicator when changes occur
  useEffect(() => {
    const indicator = document.getElementById('violet-edit-mode-indicator');
    if (indicator && editorState.isEditMode) {
      indicator.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${pendingChanges.size > 0 ? '#f39c12' : '#0073aa'};
          color: white;
          padding: 12px 20px;
          border-radius: 6px;
          z-index: 10000;
          font-weight: bold;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          font-size: 14px;
        ">
          ✏️ Edit Mode Active - Changes: ${pendingChanges.size}
          ${editorState.isSaving ? ' - Saving...' : ''}
        </div>
      `;
    }
  }, [pendingChanges.size, editorState.isEditMode, editorState.isSaving]);

  // Don't render anything visible - this component just handles editing behavior
  return (
    <>
      {editorState.showToolbar && (
        <div
          ref={toolbarRef}
          style={{
            position: 'absolute',
            top: editorState.toolbarPosition.top,
            left: editorState.toolbarPosition.left,
            zIndex: 10000,
            transform: 'translateX(-50%)'
          }}
        >
          <EditorToolbar
            onBold={() => document.execCommand('bold')}
            onItalic={() => document.execCommand('italic')}
            onUnderline={() => document.execCommand('underline')}
            selectedText={editorState.selectedText}
          />
        </div>
      )}
    </>
  );
};

export default WordPressRichEditor;
