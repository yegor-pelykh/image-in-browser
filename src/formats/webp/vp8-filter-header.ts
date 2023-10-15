/** @format */

import { VP8 } from './vp8';

/**
 * Filter parameters
 */
export class VP8FilterHeader {
  /**
   * 0=complex, 1=simple
   */
  public simple: boolean = false;
  /**
   * [0..63]
   */
  public level: number = 0;
  /**
   * [0..7]
   */
  public sharpness: number = 0;
  public useLfDelta: boolean = false;
  public refLfDelta: Int32Array = new Int32Array(VP8.numRefLfDeltas);
  public modeLfDelta: Int32Array = new Int32Array(VP8.numModeLfDeltas);
}
