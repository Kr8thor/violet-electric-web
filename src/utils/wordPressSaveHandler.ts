
/**
 * Enhanced WordPress Save Handler
 * Handles bidirectional communication between React and WordPress
 */

export class WordPressSaveHandler {
  private pendingChanges: Map<string, string> = new Map();
  private isConnected: boolean = false;
  
  constructor() {
    this.initializeMessageHandler();
    this.sendReadySignal();
  }
  
  private initializeMessageHandler() {
    window.addEventListener('message', (event) => {
      // Only accept messages from WordPress admin
      if (!event.origin.includes('violetrainwater.com')) {
        return;
      }
      
      console.log('📨 React received WordPress message:', event.data);
      
      switch (event.data.type) {
        case 'violet-enable-editing':
          this.handleEditingEnabled();
          break;
          
        case 'violet-disable-editing':
          this.handleEditingDisabled();
          break;
          
        case 'violet-apply-saved-changes':
          this.handleSaveRequest(event.data.savedChanges);
          break;
      }
    });
  }
  
  private handleEditingEnabled() {
    console.log('✅ WordPress enabled editing mode');
    this.isConnected = true;
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('violet-editing-enabled'));
    
    // Show visual indicators
    this.showEditingIndicators();
  }
  
  private handleEditingDisabled() {
    console.log('🔒 WordPress disabled editing mode');
    this.isConnected = false;
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('violet-editing-disabled'));
    
    // Hide visual indicators
    this.hideEditingIndicators();
  }
  
  private handleSaveRequest(savedChanges: any[]) {
    console.log('💾 Processing WordPress save request:', savedChanges);
    
    try {
      // Convert to content object
      const content: Record<string, string> = {};
      savedChanges.forEach(change => {
        if (change.field_name && change.field_value !== undefined) {
          content[change.field_name] = change.field_value;
        }
      });
      
      // Save to localStorage
      const storageData = {
        version: 'v1',
        timestamp: Date.now(),
        content
      };
      
      localStorage.setItem('violet-content', JSON.stringify(storageData));
      console.log('✅ Content saved to localStorage:', content);
      
      // Dispatch update event
      window.dispatchEvent(new CustomEvent('violet-content-updated', { 
        detail: content 
      }));
      
      // Send confirmation back to WordPress
      this.sendSaveConfirmation(true, savedChanges.map(c => c.field_name));
      
      // Show success notification
      this.showSaveNotification(true);
      
      // Reload to show changes
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (error) {
      console.error('❌ Save failed:', error);
      this.sendSaveConfirmation(false, []);
      this.showSaveNotification(false);
    }
  }
  
  private sendSaveConfirmation(success: boolean, savedFields: string[]) {
    if (window.parent !== window.self) {
      window.parent.postMessage({
        type: 'violet-save-confirmation',
        success,
        savedFields,
        timestamp: Date.now()
      }, '*');
    }
  }
  
  private sendReadySignal() {
    const sendReady = () => {
      if (window.parent !== window.self) {
        window.parent.postMessage({
          type: 'violet-react-ready',
          capabilities: ['content-editing', 'save-persistence', 'live-preview'],
          timestamp: Date.now()
        }, '*');
      }
    };
    
    // Send multiple ready signals
    sendReady();
    setTimeout(sendReady, 500);
    setTimeout(sendReady, 1000);
  }
  
  public trackContentChange(field: string, value: string) {
    this.pendingChanges.set(field, value);
    
    // Notify WordPress of content change
    if (window.parent !== window.self) {
      window.parent.postMessage({
        type: 'violet-content-changed',
        field,
        value,
        timestamp: Date.now()
      }, '*');
    }
    
    console.log('📝 Content change tracked:', field, '=', value);
  }
  
  private showEditingIndicators() {
    // Add visual editing indicators to the page
    const indicator = document.createElement('div');
    indicator.id = 'violet-editing-indicator';
    indicator.innerHTML = `
      <div style="
        position: fixed;
        top: 10px;
        left: 10px;
        background: #00a32a;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: bold;
        z-index: 99999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      ">
        ✏️ Edit Mode Active
      </div>
    `;
    document.body.appendChild(indicator);
  }
  
  private hideEditingIndicators() {
    const indicator = document.getElementById('violet-editing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
  
  private showSaveNotification(success: boolean) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${success ? '#10b981' : '#ef4444'};
      color: white;
      border-radius: 8px;
      font-weight: 600;
      z-index: 99999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = success ? '✅ Changes saved!' : '❌ Save failed';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }
  
  public isEditingEnabled(): boolean {
    return this.isConnected;
  }
  
  public getPendingChanges(): Record<string, string> {
    return Object.fromEntries(this.pendingChanges);
  }
}

// Initialize the save handler
export const wordPressSaveHandler = new WordPressSaveHandler();

// Make it globally available for debugging
if (typeof window !== 'undefined') {
  (window as any).wordPressSaveHandler = wordPressSaveHandler;
}
