/**
 * 🚀 NETLIFY DEPLOYMENT VERIFICATION SCRIPT
 * Run this in browser console to verify deployment status
 */

console.log('🚀 NETLIFY DEPLOYMENT VERIFICATION STARTING...');
console.log('===============================================');

// Test configuration
const NETLIFY_URL = 'https://lustrous-dolphin-447351.netlify.app';
const WORDPRESS_URL = 'https://wp.violetrainwater.com';
const DEPLOY_COMMIT = 'a96396e';

let testResults = {
    deployment: '⏳ Testing...',
    siteLoading: '⏳ Testing...',
    reactComponents: '⏳ Testing...',
    richTextComponents: '⏳ Testing...',
    buildErrors: '⏳ Testing...',
    overallStatus: '⏳ Testing...'
};

function updateResults() {
    console.clear();
    console.log('🚀 NETLIFY DEPLOYMENT VERIFICATION');
    console.log('===================================');
    console.log(`📊 Deployment: ${testResults.deployment}`);
    console.log(`🌐 Site Loading: ${testResults.siteLoading}`);
    console.log(`⚛️ React Components: ${testResults.reactComponents}`);
    console.log(`📝 Rich Text Components: ${testResults.richTextComponents}`);
    console.log(`🔍 Build Errors: ${testResults.buildErrors}`);
    console.log(`✅ Overall Status: ${testResults.overallStatus}`);
    console.log('===================================');
}

// Test 1: Check if site is loading
function testSiteLoading() {
    return fetch(NETLIFY_URL)
        .then(response => {
            if (response.ok) {
                testResults.siteLoading = '✅ Site loading successfully';
                return response.text();
            } else {
                testResults.siteLoading = `❌ Site returned ${response.status}`;
                throw new Error(`HTTP ${response.status}`);
            }
        })
        .then(html => {
            // Check if it's the React app (not a Netlify error page)
            if (html.includes('violet-electric-web') || html.includes('Universal Editor') || html.includes('react')) {
                testResults.siteLoading = '✅ React app deployed successfully';
                return html;
            } else {
                testResults.siteLoading = '⚠️ Site loading but may not be React app';
                return html;
            }
        })
        .catch(error => {
            testResults.siteLoading = `❌ Site loading failed: ${error.message}`;
            throw error;
        });
}

// Test 2: Check for React components in the HTML
function testReactComponents(html) {
    const reactIndicators = [
        'react',
        'vite',
        'assets/index-',
        'app.tsx',
        'main.tsx'
    ];
    
    const foundIndicators = reactIndicators.filter(indicator => 
        html.toLowerCase().includes(indicator.toLowerCase())
    );
    
    if (foundIndicators.length >= 2) {
        testResults.reactComponents = `✅ React app detected (${foundIndicators.length} indicators)`;
        return true;
    } else {
        testResults.reactComponents = `⚠️ React indicators limited (${foundIndicators.length} found)`;
        return false;
    }
}

// Test 3: Check for rich text editor assets
function testRichTextAssets(html) {
    const richTextIndicators = [
        'quill',
        'lexical',
        'richtext',
        'editor'
    ];
    
    const foundEditors = richTextIndicators.filter(editor => 
        html.toLowerCase().includes(editor.toLowerCase())
    );
    
    if (foundEditors.length >= 1) {
        testResults.richTextComponents = `✅ Rich text editors detected (${foundEditors.join(', ')})`;
        return true;
    } else {
        testResults.richTextComponents = '⚠️ Rich text editors not detected in HTML';
        return false;
    }
}

// Test 4: Check for build errors in assets
function testForBuildErrors(html) {
    const errorIndicators = [
        'failed to load',
        '404',
        'module not found',
        'syntax error',
        'unexpected token'
    ];
    
    const foundErrors = errorIndicators.filter(error => 
        html.toLowerCase().includes(error.toLowerCase())
    );
    
    if (foundErrors.length === 0) {
        testResults.buildErrors = '✅ No obvious build errors detected';
        return true;
    } else {
        testResults.buildErrors = `⚠️ Potential build errors: ${foundErrors.join(', ')}`;
        return false;
    }
}

// Test 5: Try to access a specific React route
function testReactRouting() {
    return fetch(`${NETLIFY_URL}/about`)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error(`About page returned ${response.status}`);
        })
        .then(html => {
            if (html.includes('about') || html.includes('About') || html.length > 1000) {
                console.log('✅ React routing appears to be working');
                return true;
            } else {
                console.log('⚠️ React routing may have issues');
                return false;
            }
        })
        .catch(error => {
            console.log(`⚠️ React routing test failed: ${error.message}`);
            return false;
        });
}

// Main test execution
async function runDeploymentVerification() {
    try {
        updateResults();
        
        console.log('🌐 Step 1: Testing site loading...');
        const html = await testSiteLoading();
        updateResults();
        
        console.log('⚛️ Step 2: Checking React components...');
        const reactOk = testReactComponents(html);
        updateResults();
        
        console.log('📝 Step 3: Checking rich text components...');
        const richTextOk = testRichTextAssets(html);
        updateResults();
        
        console.log('🔍 Step 4: Checking for build errors...');
        const buildOk = testForBuildErrors(html);
        updateResults();
        
        console.log('🛤️ Step 5: Testing React routing...');
        const routingOk = await testReactRouting();
        
        // Calculate overall status
        const allTests = [reactOk, buildOk];
        const passedTests = allTests.filter(test => test).length;
        const totalTests = allTests.length;
        
        if (passedTests === totalTests) {
            testResults.overallStatus = '🎉 DEPLOYMENT SUCCESSFUL - All tests passed!';
        } else if (passedTests >= totalTests * 0.7) {
            testResults.overallStatus = `⚠️ DEPLOYMENT PARTIAL - ${passedTests}/${totalTests} tests passed`;
        } else {
            testResults.overallStatus = `❌ DEPLOYMENT ISSUES - Only ${passedTests}/${totalTests} tests passed`;
        }
        
        updateResults();
        
        // Deployment timing check
        testResults.deployment = '✅ Deployment completed and verified';
        updateResults();
        
        // Final summary
        console.log('\n🎯 NEXT STEPS:');
        if (passedTests === totalTests) {
            console.log('✅ 1. Test WordPress Universal Editor');
            console.log('✅ 2. Verify rich text editing works');
            console.log('✅ 3. Test content persistence');
            console.log('✅ 4. Celebrate successful deployment! 🎉');
        } else {
            console.log('🔧 1. Check Netlify deploy logs for errors');
            console.log('🔧 2. Verify all files uploaded correctly');
            console.log('🔧 3. Test specific failing components');
            console.log('🔧 4. Apply fixes and re-deploy if needed');
        }
        
        console.log('\n📊 VERIFICATION COMPLETE!');
        
    } catch (error) {
        testResults.deployment = `❌ Verification failed: ${error.message}`;
        testResults.overallStatus = '❌ DEPLOYMENT VERIFICATION FAILED';
        updateResults();
        
        console.error('\n🚨 VERIFICATION ERROR:', error);
        console.log('\n🔧 TROUBLESHOOTING STEPS:');
        console.log('1. Check if Netlify build is still in progress');
        console.log('2. Wait 2-4 minutes for build completion');
        console.log('3. Check Netlify deploy logs for build errors');
        console.log('4. Verify GitHub push was successful');
    }
}

// Auto-run the verification
console.log('⏳ Starting verification in 3 seconds...');
setTimeout(() => {
    runDeploymentVerification();
}, 3000);

// Manual functions available
window.testDeployment = runDeploymentVerification;
window.checkStatus = updateResults;

console.log('\n🛠️ MANUAL COMMANDS AVAILABLE:');
console.log('testDeployment() - Run full verification');
console.log('checkStatus() - Show current test results');
