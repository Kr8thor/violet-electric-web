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
        case 'violet-persist-content-changes':
          handlePersistContentChanges(event.data);
          break;
        case 'violet-refresh-content':
          handleRefreshContent();
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const enableInvisibleEditing = () => {
    console.log('🎨 Enabling INVISIBLE editing mode - targeting data-violet-field elements');
    isEditingEnabled.current = true;

    // FIXED: Target elements that already have data-violet-field attribute (from EditableText components)
    document.querySelectorAll('[data-violet-field]').forEach((element) => {
      const el = element as HTMLElement;
      const text = el.textContent?.trim();
      const existingField = el.dataset.violetField;
      
      if (text && text.length > 0 && existingField && !el.querySelector('img, svg, iframe')) {
        console.log(`🎯 Making editable: ${existingField} = "${text}"`);
        
        // Store original data using the existing field name
        el.dataset.violetEditable = 'true';
        el.dataset.violetOriginal = el.innerHTML;
        el.dataset.violetFieldType = existingField; // Use the field name from the component
        
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

    console.log('✅ Invisible editing enabled - blue outlines on data-violet-field elements');
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
    // FIXED: Use the field name directly from data-violet-field (set by EditableText components)
    const fieldType = element.dataset.violetField || element.dataset.violetFieldType || 'generic_content';
    const originalValue = element.dataset.violetOriginal || '';
    const currentValue = element.innerHTML;

    console.log(`📝 Content changed: ${fieldType} = "${currentValue}"`);

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
    console.log('📤 Reported to WordPress:', fieldType);
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
        // FIXED: Use data-violet-field attribute to find elements (matches what EditableText sets)
        const elements = document.querySelectorAll(`[data-violet-field="${change.field_name}"]`);
        console.log(`🔄 Updating field ${change.field_name} in ${elements.length} elements`);
        
        elements.forEach((element) => {
          const el = element as HTMLElement;
          el.innerHTML = change.field_value;
          el.dataset.violetOriginal = change.field_value;
          el.dataset.violetValue = change.field_value; // Update the data-violet-value too
          console.log(`✅ Updated ${change.field_name} to: "${change.field_value}"`);
        });
      });
    }

    console.log('🎉 Changes applied successfully (invisible)');
  };

  const handlePersistContentChanges = (data: any) => {
    console.log('💾 Persisting content changes to localStorage');
    
    if (data.contentData && Array.isArray(data.contentData)) {
      try {
        // Get existing content from localStorage
        const existingContent = JSON.parse(localStorage.getItem('violet-content') || '{}');
        const content = existingContent.content || {};
        
        // Apply changes
        data.contentData.forEach((change: any) => {
          if (change.field_name && change.field_value !== undefined) {
            content[change.field_name] = change.field_value;
            console.log(`💾 Persisted: ${change.field_name} = "${change.field_value}"`);
          }
        });
        
        // Save back to localStorage
        const updatedContent = {
          version: 'v1',
          timestamp: Date.now(),
          source: 'wordpress-save',
          content: content
        };
        
        localStorage.setItem('violet-content', JSON.stringify(updatedContent));
        console.log('✅ Content persisted to localStorage');
        
        // Trigger a content refresh event for the WordPress Content Provider
        window.dispatchEvent(new CustomEvent('violet-content-updated', {
          detail: { source: 'save', changes: data.contentData }
        }));
        
      } catch (error) {
        console.error('❌ Failed to persist content:', error);
      }
    }
  };

  const handleRefreshContent = () => {
    console.log('🔄 Refreshing content from localStorage');
    
    try {
      const storedContent = localStorage.getItem('violet-content');
      if (storedContent) {
        const parsedContent = JSON.parse(storedContent);
        const content = parsedContent.content || {};
        
        // Update all elements with stored content
        Object.entries(content).forEach(([fieldName, fieldValue]) => {
          const elements = document.querySelectorAll(`[data-violet-field="${fieldName}"]`);
          elements.forEach((element) => {
            const el = element as HTMLElement;
            el.innerHTML = fieldValue as string;
            el.dataset.violetValue = fieldValue as string;
            el.dataset.violetOriginal = fieldValue as string;
          });
        });
        
        console.log('✅ Content refreshed from localStorage');
      }
    } catch (error) {
      console.error('❌ Failed to refresh content:', error);
    }
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
