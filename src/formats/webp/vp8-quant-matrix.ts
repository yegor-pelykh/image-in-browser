/**
 * Dequantization matrices
 *
 * @format
 */

export class VP8QuantMatrix {
  public y1Mat: Int32Array = new Int32Array(2);
  public y2Mat: Int32Array = new Int32Array(2);
  public uvMat: Int32Array = new Int32Array(2);
  /**
   * U/V quantizer value
   */
  public uvQuant: number = 0;
  /**
   * Dithering amplitude (0 = off, max=255)
   */
  public dither: number = 0;
}
