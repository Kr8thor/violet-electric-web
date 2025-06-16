
export interface WordPressMessageData {
  type: string;
  [key: string]: any;
}

export class WordPressMessageHandler {
  private debugMode: boolean;
  private allowedOrigins = ['violetrainwater.com', 'wp.violetrainwater.com'];

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode;
  }

  sendToWordPress = (action: string, data: any) => {
    if (window.parent && window.parent !== window) {
      const message = {
        type: `violet-${action}`,
        data,
        timestamp: new Date().toISOString(),
        source: 'react-app'
      };
      
      window.parent.postMessage(message, '*');
      
      if (this.debugMode) {
        console.log('📤 Sent to WordPress:', message);
      }
    }
  };

  saveToWordPress = async (fieldId: string, value: string, fieldType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const messageId = `save-${Date.now()}`;
      
      const handleResponse = (event: MessageEvent) => {
        if (event.data.type === 'violet-save-response' && event.data.id === messageId) {
          window.removeEventListener('message', handleResponse);
          if (event.data.success) {
            console.log('✅ WordPress save successful');
            resolve();
          } else {
            console.error('❌ WordPress save failed:', event.data.error);
            reject(new Error(event.data.error || 'Save failed'));
          }
        }
      };
      
      window.addEventListener('message', handleResponse);
      
      this.sendToWordPress('save-content', {
        id: messageId,
        fieldId,
        value,
        fieldType
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('Save timeout'));
      }, 10000);
    });
  };

  createMessageHandler = (
    onEnableEditing: () => void,
    onDisableEditing: () => void,
    onContentUpdated: (data: any) => void
  ) => {
    return (event: MessageEvent) => {
      // Enhanced security check
      const originDomain = event.origin.replace(/^https?:\/\//, '');
      
      if (!this.allowedOrigins.some(domain => originDomain.includes(domain))) {
        return;
      }
      
      if (this.debugMode) {
        console.log('📨 Received from WordPress:', event.data);
      }
      
      switch (event.data.type) {
        case 'violet-enable-editing':
          console.log('✏️ WordPress enabled editing mode');
          onEnableEditing();
          break;
          
        case 'violet-disable-editing':
          console.log('🔒 WordPress disabled editing mode');
          onDisableEditing();
          break;
          
        case 'violet-test-access':
          const source = event.source as Window;
          source?.postMessage({
            type: 'violet-access-confirmed',
            success: true,
            timestamp: new Date().toISOString(),
            capabilities: [
              'enhanced-field-detection',
              'inline-editing',
              'visual-indicators',
              'optimistic-updates'
            ]
          }, event.origin);
          break;
          
        case 'violet-content-updated':
          onContentUpdated(event.data);
          break;
      }
    };
  };

  sendReadySignal = () => {
    const sendReady = () => {
      this.sendToWordPress('iframe-ready', {
        version: '2.1',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        capabilities: [
          'enhanced-field-detection',
          'inline-editing',
          'visual-indicators',
          'optimistic-updates',
          'performance-management',
          'unsaved-changes-warning'
        ],
        debugMode: this.debugMode
      });
    };
    
    sendReady();
    setTimeout(sendReady, 1000);
  };
}
