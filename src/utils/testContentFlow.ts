/**
 * Test script to verify content flow from WordPress to React
 * Run this in the browser console to debug content issues
 */

export const testContentFlow = async () => {
  console.group('🧪 Testing Content Flow');
  
  // 1. Check current localStorage
  console.log('1️⃣ Current localStorage content:');
  const localContent = localStorage.getItem('violet-content');
  console.log(localContent ? JSON.parse(localContent) : 'No content in localStorage');
  
  // 2. Fetch from WordPress
  console.log('\n2️⃣ Fetching from WordPress API...');
  try {
    const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content');
    const wpContent = await response.json();
    console.log('WordPress content:', wpContent);
    
    // 3. Compare values
    console.log('\n3️⃣ Comparing values:');
    const fields = ['hero_title', 'hero_subtitle', 'hero_cta'];
    fields.forEach(field => {
      const localValue = localContent ? JSON.parse(localContent).content?.[field] : undefined;
      const wpValue = wpContent[field];
      console.log(`${field}:`);
      console.log(`  - WordPress: "${wpValue}"`);
      console.log(`  - LocalStorage: "${localValue}"`);
      console.log(`  - Match: ${wpValue === localValue ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.error('Failed to fetch from WordPress:', error);
  }
  
  // 4. Check React components
  console.log('\n4️⃣ Checking React component values:');
  const heroTitle = document.querySelector('[data-violet-field="hero_title"]');
  const heroSubtitle = document.querySelector('[data-violet-field="hero_subtitle"]');
  const heroCta = document.querySelector('[data-violet-field="hero_cta"]');
  
  console.log('DOM values:');
  console.log(`  - hero_title: "${heroTitle?.textContent}"`);
  console.log(`  - hero_subtitle: "${heroSubtitle?.textContent}"`);
  console.log(`  - hero_cta: "${heroCta?.textContent}"`);
  
  console.groupEnd();
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testContentFlow = testContentFlow;
}
