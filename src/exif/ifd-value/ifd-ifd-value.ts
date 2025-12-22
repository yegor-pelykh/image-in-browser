/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { IfdValue } from './ifd-value.js';
import { IfdValueType } from '../ifd-value-type.js';
import { LibError } from '../../error/lib-error.js';

/**
 * Class representing an IFD (Image File Directory) value that stores an offset to another IFD.
 * This is typically used for tags that point to sub-IFDs or linked directories within EXIF/TIFF metadata.
 */
export class IfdIfdValue extends IfdValue {
  /**
   * The offset value pointing to another IFD.
   */
  private _offset: number;

  /**
   * Gets the type of the IFD value.
   * @returns {IfdValueType} The type of the IFD value.
   */
  public get type(): IfdValueType {
    return IfdValueType.ifd;
  }

  /**
   * Gets the length of the IFD value.
   * Always returns 1, as IFD offsets are single 32-bit values.
   * @returns {number} The length of the IFD value.
   */
  public get length(): number {
    return 1;
  }

  /**
   * Constructs an IfdIfdValue instance.
   * @param {number} value - The offset value pointing to another IFD.
   */
  constructor(value: number) {
    super();
    this._offset = value;
  }

  /**
   * Creates an IfdIfdValue from input buffer data.
   * Reads a 32-bit unsigned integer as the offset.
   * @param {InputBuffer<Uint8Array>} data - The input buffer containing the offset data.
   * @returns {IfdIfdValue} The created IfdIfdValue instance.
   */
  public static data(data: InputBuffer<Uint8Array>): IfdIfdValue {
    const value = data.readUint32();
    return new IfdIfdValue(value);
  }

  /**
   * Gets the offset value as an integer.
   * Only index 0 is valid, as there is always a single offset.
   * @param {number} [index=0] - The index of the value to retrieve.
   * @returns {number} The offset value.
   * @throws {LibError} If index is not 0.
   */
  public toInt(index = 0): number {
    if (index !== 0) {
      throw new LibError(
        'Ifd tags are required to have a single entry (the offset).'
      );
    }
    return this._offset;
  }

  /**
   * Converts the offset value to a Uint8Array (big-endian order).
   * @returns {Uint8Array} The offset value as a Uint8Array.
   */
  public toData(): Uint8Array {
    return Uint8Array.from([
      this._offset >> 24,
      this._offset >> 16,
      this._offset >> 8,
      this._offset,
    ]);
  }

  /**
   * Writes the offset value to an output buffer as a 32-bit unsigned integer.
   * @param {OutputBuffer} out - The output buffer to write to.
   */
  public write(out: OutputBuffer): void {
    out.writeUint32(this._offset);
  }

  /**
   * Sets the offset value.
   * Only index 0 is valid, as there is always a single offset.
   * @param {number} v - The new offset value.
   * @param {number} [index=0] - The index to set (must be 0).
   * @throws {LibError} If index is not 0.
   */
  public setInt(v: number, index = 0): void {
    if (index !== 0) {
      throw new LibError(
        'Ifd tags are required to have a single entry (the offset).'
      );
    }
    this._offset = v;
  }

  /**
   * Checks if this value is equal to another IFD value.
   * @param {IfdValue} other - The other IFD value to compare with.
   * @returns {boolean} True if the values are equal, false otherwise.
   */
  public equals(other: IfdValue): boolean {
    return (
      other instanceof IfdIfdValue &&
      this.length === other.length &&
      this._offset === other._offset
    );
  }

  /**
   * Creates a clone of this IFD value.
   * @returns {IfdValue} The cloned IFD value.
   */
  public clone(): IfdValue {
    return new IfdIfdValue(this._offset);
  }

  /**
   * Converts the IFD value to a string representation.
   * @returns {string} The string representation of the IFD value.
   */
  public toString(): string {
    return `${this.constructor.name} (${this._offset})`;
  }
}
