// Quick script to update hero text via WordPress REST API
const updateHeroText = async () => {
  const changes = [
    {
      field_name: 'hero_title',
      field_value: 'Change the Channel.',
      format: 'plain',
      editor: 'plain'
    },
    {
      field_name: 'hero_subtitle_line2', 
      field_value: 'Change Your Life.',
      format: 'plain',
      editor: 'plain'
    }
  ];

  try {
    const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/save-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        changes: changes,
        trigger_rebuild: true 
      })
    });

    const result = await response.json();
    console.log('Update result:', result);
    
    if (result.success) {
      console.log('✅ Hero text updated successfully!');
      console.log('Changes will be live after rebuild completes.');
    } else {
      console.error('❌ Update failed:', result.message);
    }
  } catch (error) {
    console.error('Error updating hero text:', error);
  }
};

// Run the update
updateHeroText();