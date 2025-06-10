// Initialize debug tools immediately when in iframe with edit mode
if (
  typeof window !== 'undefined' &&
  window.location.search.includes('edit_mode=1') &&
  !window.violetDebug &&
  import.meta.env && import.meta.env.DEV // Only in development
) {
  console.log('🔧 Auto-initializing debug tools for edit mode (DEV only)...');
  import('./debugTools').then(({ default: initializeDebugTools }) => {
    initializeDebugTools();
  }).catch(err => {
    console.error('Failed to load debug tools:', err);
  });
}

export default null;
