/** @format */

import { Color } from '../../color/color.js';
import { InputBuffer } from '../../common/input-buffer.js';
import { DecodeInfo } from '../decode-info.js';
import { TgaImageType, TgaImageTypeLength } from './tga-image-type.js';

/**
 * Interface for TGA information initialization options.
 */
export interface TgaInfoInitOptions {
  /**
   * Width of the image.
   */
  width?: number;
  /**
   * Height of the image.
   */
  height?: number;
  /**
   * Offset in the input file where the image data starts.
   */
  imageOffset?: number;
  /**
   * Bits per pixel of the image.
   */
  bitsPerPixel?: number;
}

/**
 * Class representing TGA information.
 */
export class TgaInfo implements DecodeInfo {
  /**
   * The number of frames that can be decoded.
   */
  private readonly _numFrames: number = 1;

  /**
   * Gets the number of frames.
   */
  public get numFrames(): number {
    return this._numFrames;
  }

  /**
   * The background color of the image.
   */
  private readonly _backgroundColor: Color | undefined = undefined;

  /**
   * Gets the background color.
   */
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  /**
   * The length of the ID field.
   */
  private _idLength = 0;

  /**
   * Gets the length of the ID field.
   */
  public get idLength(): number {
    return this._idLength;
  }

  /**
   * The type of the color map.
   */
  private _colorMapType = 0;

  /**
   * Gets the type of the color map.
   */
  public get colorMapType(): number {
    return this._colorMapType;
  }

  /**
   * The type of the image.
   */
  private _imageType: TgaImageType = TgaImageType.none;

  /**
   * Gets the type of the image.
   */
  public get imageType(): TgaImageType {
    return this._imageType;
  }

  /**
   * The origin of the color map.
   */
  private _colorMapOrigin = 0;

  /**
   * Gets the origin of the color map.
   */
  public get colorMapOrigin(): number {
    return this._colorMapOrigin;
  }

  /**
   * The length of the color map.
   */
  private _colorMapLength = 0;

  /**
   * Gets the length of the color map.
   */
  public get colorMapLength(): number {
    return this._colorMapLength;
  }

  /**
   * The depth of the color map.
   */
  private _colorMapDepth = 0;

  /**
   * Gets the depth of the color map.
   */
  public get colorMapDepth(): number {
    return this._colorMapDepth;
  }

  /**
   * The X offset of the image.
   */
  private _offsetX = 0;

  /**
   * Gets the X offset of the image.
   */
  public get offsetX(): number {
    return this._offsetX;
  }

  /**
   * The Y offset of the image.
   */
  private _offsetY = 0;

  /**
   * Gets the Y offset of the image.
   */
  public get offsetY(): number {
    return this._offsetY;
  }

  /**
   * The width of the image.
   */
  private _width = 0;

  /**
   * Gets the width of the image.
   */
  public get width(): number {
    return this._width;
  }

  /**
   * The height of the image.
   */
  protected _height = 0;

  /**
   * Gets the height of the image.
   */
  public get height(): number {
    return this._height;
  }

  /**
   * The pixel depth of the image.
   */
  protected _pixelDepth = 0;

  /**
   * Gets the pixel depth of the image.
   */
  public get pixelDepth(): number {
    return this._pixelDepth;
  }

  /**
   * The flags of the image.
   */
  protected _flags = 0;

  /**
   * Gets the flags of the image.
   */
  public get flags(): number {
    return this._flags;
  }

  /**
   * The color map of the image.
   */
  protected _colorMap: Uint8Array | undefined;

  /**
   * Gets the color map of the image.
   */
  public get colorMap(): Uint8Array | undefined {
    return this._colorMap;
  }

  /**
   * Sets the color map of the image.
   */
  public set colorMap(v: Uint8Array | undefined) {
    this._colorMap = v;
  }

  /**
   * The screen origin of the image.
   */
  protected _screenOrigin = 0;

  /**
   * Gets the screen origin of the image.
   */
  public get screenOrigin(): number {
    return this._screenOrigin;
  }

  /**
   * Offset in the input file the image data starts at.
   */
  private _imageOffset = 0;

  /**
   * Gets the offset in the input file the image data starts at.
   */
  public get imageOffset(): number {
    return this._imageOffset;
  }

  /**
   * Sets the offset in the input file the image data starts at.
   */
  public set imageOffset(v: number) {
    this._imageOffset = v;
  }

  /**
   * Checks if the image has a color map.
   */
  public get hasColorMap(): boolean {
    return (
      this._imageType === TgaImageType.palette ||
      this._imageType === TgaImageType.paletteRle
    );
  }

  /**
   * Reads the TGA header from the input buffer.
   * @param {InputBuffer<Uint8Array>} header - The input buffer containing the TGA header.
   */
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

  /**
   * Validates the TGA information.
   * @returns {boolean} True if the TGA information is valid, otherwise false.
   */
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
