# 📋 WordPress Editor Update - New Chat Instructions

## Copy-Paste This for New Chat:

"I have a WordPress React frontend editor in functions.php. The React app has been updated with a 30-second grace period system to prevent content reversion after saves. I need to update the WordPress `violetSaveAllChanges` function to send the correct message format.

Currently, when I save in WordPress, the React app gets the message but content reverts when switching tabs. The React ContentContext expects this message format after successful saves:

```javascript
{
    type: 'violet-apply-saved-changes',
    savedChanges: [
        { field_name: 'hero_title', field_value: 'New Value' }
    ],
    timestamp: Date.now(),
    syncDelay: 30000  // 30-second grace period
}
```

The critical part is including `syncDelay: 30000` which tells React to pause WordPress syncing for 30 seconds.

Can you help me update the success handler in `violetSaveAllChanges` to send this exact format?"

## Current Code to Update:

Look for this section in functions.php (around line 1800):

```javascript
if (response.success) {
    // Existing code...
    
    // This part needs updating:
    var iframe = document.getElementById('violet-site-iframe');
    if (iframe && iframe.contentWindow) {
        // UPDATE THIS MESSAGE FORMAT
    }
}
```

## The Fix:

Replace the message sending part with:

```javascript
// Send changes with grace period notification
var iframe = document.getElementById('violet-site-iframe');
if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({
        type: 'violet-apply-saved-changes',
        savedChanges: changes,  // Your existing changes array
        timestamp: new Date().getTime(),
        syncDelay: 30000  // CRITICAL: 30-second grace period
    }, config.netlifyOrigin);
}

// Update status message
violetSetStatus('changes', '✅ Content saved! (Auto-sync paused for 30s)', 'success');
```

## Test Commands:

1. In WordPress admin console:
```javascript
// Test the message format
var iframe = document.getElementById('violet-site-iframe');
iframe.contentWindow.postMessage({
    type: 'violet-apply-saved-changes',
    savedChanges: [{
        field_name: 'hero_title',
        field_value: 'Test: ' + new Date().toLocaleTimeString()
    }],
    timestamp: Date.now(),
    syncDelay: 30000
}, '*');
```

2. In React app console:
```javascript
// Verify grace period is active after save
violetDebug.isInGracePeriod()  // Should return true
violetDebug.getGracePeriodRemaining()  // Should show ~30000ms
```

## Success Criteria:
- ✅ Save in WordPress sends message with `syncDelay: 30000`
- ✅ React console shows "In grace period" 
- ✅ Tab switching doesn't revert content for 30 seconds
- ✅ Status shows "Auto-sync paused"

That's it! The key is adding `syncDelay: 30000` to the save message.