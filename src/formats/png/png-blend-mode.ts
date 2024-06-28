/** @format */

/**
 * Enum representing PNG blend modes.
 */
export enum PngBlendMode {
  /**
   * No alpha blending should be done when drawing this frame (replace pixels in canvas).
   */
  source,

  /**
   * Alpha blending should be used when drawing this frame (composited over the current canvas image).
   */
  over,
}
