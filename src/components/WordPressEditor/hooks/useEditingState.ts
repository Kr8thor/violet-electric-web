
import { useState, useRef } from 'react';

export interface EditingState {
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

export interface EditingConfig {
  isEnabled: boolean;
  detectedFields: Map<HTMLElement, any>;
  scanInProgress: boolean;
  debugMode: boolean;
}

export const useEditingState = () => {
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

  const fieldElementsRef = useRef<Map<string, HTMLElement>>(new Map());

  return {
    config,
    setConfig,
    editingState,
    setEditingState,
    fieldElementsRef
  };
};
