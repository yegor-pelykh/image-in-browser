/** @format */

export abstract class MathOperators {
  /**
   * Returns the greatest common divisor of **x** and **y**.
   */
  public static gcd(x: number, y: number) {
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
   */
  public static clamp(num: number, low: number, high: number) {
    return Math.max(low, Math.min(num, high));
  }

  /**
   * Clamp **num** to [**a**, **b**] and truncate
   */
  public static clampInt(num: number, low: number, high: number): number {
    return Math.trunc(MathOperators.clamp(num, low, high));
  }

  /**
   * Clamp **num** to [**0**, **255**]
   */
  public static clampInt255(num: number): number {
    return Math.trunc(MathOperators.clamp(num, 0, 255));
  }
}
