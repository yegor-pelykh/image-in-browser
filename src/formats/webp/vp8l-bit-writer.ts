/** @format */

import { ArrayUtils } from '../../common/array-utils.js';

/**
 * Bit writer that packs bits LSB-first into bytes.
 *
 * The bytes go into a typed array: a growable `number[]` holds a tagged word
 * per element, eight bytes for every output byte.
 */
export class VP8LBitWriter {
  private _bytes: Uint8Array = new Uint8Array(4096);
  private _length: number = 0;
  private _currentByte: number = 0;
  private _usedBits: number = 0;

  private _grow(): void {
    const newBytes = new Uint8Array(this._bytes.length * 2);
    ArrayUtils.copyRange(this._bytes, 0, newBytes, 0, this._length);
    this._bytes = newBytes;
  }

  public writeBits(value: number, numBits: number): void {
    let v = value;
    let n = numBits;
    while (n > 0) {
      const available = 8 - this._usedBits;
      const bitsToWrite = n < available ? n : available;
      const mask = (1 << bitsToWrite) - 1;
      this._currentByte |= (v & mask) << this._usedBits;
      v >>= bitsToWrite;
      n -= bitsToWrite;
      this._usedBits += bitsToWrite;
      if (this._usedBits === 8) {
        if (this._length === this._bytes.length) {
          this._grow();
        }
        this._bytes[this._length++] = this._currentByte;
        this._currentByte = 0;
        this._usedBits = 0;
      }
    }
  }

  public flush(): void {
    if (this._usedBits > 0) {
      if (this._length === this._bytes.length) {
        this._grow();
      }
      this._bytes[this._length++] = this._currentByte;
      this._currentByte = 0;
      this._usedBits = 0;
    }
  }

  /**
   * The bytes written so far, without the doubling slack behind them.
   */
  public getBytes(): Uint8Array {
    return this._length === this._bytes.length
      ? this._bytes
      : this._bytes.subarray(0, this._length);
  }
}
