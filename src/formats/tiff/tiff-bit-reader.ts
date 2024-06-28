/** @format */

import { InputBuffer } from '../../common/input-buffer.js';

/**
 * Class representing a TIFF bit reader.
 */
export class TiffBitReader {
  /**
   * Bit masks used for reading bits.
   * @private
   * @readonly
   */
  private static readonly _bitMask = [0, 1, 3, 7, 15, 31, 63, 127, 255];

  /**
   * Buffer for storing bits.
   * @private
   */
  private _bitBuffer = 0;

  /**
   * Position in the bit buffer.
   * @private
   */
  private _bitPosition = 0;

  /**
   * Input buffer for reading data.
   * @private
   */
  private _input: InputBuffer<Uint8Array>;

  /**
   * Create a TiffBitReader.
   * @param {InputBuffer<Uint8Array>} input - The input buffer to read from.
   */
  constructor(input: InputBuffer<Uint8Array>) {
    this._input = input;
  }

  /**
   * Read a number of bits from the input stream.
   * @param {number} numBits - The number of bits to read.
   * @returns {number} The bits read from the input stream.
   */
  public readBits(numBits: number): number {
    let nBits = numBits;
    if (nBits === 0) {
      return 0;
    }

    if (this._bitPosition === 0) {
      this._bitPosition = 8;
      this._bitBuffer = this._input.read();
    }

    let value = 0;

    while (nBits > this._bitPosition) {
      value =
        (value << this._bitPosition) +
        (this._bitBuffer & TiffBitReader._bitMask[this._bitPosition]);
      nBits -= this._bitPosition;
      this._bitPosition = 8;
      this._bitBuffer = this._input.read();
    }

    if (nBits > 0) {
      if (this._bitPosition === 0) {
        this._bitPosition = 8;
        this._bitBuffer = this._input.read();
      }

      value =
        (value << nBits) +
        ((this._bitBuffer >>> (this._bitPosition - nBits)) &
          TiffBitReader._bitMask[nBits]);

      this._bitPosition -= nBits;
    }

    return value;
  }

  /**
   * Read a byte from the input stream.
   * @returns {number} The byte read from the input stream.
   */
  public readByte() {
    return this.readBits(8);
  }

  /**
   * Flush the rest of the bits in the buffer so the next read starts at the next byte.
   * @returns {number} The new bit position (always 0).
   */
  public flushByte() {
    return (this._bitPosition = 0);
  }
}
