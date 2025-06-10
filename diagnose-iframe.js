// WordPress Editor Iframe Diagnostic Script
// Run this in the browser console while on the WordPress editor page

console.clear();
console.log('🔍 IFRAME DIAGNOSTIC STARTING...\n');

// 1. Check iframe element
const iframe = document.getElementById('violet-site-iframe');
if (!iframe) {
    console.error('❌ No iframe found with ID "violet-site-iframe"');
} else {
    console.log('✅ Iframe element found');
    console.log('📍 Current src:', iframe.src);
    console.log('📐 Dimensions:', iframe.offsetWidth + 'x' + iframe.offsetHeight);
    console.log('🖼️ Display:', window.getComputedStyle(iframe).display);
}

// 2. Try to access iframe content
console.log('\n🔒 CHECKING IFRAME ACCESS:');
try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (iframeDoc) {
        console.log('✅ Can access iframe document');
        console.log('📄 Document ready state:', iframeDoc.readyState);
        console.log('📝 Document title:', iframeDoc.title);
        console.log('🌐 Document URL:', iframeDoc.URL);
        
        // Check for React root
        const reactRoot = iframeDoc.getElementById('root');
        console.log('⚛️ React root element:', reactRoot ? '✅ Found' : '❌ Not found');
        
        // Check for errors in iframe console
        if (iframe.contentWindow.console) {
            console.log('📋 Iframe has console access');
        }
        
        // Check body content
        const bodyContent = iframeDoc.body ? iframeDoc.body.innerHTML.substring(0, 200) : 'No body';
        console.log('📄 Body content preview:', bodyContent);
        
    } else {
        console.log('❌ Cannot access iframe document (null)');
    }
} catch (e) {
    console.error('❌ CORS Error - Cannot access iframe:', e.message);
    console.log('💡 This means the iframe is loading from a different origin');
}

// 3. Test loading different URLs
console.log('\n🌐 TESTING DIFFERENT URLS:');

function testUrl(url, description) {
    console.log(`\n📍 Testing: ${description}`);
    console.log(`URL: ${url}`);
    
    // Create temporary iframe for testing
    const testFrame = document.createElement('iframe');
    testFrame.style.display = 'none';
    document.body.appendChild(testFrame);
    
    testFrame.onload = () => {
        console.log(`✅ ${description}: Loaded successfully`);
        document.body.removeChild(testFrame);
    };
    
    testFrame.onerror = (e) => {
        console.log(`❌ ${description}: Failed to load`, e);
        document.body.removeChild(testFrame);
    };
    
    testFrame.src = url;
}

// Test different URL variations
testUrl('https://lustrous-dolphin-447351.netlify.app/', 'Direct Netlify URL');
testUrl('https://lustrous-dolphin-447351.netlify.app/?edit_mode=1', 'With edit mode');
testUrl('https://violetrainwater.com/', 'Custom domain');

// 4. Check for WordPress settings
console.log('\n⚙️ WORDPRESS SETTINGS:');
if (window.config) {
    console.log('Config object:', window.config);
}

// 5. Network check
console.log('\n🌐 CHECKING NETWORK:');
fetch('https://lustrous-dolphin-447351.netlify.app/')
    .then(response => {
        console.log('✅ Site is reachable. Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
    })
    .catch(err => {
        console.error('❌ Cannot reach site:', err);
    });

// 6. Try manual iframe update
console.log('\n🔧 MANUAL FIX ATTEMPT:');
console.log('Run this to manually set iframe URL:');
console.log(`document.getElementById('violet-site-iframe').src = 'https://lustrous-dolphin-447351.netlify.app/?edit_mode=1&wp_admin=1&t=' + Date.now();`);

// 7. Check for console errors
console.log('\n⚠️ CHECK FOR ERRORS:');
console.log('1. Check the browser console for any red errors');
console.log('2. Check the Network tab for failed requests');
console.log('3. Look for Mixed Content warnings (HTTP vs HTTPS)');

console.log('\n✅ DIAGNOSTIC COMPLETE');
