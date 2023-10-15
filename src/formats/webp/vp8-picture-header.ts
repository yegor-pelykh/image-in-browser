/** @format */

export class VP8PictureHeader {
  /**
   * uint16
   */
  public width: number = 0;
  /**
   * uint16
   */
  public height: number = 0;
  /**
   * uint8
   */
  public xscale: number = 0;
  /**
   * uint8
   */
  public yscale: number = 0;
  /**
   * uint8, 0 = YCbCr
   */
  public colorspace: number = 0;
  /**
   * uint8
   */
  public clampType: number = 0;
}
