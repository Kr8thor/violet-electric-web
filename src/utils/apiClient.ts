class VioletAPIClient {
  private apiKey: string;
  private nonce: string;
  
  constructor() {
    // Multiple fallback methods for getting API key
    this.apiKey = this.getAPIKey();
    this.nonce = (window as any).violet?.nonce || '';
    
    console.log('🔧 VioletAPIClient initialized:');
    console.log('API Key available:', !!this.apiKey);
    console.log('API Key length:', this.apiKey?.length || 0);
    console.log('Nonce available:', !!this.nonce);
    
    if (!this.apiKey) {
      console.error('❌ No API key found! Check environment configuration.');
    }
  }
  
  private getAPIKey(): string {
    // Try multiple methods to get the API key
    const methods = [
      () => import.meta.env.VITE_VIOLET_API_KEY,
      () => (window as any).__VITE_VIOLET_API_KEY__,
      () => (window as any).VITE_VIOLET_API_KEY,
      () => '3Tr2PwndilEui9rgb55XbRzQECupVGKr' // Fallback
    ];
    
    for (let i = 0; i < methods.length; i++) {
      try {
        const key = methods[i]();
        if (key && typeof key === 'string' && key.length > 0) {
          console.log(`✅ API Key found via method ${i + 1}`);
          return key;
        }
      } catch (error) {
        console.log(`Method ${i + 1} failed:`, error.message);
        continue;
      }
    }
    
    console.error('❌ No API key found in any method');
    return '';
  }
  
  async saveContent(changes: Array<{field_name: string, field_value: any}>): Promise<any> {
    if (!this.apiKey) {
      throw new Error('API key not available. Check environment configuration.');
    }
    
    if (!this.nonce) {
      console.warn('⚠️ No WordPress nonce available. Trying without nonce...');
    }
    
    console.log('💾 Saving content...');
    console.log('Changes:', changes);
    console.log('API Key (first 10):', this.apiKey.substring(0, 10));
    console.log('Using nonce:', !!this.nonce);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Violet-API-Key': this.apiKey
    };
    
    if (this.nonce) {
      headers['X-WP-Nonce'] = this.nonce;
    }
    
    try {
      const response = await fetch('/wp-json/violet/v1/save-batch', {
        method: 'POST',
        headers,
        body: JSON.stringify({ changes })
      });
      
      console.log('📨 Response status:', response.status);
      console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📨 Response data:', data);
      
      if (!response.ok) {
        console.error('❌ Save failed:', data);
        throw new Error(`Save failed (${response.status}): ${data.message || 'Unknown error'}`);
      }
      
      console.log('✅ Save successful:', data);
      return data;
    } catch (error) {
      console.error('❌ Network/Parse error:', error);
      throw error;
    }
  }
  
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing API connection...');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (this.apiKey) {
        headers['X-Violet-API-Key'] = this.apiKey;
      }
      
      if (this.nonce) {
        headers['X-WP-Nonce'] = this.nonce;
      }
      
      const response = await fetch('/wp-json/violet/v1/debug', {
        method: 'GET',
        headers
      });
      
      const data = await response.json();
      console.log('🔍 Connection test result:', {
        status: response.status,
        ok: response.ok,
        data
      });
      
      return response.ok;
    } catch (error) {
      console.error('🔍 Connection test failed:', error);
      return false;
    }
  }
  
  // Method to refresh nonce if needed
  refreshNonce(): void {
    this.nonce = (window as any).violet?.nonce || '';
    console.log('🔄 Nonce refreshed:', !!this.nonce);
  }
  
  // Method to manually set API key for testing
  setAPIKey(key: string): void {
    this.apiKey = key;
    console.log('🔧 API Key manually set:', key.substring(0, 10) + '...');
  }
}

export default VioletAPIClient;