/**
 * WordPress Editor Triple Failsafe Test
 * Run this in the browser console when in WordPress editor
 */

console.clear();
console.log('🧪 WORDPRESS EDITOR FAILSAFE TEST\n');

// Check 1: Are we in WordPress editor?
const isInEditor = window.parent !== window && window.location.search.includes('edit_mode=1');
console.log(`📍 In WordPress Editor: ${isInEditor ? '✅ YES' : '❌ NO'}`);

// Check 2: Is triple failsafe available?
console.log(`🛡️ Triple Failsafe Available: ${window.violetTripleFailsafe ? '✅ YES' : '❌ NO'}`);

// Check 3: Check all storage layers
console.log('\n📦 Storage Layers:');
console.log('LocalStorage Primary:', localStorage.getItem('violet-content-primary') ? '✅ Has data' : '❌ Empty');
console.log('LocalStorage Backup:', localStorage.getItem('violet-content-backup') ? '✅ Has data' : '❌ Empty');
console.log('SessionStorage:', sessionStorage.getItem('violet-content-session') ? '✅ Has data' : '❌ Empty');

// Test function
async function testWordPressFailsave() {
    console.log('\n🧪 Testing WordPress Editor Failsafe Save...');
    
    const testData = {
        hero_title: 'WordPress Editor Test ' + new Date().toLocaleTimeString(),
        test_field: 'Testing from WordPress ' + Date.now()
    };
    
    if (window.violetTripleFailsafe) {
        // Test direct save
        await window.violetTripleFailsafe.testSave('hero_title', testData.hero_title);
        await window.violetTripleFailsafe.testSave('test_field', testData.test_field);
        console.log('✅ Direct save completed');
        
        // Check if saved
        const content = await window.violetTripleFailsafe.getContent();
        console.log('📋 Current content:', content);
        
        // Simulate WordPress save message
        window.postMessage({
            type: 'violet-apply-saved-changes',
            savedChanges: [
                { field_name: 'hero_title', field_value: 'WordPress Message Test ' + Date.now() }
            ]
        }, '*');
        console.log('📤 Sent WordPress save message');
        
    } else {
        console.error('❌ Triple Failsafe not available - trying fallback');
        
        // Try direct localStorage save
        const fallbackData = {
            data: testData,
            timestamp: Date.now(),
            version: Date.now()
        };
        localStorage.setItem('violet-content-primary', JSON.stringify(fallbackData));
        localStorage.setItem('violet-content-backup', JSON.stringify(testData));
        sessionStorage.setItem('violet-content-session', JSON.stringify(fallbackData));
        console.log('✅ Fallback save completed');
    }
}

// Instructions
console.log('\n📋 INSTRUCTIONS:');
console.log('1. Run: testWordPressFailsave()');
console.log('2. Make changes in the editor and click Save');
console.log('3. Refresh the page');
console.log('4. Check if content persisted');

// Make function available
window.testWordPressFailsave = testWordPressFailsave;

// Also check for WordPress bridge
console.log('\n🌉 WordPress Bridge:');
console.log('violetBridge available:', window.violetBridge ? '✅ YES' : '❌ NO');
if (window.violetBridge) {
    console.log('Bridge status:', window.violetBridge.getStatus());
}

// Listen for save confirmations
window.addEventListener('message', (event) => {
    if (event.data.type === 'violet-save-confirmed') {
        console.log('✅ Save confirmed:', event.data);
    }
});

console.log('\n✨ Test ready! Run: testWordPressFailsave()');
