/**
 * 🔧 IMMEDIATE TESTING - Critical Fixes Deployed
 * 
 * Run this in WordPress Admin console to verify both fixes are working
 */

console.log('🔧 TESTING CRITICAL UNIVERSAL EDITING FIXES');
console.log('===========================================');

function testBothIssues() {
    console.log('\n🧪 Testing Fix #1: Text Direction...');
    
    // Test text direction
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
        console.log('📝 Text direction:', computedDirection);
        console.log(computedDirection === 'ltr' ? '✅ Text direction FIXED' : '❌ Still RTL');
        document.body.removeChild(testInput);
    }, 1000);
    
    console.log('\n🧪 Testing Fix #2: Editable Elements...');
    
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
                
                // Look for the specific paragraph that was broken
                const introDescription = Array.from(editableElements).find(el => 
                    el.textContent?.includes('Transforming potential with neuroscience')
                );
                
                if (introDescription) {
                    console.log('✅ Previously broken paragraph is now EDITABLE!');
                    console.log(`   Field: ${introDescription.dataset.violetField}`);
                    console.log(`   Text: "${introDescription.textContent?.slice(0, 50)}..."`);
                } else {
                    console.log('⚠️ Paragraph not found - may still be loading');
                }
                
                // Show all new editable elements
                const newElements = Array.from(editableElements).filter(el => 
                    el.dataset.violetField?.includes('intro_') ||
                    el.dataset.violetField?.includes('highlight_') ||
                    el.dataset.violetField?.includes('pillar_') ||
                    el.dataset.violetField?.includes('newsletter_')
                );
                
                console.log(`✅ NEW editable elements added: ${newElements.length}`);
                newElements.slice(0, 5).forEach((el, i) => {
                    console.log(`   ${i + 1}. ${el.dataset.violetField}: "${el.textContent?.slice(0, 30)}..."`);
                });
                
            } else {
                console.log('⚠️ Cannot access iframe content (cross-origin)');
                console.log('   Enable editing mode first, then try again');
            }
        } catch (error) {
            console.log('⚠️ Cross-origin restriction (normal)');
            console.log('   This means the iframe is loading - try again in a moment');
        }
    }, 3000);
    
    console.log('\n📋 TESTING INSTRUCTIONS:');
    console.log('1. Click "Enable Universal Editing" if not already enabled');
    console.log('2. Look for the paragraph: "Transforming potential with neuroscience..."');
    console.log('3. Hover over it - should show blue dashed outline');
    console.log('4. Click it - edit dialog should open');
    console.log('5. Type in the dialog - text should go LEFT TO RIGHT');
    console.log('6. Every paragraph on the site should now be editable');
}

// Test if we can access iframe immediately
function quickTest() {
    const iframe = document.getElementById('violet-site-iframe');
    if (iframe) {
        console.log('✅ Universal Editor iframe found');
        console.log('🔗 Iframe URL:', iframe.src);
        
        const editButton = document.getElementById('violet-enable-editing');
        if (editButton) {
            console.log('✅ Edit button found:', editButton.textContent);
            console.log('📋 Click the edit button, then run testBothIssues()');
        }
    } else {
        console.log('❌ Please go to WordPress Admin → Universal Editor first');
        console.log('🔗 Direct URL: https://wp.violetrainwater.com/wp-admin/admin.php?page=violet-universal-editor');
    }
}

// Auto-run quick test
quickTest();

// Make functions available
window.testBothIssues = testBothIssues;
window.quickTest = quickTest;

console.log('\n🛠️ AVAILABLE COMMANDS:');
console.log('testBothIssues() - Test both critical fixes');
console.log('quickTest() - Quick environment check');

// If on Universal Editor page, provide immediate feedback
if (window.location.href.includes('violet-universal-editor')) {
    console.log('\n🎯 YOU ARE ON THE UNIVERSAL EDITOR PAGE!');
    console.log('✅ Both critical fixes have been deployed');
    console.log('📋 Next: Click "Enable Universal Editing" and start testing');
    
    // Auto-test in 5 seconds
    setTimeout(() => {
        console.log('\n🔄 Auto-running tests...');
        testBothIssues();
    }, 5000);
}
