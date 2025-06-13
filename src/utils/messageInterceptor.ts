// Global message interceptor for debugging WordPress save issues
(() => {
  console.log('🎯 Installing global message interceptor for WordPress saves');
  
  // Store original addEventListener
  const originalAddEventListener = window.addEventListener;
  
  // Track all message listeners
  const messageListeners: EventListener[] = [];
  
  // Override addEventListener to track message listeners
  window.addEventListener = function(type: string, listener: EventListener, options?: any) {
    if (type === 'message') {
      messageListeners.push(listener);
      console.log('📎 Registered message listener:', listener.toString().substring(0, 100) + '...');
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  // Add our own global message handler
  originalAddEventListener.call(window, 'message', (event: MessageEvent) => {
    // Log all messages
    if (event.data?.type?.includes('violet')) {
      console.group('🔍 WordPress Message Intercepted');
      console.log('Type:', event.data.type);
      console.log('Origin:', event.origin);
      console.log('Data:', event.data);
      console.log('Message listeners count:', messageListeners.length);
      console.groupEnd();
      
      // If it's a save message, ensure it gets processed
      if (event.data.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
        console.log('💾 INTERCEPTED SAVE MESSAGE - Processing...');
        
        // Import and call the save function directly
        import('./contentPersistenceFix').then(module => {
          console.log('📦 Loaded persistence module, applying changes...');
          const result = module.applyWordPressSavedChanges(event.data.savedChanges);
          console.log('💾 Direct save result:', result);
        }).catch(err => {
          console.error('❌ Failed to load persistence module:', err);
        });
      }
    }
  });
  
  console.log('✅ Global message interceptor installed');
})();

export {};
