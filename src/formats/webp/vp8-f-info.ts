/** @format */

/**
 * Class representing VP8 filter information.
 */
export class VP8FInfo {
  /**
   * Filter limit in the range [3..189], or 0 if no filtering.
   * @type {number}
   */
  public fLimit: number = 0;

  /**
   * Inner limit in the range [1..63].
   * @type {number}
   */
  public fInnerLevel: number = 0;

  /**
   * Indicates whether inner filtering is applied.
   * @type {boolean}
   */
  public fInner: boolean = false;

  /**
   * High edge variance threshold in the range [0..2].
   * @type {number}
   */
  public hevThresh: number = 0;
}
