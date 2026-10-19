/** @format */

import { inflate as inflateRaw } from '../packer/packer.js';
import { LibError } from '../error/lib-error.js';

/**
 * Inflates the zlib stream {@link data}, stopping after {@link maxLength}
 * bytes, so a small stream can't inflate to an unbounded size.
 * @param {Uint8Array} data - The compressed zlib stream.
 * @param {number} maxLength - The maximum number of bytes to decompress.
 * @returns {Uint8Array} The decompressed data, at most {@link maxLength} bytes.
 * @throws {LibError} If the compressed data is invalid.
 */
export function inflate(data: Uint8Array, maxLength: number): Uint8Array {
  try {
    return inflateRaw(data, new Uint8Array(maxLength));
  } catch (e) {
    if (e instanceof LibError) {
      throw e;
    }
    const message = e instanceof Error ? e.message : `${e}`;
    throw new LibError(`Invalid compressed data: ${message}`);
  }
}
