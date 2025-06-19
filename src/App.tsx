import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VioletContentProvider } from './contexts/VioletContentContext';
import { useEffect } from 'react';

// Your existing page imports (update these paths as needed)
// import Index from './pages/Index';
// import About from './pages/About';

function App() {
  useEffect(() => {
    // Global API key check and initialization
    console.log('🚀 App starting...');
    console.log('Environment check:', {
      mode: import.meta.env.MODE,
      apiKey: !!import.meta.env.VITE_VIOLET_API_KEY,
      apiKeyLength: import.meta.env.VITE_VIOLET_API_KEY?.length || 0
    });
    
    // Set fallback API key globally if needed
    if (!import.meta.env.VITE_VIOLET_API_KEY) {
      console.warn('⚠️ No VITE_VIOLET_API_KEY found, setting fallback');
      (window as any).__VITE_VIOLET_API_KEY__ = '3Tr2PwndilEui9rgb55XbRzQECupVGKr';
    }
    
    // Global test function for easy debugging
    (window as any).testVioletAPI = async () => {
      console.log('🧪 Testing Violet API...');
      try {
        const apiClient = (window as any).violetAPI;
        if (apiClient) {
          const connected = await apiClient.testConnection();
          console.log('Connection:', connected ? '✅ SUCCESS' : '❌ FAILED');
          
          if (connected && (window as any).violet?.nonce) {
            const saveResult = await apiClient.saveContent([
              { field_name: 'test_' + Date.now(), field_value: 'API Test Success!' }
            ]);
            console.log('Save test:', saveResult);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('❌ API test failed:', error);
        return false;
      }
    };
    
  }, []);

  return (
    <VioletContentProvider>
      <div className="App">
        {/* Add your existing components here */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <div className="min-h-screen bg-gray-100 p-8">
                <h1 className="text-4xl font-bold text-center mb-8">
                  Violet Electric Web - API Fixed
                </h1>
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-semibold mb-4">API Status Check</h2>
                  <APIStatusDisplay />
                  <TestSaveComponent />
                </div>
              </div>
            } />
            {/* Add your other routes here */}
          </Routes>
        </BrowserRouter>
      </div>
    </VioletContentProvider>
  );
}

// Quick API status component for testing
function APIStatusDisplay() {
  const { connectionStatus, error, isLoading, apiClient } = useVioletContent();
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-4">
        <span>Connection Status:</span>
        <span className={`px-3 py-1 rounded ${
          connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
          connectionStatus === 'disconnected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {connectionStatus}
        </span>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          Loading...
        </div>
      )}
      
      <button 
        onClick={() => apiClient.testConnection()}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Connection
      </button>
    </div>
  );
}

// Test save component
function TestSaveComponent() {
  const { saveField, content } = useVioletContent();
  
  const handleTestSave = async () => {
    const testField = 'test_save_' + Date.now();
    const testValue = 'Test successful at ' + new Date().toISOString();
    
    const success = await saveField(testField, testValue);
    if (success) {
      alert('✅ Save test successful!');
    } else {
      alert('❌ Save test failed - check console for details');
    }
  };
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Test Save Function</h3>
      <button 
        onClick={handleTestSave}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-4"
      >
        Test Save
      </button>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Current Content:</h4>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App;