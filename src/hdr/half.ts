/** @format */

import { BitOperators } from '../common/bit-operators';

/**
 * A 16-bit floating-point number, used by high-dynamic-range image formats
 * as a more efficient storage for floating-point values that don't require
 * full 32-bit precision. A list of Half floats can be stored in a **Uint16Array**,
 * and converted to a double using the **halfToDouble()** static method.
 *
 * This class is derived from the OpenEXR library.
 */
export class Half {
  private static toFloatUint32: Uint32Array;
  private static toFloatFloat32: Float32Array;
  private static eLut: Uint16Array;

  static {
    Half.toFloatUint32 = new Uint32Array(1 << 16);
    Half.toFloatFloat32 = new Float32Array(Half.toFloatUint32.buffer);
    Half.eLut = new Uint16Array(1 << 9);

    // Init eLut
    for (let i = 0; i < 0x100; i++) {
      const e = (i & 0x0ff) - (127 - 15);
      if (e <= 0 || e >= 30) {
        // Special case
        Half.eLut[i] = 0;
        Half.eLut[i | 0x100] = 0;
      } else {
        // Common case - normalized half, no exponent overflow possible
        Half.eLut[i] = e << 10;
        Half.eLut[i | 0x100] = (e << 10) | 0x8000;
      }
    }

    // Init toFloat
    const iMax = 1 << 16;
    for (let i = 0; i < iMax; i++) {
      Half.toFloatUint32[i] = Half.halfToFloat(i);
    }
  }

  private bits: number;

  constructor(bits: number) {
    this.bits = bits;
  }

  private static convert(i: number): number {
    // Our floating point number, f, is represented by the bit
    // pattern in integer i. Disassemble that bit pattern into
    // the sign, s, the exponent, e, and the significand, m.
    // Shift s into the position where it will go in in the
    // resulting half number.
    // Adjust e, accounting for the different exponent bias
    // of float and half (127 versus 15).
    const s = (i >> 16) & 0x00008000;
    let e = ((i >> 23) & 0x000000ff) - (127 - 15);
    let m = i & 0x007fffff;

    // Now reassemble s, e and m into a half:
    if (e <= 0) {
      if (e < -10) {
        // E is less than -10. The absolute value of f is
        // less than HALF_MIN (f may be a small normalized
        // float, a denormalized float or a zero).
        //
        // We convert f to a half zero with the same sign as f.
        return s;
      }

      // E is between -10 and 0. F is a normalized float
      // whose magnitude is less than HALF_NRM_MIN.
      //
      // We convert f to a denormalized half.

      // Add an explicit leading 1 to the significand.

      m |= 0x00800000;

      // Round to m to the nearest (10+e)-bit value (with e between
      // -10 and 0); in case of a tie, round to the nearest even value.
      //
      // Rounding may cause the significand to overflow and make
      // our number normalized. Because of the way a half's bits
      // are laid out, we don't have to treat this case separately;
      // the code below will handle it correctly.

      const t = 14 - e;
      const a = (1 << (t - 1)) - 1;
      const b = (m >> t) & 1;

      m = (m + a + b) >> t;

      // Assemble the half from s, e (zero) and m.
      return s | m;
    } else if (e === 0xff - (127 - 15)) {
      if (m === 0) {
        // F is an infinity; convert f to a half
        // infinity with the same sign as f.
        return s | 0x7c00;
      } else {
        // F is a NAN; we produce a half NAN that preserves
        // the sign bit and the 10 leftmost bits of the
        // significand of f, with one exception: If the 10
        // leftmost bits are all zero, the NAN would turn
        // into an infinity, so we have to set at least one
        // bit in the significand.

        m >>= 13;
        return s | 0x7c00 | m | (m === 0 ? 1 : 0);
      }
    } else {
      // E is greater than zero. F is a normalized float.
      // We try to convert f to a normalized half.

      // Round to m to the nearest 10-bit value. In case of
      // a tie, round to the nearest even value.
      m = m + 0x00000fff + ((m >> 13) & 1);

      if ((m & 0x00800000) !== 0) {
        // Overflow in significand,
        m = 0;
        // Adjust exponent
        e += 1;
      }

      // Handle exponent overflow

      if (e > 30) {
        // If this returns, the half becomes an
        // infinity with the same sign as f.
        return s | 0x7c00;
      }

      // Assemble the half from s, e and m.
      return s | (e << 10) | (m >> 13);
    }
  }

  private static halfToFloat(y: number): number {
    const s = (y >> 15) & 0x00000001;
    let e = (y >> 10) & 0x0000001f;
    let m = y & 0x000003ff;

    if (e === 0) {
      if (m === 0) {
        // Plus or minus zero
        return s << 31;
      } else {
        // Denormalized number -- re-normalize it
        while ((m & 0x00000400) === 0) {
          m <<= 1;
          e -= 1;
        }

        e += 1;
        m &= ~0x00000400;
      }
    } else if (e === 31) {
      if (m === 0) {
        // Positive or negative infinity
        return (s << 31) | 0x7f800000;
      } else {
        // Nan -- preserve sign and significand bits
        return (s << 31) | 0x7f800000 | (m << 13);
      }
    }

    // Normalized number
    e += 127 - 15;
    m <<= 13;

    // Assemble s, e and m.
    return (s << 31) | (e << 23) | m;
  }

  private static fromBits(bits: number) {
    return new Half(bits);
  }

  public static halfToDouble(bits: number): number {
    return this.toFloatFloat32[bits];
  }

  public static doubleToHalf(n: number): number {
    const f = n;
    const xi = BitOperators.toUint32(f);
    if (f === 0.0) {
      // Common special case - zero.
      // Preserve the zero's sign bit.
      return xi >> 16;
    }

    // We extract the combined sign and exponent, e, from our
    // floating-point number, f. Then we convert e to the sign
    // and exponent of the half number via a table lookup.
    //
    // For the most common case, where a normalized half is produced,
    // the table lookup returns a non-zero value; in this case, all
    // we have to do is round f's significand to 10 bits and combine
    // the result with e.
    //
    // For all other cases (overflow, zeroes, denormalized numbers
    // resulting from underflow, infinities and NANs), the table
    // lookup returns zero, and we call a longer, non-inline function
    // to do the float-to-half conversion.
    let e = (xi >> 23) & 0x000001ff;

    e = this.eLut[e];

    if (e !== 0) {
      // Simple case - round the significand, m, to 10
      // bits and combine it with the sign and exponent.
      const m = xi & 0x007fffff;
      return e + ((m + 0x00000fff + ((m >> 13) & 1)) >> 13);
    }

    // Difficult case - call a function.
    return this.convert(xi);
  }

  /**
   * Returns +infinity.
   */
  public static positiveInfinity(): Half {
    return Half.fromBits(0x7c00);
  }

  /**
   * Returns -infinity.
   */
  public static negativeInfinity(): Half {
    return Half.fromBits(0xfc00);
  }

  /**
   * Returns a NAN with the bit pattern 0111111111111111.
   */
  public static qNan(): Half {
    return Half.fromBits(0x7fff);
  }

  /**
   * Returns a NAN with the bit pattern 0111110111111111.
   */
  public static sNan(): Half {
    return Half.fromBits(0x7dff);
  }

  public toDouble(): number {
    return Half.toFloatFloat32[this.bits];
  }

  /**
   * Unary minus
   */
  public unaryMinus(): Half {
    return Half.fromBits(this.bits ^ 0x8000);
  }

  /**
   * Addition operator for Half or num left operands.
   */
  public add(other: Half | number): Half {
    let d = 0;
    if (other instanceof Half) {
      d = other.toDouble();
    } else if (typeof other === 'number') {
      d = other;
    }
    const bits = Half.doubleToHalf(this.toDouble() + d);
    return new Half(bits);
  }

  /**
   * Subtraction operator for Half or num left operands.
   */
  public subtract(other: Half | number): Half {
    let d = 0;
    if (other instanceof Half) {
      d = other.toDouble();
    } else if (typeof other === 'number') {
      d = other;
    }
    const bits = Half.doubleToHalf(this.toDouble() - d);
    return new Half(bits);
  }

  /**
   * Multiplication operator for Half or num left operands.
   */
  public multiply(other: Half | number): Half {
    let d = 0;
    if (other instanceof Half) {
      d = other.toDouble();
    } else if (typeof other === 'number') {
      d = other;
    }
    const bits = Half.doubleToHalf(this.toDouble() * d);
    return new Half(bits);
  }

  /**
   * Division operator for Half or num left operands.
   */
  public divide(other: Half | number): Half {
    let d = 0;
    if (other instanceof Half) {
      d = other.toDouble();
    } else if (typeof other === 'number') {
      d = other;
    }
    const bits = Half.doubleToHalf(this.toDouble() / d);
    return new Half(bits);
  }

  /**
   * Round to n-bit precision (n should be between 0 and 10).
   * After rounding, the significand's 10-n least significant
   * bits will be zero.
   */
  public round(n: number): Half {
    if (n >= 10) {
      return this;
    }

    // Disassemble h into the sign, s,
    // and the combined exponent and significand, e.
    const s = this.bits & 0x8000;
    let e = this.bits & 0x7fff;

    // Round the exponent and significand to the nearest value
    // where ones occur only in the (10-n) most significant bits.
    // Note that the exponent adjusts automatically if rounding
    // up causes the significand to overflow.

    e >>= 9 - n;
    e += e & 1;
    e <<= 9 - n;

    // Check for exponent overflow.
    if (e >= 0x7c00) {
      // Overflow occurred -- truncate instead of rounding.
      e = this.bits;
      e >>= 10 - n;
      e <<= 10 - n;
    }

    // Put the original sign bit back.

    return Half.fromBits(s | e);
  }

  /**
   * Returns true if h is a normalized number, a denormalized number or zero.
   */
  public isFinite(): boolean {
    const e = (this.bits >> 10) & 0x001f;
    return e < 31;
  }

  /**
   * Returns true if h is a normalized number.
   */
  public isNormalized(): boolean {
    const e = (this.bits >> 10) & 0x001f;
    return e > 0 && e < 31;
  }

  /**
   * Returns true if h is a denormalized number.
   */
  public isDenormalized(): boolean {
    const e = (this.bits >> 10) & 0x001f;
    const m = this.bits & 0x3ff;
    return e === 0 && m !== 0;
  }

  /**
   * Returns true if h is zero.
   */
  public isZero(): boolean {
    return (this.bits & 0x7fff) === 0;
  }

  /**
   * Returns true if h is a NAN.
   */
  public isNan(): boolean {
    const e = (this.bits >> 10) & 0x001f;
    const m = this.bits & 0x3ff;
    return e === 31 && m !== 0;
  }

  /**
   * Returns true if h is a positive or a negative infinity.
   */
  public isInfinity(): boolean {
    const e = (this.bits >> 10) & 0x001f;
    const m = this.bits & 0x3ff;
    return e === 31 && m === 0;
  }

  /**
   * Returns true if the sign bit of h is set (negative).
   */
  public isNegative(): boolean {
    return (this.bits & 0x8000) !== 0;
  }

  public getBits(): number {
    return this.bits;
  }

  public setBits(bits: number): void {
    this.bits = bits;
  }
}
