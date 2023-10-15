/** @format */

import { VP8 } from './vp8';

/**
 * Segment features
 */
export class VP8SegmentHeader {
  public useSegment: boolean = false;
  /**
   * Whether to update the segment map or not
   */
  public updateMap: boolean = false;
  /**
   * Absolute or delta values for quantizer and filter
   */
  public absoluteDelta: boolean = true;
  /**
   * Quantization changes
   */
  public quantizer: Int8Array = new Int8Array(VP8.numMbSegments);
  /**
   * Filter strength for segments
   */
  public filterStrength: Int8Array = new Int8Array(VP8.numMbSegments);
}
