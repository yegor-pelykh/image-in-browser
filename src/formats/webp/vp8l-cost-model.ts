/** @format */

import * as huffman from './vp8l-huffman-encoder.js';
import { VP8LCover } from './vp8l-cover.js';
import { maxMatchLen } from './vp8l-matches.js';

/**
 * What each symbol costs to code, in bits, estimated from a first pass over
 * the image.
 *
 * The tokenizer has to choose between a match and a literal before any Huffman
 * code exists, so it works from the distribution a greedy pass produced. The
 * numbers are approximate, but they rank the choices far better than length
 * alone: a long match to a distant pixel can cost more than a short one near
 * by, and no length comparison sees that.
 */
export class VP8LCostModel {
  private readonly _green: Float64Array;
  private readonly _red: Float64Array;
  private readonly _blue: Float64Array;
  private readonly _alpha: Float64Array;
  private readonly _dist: Float64Array;
  private _lengthBits: Float64Array | undefined;

  private constructor(
    green: Float64Array,
    red: Float64Array,
    blue: Float64Array,
    alpha: Float64Array,
    dist: Float64Array
  ) {
    this._green = green;
    this._red = red;
    this._blue = blue;
    this._alpha = alpha;
    this._dist = dist;
  }

  /**
   * Builds the model straight from a cover of the image.
   *
   * Reading the cover rather than a built token stream keeps the first pass
   * from materialising a list per token field only to throw it away.
   */
  public static fromCover(
    parse: VP8LCover,
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    a: Uint8Array,
    width: number
  ): VP8LCostModel {
    const green = new Float64Array(280);
    const red = new Float64Array(256);
    const blue = new Float64Array(256);
    const alpha = new Float64Array(256);
    const dist = new Float64Array(40);

    const numPixels = parse.numPixels;
    const cover = parse.cover;
    const coverDistance = parse.distance;
    let i = 0;
    while (i < numPixels) {
      const n = cover[i];
      if (n <= 1) {
        green[g[i]]++;
        red[r[i]]++;
        blue[b[i]]++;
        alpha[a[i]]++;
        i++;
      } else {
        green[huffman.lengthSymbol(n)]++;
        dist[
          huffman.prefixCode(huffman.distToPlaneCode(width, coverDistance[i]))
        ]++;
        i += n;
      }
    }

    return new VP8LCostModel(
      VP8LCostModel._toBits(green),
      VP8LCostModel._toBits(red),
      VP8LCostModel._toBits(blue),
      VP8LCostModel._toBits(alpha),
      VP8LCostModel._toBits(dist)
    );
  }

  /**
   * Bits to code a match of each length, symbol and extra bits together.
   *
   * A parse that weighs every length at every position asks for this millions
   * of times, and it depends on nothing but the length.
   */
  public get lengthBits(): Float64Array {
    if (this._lengthBits === undefined) {
      const t = new Float64Array(maxMatchLen + 1);
      for (let len = 1; len <= maxMatchLen; len++) {
        const extra = huffman.lengthExtra(len).extraBits;
        t[len] = this._green[huffman.lengthSymbol(len)] + extra;
      }
      this._lengthBits = t;
    }
    return this._lengthBits;
  }

  /**
   * Bits to code the distance part of a match at [distance].
   */
  public distanceBits(distance: number, width: number): number {
    const planeCode = huffman.distToPlaneCode(width, distance);
    const extra = huffman.prefixExtra(planeCode).extraBits;
    return this._dist[huffman.prefixCode(planeCode)] + extra;
  }

  /**
   * Turns counts into bit costs. A symbol the first pass never used still has
   * to be codeable, so it is charged as if it had appeared once.
   */
  private static _toBits(freq: Float64Array): Float64Array {
    let total = 0.0;
    for (const f of freq) {
      total += f;
    }
    if (total === 0) {
      return new Float64Array(freq.length).fill(8);
    }
    const bits = new Float64Array(freq.length);
    for (let i = 0; i < freq.length; i++) {
      const f = freq[i] > 0 ? freq[i] : 1.0;
      bits[i] = -(Math.log(f / (total + 1)) / Math.LN2);
    }
    return bits;
  }

  /**
   * Bits to code the pixel at [i] as a literal.
   */
  public literalCost(
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    a: Uint8Array,
    i: number
  ): number {
    return (
      this._green[g[i]] + this._red[r[i]] + this._blue[b[i]] + this._alpha[a[i]]
    );
  }
}
