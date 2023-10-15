/** @format */

import { Color } from '../../color/color';
import { InputBuffer } from '../../common/input-buffer';
import { DecodeInfo } from '../decode-info';
import { TgaImageType, TgaImageTypeLength } from './tga-image-type';

export interface TgaInfoInitOptions {
  width?: number;
  height?: number;
  imageOffset?: number;
  bitsPerPixel?: number;
}

export class TgaInfo implements DecodeInfo {
  /**
   * The number of frames that can be decoded.
   */
  private readonly _numFrames: number = 1;
  public get numFrames(): number {
    return this._numFrames;
  }

  private readonly _backgroundColor: Color | undefined = undefined;
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  private _idLength = 0;
  public get idLength(): number {
    return this._idLength;
  }

  private _colorMapType = 0;
  public get colorMapType(): number {
    return this._colorMapType;
  }

  private _imageType: TgaImageType = TgaImageType.none;
  public get imageType(): TgaImageType {
    return this._imageType;
  }

  private _colorMapOrigin = 0;
  public get colorMapOrigin(): number {
    return this._colorMapOrigin;
  }

  private _colorMapLength = 0;
  public get colorMapLength(): number {
    return this._colorMapLength;
  }

  private _colorMapDepth = 0;
  public get colorMapDepth(): number {
    return this._colorMapDepth;
  }

  private _offsetX = 0;
  public get offsetX(): number {
    return this._offsetX;
  }

  private _offsetY = 0;
  public get offsetY(): number {
    return this._offsetY;
  }

  private _width = 0;
  public get width(): number {
    return this._width;
  }

  protected _height = 0;
  public get height(): number {
    return this._height;
  }

  protected _pixelDepth = 0;
  public get pixelDepth(): number {
    return this._pixelDepth;
  }

  protected _flags = 0;
  public get flags(): number {
    return this._flags;
  }

  protected _colorMap: Uint8Array | undefined;
  public get colorMap(): Uint8Array | undefined {
    return this._colorMap;
  }
  public set colorMap(v: Uint8Array | undefined) {
    this._colorMap = v;
  }

  protected _screenOrigin = 0;
  public get screenOrigin(): number {
    return this._screenOrigin;
  }

  /**
   *  Offset in the input file the image data starts at.
   */
  private _imageOffset = 0;
  public get imageOffset(): number {
    return this._imageOffset;
  }
  public set imageOffset(v: number) {
    this._imageOffset = v;
  }

  public get hasColorMap(): boolean {
    return (
      this._imageType === TgaImageType.palette ||
      this._imageType === TgaImageType.paletteRle
    );
  }

  public read(header: InputBuffer<Uint8Array>): void {
    if (header.length < 18) {
      return;
    }
    // 0
    this._idLength = header.read();
    // 1
    this._colorMapType = header.read();
    const it = header.read();
    // 2
    this._imageType =
      it < TgaImageTypeLength ? (it as TgaImageType) : TgaImageType.none;
    // 3
    this._colorMapOrigin = header.readUint16();
    // 5
    this._colorMapLength = header.readUint16();
    // 7
    this._colorMapDepth = header.read();
    // 8
    this._offsetX = header.readUint16();
    // 10
    this._offsetY = header.readUint16();
    // 12
    this._width = header.readUint16();
    // 14
    this._height = header.readUint16();
    // 16
    this._pixelDepth = header.read();
    // 17
    this._flags = header.read();
    this._screenOrigin = (this._flags & 0x30) >>> 4;
  }

  public isValid(): boolean {
    if (
      this._pixelDepth !== 8 &&
      this._pixelDepth !== 16 &&
      this._pixelDepth !== 24 &&
      this._pixelDepth !== 32
    ) {
      return false;
    }

    if (this.hasColorMap) {
      if (this._colorMapLength > 256 || this._colorMapType !== 1) {
        return false;
      }
      if (
        this._colorMapDepth !== 16 &&
        this._colorMapDepth !== 24 &&
        this._colorMapDepth !== 32
      ) {
        return false;
      }
    } else if (this._colorMapType === 1) {
      return false;
    }

    return true;
  }
}
