// WordPress Content Fetcher - Robust content loading system
// This ensures WordPress content is always available to React components

interface WordPressContent {
  [key: string]: string;
}

class WordPressContentFetcher {
  private content: WordPressContent = {};
  private loading = false;
  private callbacks: Array<(content: WordPressContent) => void> = [];
  private lastFetchTime = 0;
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.loadInitialContent();
  }

  private async loadInitialContent() {
    // Try cache first
    this.loadFromCache();
    
    // Then fetch fresh content
    await this.fetchFromWordPress();
  }

  private loadFromCache() {
    try {
      const cached = localStorage.getItem('violet-wordpress-content');
      const timestamp = localStorage.getItem('violet-content-timestamp');
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < this.cacheDuration) {
          this.content = JSON.parse(cached);
          console.log('⚡ Loaded from cache:', Object.keys(this.content).length, 'fields');
          this.notifyCallbacks();
          return true;
        }
      }
    } catch (error) {
      console.warn('Cache loading failed:', error);
    }
    return false;
  }

  private async fetchFromWordPress() {
    if (this.loading) return;
    
    this.loading = true;
    console.log('🔄 Fetching WordPress content...');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const apiKey = import.meta.env.VITE_VIOLET_API_KEY;

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      // Add API key if available
      if (apiKey) {
        headers['X-Violet-API-Key'] = apiKey;
      }

      const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content', {
        method: 'GET',
        headers,
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const freshContent = await response.json();
      
      // Update content
      this.content = { ...this.content, ...freshContent };
      this.lastFetchTime = Date.now();
      
      // Cache the content
      localStorage.setItem('violet-wordpress-content', JSON.stringify(this.content));
      localStorage.setItem('violet-content-timestamp', this.lastFetchTime.toString());
      
      console.log('✅ WordPress content updated:', Object.keys(freshContent).length, 'fields');
      this.notifyCallbacks();
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⏰ WordPress fetch timeout - using cached content');
      } else {
        console.error('❌ WordPress fetch failed:', error);
      }
      
      // If we have no content, load default fallbacks
      if (Object.keys(this.content).length === 0) {
        this.loadFallbackContent();
      }
    } finally {
      this.loading = false;
    }
  }

  private loadFallbackContent() {
    // Define fallback content that matches the field names used in components
    const fallbacks: WordPressContent = {
      'hero_title': 'Change The Channel!',
      'hero_subtitle_line2': 'Change Your Life!',
      'hero_subtitle': 'Transform your potential with neuroscience-backed strategies and heart-centered leadership.',
      'hero_cta': 'Book Violet',
      'hero_cta_secondary': 'Watch Violet in Action',
      'intro_title': 'Where Science Meets Transformation',
      'intro_description': 'Violet combines cutting-edge neuroscience with authentic leadership to help individuals and organizations unlock their extraordinary capabilities.',
      // Add more fallbacks as needed
    };
    
    this.content = { ...fallbacks, ...this.content };
    console.log('📦 Loaded fallback content:', Object.keys(fallbacks).length, 'fields');
    this.notifyCallbacks();
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => {
      try {
        callback(this.content);
      } catch (error) {
        console.error('Callback error:', error);
      }
    });
  }

  public getContent(field: string, defaultValue: string = ''): string {
    return this.content[field] || defaultValue;
  }

  public getAllContent(): WordPressContent {
    return { ...this.content };
  }

  public onContentLoaded(callback: (content: WordPressContent) => void) {
    this.callbacks.push(callback);
    // If content is already loaded, call immediately
    if (Object.keys(this.content).length > 0) {
      callback(this.content);
    }
  }

  public refreshContent() {
    this.fetchFromWordPress();
  }

  public updateContent(field: string, value: string) {
    this.content[field] = value;
    // Update cache
    localStorage.setItem('violet-wordpress-content', JSON.stringify(this.content));
    localStorage.setItem('violet-content-timestamp', Date.now().toString());
    this.notifyCallbacks();
  }
}

// Create singleton instance
export const wordpressContentFetcher = new WordPressContentFetcher();

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).violetContentFetcher = wordpressContentFetcher;
  (window as any).violetGetContent = (field: string, defaultValue: string = '') => 
    wordpressContentFetcher.getContent(field, defaultValue);
  (window as any).violetRefreshContent = () => wordpressContentFetcher.refreshContent();
}