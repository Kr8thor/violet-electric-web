// React App Debug Script - Run this in the console of the test page
// This will check what's actually happening with the React app

console.clear();
console.log('🔍 REACT APP DEBUG STARTING...\n');

// Function to inspect iframe content
async function debugReactApp() {
    const iframe = document.getElementById('testFrame');
    
    console.log('1️⃣ CHECKING IFRAME CONTENT...');
    
    // Try to access iframe document
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        if (iframeDoc) {
            console.log('✅ Can access iframe document (same origin)');
            
            // Check HTML structure
            console.log('\n2️⃣ HTML STRUCTURE:');
            console.log('- Title:', iframeDoc.title || '(no title)');
            console.log('- Has <head>:', !!iframeDoc.head);
            console.log('- Has <body>:', !!iframeDoc.body);
            
            // Check for React root
            const root = iframeDoc.getElementById('root');
            console.log('- React root div:', root ? '✅ Found' : '❌ Not found');
            
            if (root) {
                console.log('- Root innerHTML length:', root.innerHTML.length);
                console.log('- Root has children:', root.children.length > 0);
            }
            
            // Check for scripts
            console.log('\n3️⃣ SCRIPTS:');
            const scripts = iframeDoc.getElementsByTagName('script');
            console.log('- Total scripts:', scripts.length);
            
            Array.from(scripts).forEach((script, i) => {
                console.log(`  Script ${i + 1}:`, {
                    src: script.src || '(inline)',
                    type: script.type || 'text/javascript',
                    async: script.async,
                    defer: script.defer
                });
            });
            
            // Check for stylesheets
            console.log('\n4️⃣ STYLESHEETS:');
            const links = Array.from(iframeDoc.getElementsByTagName('link')).filter(l => l.rel === 'stylesheet');
            console.log('- Total stylesheets:', links.length);
            
            links.forEach((link, i) => {
                console.log(`  Stylesheet ${i + 1}:`, link.href);
            });
            
            // Check console errors in iframe
            console.log('\n5️⃣ CHECKING FOR ERRORS:');
            
            // Get body content preview
            console.log('\n6️⃣ BODY CONTENT:');
            const bodyText = iframeDoc.body.innerText || iframeDoc.body.textContent || '';
            console.log('- Body text length:', bodyText.length);
            console.log('- First 200 chars:', bodyText.substring(0, 200));
            
            // Check for error messages
            if (bodyText.includes('404') || bodyText.includes('Not Found')) {
                console.log('❌ 404 Error detected!');
            }
            if (bodyText.includes('Cannot GET') || bodyText.includes('Error')) {
                console.log('❌ Error message detected in body!');
            }
            
        } else {
            console.log('❌ Cannot access iframe document (null)');
        }
    } catch (e) {
        console.log('🔒 Cross-origin iframe - checking from outside...');
        
        // Try to check the direct URL
        console.log('\n7️⃣ CHECKING DIRECT URL:');
        const currentUrl = iframe.src;
        console.log('Current iframe URL:', currentUrl);
        
        try {
            const response = await fetch(currentUrl);
            const html = await response.text();
            
            console.log('- Response status:', response.status);
            console.log('- Response length:', html.length);
            
            // Check for React indicators
            const hasRoot = html.includes('id="root"');
            const hasReactScript = html.includes('/assets/index-') && html.includes('.js');
            const hasStylesheet = html.includes('/assets/index-') && html.includes('.css');
            
            console.log('- Has root div:', hasRoot ? '✅' : '❌');
            console.log('- Has React script:', hasReactScript ? '✅' : '❌');
            console.log('- Has stylesheet:', hasStylesheet ? '✅' : '❌');
            
            // Extract script URLs
            const scriptMatches = html.match(/src="([^"]+\.js)"/g);
            if (scriptMatches) {
                console.log('\n8️⃣ FOUND SCRIPTS:');
                scriptMatches.forEach(match => {
                    const url = match.match(/src="([^"]+)"/)[1];
                    console.log('- ', url);
                });
            }
            
            // Check if it's an error page
            if (html.includes('Page not found') || html.includes('404')) {
                console.log('\n❌ This appears to be a 404 error page!');
            }
            
        } catch (fetchError) {
            console.log('❌ Failed to fetch URL:', fetchError.message);
        }
    }
    
    console.log('\n9️⃣ RECOMMENDATIONS:');
    console.log('1. Open browser DevTools and switch to the iframe context');
    console.log('2. Check the Console tab for JavaScript errors');
    console.log('3. Check the Network tab for failed resource loads');
    console.log('4. Try opening the iframe URL directly in a new tab');
}

// Function to open iframe content in new tab
window.openIframeInNewTab = function() {
    const iframe = document.getElementById('testFrame');
    if (iframe && iframe.src) {
        console.log('Opening in new tab:', iframe.src);
        window.open(iframe.src, '_blank');
    }
};

// Run the debug
debugReactApp();

console.log('\n💡 COMMANDS:');
console.log('- openIframeInNewTab() : Open the current iframe URL in a new tab');
console.log('- debugReactApp()      : Re-run this debug script');
