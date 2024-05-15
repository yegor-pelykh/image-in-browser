/** @format */

import { Color } from '../../color/color.js';
import { BitUtils } from '../../common/bit-utils.js';
import { InputBuffer } from '../../common/input-buffer.js';
import { LibError } from '../../error/lib-error.js';
import { PaletteUint8 } from '../../image/palette-uint8.js';
import { DecodeInfo } from '../decode-info.js';
import { BmpCompressionMode } from './bmp-compression-mode.js';
import { BmpFileHeader } from './bmp-file-header.js';

export class BmpInfo implements DecodeInfo {
  private readonly _startPos: number;
  private _redShift = 0;
  private _redScale = 0;
  private _greenShift = 0;
  private _greenScale = 0;
  private _blueShift = 0;
  private _blueScale = 0;
  private _alphaShift = 0;
  private _alphaScale = 0;

  private readonly _width: number = 0;
  public get width(): number {
    return this._width;
  }

  protected readonly _height: number = 0;
  public get height(): number {
    return Math.abs(this._height);
  }

  private readonly _backgroundColor: Color | undefined = undefined;
  public get backgroundColor(): Color | undefined {
    return this._backgroundColor;
  }

  private readonly _numFrames: number = 1;
  public get numFrames(): number {
    return this._numFrames;
  }

  private readonly _header: BmpFileHeader;
  public get header(): BmpFileHeader {
    return this._header;
  }

  private readonly _headerSize: number;
  public get headerSize(): number {
    return this._headerSize;
  }

  private readonly _planes: number;
  public get planes(): number {
    return this._planes;
  }

  private readonly _bitsPerPixel: number;
  public get bitsPerPixel(): number {
    return this._bitsPerPixel;
  }

  private readonly _compression: BmpCompressionMode;
  public get compression(): BmpCompressionMode {
    return this._compression;
  }

  private readonly _imageSize: number;
  public get imageSize(): number {
    return this._imageSize;
  }

  private readonly _xppm: number;
  public get xppm(): number {
    return this._xppm;
  }

  private readonly _yppm: number;
  public get yppm(): number {
    return this._yppm;
  }

  private readonly _totalColors: number;
  public get totalColors(): number {
    return this._totalColors;
  }

  private readonly _importantColors: number;
  public get importantColors(): number {
    return this._importantColors;
  }

  private _redMask = 0;
  public get redMask(): number {
    return this._redMask;
  }

  private _greenMask = 0;
  public get greenMask(): number {
    return this._greenMask;
  }

  private _blueMask = 0;
  public get blueMask(): number {
    return this._blueMask;
  }

  private _alphaMask = 0;
  public get alphaMask(): number {
    return this._alphaMask;
  }

  private _palette: PaletteUint8 | undefined;
  public get palette(): PaletteUint8 | undefined {
    return this._palette;
  }

  public get readBottomUp(): boolean {
    return this._height >= 0;
  }

  public get ignoreAlphaChannel(): boolean {
    // Gimp and Photoshop ignore the alpha channel for BITMAPINFOHEADER.
    return (
      this._headerSize === 40 ||
      // BITMAPV5HEADER with null alpha mask.
      (this._headerSize === 124 && this._alphaMask === 0)
    );
  }

  constructor(p: InputBuffer<Uint8Array>, header?: BmpFileHeader) {
    this._header = header ?? new BmpFileHeader(p);
    this._startPos = p.offset;
    this._headerSize = p.readUint32();
    this._width = p.readInt32();
    this._height = p.readInt32();
    this._planes = p.readUint16();
    this._bitsPerPixel = p.readUint16();
    this._compression = p.readUint32();
    this._imageSize = p.readUint32();
    this._xppm = p.readInt32();
    this._yppm = p.readInt32();
    this._totalColors = p.readUint32();
    this._importantColors = p.readUint32();

    // BMP allows > 4 bit per channel for 16bpp, so we have to scale it
    // up to 8-bit
    const maxChannelValue = 255.0;

    if (
      this._headerSize > 40 ||
      this._compression === BmpCompressionMode.bitfields ||
      this._compression === BmpCompressionMode.alphaBitfields
    ) {
      this._redMask = p.readUint32();
      this._redShift = BitUtils.countTrailingZeroBits(this._redMask);
      const redDepth = this._redMask >>> this._redShift;
      this._redScale = redDepth > 0 ? maxChannelValue / redDepth : 0;

      this._greenMask = p.readUint32();
      this._greenShift = BitUtils.countTrailingZeroBits(this._greenMask);
      const greenDepth = this._greenMask >>> this._greenShift;
      this._greenScale = redDepth > 0 ? maxChannelValue / greenDepth : 0;

      this._blueMask = p.readUint32();
      this._blueShift = BitUtils.countTrailingZeroBits(this._blueMask);
      const blueDepth = this._blueMask >>> this._blueShift;
      this._blueScale = redDepth > 0 ? maxChannelValue / blueDepth : 0;

      if (
        this._headerSize > 40 ||
        this._compression === BmpCompressionMode.alphaBitfields
      ) {
        this._alphaMask = p.readUint32();
        this._alphaShift = BitUtils.countTrailingZeroBits(this._alphaMask);
        const alphaDepth = this._alphaMask >>> this._alphaShift;
        this._alphaScale = alphaDepth > 0 ? maxChannelValue / alphaDepth : 0;
      } else {
        if (this._bitsPerPixel === 16) {
          this._alphaMask = 0xff000000;
          this._alphaShift = 24;
          this._alphaScale = 1.0;
        } else {
          this._alphaMask = 0xff000000;
          this._alphaShift = 24;
          this._alphaScale = 1.0;
        }
      }
    } else {
      if (this._bitsPerPixel === 16) {
        this._redMask = 0x7c00;
        this._redShift = 10;
        const redDepth = this._redMask >>> this._redShift;
        this._redScale = redDepth > 0 ? maxChannelValue / redDepth : 0;

        this._greenMask = 0x03e0;
        this._greenShift = 5;
        const greenDepth = this._greenMask >>> this._greenShift;
        this._greenScale = redDepth > 0 ? maxChannelValue / greenDepth : 0;

        this._blueMask = 0x001f;
        this._blueShift = 0;
        const blueDepth = this._blueMask >>> this._blueShift;
        this._blueScale = redDepth > 0 ? maxChannelValue / blueDepth : 0;

        this._alphaMask = 0x00000000;
        this._alphaShift = 0;
        this._alphaScale = 0.0;
      } else {
        this._redMask = 0x00ff0000;
        this._redShift = 16;
        this._redScale = 1.0;

        this._greenMask = 0x0000ff00;
        this._greenShift = 8;
        this._greenScale = 1.0;

        this._blueMask = 0x000000ff;
        this._blueShift = 0;
        this._blueScale = 1.0;

        this._alphaMask = 0xff000000;
        this._alphaShift = 24;
        this._alphaScale = 1.0;
      }
    }

    const headerRead = p.offset - this._startPos;

    const remainingHeaderBytes = this._headerSize - headerRead;
    p.skip(remainingHeaderBytes);

    if (this._bitsPerPixel <= 8) {
      this.readPalette(p);
    }
  }

  private readPalette(input: InputBuffer<Uint8Array>): void {
    const numColors =
      this._totalColors === 0 ? 1 << this._bitsPerPixel : this._totalColors;
    const numChannels = 3;
    this._palette = new PaletteUint8(numColors, numChannels);
    for (let i = 0; i < numColors; ++i) {
      const b = input.read();
      const g = input.read();
      const r = input.read();
      // ignored
      const a = input.read();
      this._palette.setRgba(i, r, g, b, a);
    }
  }

  public decodePixel(
    input: InputBuffer<Uint8Array>,
    pixel: (r: number, g: number, b: number, a: number) => void
  ): void {
    if (this._palette !== undefined) {
      if (this._bitsPerPixel === 1) {
        const bi = input.read();
        for (let i = 7; i >= 0; --i) {
          const b = (bi >>> i) & 0x1;
          pixel(b, 0, 0, 0);
        }
        return;
      } else if (this._bitsPerPixel === 2) {
        const bi = input.read();
        for (let i = 6; i >= 0; i -= 2) {
          const b = (bi >>> i) & 0x2;
          pixel(b, 0, 0, 0);
        }
      } else if (this._bitsPerPixel === 4) {
        const bi = input.read();
        const b1 = (bi >>> 4) & 0xf;
        pixel(b1, 0, 0, 0);
        const b2 = bi & 0xf;
        pixel(b2, 0, 0, 0);
        return;
      } else if (this._bitsPerPixel === 8) {
        const b = input.read();
        pixel(b, 0, 0, 0);
        return;
      }
    }

    if (
      this._compression === BmpCompressionMode.bitfields &&
      this._bitsPerPixel === 32
    ) {
      const p = input.readUint32();
      const r = Math.trunc(
        ((p & this._redMask) >>> this._redShift) * this._redScale
      );
      const g = Math.trunc(
        ((p & this._greenMask) >>> this._greenShift) * this._greenScale
      );
      const b = Math.trunc(
        ((p & this._blueMask) >>> this._blueShift) * this._blueScale
      );
      const a = this.ignoreAlphaChannel
        ? 255
        : Math.trunc(
            ((p & this._alphaMask) >>> this._alphaShift) * this._alphaScale
          );
      pixel(r, g, b, a);
      return;
    } else if (
      this._bitsPerPixel === 32 &&
      this._compression === BmpCompressionMode.none
    ) {
      const b = input.read();
      const g = input.read();
      const r = input.read();
      const a = input.read();
      pixel(r, g, b, this.ignoreAlphaChannel ? 255 : a);
      return;
    } else if (this._bitsPerPixel === 24) {
      const b = input.read();
      const g = input.read();
      const r = input.read();
      pixel(r, g, b, 255);
      return;
    } else if (this._bitsPerPixel === 16) {
      const p = input.readUint16();
      const r = Math.trunc(
        ((p & this._redMask) >>> this._redShift) * this._redScale
      );
      const g = Math.trunc(
        ((p & this._greenMask) >>> this._greenShift) * this._greenScale
      );
      const b = Math.trunc(
        ((p & this._blueMask) >>> this._blueShift) * this._blueScale
      );
      const a = this.ignoreAlphaChannel
        ? 255
        : Math.trunc(
            ((p & this._alphaMask) >>> this._alphaShift) * this._alphaScale
          );
      pixel(r, g, b, a);
      return;
    } else {
      throw new LibError(
        `Unsupported bitsPerPixel (${this._bitsPerPixel}) or compression (${this._compression}).`
      );
    }
  }
}
