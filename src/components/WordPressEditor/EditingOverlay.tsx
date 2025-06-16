
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { EnhancedFieldDetector, FieldDetection } from './EnhancedFieldDetector';
import { InlineEditor } from './InlineEditor';
import { SaveStatusIndicator, useUnsavedChangesWarning } from './SaveStatusIndicator';
import { useContentEditorPerformance } from './PerformanceHooks';
import { useEditingState } from './hooks/useEditingState';
import { FieldDetector } from './components/FieldDetector';
import { VisualIndicators } from './components/VisualIndicators';
import { WordPressMessageHandler } from './utils/wordPressMessageHandler';

export const EditingOverlay: React.FC = () => {
  const {
    config,
    setConfig,
    editingState,
    setEditingState,
    fieldElementsRef
  } = useEditingState();

  // Performance management
  const performanceManager = useContentEditorPerformance(
    async (data: { fieldId: string; value: string; fieldType: string }) => {
      await messageHandler.saveToWordPress(data.fieldId, data.value, data.fieldType);
      performanceManager.confirmSave(data.fieldId);
    },
    1000
  );

  // Unsaved changes warning
  useUnsavedChangesWarning(
    performanceManager.hasOptimisticUpdates || performanceManager.hasPendingChanges
  );

  // WordPress message handler
  const messageHandlerRef = useRef<WordPressMessageHandler>();
  const observerRef = useRef<MutationObserver>();

  // Initialize message handler
  useEffect(() => {
    messageHandlerRef.current = new WordPressMessageHandler(config.debugMode);
    
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

  const messageHandler = messageHandlerRef.current!;

  // Field detection callback
  const handleFieldsDetected = useCallback((fields: Map<HTMLElement, FieldDetection>) => {
    setConfig(prev => ({
      ...prev,
      detectedFields: fields,
      scanInProgress: false
    }));
  }, [setConfig]);

  const handleFieldElementsUpdated = useCallback((elements: Map<string, HTMLElement>) => {
    fieldElementsRef.current = elements;
  }, [fieldElementsRef]);

  // Field detection utility
  const detectFieldType = useCallback((element: HTMLElement, text: string): FieldDetection => {
    const tagName = element.tagName.toLowerCase();
    const textLower = text.toLowerCase();
    const classes = element.className.toLowerCase();

    // Use the same detection logic as before
    if (tagName === 'h1' || textLower.includes('change the channel')) {
      return {
        type: 'hero_title',
        confidence: 0.95,
        priority: 'high',
        editStrategy: 'inline',
        description: 'Main hero title'
      };
    }

    return {
      type: 'generic_text',
      confidence: 0.6,
      priority: 'low',
      editStrategy: 'inline',
      description: 'General text content'
    };
  }, []);

  // Event handlers
  const handleFieldHover = useCallback((fieldId: string | null) => {
    setEditingState(prev => ({
      ...prev,
      hoveredField: fieldId
    }));
  }, [setEditingState]);

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
    
    element.style.opacity = '0.3';
    
    messageHandler.sendToWordPress('edit-request', {
      fieldId,
      fieldType: detection.type,
      text,
      confidence: detection.confidence,
      element: element.tagName
    });
  }, [editingState.editModeActive, detectFieldType, setEditingState, messageHandler]);

  // Inline editor handlers
  const handleInlineEditorSave = useCallback(async (newValue: string) => {
    if (!editingState.inlineEditor) return;
    
    const { fieldId, element, initialValue, fieldType } = editingState.inlineEditor;
    
    console.log('💾 Saving content:', { fieldId, fieldType, newValue });
    
    performanceManager.updateContent(fieldId, newValue, initialValue, fieldType);
    
    element.textContent = newValue;
    element.style.opacity = '1';
    
    setEditingState(prev => ({
      ...prev,
      activeField: null,
      inlineEditor: null
    }));
    
    messageHandler.sendToWordPress('save-content', {
      fieldId,
      fieldType,
      value: newValue,
      originalValue: initialValue
    });
  }, [editingState.inlineEditor, performanceManager, setEditingState, messageHandler]);

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
  }, [editingState.inlineEditor, setEditingState]);

  // Event listeners
  useEffect(() => {
    if (!config.isEnabled || !editingState.editModeActive) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
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

  // WordPress message handling
  useEffect(() => {
    const handleEnableEditing = () => {
      setEditingState(prev => ({
        ...prev,
        editModeActive: true,
        wordPressConnected: true
      }));
      setConfig(prev => ({ ...prev, isEnabled: true }));
    };

    const handleDisableEditing = () => {
      setEditingState(prev => ({
        ...prev,
        editModeActive: false,
        activeField: null,
        inlineEditor: null,
        hoveredField: null
      }));
      setConfig(prev => ({ ...prev, isEnabled: false }));
    };

    const handleContentUpdated = (data: any) => {
      const { field, newValue } = data;
      fieldElementsRef.current.forEach((element) => {
        const detection = detectFieldType(element, element.textContent || '');
        if (detection.type === field) {
          element.textContent = newValue;
        }
      });
    };

    const messageHandler = messageHandlerRef.current?.createMessageHandler(
      handleEnableEditing,
      handleDisableEditing,
      handleContentUpdated
    );

    if (messageHandler) {
      window.addEventListener('message', messageHandler);
      messageHandlerRef.current?.sendReadySignal();
    }

    return () => {
      if (messageHandler) {
        window.removeEventListener('message', messageHandler);
      }
    };
  }, [setConfig, setEditingState, detectFieldType]);

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
      {/* Field Detection Component */}
      <FieldDetector
        isEnabled={config.isEnabled}
        editModeActive={editingState.editModeActive}
        onFieldsDetected={handleFieldsDetected}
        onFieldElementsUpdated={handleFieldElementsUpdated}
      />

      {/* Visual Indicators Component */}
      <VisualIndicators
        isEnabled={config.isEnabled}
        editModeActive={editingState.editModeActive}
        hoveredField={editingState.hoveredField}
        activeField={editingState.activeField}
        inlineEditor={editingState.inlineEditor}
        fieldElements={fieldElementsRef.current}
        detectFieldType={detectFieldType}
      />

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

export default EditingOverlay;
