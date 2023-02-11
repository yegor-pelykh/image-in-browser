/** @format */

/**
 * The type of image this frame represents. Multi-page formats, such as
 * TIFF, can represent the frames of an animation as pages in a document.
 */
export enum FrameType {
  /**
   * The frames of this document are to be interpreted as animation.
   */
  animation,

  /**
   * The frames of this document are to be interpreted as pages of a document.
   */
  page,

  /**
   * The frames of this document are to be interpreted as a sequence of images.
   */
  sequence,
}
