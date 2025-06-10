/**
 * Enhanced WordPress Editor Integration with Triple Failsafe
 * This script ensures the triple failsafe system works in WordPress editor
 */

console.log('🛡️ Initializing Triple Failsafe for WordPress Editor...');

// Check if we're in WordPress editor context
const isInWordPressEditor = () => {
    return window.parent !== window && 
           (window.location.search.includes('edit_mode=1') || 
            window.location.search.includes('wp_admin=1'));
};

// Initialize triple failsafe for WordPress editor
const initializeWordPressFailsafe = async () => {
    console.log('🔄 WordPress Editor Context Detected');
    
    // Ensure triple failsafe is available
    if (!window.tripleFailsafe && !window.violetTripleFailsafe) {
        console.error('❌ Triple Failsafe system not available!');
        console.log('⏳ Waiting for system to initialize...');
        
        // Wait for system to be available
        let attempts = 0;
        const waitForSystem = setInterval(async () => {
            attempts++;
            
            if (window.violetTripleFailsafe || attempts > 30) {
                clearInterval(waitForSystem);
                
                if (window.violetTripleFailsafe) {
                    console.log('✅ Triple Failsafe system now available!');
                    setupWordPressHandlers();
                } else {
                    console.error('❌ Triple Failsafe system failed to initialize after 30 seconds');
                }
            }
        }, 1000);
    } else {
        console.log('✅ Triple Failsafe system already available');
        setupWordPressHandlers();
    }
};

// Setup WordPress-specific message handlers
const setupWordPressHandlers = () => {
    console.log('📡 Setting up WordPress message handlers...');
    
    // Override the window message handler to ensure triple failsafe is used
    const originalHandler = window.onmessage;
    
    window.addEventListener('message', async (event) => {
        // Check for WordPress save messages
        if (event.data.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
            console.log('💾 WORDPRESS EDITOR: Intercepting save for triple failsafe');
            
            // Convert to triple failsafe format
            const updates = event.data.savedChanges.map(change => ({
                field_name: change.field_name,
                field_value: change.field_value || ''
            }));
            
            // Use triple failsafe if available
            if (window.violetTripleFailsafe) {
                console.log('🛡️ Using Triple Failsafe system for WordPress save');
                
                // Save to all layers
                for (const update of updates) {
                    await window.violetTripleFailsafe.testSave(update.field_name, update.field_value);
                }
                
                console.log('✅ WordPress save completed with triple failsafe');
                
                // Notify WordPress that save is complete
                if (event.source) {
                    event.source.postMessage({
                        type: 'violet-save-confirmed',
                        timestamp: Date.now(),
                        savedTo: 'triple-failsafe'
                    }, event.origin);
                }
            }
        }
    });
    
    // Send ready signal to WordPress
    window.parent.postMessage({
        type: 'violet-iframe-ready',
        tripleFailsafeEnabled: true,
        timestamp: Date.now()
    }, '*');
    
    console.log('✅ WordPress Triple Failsafe handlers ready');
};

// Auto-initialize if in WordPress editor
if (isInWordPressEditor()) {
    // Wait for DOM and React to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWordPressFailsafe);
    } else {
        // Delay slightly to ensure React components are mounted
        setTimeout(initializeWordPressFailsafe, 1000);
    }
}

// Export for manual initialization
window.initializeWordPressFailsafe = initializeWordPressFailsafe;

console.log('📋 WordPress Editor Triple Failsafe script loaded');
