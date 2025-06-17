import React from 'react';
import { useVioletContent } from '../contexts/VioletRuntimeContentFixed';

export default function ContentStatus() {
  const { content, loading, error } = useVioletContent();

  return (
    <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg max-w-sm">
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'}`}></div>
        <span className="font-medium">
          {loading ? 'Loading...' : error ? 'Error' : 'Connected'}
        </span>
      </div>
      
      <div className="mt-1 text-xs text-gray-600">
        {Object.keys(content).length} fields loaded
        {error && <div className="text-red-600 mt-1">{error}</div>}
      </div>
    </div>
  );
}
