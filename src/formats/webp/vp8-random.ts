/** @format */

import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Class representing a VP8 random number generator.
 */
export class VP8Random {
  /**
   * A table of random values.
   * @private
   */
  private readonly _table = new Uint32Array(VP8Random.randomTableSize);

  /**
   * Index 1 for the random table.
   * @private
   */
  private _index1: number;

  /**
   * Index 2 for the random table.
   * @private
   */
  private _index2: number;

  /**
   * Amplitude for dithering.
   * @private
   */
  private _amplitude: number;

  /**
   * Initializes random generator with an amplitude 'dithering' in range [0..1].
   * @param {number} dithering - The dithering amplitude.
   */
  constructor(dithering: number) {
    ArrayUtils.copyRange(
      VP8Random.randomTable,
      0,
      this._table,
      0,
      VP8Random.randomTableSize
    );
    this._index1 = 0;
    this._index2 = 31;
    this._amplitude =
      dithering < 0
        ? 0
        : dithering > 1
          ? 1 << VP8Random.randomDitherFix
          : Math.trunc((1 << VP8Random.randomDitherFix) * dithering);
  }

  /**
   * Returns a centered pseudo-random number with **numBits** amplitude.
   * (uses D.Knuth's Difference-based random generator).
   * **amp** is in randomDitherFix fixed-point precision.
   * @param {number} numBits - The number of bits for the random number.
   * @param {number} amp - The amplitude in fixed-point precision.
   * @returns {number} The generated random number.
   */
  public randomBits2(numBits: number, amp: number): number {
    let diff = this._table[this._index1] - this._table[this._index2];
    if (diff < 0) {
      diff += 1 << 31;
    }

    this._table[this._index1] = diff;

    if (++this._index1 === VP8Random.randomTableSize) {
      this._index1 = 0;
    }
    if (++this._index2 === VP8Random.randomTableSize) {
      this._index2 = 0;
    }

    // sign-extend, 0-center
    diff = (diff << 1) >>> (32 - numBits);
    // restrict range
    diff = (diff * amp) >>> VP8Random.randomDitherFix;
    // shift back to 0.5-center
    diff += 1 << (numBits - 1);

    return diff;
  }

  /**
   * Returns a centered pseudo-random number with **numBits** amplitude.
   * @param {number} numBits - The number of bits for the random number.
   * @returns {number} The generated random number.
   */
  public randomBits(numBits: number): number {
    return this.randomBits2(numBits, this._amplitude);
  }

  /**
   * Fixed-point precision for dithering.
   * @private
   * @constant {number}
   */
  private static readonly randomDitherFix = 8;

  /**
   * Size of the random table.
   * @private
   * @constant {number}
   */
  private static readonly randomTableSize = 55;

  /**
   * A table of 31-bit range values.
   * @private
   * @constant {Uint32Array}
   */
  private static readonly randomTable: Uint32Array = new Uint32Array([
    0x0de15230, 0x03b31886, 0x775faccb, 0x1c88626a, 0x68385c55, 0x14b3b828,
    0x4a85fef8, 0x49ddb84b, 0x64fcf397, 0x5c550289, 0x4a290000, 0x0d7ec1da,
    0x5940b7ab, 0x5492577d, 0x4e19ca72, 0x38d38c69, 0x0c01ee65, 0x32a1755f,
    0x5437f652, 0x5abb2c32, 0x0faa57b1, 0x73f533e7, 0x685feeda, 0x7563cce2,
    0x6e990e83, 0x4730a7ed, 0x4fc0d9c6, 0x496b153c, 0x4f1403fa, 0x541afb0c,
    0x73990b32, 0x26d7cb1c, 0x6fcc3706, 0x2cbb77d8, 0x75762f2a, 0x6425ccdd,
    0x24b35461, 0x0a7d8715, 0x220414a8, 0x141ebf67, 0x56b41583, 0x73e502e3,
    0x44cab16f, 0x28264d42, 0x73baaefb, 0x0a50ebed, 0x1d6ab6fb, 0x0d3ad40b,
    0x35db3b68, 0x2b081e83, 0x77ce6b95, 0x5181e5f0, 0x78853bbc, 0x009f9494,
    0x27e5ed3c,
  ]);
}
