/** @format */

import { Rational } from '../common/rational';
import { ExifImageTags, ExifTagNameToID } from './exif-tag';
import { IfdValueType } from './ifd-value-type';
import { IfdContainer } from './ifd-container';
import { IfdValue } from './ifd-value/ifd-value';
import { IfdAsciiValue } from './ifd-value/ifd-ascii-value';
import { IfdShortValue } from './ifd-value/ifd-short-value';
import { IfdRationalValue } from './ifd-value/ifd-rational-value';
import { IfdByteValue } from './ifd-value/ifd-byte-value';
import { IfdLongValue } from './ifd-value/ifd-long-value';
import { IfdSByteValue } from './ifd-value/ifd-sbyte-value';
import { IfdUndefinedValue } from './ifd-value/ifd-undefined-value';
import { IfdSShortValue } from './ifd-value/ifd-sshort-value';
import { IfdSLongValue } from './ifd-value/ifd-slong-value';
import { IfdSRationalValue } from './ifd-value/ifd-srational-value';
import { IfdSingleValue } from './ifd-value/ifd-single-value';
import { IfdDoubleValue } from './ifd-value/ifd-double-value';
import { TypedArray } from '../common/typings';
import { StringUtils } from '../common/string-utils';
import { ArrayUtils } from '../common/array-utils';

export class IfdDirectory {
  private readonly _data: Map<number, IfdValue>;

  private readonly _sub = new IfdContainer();
  public get sub(): IfdContainer {
    return this._sub;
  }

  public get keys(): IterableIterator<number> {
    return this._data.keys();
  }

  public get values(): IterableIterator<IfdValue> {
    return this._data.values();
  }

  public get entries(): IterableIterator<[number, IfdValue]> {
    return this._data.entries();
  }

  public get size(): number {
    return this._data.size;
  }

  public get isEmpty(): boolean {
    return this._data.size === 0 && this._sub.isEmpty;
  }

  public get hasUserComment(): boolean {
    return this._data.has(0x9286);
  }

  public get userComment(): string | undefined {
    const data = this._data.get(0x9286)?.toData();
    return data !== undefined
      ? StringUtils.utf8Decoder.decode(data)
      : undefined;
  }

  public set userComment(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x9286);
    } else {
      const codeUnits = StringUtils.getCodePoints(v);
      this._data.set(0x9286, new IfdUndefinedValue(codeUnits));
    }
  }

  public get hasImageDescription(): boolean {
    return this._data.has(0x010e);
  }

  public get imageDescription(): string | undefined {
    return this._data.get(0x010e)?.toString();
  }

  public set imageDescription(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x010e);
    } else {
      this._data.set(0x010e, new IfdAsciiValue(v));
    }
  }

  public get hasMake(): boolean {
    return this._data.has(0x010f);
  }

  public get make(): string | undefined {
    return this._data.get(0x010f)?.toString();
  }

  public set make(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x010f);
    } else {
      this._data.set(0x010f, new IfdAsciiValue(v));
    }
  }

  public get hasModel(): boolean {
    return this._data.has(0x0110);
  }

  public get model(): string | undefined {
    return this._data.get(0x0110)?.toString();
  }

  public set model(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x0110);
    } else {
      this._data.set(0x0110, new IfdAsciiValue(v));
    }
  }

  public get hasOrientation(): boolean {
    return this._data.has(0x0112);
  }

  public get orientation(): number | undefined {
    return this._data.get(0x0112)?.toInt();
  }

  public set orientation(v: number | undefined) {
    if (v === undefined) {
      this._data.delete(0x0112);
    } else {
      this._data.set(0x0112, new IfdShortValue(v));
    }
  }

  public get hasResolutionX(): boolean {
    return this._data.has(0x011a);
  }

  public get resolutionX(): Rational | undefined {
    return this._data.get(0x011a)?.toRational();
  }

  public set resolutionX(v: Rational | undefined) {
    if (!this.setRational(0x011a, v)) {
      this._data.delete(0x011a);
    }
  }

  public get hasResolutionY(): boolean {
    return this._data.has(0x011b);
  }

  public get resolutionY(): Rational | undefined {
    return this._data.get(0x011b)?.toRational();
  }

  public set resolutionY(v: Rational | undefined) {
    if (!this.setRational(0x011b, v)) {
      this._data.delete(0x011b);
    }
  }

  public get hasResolutionUnit(): boolean {
    return this._data.has(0x0128);
  }

  public get resolutionUnit(): number | undefined {
    return this._data.get(0x0128)?.toInt();
  }

  public set resolutionUnit(v: number | undefined) {
    if (v === undefined) {
      this._data.delete(0x0128);
    } else {
      this._data.set(0x0128, new IfdShortValue(Math.trunc(v)));
    }
  }

  public get hasImageWidth(): boolean {
    return this._data.has(0x0100);
  }

  public get imageWidth(): number | undefined {
    return this._data.get(0x0100)?.toInt();
  }

  public set imageWidth(v: number | undefined) {
    if (v === undefined) {
      this._data.delete(0x0100);
    } else {
      this._data.set(0x0100, new IfdShortValue(Math.trunc(v)));
    }
  }

  public get hasImageHeight(): boolean {
    return this._data.has(0x0101);
  }

  public get imageHeight(): number | undefined {
    return this._data.get(0x0101)?.toInt();
  }

  public set imageHeight(v: number | undefined) {
    if (v === undefined) {
      this._data.delete(0x0101);
    } else {
      this._data.set(0x0101, new IfdShortValue(Math.trunc(v)));
    }
  }

  public get hasSoftware(): boolean {
    return this._data.has(0x0131);
  }

  public get software(): string | undefined {
    return this._data.get(0x0131)?.toString();
  }

  public set software(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x0131);
    } else {
      this._data.set(0x0131, new IfdAsciiValue(v));
    }
  }

  public get hasCopyright(): boolean {
    return this._data.has(0x8298);
  }

  public get copyright(): string | undefined {
    return this._data.get(0x8298)?.toString();
  }

  public set copyright(v: string | undefined) {
    if (v === undefined) {
      this._data.delete(0x8298);
    } else {
      this._data.set(0x8298, new IfdAsciiValue(v));
    }
  }

  /**
   * The size in bytes of the data written by this directory. Can be used to
   * calculate end-of-block offsets.
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

  constructor(data?: Map<number, IfdValue>) {
    this._data = data ?? new Map<number, IfdValue>();
  }

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

  public static from(other: IfdDirectory): IfdDirectory {
    return new IfdDirectory(new Map<number, IfdValue>(other._data));
  }

  public static isArrayOfRationalNumbers(value: unknown): boolean {
    return (
      Array.isArray(value) &&
      value.every(
        (v) => ArrayUtils.isNumArrayOrTypedArray(v) && (v as []).length >= 2
      )
    );
  }

  public has(tag: number): boolean {
    return this._data.has(tag);
  }

  public getValue(tag: number | string): IfdValue | undefined {
    let _tag: string | number | undefined = tag;
    if (typeof _tag === 'string') {
      _tag = ExifTagNameToID.get(_tag);
    }
    if (typeof _tag === 'number') {
      return this._data.get(_tag);
    }
    return undefined;
  }

  public setValue(
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
            case IfdValueType.none:
              break;
          }
        }
      }
    }
  }

  public copyFrom(other: IfdDirectory): void {
    other._data.forEach((value, tag) => this._data.set(tag, value.clone()));
  }

  public clone(): IfdDirectory {
    return IfdDirectory.from(this);
  }
}
