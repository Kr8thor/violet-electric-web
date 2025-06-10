/**
 * Enhanced Content Storage with Better Persistence
 * Fixes the issue where content reverts after save
 */

const CONTENT_KEY = 'violet-content';
const GRACE_PERIOD_KEY = 'violet-grace-period-end';
const PROTECTED_CONTENT_KEY = 'violet-protected-content';

export interface VioletContent {
  [key: string]: string;
}

/**
 * Save content with protection during grace period
 */
export function saveContentWithProtection(updates: Partial<VioletContent>, isFromWordPress: boolean = false): void {
  console.log('💾 saveContentWithProtection called:', { updates, isFromWordPress });
  
  // Get current content
  const currentContent = getAllContentSync();
  const mergedContent = { ...currentContent, ...updates };
  
  // Save to main storage
  localStorage.setItem(CONTENT_KEY, JSON.stringify(mergedContent));
  
  // If this is from WordPress, also save to protected storage and set grace period
  if (isFromWordPress) {
    localStorage.setItem(PROTECTED_CONTENT_KEY, JSON.stringify(mergedContent));
    const graceEnd = Date.now() + 30000; // 30 seconds
    localStorage.setItem(GRACE_PERIOD_KEY, graceEnd.toString());
    console.log('🛡️ Content protected until:', new Date(graceEnd).toISOString());
  }
  
  // Dispatch event
  window.dispatchEvent(new CustomEvent('violet-content-updated', { 
    detail: updates 
  }));
}

/**
 * Get all content with grace period protection
 */
export function getAllContentWithProtection(): VioletContent {
  try {
    // Check if we're in grace period
    const graceEnd = localStorage.getItem(GRACE_PERIOD_KEY);
    if (graceEnd) {
      const remaining = parseInt(graceEnd) - Date.now();
      if (remaining > 0) {
        // We're in grace period, return protected content
        const protectedContent = localStorage.getItem(PROTECTED_CONTENT_KEY);
        if (protectedContent) {
          console.log('🛡️ Returning protected content (grace period active)');
          return JSON.parse(protectedContent);
        }
      } else {
        // Grace period expired, clean up
        localStorage.removeItem(GRACE_PERIOD_KEY);
        localStorage.removeItem(PROTECTED_CONTENT_KEY);
      }
    }
    
    // Normal content retrieval
    const stored = localStorage.getItem(CONTENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading content:', error);
  }
  
  return {};
}

/**
 * Check if we're in grace period
 */
export function isInGracePeriod(): boolean {
  const graceEnd = localStorage.getItem(GRACE_PERIOD_KEY);
  if (graceEnd) {
    const remaining = parseInt(graceEnd) - Date.now();
    return remaining > 0;
  }
  return false;
}

/**
 * Get grace period end time
 */
export function getGracePeriodEnd(): number | null {
  const graceEnd = localStorage.getItem(GRACE_PERIOD_KEY);
  return graceEnd ? parseInt(graceEnd) : null;
}

/**
 * Clear grace period (for testing)
 */
export function clearGracePeriod(): void {
  localStorage.removeItem(GRACE_PERIOD_KEY);
  localStorage.removeItem(PROTECTED_CONTENT_KEY);
  console.log('🗑️ Grace period cleared');
}

// Re-export existing functions with enhanced behavior
export { getAllContentSync } from './contentStorage';

// Override the original saveContent to use protection
export const saveContent = saveContentWithProtection;

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).violetContentDebug = {
    isInGracePeriod,
    getGracePeriodEnd,
    clearGracePeriod,
    getAllContent: getAllContentWithProtection,
    getProtectedContent: () => {
      const content = localStorage.getItem(PROTECTED_CONTENT_KEY);
      return content ? JSON.parse(content) : null;
    }
  };
}
