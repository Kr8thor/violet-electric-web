// IMMEDIATE FIX: Paste this in your browser console on the React site

(function() {
    console.log('🔧 Applying immediate content persistence fix...');
    
    // Force content to persist by intercepting all updates
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        if (key === 'violet-content' && localStorage.getItem('violet-grace-period-end')) {
            const graceEnd = parseInt(localStorage.getItem('violet-grace-period-end'));
            if (graceEnd > Date.now()) {
                console.log('🛡️ Blocking content overwrite during grace period');
                const protectedContent = localStorage.getItem('violet-protected-content');
                if (protectedContent) {
                    return originalSetItem.call(this, key, protectedContent);
                }
            }
        }
        return originalSetItem.call(this, key, value);
    };
    
    // Enhanced save handler
    window.addEventListener('message', (event) => {
        if (event.data.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
            console.log('💾 Applying saved changes with protection...');
            
            const updates = {};
            event.data.savedChanges.forEach(change => {
                if (change.field_name && change.field_value !== undefined) {
                    updates[change.field_name] = change.field_value;
                }
            });
            
            // Force update all matching elements immediately
            setTimeout(() => {
                Object.entries(updates).forEach(([field, value]) => {
                    const elements = document.querySelectorAll(`[data-violet-field="${field}"]`);
                    elements.forEach(el => {
                        if (el.textContent !== value) {
                            console.log(`📝 Updating ${field}: "${el.textContent}" → "${value}"`);
                            el.textContent = value;
                            el.style.transition = 'background-color 0.5s';
                            el.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                            setTimeout(() => {
                                el.style.backgroundColor = '';
                            }, 2000);
                        }
                    });
                });
                
                // Also force React to re-render
                const event = new CustomEvent('violet-force-update', { detail: updates });
                window.dispatchEvent(event);
            }, 100);
        }
    });
    
    console.log('✅ Fix applied! Your edits should now persist after saving.');
    console.log('📌 This fix will remain active until you refresh the page.');
})();
