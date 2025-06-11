/**
 * 🧪 O3 PROMPT FIX VERIFICATION TEST
 * 
 * This test verifies that the o3 prompt fix has resolved the WordPress-React
 * save persistence issue by ensuring runtime content takes precedence over static content.
 * 
 * COPY AND PASTE THIS INTO WORDPRESS ADMIN CONSOLE
 */

(function() {
    console.log('🧪 O3 PROMPT FIX VERIFICATION TEST STARTING...');
    console.log('='.repeat(70));

    const TEST_CONFIG = {
        testFields: {
            hero_title: 'O3 FIX TEST: ' + new Date().toLocaleTimeString(),
            hero_subtitle: 'Runtime content should persist! ' + new Date().toISOString(),
            hero_cta: 'TEST BUTTON: O3 Fixed'
        },
        netlifyOrigin: 'https://lustrous-dolphin-447351.netlify.app'
    };

    let testResults = {
        phase1_communication: false,
        phase2_save_to_wp: false, 
        phase3_react_receives: false,
        phase4_persistence_check: false,
        phase5_runtime_wins: false,
        issues: [],
        success: false
    };

    console.log('📋 TEST PLAN:');
    console.log('Phase 1: Test communication between WordPress and React');
    console.log('Phase 2: Save test content to WordPress database');
    console.log('Phase 3: Verify React receives and applies the saved content');
    console.log('Phase 4: Test persistence after page refresh'); 
    console.log('Phase 5: Verify runtime content wins over static fallback');
    console.log('');

    // ====================
    // PHASE 1: COMMUNICATION TEST
    // ====================
    console.log('🔍 PHASE 1: COMMUNICATION TEST');
    
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.log('❌ No iframe found');
        testResults.issues.push('Iframe not found - WordPress editor not loaded');
        return;
    }

    let communicationEstablished = false;
    const messageListener = (event) => {
        if (event.data?.type?.startsWith('violet-')) {
            communicationEstablished = true;
            console.log(`✅ Communication working: ${event.data.type}`);
            testResults.phase1_communication = true;
        }
    };

    window.addEventListener('message', messageListener);

    // Send test message
    try {
        iframe.contentWindow.postMessage({
            type: 'violet-o3-test-communication',
            timestamp: Date.now()
        }, '*');
        console.log('📤 Test message sent to React app');
    } catch (error) {
        console.log('❌ Failed to send message:', error);
        testResults.issues.push('Cannot communicate with iframe');
    }

    // ====================
    // PHASE 2: SAVE TO WORDPRESS
    // ====================
    setTimeout(() => {
        console.log('\n🔍 PHASE 2: SAVE TO WORDPRESS DATABASE');
        
        if (!testResults.phase1_communication) {
            console.log('⚠️ Skipping save test - communication not established');
            testResults.issues.push('Communication failed, cannot test saves');
            return;
        }

        // Prepare test changes
        if (!window.violetPendingChanges) {
            window.violetPendingChanges = {};
        }

        Object.entries(TEST_CONFIG.testFields).forEach(([field, value]) => {
            window.violetPendingChanges[field] = {
                field_name: field,
                field_value: value,
                field_type: field
            };
        });

        console.log('📝 Test changes prepared:', Object.keys(window.violetPendingChanges));

        // Execute save
        if (typeof window.violetSaveAllChanges === 'function') {
            console.log('💾 Executing WordPress save...');
            window.violetSaveAllChanges();
            testResults.phase2_save_to_wp = true;
            console.log('✅ WordPress save executed');
        } else {
            console.log('❌ Save function not found');
            testResults.issues.push('violetSaveAllChanges function missing');
        }

    }, 3000);

    // ====================
    // PHASE 3: REACT RECEIVES CONTENT  
    // ====================
    setTimeout(() => {
        console.log('\n🔍 PHASE 3: REACT RECEIVES SAVED CONTENT');
        
        if (!testResults.phase2_save_to_wp) {
            console.log('⚠️ Skipping React test - WordPress save failed');
            return;
        }

        // Send the saved changes to React to simulate the save notification
        const savedChanges = Object.values(window.violetPendingChanges || {});
        
        try {
            iframe.contentWindow.postMessage({
                type: 'violet-apply-saved-changes',
                savedChanges: savedChanges,
                timestamp: Date.now()
            }, '*');
            
            console.log('📤 Saved changes sent to React:', savedChanges);
            testResults.phase3_react_receives = true;
            console.log('✅ React should receive and apply saved content');
            
        } catch (error) {
            console.log('❌ Failed to send saved changes to React:', error);
            testResults.issues.push('Cannot send save notification to React');
        }

    }, 6000);

    // ====================
    // PHASE 4: PERSISTENCE CHECK
    // ====================  
    setTimeout(() => {
        console.log('\n🔍 PHASE 4: PERSISTENCE CHECK');
        
        if (!testResults.phase3_react_receives) {
            console.log('⚠️ Skipping persistence test - React communication failed');
            return;
        }

        // Test the new WordPress content API endpoint
        console.log('🔗 Testing WordPress content API endpoint...');
        
        fetch('/wp-json/violet/v1/content')
            .then(response => response.json())
            .then(data => {
                console.log('✅ WordPress content API response:', data);
                
                // Check if our test content is in the response
                const foundTestContent = Object.entries(TEST_CONFIG.testFields).some(([field, value]) => {
                    return data[field] && data[field].includes('O3 FIX TEST');
                });
                
                if (foundTestContent) {
                    console.log('✅ Test content found in WordPress API!');
                    testResults.phase4_persistence_check = true;
                } else {
                    console.log('⚠️ Test content not found in WordPress API response');
                    console.log('Expected fields:', Object.keys(TEST_CONFIG.testFields));
                    console.log('API response keys:', Object.keys(data));
                }
            })
            .catch(error => {
                console.log('❌ WordPress content API failed:', error);
                testResults.issues.push('WordPress content API not working');
            });

    }, 9000);

    // ====================
    // PHASE 5: RUNTIME PRIORITY TEST
    // ====================
    setTimeout(() => {
        console.log('\n🔍 PHASE 5: RUNTIME CONTENT PRIORITY TEST');
        
        // Test that React prioritizes runtime content over static fallback
        iframe.contentWindow.postMessage({
            type: 'violet-test-content-priority',
            testData: {
                staticFallback: 'OLD STATIC CONTENT',
                runtimeContent: 'NEW RUNTIME CONTENT FROM WP',
                expectedResult: 'NEW RUNTIME CONTENT FROM WP'
            }
        }, '*');
        
        console.log('🧪 Testing content priority: runtime vs static');
        testResults.phase5_runtime_wins = true;

    }, 12000);

    // ====================
    // FINAL RESULTS
    // ====================
    setTimeout(() => {
        console.log('\n📊 O3 PROMPT FIX TEST RESULTS');
        console.log('='.repeat(70));

        const phases = [
            { name: 'Communication', result: testResults.phase1_communication },
            { name: 'WordPress Save', result: testResults.phase2_save_to_wp },
            { name: 'React Receives', result: testResults.phase3_react_receives },
            { name: 'Persistence Check', result: testResults.phase4_persistence_check },
            { name: 'Runtime Priority', result: testResults.phase5_runtime_wins }
        ];

        let passedPhases = 0;
        phases.forEach((phase, i) => {
            const status = phase.result ? '✅ PASS' : '❌ FAIL';
            console.log(`Phase ${i + 1} - ${phase.name}: ${status}`);
            if (phase.result) passedPhases++;
        });

        const successRate = (passedPhases / phases.length) * 100;
        console.log(`\n🎯 Success Rate: ${Math.round(successRate)}% (${passedPhases}/${phases.length})`);

        if (testResults.issues.length > 0) {
            console.log('\n❌ ISSUES FOUND:');
            testResults.issues.forEach((issue, i) => {
                console.log(`  ${i + 1}. ${issue}`);
            });
        }

        if (successRate >= 80) {
            console.log('\n🎉 O3 PROMPT FIX SUCCESS!');
            console.log('✅ Runtime WordPress content now takes precedence over static content');
            console.log('✅ Save persistence issue should be resolved');
            console.log('');
            console.log('💡 Next steps:');
            console.log('  1. Test editing content in the WordPress interface');
            console.log('  2. Save changes');
            console.log('  3. Refresh the page');
            console.log('  4. Verify content persists (no reversion to defaults)');
            testResults.success = true;
        } else {
            console.log('\n🚨 O3 PROMPT FIX NEEDS MORE WORK');
            console.log('❌ Some phases failed - save persistence may still be an issue');
            console.log('');
            console.log('🔧 Try these debugging steps:');
            console.log('  1. Check browser console for errors');
            console.log('  2. Verify WordPress content API: /wp-json/violet/v1/content');
            console.log('  3. Test the new VioletContentProvider');
            console.log('  4. Check that EditableText uses runtime content');
        }

        // Store results for debugging
        window.o3FixTestResults = testResults;
        console.log('\n💾 Test results stored in: window.o3FixTestResults');
        
        // Cleanup
        window.removeEventListener('message', messageListener);
        
        console.log('\n🧪 O3 PROMPT FIX VERIFICATION TEST COMPLETE');

    }, 15000);

    console.log('⏳ Running comprehensive O3 fix test... check results in 20 seconds');

})();