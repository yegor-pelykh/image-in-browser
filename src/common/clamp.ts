/** @format */

export abstract class Clamp {
  public static clamp(number: number, low: number, high: number) {
    return Math.max(low, Math.min(number, high));
  }

  /**
   * Clamp **x** to [**a**, **b**]
   */
  public static clampInt(x: number, a: number, b: number): number {
    return Math.trunc(Clamp.clamp(x, a, b));
  }

  /**
   * Clamp **x** to [**0**, **255**]
   */
  public static clampInt255(x: number): number {
    return Math.trunc(Clamp.clamp(x, 0, 255));
  }
}
