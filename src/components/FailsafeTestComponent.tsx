import React, { useState, useEffect } from 'react';
import { tripleFailsafe } from '@/utils/tripleFailsafeSystem';
import { useTripleFailsafeContent, useFailsafeStatus } from '@/hooks/useTripleFailsafeContent';

export const FailsafeTestComponent: React.FC = () => {
  const [testField, updateTestField] = useTripleFailsafeContent('test_field', 'Default Test Value');
  const [heroTitle, updateHeroTitle] = useTripleFailsafeContent('hero_title', 'Default Hero Title');
  const status = useFailsafeStatus();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Test 1: Save to all layers
  const testSaveToAllLayers = async () => {
    addResult('🧪 Testing save to all 3 layers...');
    
    const testValue = `Test ${Date.now()}`;
    await tripleFailsafe.saveToAllLayers([{
      field_name: 'test_all_layers',
      field_value: testValue
    }]);

    // Verify each layer
    try {
      const ls = localStorage.getItem('violet-content-primary');
      const lsOk = ls && JSON.parse(ls).data?.test_all_layers === testValue;
      addResult(`Layer 1 (LocalStorage): ${lsOk ? '✅' : '❌'}`);
    } catch (e) {
      addResult('Layer 1 (LocalStorage): ❌ Error');
    }

    try {
      const ss = sessionStorage.getItem('violet-content-session');
      const ssOk = ss && JSON.parse(ss).data?.test_all_layers === testValue;
      addResult(`Layer 2 (SessionStorage): ${ssOk ? '✅' : '❌'}`);
    } catch (e) {
      addResult('Layer 2 (SessionStorage): ❌ Error');
    }

    try {
      const idb = await tripleFailsafe.loadContentWithFailover();
      const idbOk = idb.test_all_layers === testValue;
      addResult(`Layer 3 (IndexedDB): ${idbOk ? '✅' : '❌'}`);
    } catch (e) {
      addResult('Layer 3 (IndexedDB): ❌ Error');
    }
  };

  // Test 2: Failover recovery
  const testFailoverRecovery = async () => {
    addResult('🧪 Testing failover recovery...');
    
    // Save test data
    const testData = `Recovery Test ${Date.now()}`;
    await tripleFailsafe.saveToAllLayers([{
      field_name: 'recovery_test',
      field_value: testData
    }]);

    // Corrupt primary storage
    localStorage.setItem('violet-content-primary', 'CORRUPTED_DATA');
    addResult('❌ Corrupted primary storage');

    // Try to load - should failover
    const recovered = await tripleFailsafe.loadContentWithFailover();
    const success = recovered.recovery_test === testData;
    
    addResult(success ? '✅ Successfully recovered from backup!' : '❌ Recovery failed');
  };

  // Test 3: WordPress integration
  const testWordPressIntegration = () => {
    addResult('🧪 Testing WordPress integration...');
    
    // Simulate WordPress save
    window.postMessage({
      type: 'violet-apply-saved-changes',
      savedChanges: [{
        field_name: 'wp_test',
        field_value: `WordPress Test ${Date.now()}`
      }]
    }, '*');

    addResult('📤 Sent simulated WordPress save');
    addResult('⏳ Check if content updates...');
  };

  // Clear all storage
  const clearAllStorage = async () => {
    await tripleFailsafe.clearAll();
    addResult('🗑️ All storage cleared');
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-2xl rounded-lg p-6 max-w-md z-50 border border-gray-200">
      <h3 className="text-lg font-bold mb-4">🛡️ Triple Failsafe System Test</h3>
      
      {/* Status Indicators */}
      <div className="mb-4 space-y-2">
        <div className="text-sm">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${status.localStorage ? 'bg-green-500' : 'bg-red-500'}`}></span>
          LocalStorage: {status.localStorage ? 'Active' : 'Inactive'}
        </div>
        <div className="text-sm">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${status.sessionStorage ? 'bg-green-500' : 'bg-red-500'}`}></span>
          SessionStorage: {status.sessionStorage ? 'Active' : 'Inactive'}
        </div>
        <div className="text-sm">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${status.indexedDB ? 'bg-green-500' : 'bg-red-500'}`}></span>
          IndexedDB: {status.indexedDB ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Test Controls */}
      <div className="space-y-2 mb-4">
        <button
          onClick={testSaveToAllLayers}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Test 1: Save to All Layers
        </button>
        <button
          onClick={testFailoverRecovery}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Test 2: Failover Recovery
        </button>
        <button
          onClick={testWordPressIntegration}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
        >
          Test 3: WordPress Integration
        </button>
        <button
          onClick={clearAllStorage}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Clear All Storage
        </button>
      </div>

      {/* Live Content Test */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <h4 className="font-semibold text-sm mb-2">Live Content Test:</h4>
        <input
          type="text"
          value={testField}
          onChange={(e) => updateTestField(e.target.value)}
          className="w-full px-2 py-1 border rounded text-sm"
          placeholder="Type to test..."
        />
        <div className="text-xs mt-1 text-gray-600">
          Current: {testField}
        </div>
      </div>

      {/* Test Results */}
      <div className="max-h-40 overflow-y-auto bg-gray-50 rounded p-2 text-xs">
        {testResults.length === 0 ? (
          <div className="text-gray-500">No tests run yet...</div>
        ) : (
          testResults.map((result, i) => (
            <div key={i} className="mb-1">{result}</div>
          ))
        )}
      </div>
    </div>
  );
};
