// React Hook for Save Operations
// Integrates with the VioletSaveSystem for React components

import { useState, useCallback, useRef, useEffect } from 'react';
import VioletSaveSystem, { SaveResult } from '../utils/saveSystem';

export interface UseSaveOptions {
  autoSave?: boolean;
  autoSaveInterval?: number;
  showNotifications?: boolean;
}

export interface SaveState {
  isSaving: boolean;
  isAutoSaving: boolean;
  isDirty: boolean;
  lastSaveTime: number | null;
  error: string | null;
  saveCount: number;
}

export function useSave(options: UseSaveOptions = {}) {
  const {
    autoSave = true,
    autoSaveInterval = 30000, // 30 seconds
    showNotifications = true
  } = options;

  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    isAutoSaving: false,
    isDirty: false,
    lastSaveTime: null,
    error: null,
    saveCount: 0
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Record<string, any>>({});

  // Update content and mark as dirty
  const updateContent = useCallback((field: string, value: any) => {
    pendingChangesRef.current[field] = value;
    
    setSaveState(prev => ({
      ...prev,
      isDirty: true,
      error: null
    }));

    // Queue for save
    VioletSaveSystem.queueForSave(field, value);

    // Schedule auto-save if enabled
    if (autoSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        performAutoSave();
      }, autoSaveInterval);
    }
  }, [autoSave, autoSaveInterval]);

  // Manual save function
  const save = useCallback(async (triggerRebuild: boolean = false): Promise<SaveResult> => {
    setSaveState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const result = await VioletSaveSystem.forceSave(triggerRebuild);
      
      if (result.success) {
        // Clear pending changes
        pendingChangesRef.current = {};
        
        setSaveState(prev => ({
          ...prev,
          isSaving: false,
          isDirty: false,
          lastSaveTime: Date.now(),
          saveCount: prev.saveCount + 1,
          error: null
        }));
        
        // Clear auto-save timeout
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
          autoSaveTimeoutRef.current = null;
        }
      } else {
        setSaveState(prev => ({
          ...prev,
          isSaving: false,
          error: result.errors.join(', ') || 'Save failed'
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        error: errorMessage
      }));

      return {
        success: false,
        savedCount: 0,
        failedCount: Object.keys(pendingChangesRef.current).length,
        errors: [errorMessage],
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  // Auto-save function
  const performAutoSave = useCallback(async () => {
    if (Object.keys(pendingChangesRef.current).length === 0) return;

    setSaveState(prev => ({ ...prev, isAutoSaving: true }));

    try {
      const result = await VioletSaveSystem.autoSave(pendingChangesRef.current);
      
      // Don't clear pending changes on auto-save, only on manual save
      setSaveState(prev => ({
        ...prev,
        isAutoSaving: false,
        lastSaveTime: Date.now()
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveState(prev => ({ ...prev, isAutoSaving: false }));
    }
  }, []);

  // Save and rebuild function
  const saveAndRebuild = useCallback(async (): Promise<SaveResult> => {
    return await save(true);
  }, [save]);

  // Check for unsaved changes on component mount
  useEffect(() => {
    const hasUnsaved = VioletSaveSystem.hasUnsavedContent();
    if (hasUnsaved) {
      setSaveState(prev => ({ ...prev, isDirty: true }));
      
      // Optionally recover unsaved content
      const recovered = VioletSaveSystem.recoverUnsavedContent();
      if (recovered) {
        pendingChangesRef.current = recovered;
        console.log('📂 Recovered unsaved content');
      }
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    ...saveState,
    
    // Actions
    updateContent,
    save,
    saveAndRebuild,
    
    // Helpers
    clearError: useCallback(() => {
      setSaveState(prev => ({ ...prev, error: null }));
    }, []),
    
    hasPendingChanges: Object.keys(pendingChangesRef.current).length > 0,
    
    getPendingChanges: () => ({ ...pendingChangesRef.current })
  };
}

export default useSave;