/** @format */

import { InputBuffer } from '../../common/input-buffer.js';

/**
 * Represents a PSD mask with properties for its boundaries and attributes.
 */
export class PsdMask {
  /**
   * The top boundary of the mask.
   */
  private _top: number = 0;

  /**
   * Gets the top boundary of the mask.
   * @returns {number} The top boundary.
   */
  public get top(): number {
    return this._top;
  }

  /**
   * The left boundary of the mask.
   */
  private _left: number = 0;

  /**
   * Gets the left boundary of the mask.
   * @returns {number} The left boundary.
   */
  public get left(): number {
    return this._left;
  }

  /**
   * The right boundary of the mask.
   */
  private _right: number = 0;

  /**
   * Gets the right boundary of the mask.
   * @returns {number} The right boundary.
   */
  public get right(): number {
    return this._right;
  }

  /**
   * The bottom boundary of the mask.
   */
  private _bottom: number = 0;

  /**
   * Gets the bottom boundary of the mask.
   * @returns {number} The bottom boundary.
   */
  public get bottom(): number {
    return this._bottom;
  }

  /**
   * The default color of the mask.
   */
  private _defaultColor: number = 0;

  /**
   * Gets the default color of the mask.
   * @returns {number} The default color.
   */
  public get defaultColor(): number {
    return this._defaultColor;
  }

  /**
   * The flags representing various attributes of the mask.
   */
  private _flags: number = 0;

  /**
   * Gets the flags representing various attributes of the mask.
   * @returns {number} The flags.
   */
  public get flags(): number {
    return this._flags;
  }

  /**
   * Additional parameters for the mask.
   */
  private _params: number = 0;

  /**
   * Gets the additional parameters for the mask.
   * @returns {number} The parameters.
   */
  public get params(): number {
    return this._params;
  }

  /**
   * Checks if the mask is relative.
   * @returns {boolean} True if the mask is relative, otherwise false.
   */
  public get relative(): boolean {
    return (this._flags & 1) !== 0;
  }

  /**
   * Checks if the mask is disabled.
   * @returns {boolean} True if the mask is disabled, otherwise false.
   */
  public get disabled(): boolean {
    return (this._flags & 2) !== 0;
  }

  /**
   * Checks if the mask is inverted.
   * @returns {boolean} True if the mask is inverted, otherwise false.
   */
  public get invert(): boolean {
    return (this._flags & 4) !== 0;
  }

  /**
   * Initializes a new instance of the PsdMask class.
   * @param {InputBuffer<Uint8Array>} input - The input buffer to read mask data from.
   * - length: The length of the input buffer.
   * - readUint32: Reads a 32-bit unsigned integer from the buffer.
   * - read: Reads a byte from the buffer.
   * - skip: Skips a specified number of bytes in the buffer.
   */
  constructor(input: InputBuffer<Uint8Array>) {
    const len = input.length;

    this._top = input.readUint32();
    this._left = input.readUint32();
    this._right = input.readUint32();
    this._bottom = input.readUint32();
    this._defaultColor = input.read();
    this._flags = input.read();

    if (len === 20) {
      input.skip(2);
    } else {
      this._flags = input.read();
      this._defaultColor = input.read();
      this._top = input.readUint32();
      this._left = input.readUint32();
      this._right = input.readUint32();
      this._bottom = input.readUint32();
    }
  }
}
