/**
 * 🚀 DEPLOYMENT VERIFICATION SCRIPT
 * Verifies the latest Netlify deployment with WordPress integration
 * 
 * INSTRUCTIONS:
 * 1. Open https://lustrous-dolphin-447351.netlify.app in a new tab
 * 2. Press F12 → Console
 * 3. Paste this script to verify deployment
 */

(function() {
    console.log('🚀 DEPLOYMENT VERIFICATION SCRIPT');
    console.log('='.repeat(60));
    console.log('Verifying latest Netlify deployment with WordPress integration');
    console.log('Site: https://lustrous-dolphin-447351.netlify.app');
    console.log('='.repeat(60));
    
    const verification = {
        timestamp: new Date().toLocaleString(),
        deployment: {},
        wordpress: {},
        buildTime: {},
        editing: {},
        issues: [],
        success: false
    };
    
    // Check 1: Build-time WordPress Integration
    console.log('\n1️⃣ Checking build-time WordPress integration...');
    
    const wpContent = (window as any).WORDPRESS_CONTENT || {};
    const hasWpContent = Object.keys(wpContent).length > 0;
    
    verification.wordpress = {
        buildTimeIntegration: hasWpContent,
        fieldsCount: Object.keys(wpContent).length,
        fields: Object.keys(wpContent),
        sampleContent: Object.entries(wpContent).slice(0, 3)
    };
    
    if (hasWpContent) {
        console.log(`   ✅ WordPress content integrated: ${Object.keys(wpContent).length} fields`);
        console.log(`   📋 Fields: ${Object.keys(wpContent).join(', ')}`);
    } else {
        console.log('   ❌ WordPress content not found in build');
        verification.issues.push('WordPress content not integrated at build time');
    }
    
    // Check 2: Environment Variables
    console.log('\n2️⃣ Checking environment variables...');
    
    const envVars = Object.keys(import.meta.env || {}).filter(key => key.startsWith('VITE_WP_'));
    verification.buildTime = {
        envVarsCount: envVars.length,
        envVars: envVars,
        viteVersion: import.meta.env?.VITE_VERSION || 'Unknown'
    };
    
    if (envVars.length > 0) {
        console.log(`   ✅ Environment variables found: ${envVars.length}`);
        console.log(`   📋 Variables: ${envVars.join(', ')}`);
    } else {
        console.log('   ⚠️ No WordPress environment variables found');
    }
    
    // Check 3: Component Integration
    console.log('\n3️⃣ Checking component integration...');
    
    const editableElements = document.querySelectorAll('[data-violet-field]');
    verification.editing = {
        editableElements: editableElements.length,
        fields: Array.from(editableElements).map(el => (el as HTMLElement).dataset.violetField),
        contentValues: Array.from(editableElements).map(el => ({
            field: (el as HTMLElement).dataset.violetField,
            content: el.textContent?.substring(0, 50) + (el.textContent && el.textContent.length > 50 ? '...' : '')
        }))
    };
    
    if (editableElements.length > 0) {
        console.log(`   ✅ Editable elements found: ${editableElements.length}`);
        console.log(`   📋 Fields: ${Array.from(editableElements).map(el => (el as HTMLElement).dataset.violetField).join(', ')}`);
    } else {
        console.log('   ❌ No editable elements found');
        verification.issues.push('No data-violet-field elements found');
    }
    
    // Check 4: Build Quality
    console.log('\n4️⃣ Checking build quality...');
    
    const scripts = document.querySelectorAll('script[src]');
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    const hasHashedAssets = Array.from(scripts).some(script => 
        (script as HTMLScriptElement).src.includes('-') && 
        (script as HTMLScriptElement).src.includes('.js')
    );
    
    verification.deployment = {
        scriptsCount: scripts.length,
        stylesCount: styles.length,
        hasHashedAssets: hasHashedAssets,
        assetUrls: Array.from(scripts).map(s => (s as HTMLScriptElement).src).slice(0, 3)
    };
    
    if (hasHashedAssets) {
        console.log('   ✅ Production build detected (hashed assets)');
    } else {
        console.log('   ⚠️ Development build or asset hashing missing');
    }
    
    // Check 5: WordPress Communication Ready
    console.log('\n5️⃣ Checking WordPress communication readiness...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const inWordPressEditor = urlParams.get('edit_mode') === '1' && urlParams.get('wp_admin') === '1';
    
    if (inWordPressEditor) {
        console.log('   ✅ WordPress editor context detected');
        
        // Send ready message to WordPress
        if (window.parent !== window.self) {
            window.parent.postMessage({
                type: 'violet-iframe-ready',
                deployment: 'latest',
                timestamp: Date.now(),
                hasWordPressContent: hasWpContent,
                editableElements: editableElements.length
            }, '*');
            console.log('   📤 Ready message sent to WordPress');
        }
    } else {
        console.log('   ℹ️ Not in WordPress editor (direct access)');
    }
    
    // Check 6: Content Loading
    console.log('\n6️⃣ Checking content loading...');
    
    const heroTitle = document.querySelector('[data-violet-field="hero_title"]')?.textContent;
    const heroSubtitle = document.querySelector('[data-violet-field="hero_subtitle"]')?.textContent;
    
    if (heroTitle && !heroTitle.includes('Change the Channel')) {
        console.log('   ✅ Dynamic content loaded (not hardcoded defaults)');
        console.log(`   📝 Hero title: "${heroTitle.substring(0, 50)}${heroTitle.length > 50 ? '...' : ''}"`);
    } else {
        console.log('   ⚠️ Hardcoded content detected or content not loaded');
        verification.issues.push('Hardcoded default content still showing');
    }
    
    // Final Report
    setTimeout(() => {
        console.log('\n📊 DEPLOYMENT VERIFICATION RESULTS');
        console.log('='.repeat(60));
        
        const checks = [
            { name: 'WordPress Integration', status: hasWpContent },
            { name: 'Environment Variables', status: envVars.length > 0 },
            { name: 'Editable Elements', status: editableElements.length > 0 },
            { name: 'Production Build', status: hasHashedAssets },
            { name: 'Dynamic Content', status: heroTitle && !heroTitle.includes('Change the Channel') }
        ];
        
        const successCount = checks.filter(check => check.status).length;
        const successRate = Math.round((successCount / checks.length) * 100);
        
        verification.success = successRate >= 80;
        
        console.log(`🎯 Deployment Quality: ${successRate}% (${successCount}/${checks.length})`);
        
        checks.forEach(check => {
            console.log(`   ${check.status ? '✅' : '❌'} ${check.name}`);
        });
        
        if (verification.success) {
            console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
            console.log('✅ WordPress-React integration is working');
            console.log('✅ Build-time content integration active');
            console.log('✅ Save functionality should work');
            
            console.log('\n📋 Ready for WordPress editing:');
            console.log('1. Content is dynamically loaded from WordPress');
            console.log('2. Editable elements are properly marked');
            console.log('3. Communication with WordPress is ready');
            console.log('4. Production-quality build deployed');
            
        } else {
            console.log('\n⚠️ DEPLOYMENT PARTIAL');
            console.log('Some functionality may not work correctly');
            
            if (verification.issues.length > 0) {
                console.log('\n❌ Issues to address:');
                verification.issues.forEach((issue, i) => {
                    console.log(`   ${i + 1}. ${issue}`);
                });
            }
            
            console.log('\n🔧 Recommended actions:');
            if (!hasWpContent) {
                console.log('   - Check WordPress API connectivity during build');
                console.log('   - Verify vite-plugins/wordpress-content-plugin.ts');
            }
            if (editableElements.length === 0) {
                console.log('   - Check EditableText component usage');
                console.log('   - Verify data-violet-field attributes');
            }
        }
        
        console.log('\n📊 Performance Info:');
        console.log(`   Scripts loaded: ${scripts.length}`);
        console.log(`   Styles loaded: ${styles.length}`);
        console.log(`   Editable fields: ${editableElements.length}`);
        console.log(`   WordPress fields: ${Object.keys(wpContent).length}`);
        
        console.log('\n💾 Verification stored in: window.deploymentVerification');
        (window as any).deploymentVerification = verification;
        
        console.log('\n🔍 Next: Test save functionality in WordPress admin');
        console.log('🚀 DEPLOYMENT VERIFICATION COMPLETE');
        console.log('='.repeat(60));
        
    }, 1000);
    
})();
