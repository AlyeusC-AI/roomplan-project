// Create a reusable API client that automatically handles auth
export async function apiClient(endpoint: string, options: RequestInit = {}) {
  // Prepare headers with auth token
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Ensure endpoint has v1 prefix
  const apiEndpoint = endpoint.startsWith("/api/v1/")
    ? endpoint
    : `/api/v1${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Make the API request
  const response = await fetch(apiEndpoint, {
    ...options,
    headers,
  });

  // Handle unauthorized responses
  if (response.status === 401) {
    // Could sign out the user or redirect to login
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  // Return null for 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
