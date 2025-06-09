// 🔍 React Content Diagnostic Script
// Run this in the React app console (not WordPress admin)

(() => {
  console.log('🔍 Running React Content Diagnostics...\n');
  
  // 1. Check localStorage structure
  console.log('1️⃣ Checking localStorage structure:');
  const violetContent = localStorage.getItem('violet-content');
  if (violetContent) {
    try {
      const parsed = JSON.parse(violetContent);
      console.log('  ✅ Found violet-content (structured):', parsed);
    } catch (e) {
      console.log('  ❌ violet-content exists but is not valid JSON:', violetContent);
    }
  } else {
    console.log('  ❌ No violet-content key found');
  }
  
  // 2. Check for flat content keys
  console.log('\n2️⃣ Checking for flat content keys:');
  const contentKeys = ['hero_title', 'hero_subtitle', 'hero_cta', 'contact_email', 'contact_phone'];
  const flatContent = {};
  let hasFlat = false;
  
  contentKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      flatContent[key] = value;
      hasFlat = true;
      console.log(`  ✅ Found ${key}: "${value.substring(0, 50)}..."`);
    }
  });
  
  if (!hasFlat) {
    console.log('  ❌ No flat content keys found');
  }
  
  // 3. Check for EditableText components
  console.log('\n3️⃣ Checking for EditableText components:');
  const editableFields = document.querySelectorAll('[data-violet-field]');
  console.log(`  Found ${editableFields.length} elements with data-violet-field`);
  
  if (editableFields.length > 0) {
    editableFields.forEach(el => {
      const field = el.getAttribute('data-violet-field');
      const text = el.textContent?.substring(0, 50);
      console.log(`  📝 ${field}: "${text}..."`);
    });
  }
  
  // 4. Check what's actually displayed
  console.log('\n4️⃣ Checking actual page content:');
  const h1 = document.querySelector('h1');
  if (h1) {
    console.log('  H1 text:', h1.textContent);
    const spans = h1.querySelectorAll('span');
    if (spans.length > 0) {
      console.log('  H1 has', spans.length, 'span elements');
      spans.forEach((span, i) => {
        console.log(`    Span ${i}: "${span.textContent}"`);
      });
    }
  }
  
  // 5. Test content storage fix
  console.log('\n5️⃣ Testing content storage migration:');
  
  // Temporarily import and test
  if (hasFlat && !violetContent) {
    console.log('  🔄 Migrating flat content to structured format...');
    const structuredData = {
      version: 'v1',
      timestamp: Date.now(),
      content: flatContent
    };
    localStorage.setItem('violet-content', JSON.stringify(structuredData));
    console.log('  ✅ Migration complete! Refresh the page to see changes.');
  } else if (violetContent) {
    console.log('  ℹ️ Already has structured content, no migration needed');
  } else {
    console.log('  ℹ️ No content to migrate');
  }
  
  // 6. Set up message listener
  console.log('\n6️⃣ Setting up message listener for WordPress saves:');
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'violet-apply-saved-changes') {
      console.log('💾 Received save from WordPress:', event.data.savedChanges);
    }
  });
  console.log('  ✅ Now listening for save messages from WordPress');
  
  console.log('\n✅ Diagnostics complete!');
  console.log('💡 Try refreshing the page if content was migrated.');
})();
