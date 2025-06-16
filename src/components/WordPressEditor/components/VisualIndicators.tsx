
import React, { useCallback } from 'react';

interface VisualIndicatorsProps {
  isEnabled: boolean;
  editModeActive: boolean;
  hoveredField: string | null;
  activeField: string | null;
  inlineEditor: any;
  fieldElements: Map<string, HTMLElement>;
  detectFieldType: (element: HTMLElement, text: string) => any;
}

export const VisualIndicators: React.FC<VisualIndicatorsProps> = ({
  isEnabled,
  editModeActive,
  hoveredField,
  activeField,
  inlineEditor,
  fieldElements,
  detectFieldType
}) => {
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
      high: { border: '0, 115, 170', bg: '0, 115, 170' },
      medium: { border: '245, 158, 11', bg: '245, 158, 11' },
      low: { border: '107, 114, 128', bg: '107, 114, 128' }
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

  const addVisualIndicators = useCallback(() => {
    if (!isEnabled || !editModeActive) return;

    fieldElements.forEach((element, fieldId) => {
      const text = element.textContent?.trim() || '';
      const detection = detectFieldType(element, text);
      const isHovered = hoveredField === fieldId;
      const isActive = activeField === fieldId;
      
      // Skip if inline editing is active
      if (isActive && inlineEditor) {
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
  }, [isEnabled, editModeActive, hoveredField, activeField, inlineEditor, fieldElements, detectFieldType, getVisualStyling]);

  // Update visual indicators when state changes
  React.useEffect(() => {
    addVisualIndicators();
  }, [addVisualIndicators]);

  // Clear indicators when disabled
  React.useEffect(() => {
    if (!isEnabled || !editModeActive) {
      fieldElements.forEach((element) => {
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
    }
  }, [isEnabled, editModeActive, fieldElements]);

  return null; // This is a logic-only component
};
