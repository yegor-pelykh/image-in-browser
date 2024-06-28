/** @format */

/**
 * Represents the header of a VP8 picture.
 */
export class VP8PictureHeader {
  /**
   * The width of the picture in pixels.
   * @type {number}
   */
  public width: number = 0;

  /**
   * The height of the picture in pixels.
   * @type {number}
   */
  public height: number = 0;

  /**
   * The horizontal scaling factor.
   * @type {number}
   */
  public xscale: number = 0;

  /**
   * The vertical scaling factor.
   * @type {number}
   */
  public yscale: number = 0;

  /**
   * The color space of the picture. 0 represents YCbCr.
   * @type {number}
   */
  public colorspace: number = 0;

  /**
   * The clamp type of the picture.
   * @type {number}
   */
  public clampType: number = 0;
}
