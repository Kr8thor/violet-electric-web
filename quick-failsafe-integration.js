/**
 * Quick Integration Script for Failsafe Mechanisms
 * Run this to automatically update your existing components
 */

// Example integration for App.tsx
const appTsxIntegration = `
// Add these imports at the top
import { failsafeStorage } from '@/utils/failsafeContentPersistence';
import { useEffect } from 'react';

// Add this inside your App component
useEffect(() => {
  // Listen for WordPress saves
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'violet-apply-saved-changes' && event.data.savedChanges) {
      console.log('💾 App: Processing WordPress save with failsafe');
      failsafeStorage.handleWordPressSave(event.data.savedChanges);
    }
    
    if (event.data.type === 'violet-force-hard-refresh') {
      console.log('🔄 App: Force refresh requested');
      setTimeout(() => window.location.reload(), 100);
    }
  };
  
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);

// Add debug utilities in development
if (process.env.NODE_ENV === 'development') {
  (window as any).violetDebug = {
    storage: failsafeStorage,
    getContent: () => failsafeStorage.loadContent(),
    verifyIntegrity: () => failsafeStorage.verifyIntegrity(),
    forceRefresh: () => window.location.reload(),
    testSave: (field: string, value: string) => {
      const current = failsafeStorage.loadContent();
      failsafeStorage.saveContent({ ...current, [field]: value }, 'test');
    }
  };
  console.log('🛠️ Violet debug utilities available at window.violetDebug');
}
`;

// Example component update
const componentUpdateExample = `
// Before (using ContentContext):
import { useContent } from '@/contexts/ContentContext';

export function MyComponent() {
  const { getField } = useContent();
  const title = getField('my_title', 'Default Title');
  
  return <h1>{title}</h1>;
}

// After (using Failsafe):
import { useFailsafeContent } from '@/hooks/useFailsafeContent';

export function MyComponent() {
  const [title, setTitle, isUpdating] = useFailsafeContent({
    fieldName: 'my_title',
    defaultValue: 'Default Title'
  });
  
  return (
    <h1 className={isUpdating ? 'updating' : ''}>
      {title}
    </h1>
  );
}
`;

// CSS for visual feedback
const cssAdditions = `
/* Add to your global CSS or component styles */
.updating {
  animation: contentUpdate 0.5s ease;
  background-color: rgba(255, 235, 59, 0.1);
}

@keyframes contentUpdate {
  0% { opacity: 1; }
  50% { opacity: 0.8; background-color: rgba(255, 235, 59, 0.2); }
  100% { opacity: 1; }
}

.field-updating {
  position: relative;
  transition: all 0.3s ease;
}

.field-updating::after {
  content: '↻';
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%) rotate(0deg);
  animation: spin 1s linear infinite;
  color: #0073aa;
  font-size: 16px;
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}
`;

// Migration guide for existing content
const migrationScript = `
// Run this in browser console to migrate existing content to failsafe storage
(function migrateToFailsafe() {
  console.log('🔄 Starting content migration to failsafe storage...');
  
  // Try to get content from various sources
  const sources = [
    { name: 'violet-content', data: localStorage.getItem('violet-content') },
    { name: 'violet-content-cache', data: localStorage.getItem('violet-content-cache') },
    { name: 'violet-content-state', data: localStorage.getItem('violet-content-state') }
  ];
  
  let mergedContent = {};
  
  sources.forEach(source => {
    if (source.data) {
      try {
        const parsed = JSON.parse(source.data);
        const content = parsed.data || parsed.content || parsed.local || parsed;
        
        if (typeof content === 'object' && content !== null) {
          console.log(\`✅ Found content in \${source.name}:\`, content);
          mergedContent = { ...mergedContent, ...content };
        }
      } catch (e) {
        console.error(\`❌ Failed to parse \${source.name}:\`, e);
      }
    }
  });
  
  if (Object.keys(mergedContent).length > 0) {
    // Save to failsafe storage
    const failsafeData = {
      data: mergedContent,
      timestamp: Date.now(),
      source: 'migration',
      version: 1
    };
    
    localStorage.setItem('violet-content-primary', JSON.stringify(failsafeData));
    localStorage.setItem('violet-content-backup', JSON.stringify(failsafeData));
    sessionStorage.setItem('violet-content-emergency', JSON.stringify(failsafeData));
    
    console.log('✅ Migration complete! Migrated content:', mergedContent);
    console.log('🔄 Refreshing page to apply changes...');
    
    setTimeout(() => window.location.reload(), 1000);
  } else {
    console.log('⚠️ No existing content found to migrate');
  }
})();
`;

// Console commands for testing
console.log(`
🛡️ FAILSAFE CONTENT PERSISTENCE - QUICK INTEGRATION

1. UPDATE APP.TSX:
${appTsxIntegration}

2. UPDATE YOUR COMPONENTS:
${componentUpdateExample}

3. ADD CSS FOR VISUAL FEEDBACK:
${cssAdditions}

4. MIGRATE EXISTING CONTENT:
Copy and paste this in browser console:
${migrationScript}

5. TEST IN WORDPRESS CONSOLE:
violetBridge.testSave('hero_title', 'Testing Failsafe');

6. VERIFY IN REACT CONSOLE:
window.violetDebug.getContent();

✅ Your content will now ALWAYS persist!
`);

// Export for use
export {
  appTsxIntegration,
  componentUpdateExample,
  cssAdditions,
  migrationScript
};
