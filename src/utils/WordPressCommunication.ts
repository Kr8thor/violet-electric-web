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

  private markAsChanged(field: string, value: string) {
    // Store changed values for batch save
    if (!window.violetChanges) {
      window.violetChanges = new Map();
    }
    
    window.violetChanges.set(field, {
      field_name: field,
      field_value: value,
      format: 'rich',
      editor: 'rich'
    });

    // Notify WordPress of changes
    this.sendToWordPress({
      type: 'violet-content-changed',
      field: field,
      value: value,
      dirty: true
    });
  }

  private async saveContent() {
    if (!window.violetChanges || window.violetChanges.size === 0) {
      this.sendToWordPress({
        type: 'violet-content-saved',
        success: true,
        message: 'No changes to save'
      });
      return;
    }

    // Convert changes to array format
    const changes: ContentChange[] = Array.from(window.violetChanges.values());
    
    // Clean up duplicate field names by keeping the last value for each field
    const cleanedChanges = new Map<string, ContentChange>();
    changes.forEach(change => {
      cleanedChanges.set(change.field_name, change);
    });
    
    const finalChanges = Array.from(cleanedChanges.values());

    console.log('💾 Saving changes:', finalChanges);

    try {
      // Use the correct REST API endpoint
      const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/rich-content/save-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changes: finalChanges
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Clear changes after successful save
        window.violetChanges.clear();
        
        this.sendToWordPress({
          type: 'violet-content-saved',
          success: true,
          message: `Saved ${finalChanges.length} changes successfully`
        });
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (error) {
      console.error('❌ Save failed:', error);
      
      this.sendToWordPress({
        type: 'violet-content-saved',
        success: false,
        message: `Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
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
