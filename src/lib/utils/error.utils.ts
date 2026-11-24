/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Utility functions for error handling and redirects
 */

export type ErrorType = 'network' | 'server' | 'general';

export interface ErrorRedirectOptions {
  type: ErrorType;
  from?: string;
  delay?: number;
}

/**
 * Redirects to appropriate error page based on error type
 */
export const redirectToErrorPage = (options: ErrorRedirectOptions) => {
  if (typeof window === 'undefined') return;
  
  const { type, from, delay = 100 } = options;
  const currentPath = from || window.location.pathname;
  
  const params = new URLSearchParams();
  params.set('type', type);
  params.set('from', currentPath);
  
  const errorPath = type === 'network' ? '/network-error' : '/error';
  const url = `${errorPath}?${params.toString()}`;
  
  setTimeout(() => {
    window.location.href = url;
  }, delay);
};

/**
 * Checks if the current page is an error page
 */
export const isErrorPage = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const pathname = window.location.pathname;
  return pathname.includes('/error') || pathname.includes('/network-error');
};

/**
 * Gets the previous page from URL parameters
 */
export const getPreviousPage = (): string => {
  if (typeof window === 'undefined') return '/';
  
  const params = new URLSearchParams(window.location.search);
  return params.get('from') || '/';
};

/**
 * Determines error type based on error object
 */
export const getErrorType = (error: any): ErrorType => {
  // Network errors
  if (!error.response || 
      error.code === 'ERR_NETWORK' || 
      error.code === 'ERR_CONNECTION_REFUSED' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('Connection refused') ||
      !navigator.onLine) {
    return 'network';
  }
  
  // Server errors
  const status = error.response?.status;
  if (status >= 500 && status <= 599) {
    return 'server';
  }
  
  // General errors
  return 'general';
};

/**
 * Resets the redirect flag (used by axios interceptor)
 */
export const resetRedirectFlag = () => {
  // This will be used by the axios instance to reset the redirect flag
  if (typeof window !== 'undefined') {
    // Reset flag when navigating away from error pages
    if (!isErrorPage()) {
      // The flag will be reset in the axios instance
    }
  }
};
