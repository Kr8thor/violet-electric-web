// Connectivity Test Component for immediate backend diagnosis
import { useEffect, useState } from 'react';

interface ConnectivityResults {
  wordpressApi: boolean;
  violetApi: boolean;
  graphql: boolean;
  cors: boolean;
  saveEndpoint: boolean;
  lastTest: string;
  errors: string[];
}

export const ConnectivityTest = () => {
  const [results, setResults] = useState<ConnectivityResults>({
    wordpressApi: false,
    violetApi: false,
    graphql: false,
    cors: false,
    saveEndpoint: false,
    lastTest: '',
    errors: []
  });
  
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Run initial test
    testConnectivity();
  }, []);

  const testConnectivity = async () => {
    setIsLoading(true);
    const errors: string[] = [];
    const testResults: ConnectivityResults = {
      wordpressApi: false,
      violetApi: false,
      graphql: false,
      cors: false,
      saveEndpoint: false,
      lastTest: new Date().toLocaleTimeString(),
      errors: []
    };

    console.log('🔍 Starting comprehensive connectivity test...');

    // Test 1: Basic WordPress REST API
    try {
      console.log('📡 Testing WordPress REST API...');
      const wpResponse = await fetch('https://wp.violetrainwater.com/wp-json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      testResults.wordpressApi = wpResponse.ok;
      testResults.cors = wpResponse.ok; // If this works, basic CORS is OK
      
      if (wpResponse.ok) {
        const wpData = await wpResponse.json();
        console.log('✅ WordPress API working:', wpData.name || 'WordPress Site');
      } else {
        errors.push(`WordPress API failed: ${wpResponse.status} ${wpResponse.statusText}`);
        console.error('❌ WordPress API failed:', wpResponse.status, wpResponse.statusText);
      }
    } catch (error) {
      errors.push(`WordPress API error: ${error}`);
      console.error('❌ WordPress API error:', error);
    }

    // Test 2: Custom Violet Content API
    try {
      console.log('📡 Testing Violet Content API...');
      const violetResponse = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      testResults.violetApi = violetResponse.ok;
      
      if (violetResponse.ok) {
        const violetData = await violetResponse.json();
        console.log('✅ Violet Content API working, fields:', Object.keys(violetData));
      } else {
        errors.push(`Violet API failed: ${violetResponse.status} ${violetResponse.statusText}`);
        console.error('❌ Violet API failed:', violetResponse.status, violetResponse.statusText);
        
        // Try to get error details
        try {
          const errorText = await violetResponse.text();
          console.error('🔍 Violet API error details:', errorText);
        } catch (e) {
          console.error('🔍 Could not get Violet API error details');
        }
      }
    } catch (error) {
      errors.push(`Violet API error: ${error}`);
      console.error('❌ Violet API error:', error);
    }

    // Test 3: GraphQL Endpoint
    try {
      console.log('📡 Testing GraphQL endpoint...');
      const gqlResponse = await fetch('https://wp.violetrainwater.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `{
            generalSettings {
              title
              description
            }
          }`
        })
      });
      
      testResults.graphql = gqlResponse.ok;
      
      if (gqlResponse.ok) {
        const gqlData = await gqlResponse.json();
        if (gqlData.data && gqlData.data.generalSettings) {
          console.log('✅ GraphQL working:', gqlData.data.generalSettings.title);
        } else if (gqlData.errors) {
          errors.push(`GraphQL returned errors: ${JSON.stringify(gqlData.errors)}`);
          console.error('❌ GraphQL errors:', gqlData.errors);
        }
      } else {
        errors.push(`GraphQL failed: ${gqlResponse.status} ${gqlResponse.statusText}`);
        console.error('❌ GraphQL failed:', gqlResponse.status, gqlResponse.statusText);
      }
    } catch (error) {
      errors.push(`GraphQL error: ${error}`);
      console.error('❌ GraphQL error:', error);
    }

    // Test 4: Save Endpoint (dry run)
    try {
      console.log('📡 Testing Save endpoint...');
      const saveResponse = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content/save-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          changes: [
            {
              field_name: 'connectivity_test',
              field_value: `Test at ${new Date().toISOString()}`,
              format: 'plain'
            }
          ]
        })
      });
      
      testResults.saveEndpoint = saveResponse.ok;
      
      if (saveResponse.ok) {
        const saveData = await saveResponse.json();
        console.log('✅ Save endpoint working:', saveData.message || 'Save test passed');
      } else {
        errors.push(`Save endpoint failed: ${saveResponse.status} ${saveResponse.statusText}`);
        console.error('❌ Save endpoint failed:', saveResponse.status, saveResponse.statusText);
      }
    } catch (error) {
      errors.push(`Save endpoint error: ${error}`);
      console.error('❌ Save endpoint error:', error);
    }

    testResults.errors = errors;
    setResults(testResults);
    setIsLoading(false);
    
    // Summary
    const totalTests = 4;
    const passedTests = [
      testResults.wordpressApi,
      testResults.violetApi,
      testResults.graphql,
      testResults.saveEndpoint
    ].filter(Boolean).length;
    
    console.log(`🔍 Connectivity Test Complete: ${passedTests}/${totalTests} tests passed`);
    if (errors.length > 0) {
      console.error('❌ Errors encountered:', errors);
    }
  };

  const getStatusIcon = (status: boolean) => status ? '✅' : '❌';
  const getStatusColor = (status: boolean) => status ? 'text-green-600' : 'text-red-600';
  
  const allTestsPassed = results.wordpressApi && results.violetApi && results.graphql && results.saveEndpoint;
  const criticalTestsPassed = results.wordpressApi && results.violetApi; // Minimum needed for basic functionality

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded text-sm z-50 hover:bg-blue-600"
      >
        Show Connectivity
      </button>
    );
  }

  return (
    <div className="fixed top-4 left-4 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 p-4 max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">🔗 Backend Connectivity</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 text-xs"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className={`flex justify-between ${getStatusColor(results.wordpressApi)}`}>
          <span>WordPress API:</span>
          <span>{getStatusIcon(results.wordpressApi)}</span>
        </div>
        
        <div className={`flex justify-between ${getStatusColor(results.violetApi)}`}>
          <span>Violet Content API:</span>
          <span>{getStatusIcon(results.violetApi)}</span>
        </div>
        
        <div className={`flex justify-between ${getStatusColor(results.graphql)}`}>
          <span>GraphQL:</span>
          <span>{getStatusIcon(results.graphql)}</span>
        </div>
        
        <div className={`flex justify-between ${getStatusColor(results.cors)}`}>
          <span>CORS:</span>
          <span>{getStatusIcon(results.cors)}</span>
        </div>
        
        <div className={`flex justify-between ${getStatusColor(results.saveEndpoint)}`}>
          <span>Save Function:</span>
          <span>{getStatusIcon(results.saveEndpoint)}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600 mb-2">
          Last test: {results.lastTest}
        </div>
        
        <button
          onClick={testConnectivity}
          disabled={isLoading}
          className="w-full px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Testing...' : 'Retest All'}
        </button>
      </div>
      
      {/* Status Summary */}
      <div className="mt-2 p-2 rounded text-xs">
        {allTestsPassed ? (
          <div className="bg-green-100 text-green-800 p-2 rounded">
            ✅ All systems operational
          </div>
        ) : criticalTestsPassed ? (
          <div className="bg-yellow-100 text-yellow-800 p-2 rounded">
            ⚠️ Basic functionality available
          </div>
        ) : (
          <div className="bg-red-100 text-red-800 p-2 rounded">
            ❌ Backend connection issues
          </div>
        )}
      </div>
      
      {/* Error Details */}
      {results.errors.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-gray-600 cursor-pointer">
            View Error Details ({results.errors.length})
          </summary>
          <div className="mt-1 text-xs text-red-600 bg-red-50 p-2 rounded max-h-20 overflow-y-auto">
            {results.errors.map((error, index) => (
              <div key={index} className="mb-1">• {error}</div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default ConnectivityTest;