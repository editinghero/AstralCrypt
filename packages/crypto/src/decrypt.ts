import { deriveKey } from './deriveKey';

/**
 * Decrypts data using AES-256-GCM with authentication verification
 * 
 * @param ciphertext - The encrypted data
 * @param tag - The authentication tag
 * @param password - The user's password
 * @param salt - The salt used during encryption
 * @param nonce - The nonce used during encryption
 * @returns A promise that resolves to the plaintext, or null if authentication fails
 * 
 * Validates: Requirements 3.3, 4.5, 4.6
 */
export async function decrypt(
  ciphertext: Uint8Array,
  tag: Uint8Array,
  password: string,
  salt: Uint8Array,
  nonce: Uint8Array
): Promise<Uint8Array | null> {
  try {
    // Derive key from password
    const keyBytes = await deriveKey(password, salt);
    
    // Import key for AES-GCM
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      'AES-GCM',
      false,
      ['decrypt']
    );

    // Combine ciphertext and tag for decryption
    const ciphertextWithTag = new Uint8Array(ciphertext.length + tag.length);
    ciphertextWithTag.set(ciphertext);
    ciphertextWithTag.set(tag, ciphertext.length);

    // Decrypt and verify authentication tag
    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonce,
        tagLength: 128, // 16 bytes
      },
      key,
      ciphertextWithTag
    );

    return new Uint8Array(plaintext);
  } catch (error) {
    // Authentication failed or decryption error
    return null;
  }
}
