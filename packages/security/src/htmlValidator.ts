/**
 * HTML Validator
 * 
 * Validates that uploaded files are valid HTML documents.
 * Validates: Requirements 1.1, 10.1
 */

/**
 * Validates if the given data is valid HTML
 * 
 * @param data - The file data as Uint8Array
 * @returns true if the data appears to be valid HTML, false otherwise
 */
export function validateHtml(data: Uint8Array): boolean {
  try {
    // Convert to string
    const text = new TextDecoder().decode(data);

    // Check for HTML structure
    const trimmed = text.trim().toLowerCase();

    // Must start with <!DOCTYPE or <html or contain html tags
    if (
      trimmed.startsWith('<!doctype') ||
      trimmed.startsWith('<html') ||
      trimmed.includes('<html')
    ) {
      return true;
    }

    // Try to parse as HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Check if parsing resulted in an error
    if (doc.documentElement.tagName === 'parsererror') {
      return false;
    }

    // Valid HTML if it has html or body elements
    return doc.documentElement.tagName === 'HTML' || doc.body !== null;
  } catch (error) {
    return false;
  }
}
