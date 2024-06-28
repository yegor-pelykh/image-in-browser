/** @format */

/**
 * Data needed to reconstruct a macroblock
 */
export class VP8MBData {
  /**
   * 384 coefficients for macroblock reconstruction.
   * (16+4+4) * 4*4
   */
  public coeffs: Int16Array = new Int16Array(384);

  /**
   * Indicates if the macroblock uses intra4x4 prediction.
   */
  public isIntra4x4: boolean = false;

  /**
   * Prediction modes for the macroblock.
   * One 16x16 mode (#0) or sixteen 4x4 modes.
   */
  public imodes: Uint8Array = new Uint8Array(16);

  /**
   * Chroma prediction mode for the macroblock.
   */
  public uvmode: number = 0;

  /**
   * Bit-wise info about the content of each sub-4x4 block (in decoding order).
   * Each of the 4x4 blocks for y/u/v is associated with a 2-bit code:
   * - code=0: no coefficient
   * - code=1: only DC
   * - code=2: first three coefficients are non-zero
   * - code=3: more than three coefficients are non-zero
   * This allows calling specialized transform functions.
   */
  public nonZeroY: number = 0;

  /**
   * Bit-wise info about the content of each sub-4x4 block for UV components.
   */
  public nonZeroUV: number = 0;

  /**
   * Local dithering strength, deduced from non_zero_*.
   */
  public dither: number = 0;
}
