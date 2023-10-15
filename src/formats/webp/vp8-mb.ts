/**
 * Top/Left Contexts used for syntax-parsing
 *
 * @format
 */

export class VP8MB {
  /**
   * uint8_t, non-zero AC/DC coeffs (4bit for luma + 4bit for chroma)
   */
  public nz: number = 0;
  /**
   * uint8_t, non-zero DC coeff (1bit)
   */
  public nzDc: number = 0;
}
