// Complete Save System Implementation
// This handles all saving operations for the Universal Editing System

export interface SaveResult {
  success: boolean;
  savedCount: number;
  failedCount: number;
  errors: string[];
  timestamp: string;
}

export interface ContentChange {
  field_name: string;
  field_value: any;
  field_type?: 'text' | 'html' | 'url' | 'email' | 'color' | 'image';
}

export class VioletSaveSystem {
  private static apiUrl = '/wp-json/violet/v1';
  private static saveQueue: Map<string, any> = new Map();
  private static isAutosaving = false;
  private static lastSaveTime = 0;

  // Main save function - call this to save content
  static async saveContent(
    content: Record<string, any>,
    options: {
      triggerRebuild?: boolean;
      showNotification?: boolean;
      autosave?: boolean;
    } = {}
  ): Promise<SaveResult> {
    console.log('🔄 Starting save process...');

    const changes: ContentChange[] = Object.entries(content).map(([field, value]) => ({
      field_name: field,
      field_value: value,
      field_type: this.detectFieldType(field, value)
    }));

    try {
      // Save to WordPress
      const result = await this.saveToWordPress(changes, options.triggerRebuild);

      if (result.success) {
        // Save to local storage as backup
        this.saveToLocalStorage(content);
        
        // Clear the save queue
        this.clearSaveQueue();
        
        // Show notification if requested
        if (options.showNotification) {
          this.showSaveNotification('✅ Content saved successfully!', 'success');
        }

        console.log('✅ Save completed successfully');
        this.lastSaveTime = Date.now();
      } else {
        // Save failed - keep in local storage for recovery
        this.saveToFallbackStorage(content);
        
        if (options.showNotification) {
          this.showSaveNotification('❌ Save failed - content preserved locally', 'error');
        }
      }

      return result;
    } catch (error) {
      console.error('❌ Save system error:', error);
      
      // Emergency fallback save
      this.saveToFallbackStorage(content);
      
      const errorResult: SaveResult = {
        success: false,
        savedCount: 0,
        failedCount: changes.length,
        errors: [error.message],
        timestamp: new Date().toISOString()
      };

      if (options.showNotification) {
        this.showSaveNotification(`❌ Save failed: ${error.message}`, 'error');
      }

      return errorResult;
    }
  }

  // Auto-save function - runs automatically every 30 seconds if content is dirty
  static async autoSave(content: Record<string, any>): Promise<void> {
    if (this.isAutosaving) return;
    if (Date.now() - this.lastSaveTime < 30000) return; // Don't autosave too frequently

    this.isAutosaving = true;
    
    try {
      console.log('💾 Auto-saving content...');
      const result = await this.saveContent(content, { 
        triggerRebuild: false, 
        showNotification: false, 
        autosave: true 
      });
      
      if (result.success) {
        console.log('💾 Auto-save completed');
      }
    } catch (error) {
      console.error('💾 Auto-save failed:', error);
    } finally {
      this.isAutosaving = false;
    }
  }

  // Save to WordPress via REST API
  private static async saveToWordPress(
    changes: ContentChange[],
    triggerRebuild: boolean = false
  ): Promise<SaveResult> {
    const nonce = window.violet?.nonce || window.wpApiSettings?.nonce;
    const apiKey = import.meta.env.VITE_VIOLET_API_KEY;
    
    if (!nonce) {
      throw new Error('WordPress nonce not available - please refresh the page');
    }

    if (!apiKey) {
      throw new Error('API key not configured - please check environment variables');
    }

    const response = await fetch(`${this.apiUrl}/save-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Violet-API-Key': apiKey,
        'X-WP-Nonce': nonce,
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        changes,
        trigger_rebuild: triggerRebuild,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Permission denied - please log in to WordPress');
      } else if (response.status === 404) {
        throw new Error('API endpoint not found - please check WordPress configuration');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.data?.message || 'Save failed');
    }

    return {
      success: true,
      savedCount: result.saved_count || changes.length,
      failedCount: result.failed_count || 0,
      errors: result.errors || [],
      timestamp: new Date().toISOString()
    };
  }

  // Save to localStorage as backup
  private static saveToLocalStorage(content: Record<string, any>): void {
    try {
      const backup = {
        content,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem('violet_content_backup', JSON.stringify(backup));
      console.log('💾 Content backed up to localStorage');
    } catch (error) {
      console.error('❌ localStorage backup failed:', error);
    }
  }

  // Save to fallback storage when main save fails
  private static saveToFallbackStorage(content: Record<string, any>): void {
    try {
      // Save to localStorage
      this.saveToLocalStorage(content);
      
      // Also save to sessionStorage
      sessionStorage.setItem('violet_unsaved_content', JSON.stringify({
        content,
        timestamp: Date.now(),
        needsSync: true
      }));
      
      console.log('💾 Content saved to fallback storage');
    } catch (error) {
      console.error('❌ Fallback storage failed:', error);
    }
  }

  // Add content to save queue for batch processing
  static queueForSave(field: string, value: any): void {
    this.saveQueue.set(field, value);
    console.log(`📝 Queued field for save: ${field}`);
  }

  // Process the save queue
  static async processSaveQueue(options?: { triggerRebuild?: boolean }): Promise<SaveResult> {
    if (this.saveQueue.size === 0) {
      return {
        success: true,
        savedCount: 0,
        failedCount: 0,
        errors: [],
        timestamp: new Date().toISOString()
      };
    }

    const content = Object.fromEntries(this.saveQueue);
    return await this.saveContent(content, options);
  }

  // Clear the save queue
  static clearSaveQueue(): void {
    this.saveQueue.clear();
    console.log('🗑️ Save queue cleared');
  }

  // Detect field type for validation
  private static detectFieldType(field: string, value: any): string {
    if (typeof value !== 'string') return 'text';
    
    // URL fields
    if (field.includes('url') || field.includes('link')) {
      return 'url';
    }
    
    // Email fields
    if (field.includes('email')) {
      return 'email';
    }
    
    // Color fields
    if (field.includes('color') || (typeof value === 'string' && value.startsWith('#'))) {
      return 'color';
    }
    
    // HTML content (contains HTML tags)
    if (value.includes('<') && value.includes('>')) {
      return 'html';
    }
    
    // Image fields
    if (field.includes('image') || field.includes('photo') || field.includes('picture')) {
      return 'image';
    }
    
    return 'text';
  }

  // Show save notification to user
  private static showSaveNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `violet-save-notification violet-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation styles
    if (!document.querySelector('#violet-notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'violet-notification-styles';
      styles.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .notification-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .notification-close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          margin-left: 12px;
          padding: 0;
        }
        .notification-close:hover {
          opacity: 0.8;
        }
      `;
      document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // Recover unsaved content from storage
  static recoverUnsavedContent(): Record<string, any> | null {
    try {
      // Try sessionStorage first (most recent)
      const unsaved = sessionStorage.getItem('violet_unsaved_content');
      if (unsaved) {
        const data = JSON.parse(unsaved);
        if (data.needsSync) {
          console.log('📂 Recovered unsaved content from sessionStorage');
          return data.content;
        }
      }
      
      // Try localStorage backup
      const backup = localStorage.getItem('violet_content_backup');
      if (backup) {
        const data = JSON.parse(backup);
        console.log('📂 Recovered content from localStorage backup');
        return data.content;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Content recovery failed:', error);
      return null;
    }
  }

  // Clear recovery data after successful save
  static clearRecoveryData(): void {
    try {
      sessionStorage.removeItem('violet_unsaved_content');
      console.log('🗑️ Cleared unsaved content from sessionStorage');
    } catch (error) {
      console.error('❌ Failed to clear recovery data:', error);
    }
  }

  // Check if there's unsaved content
  static hasUnsavedContent(): boolean {
    try {
      const unsaved = sessionStorage.getItem('violet_unsaved_content');
      if (unsaved) {
        const data = JSON.parse(unsaved);
        return data.needsSync === true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Get last save time
  static getLastSaveTime(): number {
    return this.lastSaveTime;
  }

  // Force save all queued content immediately
  static async forceSave(triggerRebuild: boolean = false): Promise<SaveResult> {
    console.log('⚡ Force saving all content...');
    return await this.processSaveQueue({ triggerRebuild });
  }
}

// Auto-initialize the save system
if (typeof window !== 'undefined') {
  // Set up auto-save interval
  setInterval(() => {
    if (VioletSaveSystem.hasUnsavedContent()) {
      const content = VioletSaveSystem.recoverUnsavedContent();
      if (content) {
        VioletSaveSystem.autoSave(content);
      }
    }
  }, 30000); // Auto-save every 30 seconds

  // Set up beforeunload warning for unsaved content
  window.addEventListener('beforeunload', (event) => {
    if (VioletSaveSystem.hasUnsavedContent()) {
      event.preventDefault();
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return event.returnValue;
    }
  });

  console.log('💾 Violet Save System initialized');
}

export default VioletSaveSystem;