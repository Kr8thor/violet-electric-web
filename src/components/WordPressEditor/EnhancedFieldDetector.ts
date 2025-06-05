// EnhancedFieldDetector.ts - Phase 1 Enhanced Field Detection System
// Complete implementation with 15+ field types, confidence scoring, and priority classification

export interface FieldDetection {
  type: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  editStrategy: 'inline' | 'modal' | 'specialized';
  description: string;
  metadata?: {
    elementTag: string;
    textLength: number;
    hasSpecialChars: boolean;
    parentContext?: string;
    cssClasses: string[];
  };
}

export interface DetectionContext {
  element: HTMLElement;
  text: string;
  tagName: string;
  classList: string[];
  parentClasses: string[];
  computedStyle: CSSStyleDeclaration;
  position: {
    isHeader: boolean;
    isFooter: boolean;
    isNavigation: boolean;
    isMain: boolean;
    depth: number;
  };
}

export class EnhancedFieldDetector {
  private detectionRules: Array<{
    type: string;
    detector: (context: DetectionContext) => number;
    priority: 'high' | 'medium' | 'low';
    editStrategy: 'inline' | 'modal' | 'specialized';
    description: string;
  }> = [];

  constructor() {
    this.initializeDetectionRules();
  }

  private initializeDetectionRules() {
    // HIGH PRIORITY FIELDS - Critical content requiring specialized handling
    this.addRule({
      type: 'hero_title',
      priority: 'high',
      editStrategy: 'modal',
      description: 'Main hero title - use WordPress editor',
      detector: (context) => {
        const { text, tagName, element } = context;
        let confidence = 0;

        // Primary hero indicators
        if (text.toLowerCase().includes('change the channel on your future')) return 0.98;
        if (text.toLowerCase().includes('change the channel')) confidence += 0.7;
        
        // Structural indicators
        if (tagName === 'h1') confidence += 0.4;
        if (tagName.match(/^h[1-2]$/)) confidence += 0.3;
        
        // Position indicators
        if (context.position.isHeader) confidence += 0.3;
        if (context.position.depth <= 3) confidence += 0.2;
        
        // Content characteristics
        if (text.length > 20 && text.length < 100) confidence += 0.2;
        if (text.includes('future') || text.includes('potential')) confidence += 0.1;
        
        // Visual prominence
        const fontSize = parseFloat(context.computedStyle.fontSize);
        if (fontSize > 24) confidence += 0.2;
        if (fontSize > 32) confidence += 0.3;

        return Math.min(confidence, 0.95);
      }
    });

    this.addRule({
      type: 'hero_subtitle',
      priority: 'high',
      editStrategy: 'modal',
      description: 'Hero subtitle - use WordPress editor',
      detector: (context) => {
        const { text, tagName } = context;
        let confidence = 0;

        // Primary subtitle indicators
        if (text.toLowerCase().includes('transform your potential')) return 0.95;
        if (text.toLowerCase().includes('transform')) confidence += 0.6;
        
        // Structural indicators
        if (tagName.match(/^h[2-4]$/)) confidence += 0.3;
        if (tagName === 'p' && context.position.isHeader) confidence += 0.2;
        
        // Content characteristics
        if (text.length > 30 && text.length < 200) confidence += 0.2;
        if (text.includes('potential') || text.includes('power') || text.includes('life')) confidence += 0.1;
        
        // Position relative to hero title
        const heroTitle = document.querySelector('h1');
        if (heroTitle && this.isNearElement(context.element, heroTitle)) confidence += 0.3;

        return Math.min(confidence, 0.95);
      }
    });

    this.addRule({
      type: 'hero_image',
      priority: 'high',
      editStrategy: 'specialized',
      description: 'Hero image - use media library',
      detector: (context) => {
        const { element, tagName } = context;
        let confidence = 0;

        if (tagName === 'img') confidence += 0.8;
        if (element.querySelector('img')) confidence += 0.7;
        
        // Hero section indicators
        if (context.position.isHeader) confidence += 0.3;
        if (context.classList.some(c => c.includes('hero'))) confidence += 0.2;
        if (context.classList.some(c => c.includes('banner'))) confidence += 0.2;
        
        // Size indicators for hero images
        const rect = element.getBoundingClientRect();
        if (rect.width > 300 && rect.height > 200) confidence += 0.2;

        return Math.min(confidence, 0.9);
      }
    });

    this.addRule({
      type: 'hero_cta',
      priority: 'medium',
      editStrategy: 'modal',
      description: 'Call-to-action button - use modal editor',
      detector: (context) => {
        const { text, tagName, classList } = context;
        let confidence = 0;

        // CTA text indicators
        const ctaWords = ['book', 'get started', 'contact', 'learn more', 'sign up', 'try now', 'download'];
        if (ctaWords.some(word => text.toLowerCase().includes(word))) confidence += 0.6;
        
        // Element type indicators
        if (tagName === 'button') confidence += 0.4;
        if (tagName === 'a' && classList.some(c => c.includes('btn'))) confidence += 0.4;
        if (classList.some(c => c.includes('cta'))) confidence += 0.3;
        
        // Position indicators
        if (context.position.isHeader) confidence += 0.2;
        
        // Styling indicators
        const bgColor = context.computedStyle.backgroundColor;
        if (bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') confidence += 0.1;

        return Math.min(confidence, 0.85);
      }
    });

    // MEDIUM PRIORITY FIELDS - Important content with mixed editing strategies
    this.addRule({
      type: 'section_heading',
      priority: 'medium',
      editStrategy: 'inline',
      description: 'Section heading - inline editing available',
      detector: (context) => {
        const { text, tagName } = context;
        let confidence = 0;

        if (tagName.match(/^h[1-6]$/)) confidence += 0.6;
        
        // Exclude hero titles
        if (text.toLowerCase().includes('change the channel')) return 0;
        
        // Content characteristics
        if (text.length > 5 && text.length < 80) confidence += 0.2;
        if (!context.position.isHeader) confidence += 0.1; // Not in header = section heading
        
        return Math.min(confidence, 0.8);
      }
    });

    this.addRule({
      type: 'rich_text',
      priority: 'medium',
      editStrategy: 'modal',
      description: 'Rich text content - use WordPress editor',
      detector: (context) => {
        const { text, tagName, element } = context;
        let confidence = 0;

        if (tagName === 'p' && text.length > 150) confidence += 0.6;
        if (element.querySelector('strong') || element.querySelector('em')) confidence += 0.2;
        if (text.includes('\n') || text.split('.').length > 3) confidence += 0.2;
        
        return Math.min(confidence, 0.75);
      }
    });

    this.addRule({
      type: 'contact_email',
      priority: 'medium',
      editStrategy: 'inline',
      description: 'Email address - click to edit inline',
      detector: (context) => {
        const { text } = context;
        
        // Email pattern matching
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        if (emailRegex.test(text) && text.trim().split(' ').length === 1) {
          return 0.9;
        }
        
        // Looser email indicators
        if (text.includes('@') && text.includes('.') && !text.includes(' ')) {
          return 0.7;
        }
        
        return 0;
      }
    });

    this.addRule({
      type: 'contact_phone',
      priority: 'medium',
      editStrategy: 'inline',
      description: 'Phone number - click to edit inline',
      detector: (context) => {
        const { text } = context;
        
        // Phone number patterns
        const phonePatterns = [
          /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
          /\(\d{3}\)\s?\d{3}[-.]?\d{4}/,
          /\+\d{1,3}\s?\d{3,4}\s?\d{3,4}\s?\d{3,4}/
        ];
        
        for (const pattern of phonePatterns) {
          if (pattern.test(text)) return 0.85;
        }
        
        return 0;
      }
    });

    this.addRule({
      type: 'contact_address',
      priority: 'medium',
      editStrategy: 'inline',
      description: 'Address - click to edit inline',
      detector: (context) => {
        const { text } = context;
        
        const addressRegex = /\d+\s+\w+\s+(street|st|avenue|ave|road|rd|lane|ln|drive|dr|boulevard|blvd)/i;
        if (addressRegex.test(text)) return 0.8;
        
        const stateRegex = /\b[A-Z]{2}\s+\d{5}(-\d{4})?\b/;
        if (stateRegex.test(text)) return 0.75;
        
        return 0;
      }
    });

    this.addRule({
      type: 'form_field',
      priority: 'medium',
      editStrategy: 'specialized',
      description: 'Form element - specialized form editor',
      detector: (context) => {
        const { element, tagName } = context;
        
        if (['input', 'textarea', 'select', 'button'].includes(tagName)) return 0.8;
        if (element.closest('form')) return 0.7;
        if (context.classList.some(c => c.includes('form'))) return 0.6;
        
        return 0;
      }
    });

    // LOW PRIORITY FIELDS - Simple content suitable for inline editing
    this.addRule({
      type: 'navigation_item',
      priority: 'low',
      editStrategy: 'inline',
      description: 'Navigation link - click to edit inline',
      detector: (context) => {
        const { element, tagName, classList, parentClasses } = context;
        let confidence = 0;

        if (context.position.isNavigation) confidence += 0.6;
        if (element.closest('nav')) confidence += 0.5;
        if (parentClasses.some(c => c.includes('nav'))) confidence += 0.4;
        if (classList.some(c => c.includes('nav'))) confidence += 0.3;
        if (tagName === 'a' && element.closest('header')) confidence += 0.3;
        
        return Math.min(confidence, 0.75);
      }
    });

    this.addRule({
      type: 'footer_text',
      priority: 'low',
      editStrategy: 'inline',
      description: 'Footer content - click to edit inline',
      detector: (context) => {
        const { element } = context;
        let confidence = 0;

        if (context.position.isFooter) confidence += 0.6;
        if (element.closest('footer')) confidence += 0.5;
        if (context.parentClasses.some(c => c.includes('footer'))) confidence += 0.4;
        if (context.classList.some(c => c.includes('footer'))) confidence += 0.3;
        
        return Math.min(confidence, 0.7);
      }
    });

    this.addRule({
      type: 'price_text',
      priority: 'medium',
      editStrategy: 'inline',
      description: 'Price information - click to edit inline',
      detector: (context) => {
        const { text } = context;
        
        const priceRegex = /\$\d+|\d+\s?(dollars?|usd|€|£)/i;
        if (priceRegex.test(text)) return 0.8;
        
        return 0;
      }
    });

    this.addRule({
      type: 'date_text',
      priority: 'low',
      editStrategy: 'inline',
      description: 'Date information - click to edit inline',
      detector: (context) => {
        const { text } = context;
        
        const datePatterns = [
          /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
          /\b\w+\s+\d{1,2},?\s+\d{4}\b/,
          /\b\d{4}-\d{2}-\d{2}\b/
        ];
        
        for (const pattern of datePatterns) {
          if (pattern.test(text)) return 0.75;
        }
        
        return 0;
      }
    });

    this.addRule({
      type: 'social_link',
      priority: 'low',
      editStrategy: 'inline',
      description: 'Social media link - click to edit inline',
      detector: (context) => {
        const { text, tagName, element } = context;
        
        if (tagName !== 'a') return 0;
        
        const socialPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok'];
        const href = (element as HTMLAnchorElement).href?.toLowerCase() || '';
        
        if (socialPlatforms.some(platform => 
          text.toLowerCase().includes(platform) || href.includes(platform)
        )) {
          return 0.8;
        }
        
        return 0;
      }
    });

    this.addRule({
      type: 'paragraph_text',
      priority: 'low',
      editStrategy: 'inline',
      description: 'Paragraph text - click to edit inline',
      detector: (context) => {
        const { text, tagName } = context;
        
        if (tagName === 'p' && text.length > 20 && text.length <= 150) {
          return 0.6;
        }
        
        return 0;
      }
    });

    this.addRule({
      type: 'generic_text',
      priority: 'low',
      editStrategy: 'inline',
      description: 'Text content - click to edit inline',
      detector: (context) => {
        const { text } = context;
        
        if (text.trim().length > 5 && text.trim().length < 200) {
          return 0.5;
        }
        
        return 0;
      }
    });
  }

  private addRule(rule: {
    type: string;
    detector: (context: DetectionContext) => number;
    priority: 'high' | 'medium' | 'low';
    editStrategy: 'inline' | 'modal' | 'specialized';
    description: string;
  }) {
    this.detectionRules.push(rule);
  }

  private createDetectionContext(element: HTMLElement): DetectionContext {
    const text = element.textContent?.trim() || '';
    const tagName = element.tagName.toLowerCase();
    const classList = Array.from(element.classList);
    const parentClasses = element.parentElement ? Array.from(element.parentElement.classList) : [];
    const computedStyle = window.getComputedStyle(element);

    // Determine position context
    const position = {
      isHeader: !!element.closest('header') || !!element.closest('[class*="header"]'),
      isFooter: !!element.closest('footer') || !!element.closest('[class*="footer"]'),
      isNavigation: !!element.closest('nav') || !!element.closest('[class*="nav"]'),
      isMain: !!element.closest('main') || !!element.closest('[class*="main"]'),
      depth: this.getElementDepth(element)
    };

    return {
      element,
      text,
      tagName,
      classList,
      parentClasses,
      computedStyle,
      position
    };
  }

  private getElementDepth(element: HTMLElement): number {
    let depth = 0;
    let current = element.parentElement;
    while (current && current !== document.body) {
      depth++;
      current = current.parentElement;
    }
    return depth;
  }

  private isNearElement(element1: HTMLElement, element2: HTMLElement): boolean {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    
    const distance = Math.sqrt(
      Math.pow(rect1.left - rect2.left, 2) + 
      Math.pow(rect1.top - rect2.top, 2)
    );
    
    return distance < 200; // Within 200px
  }

  public detectField(element: HTMLElement): FieldDetection {
    const context = this.createDetectionContext(element);
    
    // Skip elements with no meaningful text
    if (!context.text || context.text.length < 2) {
      return {
        type: 'unknown',
        confidence: 0,
        priority: 'low',
        editStrategy: 'inline',
        description: 'No content detected'
      };
    }

    let bestDetection: FieldDetection = {
      type: 'generic_text',
      confidence: 0,
      priority: 'low',
      editStrategy: 'inline',
      description: 'Generic text content'
    };

    // Run all detection rules
    for (const rule of this.detectionRules) {
      const confidence = rule.detector(context);
      
      if (confidence > bestDetection.confidence) {
        bestDetection = {
          type: rule.type,
          confidence,
          priority: rule.priority,
          editStrategy: rule.editStrategy,
          description: rule.description,
          metadata: {
            elementTag: context.tagName,
            textLength: context.text.length,
            hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(context.text),
            parentContext: context.position.isHeader ? 'header' : 
                          context.position.isFooter ? 'footer' :
                          context.position.isNavigation ? 'navigation' : 'content',
            cssClasses: context.classList
          }
        };
      }
    }

    return bestDetection;
  }

  public detectAllFields(container: HTMLElement = document.body): Map<HTMLElement, FieldDetection> {
    const detections = new Map<HTMLElement, FieldDetection>();
    
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          const element = node as HTMLElement;
          
          // Skip editing interface elements
          if (element.closest('.editing-overlay') || 
              element.closest('.inline-editor-container') ||
              element.closest('#wpadminbar')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          const text = element.textContent?.trim() || '';
          const hasText = text.length > 0;
          const isLeafNode = element.children.length === 0 || 
            (element.children.length === 1 && element.children[0].tagName === 'IMG');
          
          // Include interactive elements even with children
          const isInteractive = ['BUTTON', 'A', 'INPUT', 'TEXTAREA'].includes(element.tagName);
          
          return (hasText && (isLeafNode || isInteractive)) ? 
            NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      const element = node as HTMLElement;
      const detection = this.detectField(element);
      
      // Only include fields with reasonable confidence
      if (detection.confidence > 0.1) {
        detections.set(element, detection);
      }
    }

    return detections;
  }

  public getFieldTypeStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    const detections = this.detectAllFields();
    
    detections.forEach((detection) => {
      stats[detection.type] = (stats[detection.type] || 0) + 1;
    });
    
    return stats;
  }
}

export default EnhancedFieldDetector;