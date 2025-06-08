import { useVioletContent } from '@/hooks/useVioletContent';
import { clearContent } from '@/utils/contentStorage';
import { Button } from '@/components/ui/button';

/**
 * Debug component to test content persistence
 */
export const ContentDebug = () => {
  const { content } = useVioletContent();
  const hasContent = Object.keys(content).length > 0;

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">Content Debug</h3>
      <p className="text-sm text-gray-600 mb-2">
        {hasContent ? `${Object.keys(content).length} fields saved` : 'No saved content'}
      </p>
      {hasContent && (
        <>
          <div className="text-xs bg-gray-100 p-2 rounded mb-2 max-h-32 overflow-y-auto">
            <pre>{JSON.stringify(content, null, 2)}</pre>
          </div>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => {
              if (confirm('Clear all saved content?')) {
                clearContent();
              }
            }}
          >
            Clear Content
          </Button>
        </>
      )}
    </div>
  );
};
