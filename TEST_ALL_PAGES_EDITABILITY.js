/**
 * 🔍 UNIVERSAL EDITING DIAGNOSTIC - ALL PAGES
 * Run this in WordPress Admin console while on Universal Editor page
 */

(function() {
    console.log('🔍 UNIVERSAL EDITING DIAGNOSTIC - CHECKING ALL PAGES');
    console.log('================================================');
    
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.error('❌ No iframe found! Please run this on the Universal Editor page.');
        return;
    }
    
    // Get current iframe URL
    const currentUrl = new URL(iframe.src);
    console.log('📍 Current iframe URL:', currentUrl.href);
    console.log('📋 Current params:', {
        edit_mode: currentUrl.searchParams.get('edit_mode'),
        wp_admin: currentUrl.searchParams.get('wp_admin'),
        wp_origin: currentUrl.searchParams.get('wp_origin')
    });
    
    // Test function for checking editability
    async function testPage(pagePath, pageName) {
        return new Promise((resolve) => {
            console.log(`\n🧪 Testing ${pageName} (${pagePath})...`);
            
            // Navigate to page with params
            const testUrl = new URL(currentUrl.origin + pagePath);
            testUrl.searchParams.set('edit_mode', '1');
            testUrl.searchParams.set('wp_admin', '1');
            testUrl.searchParams.set('wp_origin', window.location.origin);
            
            iframe.src = testUrl.href;
            
            // Wait for page to load
            setTimeout(() => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    
                    // Check for editable elements
                    const editableElements = iframeDoc.querySelectorAll('[data-violet-field]');
                    const editableTextComponents = iframeDoc.querySelectorAll('[data-violet-editable="true"]');
                    const contentEditableElements = iframeDoc.querySelectorAll('[contenteditable="true"]');
                    
                    // Check for editing indicators
                    const hasEditingStyles = iframeDoc.querySelector('#violet-editing-styles-unified');
                    const hasEditingClasses = iframeDoc.querySelectorAll('.violet-editable-element').length > 0;
                    
                    // Check navigation links
                    const navLinks = iframeDoc.querySelectorAll('nav a[href]');
                    let brokenLinks = 0;
                    navLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href && href.startsWith('/') && !href.includes('?')) {
                            brokenLinks++;
                        }
                    });
                    
                    const result = {
                        page: pageName,
                        path: pagePath,
                        editableFields: editableElements.length,
                        editableComponents: editableTextComponents.length,
                        contentEditable: contentEditableElements.length,
                        hasEditingStyles: !!hasEditingStyles,
                        hasEditingClasses: hasEditingClasses,
                        navigationIssues: brokenLinks,
                        status: editableElements.length > 0 ? '✅ WORKING' : '❌ NOT WORKING'
                    };
                    
                    console.log(`📊 ${pageName} Results:`, result);
                    
                    // Show sample editable fields
                    if (editableElements.length > 0) {
                        console.log('   Sample editable fields found:');
                        Array.from(editableElements).slice(0, 5).forEach((el, i) => {
                            console.log(`   ${i + 1}. ${el.dataset.violetField}: "${el.textContent?.slice(0, 50)}..."`);
                        });
                    }
                    
                    if (brokenLinks > 0) {
                        console.warn(`   ⚠️ Found ${brokenLinks} navigation links without edit params!`);
                    }
                    
                    resolve(result);
                } catch (error) {
                    console.error(`   ❌ Error testing ${pageName}:`, error.message);
                    resolve({
                        page: pageName,
                        path: pagePath,
                        status: '❌ ERROR',
                        error: error.message
                    });
                }
            }, 3000); // Wait 3 seconds for page to fully load
        });
    }
    
    // Define pages to test
    const pages = [
        { path: '/', name: 'Home' },
        { path: '/about', name: 'About' },
        { path: '/keynotes', name: 'Keynotes' },
        { path: '/testimonials', name: 'Testimonials' },
        { path: '/contact', name: 'Contact' }
    ];
    
    // Run tests sequentially
    async function runAllTests() {
        console.log('\n🚀 Starting comprehensive page tests...');
        console.log('⏳ This will take about 20 seconds...\n');
        
        const results = [];
        
        for (const page of pages) {
            const result = await testPage(page.path, page.name);
            results.push(result);
        }
        
        // Summary
        console.log('\n📊 SUMMARY REPORT');
        console.log('================');
        
        const working = results.filter(r => r.status === '✅ WORKING').length;
        const notWorking = results.filter(r => r.status === '❌ NOT WORKING').length;
        const errors = results.filter(r => r.status === '❌ ERROR').length;
        
        console.log(`✅ Working pages: ${working}/${pages.length}`);
        console.log(`❌ Not working: ${notWorking}/${pages.length}`);
        console.log(`⚠️ Errors: ${errors}/${pages.length}`);
        
        console.table(results);
        
        // Diagnosis
        console.log('\n🔍 DIAGNOSIS:');
        
        if (working === pages.length) {
            console.log('✅ All pages have universal editing enabled!');
        } else if (working === 1 && results[0].status === '✅ WORKING') {
            console.log('❌ Only home page has editing - Navigation links are causing page reloads!');
            console.log('💡 Solution: Update Navigation.tsx to use React Router Links');
            console.log('📄 See: FIX_UNIVERSAL_EDITING_ALL_PAGES.md for detailed instructions');
        } else if (working === 0) {
            console.log('❌ No pages have editing enabled!');
            console.log('💡 Check if editing mode is properly initialized');
        } else {
            console.log('⚠️ Partial editing coverage detected');
            console.log('💡 Some pages work, others don\'t - check individual page implementations');
        }
        
        // Navigation link check
        const totalNavIssues = results.reduce((sum, r) => sum + (r.navigationIssues || 0), 0);
        if (totalNavIssues > 0) {
            console.log(`\n⚠️ Found ${totalNavIssues} navigation links without edit params`);
            console.log('💡 These links will break editing mode when clicked');
        }
        
        // Return to original page
        console.log('\n🔄 Returning to home page...');
        const returnUrl = new URL(currentUrl.origin);
        returnUrl.searchParams.set('edit_mode', '1');
        returnUrl.searchParams.set('wp_admin', '1');
        returnUrl.searchParams.set('wp_origin', window.location.origin);
        iframe.src = returnUrl.href;
    }
    
    // Quick test for current page only
    window.testCurrentPage = function() {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const currentPath = new URL(iframe.src).pathname;
        
        console.log('\n🔍 Quick test for current page:', currentPath);
        console.log('Editable elements:', iframeDoc.querySelectorAll('[data-violet-field]').length);
        console.log('Links without params:', Array.from(iframeDoc.querySelectorAll('a[href^="/"]')).filter(a => !a.href.includes('?')).length);
        
        return {
            currentPath,
            editableElements: iframeDoc.querySelectorAll('[data-violet-field]').length,
            brokenLinks: Array.from(iframeDoc.querySelectorAll('a[href^="/"]')).filter(a => !a.href.includes('?')).length
        };
    };
    
    // Manual navigation helper
    window.goToPage = function(path) {
        const url = new URL(currentUrl.origin + path);
        url.searchParams.set('edit_mode', '1');
        url.searchParams.set('wp_admin', '1');
        url.searchParams.set('wp_origin', window.location.origin);
        iframe.src = url.href;
        console.log(`📍 Navigated to: ${path}`);
    };
    
    console.log('\n📋 AVAILABLE COMMANDS:');
    console.log('runAllTests() - Test all pages (20 seconds)');
    console.log('testCurrentPage() - Quick test current page');
    console.log('goToPage("/about") - Navigate with edit params');
    console.log('\n🎯 Running full diagnostic now...');
    
    // Auto-run the tests
    runAllTests();
    
})();