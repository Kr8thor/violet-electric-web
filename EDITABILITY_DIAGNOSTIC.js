/**
 * 🔍 COMPREHENSIVE EDITABILITY DIAGNOSTIC
 * 
 * Run this in WordPress Admin console to check all editing systems
 * Copy and paste entire script, then check results
 */

console.log('🔍 STARTING COMPREHENSIVE EDITABILITY DIAGNOSTIC');
console.log('================================================');

function runEditabilityDiagnostic() {
    const results = {
        score: 0,
        maxScore: 12,
        issues: [],
        successes: [],
        nextSteps: []
    };
    
    console.log('\n🧪 TEST 1: WordPress Admin Interface');
    // Test 1: WordPress Admin Interface
    const universalEditorMenu = document.querySelector('a[href*="violet-universal-editor"]');
    if (universalEditorMenu) {
        results.score++;
        results.successes.push('✅ Universal Editor menu found');
        console.log('✅ Universal Editor menu exists');
    } else {
        results.issues.push('❌ Universal Editor menu missing');
        console.log('❌ Universal Editor menu not found');
    }
    
    console.log('\n🧪 TEST 2: Iframe Presence and Configuration');
    // Test 2: Iframe Presence
    const iframe = document.getElementById('violet-site-iframe');
    if (iframe) {
        results.score++;
        results.successes.push('✅ Iframe found');
        console.log('✅ Iframe exists');
        console.log(`   📋 Iframe URL: ${iframe.src}`);
        
        // Check iframe URL parameters
        const iframeUrl = new URL(iframe.src);
        const hasEditMode = iframeUrl.searchParams.get('edit_mode') === '1';
        const hasWpAdmin = iframeUrl.searchParams.get('wp_admin') === '1';
        
        if (hasEditMode && hasWpAdmin) {
            results.score++;
            results.successes.push('✅ Iframe has correct edit parameters');
            console.log('✅ Iframe URL has correct edit_mode and wp_admin parameters');
        } else {
            results.issues.push('❌ Iframe missing edit parameters');
            console.log('❌ Iframe URL missing edit_mode=1 or wp_admin=1');
        }
    } else {
        results.issues.push('❌ Iframe not found');
        results.nextSteps.push('Navigate to WordPress Admin → Universal Editor');
        console.log('❌ Iframe not found - are you on the Universal Editor page?');
    }
    
    console.log('\n🧪 TEST 3: Edit Controls');
    // Test 3: Edit Controls
    const enableEditingBtn = document.getElementById('violet-enable-editing');
    const saveBtn = document.getElementById('violet-save-all');
    
    if (enableEditingBtn) {
        results.score++;
        results.successes.push('✅ Enable editing button found');
        console.log('✅ Enable editing button exists');
        console.log(`   📋 Button text: "${enableEditingBtn.textContent}"`);
    } else {
        results.issues.push('❌ Enable editing button missing');
        console.log('❌ Enable editing button not found');
    }
    
    if (saveBtn) {
        results.score++;
        results.successes.push('✅ Save button found');
        console.log('✅ Save button exists');
        console.log(`   📋 Button text: "${saveBtn.textContent}"`);
    } else {
        results.issues.push('❌ Save button missing');
        console.log('❌ Save button not found');
    }
    
    console.log('\n🧪 TEST 4: Communication Status');
    // Test 4: Communication Status
    const connectionStatus = document.getElementById('violet-connection-status');
    if (connectionStatus) {
        results.score++;
        const statusText = connectionStatus.textContent;
        console.log(`📡 Connection status: "${statusText}"`);
        
        if (statusText.includes('✅') || statusText.includes('Connected')) {
            results.score++;
            results.successes.push('✅ WordPress-React communication active');
            console.log('✅ Communication appears to be working');
        } else if (statusText.includes('Testing') || statusText.includes('...')) {
            results.issues.push('🟡 Communication still testing');
            console.log('🟡 Communication still in testing phase');
        } else {
            results.issues.push('❌ Communication failed');
            console.log('❌ Communication appears to have failed');
            results.nextSteps.push('Test communication manually');
        }
    } else {
        results.issues.push('❌ Connection status element missing');
        console.log('❌ Connection status element not found');
    }
    
    console.log('\n🧪 TEST 5: WordPress Functions and Variables');
    // Test 5: WordPress Functions
    const functions = [
        'violetActivateEditing',
        'violetSaveAllChanges', 
        'violetRefreshPreview',
        'violetTestCommunication'
    ];
    
    let functionsFound = 0;
    functions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            functionsFound++;
            console.log(`✅ Function ${funcName} exists`);
        } else {
            console.log(`❌ Function ${funcName} missing`);
        }
    });
    
    if (functionsFound >= 3) {
        results.score++;
        results.successes.push(`✅ WordPress functions available (${functionsFound}/${functions.length})`);
    } else {
        results.issues.push(`❌ Missing WordPress functions (${functionsFound}/${functions.length})`);
        results.nextSteps.push('Check functions.php JavaScript section');
    }
    
    console.log('\n🧪 TEST 6: REST API Endpoints');
    // Test 6: REST API Test
    console.log('🌐 Testing WordPress REST API...');
    
    fetch('/wp-json/violet/v1/debug')
        .then(response => response.json())
        .then(data => {
            results.score++;
            results.successes.push('✅ WordPress REST API responding');
            console.log('✅ WordPress REST API working');
            console.log('   📋 API Response:', data);
            
            if (data.user_can_edit) {
                results.score++;
                results.successes.push('✅ User has edit permissions');
                console.log('✅ User has editing permissions');
            } else {
                results.issues.push('❌ User lacks edit permissions');
                console.log('❌ User does not have editing permissions');
            }
            
            continueTests();
        })
        .catch(error => {
            results.issues.push('❌ WordPress REST API failed');
            console.log('❌ WordPress REST API failed:', error);
            results.nextSteps.push('Check REST API endpoints in functions.php');
            continueTests();
        });
    
    function continueTests() {
        console.log('\n🧪 TEST 7: Message Communication Test');
        // Test 7: Message Communication
        if (iframe && iframe.contentWindow) {
            try {
                // Set up message listener
                let messageReceived = false;
                const messageHandler = (event) => {
                    if (event.data && event.data.type && event.data.type.startsWith('violet-')) {
                        messageReceived = true;
                        results.score++;
                        results.successes.push('✅ Cross-origin messaging working');
                        console.log('✅ React app responded to test message');
                        console.log(`   📋 Response type: ${event.data.type}`);
                        window.removeEventListener('message', messageHandler);
                    }
                };
                
                window.addEventListener('message', messageHandler);
                
                // Send test message
                iframe.contentWindow.postMessage({
                    type: 'violet-test-access',
                    timestamp: Date.now()
                }, '*');
                
                console.log('📤 Sent test message to React app...');
                
                // Check for response after 3 seconds
                setTimeout(() => {
                    if (!messageReceived) {
                        results.issues.push('❌ No response from React app');
                        console.log('❌ React app did not respond to test message');
                        results.nextSteps.push('Check React app console for errors');
                    }
                    window.removeEventListener('message', messageHandler);
                    finalizeTests();
                }, 3000);
                
            } catch (error) {
                results.issues.push('❌ Message sending failed');
                console.log('❌ Failed to send test message:', error);
                finalizeTests();
            }
        } else {
            results.issues.push('❌ Cannot access iframe for messaging');
            console.log('❌ Iframe not accessible for messaging');
            finalizeTests();
        }
    }
    
    function finalizeTests() {
        console.log('\n📊 DIAGNOSTIC RESULTS');
        console.log('=====================');
        console.log(`🎯 SYSTEM SCORE: ${results.score}/${results.maxScore}`);
        console.log(`📈 Success Rate: ${Math.round((results.score / results.maxScore) * 100)}%`);
        
        if (results.successes.length > 0) {
            console.log('\n✅ WORKING CORRECTLY:');
            results.successes.forEach(success => console.log(`   ${success}`));
        }
        
        if (results.issues.length > 0) {
            console.log('\n❌ ISSUES FOUND:');
            results.issues.forEach(issue => console.log(`   ${issue}`));
        }
        
        if (results.nextSteps.length > 0) {
            console.log('\n🔧 IMMEDIATE NEXT STEPS:');
            results.nextSteps.forEach((step, index) => console.log(`   ${index + 1}. ${step}`));
        }
        
        console.log('\n🎯 SCORE INTERPRETATION:');
        if (results.score >= 10) {
            console.log('🟢 EXCELLENT (10-12): System is working well, minor tweaks needed');
        } else if (results.score >= 7) {
            console.log('🟡 GOOD (7-9): Core systems working, some issues to fix');
        } else if (results.score >= 4) {
            console.log('🟠 PARTIAL (4-6): Basic setup working, significant issues remain');
        } else {
            console.log('🔴 CRITICAL (0-3): Major systems not working, fundamental fixes needed');
        }
        
        // Test editing mode if possible
        testEditingMode();
    }
    
    function testEditingMode() {
        console.log('\n🧪 BONUS TEST: Editing Mode Activation');
        
        if (enableEditingBtn && iframe) {
            console.log('🔄 Attempting to enable editing mode...');
            
            // Simulate button click
            try {
                enableEditingBtn.click();
                
                setTimeout(() => {
                    // Check if button text changed
                    const newButtonText = enableEditingBtn.textContent;
                    if (newButtonText.includes('Disable') || newButtonText.includes('🔓')) {
                        console.log('✅ Editing mode activated successfully');
                        console.log(`   📋 Button changed to: "${newButtonText}"`);
                        
                        // Try to check iframe content for editable elements
                        setTimeout(() => {
                            try {
                                if (iframe.contentDocument) {
                                    const editableElements = iframe.contentDocument.querySelectorAll('[data-violet-editable]');
                                    console.log(`🎯 Found ${editableElements.length} editable elements in React app`);
                                    
                                    if (editableElements.length > 0) {
                                        console.log('✅ EDITING SYSTEM FULLY OPERATIONAL!');
                                        console.log('\n🎉 SUCCESS: You can now click any text element to edit it!');
                                    } else {
                                        console.log('🟡 Editing mode active but no editable elements detected');
                                        console.log('   💡 This might be normal if elements aren\'t loaded yet');
                                    }
                                } else {
                                    console.log('ℹ️ Cannot inspect iframe content (cross-origin restriction)');
                                    console.log('   💡 Try clicking text elements manually to test editing');
                                }
                            } catch (e) {
                                console.log('ℹ️ Cross-origin restriction prevents iframe inspection');
                                console.log('   💡 Try clicking text elements manually to test editing');
                            }
                        }, 2000);
                        
                    } else {
                        console.log('🟡 Button clicked but text didn\'t change as expected');
                        console.log('   💡 Check browser console for JavaScript errors');
                    }
                }, 1000);
                
            } catch (error) {
                console.log('❌ Failed to activate editing mode:', error);
            }
        } else {
            console.log('⚠️ Cannot test editing mode - button or iframe missing');
        }
        
        console.log('\n🏁 DIAGNOSTIC COMPLETE');
        console.log('======================');
        console.log('📋 Copy these results when asking for help');
        console.log('🔄 Refresh page and run again after making fixes');
    }
}

// Start the diagnostic
runEditabilityDiagnostic();
