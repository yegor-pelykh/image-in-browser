/** @format */

export enum DisposeMode {
  /**
   * When drawing a frame, the canvas should be left as it is.
   */
  none,

  /**
   * When drawing a frame, the canvas should be cleared first.
   */
  clear,

  /**
   * When drawing this frame, the canvas should be reverted to how it was before drawing it.
   */
  previous,
}
