/** @format */

import { Color } from '../../color/color.js';
import { DecodeInfo } from '../decode-info.js';

/**
 * Interface representing options for PvrAppleInfo.
 */
export interface PvrAppleInfoOptions {
  /** Width of the texture. */
  width: number;
  /** Height of the texture. */
  height: number;
  /** Number of mipmap levels. */
  mipCount: number;
  /** Flags associated with the texture. */
  flags: number;
  /** Size of the texture data. */
  texDataSize: number;
  /** Bits per pixel of the texture. */
  bitsPerPixel: number;
  /** Red color mask. */
  redMask: number;
  /** Green color mask. */
  greenMask: number;
  /** Blue color mask. */
  blueMask: number;
  /** Magic number for validation. */
  magic: number;
}

/**
 * Class representing PvrAppleInfo which implements DecodeInfo.
 */
export class PvrAppleInfo implements DecodeInfo {
  /** Background color of the texture. */
  private readonly _backgroundColor: Color | undefined = undefined;
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  /** Number of frames in the texture. */
  private readonly _numFrames: number = 1;
  public get numFrames(): number {
    return this._numFrames;
  }

  /** Width of the texture. */
  private _width: number = 0;
  public get width(): number {
    return this._width;
  }
  public set width(v: number) {
    this._width = v;
  }

  /** Height of the texture. */
  private _height: number = 0;
  public get height(): number {
    return this._height;
  }
  public set height(v: number) {
    this._height = v;
  }

  /** Number of mipmap levels. */
  private _mipCount: number = 0;
  public get mipCount(): number {
    return this._mipCount;
  }

  /** Flags associated with the texture. */
  private _flags: number = 0;
  public get flags(): number {
    return this._flags;
  }

  /** Size of the texture data. */
  private _texDataSize: number = 0;
  public get texDataSize(): number {
    return this._texDataSize;
  }

  /** Bits per pixel of the texture. */
  private _bitsPerPixel: number = 0;
  public get bitsPerPixel(): number {
    return this._bitsPerPixel;
  }
  public set bitsPerPixel(v: number) {
    this._bitsPerPixel = v;
  }

  /** Red color mask. */
  private _redMask: number = 0;
  public get redMask(): number {
    return this._redMask;
  }

  /** Green color mask. */
  private _greenMask: number = 0;
  public get greenMask(): number {
    return this._greenMask;
  }

  /** Blue color mask. */
  private _blueMask: number = 0;
  public get blueMask(): number {
    return this._blueMask;
  }

  /** Magic number for validation. */
  private _magic: number = 0;
  public get magic(): number {
    return this._magic;
  }

  /**
   * Initializes a new instance of the PvrAppleInfo class.
   * @param {PvrAppleInfoOptions} opt - Options for initializing the PvrAppleInfo.
   * @param {number} opt.width - Width of the texture.
   * @param {number} opt.height - Height of the texture.
   * @param {number} opt.mipCount - Number of mipmap levels.
   * @param {number} opt.flags - Flags associated with the texture.
   * @param {number} opt.texDataSize - Size of the texture data.
   * @param {number} opt.bitsPerPixel - Bits per pixel of the texture.
   * @param {number} opt.redMask - Red color mask.
   * @param {number} opt.greenMask - Green color mask.
   * @param {number} opt.blueMask - Blue color mask.
   * @param {number} opt.magic - Magic number for validation.
   */
  constructor(opt: PvrAppleInfoOptions) {
    this._width = opt.width;
    this._height = opt.height;
    this._mipCount = opt.mipCount;
    this._flags = opt.flags;
    this._texDataSize = opt.texDataSize;
    this._bitsPerPixel = opt.bitsPerPixel;
    this._redMask = opt.redMask;
    this._greenMask = opt.greenMask;
    this._blueMask = opt.blueMask;
    this._magic = opt.magic;
  }
}
