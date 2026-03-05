/**
 * ZIP Validator
 * 
 * Validates that uploaded files are valid ZIP archives.
 * Validates: Requirements 2.1, 10.2
 */

/**
 * ZIP file magic bytes (local file header signature)
 */
const ZIP_MAGIC_BYTES = [0x50, 0x4b, 0x03, 0x04]; // "PK\x03\x04"

/**
 * Validates if the given data is a valid ZIP archive
 * 
 * @param data - The file data as Uint8Array
 * @returns true if the data appears to be a valid ZIP archive, false otherwise
 */
export function validateZip(data: Uint8Array): boolean {
  try {
    // Check minimum size for ZIP header
    if (data.length < 4) {
      return false;
    }

    // Check for ZIP magic bytes
    for (let i = 0; i < ZIP_MAGIC_BYTES.length; i++) {
      if (data[i] !== ZIP_MAGIC_BYTES[i]) {
        return false;
      }
    }

    // Try to parse with JSZip to validate structure
    return validateZipStructure(data);
  } catch (error) {
    return false;
  }
}

/**
 * Validates ZIP structure using JSZip
 * 
 * @param data - The ZIP file data
 * @returns true if the ZIP structure is valid
 */
async function validateZipStructure(data: Uint8Array): Promise<boolean> {
  try {
    const JSZip = await import('jszip');
    const zip = new JSZip.default();
    await zip.loadAsync(data);
    return true;
  } catch (error) {
    return false;
  }
}
