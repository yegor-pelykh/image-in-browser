/** @format */

import { deflateSync } from 'node:zlib';
import { describe, expect, test } from 'vitest';
import { inflate } from '../../src';

/**
 * A sequence of {@link length} bytes that repeat, so any prefix is known.
 */
function source(length: number): Uint8Array {
  return Uint8Array.from({ length }, (_v, i) => i & 0xff);
}

/**
 * Inflates zlib data into a buffer of a limited size.
 */
describe('Common: inflate', () => {
  /**
   * Stored deflate blocks are copied whole, so a block past the buffer must
   * not run past its end.
   */
  test('stops at the end of the buffer for stored blocks', () => {
    const data = source(1000);
    const zlib = deflateSync(data, { level: 0 });
    expect(inflate(Uint8Array.from(zlib), 100)).toEqual(data.subarray(0, 100));
  });

  /**
   * Huffman blocks stop at the end of the buffer too.
   */
  test('stops at the end of the buffer for Huffman blocks', () => {
    const data = source(1000);
    const zlib = deflateSync(data);
    expect(inflate(Uint8Array.from(zlib), 100)).toEqual(data.subarray(0, 100));
  });

  /**
   * A stream that fits in the buffer is inflated whole.
   */
  test('inflates a stream that fits', () => {
    const data = source(1000);
    const zlib = deflateSync(data);
    expect(inflate(Uint8Array.from(zlib), 1000)).toEqual(data);
  });
});
