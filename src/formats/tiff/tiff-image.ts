/** @format */

import { inflate } from 'uzip';
import { BitOperators } from '../../common/bit-operators';
import { Clamp } from '../../common/clamp';
import { Color } from '../../common/color';
import { InputBuffer } from '../../common/input-buffer';
import { MemoryImage } from '../../common/memory-image';
import { ImageError } from '../../error/image-error';
import { Half } from '../../hdr/half';
import { HdrImage } from '../../hdr/hdr-image';
import { HdrSlice } from '../../hdr/hdr-slice';
import { JpegDecoder } from '../jpeg-decoder';
import { TiffBitReader } from './tiff-bit-reader';
import { TiffEntry } from './tiff-entry';
import { TiffFaxDecoder } from './tiff-fax-decoder';
import { LzwDecoder } from './tiff-lzw-decoder';

export class TiffImage {
  // Compression types
  public static readonly COMPRESSION_NONE = 1;
  public static readonly COMPRESSION_CCITT_RLE = 2;
  public static readonly COMPRESSION_CCITT_FAX3 = 3;
  public static readonly COMPRESSION_CCITT_FAX4 = 4;
  public static readonly COMPRESSION_LZW = 5;
  public static readonly COMPRESSION_OLD_JPEG = 6;
  public static readonly COMPRESSION_JPEG = 7;
  public static readonly COMPRESSION_NEXT = 32766;
  public static readonly COMPRESSION_CCITT_RLEW = 32771;
  public static readonly COMPRESSION_PACKBITS = 32773;
  public static readonly COMPRESSION_THUNDERSCAN = 32809;
  public static readonly COMPRESSION_IT8CTPAD = 32895;
  public static readonly COMPRESSION_IT8LW = 32896;
  public static readonly COMPRESSION_IT8MP = 32897;
  public static readonly COMPRESSION_IT8BL = 32898;
  public static readonly COMPRESSION_PIXARFILM = 32908;
  public static readonly COMPRESSION_PIXARLOG = 32909;
  public static readonly COMPRESSION_DEFLATE = 32946;
  public static readonly COMPRESSION_ZIP = 8;
  public static readonly COMPRESSION_DCS = 32947;
  public static readonly COMPRESSION_JBIG = 34661;
  public static readonly COMPRESSION_SGILOG = 34676;
  public static readonly COMPRESSION_SGILOG24 = 34677;
  public static readonly COMPRESSION_JP2000 = 34712;

  // Photometric types
  public static readonly PHOTOMETRIC_BLACKISZERO = 1;
  public static readonly PHOTOMETRIC_RGB = 2;

  // Image types
  public static readonly TYPE_UNSUPPORTED = -1;
  public static readonly TYPE_BILEVEL = 0;
  public static readonly TYPE_GRAY_4BIT = 1;
  public static readonly TYPE_GRAY = 2;
  public static readonly TYPE_GRAY_ALPHA = 3;
  public static readonly TYPE_PALETTE = 4;
  public static readonly TYPE_RGB = 5;
  public static readonly TYPE_RGB_ALPHA = 6;
  public static readonly TYPE_YCBCR_SUB = 7;
  public static readonly TYPE_GENERIC = 8;

  // Sample Formats
  public static readonly FORMAT_UINT = 1;
  public static readonly FORMAT_INT = 2;
  public static readonly FORMAT_FLOAT = 3;

  // Tag types
  public static readonly TAG_ARTIST = 315;
  public static readonly TAG_BITS_PER_SAMPLE = 258;
  public static readonly TAG_CELL_LENGTH = 265;
  public static readonly TAG_CELL_WIDTH = 264;
  public static readonly TAG_COLOR_MAP = 320;
  public static readonly TAG_COMPRESSION = 259;
  public static readonly TAG_DATE_TIME = 306;
  public static readonly TAG_EXIF_IFD = 34665;
  public static readonly TAG_EXTRA_SAMPLES = 338;
  public static readonly TAG_FILL_ORDER = 266;
  public static readonly TAG_FREE_BYTE_COUNTS = 289;
  public static readonly TAG_FREE_OFFSETS = 288;
  public static readonly TAG_GRAY_RESPONSE_CURVE = 291;
  public static readonly TAG_GRAY_RESPONSE_UNIT = 290;
  public static readonly TAG_HOST_COMPUTER = 316;
  public static readonly TAG_ICC_PROFILE = 34675;
  public static readonly TAG_IMAGE_DESCRIPTION = 270;
  public static readonly TAG_IMAGE_LENGTH = 257;
  public static readonly TAG_IMAGE_WIDTH = 256;
  public static readonly TAG_IPTC = 33723;
  public static readonly TAG_MAKE = 271;
  public static readonly TAG_MAX_SAMPLE_VALUE = 281;
  public static readonly TAG_MIN_SAMPLE_VALUE = 280;
  public static readonly TAG_MODEL = 272;
  public static readonly TAG_NEW_SUBFILE_TYPE = 254;
  public static readonly TAG_ORIENTATION = 274;
  public static readonly TAG_PHOTOMETRIC_INTERPRETATION = 262;
  public static readonly TAG_PHOTOSHOP = 34377;
  public static readonly TAG_PLANAR_CONFIGURATION = 284;
  public static readonly TAG_PREDICTOR = 317;
  public static readonly TAG_RESOLUTION_UNIT = 296;
  public static readonly TAG_ROWS_PER_STRIP = 278;
  public static readonly TAG_SAMPLES_PER_PIXEL = 277;
  public static readonly TAG_SOFTWARE = 305;
  public static readonly TAG_STRIP_BYTE_COUNTS = 279;
  public static readonly TAG_STRIP_OFFSETS = 273;
  public static readonly TAG_SUBFILE_TYPE = 255;
  public static readonly TAG_T4_OPTIONS = 292;
  public static readonly TAG_T6_OPTIONS = 293;
  public static readonly TAG_THRESHOLDING = 263;
  public static readonly TAG_TILE_WIDTH = 322;
  public static readonly TAG_TILE_LENGTH = 323;
  public static readonly TAG_TILE_OFFSETS = 324;
  public static readonly TAG_TILE_BYTE_COUNTS = 325;
  public static readonly TAG_SAMPLE_FORMAT = 339;
  public static readonly TAG_XMP = 700;
  public static readonly TAG_X_RESOLUTION = 282;
  public static readonly TAG_Y_RESOLUTION = 283;
  public static readonly TAG_YCBCR_COEFFICIENTS = 529;
  public static readonly TAG_YCBCR_SUBSAMPLING = 530;
  public static readonly TAG_YCBCR_POSITIONING = 531;

  public static readonly TAG_NAME: Map<number, string> = new Map<
    number,
    string
  >([
    [TiffImage.TAG_ARTIST, 'artist'],
    [TiffImage.TAG_BITS_PER_SAMPLE, 'bitsPerSample'],
    [TiffImage.TAG_CELL_LENGTH, 'cellLength'],
    [TiffImage.TAG_CELL_WIDTH, 'cellWidth'],
    [TiffImage.TAG_COLOR_MAP, 'colorMap'],
    [TiffImage.TAG_COMPRESSION, 'compression'],
    [TiffImage.TAG_DATE_TIME, 'dateTime'],
    [TiffImage.TAG_EXIF_IFD, 'exifIFD'],
    [TiffImage.TAG_EXTRA_SAMPLES, 'extraSamples'],
    [TiffImage.TAG_FILL_ORDER, 'fillOrder'],
    [TiffImage.TAG_FREE_BYTE_COUNTS, 'freeByteCounts'],
    [TiffImage.TAG_FREE_OFFSETS, 'freeOffsets'],
    [TiffImage.TAG_GRAY_RESPONSE_CURVE, 'grayResponseCurve'],
    [TiffImage.TAG_GRAY_RESPONSE_UNIT, 'grayResponseUnit'],
    [TiffImage.TAG_HOST_COMPUTER, 'hostComputer'],
    [TiffImage.TAG_ICC_PROFILE, 'iccProfile'],
    [TiffImage.TAG_IMAGE_DESCRIPTION, 'imageDescription'],
    [TiffImage.TAG_IMAGE_LENGTH, 'imageLength'],
    [TiffImage.TAG_IMAGE_WIDTH, 'imageWidth'],
    [TiffImage.TAG_IPTC, 'iptc'],
    [TiffImage.TAG_MAKE, 'make'],
    [TiffImage.TAG_MAX_SAMPLE_VALUE, 'maxSampleValue'],
    [TiffImage.TAG_MIN_SAMPLE_VALUE, 'minSampleValue'],
    [TiffImage.TAG_MODEL, 'model'],
    [TiffImage.TAG_NEW_SUBFILE_TYPE, 'newSubfileType'],
    [TiffImage.TAG_ORIENTATION, 'orientation'],
    [TiffImage.TAG_PHOTOMETRIC_INTERPRETATION, 'photometricInterpretation'],
    [TiffImage.TAG_PHOTOSHOP, 'photoshop'],
    [TiffImage.TAG_PLANAR_CONFIGURATION, 'planarConfiguration'],
    [TiffImage.TAG_PREDICTOR, 'predictor'],
    [TiffImage.TAG_RESOLUTION_UNIT, 'resolutionUnit'],
    [TiffImage.TAG_ROWS_PER_STRIP, 'rowsPerStrip'],
    [TiffImage.TAG_SAMPLES_PER_PIXEL, 'samplesPerPixel'],
    [TiffImage.TAG_SOFTWARE, 'software'],
    [TiffImage.TAG_STRIP_BYTE_COUNTS, 'stripByteCounts'],
    [TiffImage.TAG_STRIP_OFFSETS, 'stropOffsets'],
    [TiffImage.TAG_SUBFILE_TYPE, 'subfileType'],
    [TiffImage.TAG_T4_OPTIONS, 't4Options'],
    [TiffImage.TAG_T6_OPTIONS, 't6Options'],
    [TiffImage.TAG_THRESHOLDING, 'thresholding'],
    [TiffImage.TAG_TILE_WIDTH, 'tileWidth'],
    [TiffImage.TAG_TILE_LENGTH, 'tileLength'],
    [TiffImage.TAG_TILE_OFFSETS, 'tileOffsets'],
    [TiffImage.TAG_TILE_BYTE_COUNTS, 'tileByteCounts'],
    [TiffImage.TAG_XMP, 'xmp'],
    [TiffImage.TAG_X_RESOLUTION, 'xResolution'],
    [TiffImage.TAG_Y_RESOLUTION, 'yResolution'],
    [TiffImage.TAG_YCBCR_COEFFICIENTS, 'yCbCrCoefficients'],
    [TiffImage.TAG_YCBCR_SUBSAMPLING, 'yCbCrSubsampling'],
    [TiffImage.TAG_YCBCR_POSITIONING, 'yCbCrPositioning'],
    [TiffImage.TAG_SAMPLE_FORMAT, 'sampleFormat'],
  ]);

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

  private _photometricType: number | undefined;
  public get photometricType(): number | undefined {
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

  private _sampleFormat = TiffImage.FORMAT_UINT;
  public get sampleFormat(): number {
    return this._sampleFormat;
  }

  private _imageType = TiffImage.TYPE_UNSUPPORTED;
  public get imageType(): number {
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

  private _colorMap: number[] | undefined;
  public get colorMap(): number[] | undefined {
    return this._colorMap;
  }

  // Starting index in the [colorMap] for the red channel.
  private colorMapRed = 0;

  // Starting index in the [colorMap] for the green channel.
  private colorMapGreen = 0;

  // Starting index in the [colorMap] for the blue channel.
  private colorMapBlue = 0;

  private image?: MemoryImage;

  private hdrImage?: HdrImage;

  public get isValid(): boolean {
    return this._width !== 0 && this._height !== 0;
  }

  constructor(p: InputBuffer) {
    const p3 = InputBuffer.from(p);
    const numDirEntries = p.readUint16();
    for (let i = 0; i < numDirEntries; ++i) {
      const tag = p.readUint16();
      const type = p.readUint16();
      const numValues = p.readUint32();
      const entry = new TiffEntry({
        tag: tag,
        type: type,
        numValues: numValues,
        p: p3,
      });

      // The value for the tag is either stored in another location,
      // or within the tag itself (if the size fits in 4 bytes).
      // We're not reading the data here, just storing offsets.
      if (entry.numValues * entry.typeSize > 4) {
        entry.valueOffset = p.readUint32();
      } else {
        entry.valueOffset = p.offset;
        p.offset += 4;
      }

      this._tags.set(entry.tag, entry);

      if (entry.tag === TiffImage.TAG_IMAGE_WIDTH) {
        this._width = entry.readValue();
      } else if (entry.tag === TiffImage.TAG_IMAGE_LENGTH) {
        this._height = entry.readValue();
      } else if (entry.tag === TiffImage.TAG_PHOTOMETRIC_INTERPRETATION) {
        this._photometricType = entry.readValue();
      } else if (entry.tag === TiffImage.TAG_COMPRESSION) {
        this._compression = entry.readValue();
      } else if (entry.tag === TiffImage.TAG_BITS_PER_SAMPLE) {
        this._bitsPerSample = entry.readValue();
      } else if (entry.tag === TiffImage.TAG_SAMPLES_PER_PIXEL) {
        this._samplesPerPixel = entry.readValue();
      } else if (entry.tag === TiffImage.TAG_PREDICTOR) {
        this._predictor = entry.readValue();
      } else if (entry.tag === TiffImage.TAG_SAMPLE_FORMAT) {
        this._sampleFormat = entry.readValue();
      } else if (entry.tag === TiffImage.TAG_COLOR_MAP) {
        this._colorMap = entry.readValues();
        this.colorMapRed = 0;
        this.colorMapGreen = Math.trunc(this._colorMap.length / 3);
        this.colorMapBlue = this.colorMapGreen * 2;
      }
    }

    if (this._width === 0 || this._height === 0) {
      return;
    }

    if (this._colorMap !== undefined && this._bitsPerSample === 8) {
      for (let i = 0, len = this._colorMap.length; i < len; ++i) {
        this._colorMap[i] >>= 8;
      }
    }

    if (this._photometricType === 0) {
      this._isWhiteZero = true;
    }

    if (this.hasTag(TiffImage.TAG_TILE_OFFSETS)) {
      this._tiled = true;
      // Image is in tiled format
      this._tileWidth = this.readTag(TiffImage.TAG_TILE_WIDTH);
      this._tileHeight = this.readTag(TiffImage.TAG_TILE_LENGTH);
      this._tileOffsets = this.readTagList(TiffImage.TAG_TILE_OFFSETS);
      this._tileByteCounts = this.readTagList(TiffImage.TAG_TILE_BYTE_COUNTS);
    } else {
      this._tiled = false;

      this._tileWidth = this.readTag(TiffImage.TAG_TILE_WIDTH, this._width);
      if (!this.hasTag(TiffImage.TAG_ROWS_PER_STRIP)) {
        this._tileHeight = this.readTag(
          TiffImage.TAG_TILE_LENGTH,
          this._height
        );
      } else {
        const l = this.readTag(TiffImage.TAG_ROWS_PER_STRIP);
        let infinity = 1;
        infinity = (infinity << 32) - 1;
        if (l === infinity) {
          // 2^32 - 1 (effectively infinity, entire image is 1 strip)
          this._tileHeight = this._height;
        } else {
          this._tileHeight = l;
        }
      }

      this._tileOffsets = this.readTagList(TiffImage.TAG_STRIP_OFFSETS);
      this._tileByteCounts = this.readTagList(TiffImage.TAG_STRIP_BYTE_COUNTS);
    }

    // Calculate number of tiles and the tileSize in bytes
    this._tilesX = Math.trunc(
      (this._width + this._tileWidth - 1) / this._tileWidth
    );
    this._tilesY = Math.trunc(
      (this._height + this._tileHeight - 1) / this._tileHeight
    );
    this._tileSize = this._tileWidth * this._tileHeight * this._samplesPerPixel;

    this._fillOrder = this.readTag(TiffImage.TAG_FILL_ORDER, 1);
    this._t4Options = this.readTag(TiffImage.TAG_T4_OPTIONS);
    this._t6Options = this.readTag(TiffImage.TAG_T6_OPTIONS);
    this._extraSamples = this.readTag(TiffImage.TAG_EXTRA_SAMPLES);

    // Determine which kind of image we are dealing with.
    switch (this._photometricType) {
      // WhiteIsZero
      case 0:
      // BlackIsZero
      // falls through
      case 1:
        if (this._bitsPerSample === 1 && this._samplesPerPixel === 1) {
          this._imageType = TiffImage.TYPE_BILEVEL;
        } else if (this._bitsPerSample === 4 && this._samplesPerPixel === 1) {
          this._imageType = TiffImage.TYPE_GRAY_4BIT;
        } else if (this._bitsPerSample % 8 === 0) {
          if (this._samplesPerPixel === 1) {
            this._imageType = TiffImage.TYPE_GRAY;
          } else if (this._samplesPerPixel === 2) {
            this._imageType = TiffImage.TYPE_GRAY_ALPHA;
          } else {
            this._imageType = TiffImage.TYPE_GENERIC;
          }
        }
        break;
      // RGB
      case 2:
        if (this._bitsPerSample % 8 === 0) {
          if (this._samplesPerPixel === 3) {
            this._imageType = TiffImage.TYPE_RGB;
          } else if (this._samplesPerPixel === 4) {
            this._imageType = TiffImage.TYPE_RGB_ALPHA;
          } else {
            this._imageType = TiffImage.TYPE_GENERIC;
          }
        }
        break;
      // RGB Palette
      case 3:
        if (
          this._samplesPerPixel === 1 &&
          (this._bitsPerSample === 4 ||
            this._bitsPerSample === 8 ||
            this._bitsPerSample === 16)
        ) {
          this._imageType = TiffImage.TYPE_PALETTE;
        }
        break;
      // Transparency mask
      case 4:
        if (this._bitsPerSample === 1 && this._samplesPerPixel === 1) {
          this._imageType = TiffImage.TYPE_BILEVEL;
        }
        break;
      // YCbCr
      case 6:
        if (
          this._compression === TiffImage.COMPRESSION_JPEG &&
          this._bitsPerSample === 8 &&
          this._samplesPerPixel === 3
        ) {
          this._imageType = TiffImage.TYPE_RGB;
        } else {
          if (this.hasTag(TiffImage.TAG_YCBCR_SUBSAMPLING)) {
            const v = this._tags
              .get(TiffImage.TAG_YCBCR_SUBSAMPLING)!
              .readValues();
            this._chromaSubH = v[0];
            this._chromaSubV = v[1];
          } else {
            this._chromaSubH = 2;
            this._chromaSubV = 2;
          }

          if (this._chromaSubH * this._chromaSubV === 1) {
            this._imageType = TiffImage.TYPE_GENERIC;
          } else if (this._bitsPerSample === 8 && this._samplesPerPixel === 3) {
            this._imageType = TiffImage.TYPE_YCBCR_SUB;
          }
        }
        break;
      // Other including CMYK, CIE L*a*b*, unknown.
      default:
        if (this._bitsPerSample % 8 === 0) {
          this._imageType = TiffImage.TYPE_GENERIC;
        }
        break;
    }
  }

  private readTag(type: number, defaultValue = 0): number {
    if (!this.hasTag(type)) {
      return defaultValue;
    }
    return this._tags.get(type)!.readValue();
  }

  private readTagList(type: number): number[] | undefined {
    if (!this.hasTag(type)) {
      return undefined;
    }
    return this._tags.get(type)!.readValues();
  }

  private decodeBilevelTile(
    p: InputBuffer,
    tileX: number,
    tileY: number
  ): void {
    const tileIndex = tileY * this._tilesX + tileX;
    p.offset = this._tileOffsets![tileIndex];

    const outX = tileX * this._tileWidth;
    const outY = tileY * this._tileHeight;

    const byteCount = this._tileByteCounts![tileIndex];

    let bdata: InputBuffer | undefined = undefined;
    if (this._compression === TiffImage.COMPRESSION_PACKBITS) {
      // Since the decompressed data will still be packed
      // 8 pixels into 1 byte, calculate bytesInThisTile
      let bytesInThisTile = 0;
      if (this._tileWidth % 8 === 0) {
        bytesInThisTile = Math.trunc(this._tileWidth / 8) * this._tileHeight;
      } else {
        bytesInThisTile =
          (Math.trunc(this._tileWidth / 8) + 1) * this._tileHeight;
      }
      bdata = new InputBuffer({
        buffer: new Uint8Array(this._tileWidth * this._tileHeight),
      });
      this.decodePackbits(p, bytesInThisTile, bdata.buffer);
    } else if (this._compression === TiffImage.COMPRESSION_LZW) {
      bdata = new InputBuffer({
        buffer: new Uint8Array(this._tileWidth * this._tileHeight),
      });

      const decoder = new LzwDecoder();
      decoder.decode(InputBuffer.from(p, 0, byteCount), bdata.buffer);

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
              bdata.getByte(count) +
              bdata.getByte(count - this._samplesPerPixel);
            bdata.setByte(count, b);
            count++;
          }
        }
      }
    } else if (this._compression === TiffImage.COMPRESSION_CCITT_RLE) {
      bdata = new InputBuffer({
        buffer: new Uint8Array(this._tileWidth * this._tileHeight),
      });
      try {
        const decoder = new TiffFaxDecoder({
          fillOrder: this._fillOrder,
          width: this._tileWidth,
          height: this._tileHeight,
        });
        decoder.decode1D(bdata, p, 0, this._tileHeight);
      } catch (_) {
        // skip
      }
    } else if (this._compression === TiffImage.COMPRESSION_CCITT_FAX3) {
      bdata = new InputBuffer({
        buffer: new Uint8Array(this._tileWidth * this._tileHeight),
      });
      try {
        const decoder = new TiffFaxDecoder({
          fillOrder: this._fillOrder,
          width: this._tileWidth,
          height: this._tileHeight,
        });
        decoder.decode2D(bdata, p, 0, this._tileHeight, this._t4Options);
      } catch (_) {
        // skip
      }
    } else if (this._compression === TiffImage.COMPRESSION_CCITT_FAX4) {
      bdata = new InputBuffer({
        buffer: new Uint8Array(this._tileWidth * this._tileHeight),
      });
      try {
        const decoder = new TiffFaxDecoder({
          fillOrder: this._fillOrder,
          width: this._tileWidth,
          height: this._tileHeight,
        });
        decoder.decodeT6(bdata, p, 0, this._tileHeight, this._t6Options);
      } catch (_) {
        // skip
      }
    } else if (this._compression === TiffImage.COMPRESSION_ZIP) {
      const data = p.toUint8Array(0, byteCount);
      const outData = inflate(data);
      bdata = new InputBuffer({
        buffer: outData,
      });
    } else if (this._compression === TiffImage.COMPRESSION_DEFLATE) {
      const data = p.toUint8Array(0, byteCount);
      const outData = inflate(data);
      bdata = new InputBuffer({
        buffer: outData,
      });
    } else if (this._compression === TiffImage.COMPRESSION_NONE) {
      bdata = p;
    } else {
      throw new ImageError(
        `Unsupported Compression Type: ${this._compression}`
      );
    }

    const br = new TiffBitReader(bdata);
    const white = this._isWhiteZero ? 0xff000000 : 0xffffffff;
    const black = this._isWhiteZero ? 0xffffffff : 0xff000000;

    const img = this.image!;
    for (let y = 0, py = outY; y < this._tileHeight; ++y, ++py) {
      for (let x = 0, px = outX; x < this._tileWidth; ++x, ++px) {
        if (py >= img.height || px >= img.width) break;
        if (br.readBits(1) === 0) {
          img.setPixel(px, py, black);
        } else {
          img.setPixel(px, py, white);
        }
      }
      br.flushByte();
    }
  }

  private decodeTile(p: InputBuffer, tileX: number, tileY: number): void {
    // Read the data, uncompressing as needed. There are four cases:
    // bilevel, palette-RGB, 4-bit grayscale, and everything else.
    if (this._imageType === TiffImage.TYPE_BILEVEL) {
      this.decodeBilevelTile(p, tileX, tileY);
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

    let bdata: InputBuffer | undefined = undefined;
    if (
      this._bitsPerSample === 8 ||
      this._bitsPerSample === 16 ||
      this._bitsPerSample === 32 ||
      this._bitsPerSample === 64
    ) {
      if (this._compression === TiffImage.COMPRESSION_NONE) {
        bdata = p;
      } else if (this._compression === TiffImage.COMPRESSION_LZW) {
        bdata = new InputBuffer({
          buffer: new Uint8Array(bytesInThisTile),
        });
        const decoder = new LzwDecoder();
        try {
          decoder.decode(InputBuffer.from(p, 0, byteCount), bdata.buffer);
        } catch (e) {
          console.error(e);
        }
        // Horizontal Differencing Predictor
        if (this._predictor === 2) {
          let count = 0;
          for (let j = 0; j < this._tileHeight; j++) {
            count = this._samplesPerPixel * (j * this._tileWidth + 1);
            for (
              let i = this._samplesPerPixel,
                len = this._tileWidth * this._samplesPerPixel;
              i < len;
              i++
            ) {
              const b =
                bdata.getByte(count) +
                bdata.getByte(count - this._samplesPerPixel);
              bdata.setByte(count, b);
              count++;
            }
          }
        }
      } else if (this._compression === TiffImage.COMPRESSION_PACKBITS) {
        bdata = new InputBuffer({
          buffer: new Uint8Array(bytesInThisTile),
        });
        this.decodePackbits(p, bytesInThisTile, bdata.buffer);
      } else if (this._compression === TiffImage.COMPRESSION_DEFLATE) {
        const data = p.toUint8Array(0, byteCount);
        const outData = inflate(data);
        bdata = new InputBuffer({
          buffer: outData,
        });
      } else if (this._compression === TiffImage.COMPRESSION_ZIP) {
        const data = p.toUint8Array(0, byteCount);
        const outData = inflate(data);
        bdata = new InputBuffer({
          buffer: outData,
        });
      } else if (this._compression === TiffImage.COMPRESSION_OLD_JPEG) {
        this.image ??= new MemoryImage({
          width: this._width,
          height: this._height,
        });
        const data = p.toUint8Array(0, byteCount);
        const tile = new JpegDecoder().decodeImage(data);
        if (tile !== undefined) {
          this.jpegToImage(
            tile,
            this.image,
            outX,
            outY,
            this._tileWidth,
            this._tileHeight
          );
        }
        if (this.hdrImage !== undefined) {
          this.hdrImage = HdrImage.fromImage(this.image);
        }
        return;
      } else {
        throw new ImageError(
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
            if (this._sampleFormat === TiffImage.FORMAT_FLOAT) {
              let sample = 0.0;
              if (this._bitsPerSample === 32) {
                sample = bdata.readFloat32();
              } else if (this._bitsPerSample === 64) {
                sample = bdata.readFloat64();
              } else if (this._bitsPerSample === 16) {
                sample = Half.halfToDouble(bdata.readUint16());
              }
              if (this.hdrImage !== undefined) {
                this.hdrImage.setRed(px, py, sample);
              }
              if (this.image !== undefined) {
                const gray = Clamp.clampInt255(sample * 255);
                let c = 0;
                if (
                  this._photometricType === 3 &&
                  this._colorMap !== undefined
                ) {
                  c = Color.getColor(
                    this._colorMap[this.colorMapRed + gray],
                    this._colorMap[this.colorMapGreen + gray],
                    this._colorMap[this.colorMapBlue + gray]
                  );
                } else {
                  c = Color.getColor(gray, gray, gray);
                }
                this.image.setPixel(px, py, c);
              }
            } else {
              let gray = 0;
              if (this._bitsPerSample === 8) {
                gray =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt8()
                    : bdata.readByte();
              } else if (this._bitsPerSample === 16) {
                gray =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt16()
                    : bdata.readUint16();
              } else if (this._bitsPerSample === 32) {
                gray =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt32()
                    : bdata.readUint32();
              }

              if (this.hdrImage !== undefined) {
                this.hdrImage.setRed(px, py, gray);
              }

              if (this.image !== undefined) {
                gray =
                  this._bitsPerSample === 16
                    ? gray >> 8
                    : this._bitsPerSample === 32
                    ? gray >> 24
                    : gray;
                if (this._photometricType === 0) {
                  gray = 255 - gray;
                }

                let c = 0;
                if (
                  this._photometricType === 3 &&
                  this._colorMap !== undefined
                ) {
                  c = Color.getColor(
                    this._colorMap[this.colorMapRed + gray],
                    this._colorMap[this.colorMapGreen + gray],
                    this._colorMap[this.colorMapBlue + gray]
                  );
                } else {
                  c = Color.getColor(gray, gray, gray);
                }

                this.image.setPixel(px, py, c);
              }
            }
          } else if (this._samplesPerPixel === 2) {
            let gray = 0;
            let alpha = 0;
            if (this._bitsPerSample === 8) {
              gray =
                this._sampleFormat === TiffImage.FORMAT_INT
                  ? bdata.readInt8()
                  : bdata.readByte();
              alpha =
                this._sampleFormat === TiffImage.FORMAT_INT
                  ? bdata.readInt8()
                  : bdata.readByte();
            } else if (this._bitsPerSample === 16) {
              gray =
                this._sampleFormat === TiffImage.FORMAT_INT
                  ? bdata.readInt16()
                  : bdata.readUint16();
              alpha =
                this._sampleFormat === TiffImage.FORMAT_INT
                  ? bdata.readInt16()
                  : bdata.readUint16();
            } else if (this._bitsPerSample === 32) {
              gray =
                this._sampleFormat === TiffImage.FORMAT_INT
                  ? bdata.readInt32()
                  : bdata.readUint32();
              alpha =
                this._sampleFormat === TiffImage.FORMAT_INT
                  ? bdata.readInt32()
                  : bdata.readUint32();
            }

            if (this.hdrImage !== undefined) {
              this.hdrImage.setRed(px, py, gray);
              this.hdrImage.setGreen(px, py, alpha);
            }

            if (this.image !== undefined) {
              gray =
                this._bitsPerSample === 16
                  ? gray >> 8
                  : this._bitsPerSample === 32
                  ? gray >> 24
                  : gray;
              alpha =
                this._bitsPerSample === 16
                  ? alpha >> 8
                  : this._bitsPerSample === 32
                  ? alpha >> 24
                  : alpha;
              const c = Color.getColor(gray, gray, gray, alpha);
              this.image.setPixel(px, py, c);
            }
          } else if (this._samplesPerPixel === 3) {
            if (this._sampleFormat === TiffImage.FORMAT_FLOAT) {
              let r = 0.0;
              let g = 0.0;
              let b = 0.0;
              if (this._bitsPerSample === 32) {
                r = bdata.readFloat32();
                g = bdata.readFloat32();
                b = bdata.readFloat32();
              } else if (this._bitsPerSample === 64) {
                r = bdata.readFloat64();
                g = bdata.readFloat64();
                b = bdata.readFloat64();
              } else if (this._bitsPerSample === 16) {
                r = Half.halfToDouble(bdata.readUint16());
                g = Half.halfToDouble(bdata.readUint16());
                b = Half.halfToDouble(bdata.readUint16());
              }
              if (this.hdrImage !== undefined) {
                this.hdrImage.setRed(px, py, r);
                this.hdrImage.setGreen(px, py, g);
                this.hdrImage.setBlue(px, py, b);
              }
              if (this.image !== undefined) {
                const ri = Clamp.clampInt255(r * 255);
                const gi = Clamp.clampInt255(g * 255);
                const bi = Clamp.clampInt255(b * 255);
                const c = Color.getColor(ri, gi, bi);
                this.image.setPixel(px, py, c);
              }
            } else {
              let r = 0;
              let g = 0;
              let b = 0;
              if (this._bitsPerSample === 8) {
                r =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt8()
                    : bdata.readByte();
                g =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt8()
                    : bdata.readByte();
                b =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt8()
                    : bdata.readByte();
              } else if (this._bitsPerSample === 16) {
                r =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt16()
                    : bdata.readUint16();
                g =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt16()
                    : bdata.readUint16();
                b =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt16()
                    : bdata.readUint16();
              } else if (this._bitsPerSample === 32) {
                r =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt32()
                    : bdata.readUint32();
                g =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt32()
                    : bdata.readUint32();
                b =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt32()
                    : bdata.readUint32();
              }

              if (this.hdrImage !== undefined) {
                this.hdrImage.setRed(px, py, r);
                this.hdrImage.setGreen(px, py, g);
                this.hdrImage.setBlue(px, py, b);
              }

              if (this.image !== undefined) {
                r =
                  this._bitsPerSample === 16
                    ? r >> 8
                    : this._bitsPerSample === 32
                    ? r >> 24
                    : r;
                g =
                  this._bitsPerSample === 16
                    ? g >> 8
                    : this._bitsPerSample === 32
                    ? g >> 24
                    : g;
                b =
                  this._bitsPerSample === 16
                    ? b >> 8
                    : this._bitsPerSample === 32
                    ? b >> 24
                    : b;
                const c = Color.getColor(r, g, b);
                this.image.setPixel(px, py, c);
              }
            }
          } else if (this._samplesPerPixel >= 4) {
            if (this._sampleFormat === TiffImage.FORMAT_FLOAT) {
              let r = 0.0;
              let g = 0.0;
              let b = 0.0;
              let a = 0.0;
              if (this._bitsPerSample === 32) {
                r = bdata.readFloat32();
                g = bdata.readFloat32();
                b = bdata.readFloat32();
                a = bdata.readFloat32();
              } else if (this._bitsPerSample === 64) {
                r = bdata.readFloat64();
                g = bdata.readFloat64();
                b = bdata.readFloat64();
                a = bdata.readFloat64();
              } else if (this._bitsPerSample === 16) {
                r = Half.halfToDouble(bdata.readUint16());
                g = Half.halfToDouble(bdata.readUint16());
                b = Half.halfToDouble(bdata.readUint16());
                a = Half.halfToDouble(bdata.readUint16());
              }
              if (this.hdrImage !== undefined) {
                this.hdrImage.setRed(px, py, r);
                this.hdrImage.setGreen(px, py, g);
                this.hdrImage.setBlue(px, py, b);
                this.hdrImage.setAlpha(px, py, a);
              }
              if (this.image !== undefined) {
                const ri = Clamp.clampInt255(r * 255);
                const gi = Clamp.clampInt255(g * 255);
                const bi = Clamp.clampInt255(b * 255);
                const ai = Clamp.clampInt255(a * 255);
                const c = Color.getColor(ri, gi, bi, ai);
                this.image.setPixel(px, py, c);
              }
            } else {
              let r = 0;
              let g = 0;
              let b = 0;
              let a = 0;
              if (this._bitsPerSample === 8) {
                r =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt8()
                    : bdata.readByte();
                g =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt8()
                    : bdata.readByte();
                b =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt8()
                    : bdata.readByte();
                a =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt8()
                    : bdata.readByte();
              } else if (this._bitsPerSample === 16) {
                r =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt16()
                    : bdata.readUint16();
                g =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt16()
                    : bdata.readUint16();
                b =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt16()
                    : bdata.readUint16();
                a =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt16()
                    : bdata.readUint16();
              } else if (this._bitsPerSample === 32) {
                r =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt32()
                    : bdata.readUint32();
                g =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt32()
                    : bdata.readUint32();
                b =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt32()
                    : bdata.readUint32();
                a =
                  this._sampleFormat === TiffImage.FORMAT_INT
                    ? bdata.readInt32()
                    : bdata.readUint32();
              }

              if (this.hdrImage !== undefined) {
                this.hdrImage.setRed(px, py, r);
                this.hdrImage.setGreen(px, py, g);
                this.hdrImage.setBlue(px, py, b);
                this.hdrImage.setAlpha(px, py, a);
              }

              if (this.image !== undefined) {
                r =
                  this._bitsPerSample === 16
                    ? r >> 8
                    : this._bitsPerSample === 32
                    ? r >> 24
                    : r;
                g =
                  this._bitsPerSample === 16
                    ? g >> 8
                    : this._bitsPerSample === 32
                    ? g >> 24
                    : g;
                b =
                  this._bitsPerSample === 16
                    ? b >> 8
                    : this._bitsPerSample === 32
                    ? b >> 24
                    : b;
                a =
                  this._bitsPerSample === 16
                    ? a >> 8
                    : this._bitsPerSample === 32
                    ? a >> 24
                    : a;
                const c = Color.getColor(r, g, b, a);
                this.image.setPixel(px, py, c);
              }
            }
          }
        }
      }
    } else {
      throw new ImageError(`Unsupported bitsPerSample: ${this._bitsPerSample}`);
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
  private decodePackbits(
    data: InputBuffer,
    arraySize: number,
    dst: Uint8Array
  ): void {
    let srcCount = 0;
    let dstCount = 0;

    while (dstCount < arraySize) {
      const b = BitOperators.toInt8(data.getByte(srcCount++));
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
    this.image = new MemoryImage({
      width: this._width,
      height: this._height,
    });
    for (let tileY = 0, ti = 0; tileY < this._tilesY; ++tileY) {
      for (let tileX = 0; tileX < this._tilesX; ++tileX, ++ti) {
        this.decodeTile(p, tileX, tileY);
      }
    }
    return this.image;
  }

  public decodeHdr(p: InputBuffer): HdrImage {
    this.hdrImage = HdrImage.create(
      this._width,
      this._height,
      this._samplesPerPixel,
      this._sampleFormat === TiffImage.FORMAT_UINT
        ? HdrSlice.UINT
        : this._sampleFormat === TiffImage.FORMAT_INT
        ? HdrSlice.INT
        : HdrSlice.FLOAT,
      this._bitsPerSample
    );
    for (let tileY = 0, ti = 0; tileY < this._tilesY; ++tileY) {
      for (let tileX = 0; tileX < this._tilesX; ++tileX, ++ti) {
        this.decodeTile(p, tileX, tileY);
      }
    }
    return this.hdrImage;
  }

  public hasTag(tag: number): boolean {
    return this._tags.has(tag);
  }
}
