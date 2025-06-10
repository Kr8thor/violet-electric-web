// QUICK FIX: Load this script tag into your HTML to fix content persistence
// Add to your index.html or paste in console

(function() {
    // Only run once
    if (window._violetPersistenceFix) return;
    window._violetPersistenceFix = true;

    console.log('🚀 Violet Content Persistence Fix v2.0 Loading...');

    // 1. Override localStorage to protect content during grace period
    const originalStorage = {
        setItem: localStorage.setItem.bind(localStorage),
        getItem: localStorage.getItem.bind(localStorage),
        removeItem: localStorage.removeItem.bind(localStorage)
    };

    // Protected content management
    let protectedContent = null;
    let graceEndTime = 0;

    // Override setItem to protect content
    localStorage.setItem = function(key, value) {
        if (key === 'violet-content' && graceEndTime > Date.now()) {
            console.log('🛡️ Content protected during grace period');
            return; // Don't allow overwrites during grace period
        }
        return originalStorage.setItem(key, value);
    };

    // 2. Enhanced message handler for WordPress saves
    const handleWordPressSave = (event) => {
        if (event.data.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
            console.log('💾 WordPress save detected - protecting content for 30 seconds');

            // Extract and merge changes
            const updates = {};
            event.data.savedChanges.forEach(change => {
                if (change.field_name && change.field_value !== undefined) {
                    updates[change.field_name] = change.field_value;
                }
            });

            // Get current content
            const currentContent = JSON.parse(originalStorage.getItem('violet-content') || '{}');
            const mergedContent = { ...currentContent, ...updates };

            // Save protected content
            protectedContent = mergedContent;
            graceEndTime = Date.now() + 30000;
            
            // Force save the protected content
            originalStorage.setItem('violet-content', JSON.stringify(mergedContent));
            originalStorage.setItem('violet-protected-content', JSON.stringify(mergedContent));
            originalStorage.setItem('violet-grace-period-end', graceEndTime.toString());

            // Update UI immediately
            requestAnimationFrame(() => {
                Object.entries(updates).forEach(([field, value]) => {
                    const elements = document.querySelectorAll(`[data-violet-field="${field}"]`);
                    elements.forEach(el => {
                        if (el.textContent !== value) {
                            el.textContent = value;
                            // Visual feedback
                            el.style.transition = 'all 0.3s ease';
                            el.style.backgroundColor = 'rgba(255, 235, 59, 0.3)';
                            el.style.transform = 'scale(1.02)';
                            setTimeout(() => {
                                el.style.backgroundColor = '';
                                el.style.transform = '';
                            }, 2000);
                        }
                    });
                });
            });

            // Force React update
            window.dispatchEvent(new CustomEvent('violet-content-updated', { detail: updates }));

            // Start grace period countdown
            console.log(`⏰ Grace period active for 30 seconds`);
            const countdownInterval = setInterval(() => {
                const remaining = Math.ceil((graceEndTime - Date.now()) / 1000);
                if (remaining <= 0) {
                    clearInterval(countdownInterval);
                    console.log('✅ Grace period ended - normal sync resumed');
                    graceEndTime = 0;
                    protectedContent = null;
                } else if (remaining % 10 === 0) {
                    console.log(`⏰ Grace period: ${remaining}s remaining`);
                }
            }, 1000);
        }
    };

    // 3. Protect content during grace period
    setInterval(() => {
        if (graceEndTime > Date.now() && protectedContent) {
            const currentStored = originalStorage.getItem('violet-content');
            const protectedStr = JSON.stringify(protectedContent);
            
            if (currentStored !== protectedStr) {
                console.log('🛡️ Restoring protected content');
                originalStorage.setItem('violet-content', protectedStr);
                window.dispatchEvent(new CustomEvent('violet-content-updated', { 
                    detail: protectedContent 
                }));
            }
        }
    }, 100);

    // 4. Install message handler
    window.addEventListener('message', handleWordPressSave);

    // 5. Add debug helper
    window.violetPersistenceDebug = {
        isProtected: () => graceEndTime > Date.now(),
        timeRemaining: () => Math.max(0, Math.ceil((graceEndTime - Date.now()) / 1000)),
        getProtectedContent: () => protectedContent,
        clearProtection: () => {
            graceEndTime = 0;
            protectedContent = null;
            console.log('🗑️ Protection cleared');
        }
    };

    console.log('✅ Violet Content Persistence Fix v2.0 Active!');
    console.log('📝 Edit content and save - it will now persist properly');
    console.log('🛠️ Debug with: window.violetPersistenceDebug');
})();

// To use: Include this script in your HTML or paste in console