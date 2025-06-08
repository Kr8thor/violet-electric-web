// Enhanced EditingOverlay.tsx - Fixed WordPress Communication
// This fixes the direct editing issues with proper iframe communication

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { EnhancedFieldDetector, FieldDetection } from './EnhancedFieldDetector';
import { InlineEditor } from './InlineEditor';
import { SaveStatusIndicator, useUnsavedChangesWarning } from './SaveStatusIndicator';
import { useContentEditorPerformance } from './PerformanceHooks';

// Enhanced types for better WordPress integration
interface EditingState {
  activeField: string | null;
  inlineEditor: {
    fieldId: string;
    element: HTMLElement;
    initialValue: string;
    fieldType: string;
    confidence: number;
    position: { top: number; left: number; width: number; height: number };
  } | null;
  hoveredField: string | null;
  wordPressConnected: boolean;
  editModeActive: boolean;
}

interface EditingConfig {
  isEnabled: boolean;
  detectedFields: Map<HTMLElement, FieldDetection>;
  scanInProgress: boolean;
  debugMode: boolean;
}

const TRUSTED_ORIGINS = [
  'https://wp.violetrainwater.com',
  'https://violetrainwater.com'
];

const sendToParent = (message: any) => {
  TRUSTED_ORIGINS.forEach(origin => {
    window.parent.postMessage(message, origin);
  });
};

// Main EditingOverlay Component - Enhanced WordPress Integration
export const EditingOverlay: React.FC = () => {
  // Enhanced state management
  const [config, setConfig] = useState<EditingConfig>({
    isEnabled: false,
    detectedFields: new Map(),
    scanInProgress: false,
    debugMode: false
  });
  
  const [editingState, setEditingState] = useState<EditingState>({
    activeField: null,
    inlineEditor: null,
    hoveredField: null,
    wordPressConnected: false,
    editModeActive: false
  });

  // Refs for better performance
  const detectorRef = useRef<EnhancedFieldDetector>();
  const fieldElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<MutationObserver>();
  const communicationRef = useRef<boolean>(false);

  // Performance management
  const performanceManager = useContentEditorPerformance(
    async (data: { fieldId: string; value: string; fieldType: string }) => {
      await saveToWordPress(data.fieldId, data.value, data.fieldType);
      performanceManager.confirmSave(data.fieldId);
    },
    1000
  );

  // Unsaved changes warning
  useUnsavedChangesWarning(
    performanceManager.hasOptimisticUpdates || performanceManager.hasPendingChanges
  );

  // Initialize detector
  useEffect(() => {
    detectorRef.current = new EnhancedFieldDetector();
    
    // Debug logging
    if (typeof window !== 'undefined') {
      const isInIframe = window.parent !== window.self;
      const hasEditParam = new URLSearchParams(window.location.search).has('edit_mode');
      
      console.log('🎨 Violet Editor: Component initialized', {
        isInIframe,
        hasEditParam,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
      
      setConfig(prev => ({ ...prev, debugMode: isInIframe || hasEditParam }));
    }
  }, []);

  // Enhanced Field Detection with WordPress compatibility
  const detectFieldType = useCallback((element: HTMLElement, text: string): FieldDetection => {
    if (!detectorRef.current) {
      return {
        type: 'generic_text',
        confidence: 0.5,
        priority: 'low',
        editStrategy: 'inline',
        description: 'Generic text content'
      };
    }
    
    // Enhanced detection for WordPress editor compatibility
    const tagName = element.tagName.toLowerCase();
    const textLower = text.toLowerCase();
    const classes = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    
    // Hero section detection
    if (tagName === 'h1' || textLower.includes('change the channel') || 
        textLower.includes('violet rainwater') || classes.includes('hero')) {
      return {
        type: 'hero_title',
        confidence: 0.95,
        priority: 'high',
        editStrategy: 'inline',
        description: 'Main hero title'
      };
    }
    
    if (textLower.includes('transform your potential') || 
        textLower.includes('neuroscience-backed') ||
        (classes.includes('hero') && tagName === 'p')) {
      return {
        type: 'hero_subtitle',
        confidence: 0.9,
        priority: 'high',
        editStrategy: 'inline',
        description: 'Hero subtitle text'
      };
    }
    
    if ((tagName === 'button' || tagName === 'a') && 
        (textLower.includes('book') || textLower.includes('get started') || 
         textLower.includes('learn more'))) {
      return {
        type: 'hero_cta',
        confidence: 0.85,
        priority: 'medium',
        editStrategy: 'inline',
        description: 'Call-to-action button'
      };
    }
    
    // Contact information
    if (text.includes('@') && text.includes('.')) {
      return {
        type: 'contact_email',
        confidence: 0.9,
        priority: 'medium',
        editStrategy: 'inline',
        description: 'Email address'
      };
    }
    
    if (text.match(/[\d\s\(\)\-\+]{7,}/) && !text.includes('@')) {
      return {
        type: 'contact_phone',
        confidence: 0.8,
        priority: 'medium',
        editStrategy: 'inline',
        description: 'Phone number'
      };
    }
    
    // Navigation
    if (element.closest('nav') || classes.includes('nav') || id.includes('nav')) {
      return {
        type: 'navigation_item',
        confidence: 0.8,
        priority: 'medium',
        editStrategy: 'inline',
        description: 'Navigation menu item'
      };
    }
    
    // SEO headings
    if (tagName.startsWith('h') && (textLower.includes('about') || 
        textLower.includes('service') || textLower.includes('contact'))) {
      return {
        type: 'seo_heading',
        confidence: 0.8,
        priority: 'medium',
        editStrategy: 'inline',
        description: 'SEO section heading'
      };
    }
    
    // Default fallback
    return {
      type: 'generic_text',
      confidence: 0.6,
      priority: 'low',
      editStrategy: 'inline',
      description: 'General text content'
    };
  }, []);

  // Enhanced visual styling with better visibility
  const getVisualStyling = useCallback((priority: string, confidence: number, isHovered: boolean, isActive: boolean) => {
    if (isActive) {
      return {
        outline: '3px solid #00a32a',
        backgroundColor: 'rgba(0, 163, 42, 0.1)',
        cursor: 'text',
        transition: 'all 0.2s ease-in-out'
      };
    }
    
    const baseOpacity = isHovered ? 0.8 : Math.min(0.7, confidence + 0.3);
    const hoverOpacity = isHovered ? 0.15 : 0.05;
    
    const colors = {
      high: { border: '0, 115, 170', bg: '0, 115, 170' }, // WordPress blue
      medium: { border: '245, 158, 11', bg: '245, 158, 11' }, // amber
      low: { border: '107, 114, 128', bg: '107, 114, 128' } // gray
    };

    const color = colors[priority as keyof typeof colors] || colors.low;
    
    return {
      outline: `${isHovered ? '3px solid' : '2px dashed'} rgba(${color.border}, ${baseOpacity})`,
      backgroundColor: `rgba(${color.bg}, ${hoverOpacity})`,
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      position: 'relative' as const
    };
  }, []);

  // Enhanced field scanning with better element selection
  const scanForFields = useCallback(() => {
    if (!config.isEnabled || !detectorRef.current) return;

    setConfig(prev => ({ ...prev, scanInProgress: true }));

    try {
      // Enhanced selectors for better detection
      const selectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p:not(.violet-ignore)',
        'span:not(.icon):not([class*="icon"]):not(.violet-ignore)',
        'a:not(.violet-ignore)',
        'button:not(.violet-ignore)',
        '[data-editable="true"]',
        '.editable-text'
      ];
      
      const newFieldMap = new Map<HTMLElement, FieldDetection>();
      fieldElementsRef.current.clear();
      
      let fieldIndex = 0;
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement;
          const text = htmlElement.textContent?.trim() || '';
          
          // Enhanced filtering
          if (text && 
              text.length > 2 && 
              text.length < 500 && 
              !htmlElement.querySelector('img, svg, iframe, video') &&
              !htmlElement.closest('script, style, noscript, .violet-ignore, .violet-editing-indicator') &&
              !htmlElement.dataset.violetEditable &&
              !htmlElement.classList.contains('violet-ignore')) {
            
            const detection = detectFieldType(htmlElement, text);
            
            // Only include fields with reasonable confidence
            if (detection.confidence > 0.3) {
              const fieldId = `field-${fieldIndex}-${Date.now()}`;
              fieldElementsRef.current.set(fieldId, htmlElement);
              newFieldMap.set(htmlElement, detection);
              htmlElement.dataset.violetFieldId = fieldId;
              htmlElement.dataset.violetEditable = 'true';
              fieldIndex++;
            }
          }
        });
      });

      setConfig(prev => ({
        ...prev,
        detectedFields: newFieldMap,
        scanInProgress: false
      }));

      console.log(`✅ Detected ${newFieldMap.size} editable fields`);

    } catch (error) {
      console.error('❌ Field detection error:', error);
      setConfig(prev => ({ ...prev, scanInProgress: false }));
    }
  }, [config.isEnabled, detectFieldType]);

  // Enhanced visual indicators
  const addVisualIndicators = useCallback(() => {
    if (!config.isEnabled || !editingState.editModeActive) return;

    fieldElementsRef.current.forEach((element, fieldId) => {
      const text = element.textContent?.trim() || '';
      const detection = detectFieldType(element, text);
      const isHovered = editingState.hoveredField === fieldId;
      const isActive = editingState.activeField === fieldId;
      
      // Skip if inline editing is active
      if (isActive && editingState.inlineEditor) {
        return;
      }
      
      // Apply enhanced styling
      const styling = getVisualStyling(detection.priority, detection.confidence, isHovered, isActive);
      Object.assign(element.style, styling);
      
      // Enhanced tooltip
      if (isHovered) {
        element.title = `✏️ ${detection.description} (${Math.round(detection.confidence * 100)}% confidence) - Click to edit`;
      } else {
        element.removeAttribute('title');
      }
    });
  }, [config.isEnabled, editingState.editModeActive, editingState.hoveredField, editingState.activeField, editingState.inlineEditor, detectFieldType, getVisualStyling]);

  // Enhanced event handlers
  const handleFieldHover = useCallback((fieldId: string | null) => {
    setEditingState(prev => ({
      ...prev,
      hoveredField: fieldId
    }));
  }, []);

  const handleFieldClick = useCallback((fieldId: string, element: HTMLElement) => {
    if (!editingState.editModeActive) return;
    
    const text = element.textContent?.trim() || '';
    const detection = detectFieldType(element, text);
    
    console.log('🖱️ Field clicked for editing:', { 
      fieldId, 
      type: detection.type, 
      text: text.substring(0, 50) + '...',
      confidence: detection.confidence 
    });
    
    // Always use inline editing for now (can be enhanced later)
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    setEditingState(prev => ({
      ...prev,
      activeField: fieldId,
      inlineEditor: {
        fieldId,
        element,
        initialValue: text,
        fieldType: detection.type,
        confidence: detection.confidence,
        position: {
          top: rect.top + scrollTop - 10,
          left: rect.left + scrollLeft,
          width: Math.max(rect.width, 200),
          height: rect.height
        }
      }
    }));
    
    // Dim the original element
    element.style.opacity = '0.3';
    
    // Send edit request to WordPress
    sendToParent({
      type: 'edit-request',
      data: {
        fieldId,
        fieldType: detection.type,
        text,
        confidence: detection.confidence,
        element: element.tagName
      },
      timestamp: new Date().toISOString(),
      source: 'react-app'
    });
    
  }, [editingState.editModeActive, detectFieldType]);

  // Enhanced inline editor handlers
  const handleInlineEditorSave = useCallback(async (newValue: string) => {
    if (!editingState.inlineEditor) return;
    
    const { fieldId, element, initialValue, fieldType } = editingState.inlineEditor;
    
    console.log('💾 Saving content:', { fieldId, fieldType, newValue });
    
    // Optimistic update
    performanceManager.updateContent(fieldId, newValue, initialValue, fieldType);
    
    // Update element immediately
    element.textContent = newValue;
    element.style.opacity = '1';
    
    // Close inline editor
    setEditingState(prev => ({
      ...prev,
      activeField: null,
      inlineEditor: null
    }));
    
    // Send to WordPress for saving
    sendToParent({
      type: 'save-content',
      data: {
        fieldId,
        fieldType,
        value: newValue,
        originalValue: initialValue
      },
      timestamp: new Date().toISOString(),
      source: 'react-app'
    });
    
  }, [editingState.inlineEditor, performanceManager]);

  const handleInlineEditorCancel = useCallback(() => {
    if (editingState.inlineEditor) {
      editingState.inlineEditor.element.style.opacity = '1';
    }
    
    setEditingState(prev => ({
      ...prev,
      activeField: null,
      inlineEditor: null
    }));
    
    console.log('❌ Edit cancelled');
  }, [editingState.inlineEditor]);

  // Enhanced WordPress communication
  const sendToWordPress = useCallback(async (fieldId: string, value: string, fieldType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const messageId = `save-${Date.now()}`;
      
      const handleResponse = (event: MessageEvent) => {
        if (event.data.type === 'violet-save-response' && event.data.id === messageId) {
          window.removeEventListener('message', handleResponse);
          if (event.data.success) {
            console.log('✅ WordPress save successful');
            resolve();
          } else {
            console.error('❌ WordPress save failed:', event.data.error);
            reject(new Error(event.data.error || 'Save failed'));
          }
        }
      };
      
      window.addEventListener('message', handleResponse);
      
      sendToParent({
        type: 'save-content',
        data: {
          id: messageId,
          fieldId,
          value,
          fieldType
        },
        timestamp: new Date().toISOString(),
        source: 'react-app'
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('Save timeout'));
      }, 10000);
    });
  }, []);

  // Enhanced event listeners
  useEffect(() => {
    if (!config.isEnabled || !editingState.editModeActive) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if click is on an editable field
      for (const [fieldId, element] of fieldElementsRef.current.entries()) {
        if (element === target || element.contains(target)) {
          e.preventDefault();
          e.stopPropagation();
          handleFieldClick(fieldId, element);
          return;
        }
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      if (!editingState.editModeActive) return;
      
      const target = e.target as HTMLElement;
      
      for (const [fieldId, element] of fieldElementsRef.current.entries()) {
        if (element === target || element.contains(target)) {
          handleFieldHover(fieldId);
          return;
        }
      }
      handleFieldHover(null);
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [config.isEnabled, editingState.editModeActive, handleFieldClick, handleFieldHover]);

  // Update visual indicators when state changes
  useEffect(() => {
    addVisualIndicators();
  }, [addVisualIndicators]);

  // Enhanced DOM observer
  useEffect(() => {
    if (config.isEnabled && editingState.editModeActive) {
      scanForFields();
      
      // Set up mutation observer
      observerRef.current = new MutationObserver(() => {
        setTimeout(scanForFields, 100);
      });
      
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    } else {
      // Clear all editing styles
      fieldElementsRef.current.forEach((element) => {
        Object.assign(element.style, {
          outline: '',
          backgroundColor: '',
          cursor: '',
          transition: '',
          opacity: ''
        });
        element.removeAttribute('title');
        delete element.dataset.violetFieldId;
        delete element.dataset.violetEditable;
      });
      fieldElementsRef.current.clear();
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [config.isEnabled, editingState.editModeActive, scanForFields]);

  // Enhanced WordPress message handling
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Enhanced security check
      const allowedDomains = ['violetrainwater.com', 'wp.violetrainwater.com'];
      const originDomain = event.origin.replace(/^https?:\/\//, '');
      
      if (!allowedDomains.some(domain => originDomain.includes(domain))) {
        return;
      }
      
      if (config.debugMode) {
        console.log('📨 Received from WordPress:', event.data);
      }
      
      switch (event.data.type) {
        case 'violet-enable-editing':
          console.log('✏️ WordPress enabled editing mode');
          setEditingState(prev => ({
            ...prev,
            editModeActive: true,
            wordPressConnected: true
          }));
          setConfig(prev => ({ ...prev, isEnabled: true }));
          break;
          
        case 'violet-disable-editing':
          console.log('🔒 WordPress disabled editing mode');
          setEditingState(prev => ({
            ...prev,
            editModeActive: false,
            activeField: null,
            inlineEditor: null,
            hoveredField: null
          }));
          setConfig(prev => ({ ...prev, isEnabled: false }));
          break;
          
        case 'violet-test-access':
          event.source?.postMessage({
            type: 'violet-access-confirmed',
            success: true,
            timestamp: new Date().toISOString(),
            capabilities: [
              'enhanced-field-detection',
              'inline-editing',
              'visual-indicators',
              'optimistic-updates'
            ]
          }, event.origin);
          break;
          
        case 'violet-content-updated':
          // Handle content updates from WordPress
          const { field, newValue } = event.data;
          // Update any matching elements
          fieldElementsRef.current.forEach((element) => {
            const detection = detectFieldType(element, element.textContent || '');
            if (detection.type === field) {
              element.textContent = newValue;
            }
          });
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Enhanced ready signal
    const sendReadySignal = () => {
      sendToParent({
        type: 'iframe-ready',
        data: {
          version: '2.1',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          capabilities: [
            'enhanced-field-detection',
            'inline-editing',
            'visual-indicators',
            'optimistic-updates',
            'performance-management',
            'unsaved-changes-warning'
          ],
          debugMode: config.debugMode
        },
        timestamp: new Date().toISOString(),
        source: 'react-app'
      });
    };
    
    // Send ready signal immediately and after a delay
    sendReadySignal();
    setTimeout(sendReadySignal, 1000);

    return () => window.removeEventListener('message', handleMessage);
  }, [config.debugMode, detectFieldType, sendToParent]);

  // Status metrics
  const statusMetrics = useMemo(() => ({
    totalFields: fieldElementsRef.current.size,
    optimisticUpdates: performanceManager.optimisticUpdateCount,
    pendingSaves: performanceManager.hasPendingChanges ? 1 : 0,
    hasUnsavedChanges: performanceManager.hasOptimisticUpdates || performanceManager.hasPendingChanges,
    isConnected: editingState.wordPressConnected,
    editModeActive: editingState.editModeActive
  }), [performanceManager, editingState.wordPressConnected, editingState.editModeActive]);

  return (
    <>
      {/* Save Status Indicator */}
      <SaveStatusIndicator
        status={performanceManager.saveState.status}
        lastSaved={performanceManager.saveState.lastSaved}
        error={performanceManager.saveState.error}
        pendingChanges={statusMetrics.pendingSaves}
        optimisticUpdates={statusMetrics.optimisticUpdates}
        onRetry={() => {
          if (performanceManager.saveState.status === 'error') {
            window.location.reload();
          }
        }}
      />

      {/* Inline Editor */}
      {editingState.inlineEditor && (
        <InlineEditor
          key={editingState.inlineEditor.fieldId}
          initialValue={editingState.inlineEditor.initialValue}
          fieldType={editingState.inlineEditor.fieldType}
          confidence={editingState.inlineEditor.confidence}
          isMultiline={editingState.inlineEditor.fieldType === 'hero_subtitle' || 
                       editingState.inlineEditor.initialValue.length > 100}
          position={editingState.inlineEditor.position}
          onSave={handleInlineEditorSave}
          onCancel={handleInlineEditorCancel}
        />
      )}

      {/* Enhanced Edit Mode Indicator */}
      {config.isEnabled && editingState.editModeActive && (
        <div className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">✏️</span>
            <span className="font-medium">WordPress Editing Active</span>
          </div>
          <div className="text-xs mt-1 opacity-90">
            {statusMetrics.totalFields} fields • {statusMetrics.isConnected ? 'Connected' : 'Disconnected'}
            {statusMetrics.hasUnsavedChanges && ` • ${statusMetrics.optimisticUpdates + statusMetrics.pendingSaves} pending`}
          </div>
        </div>
      )}

      {/* Debug Info (only in debug mode) */}
      {config.debugMode && (
        <div className="fixed top-4 left-4 z-40 bg-gray-800 text-white p-3 rounded text-xs max-w-xs">
          <div className="font-bold mb-1">Debug Info</div>
          <div>Fields: {statusMetrics.totalFields}</div>
          <div>Connected: {statusMetrics.isConnected ? '✅' : '❌'}</div>
          <div>Edit Mode: {statusMetrics.editModeActive ? '✅' : '❌'}</div>
          <div>In iframe: {window.parent !== window.self ? '✅' : '❌'}</div>
        </div>
      )}
    </>
  );
};

// Default export for compatibility
export default EditingOverlay;