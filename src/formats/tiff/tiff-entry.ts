/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { ExifImageTags } from '../../exif/exif-tag.js';
import { IfdValueType, IfdValueTypeSize } from '../../exif/ifd-value-type.js';
import { IfdAsciiValue } from '../../exif/ifd-value/ifd-ascii-value.js';
import { IfdByteValue } from '../../exif/ifd-value/ifd-byte-value.js';
import { IfdDoubleValue } from '../../exif/ifd-value/ifd-double-value.js';
import { IfdLongValue } from '../../exif/ifd-value/ifd-long-value.js';
import { IfdRationalValue } from '../../exif/ifd-value/ifd-rational-value.js';
import { IfdSByteValue } from '../../exif/ifd-value/ifd-sbyte-value.js';
import { IfdShortValue } from '../../exif/ifd-value/ifd-short-value.js';
import { IfdSingleValue } from '../../exif/ifd-value/ifd-single-value.js';
import { IfdSLongValue } from '../../exif/ifd-value/ifd-slong-value.js';
import { IfdSRationalValue } from '../../exif/ifd-value/ifd-srational-value.js';
import { IfdSShortValue } from '../../exif/ifd-value/ifd-sshort-value.js';
import { IfdValue } from '../../exif/ifd-value/ifd-value.js';

/**
 * Interface for initializing TiffEntry options.
 */
export interface TiffEntryInitOptions {
  /** The tag number. */
  tag: number;
  /** The type number. */
  type: number;
  /** The count of values. */
  count: number;
  /** The input buffer. */
  p: InputBuffer<Uint8Array>;
  /** The value offset. */
  valueOffset: number;
}

/**
 * Class representing a TIFF entry.
 */
export class TiffEntry {
  /** The tag number. */
  private _tag: number;
  /** The type of the value. */
  private _type: IfdValueType;
  /** The count of values. */
  private _count: number;
  /** The value offset. */
  private _valueOffset: number;
  /** The value of the entry. */
  private _value: IfdValue | undefined;
  /** The input buffer. */
  private _p: InputBuffer<Uint8Array>;

  /**
   * Gets the tag number.
   */
  public get tag(): number {
    return this._tag;
  }

  /**
   * Gets the type of the value.
   */
  public get type(): IfdValueType {
    return this._type;
  }

  /**
   * Gets the count of values.
   */
  public get count(): number {
    return this._count;
  }

  /**
   * Gets the value offset.
   */
  public get valueOffset(): number {
    return this._valueOffset;
  }

  /**
   * Gets the value of the entry.
   */
  public get value(): IfdValue | undefined {
    return this._value;
  }

  /**
   * Gets the input buffer.
   */
  public get p(): InputBuffer<Uint8Array> {
    return this._p;
  }

  /**
   * Checks if the entry is valid.
   */
  public get isValid(): boolean {
    return this._type !== IfdValueType.none;
  }

  /**
   * Gets the size of the type.
   */
  public get typeSize(): number {
    return this.isValid ? IfdValueTypeSize[this._type] : 0;
  }

  /**
   * Checks if the type is a string.
   */
  public get isString(): boolean {
    return this._type === IfdValueType.ascii;
  }

  /**
   * Constructs a new TiffEntry.
   * @param {TiffEntryInitOptions} opt - The initialization options.
   * @param {number} opt.tag - The tag identifier for the TIFF entry.
   * @param {number} opt.type - The data type of the TIFF entry.
   * @param {number} opt.count - The number of values in the TIFF entry.
   * @param {Pointer} opt.p - The pointer to the data for the TIFF entry.
   * @param {number} opt.valueOffset - The offset to the value of the TIFF entry.
   */
  constructor(opt: TiffEntryInitOptions) {
    this._tag = opt.tag;
    this._type = opt.type;
    this._count = opt.count;
    this._p = opt.p;
    this._valueOffset = opt.valueOffset;
  }

  /**
   * Reads the value of the entry.
   * @returns {IfdValue | undefined} The value of the entry or undefined.
   */
  public read(): IfdValue | undefined {
    if (this._value !== undefined) {
      return this._value;
    }

    this._p.offset = this._valueOffset;
    const data = this.p.readRange(this._count * this.typeSize);
    switch (this._type) {
      case IfdValueType.byte:
        return (this._value = IfdByteValue.data(data, this._count));
      case IfdValueType.ascii:
        return (this._value = IfdAsciiValue.data(data, this._count));
      case IfdValueType.undefined:
        return (this._value = IfdByteValue.data(data, this._count));
      case IfdValueType.short:
        return (this._value = IfdShortValue.data(data, this._count));
      case IfdValueType.long:
        return (this._value = IfdLongValue.data(data, this._count));
      case IfdValueType.rational:
        return (this._value = IfdRationalValue.data(data, this._count));
      case IfdValueType.single:
        return (this._value = IfdSingleValue.data(data, this._count));
      case IfdValueType.double:
        return (this._value = IfdDoubleValue.data(data, this._count));
      case IfdValueType.sByte:
        return (this._value = IfdSByteValue.data(data, this._count));
      case IfdValueType.sShort:
        return (this._value = IfdSShortValue.data(data, this._count));
      case IfdValueType.sLong:
        return (this._value = IfdSLongValue.data(data, this._count));
      case IfdValueType.sRational:
        return (this._value = IfdSRationalValue.data(data, this._count));
      default:
      case IfdValueType.none:
        return undefined;
    }
  }

  /**
   * Converts the entry to a string representation.
   * @returns {string} The string representation of the entry.
   */
  public toString(): string {
    const exifTag = ExifImageTags.get(this._tag);
    if (exifTag !== undefined) {
      return `${exifTag.name}: ${this._type} ${this._count}`;
    }
    return `${this.constructor.name} (<${this._tag}>: ${this._type} ${this._count})`;
  }
}
