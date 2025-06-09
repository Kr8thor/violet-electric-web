// 🚀 QUICK FIX: Migrate flat content to structured format
// Run this in the React app console to fix the content issue

(() => {
  console.log('🔧 Running content migration fix...\n');
  
  // Check current state
  const violetContent = localStorage.getItem('violet-content');
  const heroTitle = localStorage.getItem('hero_title');
  
  if (violetContent) {
    console.log('✅ Already has structured content, checking if valid...');
    try {
      const parsed = JSON.parse(violetContent);
      console.log('Content structure:', parsed);
      if (parsed.version && parsed.content) {
        console.log('✅ Content is properly structured!');
        console.log('Hero title in storage:', parsed.content.hero_title);
      }
    } catch (e) {
      console.log('❌ Content is corrupted, will fix...');
    }
  }
  
  if (heroTitle && !violetContent) {
    console.log('🔄 Migrating flat content to structured format...');
    
    // Gather all content fields
    const content = {};
    const contentFields = [
      'hero_title', 'hero_subtitle', 'hero_cta', 'hero_subtitle_line2',
      'contact_email', 'contact_phone', 'footer_text',
      'about_title', 'about_subtitle', 'about_content'
    ];
    
    contentFields.forEach(field => {
      const value = localStorage.getItem(field);
      if (value !== null) {
        content[field] = value;
        console.log(`  ✅ Found ${field}: "${value.substring(0, 30)}..."`);
      }
    });
    
    // Create structured format
    const structuredData = {
      version: 'v1',
      timestamp: Date.now(),
      content: content
    };
    
    // Save in new format
    localStorage.setItem('violet-content', JSON.stringify(structuredData));
    console.log('\n✅ Migration complete! Structured data saved:', structuredData);
    console.log('\n🔄 Please refresh the page to see the changes.');
    
    // Dispatch event to trigger React update
    window.dispatchEvent(new CustomEvent('violet-content-updated', { 
      detail: content 
    }));
    
  } else if (!heroTitle && !violetContent) {
    console.log('❌ No content found in localStorage');
    console.log('💡 Try saving content from WordPress admin first');
  }
  
  // Test manual content update
  console.log('\n🧪 Testing manual content update...');
  window.testContentUpdate = (field, value) => {
    const stored = localStorage.getItem('violet-content');
    let data = stored ? JSON.parse(stored) : { version: 'v1', timestamp: Date.now(), content: {} };
    data.content[field] = value;
    data.timestamp = Date.now();
    localStorage.setItem('violet-content', JSON.stringify(data));
    console.log('✅ Updated', field, 'to:', value);
    window.location.reload();
  };
  
  console.log('\n💡 You can now use: window.testContentUpdate("hero_title", "New Title")');
})();
