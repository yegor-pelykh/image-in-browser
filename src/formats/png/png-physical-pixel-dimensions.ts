/**
 * Class representing the physical pixel dimensions of a PNG image.
 *
 * @format
 */

export class PngPhysicalPixelDimensions {
  /**
   * Conversion factor from meters to inches.
   */
  private static readonly _inchesPerM: number = 39.3701;

  /**
   * Unit specifier for unknown units.
   */
  public static readonly unitUnknown: number = 0;

  /**
   * Unit specifier for meters.
   */
  public static readonly unitMeter: number = 1;

  /**
   * Pixels per unit on the X axis.
   */
  private _xPxPerUnit: number;

  /**
   * Gets the pixels per unit on the X axis.
   * @returns {number} Pixels per unit on the X axis.
   */
  public get xPxPerUnit(): number {
    return this._xPxPerUnit;
  }

  /**
   * Pixels per unit on the Y axis.
   */
  private _yPxPerUnit: number;

  /**
   * Gets the pixels per unit on the Y axis.
   */
  public get yPxPerUnit(): number {
    return this._yPxPerUnit;
  }

  /**
   * Unit specifier, either `unitUnknown` or `unitMeter`.
   */
  private _unitSpecifier: number;

  /**
   * Gets the unit specifier.
   */
  public get unitSpecifier(): number {
    return this._unitSpecifier;
  }

  /**
   * Constructs a dimension descriptor with the given values.
   * @param {number} xPxPerUnit - Pixels per unit on the X axis.
   * @param {number} yPxPerUnit - Pixels per unit on the Y axis.
   * @param {number} unitSpecifier - Unit specifier, either `unitUnknown` or `unitMeter`.
   */
  constructor(xPxPerUnit: number, yPxPerUnit: number, unitSpecifier: number) {
    this._xPxPerUnit = xPxPerUnit;
    this._yPxPerUnit = yPxPerUnit;
    this._unitSpecifier = unitSpecifier;
  }

  /**
   * Constructs a dimension descriptor specifying x and y resolution in dots per inch (DPI).
   * If `dpiY` is unspecified, `dpiX` is used for both x and y axes.
   * @param {number} dpiX - Dots per inch on the X axis.
   * @param {number} [dpiY] - Dots per inch on the Y axis.
   * @returns {PngPhysicalPixelDimensions} A new instance of `PngPhysicalPixelDimensions`.
   */
  public static fromDPI(
    dpiX: number,
    dpiY?: number
  ): PngPhysicalPixelDimensions {
    const xPxPerUnit = Math.round(
      dpiX * PngPhysicalPixelDimensions._inchesPerM
    );
    const yPxPerUnit = Math.round(
      (dpiY ?? dpiX) * PngPhysicalPixelDimensions._inchesPerM
    );
    const unitSpecifier = PngPhysicalPixelDimensions.unitMeter;
    return new PngPhysicalPixelDimensions(
      xPxPerUnit,
      yPxPerUnit,
      unitSpecifier
    );
  }

  /**
   * Checks if this instance is equal to another `PngPhysicalPixelDimensions` instance.
   * @param {PngPhysicalPixelDimensions} other - The other instance to compare with.
   * @returns {boolean} `true` if the instances are equal, `false` otherwise.
   */
  public equals(other: PngPhysicalPixelDimensions): boolean {
    return (
      this._xPxPerUnit === other._xPxPerUnit &&
      this._yPxPerUnit === other._yPxPerUnit &&
      this._unitSpecifier === other._unitSpecifier
    );
  }
}
