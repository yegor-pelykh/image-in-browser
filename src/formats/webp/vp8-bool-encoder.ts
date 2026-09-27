/** @format */

import { ArrayUtils } from '../../common/array-utils.js';

/**
 * The boolean (binary arithmetic) coder that VP8 writes everything through.
 *
 * Every symbol costs a probability that it is zero, in 1/256ths; a symbol that
 * matches its probability costs a fraction of a bit. The coder keeps an
 * interval (`_range`, `_value`) and narrows it per symbol, emitting bytes as
 * they become fixed.
 *
 * Bytes of 0xff cannot be emitted immediately, because a later carry has to be
 * able to propagate through them, so they are counted in `_run` and written
 * once the carry is known.
 */
export class VP8BoolEncoder {
  private static readonly _norm = new Uint8Array([
    7, 6, 6, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 0,
  ]);

  private static readonly _newRange = new Uint8Array([
    127, 127, 191, 127, 159, 191, 223, 127, 143, 159, 175, 191, 207, 223, 239,
    127, 135, 143, 151, 159, 167, 175, 183, 191, 199, 207, 215, 223, 231, 239,
    247, 127, 131, 135, 139, 143, 147, 151, 155, 159, 163, 167, 171, 175, 179,
    183, 187, 191, 195, 199, 203, 207, 211, 215, 219, 223, 227, 231, 235, 239,
    243, 247, 251, 127, 129, 131, 133, 135, 137, 139, 141, 143, 145, 147, 149,
    151, 153, 155, 157, 159, 161, 163, 165, 167, 169, 171, 173, 175, 177, 179,
    181, 183, 185, 187, 189, 191, 193, 195, 197, 199, 201, 203, 205, 207, 209,
    211, 213, 215, 217, 219, 221, 223, 225, 227, 229, 231, 233, 235, 237, 239,
    241, 243, 245, 247, 249, 251, 253, 127,
  ]);

  private _buf: Uint8Array;
  private _pos: number = 0;

  private _range: number = 255 - 1;
  private _value: number = 0;

  /**
   * Number of pending 0xff bytes whose carry is not yet decided.
   */
  private _run: number = 0;

  /**
   * Number of bits held in `_value` beyond the eight being assembled.
   */
  private _nbBits: number = -8;

  constructor(expectedSize: number = 1024) {
    this._buf = new Uint8Array(expectedSize < 1024 ? 1024 : expectedSize);
  }

  /**
   * Bytes written so far.
   */
  public get length(): number {
    return this._pos;
  }

  /**
   * The approximate write position, in bits.
   */
  public get bitPosition(): number {
    return (this._pos + this._run) * 8 + 8 + this._nbBits;
  }

  public putBit(bit: number, prob: number): number {
    const split = (this._range * prob) >> 8;
    if (bit !== 0) {
      this._value += split + 1;
      this._range -= split + 1;
    } else {
      this._range = split;
    }
    if (this._range < 127) {
      const shift = VP8BoolEncoder._norm[this._range];
      this._range = VP8BoolEncoder._newRange[this._range];
      this._value <<= shift;
      this._nbBits += shift;
      if (this._nbBits > 0) {
        this.flush();
      }
    }
    return bit;
  }

  public putBitUniform(bit: number): number {
    const split = this._range >> 1;
    if (bit !== 0) {
      this._value += split + 1;
      this._range -= split + 1;
    } else {
      this._range = split;
    }
    if (this._range < 127) {
      this._range = VP8BoolEncoder._newRange[this._range];
      this._value <<= 1;
      this._nbBits += 1;
      if (this._nbBits > 0) {
        this.flush();
      }
    }
    return bit;
  }

  public putBits(value: number, nbBits: number): void {
    for (let mask = 1 << (nbBits - 1); mask !== 0; mask >>= 1) {
      this.putBitUniform(value & mask);
    }
  }

  public putSignedBits(value: number, nbBits: number): void {
    if (this.putBitUniform(value !== 0 ? 1 : 0) === 0) {
      return;
    }
    if (value < 0) {
      this.putBits((-value << 1) | 1, nbBits + 1);
    } else {
      this.putBits(value << 1, nbBits + 1);
    }
  }

  private flush(): void {
    const s = 8 + this._nbBits;
    const bits = this._value >> s;
    this._value -= bits << s;
    this._nbBits -= 8;
    if ((bits & 0xff) !== 0xff) {
      let pos = this._pos;
      this.reserve(this._run + 1);
      if ((bits & 0x100) !== 0) {
        // Overflow: propagate the carry back over the pending 0xff bytes.
        if (pos > 0) {
          this._buf[pos - 1]++;
        }
      }
      if (this._run > 0) {
        const value = (bits & 0x100) !== 0 ? 0x00 : 0xff;
        for (; this._run > 0; --this._run) {
          this._buf[pos++] = value;
        }
      }
      this._buf[pos++] = bits & 0xff;
      this._pos = pos;
    } else {
      this._run++;
    }
  }

  private reserve(extra: number): void {
    const needed = this._pos + extra;
    if (needed <= this._buf.length) {
      return;
    }
    let size = this._buf.length * 2;
    if (size < needed) {
      size = needed;
    }
    const newBuf = new Uint8Array(size);
    ArrayUtils.copyRange(this._buf, 0, newBuf, 0, this._pos);
    this._buf = newBuf;
  }

  /**
   * Appends raw bytes. Only valid once {@link finish} has flushed the coder.
   */
  public append(data: Uint8Array): void {
    this.reserve(data.length);
    this._buf.set(data, this._pos);
    this._pos += data.length;
  }

  /**
   * Flushes the pending bits and returns everything written.
   *
   * The returned array is a view on the internal buffer; the coder must not be
   * used again except through {@link append}.
   */
  public finish(): Uint8Array {
    this.putBits(0, 9 - this._nbBits);
    this._nbBits = 0;
    this.flush();
    return this._buf.subarray(0, this._pos);
  }
}
