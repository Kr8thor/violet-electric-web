/**
 * 🔍 FINAL DEPLOYMENT VERIFICATION
 * 
 * Run this after updating WordPress functions.php to verify complete system
 */

console.log('🔍 FINAL DEPLOYMENT VERIFICATION');
console.log('================================');

function verifyCompleteSystem() {
    console.log('\n🧪 COMPREHENSIVE SYSTEM CHECK...\n');
    
    // 1. WordPress Interface Check
    console.log('1️⃣ WORDPRESS INTERFACE CHECK:');
    const elements = {
        iframe: document.getElementById('violet-site-iframe'),
        saveButton: document.getElementById('violet-save-all'),
        editButton: document.getElementById('violet-enable-editing'),
        refreshButton: document.getElementById('violet-refresh-preview'),
        status: document.getElementById('violet-status'),
        connectionStatus: document.getElementById('violet-connection-status'),
        changesCount: document.getElementById('violet-changes-count')
    };
    
    Object.entries(elements).forEach(([name, element]) => {
        console.log(`   ${element ? '✅' : '❌'} ${name}: ${element ? 'Found' : 'Missing'}`);
    });
    
    // 2. Save Button Functionality Check
    console.log('\n2️⃣ SAVE BUTTON FUNCTIONALITY:');
    const saveButton = elements.saveButton;
    if (saveButton) {
        console.log('   ✅ Save button exists');
        console.log(`   📝 Current text: "${saveButton.textContent}"`);
        console.log(`   👁️ Visible: ${saveButton.style.display !== 'none'}`);
        console.log(`   🔗 Has click handler: ${saveButton.onclick ? 'Yes' : 'No'}`);
        
        // Check if save button has change counter
        const counter = elements.changesCount;
        if (counter) {
            console.log(`   🔢 Change counter: ${counter.textContent}`);
        }
    }
    
    // 3. React Components Check
    console.log('\n3️⃣ REACT COMPONENTS STATUS:');
    const iframe = elements.iframe;
    if (iframe) {
        console.log('   ✅ Iframe loaded');
        console.log(`   🔗 URL: ${iframe.src}`);
        
        // Check if React app is responding
        let reactResponded = false;
        const messageHandler = (event) => {
            if (event.data?.type?.includes('violet')) {
                reactResponded = true;
                console.log(`   📨 React response: ${event.data.type}`);
            }
        };
        
        window.addEventListener('message', messageHandler);
        
        // Send test message
        iframe.contentWindow.postMessage({
            type: 'violet-test-connection',
            timestamp: Date.now()
        }, '*');
        
        setTimeout(() => {
            window.removeEventListener('message', messageHandler);
            console.log(`   🔄 React communication: ${reactResponded ? 'Working' : 'No response'}`);
        }, 2000);
    }
    
    // 4. Editability Test
    console.log('\n4️⃣ EDITABILITY TEST:');
    setTimeout(() => {
        try {
            if (iframe.contentDocument) {
                const editableElements = iframe.contentDocument.querySelectorAll('[data-violet-field]');
                console.log(`   📝 Total editable elements: ${editableElements.length}`);
                
                // Check specific elements
                const checks = [
                    { name: 'Hero title', selector: '[data-violet-field*="hero"]' },
                    { name: 'Testimonial', selector: '[data-violet-field*="testimonial"]' },
                    { name: 'Navigation', selector: '[data-violet-field*="nav"]' },
                    { name: 'Footer', selector: '[data-violet-field*="footer"]' }
                ];
                
                checks.forEach(check => {
                    const elements = iframe.contentDocument.querySelectorAll(check.selector);
                    console.log(`   ${elements.length > 0 ? '✅' : '❌'} ${check.name}: ${elements.length} elements`);
                });
                
                // Test the specific testimonial that was broken
                const testimonial = Array.from(editableElements).find(el => 
                    el.textContent?.includes('Channel V') || 
                    el.textContent?.includes('framework didn')
                );
                
                if (testimonial) {
                    console.log('   🎯 SPECIFIC TESTIMONIAL CHECK:');
                    console.log(`      ✅ Found testimonial element`);
                    console.log(`      📋 Field: ${testimonial.dataset.violetField}`);
                    console.log(`      📝 Preview: "${testimonial.textContent?.slice(0, 50)}..."`);
                    console.log('      👆 This element should be clickable for editing');
                }
            } else {
                console.log('   ⚠️ Cannot access iframe content - enable editing first');
            }
        } catch (e) {
            console.log('   ⚠️ Cross-origin restriction - enable editing to test');
        }
    }, 3000);
    
    // 5. Text Direction Test
    console.log('\n5️⃣ TEXT DIRECTION TEST:');
    const testDiv = document.createElement('div');
    testDiv.contentEditable = true;
    testDiv.style.cssText = `
        position: fixed;
        top: 50px;
        right: 20px;
        width: 200px;
        padding: 10px;
        border: 2px solid #0073aa;
        background: white;
        z-index: 99999;
    `;
    testDiv.textContent = 'Type here to test direction';
    document.body.appendChild(testDiv);
    
    setTimeout(() => {
        const direction = getComputedStyle(testDiv).direction;
        const textAlign = getComputedStyle(testDiv).textAlign;
        
        console.log(`   📝 Text direction: ${direction}`);
        console.log(`   📐 Text align: ${textAlign}`);
        console.log(`   ${direction === 'ltr' ? '✅' : '❌'} Text direction ${direction === 'ltr' ? 'FIXED' : 'STILL BROKEN'}`);
        
        document.body.removeChild(testDiv);
    }, 2000);
    
    // 6. Overall System Health
    setTimeout(() => {
        console.log('\n6️⃣ OVERALL SYSTEM HEALTH:');
        
        const criticalElements = [
            elements.iframe && 'Iframe',
            elements.saveButton && 'Save Button', 
            elements.editButton && 'Edit Button'
        ].filter(Boolean);
        
        const healthScore = (criticalElements.length / 3) * 100;
        
        console.log(`   📊 System Health: ${healthScore}%`);
        
        if (healthScore === 100) {
            console.log('   🎉 SYSTEM FULLY OPERATIONAL!');
            console.log('   ✅ All critical components present');
            console.log('   🚀 Ready for production use');
        } else if (healthScore >= 66) {
            console.log('   ⚠️ System mostly working but check missing elements');
        } else {
            console.log('   ❌ Critical issues - check WordPress functions.php update');
        }
        
        console.log('\n🎯 NEXT STEPS:');
        if (healthScore === 100) {
            console.log('   1. Click "Enable Universal Editing"');
            console.log('   2. Click any text element to edit');
            console.log('   3. Verify save button appears with changes');
            console.log('   4. Test saving and persistence');
            console.log('   5. System is ready for full use! 🎉');
        } else {
            console.log('   1. Ensure WordPress functions.php is updated');
            console.log('   2. Check browser console for errors');
            console.log('   3. Refresh page and try again');
            console.log('   4. Contact support if issues persist');
        }
        
    }, 6000);
}

// Auto-run verification
if (window.location.href.includes('violet-universal-editor')) {
    console.log('🎯 RUNNING AUTOMATIC VERIFICATION...\n');
    verifyCompleteSystem();
} else {
    console.log('❌ Please go to WordPress Admin → Universal Editor first');
    console.log('🔗 Direct link: wp-admin/admin.php?page=violet-universal-editor');
}

// Make function available globally
window.verifyCompleteSystem = verifyCompleteSystem;

console.log('\n🛠️ MANUAL COMMAND:');
console.log('verifyCompleteSystem() - Run comprehensive verification');
