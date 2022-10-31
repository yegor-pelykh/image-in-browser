/** @format */

export class TrimSide {
  /**
   * Trim the image down from the top.
   */
  public static readonly top = new TrimSide(1);

  /**
   * Trim the image up from the bottom.
   */
  public static readonly bottom = new TrimSide(2);

  /**
   * Trim the left edge of the image.
   */
  public static readonly left = new TrimSide(4);

  /**
   * Trim the right edge of the image.
   */
  public static readonly right = new TrimSide(8);

  /**
   * Trim all edges of the image.
   */
  public static readonly all = new TrimSide(1 | 2 | 4 | 8);

  private value: number;

  constructor(...sides: [number | TrimSide, ...(number | TrimSide)[]]) {
    this.value = 0;
    for (const s of sides) {
      this.value |= typeof s === 'number' ? s : s.value;
    }
  }

  public has(side: TrimSide) {
    return (this.value & side.value) !== 0;
  }
}
