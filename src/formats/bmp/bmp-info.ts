/** @format */

import { BitOperators } from '../../common/bit-operators';
import { Color } from '../../common/color';
import { InputBuffer } from '../../common/input-buffer';
import { ImageError } from '../../error/image-error';
import { NotImplementedError } from '../../error/not-implemented-error';
import { DecodeInfo } from '../decode-info';
import { BitmapCompressionMode } from './bitmap-compression-mode';
import { BitmapFileHeader } from './bitmap-file-header';

export class BmpInfo implements DecodeInfo {
  private readonly _width: number = 0;
  public get width(): number {
    return this._width;
  }

  protected readonly _height: number = 0;
  public get height(): number {
    return this._height;
  }

  private readonly _backgroundColor: number = 0xffffffff;
  public get backgroundColor(): number {
    return this._backgroundColor;
  }

  private readonly _numFrames: number = 1;
  public get numFrames(): number {
    return this._numFrames;
  }

  private readonly _fileHeader: BitmapFileHeader;
  public get fileHeader(): BitmapFileHeader {
    return this._fileHeader;
  }

  private readonly _headerSize: number;
  public get headerSize(): number {
    return this._headerSize;
  }

  private readonly _planes: number;
  public get planes(): number {
    return this._planes;
  }

  private readonly _bpp: number;
  public get bpp(): number {
    return this._bpp;
  }

  private readonly _compression: BitmapCompressionMode;
  public get compression(): BitmapCompressionMode {
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

  private readonly _readBottomUp: boolean;
  public get readBottomUp(): boolean {
    return this._readBottomUp;
  }

  private _v5redMask?: number;
  public get v5redMask(): number | undefined {
    return this._v5redMask;
  }

  private _v5greenMask?: number;
  public get v5greenMask(): number | undefined {
    return this._v5greenMask;
  }

  private _v5blueMask?: number;
  public get v5blueMask(): number | undefined {
    return this._v5blueMask;
  }

  private _v5alphaMask?: number;
  public get v5alphaMask(): number | undefined {
    return this._v5alphaMask;
  }

  private _colorPalette?: number[];
  public get colorPalette(): number[] | undefined {
    return this._colorPalette;
  }

  // BITMAPINFOHEADER should (probably) ignore alpha channel altogether.
  // This is the behavior in gimp (?)
  // https://gitlab.gnome.org/GNOME/gimp/-/issues/461#note_208715
  public get ignoreAlphaChannel(): boolean {
    return (
      this._headerSize === 40 ||
      // BITMAPV5HEADER with undefined alpha mask.
      (this._headerSize === 124 && this._v5alphaMask === 0)
    );
  }

  constructor(p: InputBuffer, fileHeader?: BitmapFileHeader) {
    this._fileHeader = fileHeader ?? new BitmapFileHeader(p);
    this._headerSize = p.readUint32();
    this._width = p.readInt32();

    const height = p.readInt32();
    this._readBottomUp = height > 0;
    this._height = Math.abs(height);

    this._planes = p.readUint16();
    this._bpp = p.readUint16();
    this._compression = BmpInfo.intToCompressionMode(p.readUint32());
    this._imageSize = p.readUint32();
    this._xppm = p.readInt32();
    this._yppm = p.readInt32();
    this._totalColors = p.readUint32();
    this._importantColors = p.readUint32();

    if ([1, 4, 8].includes(this._bpp)) {
      this.readPalette(p);
    }
    if (this._headerSize === 124) {
      // BITMAPV5HEADER
      this._v5redMask = p.readUint32();
      this._v5greenMask = p.readUint32();
      this._v5blueMask = p.readUint32();
      this._v5alphaMask = p.readUint32();
    }
  }

  private static intToCompressionMode(
    compIndex: number
  ): BitmapCompressionMode {
    const map = new Map<number, BitmapCompressionMode>([
      [0, BitmapCompressionMode.NONE],
      // [ 1, BitmapCompression.RLE_8 ],
      // [ 2, BitmapCompression.RLE_4 ],
      [3, BitmapCompressionMode.BI_BITFIELDS],
    ]);
    const compression = map.get(compIndex);
    if (compression === undefined) {
      throw new ImageError(
        `Bitmap compression ${compIndex} is not supported yet.`
      );
    }
    return compression;
  }

  private compressionModeToString(): string {
    switch (this._compression) {
      case BitmapCompressionMode.BI_BITFIELDS:
        return 'BI_BITFIELDS';
      case BitmapCompressionMode.NONE:
        return 'none';
    }
    throw new NotImplementedError();
  }

  private readPalette(p: InputBuffer): void {
    const colors = this._totalColors === 0 ? 1 << this._bpp : this._totalColors;
    const colorBytes = this._headerSize === 12 ? 3 : 4;
    const colorPalette: number[] = [];
    for (let i = 0; i < colors; i++) {
      const color = this.readRgba(p, colorBytes === 3 ? 100 : undefined);
      colorPalette.push(color);
    }
    this._colorPalette = colorPalette;
  }

  private readRgba(input: InputBuffer, aDefault?: number): number {
    if (this._readBottomUp) {
      const b = input.readByte();
      const g = input.readByte();
      const r = input.readByte();
      const a = aDefault ?? input.readByte();
      return Color.getColor(r, g, b, this.ignoreAlphaChannel ? 255 : a);
    } else {
      const r = input.readByte();
      const b = input.readByte();
      const g = input.readByte();
      const a = aDefault ?? input.readByte();
      return Color.getColor(r, b, g, this.ignoreAlphaChannel ? 255 : a);
    }
  }

  public decodeRgba(input: InputBuffer, pixel: (color: number) => void): void {
    if (this._colorPalette !== undefined) {
      if (this._bpp === 4) {
        const b = input.readByte();
        const left = b >> 4;
        const right = b & 0x0f;
        pixel(this._colorPalette[left]);
        pixel(this._colorPalette[right]);
        return;
      } else if (this._bpp === 8) {
        const b = input.readByte();
        pixel(this._colorPalette[b]);
        return;
      }
    }
    if (
      this._bpp === 32 &&
      this._compression === BitmapCompressionMode.BI_BITFIELDS
    ) {
      pixel(this.readRgba(input));
      return;
    }
    if (this._bpp === 32 && this._compression === BitmapCompressionMode.NONE) {
      pixel(this.readRgba(input));
      return;
    }
    if (this._bpp === 24) {
      pixel(this.readRgba(input, 255));
      return;
    }
    // If (this.bpp === 16) {
    //   return this._rgbaFrom16(input);
    // }
    throw new ImageError(
      `Unsupported bpp (${this._bpp}) or compression (${this._compression}).`
    );
  }

  // TODO: finish decoding for 16 bit
  // private rgbaFrom16(input: InputBuffer): number[] {
  //   const maskRed = 0x7C00;
  //   const maskGreen = 0x3E0;
  //   const maskBlue = 0x1F;
  //   const pixel = input.readUint16();
  //   return [ (pixel & maskRed), (pixel & maskGreen), (pixel & maskBlue), 0 ];
  // }

  public toString(): string {
    return JSON.stringify(
      {
        headerSize: this._headerSize,
        width: this._width,
        height: this._height,
        planes: this._planes,
        bpp: this._bpp,
        file: this._fileHeader.toJson(),
        compression: this.compressionModeToString(),
        imageSize: this._imageSize,
        xppm: this._xppm,
        yppm: this._yppm,
        totalColors: this._totalColors,
        importantColors: this._importantColors,
        readBottomUp: this._readBottomUp,
        v5redMask: BitOperators.debugBits32(this._v5redMask),
        v5greenMask: BitOperators.debugBits32(this._v5greenMask),
        v5blueMask: BitOperators.debugBits32(this._v5blueMask),
        v5alphaMask: BitOperators.debugBits32(this._v5alphaMask),
      },
      undefined,
      2
    );
  }
}
