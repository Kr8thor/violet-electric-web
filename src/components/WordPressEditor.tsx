import React, { useEffect, useState, useRef, useCallback } from 'react';
import { saveContent, getAllContent, getAllContentSync } from '@/utils/contentStorage';

interface EditableElement {
  element: HTMLElement;
  originalContent: string;
  fieldType: string;
}

interface SaveRequest {
  id: string;
  fieldType: string;
  value: string;
  element: string;
  timestamp: number;
}

const WordPressEditor: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableElements, setEditableElements] = useState<Map<HTMLElement, EditableElement>>(new Map());
  const [currentlyEditing, setCurrentlyEditing] = useState<HTMLElement | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaves = useRef<Map<string, SaveRequest>>(new Map());

  // Detect if we're in WordPress iframe
  const isInWordPressIframe = useCallback(() => {
    try {
      return window.parent !== window && (
        window.location.search.includes('edit_mode=1') ||
        window.location.search.includes('wp_admin=1')
      );
    } catch (e) {
      return false;
    }
  }, []);

  // Field type detection based on element and content
  const detectFieldType = useCallback((element: HTMLElement): string => {
    const text = element.textContent?.toLowerCase() || '';
    const tag = element.tagName.toLowerCase();
    const classes = element.className?.toLowerCase() || '';
    const id = element.id?.toLowerCase() || '';

    // Hero section detection
    if (tag === 'h1' || classes.includes('hero') || id.includes('hero')) {
      if (text.includes('channel') || text.includes('transform')) return 'hero_title';
    }
    if (text.includes('transform') && text.includes('potential')) return 'hero_subtitle';
    if ((tag === 'button' || tag === 'a') && (text.includes('book') || text.includes('started'))) return 'hero_cta';
    
    // Contact detection
    if (text.includes('@') && text.includes('.')) return 'contact_email';
    if (text.match(/[\d\s\(\)\-\+]{7,}/)) return 'contact_phone';
    
    // Navigation
    if (element.closest('nav')) return 'navigation_item';
    
    // SEO
    if (tag === 'title' || (tag.startsWith('h') && element.closest('head'))) return 'seo_title';
    if (element.getAttribute('name') === 'description') return 'seo_description';
    
    // Footer
    if (element.closest('footer')) return 'footer_text';
    
    // Default
    return 'generic_text';
  }, []);

  // Make element editable
  const makeElementEditable = useCallback((element: HTMLElement) => {
    if (!element || element.isContentEditable) return;

    const editableData: EditableElement = {
      element,
      originalContent: element.textContent || '',
      fieldType: detectFieldType(element)
    };

    // Store original content
    element.dataset.originalContent = editableData.originalContent;
    element.dataset.fieldType = editableData.fieldType;

    // Make editable
    element.contentEditable = 'true';
    element.style.outline = '2px dashed #0073aa';
    element.style.outlineOffset = '2px';
    element.style.cursor = 'text';
    element.style.minHeight = '1em';
    element.style.transition = 'outline-color 0.2s ease';

    // Prevent event propagation
    element.addEventListener('click', handleElementClick);
    element.addEventListener('input', handleElementInput);
    element.addEventListener('blur', handleElementBlur);
    element.addEventListener('focus', handleElementFocus);
    element.addEventListener('keydown', handleElementKeydown);

    editableElements.set(element, editableData);
  }, [detectFieldType]);

  // Remove editable state
  const makeElementNonEditable = useCallback((element: HTMLElement) => {
    element.contentEditable = 'false';
    element.style.outline = '';
    element.style.outlineOffset = '';
    element.style.cursor = '';
    element.style.minHeight = '';
    
    // Remove event listeners
    element.removeEventListener('click', handleElementClick);
    element.removeEventListener('input', handleElementInput);
    element.removeEventListener('blur', handleElementBlur);
    element.removeEventListener('focus', handleElementFocus);
    element.removeEventListener('keydown', handleElementKeydown);

    // Clean up data attributes
    delete element.dataset.originalContent;
    delete element.dataset.fieldType;

    editableElements.delete(element);
  }, [editableElements]);

  // Handle element click
  const handleElementClick = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const element = e.target as HTMLElement;
    
    if (!element.isContentEditable) return;

    setCurrentlyEditing(element);
    element.style.outline = '2px solid #0073aa';
    
    // Send edit start message to WordPress
    window.parent.postMessage({
      type: 'violet-edit-start',
      data: {
        fieldType: element.dataset.fieldType,
        text: element.textContent,
        element: element.tagName.toLowerCase()
      }
    }, '*');
  }, []);

  // Handle input changes with debouncing
  const handleElementInput = useCallback((e: Event) => {
    const element = e.target as HTMLElement;
    const fieldType = element.dataset.fieldType || 'generic_text';
    const value = element.textContent || '';

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Create save request
    const saveRequest: SaveRequest = {
      id: `${fieldType}-${Date.now()}`,
      fieldType,
      value,
      element: element.tagName.toLowerCase(),
      timestamp: Date.now()
    };

    pendingSaves.current.set(fieldType, saveRequest);

    // Debounced save (300ms)
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingSaves.current.has(fieldType)) {
        const request = pendingSaves.current.get(fieldType)!;
        
        // Send to WordPress
        window.parent.postMessage({
          type: 'violet-content-changed',
          data: {
            fieldType: request.fieldType,
            value: request.value,
            element: request.element,
            hasUnsavedChanges: true
          }
        }, '*');

        console.log('💾 Sending change to WordPress:', request);
      }
    }, 300);

    // Visual feedback
    element.style.outline = '2px solid #00a32a';
  }, []);

  // Handle blur
  const handleElementBlur = useCallback((e: Event) => {
    const element = e.target as HTMLElement;
    element.style.outline = '2px dashed #0073aa';
    
    // Force save on blur
    const fieldType = element.dataset.fieldType || 'generic_text';
    if (pendingSaves.current.has(fieldType)) {
      const request = pendingSaves.current.get(fieldType)!;
      window.parent.postMessage({
        type: 'violet-content-changed',
        data: {
          fieldType: request.fieldType,
          value: request.value,
          element: request.element,
          hasUnsavedChanges: true
        }
      }, '*');
      pendingSaves.current.delete(fieldType);
    }

    setCurrentlyEditing(null);
  }, []);

  // Handle focus
  const handleElementFocus = useCallback((e: Event) => {
    const element = e.target as HTMLElement;
    element.style.outline = '2px solid #0073aa';
    
    // Select all text on focus for easier editing
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, []);

  // Handle keyboard shortcuts
  const handleElementKeydown = useCallback((e: KeyboardEvent) => {
    const element = e.target as HTMLElement;
    
    // Escape key - cancel edit
    if (e.key === 'Escape') {
      e.preventDefault();
      const originalContent = element.dataset.originalContent || '';
      element.textContent = originalContent;
      element.blur();
    }
    
    // Enter key - save and move to next
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      element.blur();
      
      // Find next editable element
      const allEditable = Array.from(editableElements.keys());
      const currentIndex = allEditable.indexOf(element);
      if (currentIndex < allEditable.length - 1) {
        allEditable[currentIndex + 1].focus();
      }
    }
  }, [editableElements]);

  // Enable editing mode
  const enableEditingMode = useCallback(() => {
    console.log('✏️ Enabling WordPress editing mode');
    setIsEditMode(true);

    // Find all editable text elements
    const selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'li'];
    const elements = document.querySelectorAll(selectors.join(', '));

    elements.forEach((element) => {
      const el = element as HTMLElement;
      const text = el.textContent?.trim();
      
      // Filter suitable elements
      if (text && text.length > 2 && text.length < 500 && 
          !el.querySelector('img, svg, iframe, video, audio, input, textarea, select') &&
          !el.isContentEditable &&
          !el.closest('[contenteditable="true"]')) {
        
        makeElementEditable(el);
      }
    });

    console.log(`✅ Made ${editableElements.size} elements editable`);
  }, [makeElementEditable]);

  // Disable editing mode
  const disableEditingMode = useCallback(() => {
    console.log('🔒 Disabling WordPress editing mode');
    setIsEditMode(false);

    // Remove all editable states
    editableElements.forEach((data, element) => {
      makeElementNonEditable(element);
    });

    setEditableElements(new Map());
    setCurrentlyEditing(null);
  }, [editableElements, makeElementNonEditable]);

  // Message handler
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check
      const allowedOrigins = [
        'https://wp.violetrainwater.com',
        'https://violetrainwater.com',
        window.location.origin
      ];
      
      if (!allowedOrigins.some(origin => event.origin.includes(origin))) {
        return;
      }

      console.log('📨 React app received message:', event.data);

      switch (event.data.type) {
        case 'violet-test-access':
          event.source?.postMessage({
            type: 'violet-access-confirmed',
            success: true,
            timestamp: Date.now()
          }, event.origin as WindowPostMessageOptions);
          break;

        case 'violet-enable-editing':
          enableEditingMode();
          break;

        case 'violet-disable-editing':
          disableEditingMode();
          break;

        case 'violet-content-updated':
          // Update specific field after save
          if (event.data.field && event.data.newValue) {
            editableElements.forEach((data, element) => {
              if (element.dataset.fieldType === event.data.field) {
                element.textContent = event.data.newValue;
                element.dataset.originalContent = event.data.newValue;
              }
            });
          }
          break;

        case 'violet-save-response':
          // Handle save response
          if (event.data.success) {
            console.log('✅ Content saved successfully');
            // Update original content
            editableElements.forEach((data, element) => {
              if (element.dataset.fieldType === event.data.fieldType) {
                element.dataset.originalContent = element.textContent || '';
                element.style.outline = '2px dashed #00a32a';
                setTimeout(() => {
                  element.style.outline = '2px dashed #0073aa';
                }, 1000);
              }
            });
          } else {
            console.error('❌ Save failed:', event.data.error);
          }
          break;

        case 'violet-persist-content':
          // Persist content from WordPress save
          console.log('💾 Persisting content from WordPress:', event.data.content);
          if (event.data.content) {
            saveContent(event.data.content);
            
            // Confirm receipt
            event.source?.postMessage({
              type: 'violet-content-persisted',
              success: true,
              timestamp: Date.now()
            }, event.origin as WindowPostMessageOptions);
          }
          break;

        case 'violet-apply-saved-changes':
          // Apply saved changes and persist
          console.log('✅ Applying saved changes:', event.data.savedChanges);
          if (event.data.savedChanges) {
            const contentToSave: Record<string, string> = {};
            
            event.data.savedChanges.forEach((change: any) => {
              contentToSave[change.field_name] = change.field_value;
              
              // Update visible elements
              editableElements.forEach((data, element) => {
                if (element.dataset.fieldType === change.field_name) {
                  element.textContent = change.field_value;
                  element.dataset.originalContent = change.field_value;
                  // Remove unsaved visual indicator
                  element.classList.remove('violet-edited-element');
                  element.style.backgroundColor = '';
                  element.style.borderLeft = '';
                  element.style.paddingLeft = '';
                }
              });
            });
            
            // Persist to localStorage
            saveContent(contentToSave);
            
            // Force a UI update by dispatching a custom event
            window.dispatchEvent(new CustomEvent('violet-content-updated', {
              detail: { ...getAllContentSync(), ...contentToSave }
            }));
            
            // If not in edit mode, reload to show new content
            if (!isEditMode) {
              console.log('🔄 Reloading to show updated content...');
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [enableEditingMode, disableEditingMode, editableElements]);

  // Send ready signal when in iframe
  useEffect(() => {
    if (isInWordPressIframe()) {
      const sendReadySignal = () => {
        window.parent.postMessage({
          type: 'violet-iframe-ready',
          url: window.location.href,
          title: document.title,
          timestamp: Date.now()
        }, '*');
        console.log('📤 Sent ready signal to WordPress');
      };

      // Send immediately and after load
      sendReadySignal();
      window.addEventListener('load', sendReadySignal);
      
      return () => window.removeEventListener('load', sendReadySignal);
    }
  }, [isInWordPressIframe]);

  // Visual styling only when in edit mode - NO floating toolbars
  if (isEditMode && isInWordPressIframe()) {
    return (
      <style>{`
        [contenteditable="true"]:hover {
          outline-color: #005a87 !important;
          background-color: rgba(0, 115, 170, 0.05);
        }
        [contenteditable="true"]:focus {
          outline-width: 3px !important;
          background-color: rgba(0, 115, 170, 0.05);
        }
      `}</style>
    );
  }

  return null;
};

export default WordPressEditor;