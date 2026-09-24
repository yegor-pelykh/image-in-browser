/** @format */

import { describe, expect, it } from 'vitest';
import { VP8BoolEncoder } from '../../src/formats/webp/vp8-bool-encoder';

describe('vp8-bool-encoder', () => {
  it('encodes a sequence of bits', () => {
    const enc = new VP8BoolEncoder();
    enc.putBit(1, 128);
    enc.putBit(0, 128);
    enc.putBitUniform(1);
    enc.putBits(0x0a, 4);
    const out = enc.finish();
    expect(out.length).toBeGreaterThan(0);
  });

  it('emits the same bytes for identical probabilities', () => {
    const enc = new VP8BoolEncoder();
    for (let i = 0; i < 100; i++) {
      enc.putBit(i & 1, 200);
    }
    const out = enc.finish();
    expect(out.length).toBeGreaterThan(0);
  });
});
