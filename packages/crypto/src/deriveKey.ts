/**
 * Derives an encryption key from a password using PBKDF2 (Web Crypto API)
 * 
 * @param password - The user's password
 * @param salt - The salt for key derivation
 * @returns A promise that resolves to the derived key
 * 
 * Validates: Requirements 1.2, 2.2, 3.2, 4.2
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  // Use Web Crypto API for key derivation (more reliable than libsodium in browser)
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // Strong iteration count
      hash: 'SHA-256',
    },
    keyMaterial,
    256 // 256 bits = 32 bytes
  );
  
  return new Uint8Array(derivedBits);
}
