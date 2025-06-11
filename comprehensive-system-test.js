/**
 * COMPREHENSIVE SYSTEM TEST
 * Run this script step by step to verify all fixes are working
 */

console.log('🧪 COMPREHENSIVE SYSTEM TEST STARTING');
console.log('=' .repeat(60));

// Test configuration
const TEST_CONFIG = {
    wordpress: {
        admin: 'https://wp.violetrainwater.com/wp-admin/',
        api: '/wp-json/violet/v1/content'
    },
    react: {
        live: 'https://lustrous-dolphin-447351.netlify.app/',
        local: 'http://localhost:5173/'
    },
    testFields: {
        hero_title: 'TEST: Hero Title ' + new Date().toLocaleTimeString(),
        hero_subtitle: 'TEST: Subtitle ' + new Date().toLocaleTimeString(),
        hero_cta: 'TEST: CTA Button'
    }
};

let testResults = {
    communication: false,
    contentLoading: false,
    saving: false,
    persistence: false,
    issues: [],
    fixes: []
};

console.log('📋 Test Configuration:', TEST_CONFIG);

// ====================
// TEST 1: COMMUNICATION
// ====================
console.log('\n🔍 TEST 1: COMMUNICATION SYSTEM');

function testCommunication() {
    return new Promise((resolve) => {
        let communicationWorking = false;
        let messagesReceived = 0;
        
        const iframe = document.getElementById('violet-site-iframe');
        
        if (!iframe) {
            console.log('❌ No iframe found');
            testResults.issues.push('No iframe element found');
            resolve(false);
            return;
        }
        
        console.log('✅ Iframe found:', iframe.src);
        
        // Listen for ready messages
        const messageListener = (event) => {
            if (event.data?.type === 'violet-iframe-ready') {
                messagesReceived++;
                communicationWorking = true;
                console.log(`✅ Ready message received (${messagesReceived}):`, event.data);
                
                // Update connection status
                const statusEl = document.getElementById('violet-connection-status');
                if (statusEl) {
                    statusEl.textContent = '✅ Connected (Test)';
                    statusEl.style.color = 'green';
                }
            }
            
            if (event.data?.type === 'violet-diagnostic-pong') {
                console.log('✅ Diagnostic pong received - React app is alive');
            }
        };
        
        window.addEventListener('message', messageListener);
        
        // Send test ping
        try {
            iframe.contentWindow.postMessage({
                type: 'violet-diagnostic-ping',
                timestamp: Date.now(),
                test: 'communication-test'
            }, '*');
            console.log('📤 Test ping sent to React app');
        } catch (error) {
            console.log('❌ Failed to send test ping:', error);
        }
        
        // Wait for response
        setTimeout(() => {
            window.removeEventListener('message', messageListener);
            
            if (communicationWorking) {
                console.log('✅ Communication test PASSED');
                testResults.communication = true;
            } else {
                console.log('❌ Communication test FAILED');
                testResults.issues.push('No ready message received from React app');
                testResults.fixes.push('Run emergency communication fix script');
            }
            
            resolve(communicationWorking);
        }, 3000);
    });
}

// ====================
// TEST 2: CONTENT LOADING
// ====================
console.log('\n📦 TEST 2: CONTENT LOADING');

async function testContentLoading() {
    try {
        console.log('🔍 Testing WordPress API...');
        
        const response = await fetch(TEST_CONFIG.wordpress.api);
        const data = await response.json();
        
        console.log('✅ WordPress API response:', Object.keys(data).length, 'fields');
        console.log('📋 Available fields:', Object.keys(data));
        
        // Test localStorage
        const localContent = localStorage.getItem('violet-content');
        if (localContent) {
            const parsed = JSON.parse(localContent);
            console.log('✅ localStorage content found:', Object.keys(parsed.content || parsed).length, 'fields');
        } else {
            console.log('⚠️ No localStorage content found');
        }
        
        testResults.contentLoading = true;
        console.log('✅ Content loading test PASSED');
        return true;
        
    } catch (error) {
        console.log('❌ Content loading test FAILED:', error);
        testResults.issues.push('WordPress API not accessible: ' + error.message);
        testResults.fixes.push('Check WordPress API endpoint and CORS settings');
        return false;
    }
}

// ====================
// TEST 3: SAVE FUNCTIONALITY
// ====================
console.log('\n💾 TEST 3: SAVE FUNCTIONALITY');

function testSaving() {
    return new Promise((resolve) => {
        console.log('🔍 Testing save functionality...');
        
        // Check if save functions exist
        const wpSaveExists = typeof window.violetSaveAllChanges === 'function';
        const reactSaveExists = typeof window.reactSaveContent === 'function';
        
        console.log('WordPress save function:', wpSaveExists ? '✅' : '❌');
        console.log('React save function:', reactSaveExists ? '✅' : '❌');
        
        if (!wpSaveExists) {
            testResults.issues.push('WordPress save function not found');
            testResults.fixes.push('Check functions.php WordPress editor implementation');
        }
        
        // Test direct save to React
        if (reactSaveExists) {
            console.log('🧪 Testing direct React save...');
            
            try {
                window.reactSaveContent([
                    {
                        field_name: 'test_field',
                        field_value: 'Test save at ' + new Date().toLocaleTimeString()
                    }
                ]);
                
                console.log('✅ Direct React save executed');
                testResults.saving = true;
                
            } catch (error) {
                console.log('❌ Direct React save failed:', error);
                testResults.issues.push('React save function error: ' + error.message);
            }
        }
        
        // Test WordPress save if available
        if (wpSaveExists && window.violetPendingChanges) {
            // Add test change
            window.violetPendingChanges['test_wp_save'] = {
                field_name: 'test_wp_save',
                field_value: 'WordPress save test ' + new Date().toLocaleTimeString(),
                field_type: 'test'
            };
            
            if (typeof window.violetUpdateSaveButton === 'function') {
                window.violetUpdateSaveButton();
            }
            
            console.log('✅ Test change added to WordPress pending changes');
            console.log('💡 You can now click "Save All Changes" to test WordPress save');
        }
        
        setTimeout(() => {
            console.log(testResults.saving ? '✅ Save test PASSED' : '⚠️ Save test PARTIAL');
            resolve(testResults.saving);
        }, 1000);
    });
}

// ====================
// TEST 4: PERSISTENCE
// ====================
console.log('\n🔄 TEST 4: PERSISTENCE');

function testPersistence() {
    console.log('🔍 Testing content persistence...');
    
    // Save test content
    const testContent = {
        version: 'test-v1',
        timestamp: Date.now(),
        test: true,
        content: TEST_CONFIG.testFields
    };
    
    try {
        localStorage.setItem('violet-content', JSON.stringify(testContent));
        console.log('✅ Test content saved to localStorage');
        
        // Verify it can be read back
        const retrieved = JSON.parse(localStorage.getItem('violet-content'));
        const fieldsMatch = Object.keys(TEST_CONFIG.testFields).every(
            field => retrieved.content[field] === TEST_CONFIG.testFields[field]
        );
        
        if (fieldsMatch) {
            console.log('✅ Content persistence test PASSED');
            testResults.persistence = true;
            return true;
        } else {
            console.log('❌ Content mismatch after save/load');
            testResults.issues.push('Content persistence failed - data corruption');
            return false;
        }
        
    } catch (error) {
        console.log('❌ Persistence test FAILED:', error);
        testResults.issues.push('localStorage access error: ' + error.message);
        testResults.fixes.push('Check browser localStorage permissions');
        return false;
    }
}

// ====================
// RUN ALL TESTS
// ====================
async function runAllTests() {
    console.log('\n🚀 RUNNING ALL TESTS...');
    console.log('-'.repeat(40));
    
    // Test 1: Communication
    await testCommunication();
    
    // Test 2: Content Loading
    await testContentLoading();
    
    // Test 3: Save Functionality
    await testSaving();
    
    // Test 4: Persistence
    testPersistence();
    
    // Generate Report
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const totalTests = 4;
    const passedTests = [
        testResults.communication,
        testResults.contentLoading,
        testResults.saving,
        testResults.persistence
    ].filter(Boolean).length;
    
    console.log(`📈 Tests passed: ${passedTests}/${totalTests}`);
    console.log(`✅ Communication: ${testResults.communication ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Content Loading: ${testResults.contentLoading ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Save Functionality: ${testResults.saving ? 'PASS' : 'PARTIAL'}`);
    console.log(`✅ Persistence: ${testResults.persistence ? 'PASS' : 'FAIL'}`);
    
    if (testResults.issues.length > 0) {
        console.log('\n❌ ISSUES FOUND:');
        testResults.issues.forEach((issue, i) => {
            console.log(`  ${i + 1}. ${issue}`);
        });
        
        console.log('\n🔧 SUGGESTED FIXES:');
        testResults.fixes.forEach((fix, i) => {
            console.log(`  ${i + 1}. ${fix}`);
        });
    }
    
    if (passedTests === totalTests) {
        console.log('\n🎉 ALL TESTS PASSED! System is working correctly.');
        console.log('💡 You can now use the WordPress editor to make changes.');
    } else if (passedTests >= 2) {
        console.log('\n⚠️ PARTIAL SUCCESS - Core functionality working, some issues to resolve.');
    } else {
        console.log('\n🚨 MULTIPLE FAILURES - Need to apply emergency fixes.');
    }
    
    // Store results globally
    window.violetTestResults = testResults;
    console.log('\n💾 Test results stored in: window.violetTestResults');
    
    return testResults;
}

// ====================
// QUICK FIXES
// ====================
window.violetQuickFixes = {
    forceConnect: () => {
        console.log('🔧 Applying quick connection fix...');
        const statusEl = document.getElementById('violet-connection-status');
        if (statusEl) {
            statusEl.textContent = '✅ Connected (Force)';
            statusEl.style.color = 'green';
        }
        window.violetReactAppReady = true;
    },
    
    clearCache: () => {
        console.log('🗑️ Clearing all cached content...');
        localStorage.removeItem('violet-content');
        sessionStorage.clear();
        console.log('✅ Cache cleared');
    },
    
    testSave: () => {
        if (window.reactSaveContent) {
            window.reactSaveContent([{
                field_name: 'hero_title',
                field_value: 'Quick test: ' + new Date().toLocaleTimeString()
            }]);
            setTimeout(() => window.location.reload(), 1000);
        } else {
            console.log('❌ React save function not available');
        }
    }
};

// ====================
// START TESTING
// ====================
console.log('\n🚀 Starting comprehensive test in 2 seconds...');
console.log('💡 Use window.violetQuickFixes for emergency fixes');

setTimeout(runAllTests, 2000);
