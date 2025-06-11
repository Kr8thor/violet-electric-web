/**
 * 🔍 DEEP ROOT CAUSE DIAGNOSTIC
 * This will trace EXACTLY what's happening with content loading
 * Copy and paste into WordPress admin console (F12)
 */

(function() {
    console.log('🔍 DEEP ROOT CAUSE DIAGNOSTIC STARTING...');
    console.log('This will trace the exact content flow to find the real issue');

    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.log('❌ No iframe found');
        return;
    }

    // Step 1: Test localStorage directly
    console.log('\n🔍 STEP 1: CHECKING LOCALSTORAGE STATE');
    console.log('='.repeat(50));
    
    const checkStorage = () => {
        const stored = localStorage.getItem('violet-content');
        console.log('Raw localStorage["violet-content"]:', stored);
        
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                console.log('Parsed content:', parsed);
                
                if (parsed.content) {
                    console.log('Available fields in storage:');
                    Object.entries(parsed.content).forEach(([key, value]) => {
                        console.log(`  ${key}: "${value}"`);
                    });
                } else {
                    console.log('⚠️ No content field in stored data');
                }
            } catch (error) {
                console.log('❌ Storage parsing error:', error);
            }
        } else {
            console.log('⚠️ No content in localStorage');
        }
    };
    
    checkStorage();

    // Step 2: Test React app content loading
    console.log('\n🔍 STEP 2: TESTING REACT APP CONTENT LOADING');
    console.log('='.repeat(50));
    
    const testReactContent = () => {
        // Send comprehensive test message to React
        iframe.contentWindow.postMessage({
            type: 'violet-debug-content-state',
            requestData: {
                contentProviderState: true,
                editableTextValues: true,
                localStorage: true,
                domContent: true
            },
            timestamp: Date.now()
        }, '*');
        
        console.log('📤 Content state request sent to React app');
    };

    // Step 3: Listen for React responses
    const debugResponses = [];
    const responseListener = (event) => {
        if (event.data?.type?.includes('violet-debug') || event.data?.type?.includes('violet-content')) {
            debugResponses.push(event.data);
            console.log('📨 React debug response:', event.data);
        }
    };
    
    window.addEventListener('message', responseListener);

    // Step 4: Advanced React introspection
    console.log('\n🔍 STEP 3: ADVANCED REACT INTROSPECTION');
    console.log('='.repeat(50));
    
    const introspectReact = () => {
        // Send script to run inside React app
        const introspectionScript = `
            // This runs inside the React iframe
            (function() {
                console.log('🔍 React App Introspection Starting...');
                
                // Check if WordPressContentProvider is working
                const checkProvider = () => {
                    console.log('1. Checking WordPressContentProvider...');
                    
                    // Find any EditableText component in DOM
                    const editableElements = document.querySelectorAll('[data-violet-field]');
                    console.log('Found EditableText elements:', editableElements.length);
                    
                    editableElements.forEach((el, index) => {
                        const field = el.getAttribute('data-violet-field');
                        const value = el.getAttribute('data-violet-value');
                        const originalContent = el.getAttribute('data-original-content');
                        const textContent = el.textContent;
                        
                        console.log(\`EditableText \${index + 1}:\`);
                        console.log(\`  Field: \${field}\`);
                        console.log(\`  Data-value: \${value}\`);
                        console.log(\`  Original-content: \${originalContent}\`);
                        console.log(\`  Actual text: \${textContent}\`);
                        console.log(\`  Element:\`, el);
                        console.log('---');
                    });
                };
                
                // Check localStorage from React side
                const checkReactStorage = () => {
                    console.log('2. Checking localStorage from React side...');
                    const stored = localStorage.getItem('violet-content');
                    console.log('React localStorage:', stored);
                    
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        console.log('React parsed content:', parsed);
                    }
                };
                
                // Check content provider state
                const checkContentState = () => {
                    console.log('3. Checking ContentProvider state...');
                    
                    // Try to access React DevTools or component state
                    if (window.React && window.ReactDOM) {
                        console.log('React is available');
                    }
                    
                    // Check global content functions
                    if (window.violetRefreshContent) {
                        console.log('violetRefreshContent is available');
                    }
                    
                    // Check if any global content state exists
                    const globalKeys = Object.keys(window).filter(key => key.includes('violet') || key.includes('content'));
                    console.log('Global violet/content keys:', globalKeys);
                };
                
                // Run all checks
                checkProvider();
                checkReactStorage();
                checkContentState();
                
                // Send comprehensive state back to parent
                window.parent.postMessage({
                    type: 'violet-debug-react-state',
                    data: {
                        editableElements: Array.from(document.querySelectorAll('[data-violet-field]')).map(el => ({
                            field: el.getAttribute('data-violet-field'),
                            value: el.getAttribute('data-violet-value'),
                            textContent: el.textContent,
                            originalContent: el.getAttribute('data-original-content')
                        })),
                        localStorage: localStorage.getItem('violet-content'),
                        globalVioletKeys: Object.keys(window).filter(key => key.includes('violet')),
                        url: window.location.href,
                        timestamp: Date.now()
                    }
                }, '*');
                
                console.log('🔍 React introspection complete - data sent to parent');
            })();
        `;
        
        // Execute script in React iframe
        iframe.contentWindow.eval(introspectionScript);
    };

    // Step 5: Manual content injection test
    console.log('\n🔍 STEP 4: MANUAL CONTENT INJECTION TEST');
    console.log('='.repeat(50));
    
    const testManualInjection = () => {
        console.log('Testing manual content injection...');
        
        // Try to directly set content
        const testContent = {
            version: 'diagnostic-v1',
            timestamp: Date.now(),
            content: {
                hero_title: 'DIAGNOSTIC TEST: Manual injection works!',
                hero_subtitle: 'This proves localStorage injection works',
                hero_cta: 'Manual Test Button'
            }
        };
        
        localStorage.setItem('violet-content', JSON.stringify(testContent));
        console.log('✅ Test content injected into localStorage:', testContent);
        
        // Send message to React to refresh
        iframe.contentWindow.postMessage({
            type: 'violet-force-content-refresh',
            timestamp: Date.now()
        }, '*');
        
        console.log('📤 Refresh message sent to React');
        console.log('💡 Check if the hero title changes to "DIAGNOSTIC TEST: Manual injection works!"');
    };

    // Step 6: Content comparison
    const compareContent = () => {
        console.log('\n📊 CONTENT COMPARISON ANALYSIS:');
        console.log('='.repeat(50));
        
        console.log('Expected in Hero component:');
        console.log('  hero_title default: "Change the Channel."');
        console.log('  hero_subtitle_line2 default: "Change Your Life."');
        
        console.log('\nExpected in WordPressContentProvider:');
        console.log('  hero_title default: "Welcome to Violet Electric"');
        
        console.log('\nActual in screenshot:');
        console.log('  Showing: "Welcome to Our Site"');
        
        console.log('\n🚨 MISMATCH DETECTED:');
        console.log('  "Welcome to Our Site" is NOT in any default values!');
        console.log('  This suggests another content source is overriding everything.');
        console.log('\n🔍 Possible sources:');
        console.log('  1. Another content provider/context');
        console.log('  2. Server-side rendering with different defaults');
        console.log('  3. Hard-coded content in components');
        console.log('  4. WordPress API returning unexpected defaults');
        console.log('  5. Build-time content injection');
    };

    // Execute all tests
    setTimeout(() => {
        console.log('\n🚀 RUNNING ALL DIAGNOSTIC TESTS...');
        
        testReactContent();
        setTimeout(() => {
            introspectReact();
            setTimeout(() => {
                testManualInjection();
                setTimeout(() => {
                    compareContent();
                    
                    // Final analysis
                    setTimeout(() => {
                        console.log('\n📋 DIAGNOSTIC COMPLETE - ANALYSIS:');
                        console.log('='.repeat(50));
                        console.log('Debug responses received:', debugResponses.length);
                        
                        if (debugResponses.length > 0) {
                            console.log('React app is responding to diagnostics');
                            debugResponses.forEach((response, i) => {
                                console.log(`Response ${i + 1}:`, response);
                            });
                        } else {
                            console.log('❌ No responses from React app - communication issue');
                        }
                        
                        console.log('\n🎯 NEXT STEPS:');
                        console.log('1. Check browser console for React app logs');
                        console.log('2. Look for "EditableText elements" output');
                        console.log('3. Verify if manual injection test worked');
                        console.log('4. Check if there are multiple content providers');
                        
                        // Store all diagnostic data
                        window.deepDiagnosticResults = {
                            storage: localStorage.getItem('violet-content'),
                            responses: debugResponses,
                            timestamp: Date.now()
                        };
                        
                        console.log('\n💾 All diagnostic data stored in: window.deepDiagnosticResults');
                        
                    }, 3000);
                }, 2000);
            }, 2000);
        }, 2000);
    }, 1000);

    console.log('⏳ Deep diagnostic running... check results in 15 seconds');
    console.log('💡 Also check the React app console (iframe) for additional logs');

})();
