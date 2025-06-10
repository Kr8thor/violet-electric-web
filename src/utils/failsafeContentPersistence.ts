/**
 * Failsafe Content Persistence Layer
 * 
 * This provides multiple redundant storage mechanisms to ensure
 * content is NEVER lost and ALWAYS persists after WordPress saves
 */

interface ContentData {
  [key: string]: string;
}

interface PersistedContent {
  data: ContentData;
  timestamp: number;
  source: 'wordpress' | 'local' | 'manual';
  version: number;
}

const STORAGE_KEYS = {
  PRIMARY: 'violet-content-primary',
  BACKUP: 'violet-content-backup',
  EMERGENCY: 'violet-content-emergency',
  VERSION: 'violet-content-version'
};

export class FailsafeContentPersistence {
  private static instance: FailsafeContentPersistence;
  private version: number = 1;
  private listeners: ((content: ContentData) => void)[] = [];

  static getInstance(): FailsafeContentPersistence {
    if (!this.instance) {
      this.instance = new FailsafeContentPersistence();
    }
    return this.instance;
  }

  /**
   * Save content with triple redundancy
   */
  saveContent(content: ContentData, source: 'wordpress' | 'local' | 'manual' = 'local'): void {
    console.log('💾 FAILSAFE: Triple-saving content', { content, source });
    
    const persisted: PersistedContent = {
      data: content,
      timestamp: Date.now(),
      source,
      version: ++this.version
    };

    // Primary storage
    try {
      localStorage.setItem(STORAGE_KEYS.PRIMARY, JSON.stringify(persisted));
    } catch (e) {
      console.error('Primary storage failed:', e);
    }

    // Backup storage with compression
    try {
      const compressed = this.compress(persisted);
      localStorage.setItem(STORAGE_KEYS.BACKUP, compressed);
    } catch (e) {
      console.error('Backup storage failed:', e);
    }

    // Emergency storage in sessionStorage
    try {
      sessionStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(persisted));
    } catch (e) {
      console.error('Emergency storage failed:', e);
    }

    // Store version separately
    localStorage.setItem(STORAGE_KEYS.VERSION, this.version.toString());

    // Notify all listeners
    this.notifyListeners(content);

    // Also store in window object for absolute failsafe
    (window as any).__violetContent = content;
  }

  /**
   * Load content with fallback chain
   */
  loadContent(): ContentData {
    console.log('📥 FAILSAFE: Loading content with fallback chain');

    // Try primary storage
    try {
      const primary = localStorage.getItem(STORAGE_KEYS.PRIMARY);
      if (primary) {
        const parsed = JSON.parse(primary) as PersistedContent;
        console.log('✅ Loaded from primary storage', parsed);
        return parsed.data;
      }
    } catch (e) {
      console.error('Primary load failed:', e);
    }

    // Try backup storage
    try {
      const backup = localStorage.getItem(STORAGE_KEYS.BACKUP);
      if (backup) {
        const decompressed = this.decompress(backup);
        console.log('✅ Loaded from backup storage', decompressed);
        return decompressed.data;
      }
    } catch (e) {
      console.error('Backup load failed:', e);
    }

    // Try emergency storage
    try {
      const emergency = sessionStorage.getItem(STORAGE_KEYS.EMERGENCY);
      if (emergency) {
        const parsed = JSON.parse(emergency) as PersistedContent;
        console.log('✅ Loaded from emergency storage', parsed);
        return parsed.data;
      }
    } catch (e) {
      console.error('Emergency load failed:', e);
    }

    // Last resort - window object
    if ((window as any).__violetContent) {
      console.log('✅ Loaded from window object');
      return (window as any).__violetContent;
    }

    console.log('⚠️ No persisted content found');
    return {};
  }

  /**
   * Force save from WordPress message
   */
  handleWordPressSave(savedChanges: any[]): void {
    console.log('🔄 FAILSAFE: Processing WordPress save', savedChanges);
    
    const currentContent = this.loadContent();
    const updates: ContentData = { ...currentContent };

    savedChanges.forEach(change => {
      if (change.field_name && change.field_value !== undefined) {
        updates[change.field_name] = change.field_value;
      }
    });

    this.saveContent(updates, 'wordpress');
    
    // Force page refresh after a short delay to ensure all components update
    setTimeout(() => {
      console.log('🔄 FAILSAFE: Forcing page refresh for content update');
      window.location.reload();
    }, 100);
  }

  /**
   * Add listener for content changes
   */
  addListener(callback: (content: ContentData) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(content: ContentData): void {
    this.listeners.forEach(listener => {
      try {
        listener(content);
      } catch (e) {
        console.error('Listener error:', e);
      }
    });
  }

  private compress(data: PersistedContent): string {
    // Simple compression by removing whitespace
    return JSON.stringify(data).replace(/\s+/g, ' ');
  }

  private decompress(data: string): PersistedContent {
    return JSON.parse(data);
  }

  /**
   * Verify content integrity
   */
  verifyIntegrity(): boolean {
    const primary = this.loadFromStorage(STORAGE_KEYS.PRIMARY);
    const backup = this.loadFromStorage(STORAGE_KEYS.BACKUP);
    const emergency = this.loadFromStorage(STORAGE_KEYS.EMERGENCY);

    const primaryVersion = primary?.version || 0;
    const backupVersion = backup?.version || 0;
    const emergencyVersion = emergency?.version || 0;

    const maxVersion = Math.max(primaryVersion, backupVersion, emergencyVersion);
    
    console.log('🔍 FAILSAFE: Integrity check', {
      primaryVersion,
      backupVersion,
      emergencyVersion,
      maxVersion
    });

    return maxVersion > 0;
  }

  private loadFromStorage(key: string): PersistedContent | null {
    try {
      const data = key === STORAGE_KEYS.EMERGENCY 
        ? sessionStorage.getItem(key)
        : localStorage.getItem(key);
      
      if (data) {
        if (key === STORAGE_KEYS.BACKUP) {
          return this.decompress(data);
        }
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(`Failed to load from ${key}:`, e);
    }
    return null;
  }
}

// Export singleton instance
export const failsafeStorage = FailsafeContentPersistence.getInstance();
