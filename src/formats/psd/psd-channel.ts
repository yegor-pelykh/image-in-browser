/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { LibError } from '../../error/lib-error.js';

// TODO: remove?
export interface ReadOptions {
  input: InputBuffer<Uint8Array>;
  id: number;
  width: number;
  height: number;
  bitDepth: number;
  compression: number;
  planeNumber: number;
  lineLengths?: Uint16Array;
}

// TODO: remove?
export interface ReadPlaneOptions {
  input: InputBuffer<Uint8Array>;
  width: number;
  height: number;
  bitDepth: number;
  compression?: number;
  lineLengths?: Uint16Array;
  planeNumber?: number;
}

export class PsdChannel {
  public static readonly red = 0;
  public static readonly green = 1;
  public static readonly blue = 2;
  public static readonly black = 3;
  public static readonly alpha = -1;
  public static readonly mask = -2;
  public static readonly realMask = -3;

  public static readonly compressNone = 0;
  public static readonly compressRle = 1;
  public static readonly compressZip = 2;
  public static readonly compressZipPredictor = 3;

  private _id: number;
  public get id(): number {
    return this._id;
  }

  private _dataLength: number | undefined;
  public get dataLength(): number | undefined {
    return this._dataLength;
  }

  private _data!: Uint8Array;
  public get data(): Uint8Array {
    return this._data;
  }

  constructor(id: number, dataLength?: number) {
    this._id = id;
    this._dataLength = dataLength;
  }

  public static read(opt: ReadOptions) {
    const obj = new PsdChannel(opt.id);
    obj.readPlane({
      input: opt.input,
      width: opt.width,
      height: opt.height,
      bitDepth: opt.bitDepth,
      compression: opt.compression,
      lineLengths: opt.lineLengths,
      planeNumber: opt.planeNumber,
    });
    return obj;
  }

  private readLineLengths(
    input: InputBuffer<Uint8Array>,
    height: number
  ): Uint16Array {
    const lineLengths = new Uint16Array(height);
    for (let i = 0; i < height; ++i) {
      lineLengths[i] = input.readUint16();
    }
    return lineLengths;
  }

  private readPlaneUncompressed(
    input: InputBuffer<Uint8Array>,
    width: number,
    height: number,
    bitDepth: number
  ): void {
    let len = width * height;
    if (bitDepth === 16) {
      len *= 2;
    }
    if (len > input.length) {
      this._data = new Uint8Array(len);
      this._data.fill(255, 0, len);
      return;
    }

    const imgData = input.readRange(len);
    this._data = imgData.toUint8Array();
  }

  private readPlaneRleCompressed(
    input: InputBuffer<Uint8Array>,
    width: number,
    height: number,
    bitDepth: number,
    lineLengths: Uint16Array,
    planeNum: number
  ): void {
    let len = width * height;
    if (bitDepth === 16) {
      len *= 2;
    }
    this._data = new Uint8Array(len);
    let pos = 0;
    let lineIndex = planeNum * height;
    if (lineIndex >= lineLengths.length) {
      this._data.fill(255, 0, this._data.length);
      return;
    }

    for (let i = 0; i < height; ++i) {
      const len = lineLengths[lineIndex++];
      const s = input.readRange(len);
      this.decodeRLE(s, this._data, pos);
      pos += width;
    }
  }

  private decodeRLE(
    src: InputBuffer<Uint8Array>,
    dst: Uint8Array,
    dstIndex: number
  ): void {
    let _dstIndex = dstIndex;
    while (!src.isEOS) {
      let n = src.readInt8();
      if (n < 0) {
        n = 1 - n;
        const b = src.read();
        for (let i = 0; i < n; ++i) {
          dst[_dstIndex++] = b;
        }
      } else {
        n++;
        for (let i = 0; i < n; ++i) {
          dst[_dstIndex++] = src.read();
        }
      }
    }
  }

  public readPlane(opt: ReadPlaneOptions): void {
    const planeNumber = opt.planeNumber ?? 0;
    const compression = opt.compression ?? opt.input.readUint16();

    switch (compression) {
      case PsdChannel.compressNone: {
        this.readPlaneUncompressed(
          opt.input,
          opt.width,
          opt.height,
          opt.bitDepth
        );
        break;
      }
      case PsdChannel.compressRle: {
        const lineLengths =
          opt.lineLengths ?? this.readLineLengths(opt.input, opt.height);
        this.readPlaneRleCompressed(
          opt.input,
          opt.width,
          opt.height,
          opt.bitDepth,
          lineLengths,
          planeNumber
        );
        break;
      }
      default:
        throw new LibError('Unsupported compression: $compression');
    }
  }
}
