# 🔧 WordPress Frontend Editor Integration Instructions

## For New Chat Session

### Context
"I have a React app with WordPress inline editing. The React side has been updated with a 30-second grace period system to prevent content reversion after saves. Now I need to update the WordPress editor (functions.php) to properly communicate with this new system. The React app expects specific message formats and the WordPress save function needs to notify React when saves are complete."

### What Needs to Be Updated in WordPress

The WordPress `violetSaveAllChanges` function needs to send the correct message format that the React app's new ContentContext expects.

### Required Code Changes in functions.php

#### 1. Update the Save Success Handler

Find the `violetSaveAllChanges` function (around line 1800) and update the success block:

```javascript
if (response.success) {
    // Send changes directly to React app with new format
    var iframe = document.getElementById('violet-site-iframe');
    if (iframe && iframe.contentWindow) {
        // CRITICAL: Send the exact format React ContentContext expects
        iframe.contentWindow.postMessage({
            type: 'violet-apply-saved-changes',
            savedChanges: changes,  // Array of {field_name, field_value} objects
            timestamp: new Date().getTime(),
            syncDelay: 30000  // Tell React about the 30s grace period
        }, config.netlifyOrigin);
        
        console.log('✅ Sent saved changes to React with grace period notification');
    }
    
    // Clear pending changes
    violetPendingChanges = {};
    violetUpdateSaveButton();
    
    // Update status to show grace period info
    violetSetStatus('changes', '✅ Content saved! (Auto-sync paused for 30s)', 'success');
    
    // Optional: Show countdown
    var countdown = 30;
    var countdownInterval = setInterval(function() {
        countdown--;
        if (countdown > 0) {
            violetSetStatus('changes', '✅ Saved (sync paused: ' + countdown + 's)', 'success');
        } else {
            violetSetStatus('changes', '✅ All changes saved', 'success');
            clearInterval(countdownInterval);
        }
    }, 1000);
}
```

#### 2. Update the Edit Mode Enable/Disable Messages

Make sure these messages are being sent correctly:

```javascript
// When enabling edit mode
iframe.contentWindow.postMessage({
    type: 'violet-enable-editing',
    timestamp: new Date().getTime()
}, config.netlifyOrigin);

// When disabling edit mode  
iframe.contentWindow.postMessage({
    type: 'violet-disable-editing',
    timestamp: new Date().getTime()
}, config.netlifyOrigin);
```

#### 3. Add Grace Period Status Display (Optional)

Add a visual indicator for the grace period in the WordPress admin:

```javascript
// Add to your toolbar or status area
function violetShowGracePeriodStatus() {
    var statusDiv = document.createElement('div');
    statusDiv.id = 'violet-grace-period-status';
    statusDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #00a32a;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    statusDiv.innerHTML = '⏸️ Sync paused (30s)';
    document.body.appendChild(statusDiv);
    
    // Remove after 30 seconds
    setTimeout(function() {
        if (document.body.contains(statusDiv)) {
            statusDiv.remove();
        }
    }, 30000);
}
```

### Complete Integration Checklist

1. **Update Save Function** ✓
   - [ ] Modify `violetSaveAllChanges` to send correct message format
   - [ ] Include `syncDelay: 30000` in the message
   - [ ] Add grace period status message

2. **Verify Message Format** ✓
   ```javascript
   {
       type: 'violet-apply-saved-changes',
       savedChanges: [
           { field_name: 'hero_title', field_value: 'New Title' },
           { field_name: 'hero_subtitle', field_value: 'New Subtitle' }
       ],
       timestamp: 1234567890,
       syncDelay: 30000
   }
   ```

3. **Test Integration** ✓
   - [ ] Enable edit mode in WordPress
   - [ ] Make changes to React content
   - [ ] Click Save in WordPress toolbar
   - [ ] Verify "sync paused" message appears
   - [ ] Switch browser tabs and return
   - [ ] Content should persist (not revert)

### Testing Script for WordPress Console

```javascript
// Run this in WordPress admin console to test
var testSave = function() {
    var iframe = document.getElementById('violet-site-iframe');
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
            type: 'violet-apply-saved-changes',
            savedChanges: [
                { 
                    field_name: 'hero_title', 
                    field_value: 'Grace Period Test: ' + new Date().toLocaleTimeString() 
                }
            ],
            timestamp: Date.now(),
            syncDelay: 30000
        }, '*');
        console.log('✅ Test save sent with grace period');
    }
};

testSave();
```

### Key Points for WordPress Integration

1. **Message Types React Expects:**
   - `violet-enable-editing` - Activates edit mode
   - `violet-disable-editing` - Deactivates edit mode
   - `violet-apply-saved-changes` - Confirms save with grace period

2. **Required Fields in Save Message:**
   - `type`: Must be 'violet-apply-saved-changes'
   - `savedChanges`: Array of changes
   - `timestamp`: Current timestamp
   - `syncDelay`: Grace period in milliseconds (30000)

3. **Grace Period Behavior:**
   - React will NOT sync with WordPress for 30 seconds after save
   - This prevents the reversion issue
   - Visual feedback should indicate this to users

### Debugging Tips

1. **Check if messages are received:**
   In React app console:
   ```javascript
   window.addEventListener('message', (e) => {
       if (e.data.type?.includes('violet')) {
           console.log('WordPress message received:', e.data);
       }
   });
   ```

2. **Verify grace period is active:**
   After save, in React console:
   ```javascript
   violetDebug.isInGracePeriod()  // Should return true
   violetDebug.getGracePeriodRemaining()  // Should show ~30000ms
   ```

### Error Prevention

1. **Always include syncDelay:** Without this, React won't know about the grace period
2. **Use correct origin:** Make sure `config.netlifyOrigin` is set correctly
3. **Array format:** `savedChanges` must be an array, not an object

### Quick Reference for WordPress Developer

```javascript
// Minimum required code change in violetSaveAllChanges success block:
iframe.contentWindow.postMessage({
    type: 'violet-apply-saved-changes',
    savedChanges: changes,
    timestamp: Date.now(),
    syncDelay: 30000  // Critical!
}, config.netlifyOrigin);
```

This integration ensures the WordPress editor works seamlessly with the React app's new grace period system, preventing content reversion after saves.