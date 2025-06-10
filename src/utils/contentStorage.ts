// Content storage utility for persisting edits
const STORAGE_KEY = 'violet-content';
const STORAGE_VERSION = 'v1';

export interface VioletContent {
  [fieldName: string]: string;
}

export interface StorageData {
  version: string;
  timestamp: number;
  content: VioletContent;
}

// Save content to localStorage
export const saveContent = (content: VioletContent, merge: boolean = true): boolean => {
  try {
    let finalContent = content;
    
    // If merge is true, merge with existing content
    if (merge) {
      const existing = getAllContentSync();
      finalContent = { ...existing, ...content };
    }
    
    const data: StorageData = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      content: finalContent
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('💾 Content saved to localStorage:', data);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('violet-content-updated', { detail: finalContent }));
    
    return true;
  } catch (error) {
    console.error('❌ Failed to save content:', error);
    return false;
  }
};

// Load content from localStorage synchronously
export const getAllContentSync = (): VioletContent => {
  try {
    // First, try to load from our structured format
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StorageData = JSON.parse(stored);
        console.log('📦 Loaded structured content from localStorage:', data);
        
        // Check if it's our structured format
        if (data.version && data.content) {
          return data.content;
        }
      } catch (e) {
        // Not JSON or not our format, continue to legacy check
      }
    }
    
    // Check for legacy flat storage format
    console.log('📦 Checking for legacy flat storage format...');
    const legacyContent: VioletContent = {};
    let hasLegacyContent = false;
    
    // List of known content fields
    const contentFields = [
      'hero_title', 'hero_subtitle', 'hero_cta', 'hero_subtitle_line2',
      'contact_email', 'contact_phone', 'footer_text',
      'auto_rebuild', 'content_initialized', 'keynote_setup_complete'
    ];
    
    // Check each field in localStorage
    contentFields.forEach(field => {
      const value = localStorage.getItem(field);
      if (value !== null && value !== undefined) {
        legacyContent[field] = value;
        hasLegacyContent = true;
      }
    });
    
    if (hasLegacyContent) {
      console.log('📦 Found legacy content:', legacyContent);
      // Migrate to new format
      saveContent(legacyContent, false);
      return legacyContent;
    }
    
    console.log('📭 No stored content found, returning defaults');
    return getDefaultContent();
  } catch (error) {
    console.error('❌ Failed to load content:', error);
    return getDefaultContent();
  }
};

// Alias for getAllContentSync for backward compatibility
export const getAllContent = getAllContentSync;

// Check if content exists in localStorage
export const hasContent = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null && stored !== undefined && stored !== '';
  } catch (error) {
    return false;
  }
};

// Get default content - should only be used as last resort
const getDefaultContent = (): VioletContent => {
  console.log('⚠️ Using hardcoded defaults - no saved content found');
  return {
    // Return empty strings so the component's defaultValue props are used
    // This ensures WordPress content takes priority when available
  };
};

// Initialize content from WordPress first, then fall back to localStorage
export const initializeContent = async (): Promise<VioletContent> => {
  try {
    console.log('🔄 Initializing content from WordPress...');
    
    // Try to fetch from WordPress API first
    const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content');
    
    if (response.ok) {
      const wpContent = await response.json();
      console.log('✅ WordPress content loaded:', wpContent);
      
      if (wpContent && Object.keys(wpContent).length > 0) {
        // Save to localStorage for offline access
        saveContent(wpContent, false); // false = replace completely
        return wpContent;
      }
    }
  } catch (error) {
    console.log('ℹ️ Could not fetch WordPress content (this is normal in development):', error);
  }
  
  // Fall back to localStorage if WordPress is unavailable
  console.log('📦 Falling back to localStorage content');
  return getAllContentSync();
};

// Clear stored content
export const clearContent = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Cleared stored content');
  } catch (error) {
    console.error('❌ Failed to clear content:', error);
  }
};

// Get specific field value
export const getContentField = (fieldName: string, defaultValue: string = ''): string => {
  const content = getAllContentSync();
  return content[fieldName] || defaultValue;
};

// Update specific field
export const updateContentField = (fieldName: string, value: string): boolean => {
  const content = getAllContentSync();
  content[fieldName] = value;
  return saveContent(content);
};

// Export the storage object for backward compatibility
export const contentStorage = {
  save: (content: VioletContent) => saveContent(content, true),
  load: getAllContentSync,
  clear: clearContent,
  getField: getContentField,
  updateField: updateContentField
};

// Alias for backward compatibility
export const getContent = getAllContentSync;
