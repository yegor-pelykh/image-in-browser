/** @format */

import { Color } from '../../color/color.js';
import { DecodeInfo } from '../decode-info.js';
import { TiffImage } from './tiff-image.js';

/**
 * Interface for initializing TiffInfo options.
 */
export interface TiffInfoInitOptions {
  /** Indicates if the TIFF file is big-endian. */
  bigEndian: boolean;
  /** The signature of the TIFF file. */
  signature: number;
  /** The offset to the Image File Directory (IFD). */
  ifdOffset: number;
  /** Array of TiffImage objects. */
  images: TiffImage[];
}

/**
 * Class representing TIFF information.
 */
export class TiffInfo implements DecodeInfo {
  /** Indicates if the TIFF file is big-endian. */
  private _bigEndian: boolean;
  /** Gets the big-endian status. */
  public get bigEndian(): boolean {
    return this._bigEndian;
  }

  /** The signature of the TIFF file. */
  private _signature: number;
  /** Gets the signature of the TIFF file. */
  public get signature(): number {
    return this._signature;
  }

  /** The offset to the Image File Directory (IFD). */
  private _ifdOffset: number;
  /** Gets the offset to the Image File Directory (IFD). */
  public get ifdOffset(): number {
    return this._ifdOffset;
  }

  /** Array of TiffImage objects. */
  private _images: TiffImage[] = [];
  /** Gets the array of TiffImage objects. */
  public get images(): TiffImage[] {
    return this._images;
  }

  /** The width of the TIFF image. */
  private _width = 0;
  /** Gets the width of the TIFF image. */
  public get width(): number {
    return this._width;
  }

  /** The height of the TIFF image. */
  private _height = 0;
  /** Gets the height of the TIFF image. */
  public get height(): number {
    return this._height;
  }

  /** The background color of the TIFF image. */
  private _backgroundColor: Color | undefined = undefined;
  /** Gets the background color of the TIFF image. */
  public get backgroundColor(): Color | undefined {
    throw this._backgroundColor;
  }

  /** Gets the number of frames in the TIFF image. */
  public get numFrames(): number {
    return this._images.length;
  }

  /**
   * Constructs a new TiffInfo instance.
   * @param {TiffInfoInitOptions} opt - The initialization options.
   * @param {boolean} opt.bigEndian - Indicates if the TIFF file is big-endian.
   * @param {string} opt.signature - The signature of the TIFF file.
   * @param {number} opt.ifdOffset - The offset to the Image File Directory (IFD).
   * @param {TiffImage[]} opt.images - Array of TiffImage objects.
   */
  constructor(opt: TiffInfoInitOptions) {
    this._bigEndian = opt.bigEndian;
    this._signature = opt.signature;
    this._ifdOffset = opt.ifdOffset;
    this._images = opt.images;
    if (this._images.length > 0) {
      this._width = this._images[0].width;
      this._height = this._images[0].height;
    }
  }
}
