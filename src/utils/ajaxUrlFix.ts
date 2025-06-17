/**
 * Fix for incorrect AJAX URL calls
 * 
 * Problem: Some code is trying to call admin-ajax.php on the Netlify URL instead of WordPress URL
 * Solution: Override AJAX URLs and redirect calls to correct WordPress endpoint
 */

// Correct WordPress URLs
const WORDPRESS_BASE_URL = 'https://wp.violetrainwater.com';
const WORDPRESS_AJAX_URL = `${WORDPRESS_BASE_URL}/wp-admin/admin-ajax.php`;
const WORDPRESS_REST_API = `${WORDPRESS_BASE_URL}/wp-json/violet/v1`;

/**
 * Override global AJAX URL variables that might be set incorrectly
 */
export function fixWordPressAjaxUrls() {
  // Override global ajaxurl if it exists
  if (typeof (window as any).ajaxurl !== 'undefined') {
    (window as any).ajaxurl = WORDPRESS_AJAX_URL;
    console.log('🔧 Fixed global ajaxurl:', WORDPRESS_AJAX_URL);
  }

  // Override any jQuery AJAX URL if it exists
  if (typeof (window as any).$ !== 'undefined' && (window as any).$.ajaxSetup) {
    (window as any).$.ajaxSetup({
      beforeSend: function(xhr: any, settings: any) {
        // Redirect any admin-ajax.php calls to the correct WordPress URL
        if (settings.url && settings.url.includes('admin-ajax.php')) {
          if (!settings.url.startsWith('https://wp.violetrainwater.com')) {
            settings.url = WORDPRESS_AJAX_URL;
            console.log('🔧 Redirected AJAX call to:', settings.url);
          }
        }
      }
    });
  }

  // Override fetch calls to admin-ajax.php
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    // Redirect admin-ajax.php calls
    if (url && url.includes('admin-ajax.php') && !url.startsWith('https://wp.violetrainwater.com')) {
      url = WORDPRESS_AJAX_URL;
      console.log('🔧 Redirected fetch call to:', url);
      input = url;
    }
    
    return originalFetch.call(this, input, init);
  };
}

/**
 * Intercept XMLHttpRequest calls and fix URLs
 */
export function interceptXHRCalls() {
  const originalOpen = XMLHttpRequest.prototype.open;
  
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
    let urlString = url.toString();
    
    // Redirect admin-ajax.php calls to correct WordPress URL
    if (urlString.includes('admin-ajax.php') && !urlString.startsWith('https://wp.violetrainwater.com')) {
      urlString = WORDPRESS_AJAX_URL;
      console.log('🔧 Redirected XHR call to:', urlString);
    }
    
    return originalOpen.call(this, method, urlString, ...args);
  };
}

/**
 * Initialize all AJAX URL fixes
 */
export function initializeAjaxUrlFixes() {
  console.log('🚀 Initializing AJAX URL fixes...');
  
  // Apply fixes immediately
  fixWordPressAjaxUrls();
  interceptXHRCalls();
  
  // Apply fixes again after DOM is loaded in case scripts load late
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(fixWordPressAjaxUrls, 1000);
    });
  } else {
    setTimeout(fixWordPressAjaxUrls, 1000);
  }
  
  console.log('✅ AJAX URL fixes initialized');
}

// Auto-initialize when this module is imported
initializeAjaxUrlFixes();
