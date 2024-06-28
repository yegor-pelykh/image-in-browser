/** @format */

import { Color } from '../../color/color.js';
import { DecodeInfo } from '../decode-info.js';

/**
 * Interface representing the options for Pvr3Info.
 */
export interface Pvr3InfoOptions {
  /** Width of the image. */
  width: number;
  /** Height of the image. */
  height: number;
  /** Number of mipmap levels. */
  mipCount: number;
  /** Flags associated with the image. */
  flags: number;
  /** Format of the image. */
  format: number;
  /** Order of the channels. */
  order: number[];
  /** Color space of the image. */
  colorSpace: number;
  /** Type of the channels. */
  channelType: number;
  /** Depth of the image. */
  depth: number;
  /** Number of surfaces in the image. */
  numSurfaces: number;
  /** Number of faces in the image. */
  numFaces: number;
  /** Size of the metadata. */
  metadataSize: number;
}

/**
 * Class representing Pvr3Info which implements DecodeInfo.
 */
export class Pvr3Info implements DecodeInfo {
  /**
   * Background color of the image.
   */
  private readonly _backgroundColor: Color | undefined = undefined;
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  /**
   * Number of frames in the image.
   */
  private readonly _numFrames: number = 1;
  public get numFrames(): number {
    return this._numFrames;
  }

  /**
   * Width of the image.
   */
  private _width: number = 0;
  public get width(): number {
    return this._width;
  }

  /**
   * Height of the image.
   */
  private _height: number = 0;
  public get height(): number {
    return this._height;
  }

  /**
   * Number of mipmap levels.
   */
  private _mipCount: number = 0;
  public get mipCount(): number {
    return this._mipCount;
  }

  /**
   * Flags associated with the image.
   */
  private _flags: number = 0;
  public get flags(): number {
    return this._flags;
  }

  /**
   * Format of the image.
   */
  private _format: number = 0;
  public get format(): number {
    return this._format;
  }

  /**
   * Order of the channels.
   */
  private _order: number[] = [0, 0, 0, 0];
  public get order(): number[] {
    return this._order;
  }

  /**
   * Color space of the image.
   */
  private _colorSpace: number = 0;
  public get colorSpace(): number {
    return this._colorSpace;
  }

  /**
   * Type of the channels.
   */
  private _channelType: number = 0;
  public get channelType(): number {
    return this._channelType;
  }

  /**
   * Depth of the image.
   */
  private _depth: number = 0;
  public get depth(): number {
    return this._depth;
  }

  /**
   * Number of surfaces in the image.
   */
  private _numSurfaces: number = 0;
  public get numSurfaces(): number {
    return this._numSurfaces;
  }

  /**
   * Number of faces in the image.
   */
  private _numFaces: number = 0;
  public get numFaces(): number {
    return this._numFaces;
  }

  /**
   * Size of the metadata.
   */
  private _metadataSize: number = 0;
  public get metadataSize(): number {
    return this._metadataSize;
  }

  /**
   * Constructor for Pvr3Info.
   * @param {Pvr3InfoOptions} opt - Options for initializing Pvr3Info.
   * @param {number} opt.width - Width of the image.
   * @param {number} opt.height - Height of the image.
   * @param {number} opt.mipCount - Number of mipmap levels.
   * @param {number} opt.flags - Flags associated with the image.
   * @param {number} opt.format - Format of the image.
   * @param {string} opt.order - Order of the channels.
   * @param {string} opt.colorSpace - Color space of the image.
   * @param {string} opt.channelType - Type of the channels.
   * @param {number} opt.depth - Depth of the image.
   * @param {number} opt.numSurfaces - Number of surfaces in the image.
   * @param {number} opt.numFaces - Number of faces in the image.
   * @param {number} opt.metadataSize - Size of the metadata.
   */
  constructor(opt: Pvr3InfoOptions) {
    this._width = opt.width;
    this._height = opt.height;
    this._mipCount = opt.mipCount;
    this._flags = opt.flags;
    this._format = opt.format;
    this._order = opt.order;
    this._colorSpace = opt.colorSpace;
    this._channelType = opt.channelType;
    this._depth = opt.depth;
    this._numSurfaces = opt.numSurfaces;
    this._numFaces = opt.numFaces;
    this._metadataSize = opt.metadataSize;
  }
}
