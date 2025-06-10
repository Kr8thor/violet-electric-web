import React from 'react';
import { useFailsafeContent, useForceContentRefresh } from '@/hooks/useFailsafeContent';

/**
 * Example Hero component using the failsafe content system
 * This ensures content ALWAYS persists after WordPress saves
 */
export function HeroFailsafeExample() {
  // Use failsafe hooks for each content field
  const [title, setTitle, isTitleUpdating] = useFailsafeContent({
    fieldName: 'hero_title',
    defaultValue: 'Welcome to Violet Electric',
    forceRefreshInterval: 2000 // Check every 2 seconds
  });
  
  const [subtitle, setSubtitle, isSubtitleUpdating] = useFailsafeContent({
    fieldName: 'hero_subtitle',
    defaultValue: 'Transform your potential',
    forceRefreshInterval: 2000
  });
  
  const [ctaText, setCtaText, isCtaUpdating] = useFailsafeContent({
    fieldName: 'hero_cta',
    defaultValue: 'Get Started',
    forceRefreshInterval: 2000
  });
  
  // Force refresh hook for manual updates
  const { refreshTrigger, forceRefresh } = useForceContentRefresh();
  
  // Check if any field is updating
  const isAnyFieldUpdating = isTitleUpdating || isSubtitleUpdating || isCtaUpdating;
  
  // Handle inline editing (if in WordPress iframe)
  const handleContentEdit = (field: string, value: string) => {
    switch (field) {
      case 'hero_title':
        setTitle(value);
        break;
      case 'hero_subtitle':
        setSubtitle(value);
        break;
      case 'hero_cta':
        setCtaText(value);
        break;
    }
  };
  
  return (
    <section 
      className={`hero-section ${isAnyFieldUpdating ? 'content-updating' : ''}`}
      key={refreshTrigger} // Force re-render on refresh
    >
      {/* Visual indicator when content is updating */}
      {isAnyFieldUpdating && (
        <div className="update-indicator">
          <span className="spinner"></span>
          <span>Updating content...</span>
        </div>
      )}
      
      {/* Hero Title */}
      <h1 
        data-violet-field="hero_title"
        className={`hero-title ${isTitleUpdating ? 'field-updating' : ''}`}
        contentEditable={false} // Controlled by WordPress editor
        suppressContentEditableWarning={true}
      >
        {title}
      </h1>
      
      {/* Hero Subtitle */}
      <p 
        data-violet-field="hero_subtitle"
        className={`hero-subtitle ${isSubtitleUpdating ? 'field-updating' : ''}`}
      >
        {subtitle}
      </p>
      
      {/* Call to Action Button */}
      <button 
        data-violet-field="hero_cta"
        className={`hero-cta-button ${isCtaUpdating ? 'field-updating' : ''}`}
      >
        {ctaText}
      </button>
      
      {/* Debug Panel (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <h3>Debug Panel</h3>
          <button onClick={forceRefresh}>Force Refresh</button>
          <button onClick={() => {
            console.log('Current values:', {
              title,
              subtitle,
              ctaText
            });
          }}>Log Values</button>
          <div className="debug-info">
            <p>Title updating: {isTitleUpdating ? 'Yes' : 'No'}</p>
            <p>Subtitle updating: {isSubtitleUpdating ? 'Yes' : 'No'}</p>
            <p>CTA updating: {isCtaUpdating ? 'Yes' : 'No'}</p>
            <p>Refresh count: {refreshTrigger}</p>
          </div>
        </div>
      )}
    </section>
  );
}

// CSS for visual feedback
const styles = `
  .hero-section {
    position: relative;
    padding: 60px 20px;
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .hero-section.content-updating {
    opacity: 0.95;
  }
  
  .update-indicator {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 115, 170, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    animation: slideIn 0.3s ease;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .field-updating {
    background-color: rgba(255, 235, 59, 0.1);
    animation: pulse 1s ease-in-out;
    border-radius: 4px;
    padding: 2px 8px;
    margin: -2px -8px;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .debug-panel {
    margin-top: 40px;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
    text-align: left;
  }
  
  .debug-panel h3 {
    margin-top: 0;
    color: #666;
  }
  
  .debug-panel button {
    margin-right: 10px;
    padding: 5px 15px;
    background: #0073aa;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .debug-panel button:hover {
    background: #005a87;
  }
  
  .debug-info {
    margin-top: 15px;
    padding: 10px;
    background: white;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }
  
  .debug-info p {
    margin: 5px 0;
  }
`;

// Export styles for inclusion
export const heroFailsafeStyles = styles;
