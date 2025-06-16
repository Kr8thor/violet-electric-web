// WORDPRESS ADMIN DEBUG SCRIPT
// Run this in the browser console while on the WordPress Edit Frontend page

console.log('=== VIOLET SAVE BUTTON DEBUG ===');

// 1. Check if save button exists in DOM
var saveBtn = document.getElementById('violet-save-all-btn');
console.log('1. Save button element found:', saveBtn);

if (saveBtn) {
    // 2. Check current styles
    console.log('2. Current button styles:');
    console.log('   - display:', saveBtn.style.display);
    console.log('   - visibility:', saveBtn.style.visibility);
    console.log('   - opacity:', saveBtn.style.opacity);
    console.log('   - className:', saveBtn.className);
    
    // 3. Check computed styles
    var computed = window.getComputedStyle(saveBtn);
    console.log('3. Computed styles:');
    console.log('   - display:', computed.display);
    console.log('   - visibility:', computed.visibility);
    console.log('   - opacity:', computed.opacity);
    
    // 4. Force show the button
    console.log('4. Forcing button visible...');
    saveBtn.style.display = 'inline-block';
    saveBtn.style.visibility = 'visible';
    saveBtn.style.opacity = '1';
    saveBtn.style.position = 'relative';
    saveBtn.style.zIndex = '9999';
    
    console.log('✅ Save button should now be visible!');
    
    // 5. Check if button is inside toolbar
    var toolbar = document.querySelector('.violet-blue-toolbar-final');
    console.log('5. Button is in toolbar:', toolbar && toolbar.contains(saveBtn));
    
    // 6. Test button functionality
    saveBtn.onclick = function() {
        console.log('Save button clicked!');
        if (typeof violetSaveAllChangesFixed === 'function') {
            violetSaveAllChangesFixed();
        } else if (typeof violetSaveAllChanges === 'function') {
            violetSaveAllChanges();
        } else {
            console.error('No save function found!');
        }
    };
    
} else {
    console.error('❌ Save button not found in DOM!');
    
    // Try to find toolbar and create button
    var toolbar = document.querySelector('.violet-blue-toolbar-final');
    if (toolbar) {
        console.log('Creating save button manually...');
        
        var newBtn = document.createElement('button');
        newBtn.id = 'violet-save-all-btn';
        newBtn.className = 'button button-hero violet-save-button';
        newBtn.innerHTML = '💾 Save All Changes (<span id="violet-changes-count">0</span>)';
        newBtn.style.display = 'inline-block';
        newBtn.onclick = function() {
            if (typeof violetSaveAllChanges === 'function') {
                violetSaveAllChanges();
            } else {
                console.error('Save function not available');
            }
        };
        
        // Insert after first button
        var firstBtn = toolbar.querySelector('button');
        if (firstBtn && firstBtn.nextSibling) {
            toolbar.insertBefore(newBtn, firstBtn.nextSibling);
        } else {
            toolbar.appendChild(newBtn);
        }
        
        console.log('✅ Save button created and added!');
    } else {
        console.error('❌ Toolbar not found!');
    }
}

// 7. Check if functions exist
console.log('6. Function checks:');
console.log('   - violetSaveAllChanges exists:', typeof violetSaveAllChanges === 'function');
console.log('   - violetUpdateSaveButton exists:', typeof violetUpdateSaveButton === 'function');
console.log('   - violetPendingChanges exists:', typeof violetPendingChanges !== 'undefined');

// 8. Add test changes to see if button updates
if (typeof violetPendingChanges !== 'undefined') {
    console.log('7. Adding test changes...');
    violetPendingChanges['test_field'] = {
        field_name: 'test_field',
        field_value: 'test value',
        field_type: 'test'
    };
    
    if (typeof violetUpdateSaveButton === 'function') {
        violetUpdateSaveButton();
        console.log('✅ Called violetUpdateSaveButton()');
    }
}

console.log('=== DEBUG COMPLETE ===');