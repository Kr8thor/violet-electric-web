// Content Management Debug Utilities
// This file provides debug tools for testing the enhanced content persistence

import { getAllContentSync, saveContent } from './contentStorage';

declare global {
  interface Window {
    violetDebug: {
      // State inspection
      getContentState: () => any;
      getCachedState: () => any;
      getLastSync: () => Date | null;
      getLastSave: () => Date | null;
      
      // Manual operations
      forceSync: () => Promise<void>;
      clearCache: () => void;
      simulateSave: (field: string, value: string) => void;
      
      // Grace period testing
      isInGracePeriod: () => boolean;
      getGracePeriodRemaining: () => number;
      
      // Monitoring
      enableLogging: () => void;
      disableLogging: () => void;
    };
  }
}

export function initializeContentDebugTools() {
  console.log('🛠️ Initializing content debug tools...');
  
  window.violetDebug = {
    // Get current content state from localStorage
    getContentState: () => {
      const stateStr = localStorage.getItem('violet-content-state');
      if (stateStr) {
        try {
          const state = JSON.parse(stateStr);
          console.log('📊 Content State:', state);
          return state;
        } catch (e) {
          console.error('Failed to parse content state:', e);
          return null;
        }
      }
      return null;
    },
    
    // Get cached content
    getCachedState: () => {
      const content = getAllContentSync();
      console.log('💾 Cached Content:', content);
      return content;
    },
    
    // Get last sync timestamp
    getLastSync: () => {
      const state = window.violetDebug.getContentState();
      if (state && state.lastSync) {
        const date = new Date(state.lastSync);
        console.log('🔄 Last Sync:', date.toLocaleString());
        return date;
      }
      console.log('❌ No sync timestamp found');
      return null;
    },
    
    // Get last save timestamp
    getLastSave: () => {
      const state = window.violetDebug.getContentState();
      if (state && state.lastSave) {
        const date = new Date(state.lastSave);
        console.log('💾 Last Save:', date.toLocaleString());
        return date;
      }
      console.log('❌ No save timestamp found');
      return null;
    },
    
    // Force a sync (will be handled by ContentContext with grace period logic)
    forceSync: async () => {
      console.log('🔄 Forcing sync...');
      window.dispatchEvent(new CustomEvent('violet-force-sync-request'));
    },
    
    // Clear all cached content
    clearCache: () => {
      if (confirm('This will clear all cached content. Are you sure?')) {
        localStorage.removeItem('violet-content-state');
        localStorage.removeItem('violet-content-cache');
        localStorage.removeItem('violet-last-sync-timestamp');
        console.log('🗑️ Cache cleared. Reloading...');
        window.location.reload();
      }
    },
    
    // Simulate a save from WordPress
    simulateSave: (field: string, value: string) => {
      console.log(`🧪 Simulating save: ${field} = "${value}"`);
      window.postMessage({
        type: 'violet-apply-saved-changes',
        savedChanges: [{
          field_name: field,
          field_value: value
        }],
        timestamp: Date.now(),
        syncDelay: 30000
      }, window.location.origin);
    },
    
    // Check if in grace period
    isInGracePeriod: () => {
      const state = window.violetDebug.getContentState();
      if (state && state.lastSave) {
        const timeSince = Date.now() - state.lastSave;
        const inGracePeriod = timeSince < 30000; // 30 second grace period
        console.log(`⏱️ Grace Period: ${inGracePeriod ? 'ACTIVE' : 'INACTIVE'}`);
        return inGracePeriod;
      }
      return false;
    },
    
    // Get grace period remaining time
    getGracePeriodRemaining: () => {
      const state = window.violetDebug.getContentState();
      if (state && state.lastSave) {
        const timeSince = Date.now() - state.lastSave;
        const remaining = Math.max(0, 30000 - timeSince);
        console.log(`⏱️ Grace Period Remaining: ${Math.round(remaining / 1000)}s`);
        return remaining;
      }
      return 0;
    },
    
    // Enable verbose logging
    enableLogging: () => {
      localStorage.setItem('violet-debug-logging', 'true');
      console.log('📝 Verbose logging enabled');
    },
    
    // Disable verbose logging
    disableLogging: () => {
      localStorage.removeItem('violet-debug-logging');
      console.log('🔇 Verbose logging disabled');
    }
  };
  
  // Add helpful console message
  console.log(`
🎨 Violet Content Debug Tools Ready!

Available commands:
- violetDebug.getContentState() - View current content state
- violetDebug.getCachedState() - View cached content
- violetDebug.getLastSync() - Check last sync time
- violetDebug.getLastSave() - Check last save time
- violetDebug.forceSync() - Force a sync (respects grace period)
- violetDebug.clearCache() - Clear all cached content
- violetDebug.simulateSave(field, value) - Simulate a WordPress save
- violetDebug.isInGracePeriod() - Check if in save grace period
- violetDebug.getGracePeriodRemaining() - Get remaining grace period time

Example test:
violetDebug.simulateSave('hero_title', 'Test Title ' + new Date().toLocaleTimeString())
  `);
}