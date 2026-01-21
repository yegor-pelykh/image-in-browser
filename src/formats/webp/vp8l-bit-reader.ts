/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { LibError } from '../../error/lib-error.js';

/**
 * Class representing a VP8L Bit Reader.
 */
export class VP8LBitReader {
  /**
   * Input buffer for reading bits.
   */
  private readonly _input: InputBuffer<Uint8Array>;
  /**
   * Buffer for storing bits.
   */
  private readonly _buffer: Uint32Array;
  /**
   * 8-bit view of the buffer.
   */
  private readonly _buffer8: Uint8Array;

  /*
   * True if end of stream is reached.
   */
  private _isEOS: boolean = true;

  /**
   * Current bit position in the buffer.
   */
  private _bitPos: number = 0;

  /**
   * Gets the current bit position.
   * @returns {number} The current bit position.
   */
  public get bitPos(): number {
    return this._bitPos;
  }

  /**
   * Sets the current bit position.
   * @param {number} v - The new bit position.
   */
  public set bitPos(v: number) {
    this._bitPos = v;
  }

  /**
   * Returns if end of stream is reached.
   * @returns {boolean} True if end of stream is reached, otherwise false.
   */
  public get isEOS(): boolean {
    return this._isEOS;
  }

  /**
   * Creates an instance of VP8LBitReader.
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   */
  constructor(input: InputBuffer<Uint8Array>) {
    this._input = input;
    this._buffer = new Uint32Array(2);
    this._buffer8 = new Uint8Array(this._buffer.buffer);
    for (let i = 0; i < 8; i++) {
      this._buffer8[i] = this._input.read();
    }
    this._isEOS = false;
  }

  /**
   * If not at EOS, reload up to lBits byte-by-byte.
   */
  private shiftBytes(): void {
    while (this._bitPos >= 8 && !this._input.isEOS) {
      const b = this._input.read();
      this._buffer[0] =
        (this._buffer[0] >>> 8) + (this._buffer[1] & 0xff) * 0x1000000;
      this._buffer[1] >>>= 8;
      this._buffer[1] |= b * 0x1000000;
      this._bitPos -= 8;
    }
  }

  /**
   * Return the prefetched bits, so they can be looked up.
   * @returns {number} The prefetched bits.
   */
  public prefetchBits(): number {
    let b2 = 0;
    if (this._bitPos < 32) {
      b2 =
        (this._buffer[0] >>> this._bitPos) +
        (this._buffer[1] & VP8LBitReader.bitMask[this._bitPos]) *
          (VP8LBitReader.bitMask[32 - this._bitPos] + 1);
    } else if (this._bitPos === 32) {
      b2 = this._buffer[1];
    } else {
      b2 = this._buffer[1] >>> (this._bitPos - 32);
    }
    return b2;
  }

  /**
   * Advances the read buffer by 4 bytes to make room for reading next 32 bits.
   */
  public fillBitWindow(): void {
    if (this._bitPos >= VP8LBitReader.wBits) {
      this.shiftBytes();
    }
  }

  /**
   * Reads the specified number of bits from Read Buffer.
   * @param {number} numBits - The number of bits to read.
   * @returns {number} The bits read.
   * @throws {LibError} If not enough data in input.
   */
  public readBits(numBits: number): number {
    if (!this.isEOS && numBits < VP8LBitReader.maxNumBitRead) {
      const value = this.prefetchBits() & VP8LBitReader.bitMask[numBits];
      this._bitPos += numBits;
      this.shiftBytes();
      return value;
    } else {
      this._isEOS = true;
      throw new LibError('Not enough data in input.');
    }
  }

  /**
   * The number of bytes used for the bit buffer.
   */
  private static readonly valueSize: number = 8;
  /**
   * Maximum number of bits that can be read.
   */
  private static readonly maxNumBitRead: number = 25;
  /**
   * Number of bits prefetched.
   */
  private static readonly lBits: number = 64;
  /**
   * Minimum number of bytes needed after **fillBitWindow**.
   */
  private static readonly wBits: number = 32;
  /**
   * Number of bytes needed to store wBits bits.
   */
  private static readonly log8WBits: number = 4;
  /**
   * Bit masks for reading bits.
   */
  private static readonly bitMask: number[] = [
    0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767,
    65535, 131071, 262143, 524287, 1048575, 2097151, 4194303, 8388607, 16777215,
    33554431, 67108863, 134217727, 268435455, 536870911, 1073741823, 2147483647,
    4294967295,
  ];
}
