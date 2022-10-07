/** @format */

import { DecodeInfo } from '../decode-info';
import { PngFrame } from './png-frame';

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
  public set width(v: number) {
    this._width = v;
  }
  public get width(): number {
    return this._width;
  }

  private _height = 0;
  public set height(v: number) {
    this._height = v;
  }
  public get height(): number {
    return this._height;
  }

  private _backgroundColor = 0x00ffffff;
  public set backgroundColor(v: number) {
    this._backgroundColor = v;
  }
  public get backgroundColor(): number {
    return this._backgroundColor;
  }

  private _numFrames = 1;
  public set numFrames(v: number) {
    this._numFrames = v;
  }
  public get numFrames(): number {
    return this._numFrames;
  }

  private _bits?: number;
  public get bits(): number | undefined {
    return this._bits;
  }

  private _colorType?: number;
  public get colorType(): number | undefined {
    return this._colorType;
  }

  private _compressionMethod?: number;
  public get compressionMethod(): number | undefined {
    return this._compressionMethod;
  }

  private _filterMethod?: number;
  public get filterMethod(): number | undefined {
    return this._filterMethod;
  }

  private _interlaceMethod?: number;
  public get interlaceMethod(): number | undefined {
    return this._interlaceMethod;
  }

  private _palette?: Uint8Array;
  public set palette(v: Uint8Array | undefined) {
    this._palette = v;
  }
  public get palette(): Uint8Array | undefined {
    return this._palette;
  }

  private _transparency?: Uint8Array;
  public set transparency(v: Uint8Array | undefined) {
    this._transparency = v;
  }
  public get transparency(): Uint8Array | undefined {
    return this._transparency;
  }

  private _colorLut?: number[];
  public set colorLut(v: number[] | undefined) {
    this._colorLut = v;
  }
  public get colorLut(): number[] | undefined {
    return this._colorLut;
  }

  private _gamma?: number;
  public set gamma(v: number | undefined) {
    this._gamma = v;
  }
  public get gamma(): number | undefined {
    return this._gamma;
  }

  private _iCCPName = '';
  public set iCCPName(v: string) {
    this._iCCPName = v;
  }
  public get iCCPName(): string {
    return this._iCCPName;
  }

  private _iCCPCompression = 0;
  public set iCCPCompression(v: number) {
    this._iCCPCompression = v;
  }
  public get iCCPCompression(): number {
    return this._iCCPCompression;
  }

  private _iCCPData?: Uint8Array;
  public set iCCPData(v: Uint8Array | undefined) {
    this._iCCPData = v;
  }
  public get iCCPData(): Uint8Array | undefined {
    return this._iCCPData;
  }

  private _textData: Map<string, string> = new Map<string, string>();
  public get textData(): Map<string, string> {
    return this._textData;
  }

  private _repeat = 0;
  public set repeat(v: number) {
    this._repeat = v;
  }
  public get repeat(): number {
    return this._repeat;
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

  constructor(options?: PngInfoInitOptions) {
    this._width = options?.width ?? 0;
    this._height = options?.height ?? 0;
    this._bits = options?.bits;
    this._colorType = options?.colorType;
    this._compressionMethod = options?.compressionMethod;
    this._filterMethod = options?.filterMethod;
    this._interlaceMethod = options?.interlaceMethod;
  }
}
