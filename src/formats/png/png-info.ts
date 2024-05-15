/** @format */

import { Color } from '../../color/color.js';
import { DecodeInfo } from '../decode-info.js';
import { PngColorType } from './png-color-type.js';
import { PngFrame } from './png-frame.js';

export interface PngInfoInitOptions {
  width?: number;
  height?: number;
  bits?: number;
  colorType?: number;
  compressionMethod?: number;
  filterMethod?: number;
  interlaceMethod?: number;
}

export class PngInfo implements DecodeInfo {
  private _width = 0;
  public get width(): number {
    return this._width;
  }
  public set width(v: number) {
    this._width = v;
  }

  private _height = 0;
  public set height(v: number) {
    this._height = v;
  }
  public get height(): number {
    return this._height;
  }

  private _backgroundColor: Color | undefined = undefined;
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }
  public set backgroundColor(v: Color | undefined) {
    this._backgroundColor = v;
  }

  private _numFrames = 1;
  public get numFrames(): number {
    return this._numFrames;
  }
  public set numFrames(v: number) {
    this._numFrames = v;
  }

  private _bits: number;
  public get bits(): number {
    return this._bits;
  }
  public set bits(v: number) {
    this._bits = v;
  }

  private _colorType: PngColorType | undefined;
  public get colorType(): PngColorType | undefined {
    return this._colorType;
  }
  public set colorType(v: PngColorType | undefined) {
    this._colorType = v;
  }

  private _compressionMethod: number;
  public get compressionMethod(): number {
    return this._compressionMethod;
  }
  public set compressionMethod(v: number) {
    this._compressionMethod = v;
  }

  private _filterMethod: number;
  public get filterMethod(): number {
    return this._filterMethod;
  }
  public set filterMethod(v: number) {
    this._filterMethod = v;
  }

  private _interlaceMethod: number;
  public get interlaceMethod(): number {
    return this._interlaceMethod;
  }
  public set interlaceMethod(v: number) {
    this._interlaceMethod = v;
  }

  private _palette?: Uint8Array;
  public get palette(): Uint8Array | undefined {
    return this._palette;
  }
  public set palette(v: Uint8Array | undefined) {
    this._palette = v;
  }

  private _transparency?: Uint8Array;
  public get transparency(): Uint8Array | undefined {
    return this._transparency;
  }
  public set transparency(v: Uint8Array | undefined) {
    this._transparency = v;
  }

  private _gamma?: number;
  public get gamma(): number | undefined {
    return this._gamma;
  }
  public set gamma(v: number | undefined) {
    this._gamma = v;
  }

  private _iccpName = '';
  public get iccpName(): string {
    return this._iccpName;
  }
  public set iccpName(v: string) {
    this._iccpName = v;
  }

  private _iccpCompression = 0;
  public get iccpCompression(): number {
    return this._iccpCompression;
  }
  public set iccpCompression(v: number) {
    this._iccpCompression = v;
  }

  private _iccpData?: Uint8Array;
  public get iccpData(): Uint8Array | undefined {
    return this._iccpData;
  }
  public set iccpData(v: Uint8Array | undefined) {
    this._iccpData = v;
  }

  private _textData: Map<string, string> = new Map<string, string>();
  public get textData(): Map<string, string> {
    return this._textData;
  }

  private _repeat = 0;
  public get repeat(): number {
    return this._repeat;
  }
  public set repeat(v: number) {
    this._repeat = v;
  }

  private readonly _idat: number[] = [];
  public get idat(): number[] {
    return this._idat;
  }

  private readonly _frames: PngFrame[] = [];
  public get frames(): PngFrame[] {
    return this._frames;
  }

  public get isAnimated(): boolean {
    return this._frames.length > 0;
  }

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
