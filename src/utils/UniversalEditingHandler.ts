import { wordPressCommunication } from './WordPressCommunication';

interface EditRequest {
  type: string;
  field: string;
  [key: string]: any;
}

class UniversalEditingMessageHandler {
  private pendingChanges = new Map<string, any>();
  private previewCallbacks = new Map<string, (value: any) => void>();

  constructor() {
    this.initializeHandlers();
  }

  private initializeHandlers() {
    // Handle connection test
    wordPressCommunication.onMessage('violet-test-connection', () => {
      wordPressCommunication.sendToWordPress({
        type: 'violet-connection-ready',
        data: {
          timestamp: Date.now(),
          universalEditingReady: true
        }
      });
    });

    // Handle edit mode toggle
    wordPressCommunication.onMessage('violet-enable-editing', () => {
      this.enableUniversalEditing();
    });

    wordPressCommunication.onMessage('violet-disable-editing', () => {
      this.disableUniversalEditing();
    });

    // Handle preview updates
    wordPressCommunication.onMessage('violet-update-preview', (data) => {
      this.updatePreview(data.field, data.value, data.contentType);
    });

    // Handle content refresh
    wordPressCommunication.onMessage('violet-refresh-content', () => {
      this.refreshContent();
    });

    // Handle save notifications
    wordPressCommunication.onMessage('violet-content-saved', (data) => {
      this.handleContentSaved(data);
    });
  }

  private enableUniversalEditing() {
    console.log('🎨 Enabling universal editing mode');
    document.body.classList.add('violet-universal-editing');
    
    // Add editing styles
    this.injectEditingStyles();
    
    // Enable editing on all editable elements
    this.enableEditingOnElements();
    
    // Dispatch custom event for components
    window.dispatchEvent(new CustomEvent('violet-universal-editing-enabled'));
  }

  private disableUniversalEditing() {
    console.log('🔒 Disabling universal editing mode');
    document.body.classList.remove('violet-universal-editing');
    
    // Remove editing styles
    this.removeEditingStyles();
    
    // Disable editing on all elements
    this.disableEditingOnElements();
    
    // Clear pending changes
    this.pendingChanges.clear();
    
    // Dispatch custom event for components
    window.dispatchEvent(new CustomEvent('violet-universal-editing-disabled'));
  }

  private injectEditingStyles() {
    if (document.getElementById('violet-editing-styles')) return;
    
    const styles = `
      <style id="violet-editing-styles">
        /* Base editing styles */
        .violet-universal-editing [data-violet-field]:hover {
          outline: 2px dashed #3b82f6 !important;
          outline-offset: 2px !important;
          cursor: pointer !important;
        }
        
        /* Fix text direction for contentEditable */
        .violet-universal-editing [contenteditable="true"] {
          direction: ltr !important;
          text-align: inherit !important;
          unicode-bidi: normal !important;
        }
        
        /* Fix input elements direction */
        .violet-universal-editing input[type="text"],
        .violet-universal-editing textarea,
        .violet-universal-editing [contenteditable] {
          direction: ltr !important;
          text-align: left !important;
        }
        
        .violet-universal-editing [data-violet-type="image"]:hover {
          outline-color: #10b981 !important;
        }
        
        .violet-universal-editing [data-violet-type="button"]:hover {
          outline-color: #f59e0b !important;
        }
        
        .violet-universal-editing [data-violet-type="color"]:hover {
          outline-color: #ef4444 !important;
        }
        
        .violet-universal-editing [data-violet-container]:hover {
          outline: 2px dashed #8b5cf6 !important;
          outline-offset: 4px !important;
        }
        
        .violet-editing-indicator {
          position: absolute;
          top: -30px;
          left: 0;
          background: #3b82f6;
          color: white;
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 4px;
          z-index: 1000;
          pointer-events: none;
          direction: ltr !important;
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  private removeEditingStyles() {
    const styleElement = document.getElementById('violet-editing-styles');
    if (styleElement) {
      styleElement.remove();
    }
  }

  private enableEditingOnElements() {
    // Add editing capabilities to all elements with data-violet-field
    document.querySelectorAll('[data-violet-field]').forEach((element) => {
      const el = element as HTMLElement;
      el.style.position = 'relative';
      
      // Add click handler for editing
      el.addEventListener('click', this.handleElementClick.bind(this));
    });
  }

  private disableEditingOnElements() {
    document.querySelectorAll('[data-violet-field]').forEach((element) => {
      const el = element as HTMLElement;
      el.removeEventListener('click', this.handleElementClick.bind(this));
    });
  }

  private handleElementClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.currentTarget as HTMLElement;
    const field = element.dataset.violetField;
    const type = element.dataset.violetType || 'text';
    
    if (!field) return;
    
    // Send edit request to WordPress based on element type
    switch (type) {
      case 'text':
        this.requestTextEdit(element, field);
        break;
      case 'image':
        this.requestImageEdit(element, field);
        break;
      case 'button':
        this.requestButtonEdit(element, field);
        break;
      case 'link':
        this.requestLinkEdit(element, field);
        break;
      case 'color':
        this.requestColorEdit(element, field);
        break;
      default:
        this.requestTextEdit(element, field);
    }
  }

  private requestTextEdit(element: HTMLElement, field: string) {
    const currentValue = element.textContent || '';
    
    wordPressCommunication.sendToWordPress({
      type: 'violet-edit-text',
      field,
      currentValue,
      elementType: element.tagName.toLowerCase()
    });
  }

  private requestImageEdit(element: HTMLElement, field: string) {
    const img = element.querySelector('img') || element as HTMLImageElement;
    const currentSrc = img.getAttribute('src') || '';
    const alt = img.getAttribute('alt') || '';
    
    wordPressCommunication.sendToWordPress({
      type: 'violet-edit-image',
      field,
      currentSrc,
      alt
    });
  }

  private requestButtonEdit(element: HTMLElement, field: string) {
    const button = element.querySelector('a, button') || element;
    const currentText = button.textContent || '';
    const currentUrl = button.getAttribute('href') || '';
    const currentColor = window.getComputedStyle(button).backgroundColor;
    
    wordPressCommunication.sendToWordPress({
      type: 'violet-edit-button',
      field,
      textField: `${field}_text`,
      urlField: `${field}_url`,
      colorField: `${field}_color`,
      currentText,
      currentUrl,
      currentColor
    });
  }

  private requestLinkEdit(element: HTMLElement, field: string) {
    const link = element.querySelector('a') || element as HTMLAnchorElement;
    const currentText = link.textContent || '';
    const currentUrl = link.getAttribute('href') || '';
    const target = link.getAttribute('target') || '_self';
    
    wordPressCommunication.sendToWordPress({
      type: 'violet-edit-link',
      field,
      textField: `${field}_text`,
      urlField: `${field}_url`,
      currentText,
      currentUrl,
      target
    });
  }

  private requestColorEdit(element: HTMLElement, field: string) {
    const currentColor = window.getComputedStyle(element).color;
    const property = 'color'; // Could be enhanced to detect property type
    
    wordPressCommunication.sendToWordPress({
      type: 'violet-edit-color',
      field,
      currentColor,
      property
    });
  }

  private updatePreview(field: string, value: any, contentType: string) {
    const element = document.querySelector(`[data-violet-field="${field}"]`);
    if (!element) return;

    console.log(`🔄 Updating preview: ${field} = ${value} (${contentType})`);

    switch (contentType) {
      case 'text':
        element.textContent = value;
        break;
      case 'image':
        const img = element.querySelector('img') || element as HTMLImageElement;
        if (img) img.src = value;
        break;
      case 'color':
        (element as HTMLElement).style.color = value;
        break;
      default:
        element.textContent = value;
    }
  }

  private handleContentSaved(data: any) {
    console.log('✅ Content saved, handling update:', data);
    
    // Trigger content refresh
    setTimeout(() => {
      this.refreshContent();
    }, 1000);
  }

  private refreshContent() {
    console.log('🔄 Refreshing content...');
    
    // Dispatch event for content providers to refresh
    window.dispatchEvent(new CustomEvent('violet-refresh-wordpress-content'));
    
    // Alternative: force page reload after a delay
    setTimeout(() => {
      if (confirm('Content has been updated. Refresh the page to see all changes?')) {
        window.location.reload();
      }
    }, 2000);
  }
}

// Create singleton instance
export const universalEditingHandler = new UniversalEditingMessageHandler();

// Export for use in App.tsx
export default universalEditingHandler;
