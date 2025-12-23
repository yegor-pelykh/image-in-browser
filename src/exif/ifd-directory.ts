/** @format */

import { Rational } from '../common/rational.js';
import { ExifImageTags, ExifTagNameToID } from './exif-tag.js';
import { IfdValueType } from './ifd-value-type.js';
import { IfdContainer } from './ifd-container.js';
import { IfdValue } from './ifd-value/ifd-value.js';
import { IfdAsciiValue } from './ifd-value/ifd-ascii-value.js';
import { IfdShortValue } from './ifd-value/ifd-short-value.js';
import { IfdRationalValue } from './ifd-value/ifd-rational-value.js';
import { IfdByteValue } from './ifd-value/ifd-byte-value.js';
import { IfdLongValue } from './ifd-value/ifd-long-value.js';
import { IfdSByteValue } from './ifd-value/ifd-sbyte-value.js';
import { IfdUndefinedValue } from './ifd-value/ifd-undefined-value.js';
import { IfdSShortValue } from './ifd-value/ifd-sshort-value.js';
import { IfdSLongValue } from './ifd-value/ifd-slong-value.js';
import { IfdSRationalValue } from './ifd-value/ifd-srational-value.js';
import { IfdSingleValue } from './ifd-value/ifd-single-value.js';
import { IfdDoubleValue } from './ifd-value/ifd-double-value.js';
import { TypedArray } from '../common/typings.js';
import { StringUtils } from '../common/string-utils.js';
import { ArrayUtils } from '../common/array-utils.js';
import { IfdIfdValue } from './ifd-value/ifd-ifd-value.js';

/**
 * Represents a directory of IFD (Image File Directory) entries.
 */
export class IfdDirectory {
  /**
   * Map to store IFD values.
   */
  private readonly _data: Map<number, IfdValue>;

  /**
   * Container for sub-IFD directories.
   */
  private readonly _sub = new IfdContainer();

  /**
   * Gets the sub-IFD container.
   */
  public get sub(): IfdContainer {
    return this._sub;
  }

  /**
   * Gets an iterator for the keys in the IFD directory.
   */
  public get keys(): IterableIterator<number> {
    return this._data.keys();
  }

  /**
   * Gets an iterator for the values in the IFD directory.
   */
  public get values(): IterableIterator<IfdValue> {
    return this._data.values();
  }

  /**
   * Gets an iterator for the entries in the IFD directory.
   */
  public get entries(): IterableIterator<[number, IfdValue]> {
    return this._data.entries();
  }

  /**
   * Gets the number of entries in the IFD directory.
   */
  public get size(): number {
    return this._data.size;
  }

  /**
   * Checks if the IFD directory is empty.
   */
  public get isEmpty(): boolean {
    return this._data.size === 0 && this._sub.isEmpty;
  }

  /**
   * Checks if the IFD directory has a user comment.
   */
  public get hasUserComment(): boolean {
    return this._data.has(0x9286);
  }

  /**
   * Gets the user comment from the IFD directory.
   */
  public get userComment(): string | undefined {
    const data = this._data.get(0x9286)?.toData();
    return data !== undefined
      ? StringUtils.utf8Decoder.decode(data)
      : undefined;
  }

  /**
   * Sets the user comment in the IFD directory.
   */
  public set userComment(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x9286);
    } else {
      const codeUnits = StringUtils.getCodePoints(v);
      this._data.set(0x9286, new IfdUndefinedValue(codeUnits));
    }
  }

  /**
   * Checks if the IFD directory has an image description.
   */
  public get hasImageDescription(): boolean {
    return this._data.has(0x010e);
  }

  /**
   * Gets the image description from the IFD directory.
   */
  public get imageDescription(): string | undefined {
    return this._data.get(0x010e)?.toString();
  }

  /**
   * Sets the image description in the IFD directory.
   */
  public set imageDescription(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x010e);
    } else {
      this._data.set(0x010e, new IfdAsciiValue(v));
    }
  }

  /**
   * Checks if the IFD directory has a make value.
   */
  public get hasMake(): boolean {
    return this._data.has(0x010f);
  }

  /**
   * Gets the make value from the IFD directory.
   */
  public get make(): string | undefined {
    return this._data.get(0x010f)?.toString();
  }

  /**
   * Sets the make value in the IFD directory.
   */
  public set make(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x010f);
    } else {
      this._data.set(0x010f, new IfdAsciiValue(v));
    }
  }

  /**
   * Checks if the IFD directory has a model value.
   */
  public get hasModel(): boolean {
    return this._data.has(0x0110);
  }

  /**
   * Gets the model value from the IFD directory.
   */
  public get model(): string | undefined {
    return this._data.get(0x0110)?.toString();
  }

  /**
   * Sets the model value in the IFD directory.
   */
  public set model(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x0110);
    } else {
      this._data.set(0x0110, new IfdAsciiValue(v));
    }
  }

  /**
   * Checks if the IFD directory has an orientation value.
   */
  public get hasOrientation(): boolean {
    return this._data.has(0x0112);
  }

  /**
   * Gets the orientation value from the IFD directory.
   */
  public get orientation(): number | undefined {
    return this._data.get(0x0112)?.toInt();
  }

  /**
   * Sets the orientation value in the IFD directory.
   */
  public set orientation(v: number | undefined) {
    if (v === undefined) {
      this._data.delete(0x0112);
    } else {
      this._data.set(0x0112, new IfdShortValue(v));
    }
  }

  /**
   * Checks if the IFD directory has a resolutionX value.
   */
  public get hasResolutionX(): boolean {
    return this._data.has(0x011a);
  }

  /**
   * Gets the resolutionX value from the IFD directory.
   */
  public get resolutionX(): Rational | undefined {
    return this._data.get(0x011a)?.toRational();
  }

  /**
   * Sets the resolutionX value in the IFD directory.
   */
  public set resolutionX(v: Rational | undefined) {
    if (!this.setRational(0x011a, v)) {
      this._data.delete(0x011a);
    }
  }

  /**
   * Checks if the IFD directory has a resolutionY value.
   */
  public get hasResolutionY(): boolean {
    return this._data.has(0x011b);
  }

  /**
   * Gets the resolutionY value from the IFD directory.
   */
  public get resolutionY(): Rational | undefined {
    return this._data.get(0x011b)?.toRational();
  }

  /**
   * Sets the resolutionY value in the IFD directory.
   */
  public set resolutionY(v: Rational | undefined) {
    if (!this.setRational(0x011b, v)) {
      this._data.delete(0x011b);
    }
  }

  /**
   * Checks if the IFD directory has a resolution unit value.
   */
  public get hasResolutionUnit(): boolean {
    return this._data.has(0x0128);
  }

  /**
   * Gets the resolution unit value from the IFD directory.
   */
  public get resolutionUnit(): number | undefined {
    return this._data.get(0x0128)?.toInt();
  }

  /**
   * Sets the resolution unit value in the IFD directory.
   */
  public set resolutionUnit(v: number | undefined) {
    if (v === undefined) {
      this._data.delete(0x0128);
    } else {
      this._data.set(0x0128, new IfdShortValue(Math.trunc(v)));
    }
  }

  /**
   * Checks if the IFD directory has an image width value.
   */
  public get hasImageWidth(): boolean {
    return this._data.has(0x0100);
  }

  /**
   * Gets the image width value from the IFD directory.
   */
  public get imageWidth(): number | undefined {
    return this._data.get(0x0100)?.toInt();
  }

  /**
   * Sets the image width value in the IFD directory.
   */
  public set imageWidth(v: number | undefined) {
    if (v === undefined) {
      this._data.delete(0x0100);
    } else {
      this._data.set(0x0100, new IfdShortValue(Math.trunc(v)));
    }
  }

  /**
   * Checks if the IFD directory has an image height value.
   */
  public get hasImageHeight(): boolean {
    return this._data.has(0x0101);
  }

  /**
   * Gets the image height value from the IFD directory.
   */
  public get imageHeight(): number | undefined {
    return this._data.get(0x0101)?.toInt();
  }

  /**
   * Sets the image height value in the IFD directory.
   */
  public set imageHeight(v: number | undefined) {
    if (v === undefined) {
      this._data.delete(0x0101);
    } else {
      this._data.set(0x0101, new IfdShortValue(Math.trunc(v)));
    }
  }

  /**
   * Checks if the IFD directory has a software value.
   */
  public get hasSoftware(): boolean {
    return this._data.has(0x0131);
  }

  /**
   * Gets the software value from the IFD directory.
   */
  public get software(): string | undefined {
    return this._data.get(0x0131)?.toString();
  }

  /**
   * Sets the software value in the IFD directory.
   */
  public set software(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x0131);
    } else {
      this._data.set(0x0131, new IfdAsciiValue(v));
    }
  }

  /**
   * Checks if the IFD directory has a copyright value.
   */
  public get hasCopyright(): boolean {
    return this._data.has(0x8298);
  }

  /**
   * Gets the copyright value from the IFD directory.
   */
  public get copyright(): string | undefined {
    return this._data.get(0x8298)?.toString();
  }

  /**
   * Sets the copyright value in the IFD directory.
   */
  public set copyright(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x8298);
    } else {
      this._data.set(0x8298, new IfdAsciiValue(v));
    }
  }

  /**
   * Checks if the IFD directory has a GPS Latitude Reference.
   */
  public get hasGPSLatitudeRef(): boolean {
    return this._data.has(0x0001);
  }

  /**
   * Gets the GPS Latitude Reference value from the IFD directory.
   */
  public get gpsLatitudeRef(): string | undefined {
    return this._data.get(0x0001)?.toString();
  }

  /**
   * Sets the GPS Latitude Reference value in the IFD directory.
   */
  public set gpsLatitudeRef(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x0001);
    } else {
      this._data.set(0x0001, new IfdAsciiValue(v));
    }
  }

  /**
   * Checks if the IFD directory has a GPS Latitude.
   */
  public get hasGPSLatitude(): boolean {
    return this._data.has(0x0002);
  }

  /**
   * Gets the GPS Latitude value from the IFD directory.
   */
  public get gpsLatitude(): number | undefined {
    return this._data.get(0x0002)?.toDouble();
  }

  /**
   * Sets the GPS Latitude value in the IFD directory.
   */
  public set gpsLatitude(v: number | undefined) {
    if (v === undefined) {
      this._data.delete(0x0002);
    } else {
      this._data.set(0x0002, new IfdDoubleValue(v));
    }
  }

  /**
   * Checks if the IFD directory has a GPS Longitude Reference.
   */
  public get hasGPSLongitudeRef(): boolean {
    return this._data.has(0x0003);
  }

  /**
   * Gets the GPS Longitude Reference value from the IFD directory.
   */
  public get gpsLongitudeRef(): string | undefined {
    return this._data.get(0x0003)?.toString();
  }

  /**
   * Sets the GPS Longitude Reference value in the IFD directory.
   */
  public set gpsLongitudeRef(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x0003);
    } else {
      this._data.set(0x0003, new IfdAsciiValue(v));
    }
  }

  /**
   * Checks if the IFD directory has a GPS Longitude.
   */
  public get hasGPSLongitude(): boolean {
    return this._data.has(0x0004);
  }

  /**
   * Gets the GPS Longitude value from the IFD directory.
   */
  public get gpsLongitude(): number | undefined {
    return this._data.get(0x0004)?.toDouble();
  }

  /**
   * Sets the GPS Longitude value in the IFD directory.
   */
  public set gpsLongitude(v: number | undefined) {
    if (v === undefined) {
      this._data.delete(0x0004);
    } else {
      this._data.set(0x0004, new IfdDoubleValue(v));
    }
  }

  /**
   * Checks if the IFD directory has a GPS Date.
   */
  public get hasGPSDate(): boolean {
    return this._data.has(0x001d);
  }

  /**
   * Gets the GPS Date value from the IFD directory.
   */
  public get gpsDate(): string | undefined {
    return this._data.get(0x001d)?.toString();
  }

  /**
   * Sets the GPS Date value in the IFD directory.
   */
  public set gpsDate(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x001d);
    } else {
      this._data.set(0x001d, new IfdAsciiValue(v));
    }
  }

  /**
   * Gets the size in bytes of the data written by this directory.
   * Can be used to calculate end-of-block offsets.
   */
  public get dataSize(): number {
    const numEntries = this.size;
    let dataOffset = 2 + 12 * numEntries + 4;
    for (const value of this.values) {
      const dataSize = value.dataSize;
      if (dataSize > 4) {
        dataOffset += dataSize;
      }
    }
    // storage for sub-ifd blocks
    for (const [_subName, subDir] of this.sub.entries) {
      let subSize = 2 + 12 * subDir.size;
      for (const value of subDir.values) {
        const dataSize = value.dataSize;
        if (dataSize > 4) {
          subSize += dataSize;
        }
      }
      dataOffset += subSize;
    }
    return dataOffset;
  }

  /**
   * Constructs an IfdDirectory instance.
   * @param {Map<number, IfdValue>} [data] - Optional map of IFD values.
   */
  constructor(data?: Map<number, IfdValue>) {
    this._data = data ?? new Map<number, IfdValue>();
  }

  /**
   * Sets a rational value in the IFD directory.
   * @param {number} tag - The tag number.
   * @param {Rational | number[] | TypedArray | unknown} value - The rational value.
   * @returns {boolean} True if the value was set, false otherwise.
   */
  private setRational(
    tag: number,
    value: Rational | number[] | TypedArray | unknown
  ): boolean {
    if (value instanceof Rational) {
      this._data.set(tag, IfdRationalValue.from(value));
      return true;
    } else if (
      ArrayUtils.isNumArrayOrTypedArray(value) &&
      (value as []).length >= 2
    ) {
      const r = new Rational((value as number[])[0], (value as number[])[1]);
      this._data.set(tag, IfdRationalValue.from(r));
      return true;
    }
    return false;
  }

  /**
   * Creates an IfdDirectory instance from another instance.
   * @param {IfdDirectory} other - The other IfdDirectory instance.
   * @returns {IfdDirectory} A new IfdDirectory instance.
   */
  public static from(other: IfdDirectory): IfdDirectory {
    return new IfdDirectory(new Map<number, IfdValue>(other._data));
  }

  /**
   * Checks if a value is an array of rational numbers.
   * @param {unknown} value - The value to check.
   * @returns {boolean} True if the value is an array of rational numbers, false otherwise.
   */
  public static isArrayOfRationalNumbers(value: unknown): boolean {
    return (
      Array.isArray(value) &&
      value.every(
        (v) => ArrayUtils.isNumArrayOrTypedArray(v) && (v as []).length >= 2
      )
    );
  }

  /**
   * Checks if the IFD directory has a specific tag.
   * @param {number} tag - The tag number.
   * @returns {boolean} True if the tag exists, false otherwise.
   */
  public has(tag: number): boolean {
    return this._data.has(tag);
  }

  /**
   * Gets the value associated with a specific tag.
   * @param {number | string} tag - The tag number or name.
   * @returns {IfdValue | undefined} The IFD value or undefined if not found.
   */
  public get(tag: number | string): IfdValue | undefined {
    let _tag: string | number | undefined = tag;
    if (typeof _tag === 'string') {
      _tag = ExifTagNameToID.get(_tag);
    }
    if (typeof _tag === 'number') {
      return this._data.get(_tag);
    }
    return undefined;
  }

  /**
   * Sets a value in the IFD directory.
   * @param {number | string} tag - The tag number or name.
   * @param {Rational[] | number[] | TypedArray | Rational | IfdValue | number | undefined} value - The value to set.
   */
  public set(
    tag: number | string,
    value:
      | Rational[]
      | number[]
      | TypedArray
      | Rational
      | IfdValue
      | number
      | undefined
  ): void {
    let _tag: string | number | undefined = tag;
    if (typeof _tag === 'string') {
      _tag = ExifTagNameToID.get(_tag);
    }
    if (typeof _tag !== 'number') {
      return;
    }

    if (value === undefined) {
      this._data.delete(_tag);
    } else {
      if (value instanceof IfdValue) {
        this._data.set(_tag, value);
      } else {
        const tagInfo = ExifImageTags.get(_tag);
        if (tagInfo !== undefined) {
          const tagType = tagInfo.type;
          switch (tagType) {
            case IfdValueType.byte:
              if (ArrayUtils.isNumArrayOrTypedArray(value)) {
                this._data.set(
                  _tag,
                  new IfdByteValue(new Uint8Array(value as number[]))
                );
              } else if (typeof value === 'number') {
                this._data.set(_tag, new IfdByteValue(value));
              }
              break;
            case IfdValueType.ascii:
              if (typeof value === 'string') {
                this._data.set(_tag, new IfdAsciiValue(value));
              }
              break;
            case IfdValueType.short:
              if (ArrayUtils.isNumArrayOrTypedArray(value)) {
                this._data.set(
                  _tag,
                  new IfdShortValue(new Uint16Array(value as number[]))
                );
              } else if (typeof value === 'number') {
                this._data.set(_tag, new IfdShortValue(value));
              }
              break;
            case IfdValueType.long:
              if (ArrayUtils.isNumArrayOrTypedArray(value)) {
                this._data.set(
                  _tag,
                  new IfdLongValue(new Uint32Array(value as number[]))
                );
              } else if (typeof value === 'number') {
                this._data.set(_tag, new IfdLongValue(value));
              }
              break;
            case IfdValueType.rational:
              if (ArrayUtils.isArrayOfRational(value)) {
                this._data.set(_tag, new IfdRationalValue(value as Rational[]));
              } else if (
                ArrayUtils.isNumArrayOrTypedArray(value) &&
                (value as []).length >= 2
              ) {
                const r = new Rational(
                  (value as number[])[0],
                  (value as number[])[1]
                );
                this._data.set(_tag, new IfdRationalValue(r));
              } else if (value instanceof Rational) {
                this._data.set(_tag, new IfdRationalValue(value));
              }
              break;
            case IfdValueType.sByte:
              if (ArrayUtils.isNumArrayOrTypedArray(value)) {
                this._data.set(
                  _tag,
                  new IfdSByteValue(new Int8Array(value as number[]))
                );
              } else if (typeof value === 'number') {
                this._data.set(_tag, new IfdSByteValue(value));
              }
              break;
            case IfdValueType.undefined:
              if (ArrayUtils.isNumArrayOrTypedArray(value)) {
                this._data.set(
                  _tag,
                  new IfdUndefinedValue(new Uint8Array(value as number[]))
                );
              }
              break;
            case IfdValueType.sShort:
              if (ArrayUtils.isNumArrayOrTypedArray(value)) {
                this._data.set(
                  _tag,
                  new IfdSShortValue(new Int16Array(value as number[]))
                );
              } else if (typeof value === 'number') {
                this._data.set(_tag, new IfdSShortValue(value));
              }
              break;
            case IfdValueType.sLong:
              if (ArrayUtils.isNumArrayOrTypedArray(value)) {
                this._data.set(
                  _tag,
                  new IfdSLongValue(new Int32Array(value as number[]))
                );
              } else if (typeof value === 'number') {
                this._data.set(_tag, new IfdSLongValue(value));
              }
              break;
            case IfdValueType.sRational:
              if (ArrayUtils.isArrayOfRational(value)) {
                this._data.set(
                  _tag,
                  new IfdSRationalValue(value as Rational[])
                );
              } else if (
                ArrayUtils.isNumArrayOrTypedArray(value) &&
                (value as []).length >= 2
              ) {
                const r = new Rational(
                  (value as number[])[0],
                  (value as number[])[1]
                );
                this._data.set(_tag, new IfdSRationalValue(r));
              } else if (value instanceof Rational) {
                this._data.set(_tag, new IfdSRationalValue(value));
              }
              break;
            case IfdValueType.single:
              if (ArrayUtils.isNumArrayOrTypedArray(value)) {
                this._data.set(
                  _tag,
                  new IfdSingleValue(new Float32Array(value as number[]))
                );
              } else if (typeof value === 'number') {
                this._data.set(_tag, new IfdSingleValue(value));
              }
              break;
            case IfdValueType.double:
              if (ArrayUtils.isNumArrayOrTypedArray(value)) {
                this._data.set(
                  _tag,
                  new IfdDoubleValue(new Float64Array(value as number[]))
                );
              } else if (typeof value === 'number') {
                this._data.set(_tag, new IfdDoubleValue(value));
              }
              break;
            case IfdValueType.ifd:
              if (typeof value === 'number') {
                this._data.set(_tag, new IfdIfdValue(value));
              }
              break;
            case IfdValueType.none:
              break;
          }
        }
      }
    }
  }

  public setGpsLocation(latitude: number, longitude: number) {
    this.gpsLatitude = Math.abs(latitude);
    this.gpsLongitude = Math.abs(longitude);
    this.gpsLatitudeRef = latitude < 0 ? 'S' : 'N';
    this.gpsLongitudeRef = longitude < 0 ? 'W' : 'E';
  }

  /**
   * Copies data from another IfdDirectory instance.
   * @param {IfdDirectory} other - The IfdDirectory instance to copy from.
   */
  public copyFrom(other: IfdDirectory): void {
    other._data.forEach((value, tag) => this._data.set(tag, value.clone()));
    for (const [tag, value] of other._sub.entries) {
      this._sub.set(tag, value.clone());
    }
  }

  /**
   * Creates a clone of the current IfdDirectory instance.
   * @returns {IfdDirectory} A new IfdDirectory instance that is a clone of the current instance.
   */
  public clone(): IfdDirectory {
    return IfdDirectory.from(this);
  }
}
