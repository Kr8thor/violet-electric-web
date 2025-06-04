import React, { useEffect } from 'react';

// WordPress Editor Communication Component
const WordPressEditor: React.FC = () => {
  useEffect(() => {
    // Listen for messages from WordPress admin
    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = ['violetrainwater.com', 'wp.violetrainwater.com'];
      
      if (!allowedOrigins.some(origin => event.origin.includes(origin))) {
        return;
      }

      if (event.data?.type === 'violet-enable-editing') {
        enableEditingMode();
      } else if (event.data?.type === 'violet-disable-editing') {
        disableEditingMode();
      }
    };

    // Send ready message to parent
    if (window.parent !== window.self) {
      window.parent.postMessage({
        type: 'violet-iframe-ready',
        url: window.location.href,
        title: document.title
      }, '*');
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const enableEditingMode = () => {
    // Add editing styles
    const style = document.createElement('style');
    style.id = 'violet-editing-styles';
    style.innerHTML = `
      .violet-editable {
        outline: 2px dashed #0073aa !important;
        background: rgba(0, 115, 170, 0.1) !important;
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(style);

    // Make elements editable
    ['h1', 'h2', 'h3', 'p', 'span', 'button'].forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const element = el as HTMLElement;
        const text = element.textContent?.trim();
        if (text && text.length > 2) {
          makeEditable(element);
        }
      });
    });
  };

  const makeEditable = (element: HTMLElement) => {
    element.classList.add('violet-editable');
    element.addEventListener('click', (e) => {
      e.preventDefault();
      
      const text = element.textContent || '';
      const field = detectField(element);
      
      // Send edit request to WordPress admin
      window.parent.postMessage({
        type: 'violet-edit-request',
        text: text,
        field: field
      }, '*');
    });
  };

  const detectField = (element: HTMLElement): string => {
    const text = element.textContent?.toLowerCase() || '';
    const tag = element.tagName.toLowerCase();
    
    if (tag === 'h1' || text.includes('change the channel')) return 'hero_title';
    if (text.includes('transform your potential')) return 'hero_subtitle';
    if (tag === 'button' || text.includes('book')) return 'hero_cta_text';
    if (text.includes('about')) return 'about_title';
    if (text.includes('@')) return 'contact_email';
    
    return 'content_generic';
  };

  const disableEditingMode = () => {
    const style = document.getElementById('violet-editing-styles');
    if (style) style.remove();
    
    document.querySelectorAll('.violet-editable').forEach(el => {
      el.classList.remove('violet-editable');
    });
  };

  return null; // This component doesn't render anything visible
};

export default WordPressEditor;
