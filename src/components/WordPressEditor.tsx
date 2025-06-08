import React, { useEffect, useState, useRef, useCallback } from 'react';
import { saveContent, getAllContent, handleSaveCompletion, reloadContentFromWordPress } from '@/utils/contentStorage';

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

const TRUSTED_ORIGINS = [
  'https://wp.violetrainwater.com',
  'https://violetrainwater.com'
];

const sendToParent = (message: any) => {
  TRUSTED_ORIGINS.forEach(origin => {
    window.parent.postMessage(message, origin);
  });
};

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

  // Enhanced field type detection
  const detectFieldType = useCallback((element: HTMLElement): string => {
    // Check data attribute first
    if (element.dataset.violetField) {
      return element.dataset.violetField;
    }

    const text = element.textContent?.toLowerCase() || '';
    const tag = element.tagName.toLowerCase();
    const classes = element.className?.toLowerCase() || '';
    const id = element.id?.toLowerCase() || '';

    // Hero section detection
    if (text.includes('change the channel') || text.includes('channel') && tag === 'h1') return 'hero_title';
    if (text.includes('change your life') || (text.includes('life') && tag === 'h1')) return 'hero_subtitle_line2';
    if (text.includes('transform your potential') || text.includes('neuroscience')) return 'hero_subtitle';
    if (text.includes('book violet') || (text.includes('book') && (tag === 'button' || tag === 'a'))) return 'hero_cta';
    if (text.includes('watch violet') || text.includes('action')) return 'hero_cta_secondary';
    
    // Contact detection
    if (text.includes('@') && text.includes('.')) return 'contact_email';
    if (text.match(/[\d\s\(\)\-\+]{7,}/)) return 'contact_phone';
    
    // Navigation
    if (element.closest('nav')) {
      if (text.includes('home')) return 'nav_home';
      if (text.includes('about')) return 'nav_about';
      if (text.includes('service')) return 'nav_services';
      return 'navigation_item';
    }
    
    // SEO
    if (tag === 'title' || (tag.startsWith('h') && element.closest('head'))) return 'seo_title';
    if (element.getAttribute('name') === 'description') return 'seo_description';
    
    // Footer
    if (element.closest('footer')) return 'footer_text';
    
    // Generic based on tag and content
    if (tag === 'h1') return 'heading_h1';
    if (tag === 'h2') return 'heading_h2';
    if (tag === 'p' && text.length > 20) return 'paragraph_content';
    
    // Default fallback
    return `generic_${tag}_${text.substring(0, 10).replace(/\s/g, '_')}`;
  }, []);

  // Make element editable with enhanced visual feedback
  const makeElementEditable = useCallback((element: HTMLElement) => {
    if (!element || element.isContentEditable) return;

    const fieldType = detectFieldType(element);
    const editableData: EditableElement = {
      element,
      originalContent: element.textContent || '',
      fieldType
    };

    // Store data
    element.dataset.originalContent = editableData.originalContent;
    element.dataset.fieldType = fieldType;
    element.dataset.violetField = fieldType; // Ensure consistent field detection

    // Make editable with enhanced styling
    element.contentEditable = 'true';
    element.style.outline = '2px dashed #0073aa';
    element.style.outlineOffset = '2px';
    element.style.cursor = 'text';
    element.style.minHeight = '1em';
    element.style.transition = 'all 0.2s ease';
    element.style.position = 'relative';

    // Add tooltip
    element.title = `Editable: ${fieldType}`;

    // Event listeners
    element.addEventListener('click', handleElementClick);
    element.addEventListener('input', handleElementInput);
    element.addEventListener('blur', handleElementBlur);
    element.addEventListener('focus', handleElementFocus);
    element.addEventListener('keydown', handleElementKeydown);

    setEditableElements(prev => new Map(prev.set(element, editableData)));

    console.log(`✏️ Made element editable: ${fieldType}`, element);
  }, [detectFieldType]);

  // Remove editable state
  const makeElementNonEditable = useCallback((element: HTMLElement) => {
    element.contentEditable = 'false';
    element.style.outline = '';
    element.style.outlineOffset = '';
    element.style.cursor = '';
    element.style.minHeight = '';
    element.style.transition = '';
    element.style.position = '';
    element.title = '';
    
    // Remove event listeners
    element.removeEventListener('click', handleElementClick);
    element.removeEventListener('input', handleElementInput);
    element.removeEventListener('blur', handleElementBlur);
    element.removeEventListener('focus', handleElementFocus);
    element.removeEventListener('keydown', handleElementKeydown);

    // Clean up data attributes
    delete element.dataset.originalContent;
    delete element.dataset.fieldType;

    setEditableElements(prev => {
      const newMap = new Map(prev);
      newMap.delete(element);
      return newMap;
    });
  }, []);

  // Handle element click
  const handleElementClick = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const element = e.target as HTMLElement;
    
    if (!element.isContentEditable) return;

    setCurrentlyEditing(element);
    element.style.outline = '2px solid #0073aa';
    element.style.backgroundColor = 'rgba(0, 115, 170, 0.05)';
    
    console.log(`✏️ Started editing: ${element.dataset.fieldType}`);
    
    // Send edit start message to WordPress
    sendToParent({
      type: 'violet-edit-start',
      data: {
        fieldType: element.dataset.fieldType,
        text: element.textContent,
        element: element.tagName.toLowerCase()
      }
    });
  }, []);

  // Handle input changes with debouncing
  const handleElementInput = useCallback((e: Event) => {
    const element = e.target as HTMLElement;
    const fieldType = element.dataset.fieldType || 'generic_text';
    const value = element.textContent || '';

    // Visual feedback for unsaved changes
    element.style.outline = '2px solid #f59e0b';
    element.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';

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

    // Debounced save (500ms for better UX)
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingSaves.current.has(fieldType)) {
        const request = pendingSaves.current.get(fieldType)!;
        
        // Send to WordPress
        sendToParent({
          type: 'violet-content-changed',
          data: {
            fieldType: request.fieldType,
            value: request.value,
            element: request.element,
            hasUnsavedChanges: true
          }
        });

        console.log('💾 Sent change to WordPress:', request);
        
        // Visual feedback for sent
        element.style.outline = '2px solid #00a32a';
        element.style.backgroundColor = 'rgba(0, 163, 42, 0.1)';
      }
    }, 500);
  }, []);

  // Handle blur with immediate save
  const handleElementBlur = useCallback((e: Event) => {
    const element = e.target as HTMLElement;
    element.style.outline = '2px dashed #0073aa';
    element.style.backgroundColor = '';
    
    // Force immediate save on blur
    const fieldType = element.dataset.fieldType || 'generic_text';
    if (pendingSaves.current.has(fieldType)) {
      const request = pendingSaves.current.get(fieldType)!;
      
      // Clear timeout since we're saving immediately
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      sendToParent({
        type: 'violet-content-changed',
        data: {
          fieldType: request.fieldType,
          value: request.value,
          element: request.element,
          hasUnsavedChanges: true
        }
      });
      
      pendingSaves.current.delete(fieldType);
      console.log('💾 Force saved on blur:', request);
    }

    setCurrentlyEditing(null);
  }, []);

  // Handle focus with selection
  const handleElementFocus = useCallback((e: Event) => {
    const element = e.target as HTMLElement;
    element.style.outline = '2px solid #0073aa';
    element.style.backgroundColor = 'rgba(0, 115, 170, 0.05)';
    
    // Select all text on focus for easier editing
    setTimeout(() => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }, 10);
  }, []);

  // Handle keyboard shortcuts
  const handleElementKeydown = useCallback((e: KeyboardEvent) => {
    const element = e.target as HTMLElement;
    
    // Escape key - cancel edit and restore original
    if (e.key === 'Escape') {
      e.preventDefault();
      const originalContent = element.dataset.originalContent || '';
      element.textContent = originalContent;
      element.blur();
      console.log('🚫 Edit cancelled, restored original content');
    }
    
    // Enter key - save and exit (or move to next)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      element.blur();
      
      // Find next editable element
      const allEditable = Array.from(editableElements.keys());
      const currentIndex = allEditable.indexOf(element);
      if (currentIndex < allEditable.length - 1) {
        setTimeout(() => allEditable[currentIndex + 1].focus(), 100);
      }
    }
    
    // Ctrl+S - save immediately
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      element.blur(); // This will trigger immediate save
    }
  }, [editableElements]);
  // Enable editing mode with enhanced element detection
  const enableEditingMode = useCallback(() => {
    console.log('✏️ Enabling WordPress editing mode');
    setIsEditMode(true);

    // Find all potentially editable elements
    const selectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'span', 'a', 'button', 'li',
      '[data-violet-field]', // Specifically marked elements
      '.editable-text' // Custom class for editable elements
    ];
    
    const elements = document.querySelectorAll(selectors.join(', '));
    let madeEditable = 0;

    elements.forEach((element) => {
      const el = element as HTMLElement;
      const text = el.textContent?.trim();
      
      // Enhanced filtering for suitable elements
      if (text && 
          text.length > 1 && 
          text.length < 1000 && 
          !el.querySelector('img, svg, iframe, video, audio, input, textarea, select, canvas') &&
          !el.isContentEditable &&
          !el.closest('[contenteditable="true"]') &&
          !el.classList.contains('no-edit') &&
          el.offsetParent !== null) { // Element is visible
        
        makeElementEditable(el);
        madeEditable++;
      }
    });

    console.log(`✅ Made ${madeEditable} elements editable`);
    
    // Send confirmation to WordPress
    sendToParent({
      type: 'violet-editing-enabled',
      data: {
        editableCount: madeEditable,
        timestamp: Date.now()
      }
    });
  }, [makeElementEditable]);

  // Disable editing mode
  const disableEditingMode = useCallback(() => {
    console.log('🔒 Disabling WordPress editing mode');
    setIsEditMode(false);

    // Remove all editable states
    const elementsToClean = Array.from(editableElements.keys());
    elementsToClean.forEach(element => {
      makeElementNonEditable(element);
    });

    setEditableElements(new Map());
    setCurrentlyEditing(null);
    
    // Clear any pending saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    pendingSaves.current.clear();

    console.log('✅ Editing mode disabled, all elements cleaned up');
  }, [editableElements, makeElementNonEditable]);

  // Enhanced message handler with save completion handling
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check
      if (!TRUSTED_ORIGINS.some(origin => event.origin.includes(origin))) {
        console.warn('🚫 Blocked message from untrusted origin:', event.origin);
        return;
      }

      console.log('📨 React app received message:', event.data);

      switch (event.data.type) {
        case 'violet-test-access':
          event.source?.postMessage({
            type: 'violet-access-confirmed',
            success: true,
            timestamp: Date.now(),
            editMode: isEditMode,
            editableCount: editableElements.size
          }, event.origin as WindowPostMessageOptions);
          break;

        case 'violet-enable-editing':
          enableEditingMode();
          break;

        case 'violet-disable-editing':
          disableEditingMode();
          break;

        case 'violet-apply-saved-changes':
          // CRITICAL: Handle save completion and reload content
          console.log('✅ Received save completion, applying changes:', event.data.savedChanges);
          
          if (event.data.savedChanges && Array.isArray(event.data.savedChanges)) {
            // Handle the save completion
            handleSaveCompletion(event.data.savedChanges);
            
            // Update visible elements immediately
            event.data.savedChanges.forEach((change: any) => {
              if (change.field_name && change.field_value !== undefined) {
                // Find and update elements with this field type
                editableElements.forEach((data, element) => {
                  if (element.dataset.fieldType === change.field_name) {
                    element.textContent = change.field_value;
                    element.dataset.originalContent = change.field_value;
                    
                    // Visual feedback for successful save
                    element.style.outline = '2px solid #00a32a';
                    element.style.backgroundColor = 'rgba(0, 163, 42, 0.1)';
                    
                    setTimeout(() => {
                      element.style.outline = '2px dashed #0073aa';
                      element.style.backgroundColor = '';
                    }, 2000);
                    
                    console.log(`✅ Updated element for field: ${change.field_name}`);
                  }
                });
                
                // Also update non-editable elements with data-violet-field
                const nonEditableElements = document.querySelectorAll(`[data-violet-field="${change.field_name}"]:not([contenteditable="true"])`);
                nonEditableElements.forEach(el => {
                  if (el.textContent !== change.field_value) {
                    el.textContent = change.field_value;
                    console.log(`✅ Updated non-editable element for field: ${change.field_name}`);
                  }
                });
              }
            });
            
            // Send confirmation back to WordPress
            event.source?.postMessage({
              type: 'violet-changes-applied',
              success: true,
              changesCount: event.data.savedChanges.length,
              timestamp: Date.now()
            }, event.origin as WindowPostMessageOptions);
          }
          break;

        case 'violet-refresh-content':
          // Force reload content from WordPress
          console.log('🔄 Received refresh request, reloading content...');
          reloadContentFromWordPress().then(() => {
            console.log('✅ Content reloaded on demand');
            event.source?.postMessage({
              type: 'violet-content-refreshed',
              success: true,
              timestamp: Date.now()
            }, event.origin as WindowPostMessageOptions);
          }).catch(error => {
            console.error('❌ Failed to reload content on demand:', error);
          });
          break;

        case 'violet-save-response':
          // Handle individual save responses
          if (event.data.success) {
            console.log('✅ Individual save confirmed:', event.data.fieldType);
            
            // Update the specific element
            editableElements.forEach((data, element) => {
              if (element.dataset.fieldType === event.data.fieldType) {
                element.dataset.originalContent = element.textContent || '';
                element.style.outline = '2px solid #00a32a';
                element.style.backgroundColor = 'rgba(0, 163, 42, 0.1)';
                
                setTimeout(() => {
                  element.style.outline = '2px dashed #0073aa';
                  element.style.backgroundColor = '';
                }, 1500);
              }
            });
          } else {
            console.error('❌ Save failed:', event.data.error);
            
            // Visual feedback for failed save
            editableElements.forEach((data, element) => {
              if (element.dataset.fieldType === event.data.fieldType) {
                element.style.outline = '2px solid #dc2626';
                element.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                
                setTimeout(() => {
                  element.style.outline = '2px dashed #0073aa';
                  element.style.backgroundColor = '';
                }, 3000);
              }
            });
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [enableEditingMode, disableEditingMode, editableElements, isEditMode]);

  // Send ready signal when in iframe
  useEffect(() => {
    if (isInWordPressIframe()) {
      const sendReadySignal = () => {
        sendToParent({
          type: 'violet-iframe-ready',
          url: window.location.href,
          title: document.title,
          timestamp: Date.now(),
          system: 'enhanced-editor'
        });
        console.log('📤 Sent enhanced ready signal to WordPress');
      };

      // Send immediately and after slight delay
      sendReadySignal();
      const timeout = setTimeout(sendReadySignal, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [isInWordPressIframe]);

  // Enhanced visual styling for edit mode
  if (isEditMode && isInWordPressIframe()) {
    return (
      <style>{`
        [contenteditable="true"] {
          transition: all 0.2s ease !important;
          border-radius: 2px !important;
        }
        
        [contenteditable="true"]:hover {
          outline-color: #005a87 !important;
          background-color: rgba(0, 115, 170, 0.08) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 8px rgba(0, 115, 170, 0.2) !important;
        }
        
        [contenteditable="true"]:focus {
          outline-width: 3px !important;
          background-color: rgba(0, 115, 170, 0.05) !important;
          transform: none !important;
          box-shadow: 0 0 0 1px rgba(0, 115, 170, 0.3) !important;
        }
        
        [contenteditable="true"]::before {
          content: attr(title);
          position: absolute;
          top: -25px;
          left: 0;
          background: #0073aa;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
          z-index: 1000;
          white-space: nowrap;
        }
        
        [contenteditable="true"]:hover::before {
          opacity: 1;
        }
        
        /* Success state */
        [contenteditable="true"][style*="outline-color: rgb(0, 163, 42)"] {
          animation: successPulse 0.6s ease-in-out;
        }
        
        /* Error state */
        [contenteditable="true"][style*="outline-color: rgb(220, 38, 38)"] {
          animation: errorShake 0.5s ease-in-out;
        }
        
        @keyframes successPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
      `}</style>
    );
  }

  return null;
};

export default WordPressEditor;
