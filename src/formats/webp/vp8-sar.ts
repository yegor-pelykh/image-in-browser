/** @format */

/**
 * Arithmetic right shift of a signed 32-bit value.
 *
 * JavaScript's `>>` operator already performs an arithmetic right shift on
 * 32-bit signed values, so this is a thin wrapper that makes the intent clear.
 */
export function sar(value: number, shift: number): number {
  return value >> shift;
}
