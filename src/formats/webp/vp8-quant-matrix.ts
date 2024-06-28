/** @format */

/**
 * Class representing VP8 Quantization Matrices.
 */
export class VP8QuantMatrix {
  /**
   * Y1 quantization matrix.
   */
  public y1Mat: Int32Array = new Int32Array(2);

  /**
   * Y2 quantization matrix.
   */
  public y2Mat: Int32Array = new Int32Array(2);

  /**
   * UV quantization matrix.
   */
  public uvMat: Int32Array = new Int32Array(2);

  /**
   * U/V quantizer value.
   */
  public uvQuant: number = 0;

  /**
   * Dithering amplitude (0 = off, max=255).
   */
  public dither: number = 0;
}
