/**
 * Direct test of the failsafe system in browser console
 * Copy and paste this into the browser console to test
 */

console.clear();
console.log('🧪 FAILSAFE SYSTEM COMPREHENSIVE TEST\n');

// Function to test save
async function testFailsafeSave() {
    console.log('📝 Testing Triple Failsafe Save...');
    
    const testData = {
        hero_title: 'Failsafe Test Title ' + new Date().toLocaleTimeString(),
        hero_subtitle: 'This should persist across refreshes',
        test_field: 'Test at ' + Date.now()
    };
    
    // Method 1: Direct triple failsafe
    if (window.violetTripleFailsafe) {
        console.log('✅ Using Triple Failsafe System');
        for (const [field, value] of Object.entries(testData)) {
            await window.violetTripleFailsafe.testSave(field, value);
        }
    } else {
        console.log('❌ Triple Failsafe not available');
    }
    
    // Method 2: Direct localStorage save
    console.log('\n📦 Direct Storage Save:');
    const storageData = {
        data: testData,
        timestamp: Date.now(),
        version: Date.now()
    };
    
    localStorage.setItem('violet-content-primary', JSON.stringify(storageData));
    localStorage.setItem('violet-content-backup', JSON.stringify(testData));
    sessionStorage.setItem('violet-content-session', JSON.stringify(storageData));
    
    console.log('✅ Saved to all storage layers');
    
    // Verify saves
    console.log('\n🔍 Verifying saves:');
    console.log('Primary:', localStorage.getItem('violet-content-primary') ? '✅' : '❌');
    console.log('Backup:', localStorage.getItem('violet-content-backup') ? '✅' : '❌');
    console.log('Session:', sessionStorage.getItem('violet-content-session') ? '✅' : '❌');
    
    return testData;
}

// Function to check current content
function checkCurrentContent() {
    console.log('\n📋 Current Content:');
    
    // Check primary storage
    const primary = localStorage.getItem('violet-content-primary');
    if (primary) {
        try {
            const parsed = JSON.parse(primary);
            console.log('Primary Storage:', parsed.data || parsed);
        } catch (e) {
            console.log('Primary Storage: Parse error');
        }
    } else {
        console.log('Primary Storage: Empty');
    }
    
    // Check if content is displayed on page
    console.log('\n🖼️ Content on Page:');
    const heroTitle = document.querySelector('[data-violet-field="hero_title"]');
    if (heroTitle) {
        console.log('Hero Title Element:', heroTitle.textContent);
    } else {
        console.log('Hero Title Element: Not found');
    }
}

// Function to simulate WordPress save
function simulateWordPressSave() {
    console.log('\n📤 Simulating WordPress Save...');
    
    const changes = [
        {
            field_name: 'hero_title',
            field_value: 'WordPress Save Test ' + new Date().toLocaleTimeString()
        },
        {
            field_name: 'hero_subtitle',
            field_value: 'Saved from WordPress at ' + new Date().toLocaleTimeString()
        }
    ];
    
    window.postMessage({
        type: 'violet-apply-saved-changes',
        savedChanges: changes,
        timestamp: Date.now()
    }, '*');
    
    console.log('✅ WordPress save message sent');
}

// Run tests
(async function runTests() {
    console.log('🏁 Starting Tests...\n');
    
    // Test 1: Check current state
    checkCurrentContent();
    
    // Test 2: Save new content
    const savedData = await testFailsafeSave();
    
    // Test 3: Verify content updated
    setTimeout(() => {
        console.log('\n🔄 Checking if content updated on page...');
        checkCurrentContent();
    }, 1000);
    
    // Instructions
    console.log('\n📋 Next Steps:');
    console.log('1. Refresh the page and run: checkCurrentContent()');
    console.log('2. Content should persist!');
    console.log('3. To test WordPress save, run: simulateWordPressSave()');
    console.log('4. To test failover, run: localStorage.setItem("violet-content-primary", "CORRUPT")');
    console.log('5. Then refresh and check if content recovers');
})();

// Export functions for manual testing
window.failsafeTest = {
    save: testFailsafeSave,
    check: checkCurrentContent,
    wordpress: simulateWordPressSave,
    clear: () => {
        localStorage.removeItem('violet-content-primary');
        localStorage.removeItem('violet-content-backup');
        sessionStorage.clear();
        console.log('✅ All storage cleared');
    }
};

console.log('\n💡 Functions available:');
console.log('- failsafeTest.save()    // Save test content');
console.log('- failsafeTest.check()   // Check current content');
console.log('- failsafeTest.wordpress() // Simulate WordPress save');
console.log('- failsafeTest.clear()   // Clear all storage');
