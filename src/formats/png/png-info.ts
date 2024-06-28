/** @format */

import { Color } from '../../color/color.js';
import { DecodeInfo } from '../decode-info.js';
import { PngColorType } from './png-color-type.js';
import { PngFrame } from './png-frame.js';

/**
 * Interface for initializing PNG information options.
 */
export interface PngInfoInitOptions {
  /** Width of the PNG image. */
  width?: number;
  /** Height of the PNG image. */
  height?: number;
  /** Bit depth of the PNG image. */
  bits?: number;
  /** Color type of the PNG image. */
  colorType?: number;
  /** Compression method used in the PNG image. */
  compressionMethod?: number;
  /** Filter method used in the PNG image. */
  filterMethod?: number;
  /** Interlace method used in the PNG image. */
  interlaceMethod?: number;
}

/**
 * Class representing PNG information.
 */
export class PngInfo implements DecodeInfo {
  private _width = 0;

  /** Gets the width of the PNG image. */
  public get width(): number {
    return this._width;
  }

  /** Sets the width of the PNG image. */
  public set width(v: number) {
    this._width = v;
  }

  private _height = 0;

  /** Sets the height of the PNG image. */
  public set height(v: number) {
    this._height = v;
  }

  /** Gets the height of the PNG image. */
  public get height(): number {
    return this._height;
  }

  private _backgroundColor: Color | undefined = undefined;

  /** Gets the background color of the PNG image. */
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  /** Sets the background color of the PNG image. */
  public set backgroundColor(v: Color | undefined) {
    this._backgroundColor = v;
  }

  private _numFrames = 1;

  /** Gets the number of frames in the PNG image. */
  public get numFrames(): number {
    return this._numFrames;
  }

  /** Sets the number of frames in the PNG image. */
  public set numFrames(v: number) {
    this._numFrames = v;
  }

  private _bits: number;

  /** Gets the bit depth of the PNG image. */
  public get bits(): number {
    return this._bits;
  }

  /** Sets the bit depth of the PNG image. */
  public set bits(v: number) {
    this._bits = v;
  }

  private _colorType: PngColorType | undefined;

  /** Gets the color type of the PNG image. */
  public get colorType(): PngColorType | undefined {
    return this._colorType;
  }

  /** Sets the color type of the PNG image. */
  public set colorType(v: PngColorType | undefined) {
    this._colorType = v;
  }

  private _compressionMethod: number;

  /** Gets the compression method of the PNG image. */
  public get compressionMethod(): number {
    return this._compressionMethod;
  }

  /** Sets the compression method of the PNG image. */
  public set compressionMethod(v: number) {
    this._compressionMethod = v;
  }

  private _filterMethod: number;

  /** Gets the filter method of the PNG image. */
  public get filterMethod(): number {
    return this._filterMethod;
  }

  /** Sets the filter method of the PNG image. */
  public set filterMethod(v: number) {
    this._filterMethod = v;
  }

  private _interlaceMethod: number;

  /** Gets the interlace method of the PNG image. */
  public get interlaceMethod(): number {
    return this._interlaceMethod;
  }

  /** Sets the interlace method of the PNG image. */
  public set interlaceMethod(v: number) {
    this._interlaceMethod = v;
  }

  private _palette?: Uint8Array;

  /** Gets the palette of the PNG image. */
  public get palette(): Uint8Array | undefined {
    return this._palette;
  }

  /** Sets the palette of the PNG image. */
  public set palette(v: Uint8Array | undefined) {
    this._palette = v;
  }

  private _transparency?: Uint8Array;

  /** Gets the transparency data of the PNG image. */
  public get transparency(): Uint8Array | undefined {
    return this._transparency;
  }

  /** Sets the transparency data of the PNG image. */
  public set transparency(v: Uint8Array | undefined) {
    this._transparency = v;
  }

  private _gamma?: number;

  /** Gets the gamma value of the PNG image. */
  public get gamma(): number | undefined {
    return this._gamma;
  }

  /** Sets the gamma value of the PNG image. */
  public set gamma(v: number | undefined) {
    this._gamma = v;
  }

  private _iccpName = '';

  /** Gets the ICC profile name of the PNG image. */
  public get iccpName(): string {
    return this._iccpName;
  }

  /** Sets the ICC profile name of the PNG image. */
  public set iccpName(v: string) {
    this._iccpName = v;
  }

  private _iccpCompression = 0;

  /** Gets the ICC profile compression method of the PNG image. */
  public get iccpCompression(): number {
    return this._iccpCompression;
  }

  /** Sets the ICC profile compression method of the PNG image. */
  public set iccpCompression(v: number) {
    this._iccpCompression = v;
  }

  private _iccpData?: Uint8Array;

  /** Gets the ICC profile data of the PNG image. */
  public get iccpData(): Uint8Array | undefined {
    return this._iccpData;
  }

  /** Sets the ICC profile data of the PNG image. */
  public set iccpData(v: Uint8Array | undefined) {
    this._iccpData = v;
  }

  private _textData: Map<string, string> = new Map<string, string>();

  /** Gets the text data of the PNG image. */
  public get textData(): Map<string, string> {
    return this._textData;
  }

  private _repeat = 0;

  /** Gets the repeat count of the PNG image. */
  public get repeat(): number {
    return this._repeat;
  }

  /** Sets the repeat count of the PNG image. */
  public set repeat(v: number) {
    this._repeat = v;
  }

  private readonly _idat: number[] = [];

  /** Gets the IDAT chunk data of the PNG image. */
  public get idat(): number[] {
    return this._idat;
  }

  private readonly _frames: PngFrame[] = [];

  /** Gets the frames of the PNG image. */
  public get frames(): PngFrame[] {
    return this._frames;
  }

  /** Checks if the PNG image is animated. */
  public get isAnimated(): boolean {
    return this._frames.length > 0;
  }

  /**
   * Initializes a new instance of the PngInfo class.
   * @param {PngInfoInitOptions} [opt] - Options for initializing the PNG information.
   * @param {number} [opt.width] - The width of the PNG image.
   * @param {number} [opt.height] - The height of the PNG image.
   * @param {number} [opt.bits] - The bit depth of the PNG image.
   * @param {number} [opt.colorType] - The color type of the PNG image.
   * @param {number} [opt.compressionMethod] - The compression method used for the PNG image.
   * @param {number} [opt.filterMethod] - The filter method used for the PNG image.
   * @param {number} [opt.interlaceMethod] - The interlace method used for the PNG image.
   */
  constructor(opt?: PngInfoInitOptions) {
    this._width = opt?.width ?? 0;
    this._height = opt?.height ?? 0;
    this._bits = opt?.bits ?? 0;
    this._colorType = opt?.colorType;
    this._compressionMethod = opt?.compressionMethod ?? 0;
    this._filterMethod = opt?.filterMethod ?? 0;
    this._interlaceMethod = opt?.interlaceMethod ?? 0;
  }
}
