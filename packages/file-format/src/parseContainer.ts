import { decrypt } from '@notion-lock/crypto';
import { ContentType, NLOCK_CONSTANTS, NLockFile, NLockMetadata } from './types';

/**
 * Parses an NLOCK file from bytes
 * 
 * Extracts the header, metadata, and encrypted data from a serialized NLOCK file.
 * Does not decrypt the content - only parses the structure.
 * 
 * @param fileData - The NLOCK file data as Uint8Array
 * @returns The parsed NLOCK file structure, or null if parsing fails
 * 
 * Validates: Requirements 3.1, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */
export function parseNLockFile(fileData: Uint8Array): NLockFile | null {
  try {
    console.log('=== PARSE NLOCK FILE START ===');
    console.log('File data length:', fileData.length);
    let offset = 0;

    // Read and verify magic header
    const magicBytes = fileData.slice(offset, offset + 4);
    const magic = new TextDecoder().decode(magicBytes);
    console.log('Magic header:', magic, '(expected: NLOC)');
    if (magic !== NLOCK_CONSTANTS.MAGIC_HEADER) {
      console.error('PARSE FAILED: Invalid magic header');
      return null;
    }
    offset += 4;

    // Read version
    const version = fileData[offset];
    console.log('Version:', version, '(expected:', NLOCK_CONSTANTS.VERSION + ')');
    if (version !== NLOCK_CONSTANTS.VERSION) {
      console.error('PARSE FAILED: Invalid version');
      return null;
    }
    offset += 1;

    // Read type
    const typeBytes = fileData.slice(offset, offset + 4);
    const type = new TextDecoder().decode(typeBytes).replace(/\0/g, '').trim();
    console.log('Type:', type, '(raw bytes:', Array.from(typeBytes).map(b => '0x' + b.toString(16)).join(' ') + ')');
    if (type !== 'html' && type !== 'zip' && type !== 'pdf') {
      console.error('PARSE FAILED: Invalid type:', type);
      return null;
    }
    offset += 4;

    // Read salt
    console.log('About to read salt length at offset:', offset);
    const saltLength = readUint32LE(fileData, offset);
    console.log('Salt length:', saltLength);
    offset += 4;
    console.log('About to read salt bytes at offset:', offset, 'length:', saltLength);
    if (offset + saltLength > fileData.length) {
      console.error('PARSE FAILED: Salt length exceeds file size');
      return null;
    }
    const salt = fileData.slice(offset, offset + saltLength);
    offset += saltLength;
    console.log('Salt read successfully, new offset:', offset);

    // Read nonce
    console.log('About to read nonce length at offset:', offset);
    const nonceLength = readUint32LE(fileData, offset);
    console.log('Nonce length:', nonceLength);
    offset += 4;
    console.log('About to read nonce bytes at offset:', offset, 'length:', nonceLength);
    if (offset + nonceLength > fileData.length) {
      console.error('PARSE FAILED: Nonce length exceeds file size');
      return null;
    }
    const nonce = fileData.slice(offset, offset + nonceLength);
    offset += nonceLength;
    console.log('Nonce read successfully, new offset:', offset);

    // Read tag
    console.log('About to read tag length at offset:', offset);
    const tagLength = readUint32LE(fileData, offset);
    console.log('Tag length:', tagLength);
    offset += 4;
    console.log('About to read tag bytes at offset:', offset, 'length:', tagLength);
    if (offset + tagLength > fileData.length) {
      console.error('PARSE FAILED: Tag length exceeds file size');
      return null;
    }
    const tag = fileData.slice(offset, offset + tagLength);
    offset += tagLength;
    console.log('Tag read successfully, new offset:', offset);

    // Read encrypted data
    console.log('About to read data length at offset:', offset);
    const dataLength = readUint32LE(fileData, offset);
    console.log('Data length:', dataLength);
    offset += 4;
    console.log('About to read encrypted data at offset:', offset, 'length:', dataLength);
    if (offset + dataLength > fileData.length) {
      console.error('PARSE FAILED: Data length exceeds file size');
      return null;
    }
    const encryptedData = fileData.slice(offset, offset + dataLength);
    console.log('Encrypted data read successfully, new offset:', offset);

    // Construct and return the parsed file
    const metadata: NLockMetadata = {
      version,
      type: type as ContentType,
      salt,
      nonce,
      tag,
    };

    console.log('=== PARSE NLOCK FILE SUCCESS ===');
    return {
      metadata,
      encryptedData,
    };
  } catch (error) {
    console.error('PARSE FAILED: Exception:', error);
    return null;
  }
}

/**
 * Decrypts an NLOCK file with the provided password
 * 
 * Parses the NLOCK file, derives the key from the password,
 * and decrypts the content with authentication verification.
 * 
 * @param fileData - The NLOCK file data as Uint8Array
 * @param password - The user's password for decryption
 * @returns A promise that resolves to the decrypted plaintext, or null if decryption fails
 * 
 * Validates: Requirements 3.3, 4.5, 4.6
 */
export async function decryptNLockFile(
  fileData: Uint8Array,
  password: string
): Promise<Uint8Array | null> {
  console.log('=== DECRYPT NLOCK FILE START ===');
  console.log('File size:', fileData.length);
  console.log('Password length:', password.length);
  
  // Parse the NLOCK file
  const nlock = parseNLockFile(fileData);
  if (!nlock) {
    console.error('PARSE FAILED: Could not parse NLOCK file');
    return null;
  }

  console.log('Parse successful!');
  console.log('Type:', nlock.metadata.type);
  console.log('Salt length:', nlock.metadata.salt.length);
  console.log('Nonce length:', nlock.metadata.nonce.length);
  console.log('Tag length:', nlock.metadata.tag.length);
  console.log('Encrypted data length:', nlock.encryptedData.length);

  // Decrypt the content
  console.log('Starting decryption...');
  const plaintext = await decrypt(
    nlock.encryptedData,
    nlock.metadata.tag,
    password,
    nlock.metadata.salt,
    nlock.metadata.nonce
  );

  if (!plaintext) {
    console.error('DECRYPT FAILED: decrypt() returned null');
    return null;
  }

  console.log('Decryption successful! Plaintext size:', plaintext.length);
  console.log('First 10 bytes:', Array.from(plaintext.slice(0, 10)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
  console.log('=== DECRYPT NLOCK FILE END ===');

  return plaintext;
}

/**
 * Reads a 32-bit unsigned integer in little-endian format
 * 
 * @param buffer - The buffer to read from
 * @param offset - The offset in the buffer
 * @returns The read value
 */
function readUint32LE(buffer: Uint8Array, offset: number): number {
  return (
    buffer[offset] |
    (buffer[offset + 1] << 8) |
    (buffer[offset + 2] << 16) |
    (buffer[offset + 3] << 24)
  );
}
