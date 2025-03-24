import { STORAGE_URLS } from "@/lib/utils/imageModule";

/**
 * Safely retrieves an image URL from the URL map, with fallback options
 * @param urlMap The URL map containing image keys and their corresponding URLs
 * @param path The image key to look up
 * @param defaultUrl Optional default URL to return if the image key is not found
 * @returns The image URL or an empty string if not found
 */
const safelyGetImageUrl = (
  urlMap: Record<string, string>,
  path: string | undefined | null,
  defaultUrl: string = ""
): string => {
  // If path is empty or null, return default
  if (!path) return defaultUrl;
  
  path = decodeURIComponent(path);

  // If path is already a full URL, return it directly
  if (path.startsWith('http')) return path;
  
  // If urlMap is empty, try to construct a URL from the path
  if (!urlMap || Object.keys(urlMap).length === 0) {
    // Check if path is a Supabase storage path
    for (const [bucket, url] of Object.entries(STORAGE_URLS)) {
      if (path.startsWith(bucket)) {
        return `${url}/${path.replace(`${bucket}/`, '')}`;
      }
    }
    
    // If path starts with a slash, it might be a relative path
    if (path.startsWith('/')) {
      // Try to construct a URL using the first storage bucket
      const firstBucketUrl = Object.values(STORAGE_URLS)[0];
      if (firstBucketUrl) {
        return `${firstBucketUrl}${path}`;
      }
    }
    
    return defaultUrl;
  }
  
  // Try to get URL from map, with decoding for safety
  try {
    // First try with the path as is
    if (urlMap[path]) return urlMap[path];
    
    // Then try with decoded path
    const decodedPath = decodeURIComponent(path);
    if (urlMap[decodedPath]) return urlMap[decodedPath];
    
    // If still not found, try to construct a URL
    for (const [bucket, url] of Object.entries(STORAGE_URLS)) {
      if (path.includes(bucket)) {
        return `${url}/${path.split(bucket + '/')[1] || path}`;
      }
    }
    
    return defaultUrl;
  } catch (error) {
    console.error("Error decoding image path:", error);
    return urlMap[path] || defaultUrl;
  }
};

export default safelyGetImageUrl;
