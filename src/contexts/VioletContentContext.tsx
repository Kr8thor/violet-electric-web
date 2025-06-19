import React, { createContext, useContext, useState, useEffect } from 'react';
import VioletAPIClient from '../utils/apiClient';

interface VioletContentContextType {
  content: Record<string, any>;
  updateContent: (field: string, value: any) => void;
  saveContent: () => Promise<boolean>;
  saveField: (field: string, value: any) => Promise<boolean>;
  isLoading: boolean;
  isDirty: boolean;
  error: string | null;
  apiClient: VioletAPIClient;
  connectionStatus: 'unknown' | 'connected' | 'disconnected';
}

const VioletContentContext = createContext<VioletContentContextType | null>(null);

export function VioletContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<Record<string, any>>({});
  const [originalContent, setOriginalContent] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiClient] = useState(() => new VioletAPIClient());
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  
  const isDirty = JSON.stringify(content) !== JSON.stringify(originalContent);
  
  useEffect(() => {
    testConnection();
    // Make API client globally available for testing
    (window as any).violetAPI = apiClient;
  }, []);
  
  const testConnection = async () => {
    try {
      const isConnected = await apiClient.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      console.log('🔗 Connection status:', isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('🔗 Connection test failed:', error);
    }
  };
  
  const updateContent = (field: string, value: any) => {
    setContent(prev => ({ ...prev, [field]: value }));
    setError(null);
  };
  
  const saveContent = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const changes = Object.entries(content).map(([field_name, field_value]) => ({
        field_name,
        field_value
      }));
      
      if (changes.length === 0) {
        console.log('⚠️ No changes to save');
        return true;
      }
      
      const result = await apiClient.saveContent(changes);
      setOriginalContent({ ...content });
      
      console.log('✅ All content saved successfully:', result);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      setError(errorMessage);
      console.error('❌ Save error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveField = async (field: string, value: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await apiClient.saveContent([{ field_name: field, field_value: value }]);
      
      // Update both current and original content
      setContent(prev => ({ ...prev, [field]: value }));
      setOriginalContent(prev => ({ ...prev, [field]: value }));
      
      console.log(`✅ Field ${field} saved successfully:`, result);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      setError(errorMessage);
      console.error(`❌ Failed to save field ${field}:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <VioletContentContext.Provider value={{
      content,
      updateContent,
      saveContent,
      saveField,
      isLoading,
      isDirty,
      error,
      apiClient,
      connectionStatus
    }}>
      {children}
    </VioletContentContext.Provider>
  );
}

export const useVioletContent = () => {
  const context = useContext(VioletContentContext);
  if (!context) {
    throw new Error('useVioletContent must be used within VioletContentProvider');
  }
  return context;
};