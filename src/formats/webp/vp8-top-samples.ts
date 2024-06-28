/** @format */

/**
 * Saved top samples, per macroblock. Fits into a cache-line.
 */
export class VP8TopSamples {
  /**
   * Luma (Y) samples.
   */
  public y: Uint8Array = new Uint8Array(16);

  /**
   * Chroma (U) samples.
   */
  public u: Uint8Array = new Uint8Array(8);

  /**
   * Chroma (V) samples.
   */
  public v: Uint8Array = new Uint8Array(8);
}
