import { getJwtToken } from './wpJwtToken';

const WORDPRESS_API_URL = 'https://wp.violetrainwater.com/wp-json/violet/v1';

interface SaveChange {
  field_name: string;
  content: string;
  format?: string;
  editor?: string;
}

export const saveToWordPressAPI = async (changes: SaveChange[]): Promise<{ success: boolean; message?: string; data?: any }> => {
  try {
    console.log('🚀 Saving directly to WordPress API...', changes);
    const response = await fetch(`${WORDPRESS_API_URL}/rich-content/save-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getJwtToken()}`
      },
      body: JSON.stringify({ changes })
    });
    if (!response.ok) {
      console.error('❌ Save API response not OK:', response.status, response.statusText);
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    const result = await response.json();
    console.log('✅ Save API response:', result);
    return {
      success: result.success || false,
      message: result.message || 'Unknown response',
      data: result
    };
  } catch (error) {
    console.error('❌ Save API error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const elementToSaveChange = (element: HTMLElement): SaveChange => {
  const fieldName = element.getAttribute('data-violet-field') || 
                   element.getAttribute('data-field') ||
                   element.id ||
                   `element_${Date.now()}`;
  return {
    field_name: fieldName,
    content: element.innerHTML,
    format: 'rich',
    editor: 'direct_api'
  };
};

export const testWordPressAPI = async (): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    console.log('🧪 Testing WordPress API connection...');
    const response = await fetch(`${WORDPRESS_API_URL}/debug-test`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getJwtToken()}`
      }
    });
    if (!response.ok) {
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    const result = await response.json();
    console.log('✅ API test response:', result);
    return {
      success: true,
      message: 'API connection successful',
      data: result
    };
  } catch (error) {
    console.error('❌ API test error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export function isUserAuthenticated(): boolean {
  return !!getJwtToken();
} 