/**
 * Enhanced Save Flow Handler
 * Ensures WordPress saves trigger proper React content updates
 */

import { wordPressCommunication } from './WordPressCommunication';
import { tripleFailsafe } from './tripleFailsafeSystem';

class SaveFlowManager {
  private saveInProgress = false;
  private lastSaveTime = 0;
  private pendingRefresh = false;

  constructor() {
    this.initializeSaveHandlers();
    console.log('💾 Enhanced Save Flow Manager initialized');
  }

  private initializeSaveHandlers() {
    // Handle WordPress save messages
    wordPressCommunication.onMessage('violet-apply-saved-changes', (data, event) => {
      console.log('💾 WordPress save message received:', data);
      this.processSave(data.savedChanges);
    });

    // Handle direct save calls
    wordPressCommunication.onMessage('violet-save-success', (data, event) => {
      console.log('✅ WordPress save success:', data);
      this.processSave(data.changes);
    });

    // Handle prepare save
    wordPressCommunication.onMessage('violet-prepare-triple-failsafe-save', (data, event) => {
      console.log('📋 Preparing save for WordPress');
      this.prepareSave();
    });

    // Global save function for WordPress to call directly
    if (typeof window !== 'undefined') {
      (window as any).reactSaveContent = (changes: any) => {
        console.log('💾 Direct save call from WordPress:', changes);
        this.processSave(changes);
      };

      (window as any).reactPrepareContent = () => {
        return this.prepareSave();
      };
    }
  }

  private async processSave(changes: any) {
    if (this.saveInProgress) {
      console.log('⏳ Save already in progress, queuing...');
      this.pendingRefresh = true;
      return;
    }

    this.saveInProgress = true;
    this.lastSaveTime = Date.now();

    try {
      console.log('💾 Processing save with changes:', changes);

      // Convert changes to standard format
      const standardChanges = this.normalizeChanges(changes);

      // Save to triple failsafe system
      await tripleFailsafe.saveToAllLayers(standardChanges);
      console.log('✅ Saved to triple failsafe system');

      // Update localStorage in the expected format
      this.updateLocalStorage(standardChanges);

      // Trigger content refresh in React components
      this.triggerContentRefresh();

      // Notify WordPress of success
      wordPressCommunication.sendToWordPress({
        type: 'violet-save-confirmed',
        data: {
          success: true,
          changeCount: standardChanges.length,
          timestamp: Date.now()
        }
      });

      console.log('✅ Save process completed successfully');

    } catch (error) {
      console.error('❌ Save process failed:', error);
      
      wordPressCommunication.sendToWordPress({
        type: 'violet-save-confirmed',
        data: {
          success: false,
          error: error.message,
          timestamp: Date.now()
        }
      });
    } finally {
      this.saveInProgress = false;
      
      if (this.pendingRefresh) {
        this.pendingRefresh = false;
        setTimeout(() => this.triggerContentRefresh(), 500);
      }
    }
  }

  private normalizeChanges(changes: any): Array<{field_name: string, field_value: string}> {
    if (Array.isArray(changes)) {
      return changes.map(change => ({
        field_name: change.field_name || change.fieldType || change.field,
        field_value: change.field_value || change.value || change.content
      })).filter(change => change.field_name && change.field_value !== undefined);
    }

    if (typeof changes === 'object') {
      return Object.entries(changes).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return {
            field_name: value.field_name || key,
            field_value: value.field_value || value.value || String(value)
          };
        }
        return {
          field_name: key,
          field_value: String(value)
        };
      }).filter(change => change.field_name && change.field_value !== undefined);
    }

    return [];
  }

  private updateLocalStorage(changes: Array<{field_name: string, field_value: string}>) {
    try {
      // Get existing content
      const existingRaw = localStorage.getItem('violet-content');
      let existing: any = {};
      
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw);
        existing = parsed.content || parsed;
      }

      // Apply changes
      const newContent = { ...existing };
      changes.forEach(change => {
        newContent[change.field_name] = change.field_value;
        console.log(`📝 Updated ${change.field_name} = "${change.field_value}"`);
      });

      // Save with version info
      const toSave = {
        version: 'v2.0',
        timestamp: Date.now(),
        source: 'wordpress-save',
        content: newContent
      };

      localStorage.setItem('violet-content', JSON.stringify(toSave));
      console.log('💾 Updated localStorage with new content');

    } catch (error) {
      console.error('❌ Failed to update localStorage:', error);
    }
  }

  private triggerContentRefresh() {
    console.log('🔄 Triggering content refresh...');

    // Dispatch multiple refresh events
    const events = [
      'violet-content-updated',
      'violet-refresh-content',
      'violet-apply-changes'
    ];

    events.forEach(eventType => {
      window.dispatchEvent(new CustomEvent(eventType, {
        detail: { timestamp: Date.now(), source: 'save-flow' }
      }));
    });

    // Force page reload after a short delay to ensure content updates
    setTimeout(() => {
      console.log('🔄 Reloading page to show updated content...');
      window.location.reload();
    }, 1000);
  }

  private prepareSave() {
    console.log('📋 Preparing content for WordPress save');

    // Collect all current content from React components
    const content: Record<string, string> = {};
    
    // Get from localStorage
    try {
      const stored = localStorage.getItem('violet-content');
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.assign(content, parsed.content || parsed);
      }
    } catch (error) {
      console.error('❌ Failed to read stored content:', error);
    }

    // Get from DOM data attributes
    document.querySelectorAll('[data-violet-field]').forEach(element => {
      const field = element.getAttribute('data-violet-field');
      const value = element.getAttribute('data-violet-value') || 
                   element.textContent || 
                   (element as HTMLInputElement).value;
      
      if (field && value) {
        content[field] = value;
      }
    });

    console.log('📦 Prepared content for save:', Object.keys(content).length, 'fields');
    return content;
  }

  public getLastSaveTime() {
    return this.lastSaveTime;
  }

  public isSaveInProgress() {
    return this.saveInProgress;
  }
}

// Export singleton instance
export const saveFlowManager = new SaveFlowManager();

// Global access for debugging
if (typeof window !== 'undefined') {
  (window as any).violetSaveFlowManager = saveFlowManager;
}

export default saveFlowManager;
