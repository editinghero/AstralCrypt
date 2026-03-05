import { encrypt, generateSalt, generateNonce } from '@notion-lock/crypto';
import { ContentType, NLOCK_CONSTANTS, NLockFile } from './types';

/**
 * Builds an NLOCK file from plaintext data
 * 
 * This function encrypts the plaintext, generates cryptographic material,
 * and constructs the complete NLOCK file structure with header and metadata.
 * 
 * @param plaintext - The data to encrypt (HTML or ZIP content)
 * @param type - The content type ('html' or 'zip')
 * @param password - The user's password for encryption
 * @returns A promise that resolves to the complete NLOCK file as Uint8Array
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */
export async function buildNLockFile(
  plaintext: Uint8Array,
  type: ContentType,
  password: string
): Promise<Uint8Array> {
  console.log('=== BUILD NLOCK FILE START ===');
  console.log('Plaintext size:', plaintext.length);
  console.log('Type:', type);
  console.log('Password length:', password.length);
  console.log('First 10 bytes of plaintext:', Array.from(plaintext.slice(0, 10)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
  
  // Encrypt the plaintext
  const encryptionResult = await encrypt(plaintext, password);
  
  console.log('Encryption result:');
  console.log('- Ciphertext length:', encryptionResult.ciphertext.length);
  console.log('- Tag length:', encryptionResult.tag.length);
  console.log('- Salt length:', encryptionResult.salt.length);
  console.log('- Nonce length:', encryptionResult.nonce.length);

  // Build the NLOCK file structure
  const nlock: NLockFile = {
    metadata: {
      version: NLOCK_CONSTANTS.VERSION,
      type,
      salt: encryptionResult.salt,
      nonce: encryptionResult.nonce,
      tag: encryptionResult.tag,
    },
    encryptedData: encryptionResult.ciphertext,
  };

  // Serialize to bytes
  const serialized = serializeNLockFile(nlock);
  console.log('Serialized NLOCK file size:', serialized.length);
  console.log('=== BUILD NLOCK FILE END ===');
  
  return serialized;
}

/**
 * Serializes an NLOCK file structure to bytes
 * 
 * Format:
 * - Magic header: "NLOC" (4 bytes)
 * - Version: 1 byte
 * - Type: 4 bytes (ASCII "html" or "zip")
 * - Salt length: 4 bytes (uint32 LE)
 * - Salt: variable bytes
 * - Nonce length: 4 bytes (uint32 LE)
 * - Nonce: variable bytes
 * - Tag length: 4 bytes (uint32 LE)
 * - Tag: variable bytes
 * - Data length: 4 bytes (uint32 LE)
 * - Encrypted data: variable bytes
 * 
 * @param nlock - The NLOCK file structure to serialize
 * @returns The serialized NLOCK file as Uint8Array
 */
export function serializeNLockFile(nlock: NLockFile): Uint8Array {
  const { metadata, encryptedData } = nlock;

  // Calculate total size
  const magicSize = 4;
  const versionSize = 1;
  const typeSize = 4;
  const saltLengthSize = 4;
  const nonceLengthSize = 4;
  const tagLengthSize = 4;
  const dataLengthSize = 4;

  const totalSize =
    magicSize +
    versionSize +
    typeSize +
    saltLengthSize +
    metadata.salt.length +
    nonceLengthSize +
    metadata.nonce.length +
    tagLengthSize +
    metadata.tag.length +
    dataLengthSize +
    encryptedData.length;

  // Create buffer
  const buffer = new Uint8Array(totalSize);
  let offset = 0;

  // Write magic header
  const magicBytes = new TextEncoder().encode(NLOCK_CONSTANTS.MAGIC_HEADER);
  buffer.set(magicBytes, offset);
  offset += magicSize;

  // Write version
  buffer[offset] = NLOCK_CONSTANTS.VERSION;
  offset += versionSize;

  // Write type (pad to 4 bytes)
  const typeBytes = new Uint8Array(4);
  const typeEncoded = new TextEncoder().encode(metadata.type);
  typeBytes.set(typeEncoded);
  buffer.set(typeBytes, offset);
  offset += typeSize;

  // Write salt length and salt
  writeUint32LE(buffer, offset, metadata.salt.length);
  offset += saltLengthSize;
  buffer.set(metadata.salt, offset);
  offset += metadata.salt.length;

  // Write nonce length and nonce
  writeUint32LE(buffer, offset, metadata.nonce.length);
  offset += nonceLengthSize;
  buffer.set(metadata.nonce, offset);
  offset += metadata.nonce.length;

  // Write tag length and tag
  writeUint32LE(buffer, offset, metadata.tag.length);
  offset += tagLengthSize;
  buffer.set(metadata.tag, offset);
  offset += metadata.tag.length;

  // Write data length and encrypted data
  writeUint32LE(buffer, offset, encryptedData.length);
  offset += dataLengthSize;
  buffer.set(encryptedData, offset);

  return buffer;
}

/**
 * Writes a 32-bit unsigned integer in little-endian format
 * 
 * @param buffer - The buffer to write to
 * @param offset - The offset in the buffer
 * @param value - The value to write
 */
function writeUint32LE(buffer: Uint8Array, offset: number, value: number): void {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >> 8) & 0xff;
  buffer[offset + 2] = (value >> 16) & 0xff;
  buffer[offset + 3] = (value >> 24) & 0xff;
}
