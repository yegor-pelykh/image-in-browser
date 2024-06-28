/** @format */

import { Color } from '../../color/color.js';
import { DecodeInfo } from '../decode-info.js';

/**
 * Interface representing the options for Pvr2Info.
 */
export interface Pvr2InfoOptions {
  /** Width of the texture. */
  width: number;
  /** Height of the texture. */
  height: number;
  /** Number of mipmaps. */
  mipCount: number;
  /** Flags associated with the texture. */
  flags: number;
  /** Size of the texture data. */
  texDataSize: number;
  /** Bits per pixel. */
  bitsPerPixel: number;
  /** Red color mask. */
  redMask: number;
  /** Green color mask. */
  greenMask: number;
  /** Blue color mask. */
  blueMask: number;
  /** Alpha color mask. */
  alphaMask: number;
  /** Magic number for validation. */
  magic: number;
  /** Number of textures. */
  numTex: number;
}

/**
 * Class representing Pvr2Info which implements DecodeInfo.
 */
export class Pvr2Info implements DecodeInfo {
  /** Background color of the texture. */
  private readonly _backgroundColor: Color | undefined = undefined;
  /** Gets the background color of the texture. */
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  /** Number of frames in the texture. */
  private readonly _numFrames: number = 1;
  /** Gets the number of frames in the texture. */
  public get numFrames(): number {
    return this._numFrames;
  }

  /** Width of the texture. */
  private _width: number = 0;
  /** Gets the width of the texture. */
  public get width(): number {
    return this._width;
  }

  /** Height of the texture. */
  private _height: number = 0;
  /** Gets the height of the texture. */
  public get height(): number {
    return this._height;
  }

  /** Number of mipmaps. */
  private _mipCount: number = 0;
  /** Gets the number of mipmaps. */
  public get mipCount(): number {
    return this._mipCount;
  }

  /** Flags associated with the texture. */
  private _flags: number = 0;
  /** Gets the flags associated with the texture. */
  public get flags(): number {
    return this._flags;
  }

  /** Size of the texture data. */
  private _texDataSize: number = 0;
  /** Gets the size of the texture data. */
  public get texDataSize(): number {
    return this._texDataSize;
  }

  /** Bits per pixel. */
  private _bitsPerPixel: number = 0;
  /** Gets the bits per pixel. */
  public get bitsPerPixel(): number {
    return this._bitsPerPixel;
  }

  /** Red color mask. */
  private _redMask: number = 0;
  /** Gets the red color mask. */
  public get redMask(): number {
    return this._redMask;
  }

  /** Green color mask. */
  private _greenMask: number = 0;
  /** Gets the green color mask. */
  public get greenMask(): number {
    return this._greenMask;
  }

  /** Blue color mask. */
  private _blueMask: number = 0;
  /** Gets the blue color mask. */
  public get blueMask(): number {
    return this._blueMask;
  }

  /** Alpha color mask. */
  private _alphaMask: number = 0;
  /** Gets the alpha color mask. */
  public get alphaMask(): number {
    return this._alphaMask;
  }

  /** Magic number for validation. */
  private _magic: number = 0;
  /** Gets the magic number for validation. */
  public get magic(): number {
    return this._magic;
  }

  /** Number of textures. */
  private _numTex: number = 0;
  /** Gets the number of textures. */
  public get numTex(): number {
    return this._numTex;
  }

  /**
   * Constructs an instance of Pvr2Info.
   * @param {Pvr2InfoOptions} opt - Options for initializing Pvr2Info.
   * @param {number} opt.width - Width of the texture.
   * @param {number} opt.height - Height of the texture.
   * @param {number} opt.mipCount - Number of mipmaps.
   * @param {number} opt.flags - Flags associated with the texture.
   * @param {number} opt.texDataSize - Size of the texture data.
   * @param {number} opt.bitsPerPixel - Bits per pixel.
   * @param {number} opt.redMask - Red color mask.
   * @param {number} opt.greenMask - Green color mask.
   * @param {number} opt.blueMask - Blue color mask.
   * @param {number} opt.alphaMask - Alpha color mask.
   * @param {number} opt.magic - Magic number for validation.
   * @param {number} opt.numTex - Number of textures.
   */
  constructor(opt: Pvr2InfoOptions) {
    this._width = opt.width;
    this._height = opt.height;
    this._mipCount = opt.mipCount;
    this._flags = opt.flags;
    this._texDataSize = opt.texDataSize;
    this._bitsPerPixel = opt.bitsPerPixel;
    this._redMask = opt.redMask;
    this._greenMask = opt.greenMask;
    this._blueMask = opt.blueMask;
    this._alphaMask = opt.alphaMask;
    this._magic = opt.magic;
    this._numTex = opt.numTex;
  }
}
