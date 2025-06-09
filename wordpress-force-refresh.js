// WordPress Admin Console Quick Fix
// Run this in the WordPress admin console to force React to refresh

// 1. Send a refresh command to the React app
const iframe = document.getElementById('violet-site-iframe');
if (iframe && iframe.contentWindow) {
    console.log('🔄 Forcing React app to sync with WordPress...');
    
    // First, tell React to clear its cache
    iframe.contentWindow.postMessage({
        type: 'violet-clear-cache',
        timestamp: new Date().getTime()
    }, '*');
    
    // Then fetch and send the current WordPress content
    fetch('/wp-json/violet/v1/content')
        .then(r => r.json())
        .then(content => {
            console.log('📥 Sending WordPress content to React:', content);
            
            // Convert to saved changes format
            const savedChanges = Object.entries(content).map(([key, value]) => ({
                field_name: key,
                field_value: value
            }));
            
            // Send to React
            iframe.contentWindow.postMessage({
                type: 'violet-apply-saved-changes',
                savedChanges: savedChanges,
                timestamp: new Date().getTime(),
                forceRefresh: true
            }, '*');
            
            console.log('✅ Sent content update to React');
            
            // Refresh the iframe after a short delay
            setTimeout(() => {
                console.log('🔄 Refreshing React app...');
                const currentSrc = iframe.src;
                iframe.src = currentSrc;
            }, 1000);
        })
        .catch(err => {
            console.error('❌ Failed to fetch content:', err);
        });
} else {
    console.error('❌ Could not find React iframe');
}
