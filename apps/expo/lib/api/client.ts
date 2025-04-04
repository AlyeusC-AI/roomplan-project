import { userStore } from '@/lib/state/user';

const API_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://restoregeek.app';

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const { session } = userStore.getState();

  console.log(API_URL);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add auth token if available
  if (session?.access_token) {
    headers['auth-token'] = `${session.access_token}`;
  }

  // Ensure endpoint has v1 prefix if not already there
  const apiEndpoint = endpoint.startsWith('/api/v1/') 
    ? endpoint 
    : `/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(`${API_URL}${apiEndpoint}`, {
    ...options,
    headers,
  });

  // Handle unauthorized responses
  if (response.status === 401) {
    userStore.getState().clearSession();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'API error';
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.message || `API error: ${response.statusText}`;
    } catch {
      errorMessage = `API error: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }

  // Return null for 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
} 