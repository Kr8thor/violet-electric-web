// DIAGNOSTIC SCRIPT - Run this in the IFRAME's console, not the parent window
// To access iframe console: Right-click iframe > Inspect > Console tab
// OR in parent console: document.getElementById('violet-site-iframe').contentWindow

(function() {
    console.clear();
    console.log('🔍 REACT APP DIAGNOSTIC\n');
    
    // 1. Check if React is loaded
    const root = document.getElementById('root');
    console.log('1️⃣ React root element:', root ? '✅ Found' : '❌ Not found');
    
    if (root) {
        console.log('   - Children count:', root.children.length);
        console.log('   - Has content:', root.innerHTML.length > 0 ? 'Yes (' + root.innerHTML.length + ' chars)' : 'No');
        console.log('   - Display style:', window.getComputedStyle(root).display);
        console.log('   - Visibility:', window.getComputedStyle(root).visibility);
        console.log('   - Opacity:', window.getComputedStyle(root).opacity);
    }
    
    // 2. Check for React errors
    console.log('\n2️⃣ Checking for React errors...');
    const errorOverlay = document.querySelector('.vite-error-overlay');
    if (errorOverlay) {
        console.log('   ❌ Vite error overlay found!');
        console.log('   Error:', errorOverlay.textContent);
    } else {
        console.log('   ✅ No Vite error overlay');
    }
    
    // 3. Check body styles
    console.log('\n3️⃣ Body styles:');
    const bodyStyle = window.getComputedStyle(document.body);
    console.log('   - Background:', bodyStyle.backgroundColor);
    console.log('   - Display:', bodyStyle.display);
    console.log('   - Height:', bodyStyle.height);
    
    // 4. Check for any elements covering the screen
    console.log('\n4️⃣ Checking for overlays...');
    const allElements = document.querySelectorAll('*');
    let overlays = [];
    
    allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'absolute') {
            const rect = el.getBoundingClientRect();
            if (rect.width > window.innerWidth * 0.8 && rect.height > window.innerHeight * 0.8) {
                overlays.push({
                    element: el,
                    class: el.className,
                    id: el.id,
                    zIndex: style.zIndex,
                    background: style.backgroundColor
                });
            }
        }
    });
    
    if (overlays.length > 0) {
        console.log('   ⚠️ Found potential overlays:', overlays);
    } else {
        console.log('   ✅ No full-screen overlays found');
    }
    
    // 5. Check React Fiber
    console.log('\n5️⃣ React Fiber check:');
    const reactFiber = root && (root._reactRootContainer || root._reactRender);
    console.log('   React mounted:', reactFiber ? '✅ Yes' : '❌ No');
    
    // 6. Check for loading states
    console.log('\n6️⃣ Checking for loading indicators...');
    const loaders = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="loader"]');
    console.log('   Loading elements found:', loaders.length);
    
    // 7. Check console errors
    console.log('\n7️⃣ Recent errors:');
    console.log('   Check the Console tab for any red errors above this diagnostic');
    
    // 8. Try to find any visible content
    console.log('\n8️⃣ Visible content check:');
    const visibleElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0 && 
               rect.height > 0 && 
               style.opacity !== '0' && 
               style.visibility !== 'hidden' &&
               el.textContent.trim().length > 0;
    });
    console.log('   Visible elements with text:', visibleElements.length);
    
    if (visibleElements.length > 0) {
        console.log('   First few visible elements:');
        visibleElements.slice(0, 5).forEach(el => {
            console.log('   -', el.tagName, el.className || '(no class)', el.textContent.substring(0, 50));
        });
    }
    
    // 9. Force show root content
    console.log('\n9️⃣ Attempting to force visibility...');
    if (root) {
        root.style.display = 'block !important';
        root.style.visibility = 'visible !important';
        root.style.opacity = '1 !important';
        root.style.backgroundColor = 'transparent !important';
        console.log('   ✅ Forced root styles applied');
    }
    
    console.log('\n✅ DIAGNOSTIC COMPLETE');
    console.log('💡 Next steps:');
    console.log('1. Check for red errors in console above');
    console.log('2. If root has no children, React failed to mount');
    console.log('3. If overlays found, they may be covering content');
})();
