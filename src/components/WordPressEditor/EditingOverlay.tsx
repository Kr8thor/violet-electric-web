// EditingOverlay.tsx - Phase 1 Enhanced Field Detection Implementation
// Complete implementation with visual indicators, confidence scoring, and smart detection

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { EnhancedFieldDetector, FieldDetection } from './EnhancedFieldDetector';

interface EditingState {
  isEnabled: boolean;
  hoveredField: HTMLElement | null;
  selectedField: HTMLElement | null;
  detectedFields: Map<HTMLElement, FieldDetection>;
  scanInProgress: boolean;
}

interface EditingStats {
  totalFields: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  fieldTypes: Record<string, number>;
}

export const EditingOverlay: React.FC = () => {
  const [editingState, setEditingState] = useState<EditingState>({
    isEnabled: false,
    hoveredField: null,
    selectedField: null,
    detectedFields: new Map(),
    scanInProgress: false
  });

  const [stats, setStats] = useState<EditingStats>({
    totalFields: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    fieldTypes: {}
  });

  const detectorRef = useRef<EnhancedFieldDetector>();
  const scanTimeoutRef = useRef<NodeJS.Timeout>();
  const observerRef = useRef<MutationObserver>();

  // Initialize detector
  useEffect(() => {
    detectorRef.current = new EnhancedFieldDetector();
  }, []);

  // Get priority-based styling
  const getPriorityColor = useCallback((priority: string, confidence: number, isHovered: boolean = false): string => {
    const intensity = isHovered ? 0.8 : Math.min(0.6, confidence + 0.1);
    
    const colors = {
      high: `rgba(239, 68, 68, ${intensity})`,    // Red for high priority
      medium: `rgba(245, 158, 11, ${intensity})`, // Amber for medium priority  
      low: `rgba(59, 130, 246, ${intensity})`     // Blue for low priority
    };
    
    return colors[priority as keyof typeof colors] || colors.low;
  }, []);

  // Get background color for hover effect
  const getHoverBackgroundColor = useCallback((priority: string): string => {
    const colors = {
      high: 'rgba(239, 68, 68, 0.1)',
      medium: 'rgba(245, 158, 11, 0.1)', 
      low: 'rgba(59, 130, 246, 0.1)'
    };
    
    return colors[priority as keyof typeof colors] || colors.low;
  }, []);

  // Scan for editable fields
  const scanForFields = useCallback(async () => {
    if (!detectorRef.current || editingState.scanInProgress) return;

    setEditingState(prev => ({ ...prev, scanInProgress: true }));

    // Small delay to allow UI update
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const detections = detectorRef.current.detectAllFields();
      
      // Calculate stats
      const newStats: EditingStats = {
        totalFields: detections.size,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        fieldTypes: {}
      };

      detections.forEach((detection) => {
        // Count by priority
        switch (detection.priority) {
          case 'high': newStats.highPriority++; break;
          case 'medium': newStats.mediumPriority++; break;
          case 'low': newStats.lowPriority++; break;
        }
        
        // Count by type
        newStats.fieldTypes[detection.type] = (newStats.fieldTypes[detection.type] || 0) + 1;
      });

      setEditingState(prev => ({
        ...prev,
        detectedFields: detections,
        scanInProgress: false
      }));
      
      setStats(newStats);

      console.log('Phase 1 Field Detection Complete:', {
        totalFields: newStats.totalFields,
        priorities: {
          high: newStats.highPriority,
          medium: newStats.mediumPriority,
          low: newStats.lowPriority
        },
        types: newStats.fieldTypes
      });

    } catch (error) {
      console.error('Field detection error:', error);
      setEditingState(prev => ({ ...prev, scanInProgress: false }));
    }
  }, [editingState.scanInProgress]);

  // Apply visual indicators to detected fields
  const applyVisualIndicators = useCallback(() => {
    if (!editingState.isEnabled) return;

    editingState.detectedFields.forEach((detection, element) => {
      const isHovered = editingState.hoveredField === element;
      const isSelected = editingState.selectedField === element;
      
      // Clear existing styles
      element.style.outline = '';
      element.style.backgroundColor = '';
      element.style.cursor = '';
      element.style.transition = '';
      element.removeAttribute('title');

      if (isSelected) {
        // Selected state - solid outline
        element.style.outline = `3px solid ${getPriorityColor(detection.priority, detection.confidence, true)}`;
        element.style.backgroundColor = getHoverBackgroundColor(detection.priority);
      } else if (isHovered) {
        // Hover state - enhanced styling
        element.style.outline = `3px solid ${getPriorityColor(detection.priority, detection.confidence, true)}`;
        element.style.backgroundColor = getHoverBackgroundColor(detection.priority);
        element.style.cursor = 'pointer';
        element.title = `✏️ ${detection.description} (${Math.round(detection.confidence * 100)}% confidence)`;
      } else {
        // Default editable state - dashed outline
        element.style.outline = `2px dashed ${getPriorityColor(detection.priority, detection.confidence)}`;
        element.style.cursor = 'pointer';
      }
      
      element.style.transition = 'all 0.2s ease-in-out';
    });
  }, [editingState.isEnabled, editingState.hoveredField, editingState.selectedField, editingState.detectedFields, getPriorityColor, getHoverBackgroundColor]);

  // Clear all visual indicators
  const clearVisualIndicators = useCallback(() => {
    editingState.detectedFields.forEach((_, element) => {
      element.style.outline = '';
      element.style.backgroundColor = '';
      element.style.cursor = '';
      element.style.transition = '';
      element.removeAttribute('title');
    });
  }, [editingState.detectedFields]);

  // Handle field interactions
  const handleFieldHover = useCallback((element: HTMLElement | null) => {
    setEditingState(prev => ({
      ...prev,
      hoveredField: element
    }));
  }, []);

  const handleFieldClick = useCallback((element: HTMLElement) => {
    const detection = editingState.detectedFields.get(element);
    if (!detection) return;

    setEditingState(prev => ({
      ...prev,
      selectedField: element
    }));

    console.log('Field selected:', {
      type: detection.type,
      priority: detection.priority,
      strategy: detection.editStrategy,
      confidence: detection.confidence,
      text: element.textContent?.substring(0, 50) + '...'
    });

    // Send to WordPress based on edit strategy
    if (detection.editStrategy === 'modal') {
      sendToWordPress('open-modal-editor', {
        fieldType: detection.type,
        content: element.textContent || '',
        confidence: detection.confidence,
        element: element.outerHTML
      });
    } else if (detection.editStrategy === 'specialized') {
      sendToWordPress('open-specialized-editor', {
        fieldType: detection.type,
        element: element.outerHTML,
        confidence: detection.confidence
      });
    } else {
      // Phase 2 will handle inline editing
      sendToWordPress('prepare-inline-edit', {
        fieldType: detection.type,
        content: element.textContent || '',
        confidence: detection.confidence
      });
    }
  }, [editingState.detectedFields]);

  // WordPress communication
  const sendToWordPress = useCallback((action: string, data: any) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: `violet-${action}`,
        data: {
          ...data,
          timestamp: Date.now(),
          version: 'phase1'
        }
      }, '*');
      console.log(`Sent to WordPress: ${action}`, data);
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!editingState.isEnabled) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Find if target is a detected field
      for (const [element] of editingState.detectedFields) {
        if (element === target || element.contains(target)) {
          handleFieldHover(element);
          return;
        }
      }
      handleFieldHover(null);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Find if target is a detected field
      for (const [element] of editingState.detectedFields) {
        if (element === target || element.contains(target)) {
          e.preventDefault();
          e.stopPropagation();
          handleFieldClick(element);
          return;
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingState(prev => ({
          ...prev,
          selectedField: null,
          hoveredField: null
        }));
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('click', handleClick, true);  
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingState.isEnabled, editingState.detectedFields, handleFieldHover, handleFieldClick]);

  // Apply/clear visual indicators based on editing state
  useEffect(() => {
    if (editingState.isEnabled) {
      applyVisualIndicators();
    } else {
      clearVisualIndicators();
    }
  }, [editingState.isEnabled, applyVisualIndicators, clearVisualIndicators]);

  // Debounced re-scan when DOM changes
  useEffect(() => {
    if (!editingState.isEnabled) return;

    observerRef.current = new MutationObserver(() => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      
      scanTimeoutRef.current = setTimeout(() => {
        scanForFields();
      }, 500); // 500ms debounce
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [editingState.isEnabled, scanForFields]);

  // Initial scan when editing is enabled
  useEffect(() => {
    if (editingState.isEnabled && editingState.detectedFields.size === 0) {
      scanForFields();
    }
  }, [editingState.isEnabled, editingState.detectedFields.size, scanForFields]);

  // Listen for WordPress messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      switch (event.data.type) {
        case 'violet-enable-edit-mode':
          setEditingState(prev => ({ ...prev, isEnabled: true }));
          break;
          
        case 'violet-disable-edit-mode':
          setEditingState(prev => ({
            ...prev,
            isEnabled: false,
            hoveredField: null,
            selectedField: null
          }));
          break;
          
        case 'violet-rescan-fields':
          scanForFields();
          break;
          
        case 'violet-get-stats':
          sendToWordPress('stats-response', {
            stats,
            editingEnabled: editingState.isEnabled,
            detectedFieldsCount: editingState.detectedFields.size
          });
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Announce Phase 1 readiness
    sendToWordPress('iframe-ready', {
      version: 'phase1',
      capabilities: [
        'enhanced-field-detection',
        'priority-based-styling',
        'confidence-scoring',
        'smart-edit-strategies',
        'real-time-scanning'
      ],
      supportedFieldTypes: Object.keys(stats.fieldTypes),
      detectionEngine: 'enhanced-v1'
    });

    return () => window.removeEventListener('message', handleMessage);
  }, [stats, editingState.isEnabled, editingState.detectedFields.size, scanForFields, sendToWordPress]);

  return (
    <>
      {/* Phase 1 Status Indicator */}
      {editingState.isEnabled && (
        <div className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg min-w-64">
          <div className="flex items-center gap-2 mb-2">
            <span className="animate-pulse">🔍</span>
            <span className="font-bold">Phase 1: Enhanced Detection Active</span>
          </div>
          
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Total Fields:</span>
              <span className="font-medium">{stats.totalFields}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-red-200">High Priority:</span>
              <span className="font-medium">{stats.highPriority}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-yellow-200">Medium Priority:</span>
              <span className="font-medium">{stats.mediumPriority}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-blue-200">Low Priority:</span>
              <span className="font-medium">{stats.lowPriority}</span>
            </div>
          </div>

          {editingState.scanInProgress && (
            <div className="mt-2 text-xs opacity-80 flex items-center gap-2">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              Scanning for fields...
            </div>
          )}
        </div>
      )}

      {/* Field Type Legend */}
      {editingState.isEnabled && stats.totalFields > 0 && (
        <div className="fixed top-4 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
          <div className="text-sm font-bold mb-2 text-gray-800">Field Type Legend</div>
          
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-red-500 border-dashed rounded"></div>
              <span>High Priority (Modal/Specialized)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-500 border-dashed rounded"></div>
              <span>Medium Priority (Mixed)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-dashed rounded"></div>
              <span>Low Priority (Inline Ready)</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
            Hover for details • Click to edit
          </div>
        </div>
      )}

      {/* Selected Field Info */}
      {editingState.selectedField && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
          {(() => {
            const detection = editingState.detectedFields.get(editingState.selectedField);
            if (!detection) return null;
            
            return (
              <>
                <div className="font-bold mb-2">Selected Field</div>
                <div className="text-sm space-y-1">
                  <div><strong>Type:</strong> {detection.type}</div>
                  <div><strong>Priority:</strong> {detection.priority}</div>
                  <div><strong>Strategy:</strong> {detection.editStrategy}</div>
                  <div><strong>Confidence:</strong> {Math.round(detection.confidence * 100)}%</div>
                  <div><strong>Content:</strong> "{editingState.selectedField.textContent?.substring(0, 50)}..."</div>
                </div>
                
                <button
                  onClick={() => setEditingState(prev => ({ ...prev, selectedField: null }))}
                  className="mt-2 text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
                >
                  Close
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Scan Progress Indicator */}
      {editingState.scanInProgress && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Scanning for editable fields...</span>
          </div>
        </div>
      )}
    </>
  );
};

// Default export for compatibility
export default EditingOverlay;