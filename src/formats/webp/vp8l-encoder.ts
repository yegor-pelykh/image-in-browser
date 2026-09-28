/** @format */

import { MathUtils } from '../../common/math-utils.js';
import { OutputBuffer } from '../../common/output-buffer.js';
import { LibError } from '../../error/lib-error.js';
import { MemoryImage } from '../../image/image.js';
import { analyzeEntropy } from './vp8l-analysis.js';
import {
  VP8LCostModel,
  VP8LCover,
  VP8LMatches,
  computeMatches,
  refsFromCover,
} from './vp8l-backward-refs.js';
import { VP8LBitWriter } from './vp8l-bit-writer.js';
import * as colorCache from './vp8l-color-cache-encoder.js';
import {
  VP8LColorMultipliers,
  applyCrossColor,
  selectCrossColor,
} from './vp8l-cross-color.js';
import { VP8LHuffmanCodes } from './vp8l-huffman-codes.js';
import * as huffman from './vp8l-huffman-encoder.js';
import { VP8LHistogram, clusterHistograms } from './vp8l-histogram.js';
import { VP8LMetaHuffman } from './vp8l-meta-huffman.js';
import { optimalCover } from './vp8l-optimal-parse.js';
import * as predictor from './vp8l-predictor.js';
import { clearTransparentPixels } from './vp8l-transparency.js';

/**
 * The largest image WebP can carry, in either direction.
 *
 * libwebp calls this WEBP_MAX_DIMENSION. The VP8L header stores each
 * dimension less one in fourteen bits, so 16384 would fit there, but the
 * container caps it a pixel lower.
 */
export const maxDimension = 16383;

/**
 * The meta Huffman block size is stored as a three bit value offset by two.
 */
const minHuffmanBits = 2;
const numHuffmanBits = 3;

/**
 * Encodes an image into the VP8L bitstream, without the RIFF container.
 */
export class VP8LEncoder {
  /**
   * Whether the colour hidden under fully transparent pixels must be kept
   *
   * Clearing it flattens those pixels into long runs, which is what cwebp
   * does unless given its own `-exact`
   */
  public readonly exact: boolean;

  constructor(opt: { exact?: boolean } = {}) {
    this.exact = opt.exact ?? false;
  }

  public encodeVP8L(image: MemoryImage): Uint8Array {
    const width = image.width;
    const height = image.height;
    if (
      width <= 0 ||
      height <= 0 ||
      width > maxDimension ||
      height > maxDimension
    ) {
      // The VP8L header has fourteen bits for each dimension. Silently letting
      // one overflow into the next field produces a stream that no decoder can
      // read, so refuse instead. Zero is stored less one, so it would say
      // 16384.
      throw new LibError(
        'WebP images must be between 1x1 and ' +
          `${maxDimension}x${maxDimension}, got ${width}x${height}`
      );
    }

    const numPixels = width * height;
    const g = new Uint8Array(numPixels);
    const r = new Uint8Array(numPixels);
    const b = new Uint8Array(numPixels);
    const a = new Uint8Array(numPixels);

    // Two channels is luminance and alpha.
    const hasAlpha = image.hasAlpha;
    // Pixel.g and Pixel.b answer zero for a one channel image, so reading
    // them writes the picture in red
    const grey = image.numChannels === 1;
    // WebP carries eight bits a channel, so a deeper image is scaled, not
    // clamped: clamping turns everything above 255 white.
    const maxValue = image.maxChannelValue;
    const scale = maxValue === 255 ? 1.0 : 255.0 / maxValue;
    let alphaIsUsed = false;
    let i = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = image.getPixel(x, y);
        const pg = grey ? p.r : p.g;
        const pb = grey ? p.r : p.b;
        if (scale === 1.0) {
          g[i] = MathUtils.clampInt255(pg);
          r[i] = MathUtils.clampInt255(p.r);
          b[i] = MathUtils.clampInt255(pb);
          a[i] = hasAlpha ? MathUtils.clampInt255(p.a) : 255;
        } else {
          g[i] = MathUtils.clampInt255(Math.round(pg * scale));
          r[i] = MathUtils.clampInt255(Math.round(p.r * scale));
          b[i] = MathUtils.clampInt255(Math.round(pb * scale));
          a[i] = hasAlpha
            ? MathUtils.clampInt255(Math.round(p.a * scale))
            : 255;
        }
        if (a[i] !== 255) alphaIsUsed = true;
        i++;
      }
    }

    // VP8L image header: signature byte 0x2f + 28-bit header (w-1, h-1,
    // alpha_is_used, version=0) packed little-endian. alpha_is_used is a hint
    // and reports whether the image actually carries transparency, not merely
    // whether it has an alpha channel, which is what libwebp records too.
    const header =
      (width - 1) | ((height - 1) << 14) | ((alphaIsUsed ? 1 : 0) << 28);
    const out = new OutputBuffer();
    out.writeByte(0x2f);
    out.writeByte(header & 0xff);
    out.writeByte((header >> 8) & 0xff);
    out.writeByte((header >> 16) & 0xff);
    out.writeByte((header >> 24) & 0xff);
    out.writeBytes(this.encodeStream(r, g, b, a, width, height, alphaIsUsed));
    return out.getBytes();
  }

  /**
   * Encodes four colour planes as a bare VP8L stream, with no image header.
   *
   * The alpha channel of a lossy file is carried this way: it is a VP8L image
   * in its own right, but its size is already known from the frame, so the
   * header would only repeat it.
   */
  public encodeStream(
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    a: Uint8Array,
    width: number,
    height: number,
    alphaIsUsed: boolean
  ): Uint8Array {
    // 16x16 predictor blocks, which is what libwebp settles on at its highest
    // effort (GetTransformBits caps the transform at 4 bits there). Measured
    // against 32x32 on both a screenshot corpus and the test images, it codes
    // about 0.75% smaller for the same time.
    const predSizeBits = 4;
    const predBlockSize = 1 << predSizeBits;
    const predBlockW = Math.trunc((width + predBlockSize - 1) / predBlockSize);
    const predBlockH = Math.trunc((height + predBlockSize - 1) / predBlockSize);
    const numPixels = width * height;

    // Pack once here: the predictors are written on a packed ARGB word, the
    // transform analysis wants the pixels as they came in, and flattening the
    // transparent areas is easiest on the same representation.
    const argb = new Uint32Array(numPixels);
    for (let i = 0; i < numPixels; i++) {
      argb[i] = (a[i] << 24) | (r[i] << 16) | (g[i] << 8) | b[i];
    }

    // Done before the palette is counted, since flattening collapses whatever
    // colours were hiding under transparent pixels and can bring an image
    // under the palette limit.
    if (!this.exact && alphaIsUsed) {
      clearTransparentPixels(argb);
      for (let i = 0; i < numPixels; i++) {
        const v = argb[i];
        r[i] = (v >> 16) & 0xff;
        g[i] = (v >> 8) & 0xff;
        b[i] = v & 0xff;
      }
    }

    // An image with few distinct colors codes far more compactly as palette
    // indices than as full pixels, so prefer the color indexing transform.
    const palette = this.buildPalette(r, g, b, a, numPixels);
    if (palette !== undefined) {
      const bw = new VP8LBitWriter();
      this.writePaletteImage(bw, palette, r, g, b, a, width, height);
      bw.flush();
      return bw.getBytes();
    }

    // Which transforms are worth carrying is decided from one pass over the
    // pixels rather than by building the stream each way and comparing. The
    // estimate is not exact, but every combination built in full costs a whole
    // encode, and this is how libwebp settles the same question.
    const crossBits = predSizeBits;
    const analysis = analyzeEntropy(argb, width, height, predSizeBits);

    if (analysis.useSubtractGreen) {
      this.applySubtractGreenTransform(r, g, b, numPixels);
      for (let i = 0; i < numPixels; i++) {
        argb[i] = (a[i] << 24) | (r[i] << 16) | (g[i] << 8) | b[i];
      }
    }

    let predModes: number[] | undefined = undefined;
    if (analysis.usePredictor) {
      predModes = predictor.selectPredictorModes(
        argb,
        width,
        height,
        predBlockW,
        predBlockH,
        predBlockSize
      );
      predictor.applyPredictorTransform(
        argb,
        r,
        g,
        b,
        a,
        width,
        height,
        predBlockW,
        predBlockSize,
        predModes
      );
    }

    // Prediction residuals still move together across channels, and the
    // cross-color transform fits a small linear model per block to remove what
    // is left.
    let multipliers: VP8LColorMultipliers[] | undefined = undefined;
    if (analysis.useCrossColor) {
      multipliers = selectCrossColor(r, g, b, width, height, crossBits);
      if (multipliers !== undefined) {
        applyCrossColor(r, g, b, width, height, crossBits, multipliers);
      }
    }

    // Transforms are undone in reverse order, so the one written last is undone
    // first.
    const bw = new VP8LBitWriter();
    if (analysis.useSubtractGreen) {
      // has_transform = 1, then transform_type = 2 (SUBTRACT_GREEN).
      bw.writeBits(1, 1);
      bw.writeBits(2, 2);
    }
    if (predModes !== undefined) {
      // has_transform = 1, then transform_type = 0 (PREDICTOR).
      bw.writeBits(1, 1);
      bw.writeBits(0, 2);
      // Predictor block size bits.
      bw.writeBits(predSizeBits - 2, 3);
      predictor.writePredictorSubImage(bw, predBlockW, predBlockH, predModes);
    }
    if (multipliers !== undefined) {
      const crossBlockW = (width + (1 << crossBits) - 1) >> crossBits;
      const crossBlockH = (height + (1 << crossBits) - 1) >> crossBits;
      // has_transform = 1, then transform_type = 1 (CROSS_COLOR).
      bw.writeBits(1, 1);
      bw.writeBits(1, 2);
      bw.writeBits(crossBits - 2, 3);
      this.writeCrossColorSubImage(bw, crossBlockW, crossBlockH, multipliers);
    }
    // has_transform = 0.
    bw.writeBits(0, 1);

    this.writeImageStream(bw, r, g, b, a, width, numPixels, true);
    bw.flush();
    return bw.getBytes();
  }

  /**
   * Writes a VP8L image stream: the color cache flag, the meta Huffman flag,
   * the five Huffman code definitions and the LZ77 token data.
   *
   * {@link width} is the stride used to compute distance plane codes. For a color
   * indexed image that is the packed width, not the image width.
   *
   * {@link isLevel0} must be true only for the main image. The meta Huffman flag is
   * present just there; VP8L._readHuffmanCodes skips it for the sub-images of
   * a transform, so writing it would desynchronize the stream.
   */
  private writeImageStream(
    bw: VP8LBitWriter,
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    a: Uint8Array,
    width: number,
    numPixels: number,
    isLevel0: boolean
  ): void {
    // Weighing a match against a literal needs to know what each costs, which
    // is only knowable once the symbol distribution exists. So take the
    // matches once, price the symbols from the plainest reading of them, and
    // only then choose the cover that actually codes smallest.
    const matches = computeMatches(r, g, b, a, numPixels, width);
    // The greedy cover is dead once priced, and the optimal one is written at
    // exactly the positions read back, so one parse serves both.
    const parse = new VP8LCover(numPixels);
    VP8LEncoder.greedyCover(matches, parse);
    const costs = VP8LCostModel.fromCover(parse, r, g, b, a, width);
    optimalCover(matches, costs, r, g, b, a, width, parse);
    const refs = refsFromCover(parse);
    const tokenIsLit = refs.isLiteral;
    const tokenLitIdx = refs.literalIndex;
    const tokenLen = refs.length;
    const tokenDist = refs.distance;
    const tokenPos = refs.position;

    // Which green and distance symbol a back-reference codes as is fixed by
    // the token. Meta Huffman selection alone would derive it once per
    // candidate block size, on top of the histogram and emit passes, so derive
    // it once here instead.
    const refCount = tokenLen.length;
    const refLenSym = new Int32Array(refCount);
    const refDistSym = new Int32Array(refCount);
    for (let i = 0; i < refCount; i++) {
      refLenSym[i] = huffman.lengthSymbol(tokenLen[i]);
      refDistSym[i] = huffman.prefixCode(
        huffman.distToPlaneCode(width, tokenDist[i])
      );
    }

    // The decoder inserts every pixel into the color cache in raster order and
    // refreshes it right before each lookup, so the cache contents at a given
    // position depend only on the pixels, never on how they were tokenized.
    // That lets several cache sizes be scored without redoing the tokenization.
    const cacheKeys = new Int32Array(tokenLitIdx.length);
    const cacheBits = colorCache.selectColorCacheBits(
      r,
      g,
      b,
      a,
      tokenIsLit,
      tokenLitIdx,
      tokenLen,
      tokenDist,
      width,
      cacheKeys
    );
    const greenAlphabetSize = 280 + (cacheBits > 0 ? 1 << cacheBits : 0);

    if (cacheBits > 0) {
      // Color cache present, followed by its size in bits.
      bw.writeBits(1, 1);
      bw.writeBits(cacheBits, 4);
    } else {
      // No color cache.
      bw.writeBits(0, 1);
    }

    // One set of codes has to serve the whole image unless meta Huffman splits
    // it into regions that each get their own. Sub-images are small and never
    // carry the flag, so only the main image is considered.
    const meta = isLevel0
      ? this.selectMetaHuffman(
          r,
          g,
          b,
          a,
          tokenIsLit,
          tokenLitIdx,
          refLenSym,
          refDistSym,
          tokenPos,
          cacheKeys,
          width,
          numPixels,
          greenAlphabetSize
        )
      : undefined;

    if (isLevel0) {
      if (meta === undefined) {
        // No meta Huffman codes.
        bw.writeBits(0, 1);
      } else {
        bw.writeBits(1, 1);
        bw.writeBits(meta.bits - minHuffmanBits, numHuffmanBits);
        this.writeEntropyImage(bw, meta);
      }
    }

    const numGroups = meta?.clustering.numGroups ?? 1;
    // Which group each token belongs to, resolved once for the two passes that
    // follow. Tokens are in raster order, so the row advances from the
    // previous token rather than being divided out of the position.
    const tokenGroup = new Int32Array(tokenIsLit.length);
    if (meta !== undefined) {
      const assignment = meta.clustering.assignment;
      const bits = meta.bits;
      const xsize = meta.xsize;
      let rowStart = 0;
      let y = 0;
      for (let t = 0; t < tokenIsLit.length; t++) {
        const p = tokenPos[t];
        while (p - rowStart >= width) {
          rowStart += width;
          y++;
        }
        tokenGroup[t] =
          assignment[(y >> bits) * xsize + ((p - rowStart) >> bits)];
      }
    }

    // Count symbols per group. VP8L codes with five alphabets:
    //   green: 256 literals + 24 LZ77 length codes + one per cache entry
    //   red, blue, alpha: 256 each
    //   dist: 40 LZ77 distance prefix codes
    const histograms: VP8LHistogram[] = [];
    for (let i = 0; i < numGroups; i++) {
      histograms.push(new VP8LHistogram(greenAlphabetSize));
    }

    let litPtr = 0;
    let refPtr = 0;
    for (let t = 0; t < tokenIsLit.length; t++) {
      const h = histograms[tokenGroup[t]];
      if (tokenIsLit[t] !== 0) {
        const key = cacheKeys[litPtr];
        const idx = tokenLitIdx[litPtr++];
        if (key >= 0) {
          h.addCacheRef(key);
        } else {
          h.addLiteral(r[idx], g[idx], b[idx], a[idx]);
        }
      } else {
        h.addCopy(refLenSym[refPtr], refDistSym[refPtr]);
        refPtr++;
      }
    }

    // Build and write the code definitions, one full set per group, in the
    // order the decoder reads them.
    const codes: VP8LHuffmanCodes[] = [];
    for (const h of histograms) {
      const c = new VP8LHuffmanCodes(h, greenAlphabetSize);
      c.write(bw);
      codes.push(c);
    }

    // Write token stream.
    litPtr = 0;
    refPtr = 0;
    for (let t = 0; t < tokenIsLit.length; t++) {
      const c = codes[tokenGroup[t]];
      if (tokenIsLit[t] !== 0) {
        const key = cacheKeys[litPtr];
        const idx = tokenLitIdx[litPtr++];
        if (key >= 0) {
          c.writeSymbol(bw, c.green, c.greenLen, 280 + key);
        } else {
          c.writeSymbol(bw, c.green, c.greenLen, g[idx]);
          c.writeSymbol(bw, c.red, c.redLen, r[idx]);
          c.writeSymbol(bw, c.blue, c.blueLen, b[idx]);
          c.writeSymbol(bw, c.alpha, c.alphaLen, a[idx]);
        }
      } else {
        const len = tokenLen[refPtr];
        const dist = tokenDist[refPtr];
        refPtr++;

        // Write length prefix in the green channel.
        c.writeSymbol(bw, c.green, c.greenLen, huffman.lengthSymbol(len));
        const lExtra = huffman.lengthExtra(len);
        if (lExtra.extraBits > 0) {
          bw.writeBits(lExtra.extraValue, lExtra.extraBits);
        }

        // Write distance prefix in the dist channel.
        const planeCode = huffman.distToPlaneCode(width, dist);
        c.writeSymbol(bw, c.dist, c.distLen, huffman.prefixCode(planeCode));
        const dExtra = huffman.prefixExtra(planeCode);
        if (dExtra.extraBits > 0) {
          bw.writeBits(dExtra.extraValue, dExtra.extraBits);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Meta Huffman
  // ---------------------------------------------------------------------------

  /**
   * Block sizes the meta Huffman search considers, as VP8L's precision value
   * (a block spans 2^bits pixels). The format allows 2..9.
   * Entropy image block sizes to weigh against each other.
   *
   * libwebp computes a single size by formula (`GetHistoBits`) rather than
   * trying any. Measured here: the formula is 4.6% faster but costs 0.13
   * points on Kodak and 0.44 on the PNG suite, because on smaller images the
   * entropy image is cheap enough that a finer split pays. Large images are
   * unaffected, since {@link _maxEntropyImageSize} already rules the finer sizes out
   * for them.
   */
  private static readonly _metaHuffmanCandidates = [4, 5, 6];

  /**
   * Most blocks an entropy image may be split into, libwebp's
   * MAX_HUFF_IMAGE_SIZE.
   *
   * Past this the entropy image costs more to describe than the finer
   * statistics save, so libwebp raises the block size until it fits rather
   * than considering the finer split at all. Skipping those candidates costs
   * nothing measurable in size and is a good deal of the selection time: on a
   * 1922x1107 screenshot the 16-pixel candidate alone builds 8470 histograms.
   */
  private static readonly _maxEntropyImageSize = 2600;

  /**
   * Chooses a block size and a grouping of blocks, or undefined when a single set
   * of codes for the whole image is no more expensive.
   */
  private selectMetaHuffman(
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    a: Uint8Array,
    tokenIsLit: Uint8Array,
    tokenLitIdx: Int32Array,
    refLenSym: Int32Array,
    refDistSym: Int32Array,
    tokenPos: Int32Array,
    cacheKeys: Int32Array,
    width: number,
    numPixels: number,
    greenAlphabetSize: number
  ): VP8LMetaHuffman | undefined {
    const height = Math.trunc(numPixels / width);
    let best: VP8LMetaHuffman | undefined = undefined;

    for (const bits of VP8LEncoder._metaHuffmanCandidates) {
      const xsize = VP8LEncoder.subSampleSize(width, bits);
      const ysize = VP8LEncoder.subSampleSize(height, bits);
      if (
        xsize * ysize < 2 ||
        xsize * ysize > VP8LEncoder._maxEntropyImageSize
      ) {
        continue;
      }

      const blocks: VP8LHistogram[] = [];
      for (let i = 0; i < xsize * ysize; i++) {
        blocks.push(new VP8LHistogram(greenAlphabetSize));
      }

      let litPtr = 0;
      let refPtr = 0;
      // Tokens come in raster order, so the row a token starts in is reached
      // by advancing from the previous one. Dividing the position by the width
      // instead costs a real integer division per token, and this loop runs
      // once per candidate block size.
      let rowStart = 0;
      let y = 0;
      for (let t = 0; t < tokenIsLit.length; t++) {
        const p = tokenPos[t];
        while (p - rowStart >= width) {
          rowStart += width;
          y++;
        }
        const h = blocks[(y >> bits) * xsize + ((p - rowStart) >> bits)];
        if (tokenIsLit[t] !== 0) {
          const key = cacheKeys[litPtr];
          const idx = tokenLitIdx[litPtr++];
          if (key >= 0) {
            h.addCacheRef(key);
          } else {
            h.addLiteral(r[idx], g[idx], b[idx], a[idx]);
          }
        } else {
          h.addCopy(refLenSym[refPtr], refDistSym[refPtr]);
          refPtr++;
        }
      }

      const clustering = clusterHistograms(blocks);
      if (
        clustering !== undefined &&
        (best === undefined || clustering.cost < best.clustering.cost)
      ) {
        best = new VP8LMetaHuffman(bits, xsize, ysize, clustering);
      }
    }

    return best;
  }

  /**
   * Writes the entropy image, which tells the decoder which group each block
   * belongs to. The index is carried in the red and green bytes.
   */
  private writeEntropyImage(bw: VP8LBitWriter, meta: VP8LMetaHuffman): void {
    const n = meta.xsize * meta.ysize;
    const er = new Uint8Array(n);
    const eg = new Uint8Array(n);
    const eb = new Uint8Array(n);
    const ea = new Uint8Array(n).fill(255);
    for (let i = 0; i < n; i++) {
      const group = meta.clustering.assignment[i];
      // The format carries a 16 bit group index across the red and green
      // bytes. clusterHistograms caps the count far below 256, so the red byte
      // is always zero in practice; writing it anyway keeps this correct if
      // that cap is ever raised.
      er[i] = (group >> 8) & 0xff;
      eg[i] = group & 0xff;
    }
    this.writeImageStream(bw, er, eg, eb, ea, meta.xsize, n, false);
  }

  // ---------------------------------------------------------------------------
  // Transforms
  // ---------------------------------------------------------------------------

  /**
   * The color indexing transform can address at most this many colors.
   */
  private static readonly _maxPaletteSize = 256;

  /**
   * The distinct colors of the image in ascending ARGB order, or undefined if the
   * image holds more than {@link _maxPaletteSize} of them.
   */
  private buildPalette(
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    a: Uint8Array,
    numPixels: number
  ): Uint32Array | undefined {
    const colors = new Set<number>();
    for (let i = 0; i < numPixels; i++) {
      const argb = ((a[i] << 24) | (r[i] << 16) | (g[i] << 8) | b[i]) >>> 0;
      if (!colors.has(argb)) {
        colors.add(argb);
        if (colors.size > VP8LEncoder._maxPaletteSize) {
          return undefined;
        }
      }
    }
    // Ascending ARGB. libwebp also offers an order that minimises the
    // difference between neighbouring entries, since the palette is stored
    // delta-coded; ported and measured at 360 bytes *worse* over a 587 image
    // corpus. It optimises the palette's own storage, which is at most a few
    // hundred bytes, while the indices it does not touch are the bulk of the
    // data. Its co-occurrence-based sibling (PaletteSortModifiedZeng) targets
    // the indices instead and would be the one to try, but palette images are
    // 0.7% of that corpus by size, so there is little there to win.
    return Uint32Array.from(Array.from(colors).sort((x, y) => x - y));
  }

  /**
   * How many index bits are packed into a single byte for a palette of
   * {@link numColors} entries. Mirrors the reader in VP8L._readTransform.
   */
  private static paletteBits(numColors: number): number {
    return numColors > 16 ? 0 : numColors > 4 ? 1 : numColors > 2 ? 2 : 3;
  }

  private static subSampleSize(size: number, samplingBits: number): number {
    return (size + (1 << samplingBits) - 1) >> samplingBits;
  }

  /**
   * Writes the color indexing transform followed by the indexed image.
   *
   * The palette itself is stored as a numColors x 1 image stream, and each
   * pixel of the main image is replaced by its palette index carried in the
   * green channel. Neither the subtract-green nor the predictor transform is
   * useful on index data, so neither is emitted here.
   */
  private writePaletteImage(
    bw: VP8LBitWriter,
    palette: Uint32Array,
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    a: Uint8Array,
    width: number,
    height: number
  ): void {
    const numColors = palette.length;

    // has_transform = 1, then transform_type = 3 (COLOR_INDEXING).
    bw.writeBits(1, 1);
    bw.writeBits(3, 2);
    bw.writeBits(numColors - 1, 8);

    // Palette entries are stored as per-channel differences to the previous
    // entry, which the decoder accumulates back in _expandColorMap.
    const pr = new Uint8Array(numColors);
    const pg = new Uint8Array(numColors);
    const pb = new Uint8Array(numColors);
    const pa = new Uint8Array(numColors);
    let prevR = 0;
    let prevG = 0;
    let prevB = 0;
    let prevA = 0;
    for (let i = 0; i < numColors; i++) {
      const c = palette[i];
      const ca = (c >> 24) & 0xff;
      const cr = (c >> 16) & 0xff;
      const cg = (c >> 8) & 0xff;
      const cb = c & 0xff;
      pr[i] = (cr - prevR) & 0xff;
      pg[i] = (cg - prevG) & 0xff;
      pb[i] = (cb - prevB) & 0xff;
      pa[i] = (ca - prevA) & 0xff;
      prevR = cr;
      prevG = cg;
      prevB = cb;
      prevA = ca;
    }
    this.writeImageStream(bw, pr, pg, pb, pa, numColors, numColors, false);

    // has_transform = 0.
    bw.writeBits(0, 1);

    const indexOf = new Map<number, number>();
    for (let i = 0; i < numColors; i++) {
      indexOf.set(palette[i], i);
    }

    const bits = VP8LEncoder.paletteBits(numColors);
    const packedWidth = VP8LEncoder.subSampleSize(width, bits);
    const numPacked = packedWidth * height;
    const indices = new Uint8Array(numPacked);
    // The decoder reads the index out of the green channel and ignores the
    // others, so leaving them at zero costs almost nothing to code.
    const zero = new Uint8Array(numPacked);

    if (bits === 0) {
      for (let i = 0; i < width * height; i++) {
        indices[i] = indexOf.get(
          ((a[i] << 24) | (r[i] << 16) | (g[i] << 8) | b[i]) >>> 0
        )!;
      }
    } else {
      const bitsPerPixel = 8 >> bits;
      const pixelsPerByte = 1 << bits;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = y * width + x;
          const v = indexOf.get(
            ((a[i] << 24) | (r[i] << 16) | (g[i] << 8) | b[i]) >>> 0
          )!;
          indices[y * packedWidth + (x >> bits)] |=
            v << ((x & (pixelsPerByte - 1)) * bitsPerPixel);
        }
      }
    }

    this.writeImageStream(
      bw,
      zero,
      indices,
      zero,
      zero,
      packedWidth,
      numPacked,
      true
    );
  }

  private applySubtractGreenTransform(
    r: Uint8Array,
    g: Uint8Array,
    b: Uint8Array,
    numPixels: number
  ): void {
    for (let i = 0; i < numPixels; i++) {
      r[i] = (r[i] - g[i]) & 0xff;
      b[i] = (b[i] - g[i]) & 0xff;
    }
  }

  /**
   * Takes every match on offer, which is what the symbols have to be priced
   * from before any better cover can be judged.
   */
  private static greedyCover(matches: VP8LMatches, parse: VP8LCover): void {
    const numPixels = parse.numPixels;
    const cover = parse.cover;
    const distance = parse.distance;
    let i = 0;
    while (i < numPixels) {
      const len = matches.lengthAt(i);
      const take = len >= 3 ? len : 1;
      cover[i] = take;
      distance[i] = matches.distanceAt(i);
      i += take;
    }
  }

  /**
   * Writes the cross-color sub-image, one pixel per block holding that
   * block's three multipliers.
   */
  private writeCrossColorSubImage(
    bw: VP8LBitWriter,
    blockW: number,
    blockH: number,
    multipliers: VP8LColorMultipliers[]
  ): void {
    const n = blockW * blockH;
    const cr = new Uint8Array(n);
    const cg = new Uint8Array(n);
    const cb = new Uint8Array(n);
    const ca = new Uint8Array(n).fill(255);
    for (let i = 0; i < n; i++) {
      cr[i] = multipliers[i].red;
      cg[i] = multipliers[i].green;
      cb[i] = multipliers[i].blue;
    }
    this.writeImageStream(bw, cr, cg, cb, ca, blockW, n, false);
  }
}
