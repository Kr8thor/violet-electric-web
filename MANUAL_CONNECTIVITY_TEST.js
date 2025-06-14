// 🔗 Manual Backend Connectivity Test Script
// Copy and paste this into your browser console for immediate testing

console.log('🚀 Starting Manual Backend Connectivity Test...');

const testBackendConnectivity = async () => {
  const results = {
    wordpressApi: false,
    violetApi: false,
    graphql: false,
    saveEndpoint: false,
    errors: []
  };

  // Test 1: WordPress REST API
  console.log('📡 Testing WordPress REST API...');
  try {
    const response = await fetch('https://wp.violetrainwater.com/wp-json/');
    results.wordpressApi = response.ok;
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ WordPress API working:', data.name || 'WordPress');
    } else {
      console.error('❌ WordPress API failed:', response.status, response.statusText);
      results.errors.push(`WordPress API: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ WordPress API error:', error);
    results.errors.push(`WordPress API: ${error.message}`);
  }

  // Test 2: Violet Content API
  console.log('📡 Testing Violet Content API...');
  try {
    const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content');
    results.violetApi = response.ok;
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Violet Content API working, fields found:', Object.keys(data));
      console.log('📄 Sample content:', data);
    } else {
      console.error('❌ Violet Content API failed:', response.status, response.statusText);
      results.errors.push(`Violet API: ${response.status}`);
      
      // Try to get error details
      try {
        const errorText = await response.text();
        console.error('🔍 Error details:', errorText);
      } catch (e) {
        console.error('🔍 Could not get error details');
      }
    }
  } catch (error) {
    console.error('❌ Violet Content API error:', error);
    results.errors.push(`Violet API: ${error.message}`);
  }

  // Test 3: GraphQL
  console.log('📡 Testing GraphQL endpoint...');
  try {
    const response = await fetch('https://wp.violetrainwater.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `{
          generalSettings {
            title
            description
            url
          }
        }`
      })
    });
    
    results.graphql = response.ok;
    
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.generalSettings) {
        console.log('✅ GraphQL working:', data.data.generalSettings.title);
        console.log('📄 GraphQL data:', data.data.generalSettings);
      } else if (data.errors) {
        console.error('❌ GraphQL errors:', data.errors);
        results.errors.push(`GraphQL: ${JSON.stringify(data.errors)}`);
      }
    } else {
      console.error('❌ GraphQL failed:', response.status, response.statusText);
      results.errors.push(`GraphQL: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ GraphQL error:', error);
    results.errors.push(`GraphQL: ${error.message}`);
  }

  // Test 4: Save Endpoint (test mode)
  console.log('📡 Testing Save endpoint...');
  try {
    const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content/save-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        changes: [
          {
            field_name: 'connectivity_test',
            field_value: `Manual test at ${new Date().toISOString()}`,
            format: 'plain'
          }
        ]
      })
    });
    
    results.saveEndpoint = response.ok;
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Save endpoint working:', data);
    } else {
      console.error('❌ Save endpoint failed:', response.status, response.statusText);
      results.errors.push(`Save endpoint: ${response.status}`);
      
      // Try to get error details
      try {
        const errorText = await response.text();
        console.error('🔍 Save error details:', errorText);
      } catch (e) {
        console.error('🔍 Could not get save error details');
      }
    }
  } catch (error) {
    console.error('❌ Save endpoint error:', error);
    results.errors.push(`Save endpoint: ${error.message}`);
  }

  // Summary
  console.log('\n🔍 ===== CONNECTIVITY TEST RESULTS =====');
  console.log('WordPress REST API:', results.wordpressApi ? '✅ WORKING' : '❌ FAILED');
  console.log('Violet Content API:', results.violetApi ? '✅ WORKING' : '❌ FAILED');
  console.log('GraphQL Endpoint:', results.graphql ? '✅ WORKING' : '❌ FAILED');
  console.log('Save Endpoint:', results.saveEndpoint ? '✅ WORKING' : '❌ FAILED');
  
  const workingCount = [results.wordpressApi, results.violetApi, results.graphql, results.saveEndpoint].filter(Boolean).length;
  console.log(`\n📊 Overall Status: ${workingCount}/4 endpoints working`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    results.errors.forEach(error => console.log(`   • ${error}`));
  }
  
  if (workingCount === 4) {
    console.log('\n🎉 ALL SYSTEMS WORKING! Your React app should be able to connect and save.');
    console.log('🔧 Next step: Run your React app and test the save functionality.');
  } else if (results.wordpressApi && results.violetApi) {
    console.log('\n⚠️  Basic functionality available. Save function should work.');
    console.log('🔧 Next step: Test the save function in your React app.');
  } else {
    console.log('\n🚨 CRITICAL ISSUES DETECTED!');
    console.log('🔧 Action needed: Check WordPress backend and CORS configuration.');
  }
  
  return results;
};

// Run the test
testBackendConnectivity();

// Also provide easy re-run function
window.testBackend = testBackendConnectivity;
console.log('\n💡 TIP: Run window.testBackend() to re-run this test anytime');
