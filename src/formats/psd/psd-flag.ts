/** @format */

export class PsdFlag {
  public static readonly transparencyProtected: number = 1;
  public static readonly hidden: number = 2;
  public static readonly obsolete: number = 4;
  public static readonly photoshop5: number = 8;
  public static readonly pixelDataIrrelevantToAppearance: number = 16;

  private _value: number;
  public get value(): number {
    return this._value;
  }

  constructor(value: number) {
    this._value = value;
  }
}
