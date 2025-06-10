// IMMEDIATE FIX - Run this in React console to fix save persistence
(function() {
  console.log('🔧 Installing WordPress Save Fix...\n');
  
  // Remove all existing message listeners
  const oldListeners = getEventListeners(window).message || [];
  console.log(`Found ${oldListeners.length} existing message listeners`);
  
  // Create unified save handler
  let gracePeriodActive = false;
  
  const handleWordPressSave = (event) => {
    if (event.data?.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
      console.log('✅ Save message intercepted!', event.data);
      
      // Update localStorage
      const updates = {};
      event.data.savedChanges.forEach(change => {
        if (change.field_name && change.field_value !== undefined) {
          updates[change.field_name] = change.field_value;
        }
      });
      
      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('violet-content') || '{}');
      const merged = { ...existing, ...updates };
      localStorage.setItem('violet-content', JSON.stringify(merged));
      console.log('💾 Saved to localStorage:', updates);
      
      // Force update all matching elements
      Object.entries(updates).forEach(([field, value]) => {
        const elements = document.querySelectorAll(`[data-violet-field="${field}"]`);
        elements.forEach((element, index) => {
          console.log(`🔄 Updating element ${index + 1}/${elements.length} for ${field}`);
          
          // Update text content
          element.textContent = value;
          
          // Force React to re-render by changing the element
          const parent = element.parentNode;
          const next = element.nextSibling;
          parent.removeChild(element);
          parent.insertBefore(element, next);
          
          // Add visual feedback
          element.style.transition = 'background-color 0.5s';
          element.style.backgroundColor = 'yellow';
          setTimeout(() => {
            element.style.backgroundColor = '';
          }, 500);
        });
      });
      
      // Set grace period
      gracePeriodActive = true;
      setTimeout(() => {
        gracePeriodActive = false;
        console.log('✅ Grace period ended');
      }, 30000);
      
      // Trigger React updates
      window.dispatchEvent(new CustomEvent('violet-content-saved', {
        detail: { updates, timestamp: Date.now() }
      }));
      
      // Try to force React re-render
      const reactRoot = document.getElementById('root');
      if (reactRoot && reactRoot._reactRootContainer) {
        console.log('🔄 Forcing React re-render...');
        reactRoot._reactRootContainer.render(reactRoot._reactRootContainer.props.children);
      }
    }
  };
  
  // Install new handler at the beginning of the event queue
  window.removeEventListener('message', handleWordPressSave);
  window.addEventListener('message', handleWordPressSave, true); // Use capture phase
  
  console.log('✅ Fix installed!');
  console.log('\n🧪 Test it:');
  console.log('1. Edit some text');
  console.log('2. Click Save in WordPress toolbar');
  console.log('3. Text should turn yellow and STAY changed!');
  
  // Test function
  window.testWordPressSave = (value) => {
    window.postMessage({
      type: 'violet-apply-saved-changes',
      savedChanges: [{
        field_name: 'hero_title',
        field_value: value || 'TEST: ' + new Date().toLocaleTimeString()
      }],
      timestamp: Date.now()
    }, window.location.origin);
  };
  
  console.log('\n📝 Or test with: testWordPressSave("Your text here")');
})();