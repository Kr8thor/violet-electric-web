import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { VioletContent, getAllContentSync, initializeContent, saveContent } from '@/utils/contentStorage';
import { saveContentWithProtection, getAllContentWithProtection, isInGracePeriod } from '@/utils/enhancedContentStorage';
import { syncWordPressContent } from '@/utils/wordpressContentSync';

interface ContentState {
  wordpress: VioletContent;      // Content from WordPress
  local: VioletContent;          // Local edits  
  pending: VioletContent;        // Unsaved changes
  lastSync: number;              // Last WordPress sync timestamp
  lastSave: number;              // Last save timestamp
}

interface ContentContextValue {
  content: VioletContent;
  isLoading: boolean;
  isWordPressConnected: boolean;
  lastSync: Date | null;
  getField: (field: string, defaultValue: string) => string;
  updateContent: (updates: Partial<VioletContent>) => void;
  refreshContent: () => Promise<void>;
  forceRefresh: () => void;
  hasUnsavedChanges: boolean;
  isEditing: boolean;
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

const SYNC_COOLDOWN = 30000; // 30 seconds after save before auto-sync
const CACHE_KEY = 'violet-content-state';

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with proper structure using enhanced storage
  const [state, setState] = useState<ContentState>(() => {
    // Try to load saved state
    const savedState = localStorage.getItem(CACHE_KEY);
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error('Failed to parse saved content state:', e);
      }
    }
    
    // Otherwise initialize with cached content (protected if in grace period)
    const cached = getAllContentWithProtection();
    return {
      wordpress: cached,
      local: cached,
      pending: {},
      lastSync: 0,
      lastSave: 0
    };
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isWordPressConnected, setIsWordPressConnected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const isMounted = useRef(true);
  const syncInProgress = useRef(false);
  const saveGracePeriod = useRef(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(state));
  }, [state]);

  // Force a re-render of all components using content
  const forceRefresh = useCallback(() => {
    setForceUpdate(prev => prev + 1);
    console.log('🔄 Forcing content refresh');
  }, []);

  // Smart sync with WordPress that respects save grace period
  const syncWithWordPress = useCallback(async (force = false) => {
    // Check if we're in enhanced grace period
    if (isInGracePeriod() && !force) {
      console.log('⏸️ Skipping sync - in enhanced grace period');
      return;
    }

    // Don't sync if we're in a save grace period
    if (saveGracePeriod.current && !force) {
      console.log('⏸️ Skipping sync - in save grace period');
      return;
    }

    // Don't sync if we just saved recently
    const timeSinceLastSave = Date.now() - state.lastSave;
    if (timeSinceLastSave < SYNC_COOLDOWN && !force) {
      console.log(`⏸️ Skipping sync - only ${Math.round(timeSinceLastSave/1000)}s since last save (need ${SYNC_COOLDOWN/1000}s)`);
      return;
    }

    // Don't sync if we have unsaved changes
    if (Object.keys(state.pending).length > 0 && !force) {
      console.log('⏸️ Skipping sync - unsaved changes present');
      return;
    }

    // Prevent concurrent syncs
    if (syncInProgress.current) {
      console.log('⏸️ Sync already in progress');
      return;
    }

    try {
      syncInProgress.current = true;
      setIsLoading(true);
      console.log('🔄 Starting smart WordPress sync...');
      
      const wpSuccess = await syncWordPressContent();
      setIsWordPressConnected(wpSuccess);
      
      if (wpSuccess) {
        // Get the fresh WordPress content (use enhanced storage to respect grace period)
        const wpContent = getAllContentWithProtection();
        
        setState(prev => ({
          ...prev,
          wordpress: wpContent,
          // Only update local if we don't have pending changes
          local: Object.keys(prev.pending).length === 0 ? wpContent : prev.local,
          lastSync: Date.now()
        }));
        
        console.log('✅ WordPress content synced successfully');
      }
    } catch (error) {
      console.error('❌ Error syncing with WordPress:', error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        syncInProgress.current = false;
      }
    }
  }, [state.lastSave, state.pending]);

  // Refresh content with smart sync
  const refreshContent = useCallback(async () => {
    if (!isMounted.current) return;
    await syncWithWordPress();
  }, [syncWithWordPress]);

  // Update content locally and track changes
  const updateContent = useCallback((updates: Partial<VioletContent>) => {
    console.log('📝 Updating content locally:', updates);
    
    setState(prev => {
      const newState = {
        ...prev,
        pending: isEditing ? { ...prev.pending, ...updates } : {},
        local: { ...prev.local, ...updates }
      };
      
      // Save to localStorage (regular save, not from WordPress)
      saveContentWithProtection(updates, false);
      
      return newState;
    });
    
    // Force re-render
    forceRefresh();
  }, [isEditing, forceRefresh]);

  // Get a specific field with proper precedence
  const getField = useCallback((field: string, defaultValue: string): string => {
    // Include forceUpdate to ensure re-renders
    const _ = forceUpdate;
    
    // Priority: pending > local > wordpress > default
    if (state.pending[field] !== undefined && state.pending[field] !== '') {
      return state.pending[field];
    }
    if (state.local[field] !== undefined && state.local[field] !== '') {
      return state.local[field];
    }
    if (state.wordpress[field] !== undefined && state.wordpress[field] !== '') {
      return state.wordpress[field];
    }
    
    return defaultValue;
  }, [state, forceUpdate]);

  // Load content on mount
  useEffect(() => {
    isMounted.current = true;
    // Only sync if we don't have recent save
    const timeSinceLastSave = Date.now() - state.lastSave;
    if (timeSinceLastSave > SYNC_COOLDOWN) {
      syncWithWordPress(true);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, []); // Only on mount

  // Listen for messages and events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Handle editing mode changes
      if (event.data.type === 'violet-enable-editing') {
        console.log('✏️ Edit mode enabled');
        setIsEditing(true);
      }
      
      if (event.data.type === 'violet-disable-editing') {
        console.log('🔒 Edit mode disabled');
        setIsEditing(false);
        // Clear pending changes when editing is disabled
        setState(prev => ({ ...prev, pending: {} }));
      }
      
      // Handle saves from WordPress
      if (event.data.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
        console.log('💾 Applying saved changes from WordPress:', event.data.savedChanges);
        
        // CRITICAL FIX: Actually apply the saved changes!
        const updates: VioletContent = {};
        event.data.savedChanges.forEach((change: any) => {
          if (change.field_name && change.field_value !== undefined) {
            updates[change.field_name] = change.field_value;
          }
        });
        
        if (Object.keys(updates).length > 0) {
          setState(prev => ({
            wordpress: { ...prev.wordpress, ...updates },
            local: { ...prev.local, ...updates },
            pending: {}, // Clear pending changes after save
            lastSync: Date.now(),
            lastSave: Date.now()
          }));
          
          // Save to localStorage
          saveContent(updates, true);
          
          console.log('✅ Changes saved and applied to state:', updates);
        }
        
        const syncDelay = typeof event.data.syncDelay === 'number' ? event.data.syncDelay : 30000;
        saveGracePeriod.current = true;
        setTimeout(() => {
          saveGracePeriod.current = false;
          console.log('✅ Save grace period ended - syncing enabled again');
        }, syncDelay);
      }
      
      // Handle content update requests (but respect grace period)
      if (event.data.type === 'violet-content-updated') {
        console.log('🔄 Content update requested from WordPress');
        if (!saveGracePeriod.current) {
          syncWithWordPress();
        } else {
          console.log('⏸️ Ignoring update request - in grace period');
        }
      }
    };

    // Smart visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted.current) {
        // Only sync if conditions are met
        const hasUnsaved = Object.keys(state.pending).length > 0;
        const inGracePeriod = Date.now() - state.lastSave < SYNC_COOLDOWN;
        
        if (!hasUnsaved && !inGracePeriod && !saveGracePeriod.current) {
          console.log('👁️ Page visible - syncing with WordPress');
          syncWithWordPress();
        } else {
          console.log('👁️ Page visible - skipping sync (unsaved changes or grace period)');
          if (hasUnsaved) console.log('  - Has unsaved changes');
          if (inGracePeriod) console.log(`  - In grace period (${Math.round((SYNC_COOLDOWN - (Date.now() - state.lastSave))/1000)}s remaining)`);
          if (saveGracePeriod.current) console.log('  - Save grace period active');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.pending, state.lastSave, syncWithWordPress, updateContent]);

  // Compute merged content for components
  const content = {
    ...state.wordpress,
    ...state.local,
    ...state.pending
  };

  const hasUnsavedChanges = Object.keys(state.pending).length > 0;

  const value: ContentContextValue = {
    content,
    isLoading: isLoading && Object.keys(content).length === 0, // Only show loading if no cached content
    isWordPressConnected,
    lastSync: state.lastSync ? new Date(state.lastSync) : null,
    getField,
    updateContent,
    refreshContent,
    forceRefresh,
    hasUnsavedChanges,
    isEditing
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

// Convenience hook for a specific field
export const useContentField = (field: string, defaultValue: string): string => {
  const { getField } = useContent();
  return getField(field, defaultValue);
};

// Hook for monitoring WordPress connection
export const useWordPressConnection = () => {
  const { isWordPressConnected, lastSync } = useContent();
  return { isConnected: isWordPressConnected, lastSync };
};

// Hook for edit mode status
export const useEditMode = () => {
  const { isEditing, hasUnsavedChanges } = useContent();
  return { isEditing, hasUnsavedChanges };
};