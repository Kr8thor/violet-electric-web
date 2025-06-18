/**
 * WordPress Communication Handler - FIXED VERSION
 * Handles all communication between React app and WordPress admin
 */

interface WordPressMessage {
  type: string;
  [key: string]: any;
}

interface ContentChange {
  field_name: string;
  field_value: string;
  format?: string;
  editor?: string;
}

class WordPressCommunication {
  private initialized = false;
  private allowedOrigins = [
    'https://wp.violetrainwater.com',
    'https://violetrainwater.com',
    'http://localhost:3000'
  ];

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.initialized) return;
    
    window.addEventListener('message', this.handleMessage.bind(this));
    this.initialized = true;
    
    // Send ready signal to WordPress
    this.sendReadySignal();
  }

  private sendReadySignal() {
    // Try multiple times to ensure WordPress receives it
    const sendReady = () => {
      this.sendToWordPress({
        type: 'violet-iframe-ready',
        url: window.location.href,
        timestamp: Date.now(),
        reactAppReady: true
      });
    };

    sendReady();
    setTimeout(sendReady, 500);
    setTimeout(sendReady, 1500);
  }

  private handleMessage(event: MessageEvent<WordPressMessage>) {
    // Verify origin for security
    if (!this.allowedOrigins.some(origin => event.origin.includes(origin.replace('https://', '').replace('http://', '')))) {
      console.warn('Message from unauthorized origin:', event.origin);
      return;
    }

    const { type, ...data } = event.data;
    console.log('📨 Received message from WordPress:', type, data);

    switch (type) {
      case 'violet-enable-editing':
        this.enableEditing();
        break;
      case 'violet-disable-editing':
        this.disableEditing();
        break;
      case 'violet-save-content':
        this.saveContent();
        break;
      case 'violet-refresh':
        window.location.reload();
        break;
      case 'violet-trigger-rebuild':
        this.triggerRebuild();
        break;
      default:
        console.log('Unhandled message type:', type);
    }
  }

  private enableEditing() {
    // Add editing indicators to all editable elements
    document.querySelectorAll('[data-violet-field]').forEach(element => {
      element.classList.add('violet-editable');
      (element as HTMLElement).setAttribute('data-violet-editable', 'true');
      
      // Add click handler for inline editing
      element.addEventListener('click', this.handleElementClick.bind(this));
      
      // Professional visual editing indicators
      const htmlElement = element as HTMLElement;
      htmlElement.style.outline = '2px dashed #0073aa';
      htmlElement.style.outlineOffset = '2px';
      htmlElement.style.cursor = 'text';
      htmlElement.style.transition = 'all 0.2s ease';
      
      // Add hover effects for better UX
      const handleMouseEnter = () => {
        if (!htmlElement.hasAttribute('data-violet-editing')) {
          htmlElement.style.outline = '2px solid #0073aa';
          htmlElement.style.backgroundColor = 'rgba(0, 115, 170, 0.05)';
          htmlElement.style.transform = 'translateY(-1px)';
          htmlElement.style.boxShadow = '0 2px 8px rgba(0, 115, 170, 0.15)';
        }
      };
      
      const handleMouseLeave = () => {
        if (!htmlElement.hasAttribute('data-violet-editing')) {
          htmlElement.style.outline = '2px dashed #0073aa';
          htmlElement.style.backgroundColor = '';
          htmlElement.style.transform = '';
          htmlElement.style.boxShadow = '';
        }
      };
      
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
      
      // Store cleanup functions
      (element as any).__violetHoverCleanup = () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    });

    this.sendToWordPress({
      type: 'violet-editing-enabled',
      message: 'Inline editing mode activated - click any text to edit directly'
    });
  }

  private disableEditing() {
    // Remove editing indicators and cleanup
    document.querySelectorAll('[data-violet-editable]').forEach(element => {
      element.removeAttribute('data-violet-editable');
      element.removeEventListener('click', this.handleElementClick.bind(this));
      
      // Clean up hover effects
      if ((element as any).__violetHoverCleanup) {
        (element as any).__violetHoverCleanup();
        delete (element as any).__violetHoverCleanup;
      }
      
      // Clean up any active inline editing
      if (element.hasAttribute('data-violet-editing')) {
        this.cleanupInlineEditing(element as HTMLElement);
      }
      
      // Remove all visual indicators
      const htmlElement = element as HTMLElement;
      htmlElement.style.outline = '';
      htmlElement.style.outlineOffset = '';
      htmlElement.style.cursor = '';
      htmlElement.style.backgroundColor = '';
      htmlElement.style.transform = '';
      htmlElement.style.boxShadow = '';
      htmlElement.style.transition = '';
      htmlElement.contentEditable = 'false';
    });

    this.sendToWordPress({
      type: 'violet-editing-disabled',
      message: 'Inline editing disabled'
    });
  }

  private handleElementClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const element = event.target as HTMLElement;
    const field = element.getAttribute('data-violet-field');
    
    if (field && !element.hasAttribute('data-violet-editing')) {
      console.log('🎯 Element clicked for inline editing:', field);
      this.enableInlineEditing(element, field);
    }
  }

  private enableInlineEditing(element: HTMLElement, field: string) {
    // Mark as currently being edited
    element.setAttribute('data-violet-editing', 'true');
    
    // Store original content for undo
    const originalContent = this.getCleanTextContent(element);
    element.setAttribute('data-violet-original', originalContent);
    
    // Make element directly editable
    element.contentEditable = 'true';
    element.focus();
    
    // Enhanced visual feedback for active editing
    element.style.outline = '2px solid #00a32a';  // Green outline when editing
    element.style.outlineOffset = '2px';
    element.style.backgroundColor = 'rgba(0, 163, 42, 0.05)';  // Subtle green background
    element.style.cursor = 'text';
    
    // Position cursor at end of text
    this.setCursorToEnd(element);
    
    // Add event listeners for save/cancel
    const saveEdit = () => this.saveInlineEdit(element, field);
    const cancelEdit = () => this.cancelInlineEdit(element);
    
    // Auto-save on blur (click outside)
    element.addEventListener('blur', saveEdit, { once: true });
    
    // Save on Enter, cancel on Escape
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        element.blur(); // This will trigger save
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    };
    
    element.addEventListener('keydown', handleKeyPress);
    
    // Store cleanup function
    (element as any).__violetCleanup = () => {
      element.removeEventListener('keydown', handleKeyPress);
    };
  }

  private saveInlineEdit(element: HTMLElement, field: string) {
    const newValue = this.getCleanTextContent(element);
    const originalValue = element.getAttribute('data-violet-original') || '';
    
    // Cleanup editing state
    this.cleanupInlineEditing(element);
    
    // Only save if content actually changed
    if (newValue !== originalValue) {
      console.log('💾 Saving inline edit:', field, newValue);
      this.markAsChanged(field, newValue);
      
      // Visual feedback for successful edit
      element.style.backgroundColor = 'rgba(0, 163, 42, 0.1)';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 500);
    }
  }

  private cancelInlineEdit(element: HTMLElement) {
    const originalValue = element.getAttribute('data-violet-original') || '';
    
    // Restore original content
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      (element as HTMLInputElement).value = originalValue;
    } else {
      element.textContent = originalValue;
    }
    
    this.cleanupInlineEditing(element);
    console.log('❌ Inline edit cancelled');
  }

  private cleanupInlineEditing(element: HTMLElement) {
    // Remove editing attributes
    element.removeAttribute('data-violet-editing');
    element.removeAttribute('data-violet-original');
    element.contentEditable = 'false';
    
    // Restore normal editing visual state
    element.style.outline = '2px dashed #0073aa';
    element.style.outlineOffset = '2px';
    element.style.backgroundColor = '';
    element.style.cursor = 'text';
    
    // Cleanup event listeners
    if ((element as any).__violetCleanup) {
      (element as any).__violetCleanup();
      delete (element as any).__violetCleanup;
    }
  }

  private setCursorToEnd(element: HTMLElement) {
    // Set cursor position to end of content
    const range = document.createRange();
    const selection = window.getSelection();
    
    if (selection && element.childNodes.length > 0) {
      range.selectNodeContents(element);
      range.collapse(false); // Collapse to end
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  private getCleanTextContent(element: HTMLElement): string {
    // Get text content without editing artifacts
    let content = element.innerHTML;
    
    // Remove editing artifacts
    content = content.replace(/\s*bis_size="[^"]*"/g, '');
    content = content.replace(/\s*data-violet-[^=]*="[^"]*"/g, '');
    content = content.replace(/\s*contenteditable="[^"]*"/g, '');
    content = content.replace(/\s*style="[^"]*outline[^"]*"/g, '');
    
    // If it's simple text, return just the text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // If content is just text, return text. Otherwise return cleaned HTML
    if (content.replace(/<[^>]*>/g, '').trim() === textContent.trim()) {
      return textContent;
    }
    
    return content;
  }

  private updateElementContent(element: HTMLElement, newValue: string) {
    // Update element content
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      (element as HTMLInputElement).value = newValue;
    } else {
      // For other elements, set text content or innerHTML appropriately
      if (newValue.includes('<') && newValue.includes('>')) {
        element.innerHTML = newValue;
      } else {
        element.textContent = newValue;
      }
    }
  }

  /**
   * Helper: Map known label text to canonical field names
   */
  private static mapLabelToFieldName(label: string): string | null {
    const mapping: Record<string, string> = {
      'Home': 'nav_home',
      'About': 'nav_about',
      'Keynotes': 'nav_keynotes',
      'Testimonials': 'nav_testimonials',
      'Contact': 'nav_contact',
      'Book Violet': 'hero_cta',
      'Change The Channel!': 'hero_title',
      'Change Your Life!': 'hero_subtitle',
      // Add more mappings as needed
    };
    return mapping[label.trim()] || null;
  }

  /**
   * Helper: Extract field name from element or HTML string
   */
  private static extractFieldName(input: HTMLElement | string): string | null {
    if (typeof input === 'string') {
      // Try to extract from data-violet-field in HTML string
      const match = input.match(/data-violet-field=["']([^"']+)["']/);
      if (match) return match[1];
      // Try to map from label text
      const label = input.replace(/<[^>]+>/g, '').trim();
      return WordPressCommunication.mapLabelToFieldName(label);
    } else {
      // HTMLElement
      const attr = input.getAttribute('data-violet-field');
      if (attr) return attr;
      const label = input.textContent?.trim() || '';
      return WordPressCommunication.mapLabelToFieldName(label);
    }
  }

  /**
   * Helper: Determine if a field is simple (plain text) or rich
   */
  private static isSimpleField(fieldName: string): boolean {
    const simpleFields = [
      'nav_home', 'nav_about', 'nav_keynotes', 'nav_testimonials', 'nav_contact',
      'hero_cta', 'hero_title', 'hero_subtitle', 'button_text', 'link_text',
      // Add more as needed
    ];
    return simpleFields.includes(fieldName);
  }

  /**
   * Helper: Sanitize HTML for rich fields
   */
  private static sanitizeRichHTML(html: string): string {
    // Remove dangerous attributes, scripts, etc. (basic client-side)
    return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/javascript:/gi, '')
      .replace(/style="[^"]*expression[^"]*"/gi, '');
  }

  /**
   * Clean and deduplicate changes, extract real field names, strip HTML for simple fields
   */
  private prepareChangesForSave(changes: ContentChange[]): ContentChange[] {
    const cleaned: Record<string, ContentChange> = {};
    for (const change of changes) {
      let fieldName = change.field_name;
      // Always extract from content if generic_content or missing
      if (!fieldName || fieldName === 'generic_content') {
        fieldName = WordPressCommunication.extractFieldName(change.field_value);
        if (!fieldName) {
          console.warn('Skipping change with unknown field:', change);
          continue;
        }
      }
      let value = change.field_value;
      let format = change.format;
      let editor = change.editor;
      if (WordPressCommunication.isSimpleField(fieldName)) {
        // For simple fields, strip HTML
        const div = document.createElement('div');
        div.innerHTML = value;
        value = div.textContent || div.innerText || '';
        format = 'plain';
        editor = 'plain';
      } else {
        // For rich fields, sanitize HTML
        value = WordPressCommunication.sanitizeRichHTML(value);
        format = 'rich';
        editor = 'rich';
      }
      if (!value || !fieldName) {
        console.warn('Skipping empty or unknown field:', fieldName, value);
        continue;
      }
      cleaned[fieldName] = {
        field_name: fieldName,
        field_value: value,
        format,
        editor
      };
      console.log('Prepared change:', cleaned[fieldName]);
    }
    return Object.values(cleaned);
  }

  /**
   * Mark a field as changed (for batch save)
   */
  private markAsChanged(field: string, value: string) {
    if (!window.violetChanges) window.violetChanges = new Map();
    // Always use robust extraction and cleaning
    const fieldName = WordPressCommunication.extractFieldName(field) || field;
    const change: ContentChange = { field_name: fieldName, field_value: value };
    const cleaned = this.prepareChangesForSave([change]);
    if (cleaned.length > 0) {
      window.violetChanges.set(cleaned[0].field_name, cleaned[0]);
      this.sendToWordPress({ type: 'violet-content-changed', dirty: true });
    }
  }

  /**
   * Save all changes to WordPress
   */
  private async saveContent() {
    if (!window.violetChanges || window.violetChanges.size === 0) {
      this.sendToWordPress({
        type: 'violet-content-saved',
        success: true,
        message: 'No changes to save'
      });
      return;
    }
    // Prepare and clean changes
    const changes: ContentChange[] = Array.from(window.violetChanges.values());
    const cleaned = this.prepareChangesForSave(changes);
    if (cleaned.length === 0) {
      this.sendToWordPress({
        type: 'violet-content-saved',
        success: false,
        message: 'No valid changes to save'
      });
      return;
    }
    // Debug log
    console.log('🟣 [Violet] Saving cleaned changes:', cleaned);
    try {
      const VIOLET_API_KEY = import.meta.env.VITE_VIOLET_API_KEY || (window as any).VIOLET_API_KEY || '';
      if (!VIOLET_API_KEY) {
        console.warn('⚠️ VIOLET_API_KEY is missing! Saving will fail unless authenticated.');
      }
      const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/save-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Violet-API-Key': VIOLET_API_KEY,
          'X-WP-Nonce': (window as any).wpApiSettings?.nonce || ''
        },
        body: JSON.stringify({ changes: cleaned })
      });
      const result = await response.json();
      if (result.success) {
        window.violetChanges.clear();
        this.sendToWordPress({ type: 'violet-content-saved', success: true, message: result.message });
      } else {
        this.sendToWordPress({ type: 'violet-content-saved', success: false, message: result.message });
      }
    } catch (err) {
      console.error('🟣 [Violet] Save error:', err);
      this.sendToWordPress({ type: 'violet-content-saved', success: false, message: 'Save failed: ' + err });
    }
  }

  private async triggerRebuild() {
    try {
      const response = await fetch('https://api.netlify.com/build_hooks/684054a7aed5fdf9f3793a0f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trigger: 'manual_rebuild',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        this.sendToWordPress({
          type: 'violet-content-live',
          message: 'Site rebuild triggered successfully'
        });
      } else {
        throw new Error('Rebuild failed');
      }
    } catch (error) {
      this.sendToWordPress({
        type: 'violet-error',
        message: `Rebuild failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  public sendToWordPress(message: WordPressMessage) {
    if (window.parent && window.parent !== window.self) {
      console.log('📤 Sending to WordPress:', message.type);
      window.parent.postMessage(message, '*');
    }
  }
}

// Global interface extensions
declare global {
  interface Window {
    violetChanges: Map<string, ContentChange>;
    wordPressCommunication: WordPressCommunication;
  }
}

// Initialize communication
export const wordPressCommunication = new WordPressCommunication();
window.wordPressCommunication = wordPressCommunication;

export default wordPressCommunication;
