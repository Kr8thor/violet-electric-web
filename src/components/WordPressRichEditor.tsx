import React, { useEffect, useRef } from 'react';
import { wordPressCommunication } from '../utils/WordPressCommunication';

interface ChangeEntry {
  fieldType: string;
  element: HTMLElement;
  originalValue: string;
  currentValue: string;
  timestamp: number;
}

const WordPressRichEditor: React.FC = () => {
  const pendingChanges = useRef<Map<string, ChangeEntry>>(new Map());
  const isEditingEnabled = useRef(false);

  // Listen for WordPress messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data?.type?.startsWith('violet-')) return;

      switch (event.data.type) {
        case 'violet-enable-editing':
          enableInvisibleEditing();
          break;
        case 'violet-disable-editing':
          disableInvisibleEditing();
          break;
        case 'violet-prepare-triple-failsafe-save':
          handleSavePreparation();
          break;
        case 'violet-apply-saved-changes':
          handleApplySavedChanges(event.data);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const enableInvisibleEditing = () => {
    console.log('🎨 Enabling INVISIBLE editing mode - no UI changes');
    isEditingEnabled.current = true;

    // Make elements editable with ONLY blue outlines (no other visual changes)
    const editableSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'li'];
    
    editableSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach((element) => {
        const el = element as HTMLElement;
        const text = el.textContent?.trim();
        
        if (text && text.length > 0 && !el.querySelector('img, svg, iframe')) {
          // Store original data
          el.dataset.violetEditable = 'true';
          el.dataset.violetOriginal = el.innerHTML;
          el.dataset.violetFieldType = detectFieldType(el);
          
          // Make editable with ONLY blue outline
          el.contentEditable = 'true';
          el.style.outline = '2px dashed #0073aa';
          el.style.outlineOffset = '2px';
          el.style.cursor = 'text';
          
          // Add invisible event listeners
          el.addEventListener('input', handleContentChange);
          el.addEventListener('blur', handleElementBlur);
        }
      });
    });

    console.log('✅ Invisible editing enabled - only blue outlines visible');
  };

  const disableInvisibleEditing = () => {
    console.log('🔒 Disabling invisible editing mode');
    isEditingEnabled.current = false;

    document.querySelectorAll('[data-violet-editable]').forEach((element) => {
      const el = element as HTMLElement;
      el.contentEditable = 'false';
      el.style.outline = '';
      el.style.cursor = '';
      el.style.backgroundColor = '';
      el.style.borderLeft = '';
      el.style.paddingLeft = '';
      
      el.removeEventListener('input', handleContentChange);
      el.removeEventListener('blur', handleElementBlur);
    });

    pendingChanges.current.clear();
    console.log('✅ Invisible editing disabled');
  };

  const handleContentChange = (event: Event) => {
    const element = event.target as HTMLElement;
    const fieldType = element.dataset.violetFieldType || 'generic_content';
    const originalValue = element.dataset.violetOriginal || '';
    const currentValue = element.innerHTML;

    // Track change invisibly
    const changeEntry: ChangeEntry = {
      fieldType,
      element,
      originalValue,
      currentValue,
      timestamp: Date.now()
    };

    pendingChanges.current.set(fieldType, changeEntry);

    // Add subtle visual indicator for unsaved changes (minimal)
    element.style.backgroundColor = '#fff3cd';
    element.style.borderLeft = '3px solid #f39c12';
    element.style.paddingLeft = '8px';

    // Report change to WordPress
    wordPressCommunication.reportContentChange(fieldType, currentValue);
    console.log('📝 Content changed (invisible):', fieldType);
  };

  const handleElementBlur = (event: Event) => {
    // Keep minimal styling on blur for unsaved changes indicator
  };

  const handleSavePreparation = () => {
    console.log('💾 Preparing changes for WordPress save...');
    
    // Collect all changes
    const allChanges: any[] = [];
    pendingChanges.current.forEach((change, fieldType) => {
      allChanges.push({
        field_name: fieldType,
        field_value: change.currentValue
      });
    });

    console.log('📊 Collected changes:', allChanges.length);

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

  const handleApplySavedChanges = (data: any) => {
    console.log('✅ Applying saved changes (invisible)');
    
    // Clear change tracking
    pendingChanges.current.clear();
    
    // Remove visual change indicators
    document.querySelectorAll('[data-violet-editable]').forEach((element) => {
      const el = element as HTMLElement;
      el.style.backgroundColor = '';
      el.style.borderLeft = '';
      el.style.paddingLeft = '';
    });

    if (data.savedChanges) {
      data.savedChanges.forEach((change: any) => {
        document.querySelectorAll(`[data-violet-field-type="${change.field_name}"]`).forEach((element) => {
          const el = element as HTMLElement;
          el.innerHTML = change.field_value;
          el.dataset.violetOriginal = change.field_value;
        });
      });
    }

    console.log('🎉 Changes applied successfully (invisible)');
  };

  const detectFieldType = (element: HTMLElement): string => {
    const tag = element.tagName.toLowerCase();
    const text = element.textContent?.toLowerCase() || '';
    const classes = element.className.toLowerCase();

    if (tag === 'h1') return 'hero_title';
    if (tag === 'h2' && classes.includes('hero')) return 'hero_subtitle';
    if ((tag === 'a' || tag === 'button') && text.includes('contact')) return 'hero_cta';
    if (text.includes('@') && text.includes('.')) return 'contact_email';
    if (text.match(/[\d\s\(\)\-\+]{7,}/)) return 'contact_phone';
    if (tag.startsWith('h')) return `heading_${tag}`;
    if (tag === 'p') return 'paragraph_content';
    
    return `${tag}_content`;
  };

  // This component renders NOTHING visible - it only handles invisible editing behavior
  return null;
};

export default WordPressRichEditor;
