/**
 * Enhanced Persistence System
 * Ensures saved content persists across page refreshes by prioritizing saved values
 */

export interface SavedContentEntry {
  field_name: string;
  field_value: string;
  timestamp?: number;
}

class EnhancedPersistence {
  private static STORAGE_KEY = 'violet-content';
  private static BACKUP_KEY = 'violet-content-backup';
  
  /**
   * Save content from WordPress with multiple persistence methods
   */
  public static saveContent(changes: SavedContentEntry[]): boolean {
    console.log('💾 Enhanced persistence: Saving content...', changes);
    
    try {
      // Get existing content
      const existingContent = this.loadExistingContent();
      
      // Apply changes
      const updatedContent = { ...existingContent };
      changes.forEach(change => {
        if (change.field_name && change.field_value !== undefined) {
          updatedContent[change.field_name] = change.field_value;
          console.log(`📝 SAVING: ${change.field_name} = "${change.field_value}"`);
        }
      });
      
      // Create content package
      const contentPackage = {
        version: 'enhanced-v1',
        timestamp: Date.now(),
        source: 'wordpress-save',
        content: updatedContent,
        changeCount: changes.length
      };
      
      // Save to primary storage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contentPackage));
      console.log('✅ Saved to primary localStorage');
      
      // Save backup
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(contentPackage));
      console.log('✅ Saved to backup localStorage');
      
      // Verify save worked
      const verification = localStorage.getItem(this.STORAGE_KEY);
      if (verification) {
        const parsed = JSON.parse(verification);
        console.log('✅ Save verification successful:', Object.keys(parsed.content).length, 'fields');
        return true;
      } else {
        console.error('❌ Save verification failed');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Enhanced persistence save failed:', error);
      return false;
    }
  }
  
  /**
   * Load content with priority: saved content > defaults
   */
  public static loadContent(): Record<string, string> {
    console.log('📦 Enhanced persistence: Loading content...');
    
    try {
      // Try primary storage first
      const primary = localStorage.getItem(this.STORAGE_KEY);
      if (primary) {
        const parsed = JSON.parse(primary);
        console.log('✅ Loaded from primary storage:', Object.keys(parsed.content || {}).length, 'fields');
        return parsed.content || {};
      }
      
      // Try backup storage
      const backup = localStorage.getItem(this.BACKUP_KEY);
      if (backup) {
        const parsed = JSON.parse(backup);
        console.log('✅ Loaded from backup storage:', Object.keys(parsed.content || {}).length, 'fields');
        return parsed.content || {};
      }
      
      console.log('ℹ️ No saved content found, will use defaults');
      return {};
      
    } catch (error) {
      console.error('❌ Enhanced persistence load failed:', error);
      return {};
    }
  }
  
  /**
   * Get a specific field value, prioritizing saved content
   */
  public static getField(fieldName: string, defaultValue?: string): string | undefined {
    const content = this.loadContent();
    const savedValue = content[fieldName];
    
    // Return saved value if it exists (even if empty string)
    if (savedValue !== undefined && savedValue !== null) {
      console.log(`📋 Using SAVED value for ${fieldName}: "${savedValue}"`);
      return savedValue;
    }
    
    // Only return undefined if no saved value exists - let component handle default
    console.log(`📋 No saved value for ${fieldName}, using component default`);
    return undefined;
  }
  
  /**
   * Check if content exists for a field
   */
  public static hasField(fieldName: string): boolean {
    const content = this.loadContent();
    return content.hasOwnProperty(fieldName);
  }
  
  /**
   * Load existing content for merging
   */
  private static loadExistingContent(): Record<string, string> {
    try {
      const existing = localStorage.getItem(this.STORAGE_KEY);
      if (existing) {
        const parsed = JSON.parse(existing);
        return parsed.content || {};
      }
    } catch (error) {
      console.warn('⚠️ Could not load existing content:', error);
    }
    return {};
  }
  
  /**
   * Clear all saved content (for testing)
   */
  public static clearContent(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.BACKUP_KEY);
    console.log('🗑️ All saved content cleared');
  }
  
  /**
   * Get content info for debugging
   */
  public static getContentInfo(): any {
    try {
      const primary = localStorage.getItem(this.STORAGE_KEY);
      const backup = localStorage.getItem(this.BACKUP_KEY);
      
      return {
        primaryExists: !!primary,
        backupExists: !!backup,
        primaryContent: primary ? JSON.parse(primary) : null,
        backupContent: backup ? JSON.parse(backup) : null
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

// Make globally available for WordPress to call
if (typeof window !== 'undefined') {
  (window as any).violetEnhancedPersistence = EnhancedPersistence;
  
  // Handle save messages from WordPress
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
      console.log('📨 Received save message from WordPress');
      const success = EnhancedPersistence.saveContent(event.data.savedChanges);
      
      if (success) {
        console.log('✅ Content saved successfully, triggering refresh...');
        
        // Trigger content refresh
        window.dispatchEvent(new CustomEvent('violet-content-updated'));
        
        // Force page reload after a delay to show new content
        setTimeout(() => {
          console.log('🔄 Reloading page to show saved content...');
          window.location.reload();
        }, 1000);
      }
    }
  });
  
  console.log('✅ Enhanced persistence system initialized');
}

export default EnhancedPersistence;
