/**
 * NLOCK File Format Types
 * 
 * Defines the structure and interfaces for the NLOCK encrypted file format.
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

/**
 * Content type indicator for NLOCK files
 */
export type ContentType = 'html' | 'zip' | 'pdf';

/**
 * Metadata extracted from an NLOCK file header
 */
export interface NLockMetadata {
  version: number;
  type: ContentType;
  salt: Uint8Array;
  nonce: Uint8Array;
  tag: Uint8Array;
}

/**
 * Complete NLOCK file structure
 */
export interface NLockFile {
  metadata: NLockMetadata;
  encryptedData: Uint8Array;
}

/**
 * NLOCK file format constants
 */
export const NLOCK_CONSTANTS = {
  MAGIC_HEADER: 'NLOC',
  VERSION: 0x01,
  SALT_BYTES: 16,
  NONCE_BYTES: 24,
  TAG_BYTES: 16,
} as const;
