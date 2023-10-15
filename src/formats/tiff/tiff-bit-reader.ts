/** @format */

import { InputBuffer } from '../../common/input-buffer';

export class TiffBitReader {
  private static readonly _bitMask = [0, 1, 3, 7, 15, 31, 63, 127, 255];

  private _bitBuffer = 0;

  private _bitPosition = 0;

  private _input: InputBuffer;

  constructor(input: InputBuffer) {
    this._input = input;
  }

  /**
   * Read a number of bits from the input stream.
   */
  public readBits(numBits: number): number {
    let nBits = numBits;
    if (nBits === 0) {
      return 0;
    }

    if (this._bitPosition === 0) {
      this._bitPosition = 8;
      this._bitBuffer = this._input.readByte();
    }

    let value = 0;

    while (nBits > this._bitPosition) {
      value =
        (value << this._bitPosition) +
        (this._bitBuffer & TiffBitReader._bitMask[this._bitPosition]);
      nBits -= this._bitPosition;
      this._bitPosition = 8;
      this._bitBuffer = this._input.readByte();
    }

    if (nBits > 0) {
      if (this._bitPosition === 0) {
        this._bitPosition = 8;
        this._bitBuffer = this._input.readByte();
      }

      value =
        (value << nBits) +
        ((this._bitBuffer >>> (this._bitPosition - nBits)) &
          TiffBitReader._bitMask[nBits]);

      this._bitPosition -= nBits;
    }

    return value;
  }

  public readByte() {
    return this.readBits(8);
  }

  /**
   *  Flush the rest of the bits in the buffer so the next read starts at the next byte.
   */
  public flushByte() {
    return (this._bitPosition = 0);
  }
}
