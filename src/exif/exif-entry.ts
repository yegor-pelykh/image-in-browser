/** @format */

import { IfdValue } from './ifd-value/ifd-value.js';

/**
 * Represents an entry in the EXIF metadata.
 */
export class ExifEntry {
  /**
   * The tag identifier for the EXIF entry.
   */
  private readonly _tag: number;

  /**
   * Gets the tag identifier for the EXIF entry.
   * @returns {number} The tag identifier.
   */
  public get tag(): number {
    return this._tag;
  }

  /**
   * The value associated with the EXIF entry.
   */
  private _value: IfdValue | undefined;

  /**
   * Gets the value associated with the EXIF entry.
   * @returns {IfdValue | undefined} The value, or undefined if not set.
   */
  public get value(): IfdValue | undefined {
    return this._value;
  }

  /**
   * Sets the value associated with the EXIF entry.
   * @param {IfdValue | undefined} v - The value to set.
   */
  public set value(v: IfdValue | undefined) {
    this._value = v;
  }

  /**
   * Creates a new instance of ExifEntry.
   * @param {number} tag - The tag identifier for the EXIF entry.
   * @param {IfdValue} [value] - The value associated with the EXIF entry (optional).
   */
  constructor(tag: number, value?: IfdValue) {
    this._tag = tag;
    this._value = value;
  }
}
