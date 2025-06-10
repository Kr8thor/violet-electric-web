/**
 * Complete Failsafe System - 3 Layer Protection
 * 
 * Layer 1: Primary LocalStorage with versioning
 * Layer 2: SessionStorage mirror for current session
 * Layer 3: IndexedDB for long-term persistence
 */

import { indexedDBFailsafe } from './indexedDBFailsafe';

interface ContentUpdate {
  field_name: string;
  field_value: string;
  timestamp?: number;
}

export class TripleFailsafeSystem {
  private static instance: TripleFailsafeSystem;
  private initialized = false;
  private contentCache: { [key: string]: string } = {};

  static getInstance(): TripleFailsafeSystem {
    if (!this.instance) {
      this.instance = new TripleFailsafeSystem();
    }
    return this.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🛡️ Initializing Triple Failsafe System...');

    // Initialize IndexedDB
    try {
      await indexedDBFailsafe.init();
    } catch (e) {
      console.warn('IndexedDB init failed, using fallbacks', e);
    }

    // Load initial content
    this.contentCache = await this.loadContentWithFailover();

    // Setup message listeners
    this.setupMessageListeners();

    // Setup periodic sync
    this.setupPeriodicSync();

    this.initialized = true;
    console.log('✅ Triple Failsafe System Ready');
  }

  /**
   * Save content to all 3 storage layers
   */
  async saveToAllLayers(updates: ContentUpdate[]): Promise<void> {
    console.log('💾 TRIPLE SAVE: Saving to all layers', updates);

    // Merge updates with existing content
    const newContent = { ...this.contentCache };
    updates.forEach(update => {
      newContent[update.field_name] = update.field_value;
    });

    // Update cache
    this.contentCache = newContent;

    // Layer 1: LocalStorage
    try {
      localStorage.setItem('violet-content-primary', JSON.stringify({
        data: newContent,
        timestamp: Date.now(),
        version: Date.now()
      }));
      localStorage.setItem('violet-content-backup', JSON.stringify(newContent));
      console.log('✅ Layer 1 (LocalStorage) saved');
    } catch (e) {
      console.error('LocalStorage save failed:', e);
    }

    // Layer 2: SessionStorage
    try {
      sessionStorage.setItem('violet-content-session', JSON.stringify({
        data: newContent,
        timestamp: Date.now()
      }));
      console.log('✅ Layer 2 (SessionStorage) saved');
    } catch (e) {
      console.error('SessionStorage save failed:', e);
    }

    // Layer 3: IndexedDB
    try {
      await indexedDBFailsafe.saveContent(newContent);
      console.log('✅ Layer 3 (IndexedDB) saved');
    } catch (e) {
      console.error('IndexedDB save failed:', e);
    }

    // Also save to window object as ultimate fallback
    (window as any).__violetContentFailsafe = newContent;

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('violet-content-saved', {
      detail: newContent
    }));
  }

  /**
   * Load content with automatic failover
   */
  async loadContentWithFailover(): Promise<{ [key: string]: string }> {
    console.log('📥 Loading content with failover...');

    // Try LocalStorage first
    try {
      const primary = localStorage.getItem('violet-content-primary');
      if (primary) {
        const parsed = JSON.parse(primary);
        console.log('✅ Loaded from LocalStorage');
        return parsed.data || parsed;
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }

    // Try SessionStorage
    try {
      const session = sessionStorage.getItem('violet-content-session');
      if (session) {
        const parsed = JSON.parse(session);
        console.log('✅ Loaded from SessionStorage');
        return parsed.data || parsed;
      }
    } catch (e) {
      console.warn('SessionStorage load failed:', e);
    }

    // Try IndexedDB
    try {
      const idbContent = await indexedDBFailsafe.loadContent();
      if (idbContent && Object.keys(idbContent).length > 0) {
        console.log('✅ Loaded from IndexedDB');
        return idbContent;
      }
    } catch (e) {
      console.warn('IndexedDB load failed:', e);
    }

    // Last resort - window object
    if ((window as any).__violetContentFailsafe) {
      console.log('✅ Loaded from window object');
      return (window as any).__violetContentFailsafe;
    }

    console.log('⚠️ No content found in any layer');
    return {};
  }

  /**
   * Get specific field value
   */
  getField(field: string, defaultValue: string = ''): string {
    return this.contentCache[field] || defaultValue;
  }

  /**
   * Setup message listeners for WordPress communication
   */
  private setupMessageListeners(): void {
    window.addEventListener('message', async (event) => {
      // Handle WordPress saves
      if (event.data.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
        console.log('📨 Received WordPress save');
        
        const updates: ContentUpdate[] = event.data.savedChanges.map((change: any) => ({
          field_name: change.field_name,
          field_value: change.field_value,
          timestamp: Date.now()
        }));

        await this.saveToAllLayers(updates);

        // Send confirmation back
        if (event.source) {
          (event.source as Window).postMessage({
            type: 'violet-save-confirmed',
            timestamp: Date.now()
          }, event.origin);
        }
      }

      // Handle content verification requests
      if (event.data.type === 'violet-verify-content') {
        const content = await this.loadContentWithFailover();
        if (event.source) {
          (event.source as Window).postMessage({
            type: 'violet-content-verification',
            content,
            timestamp: Date.now()
          }, event.origin);
        }
      }
    });
  }

  /**
   * Setup periodic sync to ensure consistency
   */
  private setupPeriodicSync(): void {
    // Sync every 10 seconds
    setInterval(async () => {
      const layers = {
        localStorage: null as any,
        sessionStorage: null as any,
        indexedDB: null as any
      };

      // Check all layers
      try {
        const ls = localStorage.getItem('violet-content-primary');
        if (ls) layers.localStorage = JSON.parse(ls).data || JSON.parse(ls);
      } catch (e) {}

      try {
        const ss = sessionStorage.getItem('violet-content-session');
        if (ss) layers.sessionStorage = JSON.parse(ss).data || JSON.parse(ss);
      } catch (e) {}

      try {
        layers.indexedDB = await indexedDBFailsafe.loadContent();
      } catch (e) {}

      // Find the most recent content
      let mostRecent = this.contentCache;
      let needsSync = false;

      Object.values(layers).forEach(layer => {
        if (layer && Object.keys(layer).length > Object.keys(mostRecent).length) {
          mostRecent = layer;
          needsSync = true;
        }
      });

      // Sync if needed
      if (needsSync && mostRecent !== this.contentCache) {
        console.log('🔄 Syncing content across layers');
        const updates = Object.entries(mostRecent).map(([field_name, field_value]) => ({
          field_name,
          field_value: field_value as string
        }));
        await this.saveToAllLayers(updates);
      }
    }, 10000);
  }

  /**
   * Force refresh with all content
   */
  forceRefresh(): void {
    console.log('🔄 Force refreshing with all content');
    window.location.reload();
  }

  /**
   * Clear all storage (for testing)
   */
  async clearAll(): Promise<void> {
    localStorage.removeItem('violet-content-primary');
    localStorage.removeItem('violet-content-backup');
    sessionStorage.removeItem('violet-content-session');
    await indexedDBFailsafe.clear();
    delete (window as any).__violetContentFailsafe;
    this.contentCache = {};
    console.log('🗑️ All storage cleared');
  }
}

// Export singleton
export const tripleFailsafe = TripleFailsafeSystem.getInstance();

// Auto-initialize
if (typeof window !== 'undefined') {
  tripleFailsafe.initialize().catch(console.error);
}
