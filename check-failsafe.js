// Quick diagnostic script to check failsafe system
console.log('🔍 Checking Triple Failsafe System...\n');

// Check LocalStorage
console.log('📦 LocalStorage Check:');
const primaryLS = localStorage.getItem('violet-content-primary');
const backupLS = localStorage.getItem('violet-content-backup');
console.log('Primary:', primaryLS ? `Found (${primaryLS.length} bytes)` : 'Empty');
console.log('Backup:', backupLS ? `Found (${backupLS.length} bytes)` : 'Empty');

if (primaryLS) {
    try {
        const parsed = JSON.parse(primaryLS);
        console.log('Primary content:', parsed.data || parsed);
    } catch (e) {
        console.log('Primary parse error:', e.message);
    }
}

// Check SessionStorage
console.log('\n📦 SessionStorage Check:');
const sessionSS = sessionStorage.getItem('violet-content-session');
console.log('Session:', sessionSS ? `Found (${sessionSS.length} bytes)` : 'Empty');

// Check window object
console.log('\n📦 Window Object Check:');
console.log('Window failsafe:', window.__violetContentFailsafe ? 'Found' : 'Not found');

// Check if triple failsafe is available
console.log('\n🛡️ Triple Failsafe System:');
console.log('window.violetTripleFailsafe:', window.violetTripleFailsafe ? 'Available' : 'Not available');

// Test save function
if (window.violetTripleFailsafe) {
    console.log('\n🧪 Testing save function...');
    window.violetTripleFailsafe.testSave('diagnostic_test', 'Test from diagnostic script ' + Date.now());
    console.log('✅ Save test completed');
} else {
    console.log('❌ Triple failsafe not available - are you in the React app?');
}

// Check for WordPress editor
console.log('\n🔍 WordPress Editor Check:');
console.log('In iframe:', window.parent !== window);
console.log('Edit mode:', window.location.search.includes('edit_mode=1'));

// Instructions
console.log('\n📋 To test the failsafe system:');
console.log('1. Open the WordPress editor: http://localhost/wp-admin/admin.php?page=violet-frontend-editor');
console.log('2. Enable edit mode and make changes');
console.log('3. Click Save in the blue toolbar');
console.log('4. Check if content persists after refresh');
console.log('\n💡 Or run: window.violetTripleFailsafe.testSave("hero_title", "New Title Test")');
