/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { LibError } from '../../error/lib-error.js';

export class VP8LBitReader {
  private readonly _input: InputBuffer<Uint8Array>;
  private readonly _buffer: Uint32Array;
  private readonly _buffer8: Uint8Array;

  private _bitPos: number = 0;
  public get bitPos(): number {
    return this._bitPos;
  }
  public set bitPos(v: number) {
    this._bitPos = v;
  }

  public get isEOS(): boolean {
    return this._input.isEOS && this._bitPos >= VP8LBitReader.lBits;
  }

  constructor(input: InputBuffer<Uint8Array>) {
    this._input = input;
    this._buffer = new Uint32Array(2);
    this._buffer8 = new Uint8Array(this._buffer.buffer);
    for (let i = 0; i < 8; i++) {
      this._buffer8[i] = this._input.read();
    }
  }

  /**
   * If not at EOS, reload up to lBits byte-by-byte
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
   * Return the prefetched bits, so they can be looked up
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
   * Advances the read buffer by 4 bytes to make room for reading next 32 bits
   */
  public fillBitWindow(): void {
    if (this._bitPos >= VP8LBitReader.wBits) {
      this.shiftBytes();
    }
  }

  /**
   * Reads the specified number of bits from Read Buffer
   */
  public readBits(numBits: number): number {
    if (!this.isEOS && numBits < VP8LBitReader.maxNumBitRead) {
      const value = this.prefetchBits() & VP8LBitReader.bitMask[numBits];
      this._bitPos += numBits;
      this.shiftBytes();
      return value;
    } else {
      throw new LibError('Not enough data in input.');
    }
  }

  /**
   * The number of bytes used for the bit buffer
   */
  private static readonly valueSize: number = 8;
  private static readonly maxNumBitRead: number = 25;
  /**
   * Number of bits prefetched
   */
  private static readonly lBits: number = 64;
  /**
   * Minimum number of bytes needed after **fillBitWindow**
   */
  private static readonly wBits: number = 32;
  /**
   * Number of bytes needed to store wBits bits
   */
  private static readonly log8WBits: number = 4;
  private static readonly bitMask: number[] = [
    0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767,
    65535, 131071, 262143, 524287, 1048575, 2097151, 4194303, 8388607, 16777215,
    33554431, 67108863, 134217727, 268435455, 536870911, 1073741823, 2147483647,
    4294967295,
  ];
}
