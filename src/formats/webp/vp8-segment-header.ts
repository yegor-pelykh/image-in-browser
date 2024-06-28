/** @format */

import { VP8 } from './vp8.js';

/**
 * Represents the segment features for VP8 encoding.
 */
export class VP8SegmentHeader {
  /**
   * Indicates whether segments are used.
   */
  public useSegment: boolean = false;

  /**
   * Indicates whether to update the segment map.
   */
  public updateMap: boolean = false;

  /**
   * Specifies if the values for quantizer and filter are absolute or delta.
   */
  public absoluteDelta: boolean = true;

  /**
   * Holds the quantization changes for each segment.
   */
  public quantizer: Int8Array = new Int8Array(VP8.numMbSegments);

  /**
   * Holds the filter strength for each segment.
   */
  public filterStrength: Int8Array = new Int8Array(VP8.numMbSegments);
}
