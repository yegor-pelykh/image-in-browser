/** @format */

import { ListUtils } from '../common/list-utils';
import { NotImplementedError } from '../error/not-implemented-error';
import { Half } from './half';

export interface HdrSliceInitOptions {
  name: string;
  width: number;
  height: number;
  format: number;
  bitsPerSample: number;
  data?: TypedArray;
}

/**
 * A slice is the data for an image framebuffer for a single channel.
 */
export class HdrSlice {
  public static UINT = 0;
  public static INT = 1;
  public static FLOAT = 3;

  /**
   * [data] will be one of the type data lists, depending on the [type] and
   * [bitsPerSample]. 16-bit FLOAT slices will be stored in a [Uint16List].
   */
  private readonly data: TypedArray;

  private readonly _name: string;
  public get name(): string {
    return this._name;
  }

  private readonly _width: number;
  public get width(): number {
    return this._width;
  }

  private readonly _height: number;
  public get height(): number {
    return this._height;
  }

  /**
   * Indicates the type of data stored by the slice, either [HdrSlice.INT],
   * [HdrSlice.FLOAT], or [HdrSlice.UINT].
   */
  private readonly _format: number;
  public get format(): number {
    return this._format;
  }

  /**
   * How many bits per sample, either 8, 16, 32, or 64.
   */
  private readonly _bitsPerSample: number;
  public get bitsPerSample(): number {
    return this._bitsPerSample;
  }

  private get maxIntSize(): number {
    let v = 0xffffffff;
    if (this._bitsPerSample === 8) {
      v = 0xff;
    } else if (this._bitsPerSample === 16) {
      v = 0xffff;
    }
    if (this._format === HdrSlice.INT) {
      v -= 1;
    }
    return v;
  }

  /**
   * Does this channel store floating-point data?
   */
  public get isFloat(): boolean {
    return this._format === HdrSlice.FLOAT;
  }

  constructor(options: HdrSliceInitOptions) {
    this._name = options.name;
    this._width = options.width;
    this._height = options.height;
    this._format = options.format;
    this._bitsPerSample = options.bitsPerSample;
    this.data =
      options.data ??
      HdrSlice.allocateDataForType(
        options.width * options.height,
        options.format,
        options.bitsPerSample
      );
  }

  private static allocateDataForType(
    size: number,
    type: number,
    bitsPerSample: number
  ): TypedArray {
    switch (type) {
      case HdrSlice.INT:
        if (bitsPerSample === 8) {
          return new Int8Array(size);
        } else if (bitsPerSample === 16) {
          return new Int16Array(size);
        } else if (bitsPerSample === 32) {
          return new Int32Array(size);
        }
        break;
      case HdrSlice.UINT:
        if (bitsPerSample === 8) {
          return new Uint8Array(size);
        } else if (bitsPerSample === 16) {
          return new Uint16Array(size);
        } else if (bitsPerSample === 32) {
          return new Uint32Array(size);
        }
        break;
      case HdrSlice.FLOAT:
        if (bitsPerSample === 16) {
          return new Uint16Array(size);
        } else if (bitsPerSample === 32) {
          return new Float32Array(size);
        } else if (bitsPerSample === 64) {
          return new Float64Array(size);
        }
        break;
    }
    throw new NotImplementedError();
  }

  /**
   * Create a copy of the [other] HdrSlice.
   */
  public static from(other: HdrSlice): HdrSlice {
    return new HdrSlice({
      name: other._name,
      width: other._width,
      height: other._height,
      format: other._format,
      bitsPerSample: other._bitsPerSample,
      data: ListUtils.copy(other.data),
    });
  }

  /**
   * Get the raw bytes of the data buffer.
   */
  public getBytes(): Uint8Array {
    return new Uint8Array(this.data.buffer);
  }

  /**
   * Get the float value of the sample at the coordinates [x],[y].
   * [Half] samples are converted to double.
   */
  public getFloat(x: number, y: number): number {
    const pi = y * this._width + x;
    if (this._format === HdrSlice.INT || this._format === HdrSlice.UINT) {
      return Math.trunc(this.data[pi]) / this.maxIntSize;
    }
    const s =
      this._format === HdrSlice.FLOAT && this._bitsPerSample === 16
        ? Half.halfToDouble(this.data[pi])
        : this.data[pi];
    return s;
  }

  /**
   * Set the float value of the sample at the coordinates [x],[y] for
   * [FLOAT] slices.
   */
  public setFloat(x: number, y: number, v: number): void {
    if (this._format !== HdrSlice.FLOAT) {
      return;
    }
    const pi = y * this._width + x;
    if (this._bitsPerSample === 16) {
      this.data[pi] = Half.doubleToHalf(v);
    } else {
      this.data[pi] = v;
    }
  }

  /**
   * Get the int value of the sample at the coordinates [x],[y].
   * An exception will occur if the slice stores FLOAT data.
   */
  public getInt(x: number, y: number): number {
    const pi = y * this._width + x;
    return Math.trunc(this.data[pi]);
  }

  /**
   * Set the int value of the sample at the coordinates [x],[y] for [INT] and
   * [UINT] slices.
   */
  public setInt(x: number, y: number, v: number): void {
    const pi = y * this._width + x;
    this.data[pi] = Math.trunc(v);
  }
}
