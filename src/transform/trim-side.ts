/** @format */

/**
 * Enum representing the sides that can be trimmed.
 */
export enum TrimSide {
  /** Represents the top side. */
  top = 1,
  /** Represents the bottom side. */
  bottom = 2,
  /** Represents the left side. */
  left = 4,
  /** Represents the right side. */
  right = 8,
  /** Represents all sides. */
  all = top | bottom | left | right,
}
