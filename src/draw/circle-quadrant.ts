/** @format */

/**
 * Enum representing the quadrants of a circle.
 */
export enum CircleQuadrant {
  /**
   * Represents the top-left quadrant of a circle.
   */
  topLeft = 1,

  /**
   * Represents the top-right quadrant of a circle.
   */
  topRight = 2,

  /**
   * Represents the bottom-left quadrant of a circle.
   */
  bottomLeft = 4,

  /**
   * Represents the bottom-right quadrant of a circle.
   */
  bottomRight = 8,

  /**
   * Represents all quadrants of a circle.
   */
  all = topLeft | topRight | bottomLeft | bottomRight,
}
