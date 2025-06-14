/**
 * WordPress Communication Module
 * Handles bidirectional communication between React app and WordPress admin
 */

export interface WordPressMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

export class WordPressCommunication {
  private initialized = false;
  private retryCount = 0;
  private maxRetries = 10;
  private retryInterval = 1000; // Start with 1 second

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.initialized) return;
    
    // Check if we're in WordPress iframe context
    if (window.parent === window.self) {
      console.log('ℹ️ Not in WordPress iframe context');
      return;
    }

    // Check URL parameters for WordPress context
    const urlParams = new URLSearchParams(window.location.search);
    const isWordPressContext = urlParams.has('edit_mode') && urlParams.has('wp_admin');
    
    if (!isWordPressContext) {
      console.log('ℹ️ Not in WordPress editing context');
      return;
    }

    console.log('🚀 Initializing WordPress communication...');
    this.setupMessageHandlers();
    this.sendInitialHandshake();
    this.initialized = true;
  }

  private setupMessageHandlers() {
    window.addEventListener('message', (event: MessageEvent) => {
      // Validate origin for security
      if (!this.isValidOrigin(event.origin)) {
        return;
      }

      const message = event.data as WordPressMessage;
      if (!message.type || !message.type.startsWith('violet-')) {
        return;
      }

      console.log('📨 Received from WordPress:', message.type, message.data);
      this.handleWordPressMessage(message);
    });
  }

  private isValidOrigin(origin: string): boolean {
    const allowedOrigins = [
      'https://wp.violetrainwater.com',
      'https://violetrainwater.com',
      'http://localhost:3000',
      'http://localhost:8080'
    ];
    return allowedOrigins.includes(origin);
  }

  private handleWordPressMessage(message: WordPressMessage) {
    switch (message.type) {
      case 'violet-connection-test':
        this.sendToWordPress({
          type: 'violet-connection-response',
          data: {
            status: 'connected',
            timestamp: Date.now(),
            reactVersion: '18.x',
            capabilities: ['rich-text', 'universal-editing', 'real-time-preview']
          }
        });
        break;

      case 'violet-enable-editing':
        this.broadcastToApp('violet-enable-editing', message.data);
        break;

      case 'violet-disable-editing':
        this.broadcastToApp('violet-disable-editing', message.data);
        break;

      case 'violet-save-content':
        this.broadcastToApp('violet-save-content', message.data);
        break;

      case 'violet-open-rich-text-modal':
        this.broadcastToApp('violet-open-rich-text-modal', message.data);
        break;

      default:
        // Broadcast unknown messages to the app
        this.broadcastToApp(message.type, message.data);
        break;
    }
  }

  private broadcastToApp(type: string, data?: any) {
    // Dispatch custom event for app components to listen to
    window.dispatchEvent(new CustomEvent('wordpress-message', {
      detail: { type, data }
    }));
  }

  private sendInitialHandshake() {
    this.sendReadyMessage();
    
    // Setup retry logic
    this.setupRetryLogic();
  }

  private sendReadyMessage() {
    const readyMessage: WordPressMessage = {
      type: 'violet-iframe-ready',
      data: {
        url: window.location.href,
        timestamp: Date.now(),
        reactAppReady: true,
        richTextCapable: true,
        universalEditingEnabled: true,
        version: '1.0.0',
        capabilities: [
          'text-editing',
          'image-upload',
          'color-picker',
          'button-editing',
          'link-management',
          'section-control',
          'rich-text-modal',
          'real-time-preview',
          'batch-saving'
        ],
        status: 'ready'
      },
      timestamp: Date.now()
    };

    this.sendToWordPress(readyMessage);
    console.log('📤 Sent ready message to WordPress:', readyMessage);
  }

  private setupRetryLogic() {
    // Retry sending ready message with exponential backoff
    const retryIntervals = [500, 1000, 2000, 3000, 5000];
    
    retryIntervals.forEach((delay, index) => {
      setTimeout(() => {
        if (this.retryCount < this.maxRetries) {
          console.log(`🔄 Retry ${index + 1}: Sending ready message to WordPress`);
          this.sendReadyMessage();
          this.retryCount++;
        }
      }, delay);
    });
  }

  public sendToWordPress(message: WordPressMessage) {
    if (window.parent === window.self) {
      console.log('⚠️ Cannot send to WordPress - not in iframe context');
      return;
    }

    try {
      window.parent.postMessage(message, '*');
      console.log('📤 Sent to WordPress:', message.type, message.data);
    } catch (error) {
      console.error('❌ Failed to send message to WordPress:', error);
    }
  }

  public notifyContentChanged(field: string, value: string) {
    this.sendToWordPress({
      type: 'violet-content-changed',
      data: {
        field,
        value,
        timestamp: Date.now()
      }
    });
  }

  public notifyContentSaved(changes: any[]) {
    this.sendToWordPress({
      type: 'violet-content-saved',
      data: {
        changes,
        timestamp: Date.now(),
        success: true
      }
    });
  }

  public notifyError(error: string, details?: any) {
    this.sendToWordPress({
      type: 'violet-error',
      data: {
        error,
        details,
        timestamp: Date.now()
      }
    });
  }

  public isInWordPressContext(): boolean {
    return this.initialized && window.parent !== window.self;
  }
}

// Create singleton instance
export const wordPressCommunication = new WordPressCommunication();

// Export for backward compatibility
export default wordPressCommunication;