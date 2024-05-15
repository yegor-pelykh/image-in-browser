/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { LibError } from '../../error/lib-error.js';
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
import { TiffImage } from './tiff-image.js';

export interface TiffEntryInitOptions {
  tag: number;
  type: number;
  count: number;
  p: InputBuffer<Uint8Array>;
  valueOffset: number;
}

export class TiffEntry {
  private _tag: number;
  public get tag(): number {
    return this._tag;
  }

  private _type: IfdValueType;
  public get type(): IfdValueType {
    return this._type;
  }

  private _count: number;
  public get count(): number {
    return this._count;
  }

  private _valueOffset: number;
  public get valueOffset(): number {
    return this._valueOffset;
  }

  private _value: IfdValue | undefined;
  public get value(): IfdValue | undefined {
    return this._value;
  }

  private _p: InputBuffer<Uint8Array>;
  public get p(): InputBuffer<Uint8Array> {
    return this._p;
  }

  public get isValid(): boolean {
    return this._type !== IfdValueType.none;
  }

  public get typeSize(): number {
    return this.isValid ? IfdValueTypeSize[this._type] : 0;
  }

  public get isString(): boolean {
    return this._type === IfdValueType.ascii;
  }

  constructor(opt: TiffEntryInitOptions) {
    this._tag = opt.tag;
    this._type = opt.type;
    this._count = opt.count;
    this._p = opt.p;
    this._valueOffset = opt.valueOffset;
  }

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

  public toString(): string {
    const exifTag = ExifImageTags.get(this._tag);
    if (exifTag !== undefined) {
      return `${exifTag.name}: ${this._type} ${this._count}`;
    }
    return `${this.constructor.name} (<${this._tag}>: ${this._type} ${this._count})`;
  }
}
