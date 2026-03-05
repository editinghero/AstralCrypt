/**
 * PDF Validator
 * 
 * Validates that uploaded files are valid PDF documents.
 */

/**
 * Validates if the given data is a valid PDF
 * 
 * @param data - The file data as Uint8Array
 * @returns true if the data appears to be a valid PDF, false otherwise
 */
export function validatePdf(data: Uint8Array): boolean {
  try {
    // Check for PDF magic header (%PDF-)
    if (data.length < 5) {
      return false;
    }

    const header = new TextDecoder().decode(data.slice(0, 5));
    return header.startsWith('%PDF-');
  } catch (error) {
    return false;
  }
}