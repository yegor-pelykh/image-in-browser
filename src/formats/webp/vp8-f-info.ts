/**
 * Filter specs
 *
 * @format
 */

export class VP8FInfo {
  /**
   * uint8_t, filter limit in [3..189], or 0 if no filtering
   */
  public fLimit: number = 0;
  /**
   * uint8_t, inner limit in [1..63]
   */
  public fInnerLevel: number = 0;
  /**
   * uint8_t, do inner filtering?
   */
  public fInner: boolean = false;
  /**
   * uint8_t, high edge variance threshold in [0..2]
   */
  public hevThresh: number = 0;
}
