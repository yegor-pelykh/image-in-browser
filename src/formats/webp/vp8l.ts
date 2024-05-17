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
import { HuffmanTree } from './webp-huffman-tree.js';
import { HuffmanTreeGroup } from './webp-huffman-tree-group.js';
import { WebPInfo } from './webp-info.js';
import { StringUtils } from '../../common/string-utils.js';
import { ExifData } from '../../exif/exif-data.js';

export class VP8L {
  private _lastPixel: number = 0;
  private _lastRow: number = 0;

  private _colorCacheSize: number = 0;
  private _colorCache?: VP8LColorCache;

  private _huffmanMask: number = 0;
  private _huffmanSubsampleBits: number = 0;
  private _huffmanXsize: number = 0;
  private _huffmanImage?: Uint32Array;
  private _numHtreeGroups: number = 0;
  private _htreeGroups: HuffmanTreeGroup[] = [];
  protected _transforms: VP8LTransform[] = [];
  private _transformsSeen: number = 0;

  protected _pixels?: Uint32Array;
  private _pixels8!: Uint8Array;
  private _argbCache?: number;

  protected _opaque?: Uint8Array;

  protected _ioWidth?: number;
  protected _ioHeight?: number;

  private _input: InputBuffer<Uint8Array>;
  private _br: VP8LBitReader;

  private _image?: MemoryImage;

  private _webp: WebPInfo;
  public get webp(): WebPInfo {
    return this._webp;
  }

  constructor(input: InputBuffer<Uint8Array>, webp: WebPInfo) {
    this._input = input;
    this._webp = webp;
    this._br = new VP8LBitReader(input);
  }

  private readTransform(transformSize: number[]): boolean {
    let ok = true;

    const type = this._br.readBits(2);

    // Each transform type can only be present once in the stream.
    if ((this._transformsSeen & (1 << type)) !== 0) {
      return false;
    }
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

  private extractPalettedAlphaRows(row: number): void {
    const numRows = row - this._lastRow;
    const pIn = new InputBuffer<Uint8Array>({
      buffer: this._pixels8,
      offset: this._webp.width * this._lastRow,
    });
    if (numRows > 0) {
      this.applyInverseTransformsAlpha(numRows, pIn);
    }
    this._lastRow = row;
  }

  /**
   * Special method for paletted alpha data.
   */
  private applyInverseTransformsAlpha(
    numRows: number,
    rows: InputBuffer<Uint8Array>
  ): void {
    const startRow = this._lastRow;
    const endRow = startRow + numRows;
    const rowsOut = new InputBuffer<Uint8Array>({
      buffer: this._opaque!,
      offset: this._ioWidth! * startRow,
    });
    this._transforms[0].colorIndexInverseTransformAlpha(
      startRow,
      endRow,
      rows,
      rowsOut
    );
  }

  /**
   * Processes (transforms, scales & color-converts) the rows decoded after the
   * last call.
   */
  private processRows(row: number): void {
    // offset into _pixels
    const rows = this._webp.width * this._lastRow;
    const numRows = row - this._lastRow;

    if (numRows <= 0) {
      // nothing to be done
      return;
    }

    this.applyInverseTransforms(numRows, rows);

    for (
      let y = 0, pi = this._argbCache!, dy = this._lastRow;
      y < numRows;
      ++y, ++dy
    ) {
      for (let x = 0; x < this._webp.width; ++x, ++pi) {
        const c = this._pixels![pi];

        const r = ColorUtils.uint32ToRed(c);
        const g = ColorUtils.uint32ToGreen(c);
        const b = ColorUtils.uint32ToBlue(c);
        const a = ColorUtils.uint32ToAlpha(c);
        // rearrange the ARGB webp color to RGBA image color
        this._image!.setPixelRgba(x, dy, b, g, r, a);
      }
    }

    this._lastRow = row;
  }

  private applyInverseTransforms(numRows: number, rows: number): void {
    let n = this._transforms.length;
    const cachePixs = this._webp.width * numRows;
    const startRow = this._lastRow;
    const endRow = startRow + numRows;
    let rowsIn = rows;
    const rowsOut = this._argbCache!;

    // Inverse transforms
    ArrayUtils.copyRange(
      this._pixels!,
      rowsIn,
      this._pixels!,
      rowsOut,
      cachePixs
    );

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
  }

  private readHuffmanCodes(
    xSize: number,
    ySize: number,
    colorCacheBits: number,
    allowRecursion: boolean
  ): boolean {
    let huffmanImage: Uint32Array | undefined = undefined;
    let numHtreeGroups = 1;

    if (allowRecursion && this._br.readBits(1) !== 0) {
      // use meta Huffman codes
      const huffmanPrecision = this._br.readBits(3) + 2;
      const huffmanXsize = VP8L.subSampleSize(xSize, huffmanPrecision);
      const huffmanYsize = VP8L.subSampleSize(ySize, huffmanPrecision);
      const huffmanPixs = huffmanXsize * huffmanYsize;

      huffmanImage = this.decodeImageStream(huffmanXsize, huffmanYsize, false);

      this._huffmanSubsampleBits = huffmanPrecision;

      for (let i = 0; i < huffmanPixs; ++i) {
        // The huffman data is stored in red and green bytes
        const group = (huffmanImage![i] >>> 8) & 0xffff;
        huffmanImage![i] = group;
        if (group >= numHtreeGroups) {
          numHtreeGroups = group + 1;
        }
      }
    }

    const htreeGroups = ArrayUtils.generate<HuffmanTreeGroup>(
      numHtreeGroups,
      () => new HuffmanTreeGroup()
    );
    for (let i = 0; i < numHtreeGroups; ++i) {
      for (let j = 0; j < VP8L.huffmanCodesPerMetaCode; ++j) {
        let alphabetSize = VP8L.alphabetSize[j];
        if (j === 0 && colorCacheBits > 0) {
          alphabetSize += 1 << colorCacheBits;
        }

        if (!this.readHuffmanCode(alphabetSize, htreeGroups[i].htrees[j])) {
          return false;
        }
      }
    }

    // Everything is OK. Finalize pointers and return
    this._huffmanImage = huffmanImage;
    this._numHtreeGroups = numHtreeGroups;
    this._htreeGroups = htreeGroups;

    return true;
  }

  private readHuffmanCode(alphabetSize: number, tree: HuffmanTree): boolean {
    let ok = false;
    const simpleCode = this._br.readBits(1);

    // Read symbols, codes & code lengths directly.
    if (simpleCode !== 0) {
      const symbols = [0, 0];
      const codes = [0, 0];
      const codeLengths = [0, 0];

      const numSymbols = this._br.readBits(1) + 1;
      const firstSymbolLenCode = this._br.readBits(1);

      // The first code is either 1 bit or 8 bit code.
      symbols[0] = this._br.readBits(firstSymbolLenCode === 0 ? 1 : 8);
      codes[0] = 0;
      codeLengths[0] = numSymbols - 1;

      // The second code (if present), is always 8 bit long.
      if (numSymbols === 2) {
        symbols[1] = this._br.readBits(8);
        codes[1] = 1;
        codeLengths[1] = numSymbols - 1;
      }

      ok = tree.buildExplicit(
        codeLengths,
        codes,
        symbols,
        alphabetSize,
        numSymbols
      );
    } else {
      // Decode Huffman-coded code lengths.
      const codeLengthCodeLengths = new Int32Array(VP8L.numCodeLengthCodes);

      const numCodes = this._br.readBits(4) + 4;
      if (numCodes > VP8L.numCodeLengthCodes) {
        return false;
      }

      const codeLengths = new Int32Array(alphabetSize);

      for (let i = 0; i < numCodes; ++i) {
        codeLengthCodeLengths[VP8L.codeLengthCodeOrder[i]] =
          this._br.readBits(3);
      }

      ok = this.readHuffmanCodeLengths(
        codeLengthCodeLengths,
        alphabetSize,
        codeLengths
      );

      if (ok) {
        ok = tree.buildImplicit(codeLengths, alphabetSize);
      }
    }

    return ok;
  }

  private readHuffmanCodeLengths(
    codeLengthCodeLengths: Int32Array,
    numSymbols: number,
    codeLengths: Int32Array
  ): boolean {
    let symbol: number = 0;
    let maxSymbol: number = 0;
    let prevCodeLen = VP8L.defaultCodeLength;
    const tree = new HuffmanTree();

    if (!tree.buildImplicit(codeLengthCodeLengths, VP8L.numCodeLengthCodes)) {
      return false;
    }

    if (this._br.readBits(1) !== 0) {
      // use length
      const lengthNBits = 2 + 2 * this._br.readBits(3);
      maxSymbol = 2 + this._br.readBits(lengthNBits);
      if (maxSymbol > numSymbols) {
        return false;
      }
    } else {
      maxSymbol = numSymbols;
    }

    symbol = 0;
    while (symbol < numSymbols) {
      let codeLen: number = 0;
      if (maxSymbol-- === 0) {
        break;
      }

      this._br.fillBitWindow();

      codeLen = tree.readSymbol(this._br);

      if (codeLen < VP8L.codeLengthLiterals) {
        codeLengths[symbol++] = codeLen;
        if (codeLen !== 0) {
          prevCodeLen = codeLen;
        }
      } else {
        const usePrev = codeLen === VP8L.codeLengthRepeatCode;
        const slot = codeLen - VP8L.codeLengthLiterals;
        const extraBits = VP8L.codeLengthExtraBits[slot];
        const repeatOffset = VP8L.codeLengthRepeatOffsets[slot];
        let repeat = this._br.readBits(extraBits) + repeatOffset;

        if (symbol + repeat > numSymbols) {
          return false;
        } else {
          const length = usePrev ? prevCodeLen : 0;
          while (repeat-- > 0) {
            codeLengths[symbol++] = length;
          }
        }
      }
    }

    return true;
  }

  private getCopyDistance(distanceSymbol: number): number {
    if (distanceSymbol < 4) {
      return distanceSymbol + 1;
    }
    const extraBits = (distanceSymbol - 2) >>> 1;
    const offset = (2 + (distanceSymbol & 1)) << extraBits;
    return offset + this._br.readBits(extraBits) + 1;
  }

  private getCopyLength(lengthSymbol: number): number {
    return this.getCopyDistance(lengthSymbol);
  }

  private planeCodeToDistance(xsize: number, planeCode: number): number {
    if (planeCode > VP8L.codeToPlaneCodes) {
      return planeCode - VP8L.codeToPlaneCodes;
    } else {
      const distCode = VP8L.codeToPlane[planeCode - 1];
      const yoffset = distCode >>> 4;
      const xoffset = 8 - (distCode & 0xf);
      const dist = yoffset * xsize + xoffset;
      // dist<1 can happen if xsize is very small
      return dist >= 1 ? dist : 1;
    }
  }

  /**
   * For security reason, we need to remap the color map to span
   * the total possible bundled values, and not just the **numColors**.
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

  private getMetaIndex(
    image: Uint32Array | undefined,
    xsize: number,
    bits: number,
    x: number,
    y: number
  ): number {
    if (bits === 0) {
      return 0;
    }
    return image![xsize * (y >>> bits) + (x >>> bits)];
  }

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

  protected allocateInternalBuffers32b(): boolean {
    const numPixels = this._webp.width * this._webp.height;
    // Scratch buffer corresponding to top-prediction row for transforming the
    // first row in the row-blocks. Not needed for paletted alpha.
    const cacheTopPixels = this._webp.width;
    // Scratch buffer for temporary BGRA storage. Not needed for paletted alpha.
    const cachePixels = this._webp.width * VP8L.numArgbCacheRows;
    const totalNumPixels = numPixels + cacheTopPixels + cachePixels;

    const pixels32 = new Uint32Array(totalNumPixels);
    this._pixels = pixels32;
    this._pixels8 = new Uint8Array(pixels32.buffer);
    this._argbCache = numPixels + cacheTopPixels;

    return true;
  }

  protected allocateInternalBuffers8b(): boolean {
    const totalNumPixels = this._webp.width * this._webp.height;
    this._argbCache = 0;
    // pad the byteBuffer to a multiple of 4
    const n = totalNumPixels + (4 - (totalNumPixels % 4));
    this._pixels8 = new Uint8Array(n);
    this._pixels = new Uint32Array(this._pixels8.buffer);
    return true;
  }

  protected decodeImageStream(
    xsize: number,
    ysize: number,
    isLevel0: boolean
  ): Uint32Array | undefined {
    let transformXsize = xsize;
    let transformYsize = ysize;
    let colorCacheBits = 0;

    // Read the transforms (may recurse).
    if (isLevel0) {
      while (this._br.readBits(1) !== 0) {
        const sizes = [transformXsize, transformYsize];
        if (!this.readTransform(sizes)) {
          throw new LibError('Invalid Transform');
        }
        transformXsize = sizes[0];
        transformYsize = sizes[1];
      }
    }

    // Color cache
    if (this._br.readBits(1) !== 0) {
      colorCacheBits = this._br.readBits(4);
      const ok = colorCacheBits >= 1 && colorCacheBits <= VP8L.maxCacheBits;
      if (!ok) {
        throw new LibError('Invalid Color Cache');
      }
    }

    // Read the Huffman codes (may recurse).
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

    // Finish setting up the color-cache
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
      // Reset for future DECODE_DATA_FUNC() calls.
      this._lastPixel = 0;
      return undefined;
    }

    const totalSize = transformXsize * transformYsize;
    const data = new Uint32Array(totalSize);

    // Use the Huffman trees to decode the LZ77 encoded data.
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

    // Reset for future DECODE_DATA_FUNC() calls.
    this._lastPixel = 0;

    return data;
  }

  protected decodeImageData(
    data: Uint32Array,
    width: number,
    height: number,
    lastRow: number,
    processFunc?: (_: number) => void
  ): boolean {
    let row = Math.trunc(this._lastPixel / width);
    let col = this._lastPixel % width;

    let htreeGroup = this.getHtreeGroupForPos(col, row);

    let src = this._lastPixel;
    let lastCached = src;
    // End of data
    const srcEnd = width * height;
    // Last pixel to decode
    const srcLast = width * lastRow;

    const lenCodeLimit = VP8L.numLiteralCodes + VP8L.numLengthCodes;
    const colorCacheLimit = lenCodeLimit + this._colorCacheSize;

    const colorCache = this._colorCacheSize > 0 ? this._colorCache : undefined;
    const mask = this._huffmanMask;

    while (!this._br.isEOS && src < srcLast) {
      if ((col & mask) === 0) {
        htreeGroup = this.getHtreeGroupForPos(col, row);
      }

      this._br.fillBitWindow();
      const code = htreeGroup.htrees[VP8L.green].readSymbol(this._br);

      if (code < VP8L.numLiteralCodes) {
        // Literal
        const red = htreeGroup.htrees[VP8L.red].readSymbol(this._br);
        const green = code;
        this._br.fillBitWindow();
        const blue = htreeGroup.htrees[VP8L.blue].readSymbol(this._br);
        const alpha = htreeGroup.htrees[VP8L.alpha].readSymbol(this._br);

        const c = ColorUtils.rgbaToUint32(blue, green, red, alpha);
        data[src] = c;

        ++src;
        ++col;

        if (col >= width) {
          col = 0;
          ++row;
          if (row % VP8L.numArgbCacheRows === 0 && processFunc !== undefined) {
            processFunc.call(this, row);
          }

          if (colorCache !== undefined) {
            while (lastCached < src) {
              colorCache.insert(data[lastCached]);
              lastCached++;
            }
          }
        }
      } else if (code < lenCodeLimit) {
        // Backward reference
        const lengthSym = code - VP8L.numLiteralCodes;
        const length = this.getCopyLength(lengthSym);
        const distSymbol = htreeGroup.htrees[VP8L.dist].readSymbol(this._br);

        this._br.fillBitWindow();
        const distCode = this.getCopyDistance(distSymbol);
        const dist = this.planeCodeToDistance(width, distCode);

        if (src < dist || srcEnd - src < length) {
          return false;
        } else {
          const dst = src - dist;
          for (let i = 0; i < length; ++i) {
            data[src + i] = data[dst + i];
          }
          src += length;
        }
        col += length;
        while (col >= width) {
          col -= width;
          ++row;
          if (row % VP8L.numArgbCacheRows === 0 && processFunc !== undefined) {
            processFunc.call(this, row);
          }
        }
        if (src < srcLast) {
          if ((col & mask) !== 0) {
            htreeGroup = this.getHtreeGroupForPos(col, row);
          }
          if (colorCache !== undefined) {
            while (lastCached < src) {
              colorCache.insert(data[lastCached]);
              lastCached++;
            }
          }
        }
      } else if (code < colorCacheLimit) {
        // Color cache
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
          if (row % VP8L.numArgbCacheRows === 0 && processFunc !== undefined) {
            processFunc.call(this, row);
          }

          while (lastCached < src) {
            colorCache!.insert(data[lastCached]);
            lastCached++;
          }
        }
      } else {
        // Not reached
        return false;
      }
    }

    // Process the remaining rows corresponding to last row-block.
    if (processFunc !== undefined) {
      processFunc.call(this, row);
    }

    if (this._br.isEOS && src < srcEnd) {
      return false;
    }

    this._lastPixel = src;

    return true;
  }

  /**
   * Row-processing for the special case when alpha data contains only one
   * transform (color indexing), and trivial non-green literals.
   */
  protected is8bOptimizable(): boolean {
    if (this._colorCacheSize > 0) {
      return false;
    }
    // When the Huffman tree contains only one symbol, we can skip the
    // call to readSymbol() for red/blue/alpha channels.
    for (let i = 0; i < this._numHtreeGroups; ++i) {
      const htrees = this._htreeGroups[i].htrees;
      if (htrees[VP8L.red].numNodes > 1) {
        return false;
      }
      if (htrees[VP8L.blue].numNodes > 1) {
        return false;
      }
      if (htrees[VP8L.alpha].numNodes > 1) {
        return false;
      }
    }
    return true;
  }

  /**
   * Special row-processing that only stores the alpha data.
   */
  protected extractAlphaRows(row: number): void {
    const numRows = row - this._lastRow;
    if (numRows <= 0) {
      // Nothing to be done
      return;
    }

    this.applyInverseTransforms(numRows, this._webp.width * this._lastRow);

    // Extract alpha (which is stored in the green plane).
    // the final width
    const width = this._webp.width;
    const cachePixs = width * numRows;

    const di = width * this._lastRow;
    const src = new InputBuffer<Uint32Array>({
      buffer: this._pixels!,
      offset: this._argbCache!,
    });

    for (let i = 0; i < cachePixs; ++i) {
      this._opaque![di + i] = (src.get(i) >>> 8) & 0xff;
    }

    this._lastRow = row;
  }

  protected decodeAlphaData(
    width: number,
    height: number,
    lastRow: number
  ): boolean {
    let row = Math.trunc(this._lastPixel / width);
    let col = this._lastPixel % width;

    let htreeGroup = this.getHtreeGroupForPos(col, row);
    // current position
    let pos = this._lastPixel;
    // End of data
    const end = width * height;
    // Last pixel to decode
    const last = width * lastRow;
    const lenCodeLimit = VP8L.numLiteralCodes + VP8L.numLengthCodes;
    const mask = this._huffmanMask;

    while (!this._br.isEOS && pos < last) {
      // Only update when changing tile.
      if ((col & mask) === 0) {
        htreeGroup = this.getHtreeGroupForPos(col, row);
      }

      this._br.fillBitWindow();

      const code = htreeGroup.htrees[VP8L.green].readSymbol(this._br);
      if (code < VP8L.numLiteralCodes) {
        // Literal
        this._pixels8[pos] = code;
        ++pos;
        ++col;
        if (col >= width) {
          col = 0;
          ++row;
          if (row % VP8L.numArgbCacheRows === 0) {
            this.extractPalettedAlphaRows(row);
          }
        }
      } else if (code < lenCodeLimit) {
        // Backward reference
        const lengthSym = code - VP8L.numLiteralCodes;
        const length = this.getCopyLength(lengthSym);
        const distSymbol = htreeGroup.htrees[VP8L.dist].readSymbol(this._br);

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
          if (row % VP8L.numArgbCacheRows === 0) {
            this.extractPalettedAlphaRows(row);
          }
        }

        if (pos < last && (col & mask) !== 0) {
          htreeGroup = this.getHtreeGroupForPos(col, row);
        }
      } else {
        // Not reached
        return false;
      }
    }

    // Process the remaining rows corresponding to last row-block.
    this.extractPalettedAlphaRows(row);

    this._lastPixel = pos;

    return true;
  }

  public decodeHeader(): boolean {
    const signature = this._br.readBits(8);
    if (signature !== VP8L.vp8lMagicByte) {
      return false;
    }

    this._webp.format = WebPFormat.lossless;
    this._webp.width = this._br.readBits(14) + 1;
    this._webp.height = this._br.readBits(14) + 1;
    this._webp.hasAlpha = this._br.readBits(1) !== 0;
    const version = this._br.readBits(3);

    if (version !== VP8L.vp8lVersion) {
      return false;
    }

    return true;
  }

  public decode(): MemoryImage | undefined {
    this._lastPixel = 0;

    if (!this.decodeHeader()) {
      return undefined;
    }

    this.decodeImageStream(this._webp.width, this._webp.height, true);

    this.allocateInternalBuffers32b();

    this._image = new MemoryImage({
      width: this._webp.width,
      height: this._webp.height,
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
   * Computes sampled size of **size** when sampling using **samplingBits**.
   */
  protected static subSampleSize(size: number, samplingBits: number): number {
    return (size + (1 << samplingBits) - 1) >>> samplingBits;
  }

  public static readonly green = 0;
  public static readonly red = 1;
  public static readonly blue = 2;
  public static readonly alpha = 3;
  public static readonly dist = 4;

  public static readonly numArgbCacheRows = 16;

  public static readonly numCodeLengthCodes = 19;

  public static readonly codeLengthCodeOrder: number[] = [
    17, 18, 0, 1, 2, 3, 4, 5, 16, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  ];

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

  public static readonly codeLengthLiterals = 16;
  public static readonly codeLengthRepeatCode = 16;
  public static readonly codeLengthExtraBits = [2, 3, 7];
  public static readonly codeLengthRepeatOffsets = [3, 3, 11];

  public static readonly argbBlack = 0xff000000;
  public static readonly maxCacheBits = 11;
  public static readonly huffmanCodesPerMetaCode = 5;

  public static readonly defaultCodeLength = 8;
  public static readonly maxAllowedCodeLength = 15;

  public static readonly numLiteralCodes = 256;
  public static readonly numLengthCodes = 24;
  public static readonly numDistanceCodes = 40;
  public static readonly codeLengthCodes = 19;

  public static readonly alphabetSize = [
    VP8L.numLiteralCodes + VP8L.numLengthCodes,
    VP8L.numLiteralCodes,
    VP8L.numLiteralCodes,
    VP8L.numLiteralCodes,
    VP8L.numDistanceCodes,
  ];

  public static readonly vp8lMagicByte = 0x2f;
  public static readonly vp8lVersion = 0;
}
