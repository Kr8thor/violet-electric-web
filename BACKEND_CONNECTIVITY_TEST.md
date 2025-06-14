# 🔗 Backend Connectivity Testing & Save Function Setup
## WordPress-React Communication Diagnostics

---

## 🎯 Quick Test Commands

### **Test 1: Basic WordPress REST API**
```bash
# Test if WordPress REST API is responding
curl -I "https://wp.violetrainwater.com/wp-json/"

# Expected: 200 OK with JSON API info
```

### **Test 2: Custom Violet API Endpoints**
```bash
# Test your custom content endpoint
curl "https://wp.violetrainwater.com/wp-json/violet/v1/content"

# Expected: JSON object with all content fields
```

### **Test 3: GraphQL Endpoint (if enabled)**
```bash
# Test GraphQL
curl -X POST "https://wp.violetrainwater.com/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ generalSettings { title } }"}'

# Expected: {"data":{"generalSettings":{"title":"Violet Rainwater"}}}
```

---

## 🔧 React App Connectivity Setup

### **Step 1: Create API Configuration**
```typescript
// src/config/api.ts
export const API_CONFIG = {
  wordpress: {
    baseUrl: 'https://wp.violetrainwater.com',
    restEndpoint: '/wp-json/violet/v1/',
    graphqlEndpoint: '/graphql',
    timeout: 10000
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// CORS test function
export async function testCORS() {
  try {
    const response = await fetch(`${API_CONFIG.wordpress.baseUrl}/wp-json/`);
    console.log('✅ CORS working:', response.status);
    return true;
  } catch (error) {
    console.error('❌ CORS failed:', error);
    return false;
  }
}
```

### **Step 2: Create WordPress API Client**
```typescript
// src/utils/WordPressAPI.ts
class WordPressAPI {
  private baseUrl: string;
  private restBase: string;

  constructor() {
    this.baseUrl = 'https://wp.violetrainwater.com';
    this.restBase = '/wp-json/violet/v1/';
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}${this.restBase}content`);
      const data = await response.json();
      console.log('🔗 Connection test result:', data);
      return response.ok;
    } catch (error) {
      console.error('🚨 Connection failed:', error);
      return false;
    }
  }

  async getContent(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${this.restBase}content`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get content:', error);
      throw error;
    }
  }

  async saveContent(contentData: Record<string, any>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}${this.restBase}content/save-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication if needed
        },
        body: JSON.stringify({
          changes: Object.entries(contentData).map(([field, value]) => ({
            field_name: field,
            field_value: value,
            format: 'plain'
          }))
        })
      });

      const result = await response.json();
      console.log('💾 Save result:', result);
      
      if (result.success) {
        console.log(`✅ Saved ${result.saved_count} fields successfully`);
        return true;
      } else {
        console.error('❌ Save failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('🚨 Save error:', error);
      return false;
    }
  }
}

export const wordpressAPI = new WordPressAPI();
```

### **Step 3: Update React App with Connectivity Test**
```typescript