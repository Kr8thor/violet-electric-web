import React from 'react';
import { useEditModeContext } from '@/contexts/EditModeContext';
import { useVioletContent } from '@/contexts/VioletRuntimeContentFixed';

/**
 * Content Debug Panel
 * Helps diagnose content persistence issues
 */
export const ContentDebugPanel: React.FC = () => {
  const { isEditing, setEditing } = useEditModeContext();
  const { data, loading, error, refreshContent } = useVioletContent();
  const [page, setPage] = React.useState('');
  const [fields, setFields] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Get current page context from contentPersistenceFix
    try {
      const pageCtx = (window as any).contentManager?.getCurrentPage?.() || '';
      setPage(pageCtx);
    } catch {}
    // Get all visible EditableText fields
    const nodes = document.querySelectorAll('[data-violet-field]');
    setFields(Array.from(nodes).map(n => n.getAttribute('data-violet-field') || ''));
  }, [data, isEditing]);

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, background: 'rgba(0,0,0,0.85)', color: '#fff', padding: 16, borderRadius: 8, fontSize: 14, maxWidth: 340 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>🛠️ Content Debug Panel</div>
      <div>Edit Mode: <b style={{ color: isEditing ? '#4ade80' : '#f87171' }}>{isEditing ? 'ENABLED' : 'DISABLED'}</b></div>
      <div>Page Context: <b>{page}</b></div>
      <div>Provider Loading: <b>{loading ? 'true' : 'false'}</b></div>
      <div>Provider Error: <b>{error || 'none'}</b></div>
      <div style={{ margin: '8px 0' }}>Fields on page:
        <ul style={{ maxHeight: 80, overflow: 'auto', margin: 0, padding: 0, listStyle: 'none' }}>
          {fields.map(f => <li key={f} style={{ color: '#a5b4fc' }}>{f}</li>)}
        </ul>
      </div>
      <div style={{ margin: '8px 0' }}>Content snapshot:
        <pre style={{ fontSize: 12, background: '#222', color: '#a5b4fc', padding: 8, borderRadius: 4, maxHeight: 100, overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>
      </div>
      <button style={{ marginRight: 8, background: '#4ade80', color: '#222', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }} onClick={() => refreshContent()}>Force Refresh</button>
      <button style={{ background: isEditing ? '#f87171' : '#4ade80', color: '#222', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }} onClick={() => setEditing(!isEditing)}>{isEditing ? 'Disable' : 'Enable'} Edit Mode</button>
    </div>
  );
};

export default ContentDebugPanel;
