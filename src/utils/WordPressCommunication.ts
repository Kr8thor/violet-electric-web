/**
 * WordPress Communication Handler
 * Manages all postMessage communication between React app and WordPress admin
 */

export interface WordPressMessage {
  type: string;
  data?: any;
  timestamp?: number;
  from?: string;
}

class WordPressCommunication {
  private isInitialized = false;
  private messageHandlers: Map<string, Function[]> = new Map();
  private isInWordPressIframe = false;
  private wordPressOrigin = '*'; // Will be set dynamically

  constructor() {
    this.detectWordPressContext();
    this.setupMessageListener();
    this.sendInitialReadyMessage();
  }

  private detectWordPressContext(): void {
    const urlParams = new URLSearchParams(window.location.search);
    this.isInWordPressIframe = urlParams.has('edit_mode') && 
                               urlParams.has('wp_admin') && 
                               window.parent !== window.self;
    
    // Get WordPress origin from URL parameter if available
    const wpOriginParam = urlParams.get('wp_origin');
    if (wpOriginParam) {
      this.wordPressOrigin = wpOriginParam;
      console.log('🎯 WordPress origin detected:', this.wordPressOrigin);
    }

    console.log('🔍 WordPress context:', {
      inIframe: this.isInWordPressIframe,
      editMode: urlParams.has('edit_mode'),
      wpAdmin: urlParams.has('wp_admin'),
      origin: this.wordPressOrigin
    });
  }

  private setupMessageListener(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      // Security check for WordPress origins
      const allowedOrigins = [
        'https://wp.violetrainwater.com',
        'https://violetrainwater.com',
        this.wordPressOrigin
      ].filter(origin => origin && origin !== '*');

      const isValidOrigin = allowedOrigins.some(origin => 
        event.origin === origin || event.origin.includes('violetrainwater.com')
      );

      if (!isValidOrigin && this.wordPressOrigin !== '*') {
        console.log('🚫 Blocked message from untrusted origin:', event.origin);
        return;
      }

      if (event.data?.type?.startsWith('violet-')) {
        console.log('📨 Received WordPress message:', event.data.type, event.data);
        this.handleMessage(event.data, event);
      }
    });

    console.log('✅ WordPress message listener initialized');
  }

  private sendInitialReadyMessage(): void {
    if (!this.isInWordPressIframe) {
      console.log('ℹ️ Not in WordPress iframe - skipping ready message');
      return;
    }

    // Send ready message immediately
    this.sendToWordPress({
      type: 'violet-iframe-ready',
      data: {
        url: window.location.href,
        title: document.title,
        timestamp: Date.now(),
        reactAppReady: true,
        tripleFailsafeEnabled: true
      }
    });

    // Also send after a delay to ensure WordPress is ready
    setTimeout(() => {
      this.sendToWordPress({
        type: 'violet-iframe-ready',
        data: {
          url: window.location.href,
          title: document.title,
          timestamp: Date.now(),
          reactAppReady: true,
          tripleFailsafeEnabled: true,
          delayed: true
        }
      });
    }, 1000);

    console.log('📤 Sent initial ready messages to WordPress');
  }

  public sendToWordPress(message: WordPressMessage): void {
    if (!this.isInWordPressIframe) {
      console.log('ℹ️ Not in WordPress iframe - message not sent:', message.type);
      return;
    }

    try {
      const messageWithTimestamp = {
        ...message,
        timestamp: message.timestamp || Date.now(),
        from: 'react-app'
      };

      window.parent.postMessage(messageWithTimestamp, this.wordPressOrigin);
      console.log('📤 Sent to WordPress:', message.type, messageWithTimestamp);
    } catch (error) {
      console.error('❌ Failed to send message to WordPress:', error);
    }
  }

  public onMessage(type: string, handler: Function): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)?.push(handler);
  }

  private handleMessage(data: any, event: MessageEvent): void {
    const handlers = this.messageHandlers.get(data.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data, event);
        } catch (error) {
          console.error(`❌ Error in handler for ${data.type}:`, error);
        }
      });
    } else {
      console.log('⚠️ No handler for message type:', data.type);
    }
  }

  // Enhanced methods for editor functionality
  public reportContentChange(fieldType: string, value: string): void {
    this.sendToWordPress({
      type: 'violet-content-changed',
      data: {
        fieldType,
        value,
        timestamp: Date.now()
      }
    });
  }

  public confirmAccessReady(): void {
    this.sendToWordPress({
      type: 'violet-access-confirmed',
      data: {
        success: true,
        timestamp: Date.now()
      }
    });
  }

  public reportSaveComplete(fieldType: string, success: boolean): void {
    this.sendToWordPress({
      type: 'violet-save-confirmed',
      data: {
        fieldType,
        success,
        timestamp: Date.now()
      }
    });
  }

  public getIsInWordPressIframe(): boolean {
    return this.isInWordPressIframe;
  }
}

// Create singleton instance
export const wordPressCommunication = new WordPressCommunication();

// Export convenient functions
export const sendToWordPress = (message: WordPressMessage) => 
  wordPressCommunication.sendToWordPress(message);

export const onWordPressMessage = (type: string, handler: Function) => 
  wordPressCommunication.onMessage(type, handler);

export const isInWordPressIframe = () => 
  wordPressCommunication.getIsInWordPressIframe();

export default wordPressCommunication;
