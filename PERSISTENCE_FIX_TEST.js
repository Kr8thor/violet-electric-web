/**
 * 🚨 COMPLETE PERSISTENCE FIX TEST SCRIPT
 * Copy and paste this ENTIRE script into WordPress admin console (F12)
 * This tests and fixes content persistence issues
 */

(function() {
    console.log('🚨 COMPLETE PERSISTENCE FIX TEST STARTING...');
    console.log('This will test and fix content persistence in 30 seconds');

    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.log('❌ No iframe found - cannot test');
        return;
    }

    // Test Results Storage
    const testResults = {
        communication: false,
        saveFunction: false,
        messageDelivery: false,
        localStorage: false,
        persistence: false,
        issues: [],
        fixes: []
    };

    // 1. Enhanced Save Function with Complete Persistence
    if (window.violetSaveAllChanges) {
        const originalSave = window.violetSaveAllChanges;
        
        window.violetSaveAllChanges = function() {
            console.log('💾 ENHANCED SAVE with complete persistence triggered');
            console.log('💾 Saving changes:', window.violetPendingChanges);
            
            // Call original save
            const result = originalSave.apply(this, arguments);
            
            // Enhanced post-save handling with multiple message types
            setTimeout(() => {
                console.log('🔄 Sending ALL persistence message types...');
                
                // Convert pending changes to array format
                const changesArray = Object.values(window.violetPendingChanges || {});
                
                // Send ALL possible message formats React might expect
                const persistenceMessages = [
                    {
                        type: 'violet-apply-saved-changes',
                        savedChanges: changesArray,
                        timestamp: Date.now()
                    },
                    {
                        type: 'violet-persist-content',
                        content: window.violetPendingChanges,
                        savedChanges: changesArray,
                        timestamp: Date.now()
                    },
                    {
                        type: 'violet-content-updated',
                        changes: changesArray,
                        savedChanges: changesArray,
                        timestamp: Date.now()
                    },
                    {
                        type: 'violet-force-localStorage-update',
                        content: changesArray,
                        forceReload: true,
                        timestamp: Date.now()
                    }
                ];
                
                // Send all persistence messages with delays
                persistenceMessages.forEach((message, index) => {
                    setTimeout(() => {
                        iframe.contentWindow.postMessage(message, '*');
                        console.log(`✅ Persistence message ${index + 1}/4 sent:`, message.type);
                    }, index * 300); // Stagger messages
                });
                
                // Force localStorage update directly
                setTimeout(() => {
                    console.log('🔧 Forcing direct localStorage update...');
                    
                    // Prepare content in multiple formats
                    const contentForStorage = {};
                    changesArray.forEach(change => {
                        if (change.field_name && change.field_value !== undefined) {
                            contentForStorage[change.field_name] = change.field_value;
                        }
                    });
                    
                    // Send direct localStorage update command
                    iframe.contentWindow.postMessage({
                        type: 'violet-update-localStorage-now',
                        content: {
                            version: 'wp-save-v2',
                            timestamp: Date.now(),
                            content: contentForStorage,
                            source: 'wordpress-persistence-fix'
                        },
                        forceReload: true
                    }, '*');
                    
                    console.log('✅ Direct localStorage update sent:', contentForStorage);
                }, 1500);
                
            }, 500);
            
            return result;
        };
        
        testResults.saveFunction = true;
        console.log('✅ Enhanced save function with complete persistence installed');
    } else {
        testResults.issues.push('Save function not found');
        console.log('❌ Save function not found - check functions.php');
    }

    // 2. Communication Test
    let messageCount = 0;
    const messageListener = (event) => {
        if (event.data?.type?.includes('violet')) {
            messageCount++;
            console.log(`📨 Message ${messageCount}: ${event.data.type}`, event.data);
            
            if (event.data.type === 'violet-iframe-ready') {
                testResults.communication = true;
                console.log('✅ React app communication confirmed');
            }
        }
    };
    
    window.addEventListener('message', messageListener);

    // Send test ping
    iframe.contentWindow.postMessage({
        type: 'violet-diagnostic-ping',
        timestamp: Date.now(),
        test: 'persistence-fix'
    }, '*');

    // 3. Test Functions
    window.testContentPersistence = () => {
        console.log('🧪 Testing complete content persistence...');
        
        // Add test changes
        if (!window.violetPendingChanges) window.violetPendingChanges = {};
        
        const testValue = 'PERSISTENCE TEST FIXED: ' + new Date().toLocaleTimeString();
        
        window.violetPendingChanges['hero_title'] = {
            field_name: 'hero_title',
            field_value: testValue,
            field_type: 'hero_title'
        };
        
        window.violetPendingChanges['hero_subtitle'] = {
            field_name: 'hero_subtitle',
            field_value: 'Persistence fix applied successfully!',
            field_type: 'hero_subtitle'
        };
        
        // Update save button
        if (window.violetUpdateSaveButton) {
            window.violetUpdateSaveButton();
        }
        
        console.log('✅ Test changes added - click "Save All Changes" to test');
        console.log('📋 Test values:');
        console.log('  hero_title:', testValue);
        console.log('  hero_subtitle: Persistence fix applied successfully!');
        console.log('');
        console.log('💡 After saving and page refresh, you should see these values persist!');
        
        return { testValue, timestamp: Date.now() };
    };

    // 4. localStorage Test
    window.testLocalStorage = () => {
        console.log('🔍 Testing localStorage accessibility...');
        
        try {
            // Test direct access
            const testData = {
                version: 'test-v1',
                timestamp: Date.now(),
                content: {
                    test_field: 'localStorage test successful'
                }
            };
            
            localStorage.setItem('violet-content-test', JSON.stringify(testData));
            const retrieved = JSON.parse(localStorage.getItem('violet-content-test'));
            
            if (retrieved.content.test_field === 'localStorage test successful') {
                testResults.localStorage = true;
                console.log('✅ localStorage working correctly');
                localStorage.removeItem('violet-content-test');
                return true;
            } else {
                console.log('❌ localStorage data corruption');
                return false;
            }
        } catch (error) {
            console.log('❌ localStorage error:', error);
            testResults.issues.push('localStorage not accessible: ' + error.message);
            return false;
        }
    };

    // 5. Current Content Check
    window.checkCurrentContent = () => {
        console.log('📦 Checking current content state...');
        
        const stored = localStorage.getItem('violet-content');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                console.log('✅ Current stored content:', parsed);
                return parsed;
            } catch (error) {
                console.log('❌ Content parsing error:', error);
                return null;
            }
        } else {
            console.log('⚠️ No content in localStorage yet');
            return null;
        }
    };

    // 6. Run Initial Tests
    setTimeout(() => {
        console.log('\n🔍 RUNNING INITIAL TESTS...');
        
        // Test 1: localStorage
        testLocalStorage();
        
        // Test 2: Current content
        checkCurrentContent();
        
        // Test 3: Communication
        if (messageCount > 0) {
            testResults.communication = true;
            console.log('✅ Communication test passed');
        } else {
            testResults.issues.push('No messages received from React');
            console.log('❌ Communication test failed');
        }

        // Generate report
        setTimeout(() => {
            console.log('\n📊 PERSISTENCE FIX TEST RESULTS:');
            console.log('='.repeat(50));
            
            const passedTests = Object.values(testResults).filter(v => v === true).length;
            const totalTests = Object.keys(testResults).filter(k => typeof testResults[k] === 'boolean').length;
            
            console.log(`📈 Tests passed: ${passedTests}/${totalTests}`);
            console.log(`✅ Save function enhanced: ${testResults.saveFunction}`);
            console.log(`✅ Communication working: ${testResults.communication}`);
            console.log(`✅ localStorage accessible: ${testResults.localStorage}`);
            
            if (testResults.issues.length > 0) {
                console.log('\n❌ Issues found:');
                testResults.issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
            }
            
            console.log('\n🧪 TESTING COMMANDS AVAILABLE:');
            console.log('  window.testContentPersistence() - Add test content for save');
            console.log('  window.testLocalStorage() - Test localStorage access');
            console.log('  window.checkCurrentContent() - Check current saved content');
            
            if (passedTests >= 3) {
                console.log('\n🎉 PERSISTENCE FIX READY FOR TESTING!');
                console.log('📋 Next steps:');
                console.log('  1. Run: window.testContentPersistence()');
                console.log('  2. Click "Save All Changes" button');
                console.log('  3. Wait for save completion');
                console.log('  4. Refresh the page');
                console.log('  5. Content should now persist! ✅');
            } else {
                console.log('\n⚠️ Some tests failed - check issues above');
            }
            
            // Store results globally
            window.persistenceTestResults = testResults;
            
        }, 2000);
        
    }, 3000);

    console.log('⏳ Persistence fix test running... check results in 10 seconds');
    console.log('💡 Use window.testContentPersistence() to test save functionality');

})();
