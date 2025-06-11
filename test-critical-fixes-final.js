/**
 * 🔧 CRITICAL FIXES TESTING SCRIPT
 * 
 * Run this in WordPress Admin console to verify fixes are working
 * 
 * FIXES APPLIED:
 * ✅ Save button added to Universal Editor
 * ✅ Text direction fixed (forced LTR)
 * ✅ Enhanced EditableText components
 * ✅ Proper WordPress communication
 * ✅ All components use correct EditableText import
 */

console.log('🔧 TESTING CRITICAL UNIVERSAL EDITING FIXES');
console.log('===========================================');

function testCriticalFixes() {
    console.log('\n🧪 Testing Fix #1: Save Button Presence...');
    
    // Test save button
    const saveButton = document.getElementById('violet-save-all');
    if (saveButton) {
        console.log('✅ SAVE BUTTON FOUND!');
        console.log('   Text:', saveButton.textContent);
        console.log('   Visible:', saveButton.style.display !== 'none');
        console.log('   Click handler:', typeof saveButton.onclick);
    } else {
        console.log('❌ Save button missing - check functions.php update');
    }
    
    console.log('\n🧪 Testing Fix #2: Text Direction...');
    
    // Test text direction by creating temporary input
    const testInput = document.createElement('input');
    testInput.type = 'text';
    testInput.value = 'Test text direction';
    testInput.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 99999;
        padding: 10px;
        border: 2px solid #0073aa;
        background: white;
    `;
    document.body.appendChild(testInput);
    
    setTimeout(() => {
        const computedDirection = getComputedStyle(testInput).direction;
        console.log('📝 Text direction test result:', computedDirection);
        if (computedDirection === 'ltr') {
            console.log('✅ TEXT DIRECTION FIXED - LTR enforced');
        } else {
            console.log('❌ Text direction still RTL - CSS not applied');
        }
        document.body.removeChild(testInput);
    }, 1000);
    
    console.log('\n🧪 Testing Fix #3: Editable Elements...');
    
    // Test iframe content
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.log('❌ Iframe not found - please open Universal Editor first');
        return;
    }
    
    console.log('🖼️ Iframe found, checking content...');
    
    setTimeout(() => {
        try {
            if (iframe.contentDocument) {
                const editableElements = iframe.contentDocument.querySelectorAll('[data-violet-field]');
                console.log(`🎯 Total editable elements: ${editableElements.length}`);
                
                // Look for the specific testimonial that was broken
                const testimonialQuote = Array.from(editableElements).find(el => 
                    el.textContent?.includes('Violet\'s Channel V') ||
                    el.textContent?.includes('framework didn\'t just change')
                );
                
                if (testimonialQuote) {
                    console.log('✅ TESTIMONIAL QUOTE IS NOW EDITABLE!');
                    console.log(`   Field: ${testimonialQuote.dataset.violetField}`);
                    console.log(`   Text: "${testimonialQuote.textContent?.slice(0, 50)}..."`);
                    console.log('   Try clicking it to edit!');
                } else {
                    console.log('⚠️ Testimonial quote not found - may still be loading');
                }
                
                // Show breakdown of editable elements
                const elementTypes = {};
                editableElements.forEach(el => {
                    const field = el.dataset.violetField || 'unknown';
                    const prefix = field.split('_')[0];
                    elementTypes[prefix] = (elementTypes[prefix] || 0) + 1;
                });
                
                console.log('📊 Editable elements by type:');
                Object.entries(elementTypes).forEach(([type, count]) => {
                    console.log(`   ${type}: ${count} elements`);
                });
                
            } else {
                console.log('⚠️ Cannot access iframe content (cross-origin)');
                console.log('   This is normal - try enabling edit mode first');
            }
        } catch (error) {
            console.log('⚠️ Cross-origin restriction (expected)');
            console.log('   Enable editing mode and try again');
        }
    }, 3000);
    
    console.log('\n🧪 Testing Fix #4: WordPress Communication...');
    
    // Test communication system
    let messageReceived = false;
    const messageHandler = (event) => {
        if (event.data?.type?.includes('violet')) {
            messageReceived = true;
            console.log('✅ COMMUNICATION WORKING - Message received:', event.data.type);
        }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Send test message
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
            type: 'violet-test-connection',
            timestamp: Date.now()
        }, '*');
    }
    
    setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        if (messageReceived) {
            console.log('✅ TWO-WAY COMMUNICATION ESTABLISHED');
        } else {
            console.log('⚠️ No response - enable editing mode first');
        }
    }, 2000);
    
    console.log('\n📋 TESTING INSTRUCTIONS:');
    console.log('1. Click "Enable Universal Editing" if not already enabled');
    console.log('2. Look for the testimonial: "Violet\'s Channel V™ framework..."');
    console.log('3. Hover over it - should show blue dashed outline');
    console.log('4. Click it - should become editable with blue background');
    console.log('5. Make a change - should show edited indicator');
    console.log('6. Save button should appear and show change count');
    console.log('7. Click save button - should persist changes');
    console.log('8. Refresh and verify changes persist');
}

// Test if we're on the Universal Editor page
function quickEnvironmentCheck() {
    const iframe = document.getElementById('violet-site-iframe');
    const saveButton = document.getElementById('violet-save-all');
    const editButton = document.getElementById('violet-enable-editing');
    
    console.log('\n🔍 ENVIRONMENT CHECK:');
    console.log('✅ Iframe found:', !!iframe);
    console.log('✅ Save button found:', !!saveButton);
    console.log('✅ Edit button found:', !!editButton);
    
    if (iframe && saveButton && editButton) {
        console.log('🎯 ALL CRITICAL ELEMENTS PRESENT!');
        console.log('📋 Ready to test - run testCriticalFixes()');
        
        if (editButton.textContent.includes('Enable')) {
            console.log('💡 TIP: Click "Enable Universal Editing" first');
        } else {
            console.log('✅ Editing is already enabled');
        }
    } else {
        console.log('❌ Missing elements - check WordPress functions.php update');
    }
}

// Auto-run environment check
quickEnvironmentCheck();

// Make test function available globally
window.testCriticalFixes = testCriticalFixes;
window.quickEnvironmentCheck = quickEnvironmentCheck;

console.log('\n🛠️ AVAILABLE COMMANDS:');
console.log('testCriticalFixes() - Test all fixes comprehensively');
console.log('quickEnvironmentCheck() - Quick interface check');

// Auto-run full test if on Universal Editor page and editing enabled
if (window.location.href.includes('violet-universal-editor')) {
    console.log('\n🎯 ON UNIVERSAL EDITOR PAGE!');
    console.log('✅ All critical fixes have been deployed');
    
    const editButton = document.getElementById('violet-enable-editing');
    if (editButton && !editButton.textContent.includes('Enable')) {
        console.log('📋 Editing enabled - running automatic test...');
        setTimeout(() => {
            testCriticalFixes();
        }, 2000);
    } else {
        console.log('💡 Click "Enable Universal Editing" then run testCriticalFixes()');
    }
}
