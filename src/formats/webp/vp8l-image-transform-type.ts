/** @format */

/**
 * Enum representing the types of VP8L image transforms.
 */
export enum VP8LImageTransformType {
  /**
   * Predictor transform type.
   */
  predictor = 0,

  /**
   * Cross color transform type.
   */
  crossColor = 1,

  /**
   * Subtract green transform type.
   */
  subtractGreen = 2,

  /**
   * Color indexing transform type.
   */
  colorIndexing = 3,
}
