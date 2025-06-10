import React from 'react';
import { useContent, useContentField } from '@/contexts/ContentContext';

export const ContentTestComponent: React.FC = () => {
  const { content, isLoading, isWordPressConnected, lastSync, getField } = useContent();
  
  // Test getting specific fields
  const heroTitle = useContentField('hero_title', 'Default Hero Title');
  const heroSubtitle = useContentField('hero_subtitle', 'Default Hero Subtitle');
  const heroCta = getField('hero_cta', 'Get Started');
  
  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-lg mb-2">Content Test Panel</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isWordPressConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span>WordPress: {isWordPressConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        
        <div>
          <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>Last Sync:</strong> {lastSync ? lastSync.toLocaleTimeString() : 'Never'}
        </div>
        
        <div>
          <strong>Content Fields:</strong> {Object.keys(content).length}
        </div>
        
        <div className="border-t pt-2 mt-2">
          <strong>Sample Content:</strong>
          <div className="pl-2">
            <div>hero_title: "{heroTitle}"</div>
            <div>hero_subtitle: "{heroSubtitle}"</div>
            <div>hero_cta: "{heroCta}"</div>
          </div>
        </div>
        
        <div className="border-t pt-2 mt-2">
          <strong>All Content:</strong>
          <div className="max-h-32 overflow-y-auto text-xs bg-gray-100 p-2 rounded">
            <pre>{JSON.stringify(content, null, 2)}</pre>
          </div>
        </div>
        
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => window.location.reload()} 
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Reload Page
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('violet-content');
              localStorage.removeItem('violet-content-state');
              window.location.reload();
            }} 
            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
};
