// Direct localStorage persistence for WordPress saves
import { VioletContent } from './contentStorage';

// Simple save function that WordPress can call directly
export const saveWordPressContent = (changes: any[]) => {
  console.log('💾 saveWordPressContent called with:', changes);
  
  try {
    // Get existing content
    const existingRaw = localStorage.getItem('violet-content');
    let existing: any = {};
    
    if (existingRaw) {
      try {
        const parsed = JSON.parse(existingRaw);
        existing = parsed.content || parsed;
      } catch (e) {
        console.error('Failed to parse existing content:', e);
      }
    }
    
    // Apply changes
    const newContent: VioletContent = { ...existing };
    
    if (Array.isArray(changes)) {
      changes.forEach(change => {
        if (change.field_name && change.field_value !== undefined) {
          newContent[change.field_name] = change.field_value;
          console.log(`✅ Set ${change.field_name} = "${change.field_value}"`);
        }
      });
    } else if (typeof changes === 'object') {
      Object.entries(changes).forEach(([key, value]) => {
        newContent[key] = value as string;
        console.log(`✅ Set ${key} = "${value}"`);
      });
    }
    
    // Save to localStorage
    const toSave = {
      version: 'v1',
      timestamp: Date.now(),
      content: newContent
    };
    
    localStorage.setItem('violet-content', JSON.stringify(toSave));
    console.log('💾 Saved to localStorage:', toSave);
    
    return true;
  } catch (error) {
    console.error('❌ Error saving content:', error);
    return false;
  }
};

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).saveWordPressContent = saveWordPressContent;
  console.log('✅ window.saveWordPressContent is available');
}

// Also listen for postMessage
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    console.log('📨 Direct save listener received:', event.data?.type);
    
    if (event.data?.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
      console.log('💾 Processing violet-apply-saved-changes directly');
      saveWordPressContent(event.data.savedChanges);
    }
  });
  
  console.log('✅ Direct save message listener installed');
}
