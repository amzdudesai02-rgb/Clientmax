/**
 * API utility functions with timeout and error handling
 * Handles Render.com wake-up delays gracefully
 */

const API_TIMEOUT = 30000; // 30 seconds
const WAKE_UP_RETRY_DELAY = 2000; // 2 seconds between retries
const MAX_RETRIES = 3;

export interface ApiError extends Error {
  isTimeout?: boolean;
  isNetworkError?: boolean;
  status?: number;
}

/**
 * Fetch with timeout and retry logic for Render.com wake-up
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle timeout/abort
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      if (retries > 0) {
        // Wait a bit for service to wake up, then retry
        await new Promise((resolve) => setTimeout(resolve, WAKE_UP_RETRY_DELAY));
        return fetchWithTimeout(url, options, retries - 1);
      }
      const timeoutError: ApiError = new Error(
        'Request timeout: The backend service is waking up. This may take up to 30 seconds. Please wait and try again.'
      );
      timeoutError.isTimeout = true;
      throw timeoutError;
    }

    // Handle network errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, WAKE_UP_RETRY_DELAY));
        return fetchWithTimeout(url, options, retries - 1);
      }
      const networkError: ApiError = new Error(
        'Network error: Unable to reach the server. The service may be waking up or there may be a connection issue.'
      );
      networkError.isNetworkError = true;
      throw networkError;
    }

    throw error;
  }
}

/**
 * Wake up the backend service by pinging the health endpoint
 */
export async function wakeUpBackend(apiUrl?: string): Promise<boolean> {
  const backendUrl = apiUrl || import.meta.env.VITE_API_URL || 'https://max.amzdudes.io';
  
  try {
    const response = await fetchWithTimeout(`${backendUrl}/api/health`, {
      method: 'GET',
    }, 1); // Only 1 retry for wake-up ping
    
    return response.ok;
  } catch (error) {
    console.warn('Backend wake-up ping failed:', error);
    return false;
  }
}
