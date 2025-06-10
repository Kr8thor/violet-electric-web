// ULTIMATE WORDPRESS SAVE FIX
// This consolidates all the message handling and ensures React components update

import { getAllContentSync, saveContent } from '@/utils/contentStorage';

class WordPressSaveManager {
  private static instance: WordPressSaveManager;
  private listeners: Set<(content: any) => void> = new Set();
  private gracePeriodActive = false;
  private lastSaveTime = 0;

  static getInstance(): WordPressSaveManager {
    if (!WordPressSaveManager.instance) {
      WordPressSaveManager.instance = new WordPressSaveManager();
    }
    return WordPressSaveManager.instance;
  }

  private constructor() {
    this.initialize();
  }

  private initialize() {
    // Remove all existing listeners first
    window.removeEventListener('message', this.handleMessage);
    
    // Add single consolidated listener
    window.addEventListener('message', this.handleMessage);
    
    console.log('✅ WordPressSaveManager initialized');
  }

  private handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
      console.log('🎯 WordPressSaveManager: Processing save from WordPress');
      
      // Convert saved changes to content object
      const updates: Record<string, string> = {};
      event.data.savedChanges.forEach((change: any) => {
        if (change.field_name && change.field_value !== undefined) {
          updates[change.field_name] = change.field_value;
        }
      });
      
      if (Object.keys(updates).length === 0) {
        console.warn('⚠️ No valid updates found');
        return;
      }
      
      // Save to localStorage
      console.log('💾 Saving to localStorage:', updates);
      saveContent(updates, true);
      
      // Set grace period
      this.gracePeriodActive = true;
      this.lastSaveTime = Date.now();
      setTimeout(() => {
        this.gracePeriodActive = false;
        console.log('✅ Grace period ended');
      }, 30000);
      
      // Notify all listeners (this will trigger React re-renders)
      console.log(`📢 Notifying ${this.listeners.size} listeners`);
      this.listeners.forEach(listener => {
        listener(updates);
      });
      
      // Force DOM update as backup
      this.forceUpdateDOM(updates);
      
      // Dispatch events for any other systems
      window.dispatchEvent(new CustomEvent('violet-content-saved', {
        detail: { updates, timestamp: Date.now() }
      }));
    }
  };

  private forceUpdateDOM(updates: Record<string, string>) {
    // Update DOM elements directly as a backup
    Object.entries(updates).forEach(([field, value]) => {
      const elements = document.querySelectorAll(`[data-violet-field="${field}"]`);
      elements.forEach(element => {
        if (element.textContent !== value) {
          console.log(`🔄 Force updating DOM: ${field}`);
          element.textContent = value;
          
          // Trigger React re-render by changing a data attribute
          element.setAttribute('data-violet-updated', Date.now().toString());
        }
      });
    });
  }

  subscribe(listener: (content: any) => void) {
    this.listeners.add(listener);
    console.log(`➕ Added listener (total: ${this.listeners.size})`);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
      console.log(`➖ Removed listener (total: ${this.listeners.size})`);
    };
  }

  isInGracePeriod(): boolean {
    return this.gracePeriodActive;
  }

  getTimeSinceLastSave(): number {
    return Date.now() - this.lastSaveTime;
  }

  // Manual test function
  testSave(field: string, value: string) {
    console.log('🧪 Testing save:', field, value);
    window.postMessage({
      type: 'violet-apply-saved-changes',
      savedChanges: [{ field_name: field, field_value: value }],
      timestamp: Date.now()
    }, window.location.origin);
  }
}

// Export singleton instance
export const saveManager = WordPressSaveManager.getInstance();

// Add to window for debugging
if (import.meta.env?.DEV || window.location.search.includes('debug=1')) {
  (window as any).violetSaveManager = saveManager;
  console.log('🛠️ Debug: window.violetSaveManager available');
}