// QUICK TEST: Run this in WordPress Admin Console
// This will test if the save endpoint is working

console.log('🧪 Testing WordPress save functionality...');

// Test 1: Check if we can reach the API
fetch('/wp-json/violet/v1/content')
    .then(r => r.json())
    .then(data => {
        console.log('✅ Current content:', data);
        console.log('Current hero_title:', data.hero_title);
    })
    .catch(err => console.error('❌ API Error:', err));

// Test 2: Try to save content
async function testSave() {
    console.log('🔄 Attempting to save "Ramen is the one"...');
    
    try {
        const response = await fetch('/wp-json/violet/v1/content/save-batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.wpApiSettings?.nonce || ''
            },
            body: JSON.stringify({
                changes: [{
                    field_name: 'hero_title',
                    field_value: 'Ramen is the one - Test Save ' + new Date().toTimeString()
                }]
            })
        });
        
        const result = await response.json();
        console.log('📦 Save response:', result);
        
        if (result.success) {
            console.log('✅ Save successful! Verifying...');
            
            // Verify the save
            const verify = await fetch('/wp-json/violet/v1/content');
            const newData = await verify.json();
            console.log('✅ New hero_title:', newData.hero_title);
            
            if (newData.hero_title.includes('Ramen is the one')) {
                console.log('🎉 SUCCESS! Content saved and verified!');
            } else {
                console.log('❌ Content saved but not showing in API');
            }
        } else {
            console.log('❌ Save failed:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Save error:', error);
    }
}

// Run the test
setTimeout(testSave, 1000);

// Test 3: Check what's in the pending changes
if (typeof violetPendingChanges !== 'undefined') {
    console.log('📋 Pending changes:', violetPendingChanges);
} else {
    console.log('ℹ️ No pending changes found');
}
