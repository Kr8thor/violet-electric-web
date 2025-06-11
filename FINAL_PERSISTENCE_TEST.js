/**
 * 🎯 PERSISTENCE VERIFICATION TEST
 * Copy and paste this into WordPress admin console
 * This tests if saved content appears instead of defaults
 */

(function() {
    console.log('🎯 PERSISTENCE VERIFICATION TEST STARTING');
    console.log('Testing if saved content overrides defaults on page refresh');

    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.log('❌ No iframe found');
        return;
    }

    // Step 1: Set test content in localStorage
    console.log('\n📝 STEP 1: Setting test content');
    
    const testSavedContent = {
        hero_title: 'SAVED CONTENT: This should appear instead of Welcome to Our Site',
        hero_subtitle: 'SAVED SUBTITLE: If you see this, persistence is working!',
        hero_cta: 'SAVED BUTTON: Success!'
    };
    
    const contentPackage = {
        version: 'enhanced-v1',
        timestamp: Date.now(),
        source: 'persistence-test',
        content: testSavedContent
    };
    
    localStorage.setItem('violet-content', JSON.stringify(contentPackage));
    localStorage.setItem('violet-content-backup', JSON.stringify(contentPackage));
    
    console.log('✅ Test content saved:', testSavedContent);

    // Step 2: Enhanced save function for WordPress
    console.log('\n💾 STEP 2: Installing enhanced save handler');
    
    if (window.violetSaveAllChanges) {
        const originalSave = window.violetSaveAllChanges;
        
        window.violetSaveAllChanges = function() {
            console.log('💾 ENHANCED SAVE TRIGGERED');
            console.log('Changes being saved:', window.violetPendingChanges);
            
            // Call original save
            const result = originalSave.apply(this, arguments);
            
            // Enhanced save processing
            setTimeout(() => {
                const changesArray = Object.values(window.violetPendingChanges || {});
                
                if (changesArray.length > 0) {
                    // Save using enhanced persistence
                    const savedContent = {};
                    changesArray.forEach(change => {
                        if (change.field_name && change.field_value !== undefined) {
                            savedContent[change.field_name] = change.field_value;
                        }
                    });
                    
                    // Get existing content and merge
                    let existingContent = {};
                    try {
                        const stored = localStorage.getItem('violet-content');
                        if (stored) {
                            const parsed = JSON.parse(stored);
                            existingContent = parsed.content || {};
                        }
                    } catch (error) {
                        console.log('Could not load existing content:', error);
                    }
                    
                    const mergedContent = { ...existingContent, ...savedContent };
                    
                    const finalPackage = {
                        version: 'enhanced-v1',
                        timestamp: Date.now(),
                        source: 'wordpress-save',
                        content: mergedContent
                    };
                    
                    localStorage.setItem('violet-content', JSON.stringify(finalPackage));
                    localStorage.setItem('violet-content-backup', JSON.stringify(finalPackage));
                    
                    console.log('✅ ENHANCED SAVE COMPLETE:', mergedContent);
                    
                    // Send enhanced persistence message
                    iframe.contentWindow.postMessage({
                        type: 'violet-enhanced-persistence-update',
                        content: mergedContent,
                        timestamp: Date.now()
                    }, '*');
                    
                    console.log('📤 Enhanced persistence message sent to React');
                }
            }, 500);
            
            return result;
        };
        
        console.log('✅ Enhanced save handler installed');
    } else {
        console.log('⚠️ WordPress save function not found');
    }

    // Step 3: Force iframe refresh to test loading
    console.log('\n🔄 STEP 3: Testing content loading');
    
    setTimeout(() => {
        console.log('🔄 Forcing iframe refresh to test if saved content loads...');
        
        const currentSrc = iframe.src;
        const url = new URL(currentSrc);
        url.searchParams.set('persistence_test', Date.now().toString());
        iframe.src = url.toString();
        
        console.log('📤 Iframe refreshed - CHECK IF SAVED CONTENT APPEARS:');
        console.log('  Expected hero title: "SAVED CONTENT: This should appear instead of Welcome to Our Site"');
        console.log('  Expected subtitle: "SAVED SUBTITLE: If you see this, persistence is working!"');
        console.log('  NOT expected: "Welcome to Our Site" or "Change the Channel"');
        
    }, 2000);

    // Step 4: Listen for React app responses
    let responseCount = 0;
    const responseListener = (event) => {
        if (event.data?.type?.includes('violet')) {
            responseCount++;
            console.log(`📨 React Response ${responseCount}:`, event.data.type);
            
            if (event.data.type === 'violet-enhanced-persistence-loaded') {
                console.log('✅ React app loaded enhanced persistence content!');
            }
        }
    };
    
    window.addEventListener('message', responseListener);

    // Step 5: Quick test functions
    window.testPersistenceQuick = () => {
        // Add a test change
        if (!window.violetPendingChanges) window.violetPendingChanges = {};
        
        window.violetPendingChanges['hero_title'] = {
            field_name: 'hero_title',
            field_value: 'QUICK TEST: ' + new Date().toLocaleTimeString(),
            field_type: 'hero_title'
        };
        
        if (window.violetUpdateSaveButton) {
            window.violetUpdateSaveButton();
        }
        
        console.log('✅ Quick test change added - click "Save All Changes"');
    };

    window.clearPersistenceTest = () => {
        localStorage.removeItem('violet-content');
        localStorage.removeItem('violet-content-backup');
        console.log('🗑️ Test content cleared');
    };

    window.checkPersistenceState = () => {
        console.log('📊 PERSISTENCE STATE CHECK:');
        
        const primary = localStorage.getItem('violet-content');
        const backup = localStorage.getItem('violet-content-backup');
        
        if (primary) {
            try {
                const parsed = JSON.parse(primary);
                console.log('✅ Primary storage:', parsed.content);
            } catch (e) {
                console.log('❌ Primary storage corrupted');
            }
        } else {
            console.log('❌ No primary storage');
        }
        
        if (backup) {
            console.log('✅ Backup storage exists');
        } else {
            console.log('❌ No backup storage');
        }
        
        console.log('🔍 Check iframe content for saved text...');
    };

    // Step 6: Final instructions
    setTimeout(() => {
        console.log('\n🎯 PERSISTENCE TEST SUMMARY');
        console.log('═'.repeat(50));
        console.log('✅ Test content saved to localStorage');
        console.log('✅ Enhanced save handler installed');
        console.log('🔄 Iframe refreshed for testing');
        
        console.log('\n📋 WHAT TO CHECK:');
        console.log('1. Look at the hero title in the iframe');
        console.log('2. Should show: "SAVED CONTENT: This should appear..."');
        console.log('3. Should NOT show: "Welcome to Our Site" or defaults');
        
        console.log('\n🧪 TEST FUNCTIONS AVAILABLE:');
        console.log('• window.testPersistenceQuick() - Add test change');
        console.log('• window.checkPersistenceState() - Check storage state');
        console.log('• window.clearPersistenceTest() - Clear test data');
        
        console.log('\n🎯 SUCCESS CRITERIA:');
        console.log('• Saved content appears instead of defaults ✓');
        console.log('• Changes persist after page refresh ✓');
        console.log('• No cross-origin errors ✓');
        
        console.log('\n📝 HOW TO TEST FULL FLOW:');
        console.log('1. Make an edit (click text, change it)');
        console.log('2. Click "Save All Changes"');
        console.log('3. Wait for save completion');
        console.log('4. Refresh page manually');
        console.log('5. Your edit should persist (not revert to defaults)');
        
    }, 5000);

    console.log('⏳ Persistence test running... check results in 10 seconds');

})();
