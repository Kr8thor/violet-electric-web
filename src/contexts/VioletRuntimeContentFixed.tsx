// Updated VioletContentProvider with integrated save system
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import VioletSaveSystem, { SaveResult } from '../utils/saveSystem';
import useSave from '../hooks/useSave';

export interface VioletContentContextType {
  // Content management
  content: Record<string, any>;
  getContent: (field: string, defaultValue?: any) => any;
  updateContent: (field: string, value: any) => void;
  
  // Save operations
  save: (triggerRebuild?: boolean) => Promise<SaveResult>;
  saveAndRebuild: () => Promise<SaveResult>;
  
  // State
  isLoading: boolean;
  isSaving: boolean;
  isAutoSaving: boolean;
  isDirty: boolean;
  isEditing: boolean;
  error: string | null;
  
  // Save info
  lastSaveTime: number | null;
  saveCount: number;
  
  // Editing mode
  enableEditing: () => void;
  disableEditing: () => void;
  
  // Utilities
  clearError: () => void;
  hasUnsavedChanges: boolean;
}

const VioletContentContext = createContext<VioletContentContextType | null>(null);

export function VioletContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Use the save hook
  const {
    isSaving,
    isAutoSaving,
    isDirty,
    lastSaveTime,
    error,
    saveCount,
    updateContent: updateContentInSaveSystem,
    save: saveContent,
    saveAndRebuild: saveAndRebuildContent,
    clearError,
    hasPendingChanges
  } = useSave({
    autoSave: true,
    autoSaveInterval: 30000,
    showNotifications: true
  });

  // Load content from WordPress on mount
  useEffect(() => {
    loadContent();
  }, []);

  // Set up cross-origin communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      const allowedOrigins = [
        'https://wp.violetrainwater.com',
        'https://lustrous-dolphin-447351.netlify.app',
        'https://violetrainwater.com'
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      // Handle WordPress messages
      if (event.data?.type?.startsWith('violet-')) {
        handleWordPressMessage(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Send ready message to WordPress
    window.parent.postMessage({
      type: 'violet-iframe-ready',
      timestamp: Date.now(),
      capabilities: ['editing', 'saving', 'content-management']
    }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from WordPress API
      const apiKey = import.meta.env.VITE_VIOLET_API_KEY;
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      // Add API key if available
      if (apiKey) {
        headers['X-Violet-API-Key'] = apiKey;
      }

      const response = await fetch('/wp-json/violet/v1/content', {
        method: 'GET',
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setContent(data);
        console.log('✅ Content loaded from WordPress API');
      } else {
        // Fallback to recovered content
        const recovered = VioletSaveSystem.recoverUnsavedContent();
        if (recovered) {
          setContent(recovered);
          console.log('📂 Loaded recovered content');
        }
      }
    } catch (error) {
      console.error('❌ Failed to load content:', error);
      
      // Try to recover from local storage
      const recovered = VioletSaveSystem.recoverUnsavedContent();
      if (recovered) {
        setContent(recovered);
        console.log('📂 Loaded recovered content from local storage');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordPressMessage = (data: any) => {
    switch (data.type) {
      case 'violet-enable-editing':
        setIsEditing(true);
        console.log('✏️ Editing mode enabled');
        break;
        
      case 'violet-disable-editing':
        setIsEditing(false);
        console.log('👁️ Editing mode disabled');
        break;
        
      case 'violet-save-content':
        handleSaveRequest(data.payload);
        break;
        
      case 'violet-update-content':
        if (data.payload?.field && data.payload?.value !== undefined) {
          updateContent(data.payload.field, data.payload.value);
        }
        break;
    }
  };

  const handleSaveRequest = async (payload: any) => {
    try {
      const result = await saveContent(payload?.triggerRebuild || false);
      
      // Send save result back to WordPress
      window.parent.postMessage({
        type: 'violet-save-result',
        payload: {
          success: result.success,
          savedCount: result.savedCount,
          errors: result.errors,
          timestamp: result.timestamp
        },
        timestamp: Date.now()
      }, '*');
      
    } catch (error) {
      window.parent.postMessage({
        type: 'violet-save-result',
        payload: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        },
        timestamp: Date.now()
      }, '*');
    }
  };

  const getContent = useCallback((field: string, defaultValue: any = '') => {
    return content[field] !== undefined ? content[field] : defaultValue;
  }, [content]);

  const updateContent = useCallback((field: string, value: any) => {
    // Update local state
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update in save system
    updateContentInSaveSystem(field, value);
    
    // Notify WordPress of change
    window.parent.postMessage({
      type: 'violet-content-changed',
      payload: {
        field,
        value,
        timestamp: Date.now()
      }
    }, '*');
    
    console.log(`📝 Content updated: ${field}`);
  }, [updateContentInSaveSystem]);

  const enableEditing = useCallback(() => {
    setIsEditing(true);
    
    // Add editing classes to body
    document.body.classList.add('violet-editing-mode');
    
    // Enhance editable elements
    setTimeout(() => {
      enhanceEditableElements();
    }, 100);
  }, []);

  const disableEditing = useCallback(() => {
    setIsEditing(false);
    
    // Remove editing classes
    document.body.classList.remove('violet-editing-mode');
    
    // Remove editing enhancements
    removeEditingEnhancements();
  }, []);

  const enhanceEditableElements = () => {
    const elements = document.querySelectorAll('[data-violet-field]');
    
    elements.forEach(element => {
      const field = element.getAttribute('data-violet-field');
      if (!field) return;
      
      // Add editing class
      element.classList.add('violet-editable');
      
      // Add click handler
      const handleClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Send edit request to WordPress
        window.parent.postMessage({
          type: 'violet-edit-request',
          payload: {
            field,
            currentValue: element.textContent || '',
            elementType: element.tagName.toLowerCase(),
            timestamp: Date.now()
          }
        }, '*');
      };
      
      element.addEventListener('click', handleClick);
      
      // Store handler for cleanup
      (element as any).__violetClickHandler = handleClick;
      
      // Add hover effects
      element.addEventListener('mouseenter', () => {
        element.classList.add('violet-hover');
      });
      
      element.addEventListener('mouseleave', () => {
        element.classList.remove('violet-hover');
      });
    });
    
    console.log(`✨ Enhanced ${elements.length} editable elements`);
  };

  const removeEditingEnhancements = () => {
    const elements = document.querySelectorAll('[data-violet-field]');
    
    elements.forEach(element => {
      // Remove classes
      element.classList.remove('violet-editable', 'violet-hover');
      
      // Remove click handler
      const handler = (element as any).__violetClickHandler;
      if (handler) {
        element.removeEventListener('click', handler);
        delete (element as any).__violetClickHandler;
      }
    });
    
    console.log('🧹 Removed editing enhancements');
  };

  // Provide context value
  const contextValue: VioletContentContextType = {
    // Content management
    content,
    getContent,
    updateContent,
    
    // Save operations
    save: saveContent,
    saveAndRebuild: saveAndRebuildContent,
    
    // State
    isLoading,
    isSaving,
    isAutoSaving,
    isDirty,
    isEditing,
    error,
    
    // Save info
    lastSaveTime,
    saveCount,
    
    // Editing mode
    enableEditing,
    disableEditing,
    
    // Utilities
    clearError,
    hasUnsavedChanges: hasPendingChanges
  };

  return (
    <VioletContentContext.Provider value={contextValue}>
      {children}
    </VioletContentContext.Provider>
  );
}

// Hook to use the content context
export function useVioletContent(): VioletContentContextType {
  const context = useContext(VioletContentContext);
  
  if (!context) {
    throw new Error('useVioletContent must be used within a VioletContentProvider');
  }
  
  return context;
}

export default VioletContentProvider;