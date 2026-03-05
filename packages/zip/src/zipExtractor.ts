import JSZip from 'jszip';

/**
 * ZIP Extractor
 * 
 * Extracts ZIP archive contents and locates main HTML file.
 * Validates: Requirements 3.5, 8.1
 */

/**
 * Extracts ZIP contents into a map of filename to file data
 * 
 * @param zipData - The ZIP file data as Uint8Array
 * @returns A promise that resolves to a map of filenames to file data
 */
export async function extractZip(zipData: Uint8Array): Promise<Map<string, Uint8Array>> {
  const zip = new JSZip();
  await zip.loadAsync(zipData);

  const files = new Map<string, Uint8Array>();

  for (const [filename, file] of Object.entries(zip.files)) {
    if (!file.dir) {
      const data = await file.async('uint8array');
      files.set(filename, data);
    }
  }

  return files;
}

/**
 * Finds the main HTML file in extracted ZIP contents
 * 
 * Looks for index.html first, then any .html file in the root directory.
 * 
 * @param files - Map of filenames to file data
 * @returns The filename of the main HTML file, or null if not found
 */
export function findMainHtml(files: Map<string, Uint8Array>): string | null {
  // Look for index.html first
  for (const filename of files.keys()) {
    if (filename.toLowerCase() === 'index.html') {
      return filename;
    }
  }

  // Look for any .html file in root directory
  for (const filename of files.keys()) {
    if (filename.endsWith('.html') && !filename.includes('/')) {
      return filename;
    }
  }

  // Look for any .html file
  for (const filename of files.keys()) {
    if (filename.endsWith('.html')) {
      return filename;
    }
  }

  return null;
}
