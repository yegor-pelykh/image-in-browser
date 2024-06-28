/** @format */

/**
 * Top/Left Contexts used for syntax-parsing
 */
export class VP8MB {
  /**
   * Non-zero AC/DC coefficients.
   * 4 bits for luma and 4 bits for chroma.
   */
  public nz: number = 0;

  /**
   * Non-zero DC coefficient.
   * 1 bit.
   */
  public nzDc: number = 0;
}
