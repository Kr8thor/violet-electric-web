/**
 * Enhanced WordPress Content Sync with Fallback
 * Handles both API and fallback content loading
 */

import { saveContent, getAllContentSync } from './contentStorage';

// Primary and fallback API URLs
const API_URLS = {
  direct: 'https://wp.violetrainwater.com/wp-json/violet/v1/content',
  proxy: '/wp-json/violet/v1/content',
  fallback: 'https://lustrous-dolphin-447351.netlify.app/wp-json/violet/v1/content'
};

// Default content structure
const DEFAULT_CONTENT = {
  hero_title: 'Change the Channel.',
  hero_subtitle: 'Transform your potential with neuroscience-backed strategies and heart-centered leadership.',
  hero_subtitle_line2: 'Change Your Life.',
  hero_cta: 'Book a Consultation',
  about_title: 'About Violet',
  about_description: 'Violet Rainwater is a transformative leader and speaker.',
  contact_email: 'hello@violetrainwater.com',
  contact_phone: '(555) 123-4567'
};

/**
 * Try multiple API endpoints to fetch content
 */
async function tryFetchContent(url: string): Promise<any | null> {
  try {
    console.log(`🔍 Trying to fetch from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      credentials: 'omit',
      mode: 'cors'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Successfully fetched from ${url}:`, data);
      return data;
    } else {
      console.warn(`⚠️ ${url} returned status: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.warn(`⚠️ Failed to fetch from ${url}:`, error);
    return null;
  }
}

/**
 * Enhanced sync function with multiple fallbacks
 */
export async function enhancedSyncWordPressContent(): Promise<boolean> {
  console.log('🔄 Starting enhanced content sync...');
  
  // Check if we're in WordPress iframe
  const isInWordPressIframe = window.location.search.includes('edit_mode=1') && 
                              window.location.search.includes('wp_admin=1');
  
  // Determine which URLs to try based on context
  const urlsToTry = isInWordPressIframe 
    ? [API_URLS.proxy, API_URLS.fallback, API_URLS.direct]
    : [API_URLS.direct, API_URLS.fallback, API_URLS.proxy];
  
  // Try each URL until one succeeds
  for (const url of urlsToTry) {
    const content = await tryFetchContent(url);
    if (content && Object.keys(content).length > 0) {
      // Save to localStorage
      saveContent(content, false); // Replace completely
      
      // Update timestamp
      localStorage.setItem('violet-last-sync-timestamp', Date.now().toString());
      
      // Dispatch success event
      window.dispatchEvent(new CustomEvent('violet-content-synced', { 
        detail: { content, source: url } 
      }));
      
      console.log('💾 Content synced successfully from:', url);
      return true;
    }
  }
  
  // If all API attempts fail, check for existing content or use defaults
  console.warn('⚠️ All API endpoints failed, checking local storage...');
  const existingContent = getAllContentSync();
  
  if (Object.keys(existingContent).length === 0) {
    console.log('📦 No existing content, using defaults...');
    saveContent(DEFAULT_CONTENT, false);
    
    window.dispatchEvent(new CustomEvent('violet-content-synced', { 
      detail: { content: DEFAULT_CONTENT, source: 'defaults' } 
    }));
  }
  
  return false;
}

/**
 * Initialize content on page load
 */
export function initializeContentWithFallback(): void {
  console.log('🚀 Initializing content with fallback support...');
  
  // Check if we have any content
  const existingContent = getAllContentSync();
  
  if (Object.keys(existingContent).length === 0) {
    console.log('📦 No content found, loading defaults immediately...');
    saveContent(DEFAULT_CONTENT, false);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('violet-content-initialized', { 
      detail: { content: DEFAULT_CONTENT, source: 'defaults' } 
    }));
  }
  
  // Try to sync with WordPress in background
  enhancedSyncWordPressContent().then(success => {
    if (success) {
      console.log('✅ WordPress content loaded successfully');
    } else {
      console.log('ℹ️ Using cached or default content');
    }
  });
}

// Export default content for reference
export { DEFAULT_CONTENT };
