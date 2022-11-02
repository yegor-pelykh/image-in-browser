/** @format */

import { InputBuffer } from '../../common/input-buffer';

export class TiffBitReader {
  private static readonly BITMASK = [0, 1, 3, 7, 15, 31, 63, 127, 255];

  private bitBuffer = 0;

  private bitPosition = 0;

  private input: InputBuffer;

  constructor(input: InputBuffer) {
    this.input = input;
  }

  /**
   * Read a number of bits from the input stream.
   */
  public readBits(numBits: number): number {
    let nBits = numBits;
    if (nBits === 0) {
      return 0;
    }

    if (this.bitPosition === 0) {
      this.bitPosition = 8;
      this.bitBuffer = this.input.readByte();
    }

    let value = 0;

    while (nBits > this.bitPosition) {
      value =
        (value << this.bitPosition) +
        (this.bitBuffer & TiffBitReader.BITMASK[this.bitPosition]);
      nBits -= this.bitPosition;
      this.bitPosition = 8;
      this.bitBuffer = this.input.readByte();
    }

    if (nBits > 0) {
      if (this.bitPosition === 0) {
        this.bitPosition = 8;
        this.bitBuffer = this.input.readByte();
      }

      value =
        (value << nBits) +
        ((this.bitBuffer >> (this.bitPosition - nBits)) &
          TiffBitReader.BITMASK[nBits]);

      this.bitPosition -= nBits;
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
    return (this.bitPosition = 0);
  }
}
