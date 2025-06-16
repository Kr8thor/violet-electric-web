import React, { useCallback } from 'react';

// Local FieldDetection interface
export interface FieldDetection {
  type: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  editStrategy: 'inline' | 'modal' | 'specialized';
  description: string;
}

interface FieldDetectorProps {
  isEnabled: boolean;
  editModeActive: boolean;
  onFieldsDetected: (fields: Map<HTMLElement, FieldDetection>) => void;
  onFieldElementsUpdated: (elements: Map<string, HTMLElement>) => void;
}

export const FieldDetector: React.FC<FieldDetectorProps> = ({
  isEnabled,
  editModeActive,
  onFieldsDetected,
  onFieldElementsUpdated
}) => {
  const detectFieldType = useCallback((element: HTMLElement, text: string): FieldDetection => {
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

  const scanForFields = useCallback(() => {
    if (!isEnabled) return;

    try {
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
      const fieldElements = new Map<string, HTMLElement>();
      
      let fieldIndex = 0;
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement;
          const text = htmlElement.textContent?.trim() || '';
          
          if (text && 
              text.length > 2 && 
              text.length < 500 && 
              !htmlElement.querySelector('img, svg, iframe, video') &&
              !htmlElement.closest('script, style, noscript, .violet-ignore, .violet-editing-indicator') &&
              !htmlElement.dataset.violetEditable &&
              !htmlElement.classList.contains('violet-ignore')) {
            
            const detection = detectFieldType(htmlElement, text);
            
            if (detection.confidence > 0.3) {
              const fieldId = `field-${fieldIndex}-${Date.now()}`;
              fieldElements.set(fieldId, htmlElement);
              newFieldMap.set(htmlElement, detection);
              htmlElement.dataset.violetFieldId = fieldId;
              htmlElement.dataset.violetEditable = 'true';
              fieldIndex++;
            }
          }
        });
      });

      onFieldsDetected(newFieldMap);
      onFieldElementsUpdated(fieldElements);

      console.log(`✅ Detected ${newFieldMap.size} editable fields`);

    } catch (error) {
      console.error('❌ Field detection error:', error);
    }
  }, [isEnabled, detectFieldType, onFieldsDetected, onFieldElementsUpdated]);

  // Auto-scan when conditions change
  React.useEffect(() => {
    if (isEnabled && editModeActive) {
      scanForFields();
    }
  }, [isEnabled, editModeActive, scanForFields]);

  return null; // This is a logic-only component
};
