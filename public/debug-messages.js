// Debug script to check if React is receiving WordPress messages
console.log('🔍 Starting WordPress message debug...');

// Check if we're in the iframe
const inIframe = window.parent !== window.self;
const editMode = new URLSearchParams(window.location.search).get('edit_mode') === '1';
console.log('📍 In iframe:', inIframe, 'Edit mode:', editMode);

// Listen for all messages
window.addEventListener('message', (event) => {
    console.log('📨 Message received:', {
        type: event.data.type,
        origin: event.origin,
        data: event.data,
        timestamp: new Date().toISOString()
    });
    
    // Specifically log save messages
    if (event.data.type === 'violet-apply-saved-changes') {
        console.log('💾 SAVE MESSAGE DETECTED!', event.data);
        
        // Check if ContentContext is processing it
        setTimeout(() => {
            const currentContent = localStorage.getItem('violet-content');
            console.log('📦 Content after save:', currentContent);
            
            const state = localStorage.getItem('violet-content-state');
            console.log('📊 Content state after save:', state);
            
            const graceEnd = localStorage.getItem('violet-content-cache_grace_end');
            if (graceEnd) {
                const remaining = parseInt(graceEnd) - Date.now();
                console.log('⏰ Grace period active:', Math.round(remaining/1000), 'seconds remaining');
            } else {
                console.log('❌ No grace period detected!');
            }
        }, 1000);
    }
});

// Check ContentProvider
console.log('🔍 Checking React context...');
const hasContentProvider = document.querySelector('[data-violet-field]');
console.log('✅ EditableText components found:', hasContentProvider ? 'Yes' : 'No');

// Check current content
const currentContent = localStorage.getItem('violet-content');
if (currentContent) {
    try {
        const parsed = JSON.parse(currentContent);
        console.log('📦 Current content:', parsed);
    } catch (e) {
        console.error('❌ Failed to parse content:', e);
    }
}

// Monitor content changes
const originalContent = localStorage.getItem('violet-content');
setInterval(() => {
    const newContent = localStorage.getItem('violet-content');
    if (newContent !== originalContent) {
        console.log('🔄 CONTENT CHANGED!', {
            from: originalContent,
            to: newContent,
            timestamp: new Date().toISOString()
        });
    }
}, 500);

console.log('✅ Debug script loaded. Watch console for messages...');
