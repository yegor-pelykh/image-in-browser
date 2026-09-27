/** @format */

/**
 * Fixed-point precision of the reciprocal quantizer.
 */
export const qFix = 17;

/**
 * Rounding bias per matrix kind, as [dc, ac] in 1/256ths.
 */
const biasMatrices = [
  // luma AC
  [96, 110],
  // luma DC (second transform)
  [96, 108],
  // chroma
  [110, 115],
];

/**
 * Number of bits the sharpening bias is descaled by.
 */
const sharpenBits = 11;

/**
 * A small boost of the high-frequency coefficients, which keeps detail that
 * the quantizer would otherwise round away in the mid-quality range.
 */
const freqSharpening = [
  0, 30, 60, 90, 30, 60, 90, 90, 60, 90, 90, 90, 90, 90, 90, 90,
];

/**
 * One quantization matrix: a step size per coefficient position, plus the
 * derived values that make quantizing a multiply and a shift.
 */
export class VP8Matrix {
  /**
   * Step sizes.
   */
  public readonly q: Int32Array = new Int32Array(16);

  /**
   * Reciprocals of {@link q} in fixed point.
   */
  public readonly iq: Int32Array = new Int32Array(16);

  /**
   * Rounding bias.
   */
  public readonly bias: Int32Array = new Int32Array(16);

  /**
   * Value at or below which a coefficient quantizes to zero.
   */
  public readonly zthresh: Int32Array = new Int32Array(16);

  /**
   * High-frequency boost added before quantizing.
   */
  public readonly sharpen: Int32Array = new Int32Array(16);

  /**
   * Fills in every position from the DC and first AC step already in {@link q},
   * and returns the average step size.
   *
   * {@link type} is 0 for luma AC, 1 for the luma DC block and 2 for chroma.
   */
  public expand(type: number): number {
    for (let i = 0; i < 2; i++) {
      const b = biasMatrices[type][i > 0 ? 1 : 0];
      this.iq[i] = (1 << qFix) / this.q[i];
      this.bias[i] = b << (qFix - 8);
      // The exact value at which the quantized level turns non-zero.
      this.zthresh[i] = ((1 << qFix) - 1 - this.bias[i]) / this.iq[i];
    }
    for (let i = 2; i < 16; i++) {
      this.q[i] = this.q[1];
      this.iq[i] = this.iq[1];
      this.bias[i] = this.bias[1];
      this.zthresh[i] = this.zthresh[1];
    }
    let sum = 0;
    for (let i = 0; i < 16; i++) {
      // Sharpening applies to luma AC only.
      this.sharpen[i] =
        type === 0 ? (freqSharpening[i] * this.q[i]) >> sharpenBits : 0;
      sum += this.q[i];
    }
    return (sum + 8) >> 4;
  }
}
