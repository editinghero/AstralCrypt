import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { deriveKey } from './deriveKey';
import sodium from 'libsodium-wrappers';

describe('Key Derivation - Property Tests', () => {
  it('Property 2: Key Derivation Determinism - deriving a key multiple times with the same inputs should always produce the same key', async () => {
    await sodium.ready;

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        async (password) => {
          // Generate a fixed salt for this test
          const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);

          // Derive key multiple times
          const key1 = await deriveKey(password, salt);
          const key2 = await deriveKey(password, salt);
          const key3 = await deriveKey(password, salt);

          // All keys should be identical
          expect(key1).toEqual(key2);
          expect(key2).toEqual(key3);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 2: Key Derivation Determinism - different passwords should produce different keys', async () => {
    await sodium.ready;

    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 100 })
        ).filter(([p1, p2]) => p1 !== p2),
        async ([password1, password2]) => {
          const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);

          const key1 = await deriveKey(password1, salt);
          const key2 = await deriveKey(password2, salt);

          // Different passwords should produce different keys
          expect(key1).not.toEqual(key2);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 2: Key Derivation Determinism - different salts should produce different keys', async () => {
    await sodium.ready;

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        async (password) => {
          const salt1 = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
          const salt2 = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);

          const key1 = await deriveKey(password, salt1);
          const key2 = await deriveKey(password, salt2);

          // Different salts should produce different keys
          expect(key1).not.toEqual(key2);
        }
      ),
      { numRuns: 10 }
    );
  });
});
