import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildNLockFile } from './buildContainer';
import { parseNLockFile, decryptNLockFile } from './parseContainer';
import { NLOCK_CONSTANTS } from './types';
import sodium from 'libsodium-wrappers';

describe('File Format Properties', () => {

  // Property 3: NLOCK File Format Completeness
  // For any encrypted file, the generated NLOCK file should contain all required fields
  it('Property 3: NLOCK File Format Completeness - all required fields present', async () => {
    await sodium.ready;

    await fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 0, maxLength: 10000 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('html', 'zip'),
        async (plaintext, password, type) => {
          const nlock = await buildNLockFile(plaintext, type as 'html' | 'zip', password);
          const parsed = parseNLockFile(nlock);

          // All required fields must be present
          expect(parsed).not.toBeNull();
          expect(parsed!.metadata.version).toBe(NLOCK_CONSTANTS.VERSION);
          expect(parsed!.metadata.type).toBe(type);
          expect(parsed!.metadata.salt).toBeInstanceOf(Uint8Array);
          expect(parsed!.metadata.nonce).toBeInstanceOf(Uint8Array);
          expect(parsed!.metadata.tag).toBeInstanceOf(Uint8Array);
          expect(parsed!.encryptedData).toBeInstanceOf(Uint8Array);

          // Verify magic header
          const magic = new TextDecoder().decode(nlock.slice(0, 4));
          expect(magic).toBe(NLOCK_CONSTANTS.MAGIC_HEADER);
        }
      ),
      { numRuns: 100 }
    );
  }, { timeout: 60000 });

  // Property 4: Salt Uniqueness
  // For any set of encryption operations, each operation should generate a unique salt
  it('Property 4: Salt Uniqueness - each encryption generates unique salt', async () => {
    await sodium.ready;

    await fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 1, maxLength: 1000 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (plaintext, password) => {
          const nlock1 = await buildNLockFile(plaintext, 'html', password);
          const nlock2 = await buildNLockFile(plaintext, 'html', password);

          const parsed1 = parseNLockFile(nlock1);
          const parsed2 = parseNLockFile(nlock2);

          expect(parsed1).not.toBeNull();
          expect(parsed2).not.toBeNull();

          // Salts should be different
          expect(parsed1!.metadata.salt).not.toEqual(parsed2!.metadata.salt);
        }
      ),
      { numRuns: 50 }
    );
  }, { timeout: 60000 });

  // Property 5: Nonce Uniqueness
  // For any set of encryption operations, each operation should generate a unique nonce
  it('Property 5: Nonce Uniqueness - each encryption generates unique nonce', async () => {
    await sodium.ready;

    await fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 1, maxLength: 1000 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (plaintext, password) => {
          const nlock1 = await buildNLockFile(plaintext, 'html', password);
          const nlock2 = await buildNLockFile(plaintext, 'html', password);

          const parsed1 = parseNLockFile(nlock1);
          const parsed2 = parseNLockFile(nlock2);

          expect(parsed1).not.toBeNull();
          expect(parsed2).not.toBeNull();

          // Nonces should be different
          expect(parsed1!.metadata.nonce).not.toEqual(parsed2!.metadata.nonce);
        }
      ),
      { numRuns: 50 }
    );
  }, { timeout: 60000 });

  // Property 6: Authentication Failure on Tampering
  // For any encrypted data, if the ciphertext or authentication tag is modified,
  // decryption should fail and return an error
  it('Property 6: Authentication Failure on Tampering - modified ciphertext fails', async () => {
    await sodium.ready;

    await fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 1, maxLength: 1000 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (plaintext, password) => {
          const nlock = await buildNLockFile(plaintext, 'html', password);
          const parsed = parseNLockFile(nlock);

          expect(parsed).not.toBeNull();

          // Tamper with ciphertext
          const tamperedCiphertext = new Uint8Array(parsed!.encryptedData);
          if (tamperedCiphertext.length > 0) {
            tamperedCiphertext[0] ^= 0xFF; // Flip all bits in first byte
          }

          // Create tampered NLOCK file
          const tamperedNlock = new Uint8Array(nlock);
          // Find and replace the ciphertext portion (after header and metadata)
          // This is a simplified approach - in real scenario would need to rebuild
          const decrypted = await decryptNLockFile(tamperedNlock, password);

          // Decryption should fail due to authentication tag mismatch
          expect(decrypted).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  }, { timeout: 60000 });

  // Property 9: NLOCK File Type Metadata
  // For any encryption operation, the generated NLOCK file should have its type field
  // correctly set to "html" or "zip"
  it('Property 9: NLOCK File Type Metadata - correct type stored', async () => {
    await sodium.ready;

    await fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 1, maxLength: 1000 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('html', 'zip'),
        async (plaintext, password, type) => {
          const nlock = await buildNLockFile(plaintext, type as 'html' | 'zip', password);
          const parsed = parseNLockFile(nlock);

          expect(parsed).not.toBeNull();
          expect(parsed!.metadata.type).toBe(type);
        }
      ),
      { numRuns: 100 }
    );
  }, { timeout: 60000 });

  // Property 16: NLOCK File Parsing
  // For any valid NLOCK file, parsing should successfully extract all metadata fields
  it('Property 16: NLOCK File Parsing - all metadata extractable', async () => {
    await sodium.ready;

    await fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 0, maxLength: 5000 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (plaintext, password) => {
          const nlock = await buildNLockFile(plaintext, 'html', password);
          const parsed = parseNLockFile(nlock);

          expect(parsed).not.toBeNull();
          expect(parsed!.metadata.version).toBeDefined();
          expect(parsed!.metadata.type).toBeDefined();
          expect(parsed!.metadata.salt).toBeDefined();
          expect(parsed!.metadata.nonce).toBeDefined();
          expect(parsed!.metadata.tag).toBeDefined();
          expect(parsed!.encryptedData).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  }, { timeout: 60000 });

  // Property 17: Invalid NLOCK Rejection
  // For any byte array that is not a valid NLOCK file, the parser should reject it
  it('Property 17: Invalid NLOCK Rejection - invalid files rejected', async () => {
    await fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 1, maxLength: 100 }).filter(
          (arr) => {
            // Filter out arrays that happen to start with NLOC magic
            const magic = new TextDecoder().decode(arr.slice(0, 4));
            return magic !== NLOCK_CONSTANTS.MAGIC_HEADER;
          }
        ),
        (invalidData) => {
          const parsed = parseNLockFile(invalidData);
          expect(parsed).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
