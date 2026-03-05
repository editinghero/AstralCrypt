import { deriveKey } from './deriveKey';

export interface EncryptionResult {
  ciphertext: Uint8Array;
  tag: Uint8Array;
  salt: Uint8Array;
  nonce: Uint8Array;
}

/**
 * Generates a cryptographically secure random salt
 * 
 * @returns A random salt suitable for key derivation
 */
export async function generateSalt(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generates a cryptographically secure random nonce
 * 
 * @returns A random nonce for AES-GCM
 */
export async function generateNonce(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Encrypts data using AES-256-GCM with authentication
 * 
 * @param plaintext - The data to encrypt
 * @param password - The user's password
 * @returns A promise that resolves to encryption result with ciphertext, tag, salt, and nonce
 * 
 * Validates: Requirements 1.3, 2.3, 4.1, 4.3, 4.4
 */
export async function encrypt(
  plaintext: Uint8Array,
  password: string
): Promise<EncryptionResult> {
  // Generate random salt and nonce
  const salt = await generateSalt();
  const nonce = await generateNonce();

  // Derive key from password
  const keyBytes = await deriveKey(password, salt);
  
  // Import key for AES-GCM
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    'AES-GCM',
    false,
    ['encrypt']
  );

  // Encrypt using AES-256-GCM
  const ciphertextWithTag = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: 128, // 16 bytes
    },
    key,
    plaintext
  );

  const ciphertextWithTagArray = new Uint8Array(ciphertextWithTag);
  
  // Extract tag (last 16 bytes) and ciphertext
  const TAG_LENGTH = 16;
  const tag = ciphertextWithTagArray.slice(-TAG_LENGTH);
  const ciphertext = ciphertextWithTagArray.slice(0, -TAG_LENGTH);

  return {
    ciphertext,
    tag,
    salt,
    nonce,
  };
}
