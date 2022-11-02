/** @format */

import { InputBuffer } from '../../common/input-buffer';
import { ImageError } from '../../error/image-error';
import { TiffImage } from './tiff-image';

export interface TiffEntryInitOptions {
  tag: number;
  type: number;
  numValues: number;
  p: InputBuffer;
}

export class TiffEntry {
  private static readonly SIZE_OF_TYPE: number[] = [
    //  0 = n/a
    0,
    //  1 = byte
    1,
    //  2 = ascii
    1,
    //  3 = short
    2,
    //  4 = long
    4,
    //  5 = rational
    8,
    //  6 = sbyte
    1,
    //  7 = undefined
    1,
    //  8 = sshort
    2,
    //  9 = slong
    4,
    // 10 = srational
    8,
    // 11 = float
    4,
    // 12 = double
    8, 0,
  ];

  public static readonly TYPE_BYTE = 1;
  public static readonly TYPE_ASCII = 2;
  public static readonly TYPE_SHORT = 3;
  public static readonly TYPE_LONG = 4;
  public static readonly TYPE_RATIONAL = 5;
  public static readonly TYPE_SBYTE = 6;
  public static readonly TYPE_UNDEFINED = 7;
  public static readonly TYPE_SSHORT = 8;
  public static readonly TYPE_SLONG = 9;
  public static readonly TYPE_SRATIONAL = 10;
  public static readonly TYPE_FLOAT = 11;
  public static readonly TYPE_DOUBLE = 12;

  private _tag: number;
  public get tag(): number {
    return this._tag;
  }

  private _type: number;
  public get type(): number {
    return this._type;
  }

  private _numValues: number;
  public get numValues(): number {
    return this._numValues;
  }

  private _valueOffset: number | undefined;
  public get valueOffset(): number | undefined {
    return this._valueOffset;
  }
  public set valueOffset(v: number | undefined) {
    this._valueOffset = v;
  }

  private _p: InputBuffer;
  public get p(): InputBuffer {
    return this._p;
  }

  get isValid(): boolean {
    return this._type < 13 && this._type > 0;
  }

  get typeSize(): number {
    return this.isValid ? TiffEntry.SIZE_OF_TYPE[this._type] : 0;
  }

  get isString(): boolean {
    return this._type === TiffEntry.TYPE_ASCII;
  }

  constructor(options: TiffEntryInitOptions) {
    this._tag = options.tag;
    this._type = options.type;
    this._numValues = options.numValues;
    this._p = options.p;
  }

  private readValueInternal(): number {
    switch (this._type) {
      case TiffEntry.TYPE_BYTE:
      case TiffEntry.TYPE_ASCII:
        return this._p.readByte();
      case TiffEntry.TYPE_SHORT:
        return this._p.readUint16();
      case TiffEntry.TYPE_LONG:
        return this._p.readUint32();
      case TiffEntry.TYPE_RATIONAL: {
        const num = this._p.readUint32();
        const den = this._p.readUint32();
        if (den === 0) {
          return 0;
        }
        return Math.trunc(num / den);
      }
      case TiffEntry.TYPE_SBYTE:
        throw new ImageError('Unhandled value type: SBYTE');
      case TiffEntry.TYPE_UNDEFINED:
        return this._p.readByte();
      case TiffEntry.TYPE_SSHORT:
        throw new ImageError('Unhandled value type: SSHORT');
      case TiffEntry.TYPE_SLONG:
        throw new ImageError('Unhandled value type: SLONG');
      case TiffEntry.TYPE_SRATIONAL:
        throw new ImageError('Unhandled value type: SRATIONAL');
      case TiffEntry.TYPE_FLOAT:
        throw new ImageError('Unhandled value type: FLOAT');
      case TiffEntry.TYPE_DOUBLE:
        throw new ImageError('Unhandled value type: DOUBLE');
    }
    return 0;
  }

  public toString() {
    if (TiffImage.TAG_NAME.has(this._tag)) {
      return `${TiffImage.TAG_NAME.get(this._tag)}: $type $numValues`;
    }
    return `<${this._tag}>: ${this._type} ${this._numValues}`;
  }

  public readValue(): number {
    this._p.offset = this._valueOffset!;
    return this.readValueInternal();
  }

  public readValues(): number[] {
    this._p.offset = this._valueOffset!;
    const values: number[] = [];
    for (let i = 0; i < this._numValues; ++i) {
      values.push(this.readValueInternal());
    }
    return values;
  }

  public readString(): string {
    if (this._type !== TiffEntry.TYPE_ASCII) {
      throw new ImageError('readString requires ASCII entity');
    }
    // TODO: ASCII fields can contain multiple strings, separated with a NULL.
    return String.fromCharCode(...this.readValues());
  }

  public read(): number[] {
    this._p.offset = this._valueOffset!;
    const values: number[] = [];
    for (let i = 0; i < this._numValues; ++i) {
      switch (this._type) {
        case TiffEntry.TYPE_BYTE:
        case TiffEntry.TYPE_ASCII:
          values.push(this._p.readByte());
          break;
        case TiffEntry.TYPE_SHORT:
          values.push(this._p.readUint16());
          break;
        case TiffEntry.TYPE_LONG:
          values.push(this._p.readUint32());
          break;
        case TiffEntry.TYPE_RATIONAL: {
          const num = this._p.readUint32();
          const den = this._p.readUint32();
          if (den !== 0) {
            values.push(num / den);
          }
          break;
        }
        case TiffEntry.TYPE_FLOAT:
          values.push(this._p.readFloat32());
          break;
        case TiffEntry.TYPE_DOUBLE:
          values.push(this._p.readFloat64());
          break;
      }
    }
    return values;
  }
}
