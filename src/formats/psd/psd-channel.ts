/** @format */

import { InputBuffer } from '../../common/input-buffer.js';
import { LibError } from '../../error/lib-error.js';

/**
 * Interface representing the options for reading.
 */
export interface ReadOptions {
  /** The input buffer containing the data. */
  input: InputBuffer<Uint8Array>;
  /** The ID of the channel. */
  id: number;
  /** The width of the image. */
  width: number;
  /** The height of the image. */
  height: number;
  /** The bit depth of the image. */
  bitDepth: number;
  /** The compression type used. */
  compression: number;
  /** The plane number. */
  planeNumber: number;
  /** Optional array of line lengths. */
  lineLengths?: Uint16Array;
}

/**
 * Interface representing the options for reading a plane.
 */
export interface ReadPlaneOptions {
  /** The input buffer containing the data. */
  input: InputBuffer<Uint8Array>;
  /** The width of the image. */
  width: number;
  /** The height of the image. */
  height: number;
  /** The bit depth of the image. */
  bitDepth: number;
  /** Optional compression type used. */
  compression?: number;
  /** Optional array of line lengths. */
  lineLengths?: Uint16Array;
  /** Optional plane number. */
  planeNumber?: number;
}

/**
 * Class representing a PSD channel.
 */
export class PsdChannel {
  /** Red channel identifier. */
  public static readonly red = 0;
  /** Green channel identifier. */
  public static readonly green = 1;
  /** Blue channel identifier. */
  public static readonly blue = 2;
  /** Black channel identifier. */
  public static readonly black = 3;
  /** Alpha channel identifier. */
  public static readonly alpha = -1;
  /** Mask channel identifier. */
  public static readonly mask = -2;
  /** Real mask channel identifier. */
  public static readonly realMask = -3;

  /** No compression identifier. */
  public static readonly compressNone = 0;
  /** RLE compression identifier. */
  public static readonly compressRle = 1;
  /** ZIP compression identifier. */
  public static readonly compressZip = 2;
  /** ZIP predictor compression identifier. */
  public static readonly compressZipPredictor = 3;

  /** The ID of the channel. */
  private _id: number;
  /** The length of the data. */
  private _dataLength: number | undefined;
  /** The data of the channel. */
  private _data!: Uint8Array;

  /**
   * Gets the ID of the channel.
   */
  public get id(): number {
    return this._id;
  }

  /**
   * Gets the length of the data.
   */
  public get dataLength(): number | undefined {
    return this._dataLength;
  }

  /**
   * Gets the data of the channel.
   */
  public get data(): Uint8Array {
    return this._data;
  }

  /**
   * Constructs a new PSD channel.
   * @param {number} id - The ID of the channel.
   * @param {number} [dataLength] - The length of the data.
   */
  constructor(id: number, dataLength?: number) {
    this._id = id;
    this._dataLength = dataLength;
  }

  /**
   * Reads a PSD channel from the given options.
   * @param {ReadOptions} opt - The options for reading.
   * @param {number} opt.id - The identifier for the PSD channel.
   * @param {InputBuffer<Uint8Array>} opt.input - The input data for the PSD channel.
   * @param {number} opt.width - The width of the PSD channel.
   * @param {number} opt.height - The height of the PSD channel.
   * @param {number} opt.bitDepth - The bit depth of the PSD channel.
   * @param {number} opt.compression - The compression method used for the PSD channel.
   * @param {Uint16Array} opt.lineLengths - The lengths of the lines in the PSD channel.
   * @param {number} opt.planeNumber - The plane number of the PSD channel.
   * @returns {PsdChannel} The PSD channel.
   */
  public static read(opt: ReadOptions): PsdChannel {
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

  /**
   * Reads the line lengths from the input buffer.
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {number} height - The height of the image.
   * @returns {Uint16Array} The array of line lengths.
   */
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

  /**
   * Reads an uncompressed plane from the input buffer.
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {number} bitDepth - The bit depth of the image.
   */
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

  /**
   * Reads an RLE compressed plane from the input buffer.
   * @param {InputBuffer<Uint8Array>} input - The input buffer.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @param {number} bitDepth - The bit depth of the image.
   * @param {Uint16Array} lineLengths - The array of line lengths.
   * @param {number} planeNum - The plane number.
   */
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

  /**
   * Decodes RLE compressed data.
   * @param {InputBuffer<Uint8Array>} src - The source input buffer.
   * @param {Uint8Array} dst - The destination array.
   * @param {number} dstIndex - The starting index in the destination array.
   */
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
        if (_dstIndex + n > dst.length) {
          n = dst.length - _dstIndex;
        }
        for (let i = 0; i < n; ++i) {
          dst[_dstIndex++] = b;
        }
      } else {
        n++;
        if (_dstIndex + n > dst.length) {
          n = dst.length - _dstIndex;
        }
        for (let i = 0; i < n; ++i) {
          dst[_dstIndex++] = src.read();
        }
      }
    }
  }

  /**
   * Reads a plane from the given options.
   * @param {ReadPlaneOptions} opt - The options for reading the plane.
   * @param {InputBuffer<Uint8Array>} opt.input - The input data stream.
   * @param {number} opt.width - The width of the plane.
   * @param {number} opt.height - The height of the plane.
   * @param {number} opt.bitDepth - The bit depth of the plane.
   * @param {number} [opt.planeNumber] - The number of the plane (optional).
   * @param {number} [opt.compression] - The compression type (optional).
   * @param {Uint16Array} [opt.lineLengths] - The lengths of the lines for RLE compression (optional).
   * @throws {LibError} If the compression type is unsupported.
   */
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
