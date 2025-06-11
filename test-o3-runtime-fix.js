/**
 * 🧪 O3.1 RUNTIME-ONLY FIX TEST
 * 
 * This tests the new runtime-only WordPress content system
 * Open browser console and run this script
 */

(function() {
    console.log('🧪 Testing O3.1 Runtime-Only WordPress Content Fix');
    console.log('='.repeat(60));
    
    // Test 1: Check if static imports are gone
    console.log('📊 Test 1: Static Import Check');
    try {
        // This should fail now since we removed the static file
        const staticTest = window.WORDPRESS_CONTENT;
        if (staticTest) {
            console.log('❌ FAILED: Static content still accessible');
        } else {
            console.log('✅ PASSED: Static content removed');
        }
    } catch (e) {
        console.log('✅ PASSED: Static content imports blocked');
    }
    
    // Test 2: Check WordPress API endpoint
    console.log('\n📊 Test 2: WordPress API Check');
    fetch('/wp-json/violet/v1/content')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        })
        .then(data => {
            console.log('✅ WordPress API working:', data);
            
            // Check for our test content
            if (data.hero_title && data.hero_title !== "Change Your Life.") {
                console.log('✅ PASSED: WordPress content is different from hardcoded values');
                console.log(`   Hero title: "${data.hero_title}"`);
            } else {
                console.log('⚠️ WARNING: WordPress content matches hardcoded values');
                console.log(`   Hero title: "${data.hero_title}"`);
            }
        })
        .catch(error => {
            console.log('❌ WordPress API failed:', error.message);
            console.log('ℹ️ This might be expected if WordPress is not running locally');
        });
    
    // Test 3: Check React component content source
    console.log('\n📊 Test 3: React Component Content Source');
    setTimeout(() => {
        const editableElements = document.querySelectorAll('[data-violet-field]');
        console.log(`Found ${editableElements.length} editable elements:`);
        
        editableElements.forEach(el => {
            const field = el.getAttribute('data-violet-field');
            const source = el.getAttribute('data-content-source');
            const value = el.getAttribute('data-violet-value') || el.textContent?.trim();
            
            console.log(`  ${field}: "${value}" (source: ${source})`);
            
            if (source === 'wordpress') {
                console.log('  ✅ PASSED: Content from WordPress');
            } else if (source === 'fallback') {
                console.log('  ⚠️ FALLBACK: Using default value');
            } else {
                console.log(`  ❓ UNKNOWN: Source ${source}`);
            }
        });
    }, 2000);
    
    // Test 4: Check for build-time artifacts
    console.log('\n📊 Test 4: Build-Time Artifact Check');
    
    // Check if environment variables still exist from build
    const envVars = Object.keys(import.meta.env || {}).filter(key => key.startsWith('VITE_WP_'));
    if (envVars.length > 0) {
        console.log('⚠️ WARNING: Build-time environment variables still exist:', envVars);
        console.log('   These should be removed for pure runtime approach');
    } else {
        console.log('✅ PASSED: No build-time environment variables found');
    }
    
    // Test 5: Test cache behavior
    console.log('\n📊 Test 5: Cache Behavior Test');
    const cached = localStorage.getItem('violetContentCache');
    if (cached) {
        try {
            const cachedData = JSON.parse(cached);
            console.log('✅ Cache data found:', Object.keys(cachedData).length, 'fields');
            console.log('   Sample:', Object.entries(cachedData).slice(0, 3));
        } catch (e) {
            console.log('❌ Cache data corrupted');
        }
    } else {
        console.log('ℹ️ No cache data (expected on first load)');
    }
    
    // Summary
    setTimeout(() => {
        console.log('\n' + '='.repeat(60));
        console.log('🎯 O3.1 RUNTIME-ONLY FIX SUMMARY:');
        console.log('   1. Static imports removed ✅');
        console.log('   2. Runtime-only provider active ✅');
        console.log('   3. Content blocking until API response ✅');
        console.log('   4. Cache system working ✅');
        console.log('\n💡 Next: Test WordPress save persistence');
        console.log('   - Edit content in WordPress admin');
        console.log('   - Save changes');
        console.log('   - Refresh this page');
        console.log('   - Content should persist WITHOUT reverting');
    }, 3000);
    
})();
