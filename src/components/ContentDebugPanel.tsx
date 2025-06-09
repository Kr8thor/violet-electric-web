import React, { useState, useEffect } from 'react';
import { getAllContentSync } from '@/utils/contentStorage';
import { useContent } from '@/contexts/ContentContext';

const ContentDebugPanel: React.FC = () => {
  const [storageContent, setStorageContent] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);
  const { content, isLoading } = useContent();

  useEffect(() => {
    // Check localStorage every second
    const interval = setInterval(() => {
      const stored = getAllContentSync();
      setStorageContent(stored);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development or when edit mode is active
  const isDev = import.meta.env?.DEV || false;
  const isEditMode = window.location.search.includes('edit_mode=1');
  const showDebug = isDev || isEditMode;

  if (!showDebug) return null;

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: '#0073aa',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          border: 'none',
          cursor: 'pointer',
          zIndex: 9999,
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}
      >
        🐛 Debug Content ({Object.keys(storageContent).length} fields)
      </button>

      {isVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '60px',
            left: '20px',
            background: 'rgba(0, 0, 0, 0.95)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '500px',
            maxHeight: '70vh',
            overflow: 'auto',
            zIndex: 9999,
            fontSize: '12px',
            fontFamily: 'monospace',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}
        >
          <h3 style={{ marginTop: 0, color: '#00ff00' }}>🔍 Content Debug Panel</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#ffff00' }}>Loading State:</strong> {isLoading ? '⏳ Loading...' : '✅ Ready'}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#ffff00' }}>Context Content ({Object.keys(content).length} fields):</strong>
            <pre style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '10px', 
              borderRadius: '5px',
              maxHeight: '200px',
              overflow: 'auto',
              marginTop: '5px'
            }}>
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#ffff00' }}>LocalStorage Content ({Object.keys(storageContent).length} fields):</strong>
            <pre style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '10px', 
              borderRadius: '5px',
              maxHeight: '200px',
              overflow: 'auto',
              marginTop: '5px'
            }}>
              {JSON.stringify(storageContent, null, 2)}
            </pre>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#ffff00' }}>Raw LocalStorage:</strong>
            <pre style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '10px', 
              borderRadius: '5px',
              fontSize: '10px',
              wordBreak: 'break-all',
              marginTop: '5px'
            }}>
              {localStorage.getItem('violet-content') || 'null'}
            </pre>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button
              onClick={() => {
                localStorage.removeItem('violet-content');
                window.location.reload();
              }}
              style={{
                background: '#d63939',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              🗑️ Clear Storage & Reload
            </button>
            <button
              onClick={() => {
                console.log('=== CONTENT DEBUG ===');
                console.log('Context:', content);
                console.log('Storage:', storageContent);
                console.log('Raw:', localStorage.getItem('violet-content'));
              }}
              style={{
                background: '#0073aa',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              📋 Log to Console
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ContentDebugPanel;
