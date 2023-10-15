/**
 * Saved top samples, per macroblock. Fits into a cache-line.
 *
 * @format
 */

export class VP8TopSamples {
  public y: Uint8Array = new Uint8Array(16);
  public u: Uint8Array = new Uint8Array(8);
  public v: Uint8Array = new Uint8Array(8);
}
