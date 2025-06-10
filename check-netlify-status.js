// Quick Netlify Status Check
// Run this to check if the React app is properly deployed

(async function checkNetlifyDeployment() {
    console.clear();
    console.log('🚀 CHECKING NETLIFY DEPLOYMENT STATUS...\n');
    
    const netlifyUrl = 'https://lustrous-dolphin-447351.netlify.app/';
    
    try {
        // 1. Check if site responds
        console.log('1️⃣ Checking site availability...');
        const response = await fetch(netlifyUrl);
        console.log('   Status:', response.status);
        
        if (response.status !== 200) {
            console.log('   ❌ Site not responding properly!');
            return;
        }
        
        // 2. Get the HTML
        const html = await response.text();
        console.log('   Response size:', html.length, 'bytes');
        
        // 3. Check for React app structure
        console.log('\n2️⃣ Checking React app structure...');
        
        const checks = {
            'Has DOCTYPE': html.includes('<!DOCTYPE html>'),
            'Has <html> tag': html.includes('<html'),
            'Has <head> section': html.includes('<head>'),
            'Has <body> section': html.includes('<body>'),
            'Has root div': html.includes('id="root"'),
            'Has React script': html.includes('/assets/index-') && html.includes('.js'),
            'Has CSS file': html.includes('/assets/index-') && html.includes('.css'),
            'Has Vite module script': html.includes('type="module"')
        };
        
        Object.entries(checks).forEach(([check, result]) => {
            console.log(`   ${check}: ${result ? '✅' : '❌'}`);
        });
        
        // 4. Extract asset URLs
        console.log('\n3️⃣ Found assets:');
        
        // Find JavaScript files
        const jsMatches = html.match(/src="(\/assets\/[^"]+\.js)"/g);
        if (jsMatches) {
            jsMatches.forEach(match => {
                const url = match.match(/src="([^"]+)"/)[1];
                console.log('   JS:', netlifyUrl + url.substring(1));
            });
        }
        
        // Find CSS files
        const cssMatches = html.match(/href="(\/assets\/[^"]+\.css)"/g);
        if (cssMatches) {
            cssMatches.forEach(match => {
                const url = match.match(/href="([^"]+)"/)[1];
                console.log('   CSS:', netlifyUrl + url.substring(1));
            });
        }
        
        // 5. Check if it's a Netlify error page
        console.log('\n4️⃣ Checking for error indicators...');
        if (html.includes('Page Not Found') || html.includes('404')) {
            console.log('   ❌ This appears to be a 404 page!');
        } else if (html.includes('Deploy did not succeed')) {
            console.log('   ❌ Deploy failed message detected!');
        } else if (html.length < 1000) {
            console.log('   ⚠️ HTML seems too small for a React app:', html.length, 'bytes');
            console.log('   First 500 chars:', html.substring(0, 500));
        } else {
            console.log('   ✅ No obvious error indicators');
        }
        
        // 6. Try to load a JavaScript asset
        if (jsMatches && jsMatches.length > 0) {
            console.log('\n5️⃣ Testing JavaScript asset loading...');
            const jsUrl = jsMatches[0].match(/src="([^"]+)"/)[1];
            const fullJsUrl = netlifyUrl + jsUrl.substring(1);
            
            try {
                const jsResponse = await fetch(fullJsUrl);
                console.log('   JS Status:', jsResponse.status);
                if (jsResponse.status === 200) {
                    const jsContent = await jsResponse.text();
                    console.log('   JS Size:', jsContent.length, 'bytes');
                    console.log('   ✅ JavaScript asset loads correctly');
                } else {
                    console.log('   ❌ JavaScript asset failed to load!');
                }
            } catch (e) {
                console.log('   ❌ Error loading JS:', e.message);
            }
        }
        
        // 7. Check with edit mode parameters
        console.log('\n6️⃣ Checking with edit mode parameters...');
        const editModeUrl = netlifyUrl + '?edit_mode=1&wp_admin=1';
        const editResponse = await fetch(editModeUrl);
        console.log('   Edit mode status:', editResponse.status);
        
        console.log('\n✅ DIAGNOSTIC COMPLETE');
        console.log('\n💡 NEXT STEPS:');
        console.log('1. Check Netlify dashboard: https://app.netlify.com/sites/lustrous-dolphin-447351/deploys');
        console.log('2. Look for the latest deployment status');
        console.log('3. If deployment failed, check build logs');
        console.log('4. Try opening directly:', netlifyUrl);
        
    } catch (error) {
        console.error('❌ Error during check:', error);
    }
})();
