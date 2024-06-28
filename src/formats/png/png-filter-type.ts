/** @format */

/**
 * Enum representing the different types of PNG filters.
 */
export enum PngFilterType {
  /** No filter applied */
  none,
  /** Sub filter applied */
  sub,
  /** Up filter applied */
  up,
  /** Average filter applied */
  average,
  /** Paeth filter applied */
  paeth,
}
