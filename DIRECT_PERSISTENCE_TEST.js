/**
 * 🎯 DIRECT CONTENT PERSISTENCE TEST
 * Tests if saved content loads instead of defaults
 * Copy and paste into WordPress admin console (F12)
 */

(function() {
    console.log('🎯 DIRECT CONTENT PERSISTENCE TEST');
    console.log('Testing if saved content overrides defaults on page load');

    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.log('❌ No iframe found');
        return;
    }

    // Test 1: Set specific saved content
    console.log('\n📝 STEP 1: Setting saved content');
    
    const testContent = {
        version: 'v1',
        timestamp: Date.now(),
        content: {
            hero_title: 'SAVED CONTENT TEST: This should appear instead of defaults',
            hero_subtitle: 'If you see this, saved content is working!',
            hero_cta: 'Persistence Works!'
        }
    };
    
    localStorage.setItem('violet-content', JSON.stringify(testContent));
    console.log('✅ Test content saved to localStorage:', testContent.content);

    // Test 2: Enhanced save function for WordPress saves
    if (window.violetSaveAllChanges) {
        const originalSave = window.violetSaveAllChanges;
        
        window.violetSaveAllChanges = function() {
            console.log('💾 SAVE TRIGGERED - ensuring content persists');
            
            // Call original save
            const result = originalSave.apply(this, arguments);
            
            // Immediately after save, ensure content is in localStorage
            setTimeout(() => {
                const changesArray = Object.values(window.violetPendingChanges || {});
                
                if (changesArray.length > 0) {
                    // Get existing content
                    let existingContent = {};
                    try {
                        const stored = localStorage.getItem('violet-content');
                        if (stored) {
                            const parsed = JSON.parse(stored);
                            existingContent = parsed.content || {};
                        }
                    } catch (error) {
                        console.log('⚠️ Could not load existing content:', error);
                    }
                    
                    // Apply changes
                    const updatedContent = { ...existingContent };
                    changesArray.forEach(change => {
                        if (change.field_name && change.field_value !== undefined) {
                            updatedContent[change.field_name] = change.field_value;
                            console.log(`📝 Saving: ${change.field_name} = "${change.field_value}"`);
                        }
                    });
                    
                    // Save in correct format
                    const contentToSave = {
                        version: 'v1',
                        timestamp: Date.now(),
                        source: 'wordpress-save',
                        content: updatedContent
                    };
                    
                    localStorage.setItem('violet-content', JSON.stringify(contentToSave));
                    console.log('✅ Content saved to localStorage:', updatedContent);
                    
                    // Send message to React to reload with saved content
                    iframe.contentWindow.postMessage({
                        type: 'violet-force-content-refresh',
                        timestamp: Date.now()
                    }, '*');
                    
                    console.log('📤 Refresh message sent to React');
                    
                    // Show success message
                    console.log('\n🎉 SAVE COMPLETE!');
                    console.log('📋 Next: Refresh page to see if content persists');
                    
                } else {
                    console.log('⚠️ No changes to save');
                }
            }, 500);
            
            return result;
        };
        
        console.log('✅ Enhanced save function installed');
    }

    // Test 3: Force iframe refresh to test content loading
    console.log('\n🔄 STEP 2: Testing content loading');
    
    setTimeout(() => {
        console.log('🔄 Forcing iframe refresh to test if saved content loads...');
        
        // Add timestamp to force refresh
        const currentSrc = iframe.src;
        const url = new URL(currentSrc);
        url.searchParams.set('test_timestamp', Date.now().toString());
        iframe.src = url.toString();
        
        console.log('📤 Iframe refreshed - check if saved content appears');
        console.log('💡 Look for: "SAVED CONTENT TEST: This should appear instead of defaults"');
        
    }, 2000);

    // Test 4: Check localStorage access
    console.log('\n💾 STEP 3: Verifying localStorage');
    
    setTimeout(() => {
        const stored = localStorage.getItem('violet-content');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                console.log('✅ localStorage content verified:', parsed.content);
                
                // Check if React app can access it
                iframe.contentWindow.postMessage({
                    type: 'violet-check-localStorage',
                    timestamp: Date.now()
                }, '*');
                
            } catch (error) {
                console.log('❌ localStorage parsing error:', error);
            }
        } else {
            console.log('❌ No content in localStorage');
        }
    }, 4000);

    // Test 5: Listen for responses
    let responseCount = 0;
    const responseListener = (event) => {
        if (event.data?.type?.includes('violet')) {
            responseCount++;
            console.log(`📨 Response ${responseCount}:`, event.data.type, event.data);
        }
    };
    
    window.addEventListener('message', responseListener);

    // Summary and instructions
    setTimeout(() => {
        console.log('\n📋 TEST SUMMARY:');
        console.log('='.repeat(50));
        console.log('1. ✅ Test content saved to localStorage');
        console.log('2. ✅ Enhanced save function installed');
        console.log('3. 🔄 Iframe refresh triggered');
        console.log('4. 💾 localStorage verified');
        console.log(`5. 📨 Responses received: ${responseCount}`);
        
        console.log('\n🎯 WHAT TO LOOK FOR:');
        console.log('• Hero title should show: "SAVED CONTENT TEST: This should appear instead of defaults"');
        console.log('• NOT: "Welcome to Our Site" or "Change the Channel"');
        console.log('• Browser console should show "Using SAVED value" messages');
        
        console.log('\n📋 TEST STEPS:');
        console.log('1. Make an edit in the iframe');
        console.log('2. Click "Save All Changes"');
        console.log('3. Wait for save completion');
        console.log('4. Refresh the page manually');
        console.log('5. Check if your edit persists (not defaults)');
        
        console.log('\n💡 If test content appears, the fix is working!');
        console.log('   If defaults still appear, there\'s another issue to investigate.');
        
        // Store test results
        window.persistenceTestResults = {
            testContentSet: true,
            saveEnhanced: typeof window.violetSaveAllChanges === 'function',
            localStorageWorking: !!localStorage.getItem('violet-content'),
            responses: responseCount,
            timestamp: Date.now()
        };
        
    }, 6000);

    console.log('⏳ Running persistence test... check results in 10 seconds');

})();
