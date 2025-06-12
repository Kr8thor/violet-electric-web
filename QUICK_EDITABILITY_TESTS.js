/**
 * 🚀 QUICK EDITABILITY TEST GUIDE
 * Manual steps to verify editing system functionality
 */

console.log('🚀 QUICK EDITABILITY TEST GUIDE');
console.log('================================');

const quickTests = {
    
    // Test 1: Basic Interface Check
    basicInterface: function() {
        console.log('\n🧪 QUICK TEST 1: Basic Interface');
        console.log('1. Are you on: WordPress Admin → Universal Editor page?');
        console.log('2. Do you see an iframe with your React site?');
        console.log('3. Do you see "Enable Universal Editing" button?');
        console.log('4. Does the connection status show "✅ Connected"?');
        console.log('\nIf NO to any: Navigate to correct page or check functions.php');
    },
    
    // Test 2: Communication Test
    communication: function() {
        console.log('\n🧪 QUICK TEST 2: Communication');
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe) {
            console.log('🔄 Testing communication...');
            iframe.contentWindow.postMessage({
                type: 'violet-test-access',
                timestamp: Date.now()
            }, '*');
            console.log('📤 Message sent - watch for response in 3 seconds');
            
            // Listen for response
            let responded = false;
            const listener = (event) => {
                if (event.data && event.data.type && event.data.type.includes('violet')) {
                    responded = true;
                    console.log('✅ React app responded!', event.data.type);
                    window.removeEventListener('message', listener);
                }
            };
            window.addEventListener('message', listener);
            
            setTimeout(() => {
                if (!responded) {
                    console.log('❌ No response from React app');
                    console.log('💡 Check React app console for errors');
                }
                window.removeEventListener('message', listener);
            }, 3000);
        } else {
            console.log('❌ Iframe not found');
        }
    },
    
    // Test 3: Enable Editing
    enableEditing: function() {
        console.log('\n🧪 QUICK TEST 3: Enable Editing');
        const btn = document.getElementById('violet-enable-editing');
        if (btn) {
            console.log('🔄 Clicking enable editing button...');
            const originalText = btn.textContent;
            btn.click();
            
            setTimeout(() => {
                const newText = btn.textContent;
                if (newText !== originalText) {
                    console.log('✅ Button text changed:', newText);
                    console.log('💡 Now try clicking any text in the iframe');
                } else {
                    console.log('❌ Button text did not change');
                    console.log('💡 Check browser console for errors');
                }
            }, 1000);
        } else {
            console.log('❌ Enable editing button not found');
        }
    },
    
    // Test 4: Manual Element Test
    manualTest: function() {
        console.log('\n🧪 QUICK TEST 4: Manual Element Test');
        console.log('Manual steps:');
        console.log('1. Click "Enable Universal Editing" button');
        console.log('2. Look for blue dashed outlines around text in iframe');
        console.log('3. Click any outlined text element');
        console.log('4. Edit dialog should open (not browser prompt)');
        console.log('5. Make a change and save');
        console.log('6. Check if Save button appears with change count');
    },
    
    // Test 5: Check Console Errors
    checkErrors: function() {
        console.log('\n🧪 QUICK TEST 5: Error Check');
        console.log('Checking for JavaScript errors...');
        
        // Get current console errors (limited detection)
        const originalError = console.error;
        let errorCount = 0;
        
        console.error = function(...args) {
            errorCount++;
            originalError.apply(console, args);
        };
        
        setTimeout(() => {
            console.error = originalError;
            if (errorCount === 0) {
                console.log('✅ No recent console errors detected');
            } else {
                console.log(`❌ ${errorCount} console errors detected`);
                console.log('💡 Check browser DevTools → Console for details');
            }
        }, 2000);
    }
};

// Provide quick access functions
window.quickTest = quickTests;

console.log('\n📋 AVAILABLE QUICK TESTS:');
console.log('quickTest.basicInterface()  - Check interface basics');
console.log('quickTest.communication()   - Test WordPress ↔ React communication'); 
console.log('quickTest.enableEditing()   - Test enable editing button');
console.log('quickTest.manualTest()      - Manual testing steps');
console.log('quickTest.checkErrors()     - Check for console errors');

console.log('\n🚀 RUN ALL QUICK TESTS:');
console.log('Object.values(quickTest).forEach(test => test())');

console.log('\n💡 COMMON ISSUES & FIXES:');
console.log('=====================================');
console.log('❌ "Iframe not loading"');
console.log('   → Check Netlify deployment status');
console.log('   → Verify iframe URL in browser directly');

console.log('\n❌ "No response from React app"');  
console.log('   → Check React app console for errors');
console.log('   → Verify edit_mode=1&wp_admin=1 in iframe URL');

console.log('\n❌ "Enable editing does nothing"');
console.log('   → Check WordPress functions.php for JavaScript errors');
console.log('   → Verify violetActivateEditing function exists');

console.log('\n❌ "Text elements not getting blue outlines"');
console.log('   → Check React components use EditableText wrapper');
console.log('   → Verify editing styles are applied');

console.log('\n❌ "Save button never appears"');
console.log('   → Check content change detection');
console.log('   → Verify pendingChanges object updates');

console.log('\n✅ READY FOR TESTING!');
console.log('Run the diagnostic first, then use these quick tests');
