/** @format */

/**
 * Represents the header of a VP8 frame.
 */
export class VP8FrameHeader {
  /** Indicates if the frame is a key frame. */
  public keyFrame: boolean = false;

  /** The profile of the VP8 frame. */
  public profile: number = 0;

  /** The show value of the VP8 frame. */
  public show: number = 0;

  /** The length of the partition in the VP8 frame. */
  public partitionLength: number = 0;
}
