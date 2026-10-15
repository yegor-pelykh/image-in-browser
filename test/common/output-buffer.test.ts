/** @format */

import { describe, expect, test } from 'vitest';
import { InputBuffer, OutputBuffer } from '../../src';

/**
 * OutputBuffer growth and write operations.
 */
describe('Common', () => {
  describe('OutputBuffer', () => {
    /**
     * Writes past the initial capacity preserve all previous bytes.
     */
    test('writes past the initial capacity are preserved', () => {
      const out = new OutputBuffer({ size: 4 });
      const expected: number[] = [];
      for (let i = 0; i < 1000; ++i) {
        const row = Array.from(
          { length: (i % 13) + 1 },
          (_v, j) => (i + j) & 0xff
        );
        out.writeBytes(Uint8Array.from(row));
        expected.push(...row);
        out.writeByte(i & 0xff);
        expected.push(i & 0xff);
      }
      expect(out.length).toBe(expected.length);
      expect(Array.from(out.getBytes())).toEqual(expected);
    });

    /**
     * writeBuffer appends the input bytes.
     */
    test('writeBuffer appends the input bytes', () => {
      const out = new OutputBuffer({ size: 2 });
      out.writeByte(1);
      out.writeBuffer(
        new InputBuffer({ buffer: Uint8Array.from([2, 3, 4, 5]) })
      );
      expect(Array.from(out.getBytes())).toEqual([1, 2, 3, 4, 5]);
    });

    /**
     * Many row writes run in linear time.
     */
    test('many row writes run in linear time', () => {
      const row = new Uint8Array(4000);
      const out = new OutputBuffer();
      const start = Date.now();
      for (let i = 0; i < 4000; ++i) {
        out.writeBytes(row);
      }
      expect(out.length).toBe(4000 * 4000);
      expect(Date.now() - start).toBeLessThan(2000);
    });
  });
});
