/** @format */

/**
 * Arithmetic right shift of a signed 32-bit value, and the small sign-mask
 * helpers built on it.
 *
 * JavaScript's `>>` operator already performs an arithmetic right shift on
 * 32-bit signed values, so this is a thin wrapper that makes the intent clear.
 */
export function sar(value: number, shift: number): number {
  return value >> shift;
}

/**
 * |v|.
 */
export function absBranchless(v: number): number {
  return v < 0 ? -v : v;
}

/**
 * -1 for a negative value, 1 otherwise.
 */
export function signOf(v: number): number {
  return v < 0 ? -1 : 1;
}

/**
 * 1 for a non-zero value, 0 for zero.
 */
export function nonZero(v: number): number {
  return v !== 0 ? 1 : 0;
}

/**
 * `min(v, 2)`.
 */
export function min2(v: number): number {
  return v >= 2 ? 2 : v;
}
