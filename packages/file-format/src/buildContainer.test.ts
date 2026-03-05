import { describe, it, expect } from 'vitest';
import { buildNLockFile, serializeNLockFile } from './buildContainer';
import { parseNLockFile } from './parseContainer';
import { NLOCK_CONSTANTS } from './types';
import sodium from 'libsodium-wrappers';

describe('buildContainer', () => {

  describe('buildNLockFile', () => {
    it('should build a valid NLOCK file from HTML plaintext', async () => {
      await sodium.ready;
      const plaintext = new TextEncoder().encode('<html><body>Test</body></html>');
      const password = 'test-password';

      const nlock = await buildNLockFile(plaintext, 'html', password);

      expect(nlock).toBeInstanceOf(Uint8Array);
      expect(nlock.length).toBeGreaterThan(0);

      // Verify magic header
      const magic = new TextDecoder().decode(nlock.slice(0, 4));
      expect(magic).toBe(NLOCK_CONSTANTS.MAGIC_HEADER);
    });

    it('should build a valid NLOCK file from ZIP plaintext', async () => {
      await sodium.ready;
      const plaintext = new Uint8Array([0x50, 0x4b, 0x03, 0x04]); // ZIP magic bytes
      const password = 'test-password';

      const nlock = await buildNLockFile(plaintext, 'zip', password);

      expect(nlock).toBeInstanceOf(Uint8Array);
      expect(nlock.length).toBeGreaterThan(0);

      // Verify magic header
      const magic = new TextDecoder().decode(nlock.slice(0, 4));
      expect(magic).toBe(NLOCK_CONSTANTS.MAGIC_HEADER);
    });

    it('should produce different NLOCK files for the same plaintext (due to random salt/nonce)', async () => {
      await sodium.ready;
      const plaintext = new TextEncoder().encode('<html><body>Test</body></html>');
      const password = 'test-password';

      const nlock1 = await buildNLockFile(plaintext, 'html', password);
      const nlock2 = await buildNLockFile(plaintext, 'html', password);

      // Files should be different due to random salt and nonce
      expect(nlock1).not.toEqual(nlock2);
    });

    it('should handle large plaintext', async () => {
      await sodium.ready;
      const largeText = 'x'.repeat(1024 * 1024); // 1MB
      const plaintext = new TextEncoder().encode(largeText);
      const password = 'test-password';

      const nlock = await buildNLockFile(plaintext, 'html', password);

      expect(nlock).toBeInstanceOf(Uint8Array);
      expect(nlock.length).toBeGreaterThan(plaintext.length);
    });

    it('should handle empty plaintext', async () => {
      await sodium.ready;
      const plaintext = new Uint8Array(0);
      const password = 'test-password';

      const nlock = await buildNLockFile(plaintext, 'html', password);

      expect(nlock).toBeInstanceOf(Uint8Array);
      expect(nlock.length).toBeGreaterThan(0);
    });
  });

  describe('serializeNLockFile', () => {
    it('should serialize a complete NLOCK file structure', async () => {
      await sodium.ready;
      const plaintext = new TextEncoder().encode('<html><body>Test</body></html>');
      const password = 'test-password';

      const nlock = await buildNLockFile(plaintext, 'html', password);
      const parsed = parseNLockFile(nlock);

      expect(parsed).not.toBeNull();
      expect(parsed!.metadata.type).toBe('html');
      expect(parsed!.metadata.version).toBe(NLOCK_CONSTANTS.VERSION);
    });

    it('should include all required metadata fields', async () => {
      await sodium.ready;
      const plaintext = new TextEncoder().encode('test data');
      const password = 'password';

      const nlock = await buildNLockFile(plaintext, 'zip', password);
      const parsed = parseNLockFile(nlock);

      expect(parsed).not.toBeNull();
      expect(parsed!.metadata.salt).toBeInstanceOf(Uint8Array);
      expect(parsed!.metadata.nonce).toBeInstanceOf(Uint8Array);
      expect(parsed!.metadata.tag).toBeInstanceOf(Uint8Array);
      expect(parsed!.encryptedData).toBeInstanceOf(Uint8Array);
    });
  });
});
