// ============================================================================
// 🔧 FIXED REACT FRONTEND AJAX CALL
// ============================================================================

// Enhanced save function with better debugging
async function handleSaveContent() {
    console.log('🚀 Starting enhanced save process...');
    
    const editableElements = document.querySelectorAll('[data-violet-editable]');
    const changes = Array.from(editableElements).map((el) => {
        const element = el as HTMLElement;
        return {
            field_name: element.dataset.violetFieldType || 'generic_content',
            field_value: element.innerHTML,
            format: 'rich',
            editor: 'rich',
        };
    });
    
    console.log('📝 Changes to save:', changes);
    
    // Create FormData with explicit action parameter first
    const formData = new FormData();
    
    // CRITICAL: Action must be first and exact
    formData.append('action', 'violet_save_all_changes');
    formData.append('changes', JSON.stringify(changes));
    
    // Add debugging parameters
    formData.append('debug', 'true');
    formData.append('timestamp', Date.now().toString());
    
    // Add nonce if available
    const wpNonce = (window as any).wpApiSettings?.nonce || 
                   (window as any).ajaxurl_nonce || 
                   document.querySelector('meta[name="wp-nonce"]')?.getAttribute('content') || '';
    
    if (wpNonce) {
        formData.append('_wpnonce', wpNonce);
        console.log('🔑 Using nonce:', wpNonce.substring(0, 10) + '...');
    }
    
    // Debug the FormData contents
    console.log('📤 FormData contents:');
    for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, typeof value === 'string' ? value.substring(0, 100) + '...' : value);
    }
    
    try {
        console.log('📡 Sending request to:', 'https://wp.violetrainwater.com/wp-admin/admin-ajax.php');
        
        const response = await fetch('https://wp.violetrainwater.com/wp-admin/admin-ajax.php', {
            method: 'POST',
            credentials: 'include',
            body: formData,
            headers: {
                // Don't set Content-Type for FormData
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response OK:', response.ok);
        
        const responseText = await response.text();
        console.log('📥 Raw response text:', responseText);
        
        try {
            const jsonResponse = JSON.parse(responseText);
            console.log('📊 Parsed JSON response:', jsonResponse);
            
            // Check for different response types
            if (jsonResponse['wp-auth-check']) {
                console.error('❌ Still getting WordPress heartbeat response!');
                console.error('🔍 This means the action parameter is not working');
                console.error('🔍 Expected: Custom AJAX handler response');
                console.error('🔍 Got: WordPress heartbeat/auth-check response');
            } else if (jsonResponse.success) {
                console.log('✅ SUCCESS! Custom AJAX handler worked!');
                console.log('✅ Response:', jsonResponse.data);
            } else {
                console.log('⚠️ Response received but not success:', jsonResponse);
            }
            
        } catch (parseError) {
            console.error('❌ Failed to parse JSON response:', parseError);
            console.error('Raw response was:', responseText);
        }
        
    } catch (fetchError) {
        console.error('🚨 Fetch request failed:', fetchError);
    }
}

// Alternative URL-encoded approach (backup)
async function handleSaveContentURLEncoded() {
    console.log('🔄 Trying URL-encoded approach...');
    
    const editableElements = document.querySelectorAll('[data-violet-editable]');
    const changes = Array.from(editableElements).map((el) => {
        const element = el as HTMLElement;
        return {
            field_name: element.dataset.violetFieldType || 'generic_content',
            field_value: element.innerHTML,
            format: 'rich',
            editor: 'rich',
        };
    });
    
    // Use URLSearchParams instead of FormData
    const params = new URLSearchParams();
    params.append('action', 'violet_save_all_changes');
    params.append('changes', JSON.stringify(changes));
    params.append('debug', 'true');
    
    const wpNonce = (window as any).wpApiSettings?.nonce || '';
    if (wpNonce) {
        params.append('_wpnonce', wpNonce);
    }
    
    console.log('📤 URL-encoded body:', params.toString());
    
    try {
        const response = await fetch('https://wp.violetrainwater.com/wp-admin/admin-ajax.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: params.toString()
        });
        
        const responseText = await response.text();
        console.log('📥 URL-encoded response:', responseText);
        
        try {
            const jsonResponse = JSON.parse(responseText);
            
            if (jsonResponse['wp-auth-check']) {
                console.error('❌ URL-encoded also getting heartbeat response');
            } else if (jsonResponse.success) {
                console.log('✅ URL-encoded approach worked!');
            }
            
        } catch (e) {
            console.error('URL-encoded parse error:', e);
        }
        
    } catch (e) {
        console.error('URL-encoded request error:', e);
    }
}

// Test both approaches
window.testSaveBothWays = function() {
    console.log('🧪 Testing both FormData and URL-encoded approaches...');
    handleSaveContent();
    setTimeout(() => handleSaveContentURLEncoded(), 2000);
};

console.log('🔧 Enhanced save functions loaded. Run testSaveBothWays() to test both approaches.');
