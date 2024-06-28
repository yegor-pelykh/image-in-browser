/** @format */

import { VP8 } from './vp8.js';

/**
 * Class representing the filter parameters for VP8.
 */
export class VP8FilterHeader {
  /**
   * Indicates the filter type: 0 for complex, 1 for simple.
   */
  public simple: boolean = false;

  /**
   * Filter level ranging from 0 to 63.
   */
  public level: number = 0;

  /**
   * Sharpness level ranging from 0 to 7.
   */
  public sharpness: number = 0;

  /**
   * Indicates whether loop filter deltas are used.
   */
  public useLfDelta: boolean = false;

  /**
   * Array of reference loop filter deltas.
   */
  public refLfDelta: Int32Array = new Int32Array(VP8.numRefLfDeltas);

  /**
   * Array of mode loop filter deltas.
   */
  public modeLfDelta: Int32Array = new Int32Array(VP8.numModeLfDeltas);
}
