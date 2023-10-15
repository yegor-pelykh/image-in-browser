/** @format */

import { inflate } from 'uzip';
import { ColorUtils } from '../../color/color-utils';
import { Format } from '../../color/format';
import { ArrayUtils } from '../../common/array-utils';
import { BitUtils } from '../../common/bit-utils';
import { Float16 } from '../../common/float16';
import { InputBuffer } from '../../common/input-buffer';
import { LibError } from '../../error/lib-error';
import { ExifTagNameToID } from '../../exif/exif-tag';
import { IfdValueType, IfdValueTypeSize } from '../../exif/ifd-value-type';
import { MemoryImage } from '../../image/image';
import { JpegDecoder } from '../jpeg-decoder';
import { TiffBitReader } from './tiff-bit-reader';
import { TiffCompression } from './tiff-compression';
import { TiffEntry } from './tiff-entry';
import { TiffFaxDecoder } from './tiff-fax-decoder';
import { TiffFormat } from './tiff-format';
import { TiffImageType } from './tiff-image-type';
import { LzwDecoder } from './tiff-lzw-decoder';
import {
  TiffPhotometricType,
  TiffPhotometricTypeLength,
} from './tiff-photometric-type';

export class TiffImage {
  private readonly _tags: Map<number, TiffEntry> = new Map<number, TiffEntry>();
  public get tags(): Map<number, TiffEntry> {
    return this._tags;
  }

  private readonly _width: number = 0;
  public get width(): number {
    return this._width;
  }

  private readonly _height: number = 0;
  public get height(): number {
    return this._height;
  }

  private _photometricType: TiffPhotometricType = TiffPhotometricType.unknown;
  public get photometricType(): TiffPhotometricType {
    return this._photometricType;
  }

  private _compression = 1;
  public get compression(): number {
    return this._compression;
  }

  private _bitsPerSample = 1;
  public get bitsPerSample(): number {
    return this._bitsPerSample;
  }

  private _samplesPerPixel = 1;
  public get samplesPerPixel(): number {
    return this._samplesPerPixel;
  }

  private _sampleFormat: TiffFormat = TiffFormat.uint;
  public get sampleFormat(): TiffFormat {
    return this._sampleFormat;
  }

  private _imageType: TiffImageType = TiffImageType.invalid;
  public get imageType(): TiffImageType {
    return this._imageType;
  }

  private _isWhiteZero = false;
  public get isWhiteZero(): boolean {
    return this._isWhiteZero;
  }

  private _predictor = 1;
  public get predictor(): number {
    return this._predictor;
  }

  private _chromaSubH = 0;
  public get chromaSubH(): number {
    return this._chromaSubH;
  }

  private _chromaSubV = 0;
  public get chromaSubV(): number {
    return this._chromaSubV;
  }

  private _tiled = false;
  public get tiled(): boolean {
    return this._tiled;
  }

  private _tileWidth = 0;
  public get tileWidth(): number {
    return this._tileWidth;
  }

  private _tileHeight = 0;
  public get tileHeight(): number {
    return this._tileHeight;
  }

  private _tileOffsets: number[] | undefined;
  public get tileOffsets(): number[] | undefined {
    return this._tileOffsets;
  }

  private _tileByteCounts: number[] | undefined;
  public get tileByteCounts(): number[] | undefined {
    return this._tileByteCounts;
  }

  private _tilesX = 0;
  public get tilesX(): number {
    return this._tilesX;
  }

  private _tilesY = 0;
  public get tilesY(): number {
    return this._tilesY;
  }

  private _tileSize: number | undefined;
  public get tileSize(): number | undefined {
    return this._tileSize;
  }

  private _fillOrder = 1;
  public get fillOrder(): number {
    return this._fillOrder;
  }

  private _t4Options = 0;
  public get t4Options(): number {
    return this._t4Options;
  }

  private _t6Options = 0;
  public get t6Options(): number {
    return this._t6Options;
  }

  private _extraSamples: number | undefined;
  public get extraSamples(): number | undefined {
    return this._extraSamples;
  }

  private _colorMapSamples = 0;
  public get colorMapSamples(): number {
    return this._colorMapSamples;
  }

  private _colorMap: Uint16Array | undefined;
  public get colorMap(): Uint16Array | undefined {
    return this._colorMap;
  }

  // Starting index in the [colorMap] for the red channel.
  private _colorMapRed = 0;

  // Starting index in the [colorMap] for the green channel.
  private _colorMapGreen = 0;

  // Starting index in the [colorMap] for the blue channel.
  private _colorMapBlue = 0;

  public get isValid(): boolean {
    return this._width !== 0 && this._height !== 0;
  }

  constructor(p: InputBuffer) {
    const p3 = InputBuffer.from(p);

    const numDirEntries = p.readUint16();
    for (let i = 0; i < numDirEntries; ++i) {
      const tag = p.readUint16();
      const ti = p.readUint16();
      const type = ti as IfdValueType;
      const typeSize = IfdValueTypeSize[ti];
      const count = p.readUint32();
      let valueOffset = 0;
      // The value for the tag is either stored in another location,
      // or within the tag itself (if the size fits in 4 bytes).
      // We're not reading the data here, just storing offsets.
      if (count * typeSize > 4) {
        valueOffset = p.readUint32();
      } else {
        valueOffset = p.offset;
        p.skip(4);
      }

      const entry = new TiffEntry({
        tag: tag,
        type: type,
        count: count,
        p: p3,
        valueOffset: valueOffset,
      });

      this._tags.set(entry.tag, entry);

      if (tag === ExifTagNameToID.get('ImageWidth')) {
        this._width = entry.read()?.toInt() ?? 0;
      } else if (tag === ExifTagNameToID.get('ImageLength')) {
        this._height = entry.read()?.toInt() ?? 0;
      } else if (tag === ExifTagNameToID.get('PhotometricInterpretation')) {
        const v = entry.read();
        if (v === undefined) {
          this._photometricType = TiffPhotometricType.unknown;
        } else {
          const pt = v.toInt();
          if (pt < TiffPhotometricTypeLength) {
            this._photometricType = pt as TiffPhotometricType;
          } else {
            this._photometricType = TiffPhotometricType.unknown;
          }
        }
      } else if (tag === ExifTagNameToID.get('Compression')) {
        this._compression = entry.read()?.toInt() ?? 0;
      } else if (tag === ExifTagNameToID.get('BitsPerSample')) {
        this._bitsPerSample = entry.read()?.toInt() ?? 0;
      } else if (tag === ExifTagNameToID.get('SamplesPerPixel')) {
        this._samplesPerPixel = entry.read()?.toInt() ?? 0;
      } else if (tag === ExifTagNameToID.get('Predictor')) {
        this._predictor = entry.read()?.toInt() ?? 0;
      } else if (tag === ExifTagNameToID.get('SampleFormat')) {
        const v = entry.read()?.toInt() ?? 0;
        this._sampleFormat = v as TiffFormat;
      } else if (tag === ExifTagNameToID.get('ColorMap')) {
        const v = entry.read();
        if (v !== undefined) {
          this._colorMap = new Uint16Array(v.toData().buffer);
          this._colorMapRed = 0;
          this._colorMapGreen = Math.trunc(this._colorMap.length / 3);
          this._colorMapBlue = this._colorMapGreen * 2;
        }
      }
    }

    if (
      this._colorMap !== undefined &&
      this._photometricType === TiffPhotometricType.palette
    ) {
      // Only support RGB palettes.
      this._colorMapSamples = 3;
      this._samplesPerPixel = 1;
    }

    if (this._width === 0 || this._height === 0) {
      return;
    }

    if (this._colorMap !== undefined && this._bitsPerSample === 8) {
      const cm = this._colorMap;
      const len = cm.length;
      for (let i = 0; i < len; ++i) {
        cm[i] >>>= 8;
      }
    }

    if (this._photometricType === TiffPhotometricType.whiteIsZero) {
      this._isWhiteZero = true;
    }

    if (this.hasTag(ExifTagNameToID.get('TileOffsets')!)) {
      this._tiled = true;
      // Image is in tiled format
      this._tileWidth = this.readTag(ExifTagNameToID.get('TileWidth')!);
      this._tileHeight = this.readTag(ExifTagNameToID.get('TileLength')!);
      this._tileOffsets = this.readTagList(ExifTagNameToID.get('TileOffsets')!);
      this._tileByteCounts = this.readTagList(
        ExifTagNameToID.get('TileByteCounts')!
      );
    } else {
      this._tiled = false;

      this._tileWidth = this.readTag(
        ExifTagNameToID.get('TileWidth')!,
        this._width
      );
      if (!this.hasTag(ExifTagNameToID.get('RowsPerStrip')!)) {
        this._tileHeight = this.readTag(
          ExifTagNameToID.get('TileLength')!,
          this._height
        );
      } else {
        const l = this.readTag(ExifTagNameToID.get('RowsPerStrip')!);
        let infinity = 1;
        infinity = (infinity << 32) - 1;
        if (l === infinity) {
          // 2^32 - 1 (effectively infinity, entire image is 1 strip)
          this._tileHeight = this._height;
        } else {
          this._tileHeight = l;
        }
      }

      this._tileOffsets = this.readTagList(
        ExifTagNameToID.get('StripOffsets')!
      );
      this._tileByteCounts = this.readTagList(
        ExifTagNameToID.get('StripByteCounts')!
      );
    }

    // Calculate number of tiles and the tileSize in bytes
    this._tilesX = Math.trunc(
      (this._width + this._tileWidth - 1) / this._tileWidth
    );
    this._tilesY = Math.trunc(
      (this._height + this._tileHeight - 1) / this._tileHeight
    );
    this._tileSize = this._tileWidth * this._tileHeight * this._samplesPerPixel;

    this._fillOrder = this.readTag(ExifTagNameToID.get('FillOrder')!, 1);
    this._t4Options = this.readTag(ExifTagNameToID.get('T4Options')!);
    this._t6Options = this.readTag(ExifTagNameToID.get('T6Options')!);
    this._extraSamples = this.readTag(ExifTagNameToID.get('ExtraSamples')!);

    // Determine which kind of image we are dealing with.
    switch (this._photometricType) {
      case TiffPhotometricType.whiteIsZero:
      case TiffPhotometricType.blackIsZero:
        if (this._bitsPerSample === 1 && this._samplesPerPixel === 1) {
          this._imageType = TiffImageType.bilevel;
        } else if (this._bitsPerSample === 4 && this._samplesPerPixel === 1) {
          this._imageType = TiffImageType.gray4bit;
        } else if (this._bitsPerSample % 8 === 0) {
          if (this._samplesPerPixel === 1) {
            this._imageType = TiffImageType.gray;
          } else if (this._samplesPerPixel === 2) {
            this._imageType = TiffImageType.grayAlpha;
          } else {
            this._imageType = TiffImageType.generic;
          }
        }
        break;
      case TiffPhotometricType.rgb:
        if (this._bitsPerSample % 8 === 0) {
          if (this._samplesPerPixel === 3) {
            this._imageType = TiffImageType.rgb;
          } else if (this._samplesPerPixel === 4) {
            this._imageType = TiffImageType.rgba;
          } else {
            this._imageType = TiffImageType.generic;
          }
        }
        break;
      case TiffPhotometricType.palette:
        if (
          this._samplesPerPixel === 1 &&
          this._colorMap !== undefined &&
          (this._bitsPerSample === 4 ||
            this._bitsPerSample === 8 ||
            this._bitsPerSample === 16)
        ) {
          this._imageType = TiffImageType.palette;
        }
        break;
      case TiffPhotometricType.transparencyMask:
        // Transparency mask
        if (this._bitsPerSample === 1 && this._samplesPerPixel === 1) {
          this._imageType = TiffImageType.bilevel;
        }
        break;
      case TiffPhotometricType.yCbCr:
        if (
          this._compression === TiffCompression.jpeg &&
          this._bitsPerSample === 8 &&
          this._samplesPerPixel === 3
        ) {
          this._imageType = TiffImageType.rgb;
        } else {
          if (this.hasTag(ExifTagNameToID.get('YCbCrSubSampling')!)) {
            const s = ExifTagNameToID.get('YCbCrSubSampling')!;
            const v = this._tags.get(s)!.read()!;
            this._chromaSubH = v.toInt();
            this._chromaSubV = v.toInt(1);
          } else {
            this._chromaSubH = 2;
            this._chromaSubV = 2;
          }

          if (this._chromaSubH * this._chromaSubV === 1) {
            this._imageType = TiffImageType.generic;
          } else if (this._bitsPerSample === 8 && this._samplesPerPixel === 3) {
            this._imageType = TiffImageType.yCbCrSub;
          }
        }
        break;
      default:
        // Other including CMYK, CIE L*a*b*, unknown.
        if (this._bitsPerSample % 8 === 0) {
          this._imageType = TiffImageType.generic;
        }
        break;
    }
  }

  private readTag(type: number, defaultValue = 0): number {
    if (!this.hasTag(type)) {
      return defaultValue;
    }
    return this._tags.get(type)!.read()?.toInt() ?? 0;
  }

  private readTagList(type: number): number[] | undefined {
    if (!this.hasTag(type)) {
      return undefined;
    }
    const tag = this._tags.get(type)!;
    const value = tag.read()!;
    return ArrayUtils.generate<number>(tag.count, (i) => value.toInt(i));
  }

  private decodeBilevelTile(
    p: InputBuffer,
    image: MemoryImage,
    tileX: number,
    tileY: number
  ): void {
    const tileIndex = tileY * this._tilesX + tileX;
    p.offset = this._tileOffsets![tileIndex];

    const outX = tileX * this._tileWidth;
    const outY = tileY * this._tileHeight;

    const byteCount = this._tileByteCounts![tileIndex];

    let byteData: InputBuffer | undefined = undefined;
    if (this._compression === TiffCompression.packBits) {
      // Since the decompressed data will still be packed
      // 8 pixels into 1 byte, calculate bytesInThisTile
      let bytesInThisTile = 0;
      if (this._tileWidth % 8 === 0) {
        bytesInThisTile = Math.trunc(this._tileWidth / 8) * this._tileHeight;
      } else {
        bytesInThisTile =
          (Math.trunc(this._tileWidth / 8) + 1) * this._tileHeight;
      }
      byteData = new InputBuffer({
        buffer: new Uint8Array(this._tileWidth * this._tileHeight),
      });
      this.decodePackBits(p, bytesInThisTile, byteData.buffer);
    } else if (this._compression === TiffCompression.lzw) {
      byteData = new InputBuffer({
        buffer: new Uint8Array(this._tileWidth * this._tileHeight),
      });

      const decoder = new LzwDecoder();
      decoder.decode(InputBuffer.from(p, 0, byteCount), byteData.buffer);

      // Horizontal Differencing Predictor
      if (this._predictor === 2) {
        let count = 0;
        for (let j = 0; j < this._height; j++) {
          count = this._samplesPerPixel * (j * this._width + 1);
          for (
            let i = this._samplesPerPixel;
            i < this._width * this._samplesPerPixel;
            i++
          ) {
            const b =
              byteData.getByte(count) +
              byteData.getByte(count - this._samplesPerPixel);
            byteData.setByte(count, b);
            count++;
          }
        }
      }
    } else if (this._compression === TiffCompression.ccittRle) {
      byteData = new InputBuffer({
        buffer: new Uint8Array(this._tileWidth * this._tileHeight),
      });
      try {
        const decoder = new TiffFaxDecoder({
          fillOrder: this._fillOrder,
          width: this._tileWidth,
          height: this._tileHeight,
        });
        decoder.decode1D(byteData, p, 0, this._tileHeight);
      } catch (_) {
        // skip
      }
    } else if (this._compression === TiffCompression.ccittFax3) {
      byteData = new InputBuffer({
        buffer: new Uint8Array(this._tileWidth * this._tileHeight),
      });
      try {
        const decoder = new TiffFaxDecoder({
          fillOrder: this._fillOrder,
          width: this._tileWidth,
          height: this._tileHeight,
        });
        decoder.decode2D(byteData, p, 0, this._tileHeight, this._t4Options);
      } catch (_) {
        // skip
      }
    } else if (this._compression === TiffCompression.ccittFax4) {
      byteData = new InputBuffer({
        buffer: new Uint8Array(this._tileWidth * this._tileHeight),
      });
      try {
        const decoder = new TiffFaxDecoder({
          fillOrder: this._fillOrder,
          width: this._tileWidth,
          height: this._tileHeight,
        });
        decoder.decodeT6(byteData, p, 0, this._tileHeight, this._t6Options);
      } catch (_) {
        // skip
      }
    } else if (this._compression === TiffCompression.zip) {
      const data = p.toUint8Array(0, byteCount);
      const outData = inflate(data);
      byteData = new InputBuffer({
        buffer: outData,
      });
    } else if (this._compression === TiffCompression.deflate) {
      const data = p.toUint8Array(0, byteCount);
      const outData = inflate(data);
      byteData = new InputBuffer({
        buffer: outData,
      });
    } else if (this._compression === TiffCompression.none) {
      byteData = p;
    } else {
      throw new LibError(`Unsupported Compression Type: ${this._compression}`);
    }

    const br = new TiffBitReader(byteData);
    const mx = image.maxChannelValue;
    const black = this._isWhiteZero ? mx : 0;
    const white = this._isWhiteZero ? 0 : mx;

    for (let y = 0, py = outY; y < this._tileHeight; ++y, ++py) {
      for (let x = 0, px = outX; x < this._tileWidth; ++x, ++px) {
        if (py >= image.height || px >= image.width) break;
        if (br.readBits(1) === 0) {
          image.setPixelRgb(px, py, black, 0, 0);
        } else {
          image.setPixelRgb(px, py, white, 0, 0);
        }
      }
      br.flushByte();
    }
  }

  private decodeTile(
    p: InputBuffer,
    image: MemoryImage,
    tileX: number,
    tileY: number
  ): void {
    // Read the data, uncompressing as needed. There are four cases:
    // bilevel, palette-RGB, 4-bit grayscale, and everything else.
    if (this._imageType === TiffImageType.bilevel) {
      this.decodeBilevelTile(p, image, tileX, tileY);
      return;
    }

    const tileIndex = tileY * this._tilesX + tileX;
    p.offset = this._tileOffsets![tileIndex];

    const outX = tileX * this._tileWidth;
    const outY = tileY * this._tileHeight;

    const byteCount = this._tileByteCounts![tileIndex];
    let bytesInThisTile =
      this._tileWidth * this._tileHeight * this._samplesPerPixel;
    if (this._bitsPerSample === 16) {
      bytesInThisTile *= 2;
    } else if (this._bitsPerSample === 32) {
      bytesInThisTile *= 4;
    }

    let byteData: InputBuffer | undefined = undefined;
    if (
      this._bitsPerSample === 8 ||
      this._bitsPerSample === 16 ||
      this._bitsPerSample === 32 ||
      this._bitsPerSample === 64
    ) {
      if (this._compression === TiffCompression.none) {
        byteData = p;
      } else if (this._compression === TiffCompression.lzw) {
        byteData = new InputBuffer({
          buffer: new Uint8Array(bytesInThisTile),
        });
        const decoder = new LzwDecoder();
        try {
          decoder.decode(InputBuffer.from(p, 0, byteCount), byteData.buffer);
        } catch (e) {
          // ignore
        }
        // Horizontal Differencing Predictor
        if (this._predictor === 2) {
          let count = 0;
          for (let j = 0; j < this._tileHeight; j++) {
            count = this._samplesPerPixel * (j * this._tileWidth + 1);
            const len = this._tileWidth * this._samplesPerPixel;
            for (let i = this._samplesPerPixel; i < len; i++) {
              byteData.setByte(
                count,
                byteData.getByte(count) +
                  byteData.getByte(count - this._samplesPerPixel)
              );
              count++;
            }
          }
        }
      } else if (this._compression === TiffCompression.packBits) {
        byteData = new InputBuffer({
          buffer: new Uint8Array(bytesInThisTile),
        });
        this.decodePackBits(p, bytesInThisTile, byteData.buffer);
      } else if (this._compression === TiffCompression.deflate) {
        const data = p.toUint8Array(0, byteCount);
        const outData = inflate(data);
        byteData = new InputBuffer({
          buffer: outData,
        });
      } else if (this._compression === TiffCompression.zip) {
        const data = p.toUint8Array(0, byteCount);
        const outData = inflate(data);
        byteData = new InputBuffer({
          buffer: outData,
        });
      } else if (this._compression === TiffCompression.oldJpeg) {
        const data = p.toUint8Array(0, byteCount);
        const tile = new JpegDecoder().decode({
          bytes: data,
        });
        if (tile !== undefined) {
          this.jpegToImage(
            tile,
            image,
            outX,
            outY,
            this._tileWidth,
            this._tileHeight
          );
        }
        return;
      } else {
        throw new LibError(
          `Unsupported Compression Type: ${this._compression}`
        );
      }

      for (
        let y = 0, py = outY;
        y < this._tileHeight && py < this._height;
        ++y, ++py
      ) {
        for (
          let x = 0, px = outX;
          x < this._tileWidth && px < this._width;
          ++x, ++px
        ) {
          if (this._samplesPerPixel === 1) {
            if (this._sampleFormat === TiffFormat.float) {
              let sample = 0;
              if (this._bitsPerSample === 32) {
                sample = byteData.readFloat32();
              } else if (this._bitsPerSample === 64) {
                sample = byteData.readFloat64();
              } else if (this._bitsPerSample === 16) {
                sample = Float16.float16ToDouble(byteData.readUint16());
              }
              image.setPixelR(px, py, sample);
            } else {
              let sample = 0;
              if (this._bitsPerSample === 8) {
                sample =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt8()
                    : byteData.readByte();
              } else if (this._bitsPerSample === 16) {
                sample =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt16()
                    : byteData.readUint16();
              } else if (this._bitsPerSample === 32) {
                sample =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt32()
                    : byteData.readUint32();
              }

              if (this._photometricType === TiffPhotometricType.whiteIsZero) {
                const mx = Math.trunc(image.maxChannelValue);
                sample = mx - sample;
              }

              image.setPixelR(px, py, sample);
            }
          } else if (this._samplesPerPixel === 2) {
            let gray = 0;
            let alpha = 0;
            if (this._bitsPerSample === 8) {
              gray =
                this._sampleFormat === TiffFormat.int
                  ? byteData.readInt8()
                  : byteData.readByte();
              alpha =
                this._sampleFormat === TiffFormat.int
                  ? byteData.readInt8()
                  : byteData.readByte();
            } else if (this._bitsPerSample === 16) {
              gray =
                this._sampleFormat === TiffFormat.int
                  ? byteData.readInt16()
                  : byteData.readUint16();
              alpha =
                this._sampleFormat === TiffFormat.int
                  ? byteData.readInt16()
                  : byteData.readUint16();
            } else if (this._bitsPerSample === 32) {
              gray =
                this._sampleFormat === TiffFormat.int
                  ? byteData.readInt32()
                  : byteData.readUint32();
              alpha =
                this._sampleFormat === TiffFormat.int
                  ? byteData.readInt32()
                  : byteData.readUint32();
            }

            image.setPixelRgb(px, py, gray, alpha, 0);
          } else if (this._samplesPerPixel === 3) {
            if (this._sampleFormat === TiffFormat.float) {
              let r = 0.0;
              let g = 0.0;
              let b = 0.0;
              if (this._bitsPerSample === 32) {
                r = byteData.readFloat32();
                g = byteData.readFloat32();
                b = byteData.readFloat32();
              } else if (this._bitsPerSample === 64) {
                r = byteData.readFloat64();
                g = byteData.readFloat64();
                b = byteData.readFloat64();
              } else if (this._bitsPerSample === 16) {
                r = Float16.float16ToDouble(byteData.readUint16());
                g = Float16.float16ToDouble(byteData.readUint16());
                b = Float16.float16ToDouble(byteData.readUint16());
              }
              image.setPixelRgb(px, py, r, g, b);
            } else {
              let r = 0;
              let g = 0;
              let b = 0;
              if (this._bitsPerSample === 8) {
                r =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt8()
                    : byteData.readByte();
                g =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt8()
                    : byteData.readByte();
                b =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt8()
                    : byteData.readByte();
              } else if (this._bitsPerSample === 16) {
                r =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt16()
                    : byteData.readUint16();
                g =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt16()
                    : byteData.readUint16();
                b =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt16()
                    : byteData.readUint16();
              } else if (this._bitsPerSample === 32) {
                r =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt32()
                    : byteData.readUint32();
                g =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt32()
                    : byteData.readUint32();
                b =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt32()
                    : byteData.readUint32();
              }

              image.setPixelRgb(px, py, r, g, b);
            }
          } else if (this._samplesPerPixel >= 4) {
            if (this._sampleFormat === TiffFormat.float) {
              let r = 0.0;
              let g = 0.0;
              let b = 0.0;
              let a = 0.0;
              if (this._bitsPerSample === 32) {
                r = byteData.readFloat32();
                g = byteData.readFloat32();
                b = byteData.readFloat32();
                a = byteData.readFloat32();
              } else if (this._bitsPerSample === 64) {
                r = byteData.readFloat64();
                g = byteData.readFloat64();
                b = byteData.readFloat64();
                a = byteData.readFloat64();
              } else if (this._bitsPerSample === 16) {
                r = Float16.float16ToDouble(byteData.readUint16());
                g = Float16.float16ToDouble(byteData.readUint16());
                b = Float16.float16ToDouble(byteData.readUint16());
                a = Float16.float16ToDouble(byteData.readUint16());
              }
              image.setPixelRgba(px, py, r, g, b, a);
            } else {
              let r = 0;
              let g = 0;
              let b = 0;
              let a = 0;
              if (this._bitsPerSample === 8) {
                r =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt8()
                    : byteData.readByte();
                g =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt8()
                    : byteData.readByte();
                b =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt8()
                    : byteData.readByte();
                a =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt8()
                    : byteData.readByte();
              } else if (this._bitsPerSample === 16) {
                r =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt16()
                    : byteData.readUint16();
                g =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt16()
                    : byteData.readUint16();
                b =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt16()
                    : byteData.readUint16();
                a =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt16()
                    : byteData.readUint16();
              } else if (this._bitsPerSample === 32) {
                r =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt32()
                    : byteData.readUint32();
                g =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt32()
                    : byteData.readUint32();
                b =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt32()
                    : byteData.readUint32();
                a =
                  this._sampleFormat === TiffFormat.int
                    ? byteData.readInt32()
                    : byteData.readUint32();
              }

              if (this._photometricType === TiffPhotometricType.cmyk) {
                const rgba = ColorUtils.cmykToRgb(r, g, b, a);
                r = rgba[0];
                g = rgba[1];
                b = rgba[2];
                a = Math.trunc(image.maxChannelValue);
              }

              image.setPixelRgba(px, py, r, g, b, a);
            }
          }
        }
      }
    } else {
      throw new LibError(`Unsupported bitsPerSample: ${this._bitsPerSample}`);
    }
  }

  private jpegToImage(
    tile: MemoryImage,
    image: MemoryImage,
    outX: number,
    outY: number,
    tileWidth: number,
    tileHeight: number
  ): void {
    const width = tileWidth;
    const height = tileHeight;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        image.setPixel(x + outX, y + outY, tile.getPixel(x, y));
      }
    }
  }

  /**
   * Uncompress packbits compressed image data.
   */
  private decodePackBits(
    data: InputBuffer,
    arraySize: number,
    dst: Uint8Array
  ): void {
    let srcCount = 0;
    let dstCount = 0;

    while (dstCount < arraySize) {
      const b = BitUtils.uint8ToInt8(data.getByte(srcCount++));
      if (b >= 0 && b <= 127) {
        // literal run packet
        for (let i = 0; i < b + 1; ++i) {
          dst[dstCount++] = data.getByte(srcCount++);
        }
      } else if (b <= -1 && b >= -127) {
        // 2 byte encoded run packet
        const repeat = data.getByte(srcCount++);
        for (let i = 0; i < -b + 1; ++i) {
          dst[dstCount++] = repeat;
        }
      } else {
        // no-op packet. Do nothing
        srcCount++;
      }
    }
  }

  public decode(p: InputBuffer): MemoryImage {
    const isFloat = this._sampleFormat === TiffFormat.float;
    const isInt = this._sampleFormat === TiffFormat.int;
    const format =
      this._bitsPerSample === 1
        ? Format.uint1
        : this._bitsPerSample === 2
        ? Format.uint2
        : this._bitsPerSample === 4
        ? Format.uint4
        : isFloat && this._bitsPerSample === 16
        ? Format.float16
        : isFloat && this._bitsPerSample === 32
        ? Format.float32
        : isFloat && this._bitsPerSample === 64
        ? Format.float64
        : isInt && this._bitsPerSample === 8
        ? Format.int8
        : isInt && this._bitsPerSample === 16
        ? Format.int16
        : isInt && this._bitsPerSample === 32
        ? Format.int32
        : this._bitsPerSample === 16
        ? Format.uint16
        : this._bitsPerSample === 32
        ? Format.uint32
        : Format.uint8;
    const hasPalette =
      this._colorMap !== undefined &&
      this._photometricType === TiffPhotometricType.palette;
    const numChannels = hasPalette ? 3 : this._samplesPerPixel;

    const image = new MemoryImage({
      width: this._width,
      height: this._height,
      format: format,
      numChannels: numChannels,
      withPalette: hasPalette,
    });

    if (hasPalette) {
      const p = image.palette!;
      const cm = this._colorMap!;
      const numChannels = 3;
      // Only support RGB palettes
      const numColors = Math.trunc(cm.length / numChannels);
      for (let i = 0; i < numColors; ++i) {
        p.setRgb(
          i,
          cm[this._colorMapRed + i],
          cm[this._colorMapGreen + i],
          cm[this._colorMapBlue + i]
        );
      }
    }

    for (let tileY = 0, ti = 0; tileY < this._tilesY; ++tileY) {
      for (let tileX = 0; tileX < this._tilesX; ++tileX, ++ti) {
        this.decodeTile(p, image, tileX, tileY);
      }
    }

    return image;
  }

  public hasTag(tag: number): boolean {
    return this._tags.has(tag);
  }
}
