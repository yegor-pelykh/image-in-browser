/** @format */

import { ColorUtils } from '../../color/color-utils.js';
import { ArrayUtils } from '../../common/array-utils.js';
import { InputBuffer } from '../../common/input-buffer.js';
import { LibError } from '../../error/lib-error.js';
import { MemoryImage } from '../../image/image.js';
import { VP8LBitReader } from './vp8l-bit-reader.js';
import { VP8LColorCache } from './vp8l-color-cache.js';
import { VP8LImageTransformType } from './vp8l-image-transform-type.js';
import { VP8LTransform } from './vp8l-transform.js';
import { WebPFormat } from './webp-format.js';
import { HuffmanTreeGroup } from './webp-huffman-tree-group.js';
import { WebPInfo } from './webp-info.js';
import { StringUtils } from '../../common/string-utils.js';
import { ExifData } from '../../exif/exif-data.js';
import { WebPAlpha } from './webp-alpha.js';
import { HuffmanTables } from './webp-huffman-tables.js';
import { HuffmanCodeList } from './webp-huffman-code-list.js';
import { HuffmanTablesSegment } from './webp-huffman-table-segment.js';
import { HuffmanCode } from './webp-huffman-code.js';
import { HuffmanCode32 } from './webp-huffman-code-32.js';

/** VP8L lossless WebP decoder. */
export class VP8L {
  /** Green color channel index */
  public static readonly green = 0;
  /** Red color channel index */
  public static readonly red = 1;
  /** Blue color channel index */
  public static readonly blue = 2;
  /** Alpha channel index */
  public static readonly alpha = 3;
  /** Distance index */
  public static readonly dist = 4;
  /** Number of ARGB cache rows */
  public static readonly numArgbCacheRows = 16;
  /** Number of code length codes */
  public static readonly numCodeLengthCodes = 19;
  /** Order of code length codes */
  public static readonly codeLengthCodeOrder: number[] = [
    17, 18, 0, 1, 2, 3, 4, 5, 16, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  ];
  public static readonly huffmanTableBits = 8;
  public static readonly codeToPlaneCodes = 120;
  public static readonly codeToPlane: number[] = [
    0x18, 0x07, 0x17, 0x19, 0x28, 0x06, 0x27, 0x29, 0x16, 0x1a, 0x26, 0x2a,
    0x38, 0x05, 0x37, 0x39, 0x15, 0x1b, 0x36, 0x3a, 0x25, 0x2b, 0x48, 0x04,
    0x47, 0x49, 0x14, 0x1c, 0x35, 0x3b, 0x46, 0x4a, 0x24, 0x2c, 0x58, 0x45,
    0x4b, 0x34, 0x3c, 0x03, 0x57, 0x59, 0x13, 0x1d, 0x56, 0x5a, 0x23, 0x2d,
    0x44, 0x4c, 0x55, 0x5b, 0x33, 0x3d, 0x68, 0x02, 0x67, 0x69, 0x12, 0x1e,
    0x66, 0x6a, 0x22, 0x2e, 0x54, 0x5c, 0x43, 0x4d, 0x65, 0x6b, 0x32, 0x3e,
    0x78, 0x01, 0x77, 0x79, 0x53, 0x5d, 0x11, 0x1f, 0x64, 0x6c, 0x42, 0x4e,
    0x76, 0x7a, 0x21, 0x2f, 0x75, 0x7b, 0x31, 0x3f, 0x63, 0x6d, 0x52, 0x5e,
    0x00, 0x74, 0x7c, 0x41, 0x4f, 0x10, 0x20, 0x62, 0x6e, 0x30, 0x73, 0x7d,
    0x51, 0x5f, 0x40, 0x72, 0x7e, 0x61, 0x6f, 0x50, 0x71, 0x7f, 0x60, 0x70,
  ];
  public static readonly lengthsTableBits = 7;
  public static readonly lengthsTableMask = (1 << VP8L.lengthsTableBits) - 1;
  public static readonly codeLengthLiterals = 16;
  public static readonly codeLengthRepeatCode = 16;
  public static readonly codeLengthExtraBits = [2, 3, 7];
  public static readonly codeLengthRepeatOffsets = [3, 3, 11];
  public static readonly argbBlack = 0xff000000;
  public static readonly maxCacheBits = 11;
  public static readonly huffmanCodesPerMetaCode = 5;
  public static readonly huffmanPackedBits = 6;
  public static readonly huffmanPackedTableSize = 1 << VP8L.huffmanPackedBits;
  public static readonly minHuffmanBits = 2;
  public static readonly numHuffmanBits = 3;
  public static readonly defaultCodeLength = 8;
  public static readonly maxAllowedCodeLength = 15;
  public static readonly numLiteralCodes = 256;
  public static readonly numLengthCodes = 24;
  public static readonly numDistanceCodes = 40;
  public static readonly codeLengthCodes = 19;
  public static readonly packedNonLiteralCode = 0;
  public static readonly bitsSpecialMarker = 0x100;
  public static readonly alphabetSize = [
    VP8L.numLiteralCodes + VP8L.numLengthCodes,
    VP8L.numLiteralCodes,
    VP8L.numLiteralCodes,
    VP8L.numLiteralCodes,
    VP8L.numDistanceCodes,
  ];
  public static readonly fixedTableSize = 630 * 3 + 410;
  public static readonly tableSize = [
    VP8L.fixedTableSize + 654,
    VP8L.fixedTableSize + 656,
    VP8L.fixedTableSize + 658,
    VP8L.fixedTableSize + 662,
    VP8L.fixedTableSize + 670,
    VP8L.fixedTableSize + 686,
    VP8L.fixedTableSize + 718,
    VP8L.fixedTableSize + 782,
    VP8L.fixedTableSize + 912,
    VP8L.fixedTableSize + 1168,
    VP8L.fixedTableSize + 1680,
    VP8L.fixedTableSize + 2704,
  ];
  public static readonly literalMap = [0, 1, 1, 1, 0];
  public static readonly vp8lMagicByte = 0x2f;
  public static readonly vp8lVersion = 0;

  /** Input buffer for bit reading */
  private _input: InputBuffer<Uint8Array>;
  /** Bit reader for VP8L stream */
  private _br: VP8LBitReader;
  /** WebP image info */
  private _webp: WebPInfo;
  /** Decoded image */
  private _image?: MemoryImage;
  /** Alpha decoder */
  private _alphaDec?: WebPAlpha;
  /** Huffman tables */
  private _huffmanTables?: HuffmanTables;
  /** Huffman tree groups */
  private _htreeGroups: HuffmanTreeGroup[] = [];
  /** Huffman image */
  private _huffmanImage?: Uint32Array;
  /** Pixel data (32-bit) */
  protected _pixels?: Uint32Array;
  /** Pixel data (8-bit) */
  private _pixels8!: Uint8Array;
  /** Opaque alpha data */
  protected _opaque?: Uint8Array;
  /** Image transforms */
  protected _transforms: VP8LTransform[] = [];
  /** Width of the image */
  protected _ioWidth: number = 0;
  /** Height of the image */
  protected _ioHeight: number = 0;
  /** Color cache */
  private _colorCache?: VP8LColorCache;
  /** Size of color cache */
  private _colorCacheSize: number = 0;
  /** Huffman mask */
  private _huffmanMask: number = 0;
  /** Huffman subsample bits */
  private _huffmanSubsampleBits: number = 0;
  /** Huffman image X size */
  private _huffmanXsize: number = 0;
  /** Number of Huffman tree groups */
  private _numHtreeGroups: number = 0;
  /** Number of transforms seen */
  private _transformsSeen: number = 0;
  /** ARGB cache offset */
  private _argbCache: number = 0;
  /** Last processed pixel */
  private _lastPixel: number = 0;
  /** Last processed row */
  private _lastRow: number = 0;

  /** Returns WebP info */
  public get webp(): WebPInfo {
    return this._webp;
  }

  /**
   * Creates a new VP8L decoder.
   * @param input Input buffer for bit reading.
   * @param webp WebP image info.
   */
  constructor(input: InputBuffer<Uint8Array>, webp: WebPInfo) {
    this._input = input;
    this._webp = webp;
    this._br = new VP8LBitReader(input);
  }

  /**
   * Decodes the header of a WebP image.
   * @returns True if valid, false otherwise.
   */
  public decodeHeader(): boolean {
    const signature = this._br.readBits(8);
    if (signature !== VP8L.vp8lMagicByte) return false;
    const width = this._br.readBits(14) + 1;
    const height = this._br.readBits(14) + 1;
    const hasAlpha = this._br.readBits(1) !== 0;
    this._ioWidth = width;
    this._ioHeight = height;
    this._webp.format = WebPFormat.lossless;
    this._webp.width = width;
    this._webp.height = height;
    this._webp.hasAlpha = hasAlpha;
    const version = this._br.readBits(3);
    if (version !== VP8L.vp8lVersion) return false;
    return true;
  }

  /**
   * Decodes the image and returns a MemoryImage or undefined on failure.
   * @returns Decoded image or undefined if failed.
   */
  public decode(): MemoryImage | undefined {
    this._lastPixel = 0;
    if (!this.decodeHeader()) return undefined;
    this.decodeImageStream(this._ioWidth, this._ioHeight, true);
    this.allocateInternalBuffers32b(this._ioWidth);
    this._image = new MemoryImage({
      width: this._ioWidth,
      height: this._ioHeight,
      numChannels: 4,
    });
    if (
      !this.decodeImageData(
        this._pixels!,
        this._webp.width,
        this._webp.height,
        this._webp.height,
        this.processRows
      )
    ) {
      return undefined;
    }
    if (this._webp.exifData.length > 0) {
      const input = new InputBuffer({
        buffer: StringUtils.getCodePoints(this._webp.exifData),
      });
      this._image.exifData = ExifData.fromInputBuffer(input);
    }
    return this._image;
  }

  /**
   * Allocates 32-bit internal pixel buffers.
   * @param finalWidth Width of the image.
   * @returns True if successful.
   */
  protected allocateInternalBuffers32b(finalWidth: number): boolean {
    const numPixels = this._webp.width * this._webp.height;
    const cacheTopPixels = finalWidth;
    const cachePixels = finalWidth * VP8L.numArgbCacheRows;
    const totalNumPixels = numPixels + cacheTopPixels + cachePixels;
    const pixels32 = new Uint32Array(totalNumPixels);
    this._pixels = pixels32;
    this._pixels8 = new Uint8Array(pixels32.buffer);
    this._argbCache = numPixels + cacheTopPixels;
    return true;
  }

  /**
   * Allocates 8-bit internal pixel buffers.
   * @returns True if successful.
   */
  protected allocateInternalBuffers8b(): boolean {
    const totalNumPixels = this._webp.width * this._webp.height;
    this._argbCache = 0;
    const n = totalNumPixels + (4 - (totalNumPixels % 4));
    this._pixels8 = new Uint8Array(n);
    this._pixels = new Uint32Array(this._pixels8.buffer);
    return true;
  }

  /**
   * Decodes the image stream and returns decoded data or undefined for level 0.
   * @param xsize Width of the image.
   * @param ysize Height of the image.
   * @param isLevel0 Whether this is level 0.
   * @returns Decoded data or undefined.
   */
  protected decodeImageStream(
    xsize: number,
    ysize: number,
    isLevel0: boolean
  ): Uint32Array | undefined {
    let transformXsize = xsize;
    let transformYsize = ysize;
    let colorCacheBits = 0;
    if (isLevel0) {
      while (this._br.readBits(1) !== 0) {
        const sizes = [transformXsize, transformYsize];
        if (!this.readTransform(sizes)) throw new LibError('Invalid Transform');
        transformXsize = sizes[0];
        transformYsize = sizes[1];
      }
    }
    if (this._br.readBits(1) !== 0) {
      colorCacheBits = this._br.readBits(4);
      if (!(colorCacheBits >= 1 && colorCacheBits <= VP8L.maxCacheBits))
        throw new LibError('Invalid Color Cache');
    }
    if (
      !this.readHuffmanCodes(
        transformXsize,
        transformYsize,
        colorCacheBits,
        isLevel0
      )
    ) {
      throw new LibError('Invalid Huffman Codes');
    }
    if (colorCacheBits > 0) {
      this._colorCacheSize = 1 << colorCacheBits;
      this._colorCache = new VP8LColorCache(colorCacheBits);
    } else {
      this._colorCacheSize = 0;
    }
    this._webp.width = transformXsize;
    this._webp.height = transformYsize;
    const numBits = this._huffmanSubsampleBits;
    this._huffmanXsize = VP8L.subSampleSize(transformXsize, numBits);
    this._huffmanMask = numBits === 0 ? ~0 : (1 << numBits) - 1;
    if (isLevel0) {
      this._lastPixel = 0;
      return undefined;
    }
    const totalSize = transformXsize * transformYsize;
    const data = new Uint32Array(totalSize);
    if (
      !this.decodeImageData(
        data,
        transformXsize,
        transformYsize,
        transformYsize,
        undefined
      )
    ) {
      throw new LibError('Failed to decode image data.');
    }
    this._lastPixel = 0;
    return data;
  }

  /**
   * Decodes image data into the provided buffer.
   * @param data Buffer to write decoded data.
   * @param width Image width.
   * @param height Image height.
   * @param lastRow Last row to process.
   * @param processFunc Optional row processing callback.
   * @returns True if successful.
   */
  protected decodeImageData(
    data: Uint32Array,
    width: number,
    height: number,
    lastRow: number,
    processFunc?: (_row: number, _waitForBiggestBatch: boolean) => void
  ): boolean {
    let row = Math.trunc(this._lastPixel / width);
    let col = this._lastPixel % width;
    let htreeGroup = this.getHtreeGroupForPos(col, row);
    let src = this._lastPixel;
    let lastCached = src;
    const srcEnd = width * height;
    const srcLast = width * lastRow;
    const lenCodeLimit = VP8L.numLiteralCodes + VP8L.numLengthCodes;
    const colorCacheLimit = lenCodeLimit + this._colorCacheSize;
    const colorCache = this._colorCacheSize > 0 ? this._colorCache : undefined;
    const mask = this._huffmanMask;
    while (src < srcLast) {
      if ((col & mask) === 0) htreeGroup = this.getHtreeGroupForPos(col, row);
      if (htreeGroup.isTrivialCode) {
        data[src] = htreeGroup.literalArb;
        ++src;
        ++col;
        if (col >= width) {
          col = 0;
          ++row;
          if (processFunc !== undefined && row <= lastRow)
            processFunc(row, true);
          if (colorCache !== undefined) {
            while (lastCached < src) {
              colorCache.insert(data[lastCached]);
              lastCached++;
            }
          }
        }
        continue;
      }
      this._br.fillBitWindow();
      let code: number = 0;
      if (htreeGroup.usePackedTable) {
        const val = this._br.prefetchBits() & (VP8L.huffmanPackedTableSize - 1);
        const code32 = htreeGroup.packedTable[val];
        if (code32.bits < VP8L.bitsSpecialMarker) {
          this._br.bitPos += code32.bits;
          data[src] = code32.value;
          code = VP8L.packedNonLiteralCode;
        } else {
          this._br.bitPos += code32.bits - VP8L.bitsSpecialMarker;
          code = code32.value;
        }
        if (this._br.isEOS) break;
        if (code === VP8L.packedNonLiteralCode) {
          ++src;
          ++col;
          if (col >= width) {
            col = 0;
            ++row;
            if (processFunc !== undefined && row <= lastRow)
              processFunc(row, true);
            if (colorCache !== undefined) {
              while (lastCached < src) {
                colorCache.insert(data[lastCached]);
                lastCached++;
              }
            }
          }
          continue;
        }
      } else {
        code = htreeGroup.readSymbol(VP8L.green, this._br);
      }
      if (code < VP8L.numLiteralCodes) {
        if (htreeGroup.isTrivialLiteral) {
          data[src] = htreeGroup.literalArb | (code << 8);
        } else {
          const red = htreeGroup.readSymbol(VP8L.red, this._br);
          const green = code;
          this._br.fillBitWindow();
          const blue = htreeGroup.readSymbol(VP8L.blue, this._br);
          const alpha = htreeGroup.readSymbol(VP8L.alpha, this._br);
          const c = ColorUtils.rgbaToUint32(blue, green, red, alpha);
          data[src] = c;
        }
        ++src;
        ++col;
        if (col >= width) {
          col = 0;
          ++row;
          if (processFunc !== undefined && row <= lastRow)
            processFunc(row, true);
          if (colorCache !== undefined) {
            while (lastCached < src) {
              colorCache.insert(data[lastCached]);
              lastCached++;
            }
          }
        }
      } else if (code < lenCodeLimit) {
        const lengthSym = code - VP8L.numLiteralCodes;
        const length = this.getCopyLength(lengthSym);
        const distSymbol = htreeGroup.readSymbol(VP8L.dist, this._br);
        this._br.fillBitWindow();
        const distCode = this.getCopyDistance(distSymbol);
        const dist = this.planeCodeToDistance(width, distCode);
        if (this._br.isEOS) break;
        if (src < dist || srcEnd - src < length) {
          return false;
        } else {
          const dst = src - dist;
          for (let i = 0; i < length; ++i) {
            data[src + i] = data[dst + i];
          }
        }
        src += length;
        col += length;
        while (col >= width) {
          col -= width;
          ++row;
          if (processFunc !== undefined && row <= lastRow)
            processFunc(row, true);
        }
        if ((col & mask) !== 0) htreeGroup = this.getHtreeGroupForPos(col, row);
        if (colorCache !== undefined) {
          while (lastCached < src) {
            colorCache.insert(data[lastCached]);
            lastCached++;
          }
        }
      } else if (code < colorCacheLimit) {
        const key = code - lenCodeLimit;
        while (lastCached < src) {
          colorCache!.insert(data[lastCached]);
          lastCached++;
        }
        data[src] = colorCache!.lookup(key);
        ++src;
        ++col;
        if (col >= width) {
          col = 0;
          ++row;
          if (processFunc !== undefined && row <= lastRow)
            processFunc(row, true);
          while (lastCached < src) {
            colorCache!.insert(data[lastCached]);
            lastCached++;
          }
        }
      } else {
        return false;
      }
    }
    if (processFunc !== undefined)
      processFunc(row > lastRow ? lastRow : row, false);
    this._lastPixel = src;
    return true;
  }

  /**
   * Reads a transform from the bit reader.
   * @param transformSize Array with [width, height] to update.
   * @returns True if successful.
   */
  private readTransform(transformSize: number[]): boolean {
    let ok = true;
    const type = this._br.readBits(2);
    if ((this._transformsSeen & (1 << type)) !== 0) return false;
    this._transformsSeen |= 1 << type;
    const transform = new VP8LTransform();
    this._transforms.push(transform);
    transform.type = type as VP8LImageTransformType;
    transform.xsize = transformSize[0];
    transform.ysize = transformSize[1];
    switch (transform.type) {
      case VP8LImageTransformType.predictor:
      case VP8LImageTransformType.crossColor:
        transform.bits = this._br.readBits(3) + 2;
        transform.data = this.decodeImageStream(
          VP8L.subSampleSize(transform.xsize, transform.bits),
          VP8L.subSampleSize(transform.ysize, transform.bits),
          false
        );
        break;
      case VP8LImageTransformType.colorIndexing: {
        const numColors = this._br.readBits(8) + 1;
        const bits =
          numColors > 16 ? 0 : numColors > 4 ? 1 : numColors > 2 ? 2 : 3;
        transformSize[0] = VP8L.subSampleSize(transform.xsize, bits);
        transform.bits = bits;
        transform.data = this.decodeImageStream(numColors, 1, false);
        ok = this.expandColorMap(numColors, transform);
        break;
      }
      case VP8LImageTransformType.subtractGreen:
        break;
      default:
        throw new LibError('Invalid WebP transform type: $type');
    }
    return ok;
  }

  /**
   * Expands the color map for color indexing transform.
   * @param numColors Number of colors.
   * @param transform Transform to expand.
   * @returns True if successful.
   */
  private expandColorMap(numColors: number, transform: VP8LTransform): boolean {
    const finalNumColors = 1 << (8 >>> transform.bits);
    const newColorMap = new Uint32Array(finalNumColors);
    const data = new Uint8Array(transform.data!.buffer);
    const newData = new Uint8Array(newColorMap.buffer);
    newColorMap[0] = transform.data![0];
    let len = 4 * numColors;
    let i: number = 0;
    for (i = 4; i < len; ++i) {
      newData[i] = (data[i] + newData[i - 4]) & 0xff;
    }
    for (len = 4 * finalNumColors; i < len; ++i) {
      newData[i] = 0;
    }
    transform.data = newColorMap;
    return true;
  }

  /**
   * Returns the meta index for Huffman group lookup.
   * @param image Huffman image.
   * @param xsize Image width.
   * @param bits Subsample bits.
   * @param x X position.
   * @param y Y position.
   * @returns Meta index.
   */
  private getMetaIndex(
    image: Uint32Array | undefined,
    xsize: number,
    bits: number,
    x: number,
    y: number
  ): number {
    if (bits === 0 || image === undefined) return 0;
    return image[xsize * (y >>> bits) + (x >>> bits)];
  }

  /**
   * Returns HuffmanTreeGroup for given pixel position.
   * @param x X position.
   * @param y Y position.
   * @returns Huffman tree group.
   */
  private getHtreeGroupForPos(x: number, y: number): HuffmanTreeGroup {
    const metaIndex = this.getMetaIndex(
      this._huffmanImage,
      this._huffmanXsize,
      this._huffmanSubsampleBits,
      x,
      y
    );
    return this._htreeGroups[metaIndex];
  }

  /**
   * Applies inverse transforms to pixel data.
   * @param startRow Start row.
   * @param numRows Number of rows.
   * @param rows Row offset.
   */
  private applyInverseTransforms(
    startRow: number,
    numRows: number,
    rows: number
  ): void {
    let n = this._transforms.length;
    const cachePixels = this._webp.width * numRows;
    const endRow = startRow + numRows;
    let rowsIn = rows;
    const rowsOut = this._argbCache;
    while (n-- > 0) {
      this._transforms[n].inverseTransform(
        startRow,
        endRow,
        this._pixels!,
        rowsIn,
        this._pixels!,
        rowsOut
      );
      rowsIn = rowsOut;
    }
    if (rowsIn !== rowsOut) {
      ArrayUtils.copyRange(
        this._pixels!,
        rowsIn,
        this._pixels!,
        rowsOut,
        cachePixels
      );
    }
  }

  /**
   * Processes decoded rows and writes to MemoryImage.
   * @param row Current row.
   * @param waitForBiggestBatch Whether to wait for the biggest batch.
   */
  private processRows(row: number, waitForBiggestBatch: boolean): void {
    const rows = this._webp.width * this._lastRow;
    if (waitForBiggestBatch) {
      if (row % VP8L.numArgbCacheRows !== 0) return;
    }
    const numRows = row - this._lastRow;
    if (numRows <= 0) {
      this._lastRow = row;
      return;
    }
    this.applyInverseTransforms(this._lastRow, numRows, rows);
    for (
      let y = 0, pi = this._argbCache, dy = this._lastRow;
      y < numRows;
      ++y, ++dy
    ) {
      for (let x = 0; x < this._ioWidth; ++x, ++pi) {
        const c = this._pixels![pi];
        const r = ColorUtils.uint32ToRed(c);
        const g = ColorUtils.uint32ToGreen(c);
        const b = ColorUtils.uint32ToBlue(c);
        const a = ColorUtils.uint32ToAlpha(c);
        this._image!.setPixelRgba(x, dy, b, g, r, a);
      }
    }
    this._lastRow = row;
  }

  /**
   * Reads Huffman codes from the bit reader.
   * @param xSize Image width.
   * @param ySize Image height.
   * @param colorCacheBits Color cache bits.
   * @param allowRecursion Allow recursion.
   * @returns True if successful.
   */
  private readHuffmanCodes(
    xSize: number,
    ySize: number,
    colorCacheBits: number,
    allowRecursion: boolean
  ): boolean {
    let huffmanImage: Uint32Array | undefined = undefined;
    let numHtreeGroups = 1;
    let numHtreeGroupsMax = 1;
    let mapping: Int32Array | undefined = undefined;
    if (allowRecursion && this._br.readBits(1) !== 0) {
      const huffmanPrecision =
        VP8L.minHuffmanBits + this._br.readBits(VP8L.numHuffmanBits);
      const huffmanXsize = VP8L.subSampleSize(xSize, huffmanPrecision);
      const huffmanYsize = VP8L.subSampleSize(ySize, huffmanPrecision);
      const huffmanPixs = huffmanXsize * huffmanYsize;
      huffmanImage = this.decodeImageStream(huffmanXsize, huffmanYsize, false);
      if (huffmanImage === undefined) return false;
      this._huffmanSubsampleBits = huffmanPrecision;
      for (let i = 0; i < huffmanPixs; ++i) {
        const group = (huffmanImage[i] >>> 8) & 0xffff;
        huffmanImage![i] = group;
        if (group >= numHtreeGroupsMax) numHtreeGroupsMax = group + 1;
      }
      if (numHtreeGroupsMax > 1000 || numHtreeGroupsMax > xSize * ySize) {
        mapping = new Int32Array(numHtreeGroups);
        mapping.fill(0xff, 0, numHtreeGroups);
        numHtreeGroups = 0;
        for (let i = 0; i < huffmanPixs; ++i) {
          const mappedGroup = huffmanImage[i];
          if (mapping[mappedGroup] === -1) {
            mapping[mappedGroup] = numHtreeGroups++;
          }
          huffmanImage[i] = mapping[mappedGroup];
        }
      } else {
        numHtreeGroups = numHtreeGroupsMax;
      }
    }
    if (this._br.isEOS) return false;
    const htreeGroups = this.readHuffmanCodesHelper(
      colorCacheBits,
      numHtreeGroups,
      numHtreeGroupsMax,
      mapping
    );
    if (htreeGroups === undefined) return false;
    this._huffmanImage = huffmanImage;
    this._numHtreeGroups = numHtreeGroups;
    this._htreeGroups = htreeGroups;
    return true;
  }

  /**
   * Reads Huffman code for a given alphabet size.
   * @param alphabetSize Size of the alphabet.
   * @param codeLengths Array to store code lengths.
   * @param table Huffman tables.
   * @returns Table size.
   */
  private readHuffmanCode(
    alphabetSize: number,
    codeLengths: Int32Array,
    table: HuffmanTables | undefined
  ): number {
    let size = 0;
    let ok = false;
    const simpleCode = this._br.readBits(1);
    codeLengths.fill(0, 0, alphabetSize);
    if (simpleCode !== 0) {
      const numSymbols = this._br.readBits(1) + 1;
      const firstSymbolLenCode = this._br.readBits(1);
      let symbol = this._br.readBits(firstSymbolLenCode === 0 ? 1 : 8);
      codeLengths[symbol] = 1;
      if (numSymbols === 2) {
        symbol = this._br.readBits(8);
        codeLengths[symbol] = 1;
      }
      ok = true;
    } else {
      const codeLengthCodeLengths = new Int32Array(VP8L.numCodeLengthCodes);
      const numCodes = this._br.readBits(4) + 4;
      for (let i = 0; i < numCodes; ++i) {
        codeLengthCodeLengths[VP8L.codeLengthCodeOrder[i]] =
          this._br.readBits(3);
      }
      ok = this.readHuffmanCodeLengths(
        codeLengthCodeLengths,
        alphabetSize,
        codeLengths
      );
    }
    ok = ok && !this._br.isEOS;
    if (ok) {
      size = this.vp8lBuildHuffmanTable(
        table,
        VP8L.huffmanTableBits,
        codeLengths,
        alphabetSize
      );
    }
    return size;
  }

  /**
   * Reads Huffman code lengths from the bit reader.
   * @param codeLengthCodeLengths Code length code lengths.
   * @param numSymbols Number of symbols.
   * @param codeLengths Array to store code lengths.
   * @returns True if successful.
   */
  private readHuffmanCodeLengths(
    codeLengthCodeLengths: Int32Array,
    numSymbols: number,
    codeLengths: Int32Array
  ): boolean {
    let prevCodeLen = VP8L.defaultCodeLength;
    const tables = new HuffmanTables(1 << VP8L.lengthsTableBits);
    if (
      this.vp8lBuildHuffmanTable(
        tables,
        VP8L.lengthsTableBits,
        codeLengthCodeLengths,
        VP8L.numCodeLengthCodes
      ) === 0
    ) {
      return false;
    }
    let maxSymbol = 0;
    if (this._br.readBits(1) !== 0) {
      const lengthNBits = 2 + 2 * this._br.readBits(3);
      maxSymbol = 2 + this._br.readBits(lengthNBits);
      if (maxSymbol > numSymbols) return false;
    } else {
      maxSymbol = numSymbols;
    }
    let symbol = 0;
    while (symbol < numSymbols) {
      if (maxSymbol-- === 0) break;
      this._br.fillBitWindow();
      const p = tables.currentSegment!.start!.get(
        this._br.prefetchBits() & VP8L.lengthsTableMask
      );
      this._br.bitPos += p.bits;
      const codeLen = p.value;
      if (codeLen < VP8L.codeLengthLiterals) {
        codeLengths[symbol++] = codeLen;
        if (codeLen !== 0) prevCodeLen = codeLen;
      } else {
        const usePrev = codeLen === VP8L.codeLengthRepeatCode;
        const slot = codeLen - VP8L.codeLengthLiterals;
        const extraBits = VP8L.codeLengthExtraBits[slot];
        const repeatOffset = VP8L.codeLengthRepeatOffsets[slot];
        let repeat = this._br.readBits(extraBits) + repeatOffset;
        if (symbol + repeat > numSymbols) return false;
        const length = usePrev ? prevCodeLen : 0;
        while (repeat-- > 0) {
          codeLengths[symbol++] = length;
        }
      }
    }
    return true;
  }

  /**
   * Helper for reading Huffman codes for all groups.
   * @param colorCacheBits Color cache bits.
   * @param numHtreeGroups Number of Huffman tree groups.
   * @param numHtreeGroupsMax Maximum number of Huffman tree groups.
   * @param mapping Optional mapping array.
   * @returns Array of Huffman tree groups or undefined.
   */
  private readHuffmanCodesHelper(
    colorCacheBits: number,
    numHtreeGroups: number,
    numHtreeGroupsMax: number,
    mapping: Int32Array | undefined
  ): HuffmanTreeGroup[] | undefined {
    const maxAlphabetSize =
      VP8L.alphabetSize[0] + (colorCacheBits > 0 ? 1 << colorCacheBits : 0);
    const tableSize = VP8L.tableSize[colorCacheBits];
    if (mapping === undefined && numHtreeGroups !== numHtreeGroupsMax)
      return undefined;
    const codeLengths = new Int32Array(maxAlphabetSize);
    const htreeGroups = ArrayUtils.generate(
      numHtreeGroups,
      (_) => new HuffmanTreeGroup()
    );
    this._huffmanTables = new HuffmanTables(numHtreeGroups * tableSize);
    for (let i = 0; i < numHtreeGroupsMax; ++i) {
      if (mapping !== undefined && mapping[i] === -1) {
        for (let j = 0; j < VP8L.huffmanCodesPerMetaCode; ++j) {
          let alphabetSize = VP8L.alphabetSize[j];
          if (j === 0 && colorCacheBits > 0)
            alphabetSize += 1 << colorCacheBits;
          if (
            this.readHuffmanCode(alphabetSize, codeLengths, undefined) === 0
          ) {
            return undefined;
          }
        }
      } else {
        let maxBits = 0;
        let isTrivialLiteral = true;
        let totalSize = 0;
        const htreeGroup = htreeGroups[mapping === undefined ? i : mapping[i]];
        const htrees = htreeGroup.htrees;
        for (let j = 0; j < VP8L.huffmanCodesPerMetaCode; ++j) {
          let alphabetSize = VP8L.alphabetSize[j];
          if (j === 0 && colorCacheBits > 0)
            alphabetSize += 1 << colorCacheBits;
          const size = this.readHuffmanCode(
            alphabetSize,
            codeLengths,
            this._huffmanTables
          );
          htrees[j] = this._huffmanTables.currentSegment!.currentTable!;
          if (size === 0) return undefined;
          if (isTrivialLiteral && VP8L.literalMap[j] === 1) {
            isTrivialLiteral = htrees[j].get(0).bits === 0;
          }
          totalSize += htrees[j].get(0).bits;
          this._huffmanTables.currentSegment!.currentOffset += size;
          this._huffmanTables.currentSegment!.currentTable =
            HuffmanCodeList.from(
              this._huffmanTables.currentSegment!.currentTable!,
              size
            );
          if (j <= VP8L.alpha) {
            let localMaxBits = codeLengths[0];
            for (let k = 1; k < alphabetSize; ++k) {
              if (codeLengths[k] > localMaxBits) localMaxBits = codeLengths[k];
            }
            maxBits += localMaxBits;
          }
        }
        htreeGroup.isTrivialLiteral = isTrivialLiteral;
        htreeGroup.isTrivialCode = false;
        if (isTrivialLiteral) {
          const red = htrees[VP8L.red].get(0).value;
          const blue = htrees[VP8L.blue].get(0).value;
          const alpha = htrees[VP8L.alpha].get(0).value;
          htreeGroup.literalArb = (alpha << 24) | (red << 16) | blue;
          if (
            totalSize === 0 &&
            htrees[VP8L.green].get(0).value < VP8L.numLengthCodes
          ) {
            htreeGroup.isTrivialCode = true;
            htreeGroup.literalArb |= htrees[VP8L.green].get(0).value << 8;
          }
        }
        htreeGroup.usePackedTable =
          !htreeGroup.isTrivialCode && maxBits < VP8L.huffmanPackedBits;
        if (htreeGroup.usePackedTable) this.buildPackedTable(htreeGroup);
      }
    }
    return htreeGroups;
  }

  /**
   * Builds packed Huffman table for fast decoding.
   * @param htreeGroup Huffman tree group.
   */
  private buildPackedTable(htreeGroup: HuffmanTreeGroup): void {
    for (let code = 0; code < VP8L.huffmanPackedTableSize; ++code) {
      let bits = code;
      const huff = htreeGroup.packedTable[bits];
      const hcode = htreeGroup.htrees[VP8L.green].get(bits);
      if (hcode.value >= VP8L.numLiteralCodes) {
        huff.bits = hcode.bits + VP8L.bitsSpecialMarker;
        huff.value = hcode.value;
      } else {
        huff.bits = 0;
        huff.value = 0;
        bits >>= this.accumulateHCode(hcode, 8, huff);
        bits >>= this.accumulateHCode(
          htreeGroup.htrees[VP8L.red].get(bits),
          16,
          huff
        );
        bits >>= this.accumulateHCode(
          htreeGroup.htrees[VP8L.blue].get(bits),
          0,
          huff
        );
        bits >>= this.accumulateHCode(
          htreeGroup.htrees[VP8L.alpha].get(bits),
          24,
          huff
        );
      }
    }
  }

  /**
   * Accumulates Huffman code bits and value.
   * @param hcode Huffman code.
   * @param shift Bit shift.
   * @param huff Huffman code 32.
   * @returns Number of bits accumulated.
   */
  private accumulateHCode(
    hcode: HuffmanCode,
    shift: number,
    huff: HuffmanCode32
  ): number {
    huff.bits += hcode.bits;
    huff.value |= hcode.value << shift;
    return hcode.bits;
  }

  /**
   * Returns the copy distance for a given distance symbol.
   * @param distanceSymbol Distance symbol.
   * @returns Copy distance.
   */
  private getCopyDistance(distanceSymbol: number): number {
    if (distanceSymbol < 4) return distanceSymbol + 1;
    const extraBits = (distanceSymbol - 2) >>> 1;
    const offset = (2 + (distanceSymbol & 1)) << extraBits;
    return offset + this._br.readBits(extraBits) + 1;
  }

  /**
   * Returns the copy length for a given length symbol.
   * @param lengthSymbol Length symbol.
   * @returns Copy length.
   */
  private getCopyLength(lengthSymbol: number): number {
    return this.getCopyDistance(lengthSymbol);
  }

  /**
   * Converts a plane code to a distance.
   * @param xsize Image width.
   * @param planeCode Plane code.
   * @returns Distance.
   */
  private planeCodeToDistance(xsize: number, planeCode: number): number {
    if (planeCode > VP8L.codeToPlaneCodes) {
      return planeCode - VP8L.codeToPlaneCodes;
    } else {
      const distCode = VP8L.codeToPlane[planeCode - 1];
      const yoffset = distCode >>> 4;
      const xoffset = 8 - (distCode & 0xf);
      const dist = yoffset * xsize + xoffset;
      return dist >= 1 ? dist : 1;
    }
  }

  /**
   * Returns true if the instance is optimizable for 8-bit processing.
   * @returns True if optimizable.
   */
  protected is8bOptimizable(): boolean {
    if (this._colorCacheSize > 0) return false;
    for (let i = 0; i < this._numHtreeGroups; ++i) {
      const htrees = this._htreeGroups[i].htrees;
      if (htrees[VP8L.red].get(0).bits > 0) return false;
      if (htrees[VP8L.blue].get(0).bits > 0) return false;
      if (htrees[VP8L.alpha].get(0).bits > 0) return false;
    }
    return true;
  }

  /**
   * Extracts paletted alpha rows for the given row.
   * @param row Row number.
   */
  private extractPalettedAlphaRows(row: number): void {
    const numRows = row - this._lastRow;
    const pIn = new InputBuffer<Uint8Array>({
      buffer: this._pixels8,
      offset: this._webp.width * this._lastRow,
    });
    if (numRows > 0) this.applyInverseTransformsAlpha(numRows, pIn);
    this._lastRow = row;
  }

  /**
   * Applies inverse transforms for paletted alpha.
   * @param numRows Number of rows.
   * @param rows Input buffer for rows.
   */
  private applyInverseTransformsAlpha(
    numRows: number,
    rows: InputBuffer<Uint8Array>
  ): void {
    const startRow = this._lastRow;
    const endRow = startRow + numRows;
    const rowsOut = new InputBuffer<Uint8Array>({
      buffer: this._opaque!,
      offset: this._ioWidth * startRow,
    });
    this._transforms[0].colorIndexInverseTransformAlpha(
      startRow,
      endRow,
      rows,
      rowsOut
    );
  }

  /**
   * Extracts alpha rows from the given row number.
   * @param lastRow Last row to extract.
   * @param waitForBiggestBatch Whether to wait for the biggest batch.
   */
  protected extractAlphaRows(
    lastRow: number,
    waitForBiggestBatch: boolean
  ): void {
    if (waitForBiggestBatch && lastRow % VP8L.numArgbCacheRows !== 0) return;
    let currentRow = this._lastRow;
    let numRows = lastRow - currentRow;
    let inPtr = this._ioWidth * currentRow;
    while (numRows > 0) {
      const numRowsToProcess =
        numRows > VP8L.numArgbCacheRows ? VP8L.numArgbCacheRows : numRows;
      const width = this._ioWidth;
      const cachePixels = width * numRowsToProcess;
      const dst = width * currentRow;
      const src = this._argbCache;
      this.applyInverseTransforms(currentRow, numRowsToProcess, inPtr);
      for (let i = 0; i < cachePixels; ++i) {
        this._opaque![dst + i] = (this._pixels![src + i] >> 8) & 0xff;
      }
      numRows -= numRowsToProcess;
      inPtr += numRowsToProcess * this._ioWidth;
      currentRow += numRowsToProcess;
    }
    this._lastRow = lastRow;
  }

  /**
   * Decodes alpha data for an image.
   * @param width Image width.
   * @param height Image height.
   * @param lastRow Last row to decode.
   * @returns True if successful.
   */
  protected decodeAlphaData(
    width: number,
    height: number,
    lastRow: number
  ): boolean {
    let row = Math.trunc(this._lastPixel / width);
    let col = this._lastPixel % width;
    let htreeGroup = this.getHtreeGroupForPos(col, row);
    let pos = this._lastPixel;
    const end = width * height;
    const last = width * lastRow;
    const lenCodeLimit = VP8L.numLiteralCodes + VP8L.numLengthCodes;
    const mask = this._huffmanMask;
    while (!this._br.isEOS && pos < last) {
      if ((col & mask) === 0) htreeGroup = this.getHtreeGroupForPos(col, row);
      this._br.fillBitWindow();
      const code = htreeGroup.readSymbol(VP8L.green, this._br);
      if (code < VP8L.numLiteralCodes) {
        this._pixels8[pos] = code;
        ++pos;
        ++col;
        if (col >= width) {
          col = 0;
          ++row;
          if (row % VP8L.numArgbCacheRows === 0)
            this.extractPalettedAlphaRows(row);
        }
      } else if (code < lenCodeLimit) {
        const lengthSym = code - VP8L.numLiteralCodes;
        const length = this.getCopyLength(lengthSym);
        const distSymbol = htreeGroup.readSymbol(VP8L.dist, this._br);
        this._br.fillBitWindow();
        const distCode = this.getCopyDistance(distSymbol);
        const dist = this.planeCodeToDistance(width, distCode);
        if (pos >= dist && end - pos >= length) {
          for (let i = 0; i < length; ++i) {
            this._pixels8[pos + i] = this._pixels8[pos + i - dist];
          }
        } else {
          this._lastPixel = pos;
          return true;
        }
        pos += length;
        col += length;
        while (col >= width) {
          col -= width;
          ++row;
          if (row % VP8L.numArgbCacheRows === 0)
            this.extractPalettedAlphaRows(row);
        }
        if (pos < last && (col & mask) !== 0)
          htreeGroup = this.getHtreeGroupForPos(col, row);
      } else {
        return false;
      }
    }
    this.extractPalettedAlphaRows(row);
    this._lastPixel = pos;
    return true;
  }

  /**
   * Replicates value in Huffman table.
   * @param table Huffman code list.
   * @param key Table key.
   * @param step Step size.
   * @param end End index.
   * @param bits Number of bits.
   * @param value Value to replicate.
   */
  private replicateValue(
    table: HuffmanCodeList,
    key: number,
    step: number,
    end: number,
    bits: number,
    value: number
  ): void {
    let currentEnd = end;
    do {
      currentEnd -= step;
      table.get(key + currentEnd).bits = bits;
      table.get(key + currentEnd).value = value;
    } while (currentEnd > 0);
  }

  /**
   * Returns the table width of the next 2nd level table.
   * @param count Count array.
   * @param len Current length.
   * @param rootBits Root bits.
   * @returns Table width.
   */
  private nextTableBitSize(
    count: Int32Array,
    len: number,
    rootBits: number
  ): number {
    let _len = len;
    let left = 1 << (_len - rootBits);
    while (_len < VP8L.maxAllowedCodeLength) {
      left -= count[_len];
      if (left <= 0) break;
      ++_len;
      left <<= 1;
    }
    return _len - rootBits;
  }

  /**
   * Returns next Huffman key.
   * @param key Current key.
   * @param len Length.
   * @returns Next key.
   */
  private getNextKey(key: number, len: number): number {
    let step = 1 << (len - 1);
    while ((key & step) !== 0) step >>= 1;
    return step !== 0 ? (key & (step - 1)) + step : key;
  }

  /**
   * Builds Huffman table for decoding.
   * @param rootTable Root Huffman code list.
   * @param rootBits Root bits.
   * @param codeLengths Code lengths array.
   * @param codeLengthsSize Size of code lengths array.
   * @param sorted Optional sorted array.
   * @returns Total table size.
   */
  private buildHuffmanTable(
    rootTable: HuffmanCodeList | undefined,
    rootBits: number,
    codeLengths: Int32Array,
    codeLengthsSize: number,
    sorted: Uint16Array | undefined
  ): number {
    let totalSize = 1 << rootBits;
    const count = new Int32Array(VP8L.maxAllowedCodeLength + 1);
    const offset = new Int32Array(VP8L.maxAllowedCodeLength + 1);
    let tableOffset = 0;
    for (let symbol = 0; symbol < codeLengthsSize; ++symbol) {
      if (codeLengths[symbol] > VP8L.maxAllowedCodeLength) return 0;
      ++count[codeLengths[symbol]];
    }
    if (count[0] === codeLengthsSize) return 0;
    offset[1] = 0;
    for (let len = 1; len < VP8L.maxAllowedCodeLength; ++len) {
      if (count[len] > 1 << len) return 0;
      offset[len + 1] = offset[len] + count[len];
    }
    for (let symbol = 0; symbol < codeLengthsSize; ++symbol) {
      const symbolCodeLength = codeLengths[symbol];
      if (codeLengths[symbol] > 0) {
        if (sorted !== undefined) {
          if (offset[symbolCodeLength] >= codeLengthsSize) return 0;
          sorted[offset[symbolCodeLength]++] = symbol;
        } else {
          offset[symbolCodeLength]++;
        }
      }
    }
    if (offset[VP8L.maxAllowedCodeLength] === 1) {
      if (sorted !== undefined) {
        this.replicateValue(rootTable!, 0, 1, totalSize, 0, sorted[0]);
      }
      return totalSize;
    }
    {
      let low = 0xffffffff;
      const mask = totalSize - 1;
      let key = 0;
      let numNodes = 1;
      let numOpen = 1;
      let tableBits = rootBits;
      let tableSize = 1 << tableBits;
      let symbol = 0;
      for (let len = 1, step = 2; len <= rootBits; ++len, step <<= 1) {
        numOpen <<= 1;
        numNodes += numOpen;
        numOpen -= count[len];
        if (numOpen < 0) return 0;
        if (rootTable === undefined) continue;
        for (; count[len] > 0; --count[len]) {
          const bits = len & 0xff;
          const value = sorted![symbol++];
          this.replicateValue(
            rootTable,
            tableOffset + key,
            step,
            tableSize,
            bits,
            value
          );
          key = this.getNextKey(key, len);
        }
      }
      for (
        let len = rootBits + 1, step = 2;
        len <= VP8L.maxAllowedCodeLength;
        ++len, step <<= 1
      ) {
        numOpen <<= 1;
        numNodes += numOpen;
        numOpen -= count[len];
        if (numOpen < 0) return 0;
        for (; count[len] > 0; --count[len]) {
          if ((key & mask) !== low) {
            if (rootTable !== undefined) tableOffset += tableSize;
            tableBits = this.nextTableBitSize(count, len, rootBits);
            tableSize = 1 << tableBits;
            totalSize += tableSize;
            low = key & mask;
            if (rootTable !== undefined) {
              const bits = (tableBits + rootBits) & 0xff;
              const value = tableOffset - low;
              rootTable.get(low).bits = bits;
              rootTable.get(low).value = value;
            }
          }
          if (rootTable !== undefined) {
            const bits = (len - rootBits) & 0xff;
            const value = sorted![symbol++];
            this.replicateValue(
              rootTable,
              tableOffset + (key >> rootBits),
              step,
              tableSize,
              bits,
              value
            );
          }
          key = this.getNextKey(key, len);
        }
      }
      if (numNodes !== 2 * offset[VP8L.maxAllowedCodeLength] - 1) return 0;
    }
    return totalSize;
  }

  /**
   * Builds Huffman table for VP8L decoding.
   * @param rootTable Huffman tables.
   * @param rootBits Root bits.
   * @param codeLengths Code lengths array.
   * @param codeLengthsSize Size of code lengths array.
   * @returns Total table size.
   */
  private vp8lBuildHuffmanTable(
    rootTable: HuffmanTables | undefined,
    rootBits: number,
    codeLengths: Int32Array,
    codeLengthsSize: number
  ): number {
    const totalSize = this.buildHuffmanTable(
      undefined,
      rootBits,
      codeLengths,
      codeLengthsSize,
      undefined
    );
    if (totalSize === 0 || rootTable === undefined) return totalSize;
    if (
      rootTable.currentSegment!.currentOffset + totalSize >=
      rootTable.currentSegment!.size
    ) {
      const segmentSize = rootTable.currentSegment!.size;
      const next = new HuffmanTablesSegment();
      {
        const nextSize = totalSize > segmentSize ? totalSize : segmentSize;
        const nextStart = HuffmanCodeList.sized(nextSize);
        next.size = nextSize;
        next.start = nextStart;
      }
      next.currentTable = next.start;
      next.next = undefined;
      rootTable.currentSegment!.next = next;
      rootTable.currentSegment = next;
    }
    const sorted = new Uint16Array(codeLengthsSize);
    this.buildHuffmanTable(
      rootTable.currentSegment!.currentTable,
      rootBits,
      codeLengths,
      codeLengthsSize,
      sorted
    );
    return totalSize;
  }

  /**
   * Calculates the sub-sample size for transforms.
   * @param size Size.
   * @param samplingBits Sampling bits.
   * @returns Sub-sample size.
   */
  protected static subSampleSize(size: number, samplingBits: number): number {
    return (size + (1 << samplingBits) - 1) >>> samplingBits;
  }
}
