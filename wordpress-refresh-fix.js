// Add this JavaScript to your WordPress admin to force content refresh
// This ensures the React app gets and displays the saved content

function forceReactContentRefresh() {
    console.log('🔄 Forcing React content refresh...');
    
    var iframe = document.getElementById('violet-site-iframe');
    if (!iframe || !iframe.contentWindow) {
        console.error('❌ iframe not found');
        return;
    }
    
    // First, tell the React app to fetch fresh content from WordPress
    iframe.contentWindow.postMessage({
        type: 'violet-force-wordpress-sync',
        timestamp: new Date().getTime()
    }, '*');
    
    // Wait a moment, then reload the iframe
    setTimeout(function() {
        console.log('🔄 Reloading iframe...');
        iframe.src = iframe.src;
    }, 1000);
}

// Add this to the save success handler in your WordPress functions.php
// After line that shows "✅ Content saved!", add:
// forceReactContentRefresh();
