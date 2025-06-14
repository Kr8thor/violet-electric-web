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
      
      // Make element editable and add click handler
      element.addEventListener('click', this.handleElementClick.bind(this));
      
      // Add visual editing indicators
      const htmlElement = element as HTMLElement;
      htmlElement.style.outline = '2px dashed #0073aa';
      htmlElement.style.outlineOffset = '2px';
      htmlElement.style.cursor = 'text';
    });

    this.sendToWordPress({
      type: 'violet-editing-enabled',
      message: 'Editing mode activated'
    });
  }

  private disableEditing() {
    // Remove editing indicators
    document.querySelectorAll('[data-violet-editable]').forEach(element => {
      element.removeAttribute('data-violet-editable');
      element.removeEventListener('click', this.handleElementClick.bind(this));
      
      // Remove visual indicators
      const htmlElement = element as HTMLElement;
      htmlElement.style.outline = '';
      htmlElement.style.outlineOffset = '';
      htmlElement.style.cursor = '';
    });

    this.sendToWordPress({
      type: 'violet-editing-disabled',
      message: 'Editing mode deactivated'
    });
  }

  private handleElementClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const element = event.target as HTMLElement;
    const field = element.getAttribute('data-violet-field');
    const currentValue = this.getCleanTextContent(element);

    if (field) {
      console.log('🎯 Element clicked for editing:', field, currentValue);
      
      // For now, use simple prompt - can be enhanced to rich text modal later
      const newValue = prompt(`Edit ${field}:`, currentValue);
      
      if (newValue !== null && newValue !== currentValue) {
        this.updateElementContent(element, newValue);
        this.markAsChanged(field, newValue);
      }
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
