/** @format */

import { InputBuffer } from '../../common/input-buffer.js';

export class VP8BitReader {
  private _input: InputBuffer<Uint8Array>;
  // current range minus 1. In [127, 254] interval.
  private _range: number;
  // current value
  private _value: number;
  // number of valid bits left
  private _bits: number;
  private _eof: boolean = false;

  constructor(input: InputBuffer<Uint8Array>) {
    this._input = input;
    this._range = 255 - 1;
    this._value = 0;
    // to load the very first 8 bits
    this._bits = -8;
  }

  private loadFinalBytes(): void {
    // Only read 8bits at a time
    if (!this._input.isEOS) {
      this._value = this._input.read() | (this._value << 8);
      this._bits += 8;
    } else if (!this._eof) {
      // These are not strictly needed, but it makes the behaviour
      // consistent for both USE_RIGHT_JUSTIFY and !USE_RIGHT_JUSTIFY.
      this._value <<= 8;
      this._bits += 8;
      this._eof = true;
    }
  }

  private loadNewBytes(): void {
    // Read 8 bits at a time if possible
    if (this._input.length >= 1) {
      // convert memory type to register type (with some zero'ing!)
      const bits = this._input.read();
      this._value = bits | (this._value << 8);
      this._bits += 8;
    } else {
      // no need to be inlined
      this.loadFinalBytes();
    }
  }

  private bitUpdate(split: number): number {
    // Make sure we have a least BITS bits in 'value_'
    if (this._bits < 0) {
      this.loadNewBytes();
    }

    const pos = this._bits;
    const value = this._value >>> pos;
    if (value > split) {
      this._range -= split + 1;
      this._value -= (split + 1) << pos;
      return 1;
    } else {
      this._range = split;
      return 0;
    }
  }

  private shift(): void {
    const shift = VP8BitReader.log2Range[this._range];
    this._range = VP8BitReader.newRange[this._range];
    this._bits -= shift;
  }

  public getBit(prob: number): number {
    const split = (this._range * prob) >>> 8;
    const bit = this.bitUpdate(split);
    if (this._range <= 0x7e) {
      this.shift();
    }
    return bit;
  }

  public getValue(bits: number): number {
    let _bits = bits;
    let v = 0;
    while (_bits-- > 0) {
      v |= this.getBit(0x80) << _bits;
    }
    return v;
  }

  public get(): number {
    return this.getValue(1);
  }

  public getSigned(v: number): number {
    const split = this._range >>> 1;
    const bit = this.bitUpdate(split);
    this.shift();
    return bit !== 0 ? -v : v;
  }

  public getSignedValue(bits: number): number {
    const value = this.getValue(bits);
    return this.get() === 1 ? -value : value;
  }

  /**
   * Read a bit with proba 'prob'. Speed-critical function!
   */
  private static readonly log2Range = [
    7, 6, 6, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 0,
  ];

  private static readonly newRange = [
    127, 127, 191, 127, 159, 191, 223, 127, 143, 159, 175, 191, 207, 223, 239,
    127, 135, 143, 151, 159, 167, 175, 183, 191, 199, 207, 215, 223, 231, 239,
    247, 127, 131, 135, 139, 143, 147, 151, 155, 159, 163, 167, 171, 175, 179,
    183, 187, 191, 195, 199, 203, 207, 211, 215, 219, 223, 227, 231, 235, 239,
    243, 247, 251, 127, 129, 131, 133, 135, 137, 139, 141, 143, 145, 147, 149,
    151, 153, 155, 157, 159, 161, 163, 165, 167, 169, 171, 173, 175, 177, 179,
    181, 183, 185, 187, 189, 191, 193, 195, 197, 199, 201, 203, 205, 207, 209,
    211, 213, 215, 217, 219, 221, 223, 225, 227, 229, 231, 233, 235, 237, 239,
    241, 243, 245, 247, 249, 251, 253, 127,
  ];
}
