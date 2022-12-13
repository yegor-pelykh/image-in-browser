/** @format */

import { Rational } from '../common/rational';
import { ExifIFDContainer } from './exif-ifd-container';
import { ExifImageTags, ExifTagNameToID } from './exif-tag';
import { ExifValueType } from './exif-value-type';
import { ExifAsciiValue } from './exif-value/exif-ascii-value';
import { ExifByteValue } from './exif-value/exif-byte-value';
import { ExifDoubleValue } from './exif-value/exif-double-value';
import { ExifLongValue } from './exif-value/exif-long-value';
import { ExifRationalValue } from './exif-value/exif-rational-value';
import { ExifSByteValue } from './exif-value/exif-sbyte-value';
import { ExifShortValue } from './exif-value/exif-short-value';
import { ExifSingleValue } from './exif-value/exif-single-value';
import { ExifSLongValue } from './exif-value/exif-slong-value';
import { ExifSRationalValue } from './exif-value/exif-srational-value';
import { ExifSShortValue } from './exif-value/exif-sshort-value';
import { ExifUndefinedValue } from './exif-value/exif-undefined-value';
import { ExifValue } from './exif-value/exif-value';

export class ExifIFD {
  private readonly data = new Map<number, ExifValue>();

  private readonly _sub = new ExifIFDContainer();
  public get sub(): ExifIFDContainer {
    return this._sub;
  }

  public get keys(): IterableIterator<number> {
    return this.data.keys();
  }

  public get values(): IterableIterator<ExifValue> {
    return this.data.values();
  }

  public get size(): number {
    return this.data.size;
  }

  public get isEmpty(): boolean {
    return this.data.size === 0 && this._sub.isEmpty;
  }

  public get hasImageDescription(): boolean {
    return this.data.has(0x010e);
  }

  public get imageDescription(): string | undefined {
    return this.data.get(0x010e)?.toString();
  }

  public set imageDescription(v: string | undefined) {
    if (v === undefined) {
      this.data.delete(0x010e);
    } else {
      this.data.set(0x010e, new ExifAsciiValue(v));
    }
  }

  public get hasMake(): boolean {
    return this.data.has(0x010f);
  }

  public get make(): string | undefined {
    return this.data.get(0x010f)?.toString();
  }

  public set make(v: string | undefined) {
    if (v === undefined) {
      this.data.delete(0x010f);
    } else {
      this.data.set(0x010f, new ExifAsciiValue(v));
    }
  }

  public get hasModel(): boolean {
    return this.data.has(0x0110);
  }

  public get model(): string | undefined {
    return this.data.get(0x0110)?.toString();
  }

  public set model(v: string | undefined) {
    if (v === undefined) {
      this.data.delete(0x0110);
    } else {
      this.data.set(0x0110, new ExifAsciiValue(v));
    }
  }

  public get hasOrientation(): boolean {
    return this.data.has(0x0112);
  }

  public get orientation(): number | undefined {
    return this.data.get(0x0112)?.toInt();
  }

  public set orientation(v: number | undefined) {
    if (v === undefined) {
      this.data.delete(0x0112);
    } else {
      this.data.set(0x0112, new ExifShortValue(v));
    }
  }

  public get hasResolutionX(): boolean {
    return this.data.has(0x011a);
  }

  public get resolutionX(): Rational | undefined {
    return this.data.get(0x011a)?.toRational();
  }

  public set resolutionX(v: Rational | undefined) {
    if (!this.setRational(0x011a, v)) {
      this.data.delete(0x011a);
    }
  }

  public get hasResolutionY(): boolean {
    return this.data.has(0x011b);
  }

  public get resolutionY(): Rational | undefined {
    return this.data.get(0x011b)?.toRational();
  }

  public set resolutionY(v: Rational | undefined) {
    if (!this.setRational(0x011b, v)) {
      this.data.delete(0x011b);
    }
  }

  public get hasResolutionUnit(): boolean {
    return this.data.has(0x0128);
  }

  public get resolutionUnit(): number | undefined {
    return this.data.get(0x0128)?.toInt();
  }

  public set resolutionUnit(v: number | undefined) {
    if (v === undefined) {
      this.data.delete(0x0128);
    } else {
      this.data.set(0x0128, new ExifShortValue(Math.trunc(v)));
    }
  }

  public get hasImageWidth(): boolean {
    return this.data.has(0x0100);
  }

  public get imageWidth(): number | undefined {
    return this.data.get(0x0100)?.toInt();
  }

  public set imageWidth(v: number | undefined) {
    if (v === undefined) {
      this.data.delete(0x0100);
    } else {
      this.data.set(0x0100, new ExifShortValue(Math.trunc(v)));
    }
  }

  public get hasImageHeight(): boolean {
    return this.data.has(0x0101);
  }

  public get imageHeight(): number | undefined {
    return this.data.get(0x0101)?.toInt();
  }

  public set imageHeight(v: number | undefined) {
    if (v === undefined) {
      this.data.delete(0x0101);
    } else {
      this.data.set(0x0101, new ExifShortValue(Math.trunc(v)));
    }
  }

  public get hasSoftware(): boolean {
    return this.data.has(0x0131);
  }

  public get software(): string | undefined {
    return this.data.get(0x0131)?.toString();
  }

  public set software(v: string | undefined) {
    if (v === undefined) {
      this.data.delete(0x0131);
    } else {
      this.data.set(0x0131, new ExifAsciiValue(v));
    }
  }

  public get hasCopyright(): boolean {
    return this.data.has(0x8298);
  }

  public get copyright(): string | undefined {
    return this.data.get(0x8298)?.toString();
  }

  public set copyright(v: string | undefined) {
    if (v === undefined) {
      this.data.delete(0x8298);
    } else {
      this.data.set(0x8298, new ExifAsciiValue(v));
    }
  }

  private setRational(tag: number, value: unknown): boolean {
    if (value instanceof Rational) {
      this.data.set(tag, ExifRationalValue.from(value));
      return true;
    } else if (
      Array.isArray(value) &&
      (value as Array<unknown>).every((v) => typeof v === 'number')
    ) {
      if (value.length === 2) {
        const r = new Rational((value as number[])[0], (value as number[])[1]);
        this.data.set(tag, ExifRationalValue.from(r));
        return true;
      }
    }
    return false;
  }

  public static isArrayOfRationalNumbers(value: unknown): boolean {
    return (
      Array.isArray(value) &&
      value.every(
        (v) =>
          Array.isArray(v) &&
          v.length >= 2 &&
          v.every((sv) => typeof sv === 'number')
      )
    );
  }

  public has(tag: number): boolean {
    return this.data.has(tag);
  }

  public getValue(tag: number | string): ExifValue | undefined {
    let _tag: string | number | undefined = tag;
    if (typeof _tag === 'string') {
      _tag = ExifTagNameToID.get(_tag);
    }
    if (typeof _tag === 'number') {
      return this.data.get(_tag);
    }
    return undefined;
  }

  public setValue(
    tag: number | string,
    value: number[][] | Rational[] | number[] | Rational | ExifValue | undefined
  ): void {
    let _tag: string | number | undefined = tag;
    if (typeof _tag === 'string') {
      _tag = ExifTagNameToID.get(_tag);
    }
    if (typeof _tag !== 'number') {
      return;
    }

    if (value === undefined) {
      this.data.delete(_tag);
    } else {
      if (value instanceof ExifValue) {
        this.data.set(_tag, value);
      } else {
        const tagInfo = ExifImageTags.get(_tag);
        if (tagInfo !== undefined) {
          const tagType = tagInfo.type;
          const tagCount = tagInfo.count;
          switch (tagType) {
            case ExifValueType.byte:
              if (
                Array.isArray(value) &&
                value.length === tagCount &&
                (value as Array<unknown>).every((v) => typeof v === 'number')
              ) {
                this.data.set(
                  _tag,
                  new ExifByteValue(new Uint8Array(value as number[]))
                );
              } else if (typeof value === 'number' && tagCount === 1) {
                this.data.set(_tag, new ExifByteValue(value));
              }
              break;
            case ExifValueType.ascii:
              if (typeof value === 'string') {
                this.data.set(_tag, new ExifAsciiValue(value));
              }
              break;
            case ExifValueType.short:
              if (
                Array.isArray(value) &&
                value.length === tagCount &&
                (value as Array<unknown>).every((v) => typeof v === 'number')
              ) {
                this.data.set(
                  _tag,
                  new ExifShortValue(new Uint16Array(value as number[]))
                );
              } else if (typeof value === 'number' && tagCount === 1) {
                this.data.set(_tag, new ExifShortValue(value));
              }
              break;
            case ExifValueType.long:
              if (
                Array.isArray(value) &&
                value.length === tagCount &&
                (value as Array<unknown>).every((v) => typeof v === 'number')
              ) {
                this.data.set(
                  _tag,
                  new ExifLongValue(new Uint32Array(value as number[]))
                );
              } else if (typeof value === 'number' && tagCount === 1) {
                this.data.set(_tag, new ExifLongValue(value));
              }
              break;
            case ExifValueType.rational:
              if (
                Array.isArray(value) &&
                value.length === tagCount &&
                (value as Array<unknown>).every((v) => v instanceof Rational)
              ) {
                this.data.set(_tag, new ExifRationalValue(value as Rational[]));
              } else if (
                tagCount === 1 &&
                Array.isArray(value) &&
                value.length === 2 &&
                (value as Array<unknown>).every((v) => typeof v === 'number')
              ) {
                const r = new Rational(
                  (value as number[])[0],
                  (value as number[])[1]
                );
                this.data.set(_tag, new ExifRationalValue(r));
              } else if (tagCount === 1 && value instanceof Rational) {
                this.data.set(_tag, new ExifRationalValue(value));
              } else if (
                Array.isArray(value) &&
                value.length === tagCount &&
                (value as Array<unknown>).every(
                  (v) =>
                    Array.isArray(v) &&
                    v.length >= 2 &&
                    v.every((sv) => typeof sv === 'number')
                )
              ) {
                const array = new Array<Rational>();
                for (let i = 0; i < value.length; i++) {
                  const subarray = value[i];
                  if (
                    Array.isArray(subarray) &&
                    subarray.length >= 2 &&
                    subarray.every((el) => typeof el === 'number')
                  ) {
                    array.push(new Rational(subarray[0], subarray[1]));
                  }
                }
                this.data.set(_tag, new ExifRationalValue(array));
              }
              break;
            case ExifValueType.sbyte:
              if (
                Array.isArray(value) &&
                value.length === tagCount &&
                (value as Array<unknown>).every((v) => typeof v === 'number')
              ) {
                this.data.set(
                  _tag,
                  new ExifSByteValue(new Int8Array(value as number[]))
                );
              } else if (typeof value === 'number' && tagCount === 1) {
                this.data.set(_tag, new ExifSByteValue(value));
              }
              break;
            case ExifValueType.undefined:
              if (
                Array.isArray(value) &&
                (value as Array<unknown>).every((v) => typeof v === 'number')
              ) {
                this.data.set(
                  _tag,
                  new ExifUndefinedValue(new Uint8Array(value as number[]))
                );
              }
              break;
            case ExifValueType.sshort:
              if (
                Array.isArray(value) &&
                value.length === tagCount &&
                (value as Array<unknown>).every((v) => typeof v === 'number')
              ) {
                this.data.set(
                  _tag,
                  new ExifSShortValue(new Int16Array(value as number[]))
                );
              } else if (typeof value === 'number' && tagCount === 1) {
                this.data.set(_tag, new ExifSShortValue(value));
              }
              break;
            case ExifValueType.slong:
              if (
                Array.isArray(value) &&
                value.length === tagCount &&
                (value as Array<unknown>).every((v) => typeof v === 'number')
              ) {
                this.data.set(
                  _tag,
                  new ExifSLongValue(new Int32Array(value as number[]))
                );
              } else if (typeof value === 'number' && tagCount === 1) {
                this.data.set(_tag, new ExifSLongValue(value));
              }
              break;
            case ExifValueType.srational:
              if (
                Array.isArray(value) &&
                value.length === tagCount &&
                (value as Array<unknown>).every((v) => v instanceof Rational)
              ) {
                this.data.set(
                  _tag,
                  new ExifSRationalValue(value as Rational[])
                );
              } else if (
                tagCount === 1 &&
                Array.isArray(value) &&
                value.length === 2 &&
                (value as Array<unknown>).every((v) => typeof v === 'number')
              ) {
                const r = new Rational(
                  (value as number[])[0],
                  (value as number[])[1]
                );
                this.data.set(_tag, new ExifSRationalValue(r));
              } else if (tagCount === 1 && value instanceof Rational) {
                this.data.set(_tag, new ExifSRationalValue(value));
              } else if (
                Array.isArray(value) &&
                value.length === tagCount &&
                (value as Array<unknown>).every(
                  (v) =>
                    Array.isArray(v) &&
                    v.length >= 2 &&
                    v.every((sv) => typeof sv === 'number')
                )
              ) {
                const array = new Array<Rational>();
                for (let i = 0; i < value.length; i++) {
                  const subarray = value[i];
                  if (
                    Array.isArray(subarray) &&
                    subarray.length >= 2 &&
                    subarray.every((el) => typeof el === 'number')
                  ) {
                    array.push(new Rational(subarray[0], subarray[1]));
                  }
                }
                this.data.set(_tag, new ExifSRationalValue(array));
              }
              break;
            case ExifValueType.single:
              if (
                Array.isArray(value) &&
                value.length === tagCount &&
                (value as Array<unknown>).every((v) => typeof v === 'number')
              ) {
                this.data.set(
                  _tag,
                  new ExifSingleValue(new Float32Array(value as number[]))
                );
              } else if (typeof value === 'number' && tagCount === 1) {
                this.data.set(_tag, new ExifSingleValue(value));
              }
              break;
            case ExifValueType.double:
              if (
                Array.isArray(value) &&
                value.length === tagCount &&
                (value as Array<unknown>).every((v) => typeof v === 'number')
              ) {
                this.data.set(
                  _tag,
                  new ExifDoubleValue(new Float64Array(value as number[]))
                );
              } else if (typeof value === 'number' && tagCount === 1) {
                this.data.set(_tag, new ExifDoubleValue(value));
              }
              break;
            case ExifValueType.none:
              break;
          }
        }
      }
    }
  }
}
