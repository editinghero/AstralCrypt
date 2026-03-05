/**
 * Asset Resolver
 * 
 * Note: Asset resolution in encrypted ZIPs is not reliable in browser context.
 * Users should download the ZIP file to view assets properly.
 */

/**
 * Placeholder function - asset resolution removed due to browser limitations
 */
export function resolveAssets(html: string, _assets: Map<string, Uint8Array>): string {
  // Return HTML as-is
  // Assets cannot be reliably embedded in browser context
  return html;
}

/**
 * Revokes Blob URLs to free up memory
 */
export function revokeBlobUrls(urls: string[]): void {
  for (const url of urls) {
    URL.revokeObjectURL(url);
  }
}
