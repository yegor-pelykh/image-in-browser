/** @format */

import { BitUtils } from './bit-utils.js';

/**
 * A 16-bit floating-point number, used by high-dynamic-range image formats
 * as a more efficient storage for floating-point values that don't require
 * full 32-bit precision. A list of Half floats can be stored in a
 * Uint16Array, and converted to a double using the **float16ToDouble** static
 * method.
 *
 * This class is derived from the OpenEXR library.
 */
export class Float16 {
  /** @private Stores the Float32Array used for conversion. */
  private static _toFloatFloat32Data?: Float32Array;

  /** @private Lookup table for exponent conversion. */
  private static _eLut: Uint16Array;

  /**
   * @private
   * Getter for the Float32Array used for conversion.
   * @returns {Float32Array} The Float32Array used for conversion.
   */
  private static get _toFloatFloat32(): Float32Array {
    return this._toFloatFloat32Data !== undefined
      ? this._toFloatFloat32Data
      : this.initialize();
  }

  /** The 16-bit representation of the floating-point number. */
  public bits: number;

  /**
   * Constructs a Float16 instance.
   * @param {number} [f] - The floating-point number to convert to 16-bit.
   */
  constructor(f?: number) {
    this.bits = f !== undefined ? Float16.doubleToFloat16(f) : 0;
  }

  /**
   * @private
   * Converts a 32-bit integer to a 16-bit floating-point number.
   * @param {number} i - The 32-bit integer to convert.
   * @returns {number} The 16-bit floating-point representation.
   */
  private static convert(i: number): number {
    const s = (i >>> 16) & 0x00008000;
    let e = ((i >>> 23) & 0x000000ff) - (127 - 15);
    let m = i & 0x007fffff;

    if (e <= 0) {
      if (e < -10) {
        return s;
      }

      m |= 0x00800000;
      const t = 14 - e;
      const a = (1 << (t - 1)) - 1;
      const b = (m >>> t) & 1;

      m = (m + a + b) >>> t;
      return s | m;
    } else if (e === 0xff - (127 - 15)) {
      if (m === 0) {
        return s | 0x7c00;
      } else {
        m >>>= 13;
        return s | 0x7c00 | m | (m === 0 ? 1 : 0);
      }
    } else {
      m = m + 0x00000fff + ((m >>> 13) & 1);

      if ((m & 0x00800000) !== 0) {
        m = 0;
        e += 1;
      }

      if (e > 30) {
        return s | 0x7c00;
      }

      return s | (e << 10) | (m >>> 13);
    }
  }

  /**
   * @private
   * Initializes the lookup tables for conversion.
   * @returns {Float32Array} The initialized Float32Array.
   */
  private static initialize(): Float32Array {
    if (this._toFloatFloat32Data !== undefined) {
      return this._toFloatFloat32Data;
    }

    const floatUint32Data = new Uint32Array(1 << 16);
    this._toFloatFloat32Data = new Float32Array(floatUint32Data.buffer);
    this._eLut = new Uint16Array(1 << 9);

    for (let i = 0; i < 0x100; i++) {
      const e = (i & 0x0ff) - (127 - 15);

      if (e <= 0 || e >= 30) {
        this._eLut[i] = 0;
        this._eLut[i | 0x100] = 0;
      } else {
        this._eLut[i] = e << 10;
        this._eLut[i | 0x100] = (e << 10) | 0x8000;
      }
    }

    const iMax = 1 << 16;
    for (let i = 0; i < iMax; i++) {
      floatUint32Data[i] = this.halfToFloat(i);
    }

    return this._toFloatFloat32Data;
  }

  /**
   * @private
   * Converts a 16-bit floating-point number to a 32-bit integer.
   * @param {number} y - The 16-bit floating-point number to convert.
   * @returns {number} The 32-bit integer representation.
   */
  private static halfToFloat(y: number): number {
    const s = (y >>> 15) & 0x00000001;
    let e = (y >>> 10) & 0x0000001f;
    let m = y & 0x000003ff;

    if (e === 0) {
      if (m === 0) {
        return s << 31;
      } else {
        while ((m & 0x00000400) === 0) {
          m <<= 1;
          e -= 1;
        }

        e += 1;
        m &= ~0x00000400;
      }
    } else if (e === 31) {
      if (m === 0) {
        return (s << 31) | 0x7f800000;
      } else {
        return (s << 31) | 0x7f800000 | (m << 13);
      }
    }

    e += 127 - 15;
    m <<= 13;

    return (s << 31) | (e << 23) | m;
  }

  /**
   * Creates a new Float16 instance from another Float16 instance.
   * @param {Float16} other - The other Float16 instance.
   * @returns {Float16} The new Float16 instance.
   */
  public static from(other: Float16): Float16 {
    const float16 = new Float16();
    float16.bits = other.bits;
    return float16;
  }

  /**
   * Creates a new Float16 instance from a 16-bit representation.
   * @param {number} bits - The 16-bit representation.
   * @returns {Float16} The new Float16 instance.
   */
  public static fromBits(bits: number): Float16 {
    const float16 = new Float16();
    float16.bits = bits;
    return float16;
  }

  /**
   * Converts a 16-bit floating-point number to a double.
   * @param {number} bits - The 16-bit floating-point number.
   * @returns {number} The double representation.
   */
  public static float16ToDouble(bits: number): number {
    return this._toFloatFloat32[bits];
  }

  /**
   * Converts a double to a 16-bit floating-point number.
   * @param {number} n - The double to convert.
   * @returns {number} The 16-bit floating-point representation.
   */
  public static doubleToFloat16(n: number): number {
    const f = n;
    const xI = BitUtils.float32ToUint32(f);
    if (f === 0) {
      return xI >>> 16;
    }

    if (this._toFloatFloat32Data === undefined) {
      this.initialize();
    }

    let e = (xI >>> 23) & 0x000001ff;

    e = this._eLut[e];

    if (e !== 0) {
      const m = xI & 0x007fffff;
      return e + ((m + 0x00000fff + ((m >>> 13) & 1)) >>> 13);
    }

    return this.convert(xI);
  }

  /**
   * Returns +Infinity.
   * @returns {Float16} The positive infinity representation.
   */
  public static posInf(): Float16 {
    return Float16.fromBits(0x7c00);
  }

  /**
   * Returns -Infinity.
   * @returns {Float16} The negative infinity representation.
   */
  public static negInf(): Float16 {
    return Float16.fromBits(0xfc00);
  }

  /**
   * Returns a NaN with the bit pattern 0111111111111111.
   * @returns {Float16} The NaN representation.
   */
  public static qNan(): Float16 {
    return Float16.fromBits(0x7fff);
  }

  /**
   * Returns a NaN with the bit pattern 0111110111111111.
   * @returns {Float16} The NaN representation.
   */
  public static sNan(): Float16 {
    return Float16.fromBits(0x7dff);
  }

  /**
   * Converts the 16-bit floating-point number to a double.
   * @returns {number} The double representation.
   */
  public toDouble(): number {
    return Float16._toFloatFloat32[this.bits];
  }

  /**
   * Unary minus.
   * @returns {Float16} The negated Float16 instance.
   */
  public minus(): Float16 {
    return Float16.fromBits(this.bits ^ 0x8000);
  }

  /**
   * Addition operator for Float16 or number operands.
   * @param {Float16 | number} f - The operand to add.
   * @returns {Float16} The result of the addition.
   */
  public add(f: Float16 | number): Float16 {
    const d =
      f instanceof Float16 ? f.toDouble() : typeof f === 'number' ? f : 0;
    return new Float16(this.toDouble() + d);
  }

  /**
   * Subtraction operator for Float16 or number operands.
   * @param {Float16 | number} f - The operand to subtract.
   * @returns {Float16} The result of the subtraction.
   */
  public sub(f: Float16 | number): Float16 {
    const d =
      f instanceof Float16 ? f.toDouble() : typeof f === 'number' ? f : 0;
    return new Float16(this.toDouble() - d);
  }

  /**
   * Multiplication operator for Float16 or number operands.
   * @param {Float16 | number} f - The operand to multiply.
   * @returns {Float16} The result of the multiplication.
   */
  public mul(f: Float16 | number): Float16 {
    const d =
      f instanceof Float16 ? f.toDouble() : typeof f === 'number' ? f : 0;
    return new Float16(this.toDouble() * d);
  }

  /**
   * Division operator for Float16 or number operands.
   * @param {Float16 | number} f - The operand to divide.
   * @returns {Float16} The result of the division.
   */
  public div(f: Float16 | number): Float16 {
    const d =
      f instanceof Float16 ? f.toDouble() : typeof f === 'number' ? f : 0;
    return new Float16(this.toDouble() / d);
  }

  /**
   * Round to n-bit precision (n should be between 0 and 10).
   * After rounding, the significand's 10-n least significant
   * bits will be zero.
   * @param {number} n - The number of bits to round to.
   * @returns {Float16} The rounded Float16 instance.
   */
  public round(n: number): Float16 {
    if (n >= 10) {
      return Float16.from(this);
    }

    const s = this.bits & 0x8000;
    let e = this.bits & 0x7fff;

    e >>>= 9 - n;
    e += e & 1;
    e <<= 9 - n;

    if (e >= 0x7c00) {
      e = this.bits;
      e >>>= 10 - n;
      e <<= 10 - n;
    }

    return Float16.fromBits(s | e);
  }

  /**
   * Returns true if the number is finite.
   * @returns {boolean} True if finite, false otherwise.
   */
  public isFinite(): boolean {
    const e = (this.bits >>> 10) & 0x001f;
    return e < 31;
  }

  /**
   * Returns true if the number is normalized.
   * @returns {boolean} True if normalized, false otherwise.
   */
  public isNormalized(): boolean {
    const e = (this.bits >>> 10) & 0x001f;
    return e > 0 && e < 31;
  }

  /**
   * Returns true if the number is denormalized.
   * @returns {boolean} True if denormalized, false otherwise.
   */
  public isDenormalized(): boolean {
    const e = (this.bits >>> 10) & 0x001f;
    const m = this.bits & 0x3ff;
    return e === 0 && m !== 0;
  }

  /**
   * Returns true if the number is zero.
   * @returns {boolean} True if zero, false otherwise.
   */
  public isZero(): boolean {
    return (this.bits & 0x7fff) === 0;
  }

  /**
   * Returns true if the number is NaN.
   * @returns {boolean} True if NaN, false otherwise.
   */
  public isNaN(): boolean {
    const e = (this.bits >>> 10) & 0x001f;
    const m = this.bits & 0x3ff;
    return e === 31 && m !== 0;
  }

  /**
   * Returns true if the number is infinity.
   * @returns {boolean} True if infinity, false otherwise.
   */
  public isInfinity(): boolean {
    const e = (this.bits >>> 10) & 0x001f;
    const m = this.bits & 0x3ff;
    return e === 31 && m === 0;
  }

  /**
   * Returns true if the number is negative.
   * @returns {boolean} True if negative, false otherwise.
   */
  public isNegative(): boolean {
    return (this.bits & 0x8000) !== 0;
  }
}
