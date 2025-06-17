// Script to clean up hero text in WordPress database
// This will strip all HTML and just save the plain text

const cleanupHeroText = async () => {
  console.log('🧹 Cleaning up hero text...');
  
  const changes = [
    {
      field_name: 'hero_title',
      field_value: 'Change The Channel.',
      format: 'plain',
      editor: 'plain'
    },
    {
      field_name: 'hero_subtitle_line2',
      field_value: 'Change Your Life!',
      format: 'plain',
      editor: 'plain'
    }
  ];

  try {
    // First, try the REST API
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
    console.log('API Response:', result);
    
    if (result.success) {
      console.log('✅ Hero text cleaned up successfully!');
      console.log('🚀 Rebuild triggered - changes will be live in 2-4 minutes');
      
      // Also clear localStorage to ensure clean state
      if (typeof window !== 'undefined' && window.localStorage) {
        // Clear any cached content
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('violet-content') || key.includes('hero_'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('🧹 Cleared localStorage cache');
      }
    } else {
      console.error('❌ Update failed:', result.message);
    }
  } catch (error) {
    console.error('Error updating hero text:', error);
    console.log('💡 Try running this from the WordPress admin console instead');
  }
};

// Run the cleanup
cleanupHeroText();

// If the above doesn't work, you can also run this simplified version 
// directly in the browser console while on your site:
/*
localStorage.setItem('violet-content-hero_title', 'Change The Channel.');
localStorage.setItem('violet-content-hero_subtitle_line2', 'Change Your Life!');
location.reload();
*/