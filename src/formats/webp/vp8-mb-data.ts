/**
 * Data needed to reconstruct a macroblock
 *
 * @format
 */

export class VP8MBData {
  /**
   * 384 coeffs = (16+4+4) * 4*4
   */
  public coeffs: Int16Array = new Int16Array(384);
  /**
   * true if intra4x4
   */
  public isIntra4x4: boolean = false;
  /**
   * one 16x16 mode (#0) or sixteen 4x4 modes
   */
  public imodes: Uint8Array = new Uint8Array(16);
  /**
   * chroma prediction mode
   */
  public uvmode: number = 0;
  /**
   * Bit-wise info about the content of each sub-4x4 blocks (in decoding order).
   * Each of the 4x4 blocks for y/u/v is associated with a 2b code according to:
   * code=0 -> no coefficient
   * code=1 -> only DC
   * code=2 -> first three coefficients are non-zero
   * code=3 -> more than three coefficients are non-zero
   * This allows to call specialized transform functions.
   */
  public nonZeroY: number = 0;
  public nonZeroUV: number = 0;
  /**
   * uint8_t, local dithering strength (deduced from non_zero_*)
   */
  public dither: number = 0;
}
