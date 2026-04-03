/**
 * API URL Utilities
 * Ensures correct API endpoint URLs are used throughout the application
 */

/**
 * Get the correct API base URL for images and file storage
 */
export function getApiImageUrl(imagePath: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  
  // If the imagePath already contains the full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // If it's pointing to www.princessjaideeenterprises.com, redirect to api.
    if (imagePath.includes('www.princessjaideeenterprises.com')) {
      return imagePath.replace('www.princessjaideeenterprises.com', 'api.princessjaideeenterprises.com')
    }
    return imagePath
  }
  
  // Remove leading slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  
  // Construct the API URL
  return `${apiUrl}/api/${cleanPath}`
}

/**
 * Get the API base URL
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
}
