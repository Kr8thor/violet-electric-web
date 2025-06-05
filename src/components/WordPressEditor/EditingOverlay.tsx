// EditingOverlay.tsx - Phase 2 Complete Implementation with Inline Editing
// This integrates Phase 1 enhanced detection with Phase 2 inline editing capabilities

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { EnhancedFieldDetector, FieldDetection } from './EnhancedFieldDetector';
import { InlineEditor } from './InlineEditor';
import { SaveStatusIndicator, useUnsavedChangesWarning } from './SaveStatusIndicator';
import { useContentEditorPerformance } from './PerformanceHooks';

// Types for the editing system
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
}

interface EditingConfig {
  isEnabled: boolean;
  detectedFields: Map<HTMLElement, FieldDetection>;
  scanInProgress: boolean;
}

interface PerformanceState {
  optimisticUpdates: Map<string, { original: string; current: string; timestamp: Date }>;
  pendingSaves: Set<string>;
  saveQueue: Array<{ fieldId: string; value: string; fieldType: string }>;
}

// Main EditingOverlay Component - Phase 2 Complete
export const EditingOverlay: React.FC = () => {
  // Core state
  const [config, setConfig] = useState<EditingConfig>({
    isEnabled: false,
    detectedFields: new Map(),
    scanInProgress: false
  });
  
  const [editingState, setEditingState] = useState<EditingState>({
    activeField: null,
    inlineEditor: null,
    hoveredField: null
  });

  // Refs
  const detectorRef = useRef<EnhancedFieldDetector>();
  const fieldElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const scanTimeoutRef = useRef<NodeJS.Timeout>();
  const observerRef = useRef<MutationObserver>();

  // Performance management with integrated hooks
  const performanceManager = useContentEditorPerformance(
    async (data: { fieldId: string; value: string; fieldType: string }) => {
      // Send to WordPress
      await saveToWordPress(data.fieldId, data.value, data.fieldType);
      performanceManager.confirmSave(data.fieldId);
    },
    1000 // 1 second debounce
  );

  // Unsaved changes warning
  useUnsavedChangesWarning(
    performanceManager.hasOptimisticUpdates || performanceManager.hasPendingChanges
  );

  // Initialize detector
  useEffect(() => {
    detectorRef.current = new EnhancedFieldDetector();
  }, []);

  // Enhanced Field Detection (expanded from Phase 1)
  const detectFieldType = useCallback((element: HTMLElement, text: string): FieldDetection => {
    if (!detectorRef.current) {
      return {
        type: 'unknown',
        confidence: 0,
        priority: 'low',
        editStrategy: 'inline',
        description: 'Detector not initialized'
      };
    }
    return detectorRef.current.detectField(element);
  }, []);

  // Get visual styling based on priority and confidence
  const getVisualStyling = useCallback((priority: string, confidence: number, isHovered: boolean) => {
    const baseOpacity = isHovered ? 0.8 : Math.min(0.6, confidence + 0.2);
    const hoverOpacity = isHovered ? 0.2 : 0.05;
    
    const colors = {
      high: { border: '239, 68, 68', bg: '239, 68, 68' }, // red
      medium: { border: '245, 158, 11', bg: '245, 158, 11' }, // amber
      low: { border: '59, 130, 246', bg: '59, 130, 246' } // blue
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

  // Scan for editable fields
  const scanForFields = useCallback(() => {
    if (!config.isEnabled || !detectorRef.current) return;

    setConfig(prev => ({ ...prev, scanInProgress: true }));

    try {
      const detections = detectorRef.current.detectAllFields();
      
      // Process detected fields
      fieldElementsRef.current.clear();
      let index = 0;
      detections.forEach((detection, element) => {
        const fieldId = `field-${index}-${Date.now()}`;
        fieldElementsRef.current.set(fieldId, element);
        index++;
      });

      setConfig(prev => ({
        ...prev,
        detectedFields: detections,
        scanInProgress: false
      }));

      console.log(`Phase 2: Detected ${detections.size} editable fields`);

    } catch (error) {
      console.error('Field detection error:', error);
      setConfig(prev => ({ ...prev, scanInProgress: false }));
    }
  }, [config.isEnabled]);

  // Add visual indicators to elements
  const addVisualIndicators = useCallback(() => {
    if (!config.isEnabled) return;

    fieldElementsRef.current.forEach((element, fieldId) => {
      const text = element.textContent?.trim() || '';
      const detection = detectFieldType(element, text);
      const isHovered = editingState.hoveredField === fieldId;
      const isActive = editingState.activeField === fieldId;
      
      // Remove existing styles
      Object.assign(element.style, {
        outline: '',
        backgroundColor: '',
        cursor: '',
        transition: ''
      });
      
      // Don't style active inline editing field
      if (isActive && editingState.inlineEditor) {
        return;
      }
      
      // Apply visual styling
      const styling = getVisualStyling(detection.priority, detection.confidence, isHovered);
      Object.assign(element.style, styling);
      
      // Add tooltip on hover
      if (isHovered) {
        element.title = `✏️ ${detection.description} (${Math.round(detection.confidence * 100)}% confidence)`;
      } else {
        element.removeAttribute('title');
      }
    });
  }, [config.isEnabled, editingState.hoveredField, editingState.activeField, detectFieldType, getVisualStyling]);

  // Event handlers
  const handleFieldHover = useCallback((fieldId: string | null) => {
    setEditingState(prev => ({
      ...prev,
      hoveredField: fieldId
    }));
  }, []);

  const handleFieldClick = useCallback((fieldId: string, element: HTMLElement) => {
    const text = element.textContent?.trim() || '';
    const detection = detectFieldType(element, text);
    
    console.log('Field clicked:', { fieldId, type: detection.type, strategy: detection.editStrategy, text });
    
    if (detection.editStrategy === 'modal') {
      // Send to WordPress for modal editing
      sendToWordPress('open-modal-editor', {
        fieldId,
        fieldType: detection.type,
        content: text,
        confidence: detection.confidence
      });
      return;
    }
    
    if (detection.editStrategy === 'specialized') {
      // Send to WordPress for specialized editing
      sendToWordPress('open-specialized-editor', {
        fieldId,
        fieldType: detection.type,
        element: element.outerHTML,
        confidence: detection.confidence
      });
      return;
    }
    
    // Inline editing - Phase 2 feature
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
    
    // Hide the original element
    element.style.opacity = '0.2';
    
  }, [detectFieldType]);

  // Inline editor handlers
  const handleInlineEditorSave = useCallback(async (newValue: string) => {
    if (!editingState.inlineEditor) return;
    
    const { fieldId, element, initialValue, fieldType } = editingState.inlineEditor;
    
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
  }, [editingState.inlineEditor]);

  // WordPress communication
  const sendToWordPress = useCallback((action: string, data: any) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: `violet-${action}`,
        data
      }, '*');
    }
  }, []);

  const saveToWordPress = useCallback(async (fieldId: string, value: string, fieldType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const messageId = `save-${Date.now()}`;
      
      const handleResponse = (event: MessageEvent) => {
        if (event.data.type === 'violet-save-response' && event.data.id === messageId) {
          window.removeEventListener('message', handleResponse);
          if (event.data.success) {
            resolve();
          } else {
            reject(new Error(event.data.error || 'Save failed'));
          }
        }
      };
      
      window.addEventListener('message', handleResponse);
      
      sendToWordPress('save-content', {
        id: messageId,
        fieldId,
        value,
        fieldType
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('Save timeout'));
      }, 10000);
    });
  }, [sendToWordPress]);

  // Set up event listeners
  useEffect(() => {
    if (!config.isEnabled) return;

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
  }, [config.isEnabled, handleFieldClick, handleFieldHover]);

  // Update visual indicators when state changes
  useEffect(() => {
    addVisualIndicators();
  }, [addVisualIndicators]);

  // Scan for fields when editing is enabled
  useEffect(() => {
    if (config.isEnabled) {
      scanForFields();
      // Set up mutation observer to re-scan when DOM changes
      observerRef.current = new MutationObserver(() => {
        setTimeout(scanForFields, 100); // Debounce
      });
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      // Clear visual indicators
      fieldElementsRef.current.forEach((element) => {
        Object.assign(element.style, {
          outline: '',
          backgroundColor: '',
          cursor: '',
          transition: ''
        });
        element.removeAttribute('title');
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
  }, [config.isEnabled, scanForFields]);

  // Listen for WordPress messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      switch (event.data.type) {
        case 'violet-enable-edit-mode':
          setConfig(prev => ({ ...prev, isEnabled: true }));
          break;
        case 'violet-disable-edit-mode':
          setConfig(prev => ({ ...prev, isEnabled: false }));
          setEditingState({
            activeField: null,
            inlineEditor: null,
            hoveredField: null
          });
          break;
        case 'violet-get-status':
          sendToWordPress('status-response', {
            editingEnabled: config.isEnabled,
            fieldsDetected: fieldElementsRef.current.size,
            optimisticUpdates: performanceManager.optimisticUpdateCount,
            pendingSaves: performanceManager.hasPendingChanges ? 1 : 0
          });
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Announce readiness
    sendToWordPress('iframe-ready', {
      version: '2.0',
      capabilities: [
        'enhanced-field-detection',
        'inline-editing',
        'modal-editing',
        'specialized-editing',
        'optimistic-updates',
        'debounced-saving',
        'visual-indicators'
      ]
    });

    return () => window.removeEventListener('message', handleMessage);
  }, [config.isEnabled, performanceManager, sendToWordPress]);

  // Calculate status metrics
  const statusMetrics = useMemo(() => ({
    totalFields: fieldElementsRef.current.size,
    optimisticUpdates: performanceManager.optimisticUpdateCount,
    pendingSaves: performanceManager.hasPendingChanges ? 1 : 0,
    hasUnsavedChanges: performanceManager.hasOptimisticUpdates || performanceManager.hasPendingChanges
  }), [performanceManager]);

  return (
    <>
      {/* Save Status Indicator - Phase 2 Feature */}
      <SaveStatusIndicator
        status={performanceManager.saveState.status}
        lastSaved={performanceManager.saveState.lastSaved}
        error={performanceManager.saveState.error}
        pendingChanges={statusMetrics.pendingSaves}
        optimisticUpdates={statusMetrics.optimisticUpdates}
        onRetry={() => {
          // Retry last failed save
          if (performanceManager.saveState.status === 'error') {
            window.location.reload();
          }
        }}
      />

      {/* Inline Editor - Phase 2 Feature */}
      {editingState.inlineEditor && (
        <InlineEditor
          key={editingState.inlineEditor.fieldId}
          initialValue={editingState.inlineEditor.initialValue}
          fieldType={editingState.inlineEditor.fieldType}
          confidence={editingState.inlineEditor.confidence}
          isMultiline={editingState.inlineEditor.fieldType === 'rich_text' || 
                       editingState.inlineEditor.initialValue.length > 100}
          position={editingState.inlineEditor.position}
          onSave={handleInlineEditorSave}
          onCancel={handleInlineEditorCancel}
        />
      )}

      {/* Edit Mode Indicator - Enhanced for Phase 2 */}
      {config.isEnabled && (
        <div className="fixed bottom-4 left-4 z-40 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">🟢</span>
            <span className="font-medium">Phase 2: Inline Editing Active</span>
          </div>
          <div className="text-xs mt-1 opacity-80">
            {statusMetrics.totalFields} fields detected
            {statusMetrics.hasUnsavedChanges && ` • ${statusMetrics.optimisticUpdates + statusMetrics.pendingSaves} pending`}
          </div>
        </div>
      )}
    </>
  );
};

// Default export for compatibility
export default EditingOverlay;