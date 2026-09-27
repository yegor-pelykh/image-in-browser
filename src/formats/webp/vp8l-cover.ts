/** @format */

/**
 * A parse of the image: how many pixels the token starting at each position
 * covers, and at what distance. Positions inside a token are never read.
 *
 * The two arrays are sized together so a caller cannot mismatch them. The
 * code that fills them runs without bounds checks.
 */
export class VP8LCover {
  /**
   * Length of both arrays. Nothing that reads them checks bounds, so a second
   * length kept alongside corrupts memory instead of throwing.
   */
  public readonly numPixels: number;

  public readonly cover: Int32Array;
  public readonly distance: Int32Array;

  constructor(numPixels: number) {
    this.numPixels = numPixels;
    this.cover = new Int32Array(numPixels);
    this.distance = new Int32Array(numPixels);
  }
}
