import React from 'react';

/**
 * 🎯 CRITICAL CONTENT PERSISTENCE FIX
 * This file contains the complete solution for fixing content persistence
 * and establishing universal editing capabilities
 */

export interface ContentField {
  id: string;
  value: string;
  type: 'text' | 'image' | 'link' | 'color' | 'button' | 'layout';
  element?: HTMLElement;
}

export interface WordPressContent {
  [key: string]: string;
}

/**
 * Content Persistence Manager - Handles WordPress ↔ React content sync
 */
export class ContentPersistenceManager {
  private static instance: ContentPersistenceManager;
  private content: WordPressContent = {};
  private pendingChanges: Map<string, string> = new Map();
  private apiBase: string = '';
  private listeners: Map<string, Set<(value: string) => void>> = new Map();

  constructor() {
    this.initializeAPIBase();
    this.setupMessageHandlers();
    this.loadContentFromWordPress();
  }

  static getInstance(): ContentPersistenceManager {
    if (!ContentPersistenceManager.instance) {
      ContentPersistenceManager.instance = new ContentPersistenceManager();
    }
    return ContentPersistenceManager.instance;
  }

  /**
   * Initialize API base URL detection
   */
  private initializeAPIBase(): void {
    // Try to detect WordPress URL from current location
    const currentUrl = window.location.href;
    
    if (currentUrl.includes('lustrous-dolphin-447351.netlify.app')) {
      // On Netlify - use proxy
      this.apiBase = '';
    } else if (currentUrl.includes('wp.violetrainwater.com')) {
      // On WordPress directly
      this.apiBase = '';
    } else {
      // Fallback to WordPress direct
      this.apiBase = 'https://wp.violetrainwater.com';
    }

    console.log('🌐 Content API Base:', this.apiBase || 'current domain');
  }

  /**
   * Set up message handlers for WordPress communication
   */
  private setupMessageHandlers(): void {
    window.addEventListener('message', (event) => {
      if (event.data?.type?.startsWith('violet-')) {
        this.handleWordPressMessage(event.data, event);
      }
    });

    // Handle save events
    window.addEventListener('violet-apply-changes', (event: any) => {
      if (event.detail?.savedChanges) {
        this.applyChangesFromWordPress(event.detail.savedChanges);
      }
    });
  }

  /**
   * Load content from WordPress API
   */
  async loadContentFromWordPress(): Promise<WordPressContent> {
    try {
      console.log('🔄 Loading content from WordPress API...');
      
      const response = await fetch(`${this.apiBase}/wp-json/violet/v1/content`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const freshContent = await response.json();
      console.log('✅ WordPress content loaded:', freshContent);

      // Update content and notify listeners
      this.content = freshContent;
      this.notifyContentChange();

      // Cache for offline use
      localStorage.setItem('violetContentCache', JSON.stringify(freshContent));
      localStorage.setItem('violetContentCacheTime', Date.now().toString());

      return freshContent;

    } catch (error) {
      console.error('❌ WordPress API failed:', error);
      
      // Try to load from cache
      const cached = this.loadFromCache();
      if (cached) {
        console.log('💾 Using cached content');
        this.content = cached;
        this.notifyContentChange();
        return cached;
      }

      throw error;
    }
  }

  /**
   * Load content from cache
   */
  private loadFromCache(): WordPressContent | null {
    try {
      const cached = localStorage.getItem('violetContentCache');
      const cacheTime = localStorage.getItem('violetContentCacheTime');
      
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        // Use cache if less than 1 hour old
        if (age < 3600000) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.warn('❌ Cache read failed:', error);
    }
    return null;
  }

  /**
   * Get content field value
   */
  getField(fieldId: string, defaultValue: string = ''): string {
    const value = this.content[fieldId];
    return value !== undefined && value !== null ? value : defaultValue;
  }

  /**
   * Update content field (in memory)
   */
  updateField(fieldId: string, value: string): void {
    this.content[fieldId] = value;
    this.pendingChanges.set(fieldId, value);
    this.notifyFieldChange(fieldId, value);
    
    console.log(`📝 Field updated: ${fieldId} = "${value}"`);
  }

  /**
   * Save all pending changes to WordPress
   */
  async saveToWordPress(): Promise<boolean> {
    if (this.pendingChanges.size === 0) {
      console.log('💾 No pending changes to save');
      return true;
    }

    try {
      console.log('💾 Saving to WordPress...', Object.fromEntries(this.pendingChanges));

      const response = await fetch(`${this.apiBase}/wp-json/violet/v1/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(this.pendingChanges))
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Content saved to WordPress:', result);

      // Clear pending changes
      this.pendingChanges.clear();

      // Update cache
      localStorage.setItem('violetContentCache', JSON.stringify(this.content));
      localStorage.setItem('violetContentCacheTime', Date.now().toString());

      return true;

    } catch (error) {
      console.error('❌ Save to WordPress failed:', error);
      return false;
    }
  }

  /**
   * Apply changes from WordPress (after save)
   */
  private applyChangesFromWordPress(changes: any[]): void {
    console.log('📥 Applying changes from WordPress:', changes);
    
    changes.forEach(change => {
      if (change.field_name && change.field_value !== undefined) {
        this.content[change.field_name] = change.field_value;
        this.notifyFieldChange(change.field_name, change.field_value);
      }
    });

    // Update cache
    localStorage.setItem('violetContentCache', JSON.stringify(this.content));
    
    // Notify all listeners of global content change
    this.notifyContentChange();
  }

  /**
   * Handle WordPress messages
   */
  private handleWordPressMessage(data: any, event: MessageEvent): void {
    switch (data.type) {
      case 'violet-content-saved':
        console.log('💾 WordPress reports content saved');
        this.loadContentFromWordPress();
        break;
        
      case 'violet-refresh-content':
        console.log('🔄 WordPress requesting content refresh');
        this.loadContentFromWordPress();
        break;
    }
  }

  /**
   * Subscribe to field changes
   */
  subscribeToField(fieldId: string, callback: (value: string) => void): () => void {
    if (!this.listeners.has(fieldId)) {
      this.listeners.set(fieldId, new Set());
    }
    
    this.listeners.get(fieldId)!.add(callback);

    // Immediately call with current value
    callback(this.getField(fieldId));

    // Return unsubscribe function
    return () => {
      this.listeners.get(fieldId)?.delete(callback);
    };
  }

  /**
   * Notify field change to listeners
   */
  private notifyFieldChange(fieldId: string, value: string): void {
    const fieldListeners = this.listeners.get(fieldId);
    if (fieldListeners) {
      fieldListeners.forEach(callback => callback(value));
    }
  }

  /**
   * Notify all listeners of content change
   */
  private notifyContentChange(): void {
    this.listeners.forEach((callbacks, fieldId) => {
      const value = this.getField(fieldId);
      callbacks.forEach(callback => callback(value));
    });
  }

  /**
   * Get all content
   */
  getAllContent(): WordPressContent {
    return { ...this.content };
  }

  /**
   * Get pending changes
   */
  getPendingChanges(): Map<string, string> {
    return new Map(this.pendingChanges);
  }
}

/**
 * Global instance
 */
export const contentManager = ContentPersistenceManager.getInstance();

/**
 * React hook for WordPress content
 */
export function useWordPressField(fieldId: string, defaultValue: string = '') {
  const [value, setValue] = React.useState(defaultValue);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = contentManager.subscribeToField(fieldId, (newValue) => {
      setValue(newValue || defaultValue);
      setLoading(false);
    });

    return unsubscribe;
  }, [fieldId, defaultValue]);

  const updateValue = (newValue: string) => {
    contentManager.updateField(fieldId, newValue);
  };

  return {
    value,
    updateValue,
    loading,
    save: () => contentManager.saveToWordPress()
  };
}

/**
 * Initialize content persistence system
 */
export function initializeContentPersistence(): void {
  console.log('🎯 Initializing Content Persistence System...');
  
  // Get the global instance (creates it if needed)
  const manager = ContentPersistenceManager.getInstance();
  
  // Make it globally available for debugging
  (window as any).violetContentManager = manager;
  
  console.log('✅ Content Persistence System ready');
}
