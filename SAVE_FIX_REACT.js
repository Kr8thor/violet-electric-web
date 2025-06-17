// GUARANTEED SAVE FIX - React Side
// Add this to your WordPressCommunication.ts file

export const sendSaveRequest = (changes: any[]) => {
  // Normalize all changes to use 'content' field
  const normalizedChanges = changes.map(change => ({
    field_name: change.field_name || change.field,
    content: change.content || change.field_value || change.value,
    format: change.format || 'rich',
    editor: change.editor || 'react'
  }));

  // Send to WordPress via REST API
  return fetch('/wp-json/violet/v1/rich-content/save-batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': window.violetNonce || ''
    },
    body: JSON.stringify({
      changes: normalizedChanges
    })
  });
};

// GUARANTEED SAVE FIX - WordPress Admin Side JavaScript
// Add this to your WordPress admin JavaScript (in functions.php)

// --- CAREFUL FIX: Save logic for WordPress admin/editor ---
function violetSaveAllChangesFixed() {
  var changes = Object.values(violetPendingChanges).map(function(change) {
    return {
      field_name: change.field_name,
      content: change.content || change.field_value || '', // Prefer 'content', fallback to 'field_value' for legacy only
      format: change.format || 'rich',
      editor: change.editor || 'admin'
    };
  });

  if (changes.length === 0) {
    alert('No changes to save');
    return;
  }

  // Use the correct AJAX fallback handler
  const formData = new FormData();
  formData.append('action', 'violet_batch_save_fallback');
  formData.append('changes', JSON.stringify(changes));
  formData.append('nonce', window.violetAjax ? window.violetAjax.nonce : '');

  fetch(ajaxurl, {
    method: 'POST',
    credentials: 'include',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    console.log('Save response:', data);
    if (data.success) {
      alert('✅ Changes saved successfully!');
      violetPendingChanges = {};
      violetUpdateSaveButton();
    } else {
      alert('❌ Save failed: ' + (data.message || 'Unknown error'));
    }
  })
  .catch(err => {
    console.error('Save error:', err);
    alert('❌ Save error: ' + err.message);
  });
}
