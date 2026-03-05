import { describe, it, expect } from 'vitest';
import { parseNLockFile, decryptNLockFile } from './parseContainer';
import { buildNLockFile } from './buildContainer';
import { NLOCK_CONSTANTS } from './types';
import sodium from 'libsodium-wrappers';

describe('parseContainer', () => {

  describe('parseNLockFile', () => {
    it('should parse a valid NLOCK file', async () => {
      await sodium.ready;
      const plaintext = new TextEncoder().encode('<html><body>Test</body></html>');
      const password = 'test-password';

      const nlock = await buildNLockFile(plaintext, 'html', password);
      const parsed = parseNLockFile(nlock);

      expect(parsed).not.toBeNull();
      expect(parsed!.metadata.version).toBe(NLOCK_CONSTANTS.VERSION);
      expect(parsed!.metadata.type).toBe('html');
      expect(parsed!.encryptedData).toBeInstanceOf(Uint8Array);
    });

    it('should extract correct metadata from NLOCK file', async () => {
      await sodium.ready;
      const plaintext = new TextEncoder().encode('test data');
      const password = 'password';

      const nlock = await buildNLockFile(plaintext, 'zip', password);
      const parsed = parseNLockFile(nlock);

      expect(parsed).not.toBeNull();
      expect(parsed!.metadata.type).toBe('zip');
      expect(parsed!.metadata.salt.length).toBeGreaterThan(0);
      expect(parsed!.metadata.nonce.length).toBeGreaterThan(0);
      expect(parsed!.metadata.tag.length).toBeGreaterThan(0);
    });

    it('should return null for invalid magic header', () => {
      const invalidData = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
      const parsed = parseNLockFile(invalidData);

      expect(parsed).toBeNull();
    });

    it('should return null for truncated file', async () => {
      const plaintext = new TextEncoder().encode('test');
      const password = 'password';

      const nlock = await buildNLockFile(plaintext, 'html', password);
      const truncated = nlock.slice(0, 10); // Too short

      const parsed = parseNLockFile(truncated);
      expect(parsed).toBeNull();
    });

    it('should return null for invalid version', () => {
      const data = new Uint8Array(100);
      // Write magic header
      const magic = new TextEncoder().encode(NLOCK_CONSTANTS.MAGIC_HEADER);
      data.set(magic, 0);
      // Write invalid version
      data[4] = 0xFF;

      const parsed = parseNLockFile(data);
      expect(parsed).toBeNull();
    });

    it('should return null for invalid content type', () => {
      const data = new Uint8Array(100);
      // Write magic header
      const magic = new TextEncoder().encode(NLOCK_CONSTANTS.MAGIC_HEADER);
      data.set(magic, 0);
      // Write valid version
      data[4] = NLOCK_CONSTANTS.VERSION;
      // Write invalid type
      const invalidType = new TextEncoder().encode('xxxx');
      data.set(invalidType, 5);

      const parsed = parseNLockFile(data);
      expect(parsed).toBeNull();
    });

    it('should handle large encrypted data', async () => {
      await sodium.ready;
      const largeText = 'x'.repeat(1024 * 1024); // 1MB
      const plaintext = new TextEncoder().encode(largeText);
      const password = 'password';

      const nlock = await buildNLockFile(plaintext, 'html', password);
      const parsed = parseNLockFile(nlock);

      expect(parsed).not.toBeNull();
      expect(parsed!.encryptedData.length).toBeGreaterThan(0);
    });
  });

  describe('decryptNLockFile', () => {
    it('should decrypt NLOCK file with correct password', async () => {
      await sodium.ready;
      const plaintext = new TextEncoder().encode('<html><body>Test</body></html>');
      const password = 'test-password';

      const nlock = await buildNLockFile(plaintext, 'html', password);
      const decrypted = await decryptNLockFile(nlock, password);

      expect(decrypted).not.toBeNull();
      expect(decrypted).toEqual(plaintext);
    });

    it('should return null with incorrect password', async () => {
      await sodium.ready;
      const plaintext = new TextEncoder().encode('secret data');
      const password = 'correct-password';

      const nlock = await buildNLockFile(plaintext, 'html', password);
      const decrypted = await decryptNLockFile(nlock, 'wrong-password');

      expect(decrypted).toBeNull();
    });

    it('should return null for invalid NLOCK file', async () => {
      await sodium.ready;
      const invalidData = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
      const decrypted = await decryptNLockFile(invalidData, 'password');

      expect(decrypted).toBeNull();
    });

    it('should handle ZIP content decryption', async () => {
      await sodium.ready;
      const zipData = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
      const password = 'zip-password';

      const nlock = await buildNLockFile(zipData, 'zip', password);
      const decrypted = await decryptNLockFile(nlock, password);

      expect(decrypted).not.toBeNull();
      expect(decrypted).toEqual(zipData);
    });

    it('should handle empty plaintext decryption', async () => {
      await sodium.ready;
      const plaintext = new Uint8Array(0);
      const password = 'password';

      const nlock = await buildNLockFile(plaintext, 'html', password);
      const decrypted = await decryptNLockFile(nlock, password);

      expect(decrypted).not.toBeNull();
      expect(decrypted!.length).toBe(0);
    });
  });
});
