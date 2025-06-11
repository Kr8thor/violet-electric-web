/**
 * 🔍 COMPREHENSIVE CONTENT PERSISTENCE DIAGNOSTIC
 * 
 * Run this in WordPress admin console to diagnose why changes revert on refresh
 * This will test the complete content loading chain from WordPress → React
 */

(function() {
    console.log('🔍 CONTENT PERSISTENCE DIAGNOSTIC STARTING...');
    console.log('=' .repeat(60));

    let diagnosticResults = {
        wordpressAPI: null,
        reactFetch: null,
        contentComparison: null,
        timing: null,
        cacheState: null,
        issues: [],
        recommendations: []
    };

    // ====================
    // TEST 1: WORDPRESS API DIRECT TEST
    // ====================
    async function testWordPressAPI() {
        console.log('\n🔍 TEST 1: WORDPRESS API DIRECT TEST');
        console.log('-'.repeat(40));
        
        try {
            const response = await fetch('/wp-json/violet/v1/content');
            const data = await response.json();
            
            console.log('✅ WordPress API Response:');
            console.log('   Status:', response.status);
            console.log('   Data:', data);
            
            // Check specific fields
            const keyFields = ['hero_title', 'hero_subtitle', 'hero_cta'];
            console.log('\n📋 Key Content Fields:');
            keyFields.forEach(field => {
                const value = data[field] || 'NOT SET';
                console.log(`   ${field}: "${value}"`);
            });
            
            diagnosticResults.wordpressAPI = {
                status: 'success',
                data: data,
                keyFields: keyFields.reduce((acc, field) => {
                    acc[field] = data[field] || 'NOT SET';
                    return acc;
                }, {})
            };
            
            return data;
            
        } catch (error) {
            console.log('❌ WordPress API Error:', error);
            diagnosticResults.wordpressAPI = {
                status: 'error',
                error: error.message
            };
            diagnosticResults.issues.push('WordPress API not accessible');
            return null;
        }
    }

    // ====================
    // TEST 2: REACT APP CONTENT FETCH TEST
    // ====================
    async function testReactFetch() {
        console.log('\n🔍 TEST 2: REACT APP CONTENT FETCH TEST');
        console.log('-'.repeat(40));
        
        const iframe = document.getElementById('violet-site-iframe');
        if (!iframe || !iframe.contentWindow) {
            console.log('❌ No iframe found or not accessible');
            diagnosticResults.reactFetch = { status: 'error', error: 'No iframe access' };
            diagnosticResults.issues.push('Iframe not accessible');
            return;
        }

        // Test if React app is fetching content
        return new Promise((resolve) => {
            const testId = Date.now();
            
            // Listen for response
            const messageListener = (event) => {
                if (event.data?.type === 'violet-diagnostic-response' && event.data.testId === testId) {
                    window.removeEventListener('message', messageListener);
                    
                    console.log('✅ React App Content State:');
                    console.log('   Provider loaded:', event.data.providerLoaded);
                    console.log('   Content loaded:', event.data.contentLoaded);
                    console.log('   Loading state:', event.data.loading);
                    console.log('   Error state:', event.data.error);
                    console.log('   Current content:', event.data.currentContent);
                    
                    diagnosticResults.reactFetch = {
                        status: 'success',
                        data: event.data
                    };
                    
                    if (!event.data.contentLoaded) {
                        diagnosticResults.issues.push('React app not loading WordPress content');
                    }
                    
                    resolve(event.data);
                }
            };
            
            window.addEventListener('message', messageListener);
            
            // Send diagnostic request to React app
            iframe.contentWindow.postMessage({
                type: 'violet-diagnostic-request',
                testId: testId
            }, '*');
            
            // Timeout after 5 seconds
            setTimeout(() => {
                window.removeEventListener('message', messageListener);
                console.log('⏱️ React diagnostic timed out');
                diagnosticResults.reactFetch = { status: 'timeout' };
                diagnosticResults.issues.push('React app not responding to diagnostic requests');
                resolve(null);
            }, 5000);
        });
    }

    // ====================
    // TEST 3: CONTENT COMPARISON
    // ====================
    function compareContent(wpData, reactData) {
        console.log('\n🔍 TEST 3: CONTENT COMPARISON');
        console.log('-'.repeat(40));
        
        if (!wpData || !reactData) {
            console.log('❌ Cannot compare - missing data');
            diagnosticResults.contentComparison = { status: 'error', error: 'Missing data' };
            return;
        }

        const keyFields = ['hero_title', 'hero_subtitle', 'hero_cta'];
        const differences = [];
        
        console.log('📊 Content Comparison:');
        keyFields.forEach(field => {
            const wpValue = wpData[field] || 'NOT SET';
            const reactValue = reactData.currentContent?.[field] || 'NOT SET';
            const match = wpValue === reactValue;
            
            console.log(`\n   Field: ${field}`);
            console.log(`   WordPress: "${wpValue}"`);
            console.log(`   React:     "${reactValue}"`);
            console.log(`   Match:     ${match ? '✅' : '❌'}`);
            
            if (!match) {
                differences.push({
                    field,
                    wordpress: wpValue,
                    react: reactValue
                });
            }
        });

        diagnosticResults.contentComparison = {
            status: 'success',
            differences: differences,
            totalFields: keyFields.length,
            matchingFields: keyFields.length - differences.length
        };

        if (differences.length > 0) {
            diagnosticResults.issues.push(`Content mismatch in ${differences.length} fields`);
            console.log(`\n❌ Found ${differences.length} content mismatches!`);
        } else {
            console.log(`\n✅ All ${keyFields.length} fields match!`);
        }
    }

    // ====================
    // TEST 4: CACHE STATE TEST  
    // ====================
    function testCacheState() {
        console.log('\n🔍 TEST 4: CACHE STATE TEST');
        console.log('-'.repeat(40));
        
        try {
            const cached = localStorage.getItem('violetContentCache');
            if (cached) {
                const cacheData = JSON.parse(cached);
                console.log('✅ Cache found:');
                console.log('   Cache data:', cacheData);
                
                diagnosticResults.cacheState = {
                    status: 'found',
                    data: cacheData
                };
            } else {
                console.log('⚠️ No cache found');
                diagnosticResults.cacheState = {
                    status: 'empty'
                };
                diagnosticResults.issues.push('No content cache available');
            }
        } catch (error) {
            console.log('❌ Cache read error:', error);
            diagnosticResults.cacheState = {
                status: 'error',
                error: error.message
            };
            diagnosticResults.issues.push('Cache corrupted or unreadable');
        }
    }

    // ====================
    // TEST 5: TIMING ANALYSIS
    // ====================
    function analyzeTimingIssues() {
        console.log('\n🔍 TEST 5: TIMING ANALYSIS');
        console.log('-'.repeat(40));
        
        const iframe = document.getElementById('violet-site-iframe');
        if (!iframe) {
            console.log('❌ No iframe to analyze');
            return;
        }

        const iframeSrc = iframe.src;
        const hasEditParams = iframeSrc.includes('edit_mode=1') && iframeSrc.includes('wp_admin=1');
        
        console.log('🔗 Iframe URL Analysis:');
        console.log('   URL:', iframeSrc);
        console.log('   Has edit params:', hasEditParams);
        
        if (!hasEditParams) {
            diagnosticResults.issues.push('Iframe missing edit mode parameters');
            diagnosticResults.recommendations.push('Ensure iframe URL includes edit_mode=1&wp_admin=1');
        }

        diagnosticResults.timing = {
            iframeUrl: iframeSrc,
            hasEditParams: hasEditParams,
            timestamp: new Date().toISOString()
        };
    }

    // ====================
    // GENERATE FINAL REPORT
    // ====================
    function generateReport() {
        console.log('\n📊 DIAGNOSTIC SUMMARY');
        console.log('='.repeat(60));
        
        const testsRun = Object.values(diagnosticResults).filter(v => v !== null).length;
        const issuesFound = diagnosticResults.issues.length;
        
        console.log(`📈 Tests completed: ${testsRun}/5`);
        console.log(`❌ Issues found: ${issuesFound}`);
        
        if (issuesFound === 0) {
            console.log('\n🎉 NO ISSUES FOUND!');
            console.log('Content persistence should be working correctly.');
        } else {
            console.log('\n🚨 ISSUES IDENTIFIED:');
            diagnosticResults.issues.forEach((issue, i) => {
                console.log(`   ${i + 1}. ${issue}`);
            });
        }

        if (diagnosticResults.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            diagnosticResults.recommendations.forEach((rec, i) => {
                console.log(`   ${i + 1}. ${rec}`);
            });
        }

        // Root cause analysis
        console.log('\n🔍 ROOT CAUSE ANALYSIS:');
        if (diagnosticResults.wordpressAPI?.status === 'error') {
            console.log('   🎯 PRIMARY: WordPress API not working');
            console.log('   🔧 FIX: Check WordPress functions.php and REST API');
        } else if (diagnosticResults.reactFetch?.status === 'timeout' || diagnosticResults.reactFetch?.status === 'error') {
            console.log('   🎯 PRIMARY: React app not communicating');
            console.log('   🔧 FIX: Check VioletContentProvider and useEffect');
        } else if (diagnosticResults.contentComparison?.differences?.length > 0) {
            console.log('   🎯 PRIMARY: Content sync mismatch');
            console.log('   🔧 FIX: React app using defaultValue instead of WordPress content');
        } else if (diagnosticResults.cacheState?.status === 'empty') {
            console.log('   🎯 PRIMARY: No content caching');
            console.log('   🔧 FIX: Implement proper localStorage caching');
        } else {
            console.log('   🎯 PRIMARY: Unknown - all tests passed');
            console.log('   🔧 FIX: Check browser console and network requests');
        }

        // Store results globally for further debugging
        window.violetDiagnosticResults = diagnosticResults;
        console.log('\n💾 Full results stored in: window.violetDiagnosticResults');
        
        console.log('\n🔍 CONTENT PERSISTENCE DIAGNOSTIC COMPLETE');
    }

    // ====================
    // RUN ALL TESTS
    // ====================
    async function runDiagnostic() {
        console.log('🚀 Starting comprehensive diagnostic...\n');
        
        // Test 1: WordPress API
        const wpData = await testWordPressAPI();
        
        // Test 2: React app fetch
        const reactData = await testReactFetch();
        
        // Test 3: Content comparison
        compareContent(wpData, reactData);
        
        // Test 4: Cache state
        testCacheState();
        
        // Test 5: Timing analysis
        analyzeTimingIssues();
        
        // Generate final report
        generateReport();
    }

    // Start diagnostic
    runDiagnostic();

})();
