# WordPress Editor Issues - Complete Fix Instructions

## Issue #1: Save Not Persisting (CRITICAL)

### The Problem
The save shows success but data doesn't persist in WordPress database. When you check `/wp-json/violet/v1/content`, it still shows old values.

### Quick Test
```javascript
// Run in WordPress admin console to test save directly
jQuery.ajax({
    url: '/wp-json/violet/v1/content/save-batch',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
        changes: [{
            field_name: 'hero_title',
            field_value: 'TEST SAVE ' + Date.now()
        }]
    }),
    success: function(response) {
        console.log('Save response:', response);
        // Now check if it persisted
        jQuery.get('/wp-json/violet/v1/content', function(data) {
            console.log('Verify - hero_title is now:', data.hero_title);
        });
    }
});
```

### Likely Causes
1. **WP Engine object caching** - Options might be cached
2. **Database write permissions**
3. **Option name conflicts**
4. **WordPress transients interfering**

## Issue #2: Save Button Disappears

### Find this code in functions.php (around line 1800):
```javascript
if (response.success) {
    // ... existing code ...
    
    // THIS IS THE PROBLEM - it hides the button:
    violetUpdateSaveButton();
}
```

### The `violetUpdateSaveButton` function (around line 1500):
```javascript
function violetUpdateSaveButton() {
    var count = Object.keys(violetPendingChanges).length;
    var saveBtn = document.getElementById('violet-save-all-btn');
    
    if (count > 0) {
        saveBtn.style.display = 'inline-block';
    } else {
        saveBtn.style.display = 'none'; // THIS HIDES IT!
    }
}
```

### Fix: Change to show saved state instead of hiding
```javascript
function violetUpdateSaveButton() {
    var count = Object.keys(violetPendingChanges).length;
    var saveBtn = document.getElementById('violet-save-all-btn');
    
    if (count > 0) {
        saveBtn.style.display = 'inline-block';
        saveBtn.innerHTML = '💾 Save All Changes (' + count + ')';
        saveBtn.classList.remove('saved-state');
    } else {
        // Don't hide! Show saved state instead
        saveBtn.style.display = 'inline-block';
        saveBtn.innerHTML = '✅ All Changes Saved';
        saveBtn.classList.add('saved-state');
    }
}
```

## Issue #3: React App Disappears on Disable Edit

### Find this in the `violetActivateEditing` function:
```javascript
if (violetEditingEnabled) {
    // Disable editing
    iframe.contentWindow.postMessage({
        type: 'violet-disable-editing'
    }, config.netlifyOrigin);
    
    // PROBLEM: This might be clearing or reloading the iframe
}
```

### The issue is likely in the React side message handler. The iframe src should NEVER change.

### Fix: Ensure iframe src remains constant
```javascript
// Never do this:
iframe.src = ''; // BAD!

// Only send messages, don't touch src:
iframe.contentWindow.postMessage({
    type: 'violet-disable-editing'
}, config.netlifyOrigin);
```

## Complete Test Sequence

1. **Test Save Persistence**:
   ```bash
   # Check current values
   curl https://wp.violetrainwater.com/wp-json/violet/v1/content
   
   # Save new value
   curl -X POST https://wp.violetrainwater.com/wp-json/violet/v1/content/save-batch \
     -H "Content-Type: application/json" \
     -d '{"changes":[{"field_name":"hero_title","field_value":"CLI Test"}]}'
   
   # Verify it saved
   curl https://wp.violetrainwater.com/wp-json/violet/v1/content
   ```

2. **Monitor in Browser**:
   - Open Network tab
   - Watch for save-batch POST
   - Check response status
   - Look for any 500 errors

## Emergency Workaround

If saves aren't working, manually update via WordPress database:
```sql
UPDATE wp_options 
SET option_value = 'Your New Title' 
WHERE option_name = 'violet_hero_title';
```

Or via WP-CLI:
```bash
wp option update violet_hero_title "Your New Title"
```
