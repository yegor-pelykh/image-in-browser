/** @format */

/**
 * Represents various flags used in PSD files.
 */
export class PsdFlag {
  /**
   * Flag indicating transparency protection.
   */
  public static readonly transparencyProtected: number = 1;

  /**
   * Flag indicating the layer is hidden.
   */
  public static readonly hidden: number = 2;

  /**
   * Flag indicating the flag is obsolete.
   */
  public static readonly obsolete: number = 4;

  /**
   * Flag indicating Photoshop 5 compatibility.
   */
  public static readonly photoshop5: number = 8;

  /**
   * Flag indicating pixel data is irrelevant to appearance.
   */
  public static readonly pixelDataIrrelevantToAppearance: number = 16;

  /**
   * The value of the flag.
   */
  private _value: number;

  /**
   * Gets the value of the flag.
   * @returns {number} The value of the flag.
   */
  public get value(): number {
    return this._value;
  }

  /**
   * Initializes a new instance of the PsdFlag class.
   * @param {number} value - The value of the flag.
   */
  constructor(value: number) {
    this._value = value;
  }
}
