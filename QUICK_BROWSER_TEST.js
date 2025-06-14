// Quick test in browser console
(function() {
    console.log('🧪 Quick AJAX Test Starting...');
    
    const formData = new FormData();
    formData.append('action', 'violet_save_all_changes');
    formData.append('changes', JSON.stringify([{
        field_name: 'test_field',
        field_value: 'test_value',
        format: 'rich'
    }]));
    
    fetch('https://wp.violetrainwater.com/wp-admin/admin-ajax.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
    })
    .then(response => response.text())
    .then(text => {
        console.log('🎯 Test Response:', text);
        try {
            const json = JSON.parse(text);
            if (json['wp-auth-check']) {
                console.error('❌ Still getting heartbeat response');
                console.log('🔍 Check WordPress error logs for debug output');
            } else if (json.success) {
                console.log('✅ SUCCESS! AJAX handler working!');
            } else {
                console.log('⚠️ Other response:', json);
            }
        } catch (e) {
            console.error('Parse error:', e);
        }
    })
    .catch(error => console.error('Request error:', error));
})();
