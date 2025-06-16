QUICK TEST AND FIX SCRIPT
=========================

Run this in the browser console while on the WordPress admin "Edit Frontend" page:

```javascript
// 1. Check if save button exists
var saveBtn = document.getElementById('violet-save-all-btn');
console.log('Save button found:', saveBtn);

// 2. If it exists but is hidden, show it
if (saveBtn) {
    saveBtn.style.display = 'inline-block';
    saveBtn.style.visibility = 'visible';
    saveBtn.style.opacity = '1';
    console.log('Save button now visible');
} else {
    console.log('ERROR: Save button not found in DOM');
}

// 3. Check if the save function exists
console.log('Save function exists:', typeof violetSaveAllChangesFixed === 'function' || typeof violetSaveAllChanges === 'function');

// 4. Add a test change to see if button updates
if (typeof violetPendingChanges !== 'undefined') {
    violetPendingChanges['test_field'] = {
        field_name: 'test_field',
        field_value: 'test value'
    };
    console.log('Added test change:', violetPendingChanges);
    
    // Update button to show changes
    if (typeof violetUpdateSaveButton === 'function') {
        violetUpdateSaveButton();
        console.log('Updated save button display');
    }
}

// 5. If button still doesn't exist, create it manually
if (!saveBtn) {
    console.log('Creating save button manually...');
    
    var toolbar = document.querySelector('.violet-blue-toolbar-final');
    if (toolbar) {
        var newSaveBtn = document.createElement('button');
        newSaveBtn.id = 'violet-save-all-btn';
        newSaveBtn.className = 'button button-hero violet-save-button';
        newSaveBtn.innerHTML = '💾 Save All Changes (<span id="violet-changes-count">0</span>)';
        newSaveBtn.onclick = function() { 
            if (typeof violetSaveAllChangesFixed === 'function') {
                violetSaveAllChangesFixed();
            } else if (typeof violetSaveAllChanges === 'function') {
                violetSaveAllChanges();
            } else {
                console.error('No save function found!');
            }
        };
        
        // Insert after the edit toggle button
        var editBtn = document.getElementById('violet-edit-toggle');
        if (editBtn && editBtn.nextSibling) {
            toolbar.insertBefore(newSaveBtn, editBtn.nextSibling);
        } else {
            toolbar.appendChild(newSaveBtn);
        }
        
        console.log('Save button created and added to toolbar');
    } else {
        console.error('Toolbar not found');
    }
}
```

If the button appears after running this script, then the issue is that:
1. The button HTML is not being rendered in PHP
2. OR there's CSS/JS hiding it
3. OR there's a JavaScript error preventing it from showing

TO PERMANENTLY FIX IN WORDPRESS:
================================

Add this to the WordPress admin page (in functions.php after the toolbar HTML):

```javascript
<script>
// Force show save button when page loads
document.addEventListener('DOMContentLoaded', function() {
    var saveBtn = document.getElementById('violet-save-all-btn');
    if (saveBtn) {
        saveBtn.style.display = 'inline-block';
        saveBtn.style.visibility = 'visible';
        saveBtn.style.opacity = '1';
    }
});
</script>
```