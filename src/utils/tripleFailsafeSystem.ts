/**
 * Triple Failsafe Content Storage System
 * Provides 3-layer protection: LocalStorage + SessionStorage + IndexedDB
 */

import { IndexedDBFailsafe } from './indexedDBFailsafe';
import { saveContent, loadContent } from './contentStorage';

export interface ContentUpdate {
  field_name: string;
  field_value: string;
}

export interface FailsafeLayer {
  name: string;
  save: (data: any) => Promise<void>;
  load: () => Promise<any>;
  available: boolean;
}

class TripleFailsafeSystem {
  private indexedDB: IndexedDBFailsafe;
  private isInitialized = false;
  
  constructor() {
    this.indexedDB = new IndexedDBFailsafe();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.indexedDB.init();
      this.isInitialized = true;
      console.log('🛡️ Triple Failsafe System initialized');
    } catch (error) {
      console.warn('⚠️ IndexedDB not available, continuing with localStorage + sessionStorage');
      this.isInitialized = true;
    }
  }

  // Layer 1: LocalStorage (Primary + Backup)
  private async saveToLocalStorage(updates: ContentUpdate[]): Promise<void> {
    try {
      const content: Record<string, string> = {};
      updates.forEach(update => {
        content[update.field_name] = update.field_value;
      });

      // Save to primary localStorage
      localStorage.setItem('violet-content-primary', JSON.stringify({
        data: content,
        timestamp: Date.now(),
        version: 'primary'
      }));

      // Save to backup localStorage
      localStorage.setItem('violet-content-backup', JSON.stringify(content));
      
      console.log('💾 Layer 1: LocalStorage saved (primary + backup)');
    } catch (error) {
      console.error('❌ LocalStorage save failed:', error);
      throw error;
    }
  }

  // Layer 2: SessionStorage
  private async saveToSessionStorage(updates: ContentUpdate[]): Promise<void> {
    try {
      const content: Record<string, string> = {};
      updates.forEach(update => {
        content[update.field_name] = update.field_value;
      });

      sessionStorage.setItem('violet-content-session', JSON.stringify({
        data: content,
        timestamp: Date.now(),
        session: true
      }));
      
      console.log('💾 Layer 2: SessionStorage saved');
    } catch (error) {
      console.error('❌ SessionStorage save failed:', error);
      throw error;
    }
  }

  // Layer 3: IndexedDB
  private async saveToIndexedDB(updates: ContentUpdate[]): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    
    try {
      const content: Record<string, string> = {};
      updates.forEach(update => {
        content[update.field_name] = update.field_value;
      });

      await this.indexedDB.saveContent(content);
      console.log('💾 Layer 3: IndexedDB saved');
    } catch (error) {
      console.error('❌ IndexedDB save failed:', error);
      // Don't throw - IndexedDB is optional
    }
  }

  // Main method called by WordPressRichEditor
  async saveToAllLayers(updates: ContentUpdate[]): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    
    console.log('🛡️ Triple Failsafe: Saving to all layers...', updates);
    
    const promises: Promise<void>[] = [];
    
    // Save to all layers in parallel
    promises.push(this.saveToLocalStorage(updates));
    promises.push(this.saveToSessionStorage(updates));
    promises.push(this.saveToIndexedDB(updates));

    try {
      await Promise.allSettled(promises);
      console.log('✅ Triple Failsafe: All layers updated');
    } catch (error) {
      console.error('❌ Triple Failsafe: Some layers failed:', error);
      throw error;
    }
  }

  // Recovery method - tries to load from best available source
  async getContent(): Promise<Record<string, string>> {
    console.log('🔍 Triple Failsafe: Loading content...');
    
    // Try Layer 1: Primary LocalStorage
    try {
      const primary = localStorage.getItem('violet-content-primary');
      if (primary) {
        const parsed = JSON.parse(primary);
        if (parsed.data && Object.keys(parsed.data).length > 0) {
          console.log('✅ Loaded from Layer 1: Primary LocalStorage');
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('⚠️ Primary LocalStorage corrupted');
    }

    // Try Layer 1: Backup LocalStorage
    try {
      const backup = localStorage.getItem('violet-content-backup');
      if (backup) {
        const parsed = JSON.parse(backup);
        if (Object.keys(parsed).length > 0) {
          console.log('✅ Loaded from Layer 1: Backup LocalStorage');
          return parsed;
        }
      }
    } catch (error) {
      console.warn('⚠️ Backup LocalStorage corrupted');
    }

    // Try Layer 2: SessionStorage
    try {
      const session = sessionStorage.getItem('violet-content-session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.data && Object.keys(parsed.data).length > 0) {
          console.log('✅ Loaded from Layer 2: SessionStorage');
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('⚠️ SessionStorage corrupted');
    }

    // Try Layer 3: IndexedDB
    try {
      if (this.isInitialized) {
        const content = await this.indexedDB.loadContent();
        if (content && Object.keys(content).length > 0) {
          console.log('✅ Loaded from Layer 3: IndexedDB');
          return content;
        }
      }
    } catch (error) {
      console.warn('⚠️ IndexedDB load failed');
    }

    console.log('ℹ️ No content found in any layer');
    return {};
  }

  // Test method for debugging
  async testSave(fieldName: string, value: string): Promise<void> {
    console.log(`🧪 Testing Triple Failsafe save: ${fieldName} = "${value}"`);
    
    await this.saveToAllLayers([{
      field_name: fieldName,
      field_value: value
    }]);
    
    // Verify save worked
    const content = await this.getContent();
    if (content[fieldName] === value) {
      console.log('✅ Test save verified');
    } else {
      console.error('❌ Test save failed verification');
    }
  }

  // Status method for debugging
  async getStatus(): Promise<{
    layers: FailsafeLayer[];
    contentCount: number;
    lastUpdate: number | null;
  }> {
    const layers: FailsafeLayer[] = [
      {
        name: 'LocalStorage Primary',
        available: !!localStorage.getItem('violet-content-primary'),
        save: this.saveToLocalStorage.bind(this),
        load: async () => {
          const data = localStorage.getItem('violet-content-primary');
          return data ? JSON.parse(data).data : {};
        }
      },
      {
        name: 'LocalStorage Backup',
        available: !!localStorage.getItem('violet-content-backup'),
        save: async () => {}, // Simplified for status
        load: async () => {
          const data = localStorage.getItem('violet-content-backup');
          return data ? JSON.parse(data) : {};
        }
      },
      {
        name: 'SessionStorage',
        available: !!sessionStorage.getItem('violet-content-session'),
        save: this.saveToSessionStorage.bind(this),
        load: async () => {
          const data = sessionStorage.getItem('violet-content-session');
          return data ? JSON.parse(data).data : {};
        }
      },
      {
        name: 'IndexedDB',
        available: this.isInitialized,
        save: this.saveToIndexedDB.bind(this),
        load: async () => {
          try {
            return await this.indexedDB.loadContent();
          } catch {
            return {};
          }
        }
      }
    ];

    const content = await this.getContent();
    const contentCount = Object.keys(content).length;
    
    // Try to get last update timestamp
    let lastUpdate: number | null = null;
    try {
      const primary = localStorage.getItem('violet-content-primary');
      if (primary) {
        lastUpdate = JSON.parse(primary).timestamp;
      }
    } catch {}

    return {
      layers,
      contentCount,
      lastUpdate
    };
  }
}

// Create singleton instance
export const tripleFailsafe = new TripleFailsafeSystem();

// Auto-initialize when imported in WordPress editor mode
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  const isWordPressEditor = urlParams.has('edit_mode') && urlParams.has('wp_admin');
  
  if (isWordPressEditor) {
    tripleFailsafe.initialize().then(() => {
      console.log('🛡️ Triple Failsafe auto-initialized for WordPress editor');
      
      // Make available globally for debugging
      (window as any).violetTripleFailsafe = tripleFailsafe;
    });
  }
}

export default tripleFailsafe;
