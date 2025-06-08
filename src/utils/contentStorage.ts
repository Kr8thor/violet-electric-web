/**
 * Content Storage Utility
 * Manages persisted content from WordPress editor
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

/**
 * Get content value for a specific field
 */
export function getContent(field: string, defaultValue: string): string {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const content = JSON.parse(saved) as VioletContent;
      return content[field] || defaultValue;
    }
  } catch (error) {
    console.error('Error loading saved content:', error);
  }
  
  return defaultValue;
}

/**
 * Get all saved content
 */
export function getAllContent(): VioletContent {
  if (typeof window === 'undefined') return {};
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as VioletContent;
    }
  } catch (error) {
    console.error('Error loading saved content:', error);
  }
  
  return {};
}

/**
 * Save content to localStorage
 */
export function saveContent(content: VioletContent): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getAllContent();
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
