/**
 * Abstract class containing various mathematical utility functions.
 *
 * @format
 */

export abstract class MathUtils {
  /**
   * Returns the fractional part of a number.
   * @param {number} x - The input number.
   * @returns {number} The fractional part of the input number.
   */
  public static fract(x: number): number {
    return x - Math.floor(x);
  }

  /**
   * Performs smooth interpolation between two edges.
   * @param {number} edge0 - The lower edge.
   * @param {number} edge1 - The upper edge.
   * @param {number} x - The input value.
   * @returns {number} The interpolated value.
   */
  public static smoothStep(edge0: number, edge1: number, x: number): number {
    const t0 = (x - edge0) / (edge1 - edge0);
    const t = MathUtils.clamp(t0, 0, 1);
    return t * t * (3 - 2 * t);
  }

  /**
   * Linearly interpolates between two values.
   * @param {number} x - The first value.
   * @param {number} y - The second value.
   * @param {number} a - The interpolation factor.
   * @returns {number} The interpolated value.
   */
  public static mix(x: number, y: number, a: number): number {
    return x * (1 - a) + y * a;
  }

  /**
   * Returns the sign of a number.
   * @param {number} x - The input number.
   * @returns {number} -1 if the number is negative, 1 if positive, 0 if zero.
   */
  public static sign(x: number): number {
    return x < 0 ? -1 : x > 0 ? 1 : 0;
  }

  /**
   * Returns 0 if the input is less than the edge, otherwise returns 1.
   * @param {number} edge - The edge value.
   * @param {number} x - The input value.
   * @returns {number} 0 or 1 based on the comparison.
   */
  public static step(edge: number, x: number): number {
    return x < edge ? 0 : 1;
  }

  /**
   * Calculates the Euclidean length of a 3D vector.
   * @param {number} x - The x component.
   * @param {number} y - The y component.
   * @param {number} z - The z component.
   * @returns {number} The length of the vector.
   */
  public static length3(x: number, y: number, z: number): number {
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * Returns the greatest common divisor of **x** and **y**.
   * @param {number} x - The first number.
   * @param {number} y - The second number.
   * @returns {number} The greatest common divisor.
   */
  public static gcd(x: number, y: number): number {
    let _x = Math.abs(x);
    let _y = Math.abs(y);
    while (_y) {
      const t = _y;
      _y = _x % _y;
      _x = t;
    }
    return _x;
  }

  /**
   * Clamp **num** to [**low**, **high**]
   * @param {number} num - The number to clamp.
   * @param {number} low - The lower bound.
   * @param {number} high - The upper bound.
   * @returns {number} The clamped value.
   */
  public static clamp(num: number, low: number, high: number): number {
    return Math.max(low, Math.min(num, high));
  }

  /**
   * Clamp **num** to [**low**, **high**] and truncate
   * @param {number} num - The number to clamp.
   * @param {number} low - The lower bound.
   * @param {number} high - The upper bound.
   * @returns {number} The clamped and truncated value.
   */
  public static clampInt(num: number, low: number, high: number): number {
    return Math.trunc(MathUtils.clamp(num, low, high));
  }

  /**
   * Clamp **num** to [0, 255] and truncate
   * @param {number} num - The number to clamp.
   * @returns {number} The clamped and truncated value.
   */
  public static clampInt255(num: number): number {
    return Math.trunc(MathUtils.clamp(num, 0, 255));
  }
}
