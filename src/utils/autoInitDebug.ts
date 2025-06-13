// Initialize debug tools immediately when in iframe with edit mode
if (typeof window !== 'undefined' && 
    window.location.search.includes('edit_mode=1') && 
    !window.violetDebug) {
  
  console.log('🔧 Auto-initializing debug tools for edit mode...');
  
  import('./debugTools').then(({ default: initializeDebugTools }) => {
    initializeDebugTools();
  }).catch(err => {
    console.error('Failed to load debug tools:', err);
  });
}

export default null;
