/**
 * Enhanced Content Storage Utility
 * Manages persisted content from WordPress editor with proper save handling
 */

export interface VioletContent {
  hero_title?: string;
  hero_subtitle?: string;
  hero_subtitle_line2?: string;
  hero_cta?: string;
  hero_cta_secondary?: string;
  contact_email?: string;
  contact_phone?: string;
  nav_home?: string;
  nav_about?: string;
  nav_services?: string;
  footer_text?: string;
  seo_title?: string;
  seo_description?: string;
  [key: string]: string | undefined;
}

const STORAGE_KEY = 'violet-content';

// Try multiple WordPress API URLs for reliability
const WORDPRESS_API_URLS = [
  'https://lustrous-dolphin-447351.netlify.app/wp-json/violet/v1/content', // Via Netlify proxy
  'https://wp.violetrainwater.com/wp-json/violet/v1/content', // Direct WordPress
  'https://violetrainwater.com/wp-json/violet/v1/content', // Domain
];

/**
 * Fetch content from WordPress REST API with fallback URLs
 */
async function fetchContentFromWordPress(): Promise<VioletContent> {
  let lastError: Error | null = null;

  for (const apiUrl of WORDPRESS_API_URLS) {
    try {
      console.log(`🔄 Attempting to fetch content from: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Raw WordPress API response:', data);
      
      // Handle different response formats
      let content: VioletContent;
      if (data.content && typeof data.content === 'object') {
        // Format: { content: { hero_title: "...", ... } }
        content = data.content;
      } else if (typeof data === 'object' && !data.content) {
        // Format: { hero_title: "...", ... }
        content = data;
      } else {
        console.warn('⚠️ Unexpected WordPress API response format:', data);
        content = {};
      }
      
      console.log(`✅ Successfully fetched content from: ${apiUrl}`, content);
      
      // Cache the successful response
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
        localStorage.setItem('violet-content-source', apiUrl);
        localStorage.setItem('violet-content-timestamp', Date.now().toString());
      }
      
      return content;
      
    } catch (error) {
      console.warn(`❌ Failed to fetch from ${apiUrl}:`, error);
      lastError = error as Error;
      continue;
    }
  }
  
  console.error('❌ All WordPress API URLs failed. Last error:', lastError);
  
  // Fallback to localStorage if all APIs fail
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        console.log('📦 Using cached content from localStorage as fallback');
        return JSON.parse(saved) as VioletContent;
      }
    } catch (e) {
      console.error('Error loading cached content:', e);
    }
  }
  
  return {};
}

/**
 * Get content value for a specific field (async - fetches from WordPress)
 */
export async function getContent(field: string, defaultValue: string): Promise<string> {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const content = await fetchContentFromWordPress();
    return content[field] || defaultValue;
  } catch (error) {
    console.error('Error loading content:', error);
    return getContentSync(field, defaultValue);
  }
}

/**
 * Get content value synchronously (uses cached data)
 */
export function getContentSync(field: string, defaultValue: string): string {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const content = JSON.parse(saved) as VioletContent;
      return content[field] || defaultValue;
    }
  } catch (error) {
    console.error('Error loading cached content:', error);
  }
  
  return defaultValue;
}

/**
 * Get all saved content (async - fetches from WordPress)
 */
export async function getAllContent(): Promise<VioletContent> {
  if (typeof window === 'undefined') return {};
  
  try {
    return await fetchContentFromWordPress();
  } catch (error) {
    console.error('Error loading content:', error);
    return getAllContentSync();
  }
}

/**
 * Get all content synchronously (uses cached data)
 */
export function getAllContentSync(): VioletContent {
  if (typeof window === 'undefined') return {};
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as VioletContent;
    }
  } catch (error) {
    console.error('Error loading cached content:', error);
  }
  
  return {};
}

/**
 * Save content to localStorage and notify components
 */
export function saveContent(content: VioletContent): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getAllContentSync();
    const merged = { ...existing, ...content };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    localStorage.setItem('violet-content-timestamp', Date.now().toString());
    
    console.log('💾 Content saved to localStorage:', merged);
    
    // Dispatch custom event for React components to update
    window.dispatchEvent(new CustomEvent('violet-content-updated', {
      detail: merged
    }));
  } catch (error) {
    console.error('Error saving content:', error);
  }
}

/**
 * Force reload content from WordPress (bypasses cache)
 */
export async function reloadContentFromWordPress(): Promise<VioletContent> {
  if (typeof window === 'undefined') return {};
  
  try {
    console.log('🔄 Force reloading content from WordPress...');
    const content = await fetchContentFromWordPress();
    
    // Dispatch event so components update immediately
    window.dispatchEvent(new CustomEvent('violet-content-updated', {
      detail: content
    }));
    
    console.log('✅ Content reloaded and components notified');
    return content;
  } catch (error) {
    console.error('Error reloading content:', error);
    return getAllContentSync();
  }
}

/**
 * Clear all saved content
 */
export function clearContent(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('violet-content-source');
    localStorage.removeItem('violet-content-timestamp');
    
    window.dispatchEvent(new CustomEvent('violet-content-updated', {
      detail: {}
    }));
    
    console.log('🗑️ All content cleared');
  } catch (error) {
    console.error('Error clearing content:', error);
  }
}

/**
 * Check if content exists
 */
export function hasContent(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null && saved !== '{}';
  } catch (error) {
    return false;
  }
}

/**
 * Get content metadata
 */
export function getContentMetadata() {
  if (typeof window === 'undefined') return null;
  
  try {
    const source = localStorage.getItem('violet-content-source');
    const timestamp = localStorage.getItem('violet-content-timestamp');
    const content = getAllContentSync();
    
    return {
      source,
      timestamp: timestamp ? parseInt(timestamp) : null,
      lastUpdate: timestamp ? new Date(parseInt(timestamp)).toLocaleString() : null,
      fieldCount: Object.keys(content).length,
      hasContent: Object.keys(content).length > 0
    };
  } catch (error) {
    return null;
  }
}

/**
 * Initialize content loading from WordPress on app start
 */
export async function initializeContent(): Promise<VioletContent> {
  if (typeof window === 'undefined') return {};
  
  try {
    console.log('🚀 Initializing content system...');
    
    // Load cached content first for immediate display
    const cached = getAllContentSync();
    if (Object.keys(cached).length > 0) {
      console.log('📦 Using cached content for immediate display:', cached);
      window.dispatchEvent(new CustomEvent('violet-content-updated', {
        detail: cached
      }));
    }
    
    // Then fetch fresh content from WordPress
    const fresh = await fetchContentFromWordPress();
    
    // Only update if fresh content is different
    const freshKeys = Object.keys(fresh);
    const cachedKeys = Object.keys(cached);
    
    if (freshKeys.length !== cachedKeys.length || 
        freshKeys.some(key => fresh[key] !== cached[key])) {
      
      console.log('🔄 Fresh content differs from cache, updating...');
      window.dispatchEvent(new CustomEvent('violet-content-updated', {
        detail: fresh
      }));
    } else {
      console.log('✅ Fresh content matches cache, no update needed');
    }
    
    return fresh;
  } catch (error) {
    console.error('Error initializing content:', error);
    return getAllContentSync();
  }
}

/**
 * Handle save completion from WordPress
 */
export async function handleSaveCompletion(savedChanges: any[]): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('💾 Handling save completion from WordPress:', savedChanges);
    
    // Update localStorage with the saved changes immediately
    const updates: VioletContent = {};
    savedChanges.forEach(change => {
      if (change.field_name && change.field_value !== undefined) {
        updates[change.field_name] = change.field_value;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      saveContent(updates);
      console.log('✅ Save completion handled, localStorage updated');
    }
    
    // Also reload fresh content from WordPress to ensure sync
    setTimeout(async () => {
      try {
        await reloadContentFromWordPress();
        console.log('✅ Content reloaded from WordPress after save');
      } catch (error) {
        console.warn('Failed to reload content after save:', error);
      }
    }, 1000); // Small delay to ensure WordPress has processed the save
    
  } catch (error) {
    console.error('Error handling save completion:', error);
  }
}
