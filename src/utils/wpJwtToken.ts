// Centralized JWT token for WordPress API authentication

let _jwtToken = '';

export function getJwtToken(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('WP_JWT_TOKEN') || _jwtToken || '';
  }
  return _jwtToken || '';
}

export function setJwtToken(token: string) {
  _jwtToken = token;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('WP_JWT_TOKEN', token);
  }
} 