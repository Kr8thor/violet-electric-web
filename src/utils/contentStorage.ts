/**
 * Content Storage Utility
 * Manages persisted content from WordPress editor with WordPress API integration
 */

export interface VioletContent {
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta?: string;
  hero_cta_secondary?: string;
  contact_email?: string;
  contact_phone?: string;
  [key: string]: string | undefined;
}

const STORAGE_KEY = 'violet-content';
const WORDPRESS_API_URL = 'https://wp.violetrainwater.com/wp-json/violet/v1/content';

/**
 * Fetch content from WordPress REST API
 */
async function fetchContentFromWordPress(): Promise<VioletContent> {
  try {
    const response = await fetch(WORDPRESS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Raw response from WordPress:', data);
    
    // CRITICAL FIX: Extract content from WordPress API response format
    let content: VioletContent;
    if (data.content && typeof data.content === 'object') {
      // WordPress returns: { content: { hero_title: "...", ... } }
      content = data.content;
    } else if (typeof data === 'object' && !data.content) {
      // Direct content format: { hero_title: "...", ... }
      content = data;
    } else {
      console.warn('⚠️ Unexpected WordPress API response format:', data);
      content = {};
    }
    
    console.log('✅ Processed content from WordPress:', content);
    
    // Save to localStorage as cache
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    }
    
    return content;
  } catch (error) {
    console.error('❌ Error fetching content from WordPress:', error);
    
    // Fallback to localStorage if WordPress is unavailable
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          console.log('📦 Using cached content from localStorage');
          return JSON.parse(saved) as VioletContent;
        }
      } catch (e) {
        console.error('Error loading cached content:', e);
      }
    }
    
    return {};
  }
}

/**
 * Get content value for a specific field (now fetches from WordPress)
 */
export async function getContent(field: string, defaultValue: string): Promise<string> {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    // First try to get from WordPress
    const content = await fetchContentFromWordPress();
    return content[field] || defaultValue;
  } catch (error) {
    console.error('Error loading content:', error);
    return defaultValue;
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
 * Get all saved content (fetches from WordPress)
 */
export async function getAllContent(): Promise<VioletContent> {
  if (typeof window === 'undefined') return {};
  
  try {
    return await fetchContentFromWordPress();
  } catch (error) {
    console.error('Error loading content:', error);
    return {};
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
 * Save content to localStorage (and sync to WordPress in editor mode)
 */
export function saveContent(content: VioletContent): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getAllContentSync();
    const merged = { ...existing, ...content };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    
    // Dispatch custom event for React components to update
    window.dispatchEvent(new CustomEvent('violet-content-updated', {
      detail: merged
    }));
  } catch (error) {
    console.error('Error saving content:', error);
  }
}

/**
 * Clear all saved content
 */
export function clearContent(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('violet-content-updated', {
      detail: {}
    }));
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
 * Initialize content loading from WordPress on app start
 */
export async function initializeContent(): Promise<VioletContent> {
  if (typeof window === 'undefined') return {};
  
  try {
    console.log('🔄 Initializing content from WordPress...');
    const content = await fetchContentFromWordPress();
    
    // Dispatch event so components can update
    window.dispatchEvent(new CustomEvent('violet-content-updated', {
      detail: content
    }));
    
    return content;
  } catch (error) {
    console.error('Error initializing content:', error);
    return {};
  }
}
