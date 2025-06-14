# 🔗 Backend Connectivity Restoration Guide
## WordPress GraphQL & REST API Access Recovery

---

## 📋 Previous Working Configuration

### **GraphQL Endpoint**
```typescript
// From src/lib/graphql-client.ts
const GRAPHQL_ENDPOINT = 'https://wp.violetrainwater.com/graphql'

// Working queries:
query GetSiteData {
  generalSettings {
    title
    description
    url
  }
  pages(first: 20) {
    nodes {
      id
      title
      content
      slug
      uri
    }
  }
}
```

### **REST API Endpoint**
```typescript
// From src/utils/wordpressContentSync.ts
const WORDPRESS_API_URL = 'https://wp.violetrainwater.com/wp-json/violet/v1/content'

// Available endpoints from functions.php:
// GET  /wp-json/violet/v1/content
// POST /wp-json/violet/v1/content/save-batch
// POST /wp-json/violet/v1/rich-content/save
```

---

## 🧪 Immediate Connectivity Tests

### **Test 1: Basic WordPress API**
Open browser console and run:
```javascript
// Test basic WordPress REST API
fetch('https://wp.violetrainwater.com/wp-json/')
  .then(r => r.json())
  .then(data => console.log('✅ WordPress API:', data))
  .catch(err => console.error('❌ WordPress API failed:', err));
```

### **Test 2: Custom Violet Endpoint**
```javascript
// Test your custom content endpoint
fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content')
  .then(r => r.json())
  .then(data => console.log('✅ Violet Content API:', data))
  .catch(err => console.error('❌ Violet API failed:', err));
```

### **Test 3: GraphQL Endpoint**
```javascript
// Test GraphQL endpoint
fetch('https://wp.violetrainwater.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `{
      generalSettings {
        title
        description
      }
    }`
  })
})
.then(r => r.json())
.then(data => console.log('✅ GraphQL:', data))
.catch(err => console.error('❌ GraphQL failed:', err));
```

---

## 🔧 Quick Fix Implementation

### **Step 1: Create Connectivity Test Component**
```typescript
// src/components/ConnectivityTest.tsx
import { useEffect, useState } from 'react';

export const ConnectivityTest = () => {
  const [results, setResults] = useState<any>({});

  useEffect(() => {
    testConnectivity();
  }, []);

  const testConnectivity = async () => {
    const tests = {
      wordpressApi: false,
      violetApi: false,
      graphql: false,
      cors: false
    };

    // Test WordPress API
    try {
      const wpResponse = await fetch('https://wp.violetrainwater.com/wp-json/');
      tests.wordpressApi = wpResponse.ok;
      tests.cors = wpResponse.ok; // If this works, CORS is OK
    } catch (error) {
      console.error('WordPress API test failed:', error);
    }

    // Test Violet API
    try {
      const violetResponse = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content');
      tests.violetApi = violetResponse.ok;
    } catch (error) {
      console.error('Violet API test failed:', error);
    }

    // Test GraphQL
    try {
      const gqlResponse = await fetch('https://wp.violetrainwater.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ generalSettings { title } }'
        })
      });
      tests.graphql = gqlResponse.ok;
    } catch (error) {
      console.error('GraphQL test failed:', error);
    }

    setResults(tests);
  };

  return (
    <div className="fixed top-4 left-4 bg-white p-4 rounded shadow-lg z-50 text-sm">
      <h3 className="font-bold mb-2">🔗 Connectivity Status</h3>
      <div className="space-y-1">
        <div>WordPress API: {results.wordpressApi ? '✅' : '❌'}</div>
        <div>Violet API: {results.violetApi ? '✅' : '❌'}</div>
        <div>GraphQL: {results.graphql ? '✅' : '❌'}</div>
        <div>CORS: {results.cors ? '✅' : '❌'}</div>
      </div>
      <button 
        onClick={testConnectivity}
        className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
      >
        Retest
      </button>
    </div>
  );
};
```

### **Step 2: Add to App.tsx for immediate testing**
```typescript
// Add to App.tsx imports
import { ConnectivityTest } from "./components/ConnectivityTest";

// Add inside the App component return, before closing tags:
{import.meta.env.DEV && <ConnectivityTest />}
```

### **Step 3: Enhanced Error Handling for GraphQL Client**
```typescript
// Update src/lib/graphql-client.ts
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const getGraphQLEndpoint = () => {
  if (window.location.hostname === 'localhost' || 
      window.location.hostname.includes('192.168') ||
      window.location.hostname.includes('172.') ||
      window.location.hostname.includes('127.0.0.1')) {
    return 'https://wp.violetrainwater.com/graphql';
  }
  return '/graphql';
};

const httpLink = createHttpLink({
  uri: getGraphQLEndpoint(),
});

// Enhanced error handling
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    
    // Attempt fallback for network errors
    if (networkError.message.includes('fetch')) {
      console.log('🔄 Attempting to reconnect GraphQL...');
      // Could implement retry logic here
    }
  }
});

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      networkPolicy: 'cache-first',
    },
    query: {
      errorPolicy: 'all',
      networkPolicy: 'cache-first',
    }
  }
});

console.log('🔗 GraphQL Endpoint:', getGraphQLEndpoint());
```

### **Step 4: Enhanced WordPress Content Sync**
```typescript
// Update src/utils/wordpressContentSync.ts with better error handling
const WORDPRESS_API_URL = 'https://wp.violetrainwater.com/wp-json/violet/v1/content';

export const syncWordPressContent = async (): Promise<boolean> => {
  try {
    console.log('🔄 Syncing content from WordPress...');
    
    const response = await fetch(WORDPRESS_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Add credentials if needed for authentication
      // credentials: 'include', 
    });
    
    if (!response.ok) {
      console.warn(`⚠️ WordPress API error: ${response.status} ${response.statusText}`);
      console.warn('📍 URL tested:', WORDPRESS_API_URL);
      
      // Try to get error details
      try {
        const errorText = await response.text();
        console.warn('🔍 Error details:', errorText);
      } catch (e) {
        console.warn('🔍 No error details available');
      }
      
      return false;
    }
    
    const wpContent = await response.json();
    console.log('✅ WordPress content received:', wpContent);
    
    if (wpContent && Object.keys(wpContent).length > 0) {
      saveContent(wpContent, false);
      window.dispatchEvent(new CustomEvent('violet-content-synced', { 
        detail: { content: wpContent, source: 'wordpress' } 
      }));
      console.log('💾 WordPress content synced successfully');
      return true;
    }
    
    console.log('ℹ️ WordPress returned empty content');
    return false;
  } catch (error) {
    console.error('❌ WordPress sync failed:', error);
    console.error('📍 URL that failed:', WORDPRESS_API_URL);
    return false;
  }
};
```

---

## 🚨 Troubleshooting Common Issues

### **Issue 1: CORS Errors**
**Symptoms:** 
- Console errors mentioning "CORS", "Access-Control-Allow-Origin", or "blocked by CORS policy"

**Solution:**
```php
// In WordPress functions.php (already implemented)
// Verify these lines are present:
add_action('rest_api_init', 'violet_unified_cors_setup');
function violet_unified_cors_setup() {
    // Handle OPTIONS preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        $origin = get_http_origin();
        $allowed_origins = _violet_get_allowed_origins();
        if ($origin && in_array($origin, $allowed_origins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
        status_header(200);
        exit;
    }
}
```

### **Issue 2: WordPress API Not Responding**
**Symptoms:** 
- 404 errors on `/wp-json/` endpoints
- "This page doesn't exist" errors

**Solution:**
```bash
# Check permalink structure in WordPress admin
WordPress Admin → Settings → Permalinks → Save Changes (flush permalinks)

# Or add this to .htaccess if needed:
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
```

### **Issue 3: GraphQL Plugin Issues**
**Symptoms:**
- GraphQL endpoint returns 404 or HTML instead of JSON

**Solution:**
```bash
# Check if WPGraphQL plugin is active
WordPress Admin → Plugins → Search for "WPGraphQL" → Activate

# If not installed, install WPGraphQL plugin:
WordPress Admin → Plugins → Add New → Search "WPGraphQL" → Install & Activate
```

### **Issue 4: Authentication Issues**
**Symptoms:**
- 401 or 403 errors on protected endpoints

**Solution:**
```typescript
// Add authentication headers if needed
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Add WordPress nonce if available
const wpNonce = (window as any).wpApiSettings?.nonce;
if (wpNonce) {
  headers['X-WP-Nonce'] = wpNonce;
}
```

---

## ⚡ Immediate Action Plan

### **Step 1: Run Connectivity Tests (5 minutes)**
1. Add the `ConnectivityTest` component to your app
2. Run `npm run dev`
3. Check the connectivity status panel
4. Note which tests fail

### **Step 2: Check WordPress Backend (5 minutes)**
1. Log into WordPress admin: https://wp.violetrainwater.com/wp-admin/
2. Go to Plugins → Check if WPGraphQL is active
3. Go to Settings → Permalinks → Save Changes (flush permalinks)
4. Test the endpoints manually in browser:
   - https://wp.violetrainwater.com/wp-json/
   - https://wp.violetrainwater.com/wp-json/violet/v1/content

### **Step 3: Fix CORS if Needed (10 minutes)**
1. Check browser console for CORS errors
2. Verify functions.php has the CORS handling code
3. Test from your React app domain

### **Step 4: Test Save Function (10 minutes)**
1. Once connectivity is restored, test the save function:
```javascript
// In browser console on your React app
fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content/save-batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    changes: [
      {
        field_name: 'test_field',
        field_value: 'test_value',
        format: 'plain'
      }
    ]
  })
})
.then(r => r.json())
.then(data => console.log('💾 Save test result:', data))
.catch(err => console.error('❌ Save test failed:', err));
```

---

## 🎯 Expected Working State

When everything is working correctly, you should see:

```bash
✅ WordPress API: 200 OK
✅ Violet Content API: Returns content object
✅ GraphQL: Returns site data
✅ CORS: No blocked requests
✅ Save Function: Successfully saves content
```

**Run the connectivity tests first and let me know what results you get!**