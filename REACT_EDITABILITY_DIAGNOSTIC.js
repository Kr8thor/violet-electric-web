/**
 * 🎨 REACT EDITABILITY DIAGNOSTIC
 * Run this in the React app console (iframe)
 * Checks if React components are properly set up for editing
 */

console.log('🎨 REACT EDITABILITY DIAGNOSTIC');
console.log('================================');

function checkReactEditability() {
    const results = {
        editableElements: 0,
        missingFields: [],
        components: {},
        editingActive: false,
        errors: []
    };
    
    console.log('\n🧪 React Test 1: Edit Mode Detection');
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('edit_mode') === '1';
    const wpAdmin = urlParams.get('wp_admin') === '1';
    
    if (editMode && wpAdmin) {
        console.log('✅ React app is in edit mode');
        console.log(`   📋 edit_mode: ${editMode}, wp_admin: ${wpAdmin}`);
    } else {
        console.log('❌ React app NOT in edit mode');
        console.log(`   📋 edit_mode: ${editMode}, wp_admin: ${wpAdmin}`);
        results.errors.push('App not in edit mode - check iframe URL parameters');
    }
    
    console.log('\n🧪 React Test 2: EditableText Components');
    // Check for elements with data-violet-field
    const editableElements = document.querySelectorAll('[data-violet-field]');
    results.editableElements = editableElements.length;
    
    console.log(`🎯 Found ${editableElements.length} elements with data-violet-field:`);
    
    if (editableElements.length > 0) {
        editableElements.forEach((el, index) => {
            const field = el.dataset.violetField;
            const text = el.textContent?.slice(0, 50) || 'No text';
            console.log(`   ${index + 1}. ${field}: "${text}..."`);
        });
    } else {
        console.log('❌ No elements with data-violet-field found');
        results.errors.push('No EditableText components detected');
    }
    
    console.log('\n🧪 React Test 3: Critical Components Check');
    // Check specific components that should be editable
    const criticalElements = [
        { selector: 'h1', expected: 'hero_title', description: 'Hero title' },
        { selector: 'p', expected: 'hero_subtitle', description: 'Hero subtitle' },
        { selector: 'button', expected: 'hero_cta', description: 'Hero CTA button' }
    ];
    
    criticalElements.forEach(({ selector, expected, description }) => {
        const elements = document.querySelectorAll(selector);
        let found = false;
        
        elements.forEach(el => {
            if (el.dataset.violetField === expected) {
                found = true;
                console.log(`✅ ${description} found and editable`);
            }
        });
        
        if (!found && elements.length > 0) {
            console.log(`🟡 ${description} exists but may not be editable`);
            results.missingFields.push(expected);
        }
    });
    
    console.log('\n🧪 React Test 4: Editing Indicators');
    // Check for editing-related classes and styles
    const editingElements = document.querySelectorAll('.violet-editable-element');
    const editedElements = document.querySelectorAll('.violet-edited-element');
    
    console.log(`🎯 Elements with editing classes:`);
    console.log(`   Editable: ${editingElements.length}`);
    console.log(`   Edited: ${editedElements.length}`);
    
    if (editingElements.length > 0) {
        results.editingActive = true;
        console.log('✅ Editing mode appears to be active');
    } else {
        console.log('🟡 Editing mode may not be active yet');
    }
    
    console.log('\n🧪 React Test 5: Component Analysis');
    // Try to detect React components
    const possibleComponents = [
        'Hero', 'IntroBrief', 'Navigation', 'Footer', 
        'UniqueValue', 'Newsletter', 'KeyHighlights'
    ];
    
    possibleComponents.forEach(componentName => {
        // Look for elements that might be this component
        const elements = document.querySelectorAll(`[class*="${componentName.toLowerCase()}"], [data-component="${componentName}"]`);
        if (elements.length > 0) {
            results.components[componentName] = elements.length;
            console.log(`✅ ${componentName} component detected (${elements.length} elements)`);
        }
    });
    
    console.log('\n🧪 React Test 6: Communication Test');
    // Test postMessage communication
    if (window.parent !== window) {
        console.log('🔄 Testing communication with WordPress...');
        
        try {
            window.parent.postMessage({
                type: 'violet-iframe-ready',
                timestamp: Date.now(),
                editableElements: results.editableElements,
                editingActive: results.editingActive
            }, '*');
            console.log('✅ Message sent to WordPress admin');
        } catch (error) {
            console.log('❌ Failed to send message to WordPress:', error);
            results.errors.push('PostMessage communication failed');
        }
    } else {
        console.log('ℹ️ Not in iframe - cannot test communication');
    }
    
    console.log('\n🧪 React Test 7: Missing Elements Detection');
    // Look for text that should be editable but isn't
    const allTextElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a');
    let unEditableText = [];
    
    allTextElements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 10 && !el.dataset.violetField && !el.closest('[data-violet-field]')) {
            if (text.length < 100) { // Only show shorter text snippets
                unEditableText.push({
                    tag: el.tagName.toLowerCase(),
                    text: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
                    element: el
                });
            }
        }
    });
    
    if (unEditableText.length > 0) {
        console.log(`🟡 Found ${unEditableText.length} text elements that might need EditableText wrapper:`);
        unEditableText.slice(0, 5).forEach((item, index) => {
            console.log(`   ${index + 1}. <${item.tag}>: "${item.text}"`);
        });
        if (unEditableText.length > 5) {
            console.log(`   ... and ${unEditableText.length - 5} more`);
        }
    }
    
    console.log('\n📊 REACT DIAGNOSTIC RESULTS');
    console.log('============================');
    console.log(`🎯 Editable Elements: ${results.editableElements}`);
    console.log(`🎯 Editing Active: ${results.editingActive ? 'Yes' : 'No'}`);
    console.log(`🎯 Components Detected: ${Object.keys(results.components).length}`);
    console.log(`🎯 Errors Found: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
        console.log('\n❌ ISSUES TO FIX:');
        results.errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
        });
    }
    
    if (results.missingFields.length > 0) {
        console.log('\n🟡 POSSIBLY MISSING EDITABLE FIELDS:');
        results.missingFields.forEach(field => {
            console.log(`   - ${field}`);
        });
    }
    
    // Success criteria
    const score = results.editableElements > 0 ? 1 : 0;
    const editingScore = results.editingActive ? 1 : 0;
    const totalScore = score + editingScore;
    
    console.log('\n🎯 REACT READINESS SCORE:');
    if (totalScore === 2 && results.editableElements >= 5) {
        console.log('🟢 EXCELLENT: React app is ready for editing!');
    } else if (totalScore === 1 || results.editableElements >= 2) {
        console.log('🟡 PARTIAL: Some components ready, others need work');
    } else {
        console.log('🔴 NEEDS WORK: React app not ready for editing');
    }
    
    return results;
}

// Run the diagnostic
const reactResults = checkReactEditability();

// Make results available globally
window.reactEditabilityResults = reactResults;

console.log('\n💡 NEXT STEPS BASED ON RESULTS:');
console.log('==============================');

if (reactResults.editableElements === 0) {
    console.log('🔧 CRITICAL: No EditableText components found');
    console.log('   → Check that components import and use EditableText');
    console.log('   → Verify EditableText is wrapping text elements');
    console.log('   → Example: <EditableText field="hero_title">Text</EditableText>');
}

if (!reactResults.editingActive) {
    console.log('🔧 IMPORTANT: Editing mode not active');
    console.log('   → Click "Enable Universal Editing" in WordPress admin');
    console.log('   → Check browser console for JavaScript errors');
    console.log('   → Verify communication between WordPress and React');
}

if (reactResults.missingFields.length > 0) {
    console.log('🔧 ENHANCEMENT: Add missing editable fields');
    console.log('   → Convert static text to EditableText components');
    console.log('   → Add data-violet-field attributes');
    console.log('   → Test each component individually');
}

console.log('\n🏁 REACT DIAGNOSTIC COMPLETE');
console.log('============================');
console.log('🔄 Run checkReactEditability() again after making changes');
