/** @format */

import { mul32 } from './vp8l-color-hash.js';

/**
 * The hash chain the match search walks.
 */
export class Lz77 {
  public readonly _px: Uint32Array;

  public readonly _prev: Int32Array;

  private readonly _numPixels: number;
  private _head: Int32Array;
  private _shift: number;

  constructor(
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    a: Uint8Array,
    numPixels: number
  ) {
    this._numPixels = numPixels;
    this._px = new Uint32Array(numPixels);
    this._prev = new Int32Array(numPixels);

    let hashBits = 1;
    while (1 << hashBits < numPixels && hashBits < 18) {
      hashBits++;
    }
    this._shift = 32 - hashBits;
    this._head = new Int32Array(1 << hashBits).fill(-1);

    // Pixels packed one word each, so matching compares a single value per
    // position instead of four, which is most of what this loop does.
    const px = this._px;
    for (let i = 0; i < numPixels; i++) {
      px[i] = (g[i] << 24) | (r[i] << 16) | (b[i] << 8) | a[i];
    }
  }

  /**
   * libwebp's own pair hash, kept in 32-bit arithmetic.
   *
   * A 64-bit multiply would be the obvious way to mix two pixels, but on the
   * web an int is a double: only the low 53 bits of a product survive, and a
   * 64-bit constant is not even expressible. Two 32-bit multiplies say the
   * same thing on every platform.
   */
  private _hash(first: number, second: number): number {
    return (
      ((mul32(second, 0xc6a4a793) + mul32(first, 0x5bd1e996)) & 0xffffffff) >>>
      this._shift
    );
  }

  /**
   * Links every position to the previous one that hashes the same.
   *
   * Positions are keyed on the pair of pixels starting there: one pixel alone
   * puts far too many positions in a slot, and no match shorter than three
   * pixels is ever coded, so keying on two loses nothing.
   *
   * libwebp keys a run of identical pixels on its colour and how much of it
   * is left, to spread the run across slots. Tried here and reverted: it made
   * the PNG suite 11% larger and the encode 36% slower. With a pair key, the
   * most recent entry in a run's slot is the immediately preceding pixel, so
   * the search finds a full-length match at distance 1, the cheapest distance
   * code there is, on its first step. Spreading the run replaces that with
   * distant candidates, which libwebp can afford because it tries an RLE pass
   * as a separate strategy
   */
  public fillChain(): void {
    const n = this._numPixels;
    if (n <= 2) {
      return;
    }
    const px = this._px;
    const prev = this._prev;
    const head = this._head;
    for (let pos = 0; pos < n - 1; pos++) {
      const h = this._hash(px[pos], px[pos + 1]);
      prev[pos] = head[h];
      head[h] = pos;
    }
    // The last position starts no pair, so nothing links to it.
    prev[n - 1] = -1;
  }
}
