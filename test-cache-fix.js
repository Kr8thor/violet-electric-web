/**
 * WordPress Iframe Cache Fix Verification
 * Run this in WordPress admin console after deployment
 */

console.clear();
console.log('🔧 CACHE FIX VERIFICATION\n');

// 1. Check if we're in WordPress admin
const isWordPressAdmin = window.location.href.includes('wp-admin');
console.log(`1️⃣ WordPress Admin: ${isWordPressAdmin ? '✅' : '❌'}`);

// 2. Check iframe presence
const iframe = document.getElementById('violet-site-iframe');
console.log(`2️⃣ Iframe Found: ${iframe ? '✅' : '❌'}`);

if (iframe) {
    console.log(`   Current iframe src: ${iframe.src}`);
    
    // 3. Check for cache busting parameters
    const url = new URL(iframe.src);
    const hasTimestamp = url.searchParams.has('t');
    const hasRandomId = url.searchParams.has('r');
    const hasVersion = url.searchParams.has('v');
    
    console.log(`3️⃣ Cache Busting Parameters:`);
    console.log(`   Timestamp (t): ${hasTimestamp ? '✅' : '❌'}`);
    console.log(`   Random ID (r): ${hasRandomId ? '✅' : '❌'}`);
    console.log(`   Version (v): ${hasVersion ? '✅' : '❌'}`);
    
    // 4. Test refresh function
    console.log(`\n4️⃣ Testing Refresh Function:`);
    if (typeof window.violetRefreshPreview === 'function') {
        console.log(`   violetRefreshPreview: ✅ Available`);
        console.log(`   💡 Run: violetRefreshPreview() to test strong cache busting`);
    } else {
        console.log(`   violetRefreshPreview: ❌ Not found`);
    }
}

// 5. Asset Loading Test
console.log(`\n5️⃣ Asset Loading Test:`);
const testAssetLoading = () => {
    if (iframe && iframe.contentWindow) {
        iframe.addEventListener('load', () => {
            console.log('✅ Iframe loaded successfully');
            
            // Try to access iframe document (will fail due to CORS but that's expected)
            try {
                const iframeDoc = iframe.contentWindow.document;
                console.log('⚠️ Unexpected: Can access iframe document');
            } catch (e) {
                console.log('✅ Expected: CORS prevents direct document access');
            }
        });
        
        iframe.addEventListener('error', () => {
            console.log('❌ Iframe failed to load');
        });
    }
};

testAssetLoading();

// 6. Instructions
console.log(`\n📋 INSTRUCTIONS:`);
console.log(`1. If iframe shows white screen, click "🔄 Refresh" button`);
console.log(`2. Check Network tab for failed CSS/JS requests`);
console.log(`3. Run: violetRefreshPreview() to force reload with new cache busting`);
console.log(`4. If still fails, try hard refresh: Ctrl+Shift+R`);

// 7. Auto-refresh test
window.testCacheFix = () => {
    console.log('\n🧪 TESTING CACHE FIX...');
    
    if (iframe) {
        const oldSrc = iframe.src;
        console.log('Old src:', oldSrc);
        
        // Force refresh with new parameters
        if (typeof window.violetRefreshPreview === 'function') {
            window.violetRefreshPreview();
            
            setTimeout(() => {
                const newSrc = iframe.src;
                console.log('New src:', newSrc);
                console.log('URLs different:', oldSrc !== newSrc ? '✅' : '❌');
                
                // Check for new cache busting params
                const newUrl = new URL(newSrc);
                const newTimestamp = newUrl.searchParams.get('t');
                const newRandom = newUrl.searchParams.get('r');
                console.log('New timestamp:', newTimestamp);
                console.log('New random ID:', newRandom);
            }, 1000);
        } else {
            console.log('❌ violetRefreshPreview function not available');
        }
    } else {
        console.log('❌ No iframe found');
    }
};

console.log(`\n🚀 QUICK TEST: testCacheFix()`);
console.log(`✨ Cache fix verification complete!`);
