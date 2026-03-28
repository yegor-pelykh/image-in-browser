/** @format */

/**
 * Interface representing CICP data for PNG images.
 */
export interface PngCicpData {
  /**
   * Specifies the color primaries used in the image.
   * This value indicates the chromaticity coordinates of the source primaries.
   */
  readonly colorPrimaries: number;

  /**
   * Specifies the transfer characteristics of the image.
   * This value defines the opto-electronic transfer characteristic of the source picture.
   */
  readonly transferCharacteristics: number;

  /**
   * Specifies the matrix coefficients used in the image.
   * This value is used to derive the luma and chroma signals from the RGB primaries.
   */
  readonly matrixCoefficients: number;

  /**
   * Indicates whether the video signal is in full range.
   * A value of 1 means full range, while 0 means limited range.
   */
  readonly videoFullRangeFlag: number;
}
