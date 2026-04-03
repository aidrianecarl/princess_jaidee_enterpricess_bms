export function getApiImageUrl(imagePath: string): string {
  const base = "https://api.princessjaideeenterprises.com"

  if (!imagePath) return ""

  // If already full URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    // Force correct subdomain if wrong
    return imagePath.replace(
      "www.princessjaideeenterprises.com",
      "api.princessjaideeenterprises.com"
    )
  }

  // Normalize path
  let cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath

  // ✅ Avoid double /api/
  if (cleanPath.startsWith("api/")) {
    return `${base}/${cleanPath}`
  }

  // ✅ Default case (add /api/)
  return `${base}/api/${cleanPath}`
}