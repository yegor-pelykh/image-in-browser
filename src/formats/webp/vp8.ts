/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { InputBuffer } from '../../common/input-buffer.js';
import { MemoryImage } from '../../image/image.js';
import { VP8BandProbas } from './vp8-band-probas.js';
import { VP8BitReader } from './vp8-bit-reader.js';
import { VP8FInfo } from './vp8-f-info.js';
import { VP8Filter } from './vp8-filter.js';
import { VP8FilterHeader } from './vp8-filter-header.js';
import { VP8FrameHeader } from './vp8-frame-header.js';
import { VP8MB } from './vp8-mb.js';
import { VP8MBData } from './vp8-mb-data.js';
import { VP8PictureHeader } from './vp8-picture-header.js';
import { VP8Proba } from './vp8-proba.js';
import { VP8QuantMatrix } from './vp8-quant-matrix.js';
import { VP8SegmentHeader } from './vp8-segment-header.js';
import { VP8TopSamples } from './vp8-top-samples.js';
import { WebPAlpha } from './webp-alpha.js';
import { WebPInfo } from './webp-info.js';
import { WebPInfoInternal } from './webp-info-internal.js';
import { StringUtils } from '../../common/string-utils.js';
import { ExifData } from '../../exif/exif-data.js';

/**
 * WebP lossy format
 */
export class VP8 {
  // headers
  private readonly _frameHeader = new VP8FrameHeader();
  private readonly _picHeader = new VP8PictureHeader();
  private readonly _filterHeader = new VP8FilterHeader();
  private readonly _segmentHeader = new VP8SegmentHeader();

  private _input: InputBuffer<Uint8Array>;

  private readonly _webp: WebPInfoInternal;
  public get webp(): WebPInfo {
    return this._webp;
  }

  // Main data source
  private _br!: VP8BitReader;
  private _dsp!: VP8Filter;
  private _output?: MemoryImage;

  private _cropLeft: number = 0;
  private _cropRight: number = 0;
  private _cropTop: number = 0;
  private _cropBottom: number = 0;
  /**
   * Width in macroblock units
   */
  private _mbWidth: number = 0;
  /**
   * Height in macroblock units
   */
  private _mbHeight: number = 0;

  // Macroblock to process/filter, depending on cropping and filter_type
  // top-left MB that must be in-loop filtered
  private _tlMbX: number = 0;
  private _tlMbY: number = 0;
  // last bottom-right MB that must be decoded
  private _brMbX: number = 0;
  private _brMbY: number = 0;

  /**
   * Number of partitions
   */
  private _numPartitions: number = 0;
  /**
   * Per-partition boolean decoders
   */
  private readonly _partitions: Array<VP8BitReader | undefined> =
    ArrayUtils.fill<VP8BitReader | undefined>(VP8.maxNumPartitions, undefined);

  /**
   * Dithering strength, deduced from decoding options
   * whether to use dithering or not
   */
  private readonly _dither: boolean = false;

  /**
   * Dequantization (one set of DC/AC dequant factor per segment)
   */
  private readonly _dqm: Array<VP8QuantMatrix | undefined> = ArrayUtils.fill<
    VP8QuantMatrix | undefined
  >(VP8.numMbSegments, undefined);

  // probabilities
  private _proba?: VP8Proba;
  private _useSkipProba: boolean = false;
  private _skipP: number = 0;

  // Boundary data cache and persistent buffers.
  /**
   * top intra modes values: 4 * _mbWidth
   */
  private _intraT?: Uint8Array;

  /**
   * left intra modes values
   */
  private readonly _intraL: Uint8Array = new Uint8Array(4);

  /**
   * uint8, segment of the currently parsed block
   */
  private _segment: number = 0;

  /**
   * top y/u/v samples
   */
  private _yuvT!: VP8TopSamples[];

  /**
   * contextual macroblock info (mb_w_ + 1)
   */
  private _mbInfo!: VP8MB[];

  /**
   * filter strength info
   */
  private _fInfo!: Array<VP8FInfo | undefined>;

  /**
   * main block for Y/U/V (size = YUV_SIZE)
   */
  private _yuvBlock!: Uint8Array;

  // macroblock row for storing unfiltered samples
  private _cacheY!: InputBuffer<Uint8Array>;
  private _cacheU!: InputBuffer<Uint8Array>;
  private _cacheV!: InputBuffer<Uint8Array>;
  private _cacheYStride!: number;
  private _cacheUVStride!: number;

  private _tmpY!: InputBuffer<Uint8Array>;
  private _tmpU!: InputBuffer<Uint8Array>;
  private _tmpV!: InputBuffer<Uint8Array>;

  private _y!: InputBuffer<Uint8Array>;
  private _u!: InputBuffer<Uint8Array>;
  private _v!: InputBuffer<Uint8Array>;
  private _a?: InputBuffer<Uint8Array>;

  // Per macroblock non-persistent infos.
  // current position, in macroblock units
  private _mbX: number = 0;
  private _mbY: number = 0;

  /**
   * parsed reconstruction data
   */
  private _mbData!: VP8MBData[];

  /**
   * 0=off, 1=simple, 2=complex
   */
  private _filterType!: number;

  /**
   * precalculated per-segment/type
   */
  private _fStrengths!: Array<Array<VP8FInfo>>;

  /**
   * alpha-plane decoder object
   */
  private _alpha!: WebPAlpha;

  /**
   * compressed alpha data (if present)
   */
  private _alphaData?: InputBuffer<Uint8Array>;
  private _alphaPlane!: Uint8Array;

  constructor(input: InputBuffer<Uint8Array>, webp: WebPInfoInternal) {
    this._input = input;
    this._webp = webp;
  }

  private static clip(v: number, M: number): number {
    return v < 0 ? 0 : v > M ? M : v;
  }

  private static checkMode(
    mbX: number,
    mbY: number,
    mode?: number
  ): number | undefined {
    if (mode === VP8.bDcPred) {
      if (mbX === 0) {
        return mbY === 0 ? VP8.bDcPredNoTopLeft : VP8.bDcPredNoLeft;
      } else {
        return mbY === 0 ? VP8.bDcPredNoTop : VP8.bDcPred;
      }
    }
    return mode;
  }

  private getHeaders(): boolean {
    if (!this.decodeHeader()) {
      return false;
    }

    this._proba = new VP8Proba();
    for (let i = 0; i < VP8.numMbSegments; ++i) {
      this._dqm[i] = new VP8QuantMatrix();
    }

    this._picHeader.width = this._webp.width;
    this._picHeader.height = this._webp.height;
    this._picHeader.xscale = (this._webp.width >>> 8) >>> 6;
    this._picHeader.yscale = (this._webp.height >>> 8) >>> 6;

    this._cropTop = 0;
    this._cropLeft = 0;
    this._cropRight = this._webp.width;
    this._cropBottom = this._webp.height;

    this._mbWidth = (this._webp.width + 15) >>> 4;
    this._mbHeight = (this._webp.height + 15) >>> 4;

    this._segment = 0;

    this._br = new VP8BitReader(
      this._input.subarray(this._frameHeader.partitionLength)
    );
    this._input.skip(this._frameHeader.partitionLength);

    this._picHeader.colorspace = this._br.get();
    this._picHeader.clampType = this._br.get();

    if (!this.parseSegmentHeader(this._segmentHeader, this._proba)) {
      return false;
    }

    // Filter specs
    if (!this.parseFilterHeader()) {
      return false;
    }

    if (!this.parsePartitions(this._input)) {
      return false;
    }

    // quantizer change
    this.parseQuant();

    // Frame buffer marking
    // ignore the value of update_proba_
    this._br.get();

    this.parseProba();

    return true;
  }

  private parseSegmentHeader(hdr: VP8SegmentHeader, proba?: VP8Proba): boolean {
    hdr.useSegment = this._br.get() !== 0;
    if (hdr.useSegment) {
      hdr.updateMap = this._br.get() !== 0;
      if (this._br.get() !== 0) {
        // update data
        hdr.absoluteDelta = this._br.get() !== 0;
        for (let s = 0; s < VP8.numMbSegments; ++s) {
          hdr.quantizer[s] =
            this._br.get() !== 0 ? this._br.getSignedValue(7) : 0;
        }
        for (let s = 0; s < VP8.numMbSegments; ++s) {
          hdr.filterStrength[s] =
            this._br.get() !== 0 ? this._br.getSignedValue(6) : 0;
        }
      }
      if (hdr.updateMap) {
        for (let s = 0; s < VP8.mbFeatureTreeProbs; ++s) {
          proba!.segments[s] =
            this._br.get() !== 0 ? this._br.getValue(8) : 255;
        }
      }
    } else {
      hdr.updateMap = false;
    }

    return true;
  }

  private parseFilterHeader(): boolean {
    const hdr = this._filterHeader;
    this._filterHeader.simple = this._br.get() !== 0;
    this._filterHeader.level = this._br.getValue(6);
    this._filterHeader.sharpness = this._br.getValue(3);
    this._filterHeader.useLfDelta = this._br.get() !== 0;
    if (hdr.useLfDelta) {
      if (this._br.get() !== 0) {
        // update lf-delta?
        for (let i = 0; i < VP8.numRefLfDeltas; ++i) {
          if (this._br.get() !== 0) {
            hdr.refLfDelta[i] = this._br.getSignedValue(6);
          }
        }

        for (let i = 0; i < VP8.numModeLfDeltas; ++i) {
          if (this._br.get() !== 0) {
            hdr.modeLfDelta[i] = this._br.getSignedValue(6);
          }
        }
      }
    }

    this._filterType = hdr.level === 0 ? 0 : hdr.simple ? 1 : 2;

    return true;
  }

  /**
   * This function returns VP8_STATUS_SUSPENDED if we don't have all the
   * necessary data in **input**.
   * This case is not necessarily an error (for incremental decoding).
   * Still, no bitreader is ever initialized to make it possible to read
   * unavailable memory.
   * If we don't even have the partitions sizes, than
   * VP8_STATUS_NOT_ENOUGH_DATA is returned, and this is an unrecoverable error.
   * If the partitions were positioned ok, VP8_STATUS_OK is returned.
   */
  private parsePartitions(input: InputBuffer<Uint8Array>): boolean {
    let sz = 0;
    const bufEnd = input.length;

    this._numPartitions = 1 << this._br.getValue(2);
    const lastPart = this._numPartitions - 1;
    let partStart = lastPart * 3;
    if (bufEnd < partStart) {
      return false;
    }

    for (let p = 0; p < lastPart; ++p) {
      const szb = input.peek(3, sz);
      const psize = szb.get(0) | (szb.get(1) << 8) | (szb.get(2) << 16);
      let partEnd = partStart + psize;
      if (partEnd > bufEnd) {
        partEnd = bufEnd;
      }

      const pin = input.subarray(partEnd - partStart, partStart);
      this._partitions[p] = new VP8BitReader(pin);
      partStart = partEnd;
      sz += 3;
    }

    const pin = input.subarray(bufEnd - partStart, input.position + partStart);
    this._partitions[lastPart] = new VP8BitReader(pin);

    // Init is ok, but there's not enough data
    return partStart < bufEnd;
  }

  private parseQuant(): void {
    const baseQ0 = this._br.getValue(7);
    const dqy1Dc = this._br.get() !== 0 ? this._br.getSignedValue(4) : 0;
    const dqy2Dc = this._br.get() !== 0 ? this._br.getSignedValue(4) : 0;
    const dqy2Ac = this._br.get() !== 0 ? this._br.getSignedValue(4) : 0;
    const dquvDc = this._br.get() !== 0 ? this._br.getSignedValue(4) : 0;
    const dquvAc = this._br.get() !== 0 ? this._br.getSignedValue(4) : 0;

    const hdr = this._segmentHeader;

    for (let i = 0; i < VP8.numMbSegments; ++i) {
      let q: number = 0;
      if (hdr.useSegment) {
        q = hdr.quantizer[i];
        if (!hdr.absoluteDelta) {
          q += baseQ0;
        }
      } else {
        if (i > 0) {
          this._dqm[i] = this._dqm[0];
          continue;
        } else {
          q = baseQ0;
        }
      }

      const m = this._dqm[i]!;
      m.y1Mat[0] = VP8.dcTable[VP8.clip(q + dqy1Dc, 127)];
      m.y1Mat[1] = VP8.acTable[VP8.clip(q + 0, 127)];

      m.y2Mat[0] = VP8.dcTable[VP8.clip(q + dqy2Dc, 127)] * 2;
      // For all x in [0..284], x*155/100 is bitwise equal to (x*101581) >>> 16.
      // The smallest precision for that is '(x*6349) >>> 12' but 16 is a good
      // word size.
      m.y2Mat[1] = (VP8.acTable[VP8.clip(q + dqy2Ac, 127)] * 101581) >>> 16;
      if (m.y2Mat[1] < 8) {
        m.y2Mat[1] = 8;
      }

      m.uvMat[0] = VP8.dcTable[VP8.clip(q + dquvDc, 117)];
      m.uvMat[1] = VP8.acTable[VP8.clip(q + dquvAc, 127)];

      // for dithering strength evaluation
      m.uvQuant = q + dquvAc;
    }
  }

  private parseProba(): void {
    const proba = this._proba;
    for (let t = 0; t < VP8.numTypes; ++t) {
      for (let b = 0; b < VP8.numBands; ++b) {
        for (let c = 0; c < VP8.numCtx; ++c) {
          for (let p = 0; p < VP8.numProbas; ++p) {
            const v =
              this._br.getBit(VP8.coeffsUpdateProba[t][b][c][p]) !== 0
                ? this._br.getValue(8)
                : VP8.coeffsProba0[t][b][c][p];
            proba!.bands[t][b].probas[c][p] = v;
          }
        }
      }
    }

    this._useSkipProba = this._br.get() !== 0;
    if (this._useSkipProba) {
      this._skipP = this._br.getValue(8);
    }
  }

  /**
   * Precompute the filtering strength for each segment and each i4x4/i16x16
   * mode.
   */
  private precomputeFilterStrengths(): void {
    if (this._filterType > 0) {
      const hdr = this._filterHeader;
      for (let s = 0; s < VP8.numMbSegments; ++s) {
        // First, compute the initial level
        let baseLevel: number = 0;
        if (this._segmentHeader.useSegment) {
          baseLevel = this._segmentHeader.filterStrength[s];
          if (!this._segmentHeader.absoluteDelta) {
            baseLevel += hdr.level;
          }
        } else {
          baseLevel = hdr.level;
        }

        for (let i4x4 = 0; i4x4 <= 1; ++i4x4) {
          const info = this._fStrengths[s][i4x4];
          let level = baseLevel;
          if (hdr.useLfDelta) {
            level += hdr.refLfDelta[0];
            if (i4x4 !== 0) {
              level += hdr.modeLfDelta[0];
            }
          }

          level = level < 0 ? 0 : level > 63 ? 63 : level;
          if (level > 0) {
            let iLevel: number = level;
            if (hdr.sharpness > 0) {
              if (hdr.sharpness > 4) {
                iLevel >>>= 2;
              } else {
                iLevel >>>= 1;
              }

              if (iLevel > 9 - hdr.sharpness) {
                iLevel = 9 - hdr.sharpness;
              }
            }

            if (iLevel < 1) {
              iLevel = 1;
            }

            info.fInnerLevel = iLevel;
            info.fLimit = 2 * level + iLevel;
            info.hevThresh = level >= 40 ? 2 : level >= 15 ? 1 : 0;
          } else {
            // no filtering
            info.fLimit = 0;
          }

          info.fInner = i4x4 !== 0;
        }
      }
    }
  }

  private initFrame(): boolean {
    if (this._webp.alphaData !== undefined) {
      this._alphaData = this._webp.alphaData;
    }

    this._fStrengths = ArrayUtils.generate<Array<VP8FInfo>>(
      VP8.numMbSegments,
      () => [new VP8FInfo(), new VP8FInfo()]
    );

    this._yuvT = ArrayUtils.generate<VP8TopSamples>(
      this._mbWidth,
      () => new VP8TopSamples()
    );

    this._yuvBlock = new Uint8Array(VP8.yuvSize);

    this._intraT = new Uint8Array(4 * this._mbWidth);

    this._cacheYStride = 16 * this._mbWidth;
    this._cacheUVStride = 8 * this._mbWidth;

    const extraRows = VP8.filterExtraRows[this._filterType];
    const extraY = extraRows * this._cacheYStride;
    const extraUv = Math.trunc(extraRows / 2) * this._cacheUVStride;

    this._cacheY = new InputBuffer<Uint8Array>({
      buffer: new Uint8Array(16 * this._cacheYStride + extraY),
      offset: extraY,
    });

    this._cacheU = new InputBuffer<Uint8Array>({
      buffer: new Uint8Array(8 * this._cacheUVStride + extraUv),
      offset: extraUv,
    });

    this._cacheV = new InputBuffer<Uint8Array>({
      buffer: new Uint8Array(8 * this._cacheUVStride + extraUv),
      offset: extraUv,
    });

    this._tmpY = new InputBuffer<Uint8Array>({
      buffer: new Uint8Array(this._webp.width),
    });

    const uvWidth = (this._webp.width + 1) >>> 1;
    this._tmpU = new InputBuffer<Uint8Array>({
      buffer: new Uint8Array(uvWidth),
    });
    this._tmpV = new InputBuffer<Uint8Array>({
      buffer: new Uint8Array(uvWidth),
    });

    // Define the area where we can skip in-loop filtering, in case of cropping.
    //
    // 'Simple' filter reads two luma samples outside of the macroblock
    // and filters one. It doesn't filter the chroma samples. Hence, we can
    // avoid doing the in-loop filtering before _cropTop/_cropLeft position.
    // For the 'Complex' filter, 3 samples are read and up to 3 are filtered.
    // Means: there's a dependency chain that goes all the way up to the
    // top-left corner of the picture (MB #0). We must filter all the previous
    // macroblocks.
    {
      const extraPixels = VP8.filterExtraRows[this._filterType];
      if (this._filterType === 2) {
        // For complex filter, we need to preserve the dependency chain.
        this._tlMbX = 0;
        this._tlMbY = 0;
      } else {
        // For simple filter, we can filter only the cropped region.
        // We include 'extraPixels' on the other side of the boundary, since
        // vertical or horizontal filtering of the previous macroblock can
        // modify some abutting pixels.
        this._tlMbX = Math.trunc((this._cropLeft - extraPixels) / 16);
        this._tlMbY = Math.trunc((this._cropTop - extraPixels) / 16);
        if (this._tlMbX < 0) {
          this._tlMbX = 0;
        }
        if (this._tlMbY < 0) {
          this._tlMbY = 0;
        }
      }

      // We need some 'extraPixels' on the right/bottom.
      this._brMbY = Math.trunc((this._cropBottom + 15 + extraPixels) / 16);
      this._brMbX = Math.trunc((this._cropRight + 15 + extraPixels) / 16);
      if (this._brMbX > this._mbWidth) {
        this._brMbX = this._mbWidth;
      }
      if (this._brMbY > this._mbHeight) {
        this._brMbY = this._mbHeight;
      }
    }

    this._mbInfo = ArrayUtils.generate<VP8MB>(
      this._mbWidth + 1,
      () => new VP8MB()
    );
    this._mbData = ArrayUtils.generate<VP8MBData>(
      this._mbWidth,
      () => new VP8MBData()
    );
    this._fInfo = ArrayUtils.fill<VP8FInfo | undefined>(
      this._mbWidth,
      undefined
    );

    this.precomputeFilterStrengths();

    // Init critical function pointers and look-up tables.
    this._dsp = new VP8Filter();
    return true;
  }

  private parseFrame(): boolean {
    for (this._mbY = 0; this._mbY < this._brMbY; ++this._mbY) {
      // Parse bitstream for this row
      const tokenBr = this._partitions[this._mbY & (this._numPartitions - 1)];
      for (; this._mbX < this._mbWidth; ++this._mbX) {
        if (!this.decodeMB(tokenBr)) {
          return false;
        }
      }

      // Prepare for next scanline
      this._mbInfo[0].nz = 0;
      this._mbInfo[0].nzDc = 0;
      this._intraL.fill(VP8.bDcPred);
      this._mbX = 0;

      // Reconstruct, filter and emit the row.
      if (!this.processRow()) {
        return false;
      }
    }

    return true;
  }

  private processRow(): boolean {
    this.reconstructRow();

    const useFilter =
      this._filterType > 0 &&
      this._mbY >= this._tlMbY &&
      this._mbY <= this._brMbY;
    return this.finishRow(useFilter);
  }

  private reconstructRow(): void {
    const mbY = this._mbY;
    const yDst = new InputBuffer<Uint8Array>({
      buffer: this._yuvBlock,
      offset: VP8.yOffset,
    });
    const uDst = new InputBuffer<Uint8Array>({
      buffer: this._yuvBlock,
      offset: VP8.uOffset,
    });
    const vDst = new InputBuffer<Uint8Array>({
      buffer: this._yuvBlock,
      offset: VP8.vOffset,
    });

    for (let mbX = 0; mbX < this._mbWidth; ++mbX) {
      const block = this._mbData[mbX];

      // Rotate in the left samples from previously decoded block. We move four
      // pixels at a time for alignment reason, and because of in-loop filter.
      if (mbX > 0) {
        for (let j = -1; j < 16; ++j) {
          yDst.memcpy(j * VP8.bps - 4, 4, yDst, j * VP8.bps + 12);
        }

        for (let j = -1; j < 8; ++j) {
          uDst.memcpy(j * VP8.bps - 4, 4, uDst, j * VP8.bps + 4);
          vDst.memcpy(j * VP8.bps - 4, 4, vDst, j * VP8.bps + 4);
        }
      } else {
        for (let j = 0; j < 16; ++j) {
          yDst.set(j * VP8.bps - 1, 129);
        }

        for (let j = 0; j < 8; ++j) {
          uDst.set(j * VP8.bps - 1, 129);
          vDst.set(j * VP8.bps - 1, 129);
        }

        // Init top-left sample on left column too
        if (mbY > 0) {
          yDst.set(
            -1 - VP8.bps,
            uDst.set(-1 - VP8.bps, vDst.set(-1 - VP8.bps, 129))
          );
        }
      }

      // bring top samples into the cache
      const topYuv = this._yuvT[mbX];
      const coeffs = block.coeffs;
      let bits = block.nonZeroY;

      if (mbY > 0) {
        yDst.memcpy(-VP8.bps, 16, topYuv.y);
        uDst.memcpy(-VP8.bps, 8, topYuv.u);
        vDst.memcpy(-VP8.bps, 8, topYuv.v);
      } else if (mbX === 0) {
        // we only need to do this init once at block (0,0).
        // Afterward, it remains valid for the whole topmost row.
        yDst.memset(-VP8.bps - 1, 16 + 4 + 1, 127);
        uDst.memset(-VP8.bps - 1, 8 + 1, 127);
        vDst.memset(-VP8.bps - 1, 8 + 1, 127);
      }

      // predict and add residuals
      if (block.isIntra4x4) {
        // 4x4
        const topRight = InputBuffer.from(yDst, -VP8.bps + 16);
        const topRight32 = topRight.toUint32Array();

        if (mbY > 0) {
          if (mbX >= this._mbWidth - 1) {
            // on rightmost border
            topRight.memset(0, 4, topYuv.y[15]);
          } else {
            topRight.memcpy(0, 4, this._yuvT[mbX + 1].y);
          }
        }

        // replicate the top-right pixels below
        const p = topRight32[0];
        topRight32[3 * VP8.bps] = p;
        topRight32[2 * VP8.bps] = p;
        topRight32[VP8.bps] = p;

        // predict and add residuals for all 4x4 blocks in turn.
        for (let n = 0; n < 16; ++n, bits = (bits << 2) & 0xffffffff) {
          const dst = InputBuffer.from(yDst, VP8.kScan[n]);

          VP8Filter.predLuma4[block.imodes[n]](dst);

          this.doTransform(
            bits,
            new InputBuffer<Int16Array>({
              buffer: coeffs,
              offset: n * 16,
            }),
            dst
          );
        }
      } else {
        // 16x16
        const predFunc = VP8.checkMode(mbX, mbY, block.imodes[0])!;

        VP8Filter.predLuma16[predFunc](yDst);
        if (bits !== 0) {
          for (let n = 0; n < 16; ++n, bits = (bits << 2) & 0xffffffff) {
            const dst = InputBuffer.from(yDst, VP8.kScan[n]);

            this.doTransform(
              bits,
              new InputBuffer<Int16Array>({
                buffer: coeffs,
                offset: n * 16,
              }),
              dst
            );
          }
        }
      }

      // Chroma
      const bitsUv = block.nonZeroUV;
      const predFunc = VP8.checkMode(mbX, mbY, block.uvmode)!;
      VP8Filter.predChroma8[predFunc](uDst);
      VP8Filter.predChroma8[predFunc](vDst);

      const c1 = new InputBuffer<Int16Array>({
        buffer: coeffs,
        offset: 16 * 16,
      });
      this.doUVTransform(bitsUv, c1, uDst);

      const c2 = new InputBuffer<Int16Array>({
        buffer: coeffs,
        offset: 20 * 16,
      });
      this.doUVTransform(bitsUv >>> 8, c2, vDst);

      // stash away top samples for next block
      if (mbY < this._mbHeight - 1) {
        ArrayUtils.copyRange(
          yDst.toUint8Array(),
          15 * VP8.bps,
          topYuv.y,
          0,
          16
        );
        ArrayUtils.copyRange(uDst.toUint8Array(), 7 * VP8.bps, topYuv.u, 0, 8);
        ArrayUtils.copyRange(vDst.toUint8Array(), 7 * VP8.bps, topYuv.v, 0, 8);
      }

      // Transfer reconstructed samples from yuv_b_ cache to final destination.
      // dec->cache_y_ +
      const yOut = mbX * 16;
      // dec->cache_u_ +
      const uOut = mbX * 8;
      // _dec->cache_v_ +
      const vOut = mbX * 8;

      for (let j = 0; j < 16; ++j) {
        const start = yOut + j * this._cacheYStride;
        this._cacheY.memcpy(start, 16, yDst, j * VP8.bps);
      }

      for (let j = 0; j < 8; ++j) {
        let start = uOut + j * this._cacheUVStride;
        this._cacheU.memcpy(start, 8, uDst, j * VP8.bps);

        start = vOut + j * this._cacheUVStride;
        this._cacheV.memcpy(start, 8, vDst, j * VP8.bps);
      }
    }
  }

  private doTransform(
    bits: number,
    src: InputBuffer<Int16Array>,
    dst: InputBuffer<Uint8Array>
  ): void {
    switch (bits >>> 30) {
      case 3:
        this._dsp.transform(src, dst, false);
        break;
      case 2:
        this._dsp.transformAC3(src, dst);
        break;
      case 1:
        this._dsp.transformDC(src, dst);
        break;
      default:
        break;
    }
  }

  private doUVTransform(
    bits: number,
    src: InputBuffer<Int16Array>,
    dst: InputBuffer<Uint8Array>
  ): void {
    if ((bits & 0xff) !== 0) {
      // any non-zero coeff at all?
      if ((bits & 0xaa) !== 0) {
        // any non-zero AC coefficient?
        // note we don't use the AC3 variant for U/V
        this._dsp.transformUV(src, dst);
      } else {
        this._dsp.transformDCUV(src, dst);
      }
    }
  }

  private doFilter(mbX: number, mbY: number): void {
    const yBps = this._cacheYStride;
    const fInfo = this._fInfo[mbX]!;
    const yDst = InputBuffer.from(this._cacheY, mbX * 16);
    const iLevel = fInfo.fInnerLevel;
    const limit = fInfo.fLimit;
    if (limit === 0) {
      return;
    }

    if (this._filterType === 1) {
      // simple
      if (mbX > 0) {
        this._dsp.simpleHFilter16(yDst, yBps!, limit + 4);
      }
      if (fInfo.fInner) {
        this._dsp.simpleHFilter16i(yDst, yBps!, limit);
      }
      if (mbY > 0) {
        this._dsp.simpleVFilter16(yDst, yBps!, limit + 4);
      }
      if (fInfo.fInner) {
        this._dsp.simpleVFilter16i(yDst, yBps!, limit);
      }
    } else {
      // complex
      const uvBps = this._cacheUVStride;
      const uDst = InputBuffer.from(this._cacheU, mbX * 8);
      const vDst = InputBuffer.from(this._cacheV, mbX * 8);

      const hevThresh = fInfo.hevThresh;
      if (mbX > 0) {
        this._dsp.hFilter16(yDst, yBps!, limit + 4, iLevel, hevThresh);
        this._dsp.hFilter8(uDst, vDst, uvBps!, limit + 4, iLevel, hevThresh);
      }
      if (fInfo.fInner) {
        this._dsp.hFilter16i(yDst, yBps!, limit, iLevel, hevThresh);
        this._dsp.hFilter8i(uDst, vDst, uvBps!, limit, iLevel!, hevThresh);
      }
      if (mbY > 0) {
        this._dsp.vFilter16(yDst, yBps!, limit + 4, iLevel, hevThresh);
        this._dsp.vFilter8(uDst, vDst, uvBps!, limit + 4, iLevel, hevThresh);
      }
      if (fInfo.fInner) {
        this._dsp.vFilter16i(yDst, yBps!, limit, iLevel, hevThresh);
        this._dsp.vFilter8i(uDst, vDst, uvBps!, limit, iLevel, hevThresh);
      }
    }
  }

  /**
   * Filter the decoded macroblock row (if needed)
   */
  private filterRow(): void {
    for (let mbX = this._tlMbX; mbX < this._brMbX; ++mbX) {
      this.doFilter(mbX, this._mbY);
    }
  }

  private ditherRow(): void {}

  /**
   * This function is called after a row of macroblocks is finished decoding.
   * It also takes into account the following restrictions:
   *
   * * In case of in-loop filtering, we must hold off sending some of the bottom
   * pixels as they are yet unfiltered. They will be when the next macroblock
   * row is decoded. Meanwhile, we must preserve them by rotating them in the
   * cache area. This doesn't hold for the very bottom row of the uncropped
   * picture of course.
   *
   * * we must clip the remaining pixels against the cropping area. The VP8Io
   * struct must have the following fields set correctly before calling put():
   */
  private finishRow(useFilter: boolean): boolean {
    const extraYRows = VP8.kFilterExtraRows[this._filterType];
    const ySize = extraYRows * this._cacheYStride;
    const uvSize = Math.trunc(extraYRows / 2) * this._cacheUVStride;
    const yDst = InputBuffer.from(this._cacheY, -ySize);
    const uDst = InputBuffer.from(this._cacheU, -uvSize);
    const vDst = InputBuffer.from(this._cacheV, -uvSize);
    const mbY = this._mbY;
    const isFirstRow = mbY === 0;
    const isLastRow = mbY >= this._brMbY - 1;
    let yStart: number | undefined = this.macroBlockVPos(mbY);
    let yEnd: number | undefined = this.macroBlockVPos(mbY + 1);

    if (useFilter) {
      this.filterRow();
    }

    if (this._dither) {
      this.ditherRow();
    }

    if (!isFirstRow) {
      yStart -= extraYRows;
      this._y = InputBuffer.from(yDst);
      this._u = InputBuffer.from(uDst);
      this._v = InputBuffer.from(vDst);
    } else {
      this._y = InputBuffer.from(this._cacheY);
      this._u = InputBuffer.from(this._cacheU);
      this._v = InputBuffer.from(this._cacheV);
    }

    if (!isLastRow) {
      yEnd -= extraYRows;
    }

    if (yEnd > this._cropBottom) {
      // make sure we don't overflow on last row.
      yEnd = this._cropBottom;
    }

    this._a = undefined;
    if (this._alphaData !== undefined && yStart < yEnd) {
      this._a = this.decompressAlphaRows(yStart, yEnd - yStart);
      if (this._a === undefined) {
        return false;
      }
    }

    if (yStart < this._cropTop) {
      const deltaY = this._cropTop - yStart;
      yStart = this._cropTop;

      this._y.offset += this._cacheYStride * deltaY;
      this._u.offset += this._cacheUVStride * (deltaY >>> 1);
      this._v.offset += this._cacheUVStride * (deltaY >>> 1);

      if (this._a !== undefined) {
        this._a.offset += this._webp.width * deltaY;
      }
    }

    if (yStart < yEnd) {
      this._y.offset += this._cropLeft;
      this._u.offset += this._cropLeft >>> 1;
      this._v.offset += this._cropLeft >>> 1;
      if (this._a !== undefined) {
        this._a.offset += this._cropLeft;
      }

      this.put(
        yStart - this._cropTop!,
        this._cropRight - this._cropLeft,
        yEnd - yStart
      );
    }

    // rotate top samples if needed
    if (!isLastRow) {
      this._cacheY.memcpy(-ySize, ySize, yDst, 16 * this._cacheYStride);
      this._cacheU.memcpy(-uvSize, uvSize, uDst, 8 * this._cacheUVStride);
      this._cacheV.memcpy(-uvSize, uvSize, vDst, 8 * this._cacheUVStride);
    }

    return true;
  }

  private put(mbY: number, mbW: number, mbH: number): boolean {
    if (mbW <= 0 || mbH <= 0) {
      return false;
    }

    this.emitFancyRGB(mbY, mbW, mbH);
    this.emitAlphaRGB(mbY, mbW, mbH);

    return true;
  }

  private clip8(v: number): number {
    const d = (v & VP8.xorYuvMask2) === 0 ? v >>> VP8.yuvFix2 : v < 0 ? 0 : 255;
    return d;
  }

  private yuvToR(y: number, v: number): number {
    return this.clip8(VP8.kYScale * y + VP8.kVToR * v + VP8.kRCst);
  }

  private yuvToG(y: number, u: number, v: number): number {
    return this.clip8(
      VP8.kYScale * y - VP8.kUToG * u - VP8.kVToG * v + VP8.kGCst
    );
  }

  private yuvToB(y: number, u: number): number {
    return this.clip8(VP8.kYScale * y + VP8.kUToB * u + VP8.kBCst);
  }

  private yuvToRgb(
    y: number,
    u: number,
    v: number,
    rgb: InputBuffer<Uint8Array>
  ): void {
    rgb.set(0, this.yuvToR(y, v));
    rgb.set(1, this.yuvToG(y, u, v));
    rgb.set(2, this.yuvToB(y, u));
  }

  private yuvToRgba(
    y: number,
    u: number,
    v: number,
    rgba: InputBuffer<Uint8Array>
  ): void {
    this.yuvToRgb(y, u, v, rgba);
    rgba.set(3, 0xff);
  }

  private upSample(
    topY: InputBuffer<Uint8Array>,
    bottomY: InputBuffer<Uint8Array> | undefined,
    topU: InputBuffer<Uint8Array>,
    topV: InputBuffer<Uint8Array>,
    curU: InputBuffer<Uint8Array>,
    curV: InputBuffer<Uint8Array>,
    topDst: InputBuffer<Uint8Array>,
    bottomDst: InputBuffer<Uint8Array> | undefined,
    len: number
  ): void {
    const loadUv = (u: number, v: number): number => {
      return u | (v << 16);
    };

    const lastPixelPair = (len - 1) >>> 1;
    // top-left sample
    let tlUv = loadUv(topU.get(0), topV.get(0));
    // left-sample
    let lUv = loadUv(curU.get(0), curV.get(0));

    const uv0 = (3 * tlUv + lUv + 0x00020002) >>> 2;
    this.yuvToRgba(topY.get(0), uv0 & 0xff, uv0 >>> 16, topDst);

    if (bottomY !== undefined) {
      const uv0 = (3 * lUv + tlUv + 0x00020002) >>> 2;
      this.yuvToRgba(bottomY.get(0), uv0 & 0xff, uv0 >>> 16, bottomDst!);
    }

    for (let x = 1; x <= lastPixelPair; ++x) {
      // top sample
      const tUv = loadUv(topU.get(x), topV.get(x));
      // sample
      const uv = loadUv(curU.get(x), curV.get(x));
      // precompute invariant values associated with first and second diagonals
      const avg = tlUv + tUv + lUv + uv + 0x00080008;
      const diag12 = (avg + 2 * (tUv + lUv)) >>> 3;
      const diag03 = (avg + 2 * (tlUv + uv)) >>> 3;

      let uv0 = (diag12 + tlUv) >>> 1;
      let uv1 = (diag03 + tUv) >>> 1;

      this.yuvToRgba(
        topY.get(2 * x - 1),
        uv0 & 0xff,
        uv0 >>> 16,
        InputBuffer.from(topDst, (2 * x - 1) * 4)
      );
      this.yuvToRgba(
        topY.get(2 * x - 0),
        uv1 & 0xff,
        uv1 >>> 16,
        InputBuffer.from(topDst, (2 * x - 0) * 4)
      );

      if (bottomY !== undefined) {
        uv0 = (diag03 + lUv) >>> 1;
        uv1 = (diag12 + uv) >>> 1;
        this.yuvToRgba(
          bottomY.get(2 * x - 1),
          uv0 & 0xff,
          uv0 >>> 16,
          InputBuffer.from(bottomDst!, (2 * x - 1) * 4)
        );
        this.yuvToRgba(
          bottomY.get(2 * x),
          uv1 & 0xff,
          uv1 >>> 16,
          InputBuffer.from(bottomDst!, (2 * x + 0) * 4)
        );
      }

      tlUv = tUv;
      lUv = uv;
    }

    if ((len & 1) === 0) {
      const uv0 = (3 * tlUv + lUv + 0x00020002) >>> 2;
      this.yuvToRgba(
        topY.get(len - 1),
        uv0 & 0xff,
        uv0 >>> 16,
        InputBuffer.from(topDst, (len - 1) * 4)
      );

      if (bottomY !== undefined) {
        const uv0 = (3 * lUv + tlUv + 0x00020002) >>> 2;
        this.yuvToRgba(
          bottomY.get(len - 1),
          uv0 & 0xff,
          uv0 >>> 16,
          InputBuffer.from(bottomDst!, (len - 1) * 4)
        );
      }
    }
  }

  private emitAlphaRGB(mbY: number, mbW: number, mbH: number): void {
    if (this._a === undefined) {
      return;
    }

    const alpha = InputBuffer.from(this._a);
    let startY = mbY;
    let numRows = mbH;

    // Compensate for the 1-line delay of the fancy upscaler.
    // This is similar to EmitFancyRGB().
    if (startY === 0) {
      // We don't process the last row yet. It'll be done during the next call.
      --numRows;
    } else {
      --startY;
      // Fortunately, alpha data is persistent, so we can go back
      // one row and finish alpha blending, now that the fancy upscaler
      // completed the YUV->RGB interpolation.
      alpha.offset -= this.webp.width;
    }

    if (this._cropTop + mbY + mbH === this._cropBottom) {
      // If it's the very last call, we process all the remaining rows!
      numRows = this._cropBottom - this._cropTop - startY;
    }

    for (let y = 0; y < numRows; ++y) {
      for (let x = 0; x < mbW; ++x) {
        const alphaValue = alpha.get(x);
        this._output!.getPixel(x, y + startY).a = alphaValue;
      }

      alpha.offset += this.webp.width;
    }
  }

  private emitFancyRGB(mbY: number, mbW: number, mbH: number): number {
    // a priori guess
    let numLinesOut = mbH;
    const outputBytes = new Uint8Array(this._output!.buffer!);
    const dst = new InputBuffer<Uint8Array>({
      buffer: outputBytes,
      offset: mbY * this.webp.width * 4,
    });
    const curY = InputBuffer.from(this._y);
    const curU = InputBuffer.from(this._u);
    const curV = InputBuffer.from(this._v);
    let y = mbY;
    const yEnd = mbY + mbH;
    const uvW = (mbW + 1) >>> 1;
    const stride = this.webp.width * 4;
    const topU = InputBuffer.from(this._tmpU);
    const topV = InputBuffer.from(this._tmpV);

    if (y === 0) {
      // First line is special cased. We mirror the u/v samples at boundary
      this.upSample(
        curY,
        undefined,
        curU,
        curV,
        curU,
        curV,
        dst,
        undefined,
        mbW
      );
    } else {
      // We can finish the left-over line from previous call
      this.upSample(
        this._tmpY,
        curY,
        topU,
        topV,
        curU,
        curV,
        InputBuffer.from(dst, -stride),
        dst,
        mbW
      );
      ++numLinesOut;
    }

    // Loop over each output pairs of row.
    topU.buffer = curU.buffer;
    topV.buffer = curV.buffer;
    for (; y + 2 < yEnd; y += 2) {
      topU.offset = curU.offset;
      topV.offset = curV.offset;
      curU.offset += this._cacheUVStride;
      curV.offset += this._cacheUVStride;
      dst.offset += 2 * stride;
      curY.offset += 2 * this._cacheYStride;
      this.upSample(
        InputBuffer.from(curY, -this._cacheYStride),
        curY,
        topU,
        topV,
        curU,
        curV,
        InputBuffer.from(dst, -stride),
        dst,
        mbW
      );
    }

    // move to last row
    curY.offset += this._cacheYStride;
    if (this._cropTop + yEnd < this._cropBottom) {
      // Save the unfinished samples for next call (as we're not done yet).
      this._tmpY.memcpy(0, mbW, curY);
      this._tmpU.memcpy(0, uvW, curU);
      this._tmpV.memcpy(0, uvW, curV);
      // The fancy upsampler leaves a row unfinished behind
      // (except for the very last row)
      numLinesOut--;
    } else {
      // Process the very last row of even-sized picture
      if ((yEnd & 1) === 0) {
        this.upSample(
          curY,
          undefined,
          curU,
          curV,
          curU,
          curV,
          InputBuffer.from(dst, stride),
          undefined,
          mbW
        );
      }
    }

    return numLinesOut;
  }

  private decompressAlphaRows(
    row: number,
    numRows: number
  ): InputBuffer<Uint8Array> | undefined {
    const width = this.webp.width;
    const height = this.webp.height;

    if (row < 0 || numRows <= 0 || row + numRows > height) {
      // sanity check
      return undefined;
    }

    if (row === 0) {
      this._alphaPlane = new Uint8Array(width * height);
      this._alpha = new WebPAlpha(this._alphaData!, width, height);
    }

    if (!this._alpha.isAlphaDecoded) {
      if (!this._alpha.decode(row, numRows, this._alphaPlane)) {
        return undefined;
      }
    }

    // Return a pointer to the current decoded row.
    return new InputBuffer<Uint8Array>({
      buffer: this._alphaPlane,
      offset: row * width,
    });
  }

  private decodeMB(tokenBr?: VP8BitReader): boolean {
    const left = this._mbInfo[0];
    const mb = this._mbInfo[1 + this._mbX];
    const block = this._mbData[this._mbX];
    let skip: boolean = false;

    // Note: we don't save segment map (yet), as we don't expect
    // to decode more than 1 keyframe.
    if (this._segmentHeader.updateMap) {
      // Hardcoded tree parsing
      this._segment =
        this._br.getBit(this._proba!.segments[0]) === 0
          ? this._br.getBit(this._proba!.segments[1])
          : 2 + this._br.getBit(this._proba!.segments[2]);
    }

    skip = this._useSkipProba && this._br.getBit(this._skipP) !== 0;

    this.parseIntraMode();

    if (!skip) {
      skip = this.parseResiduals(mb, tokenBr);
    } else {
      mb.nz = 0;
      left.nz = mb.nz;
      if (!block.isIntra4x4) {
        mb.nzDc = 0;
        left.nzDc = mb.nzDc;
      }
      block.nonZeroY = 0;
      block.nonZeroUV = 0;
    }

    if (this._filterType > 0) {
      // store filter info
      this._fInfo[this._mbX] =
        this._fStrengths[this._segment][block.isIntra4x4 ? 1 : 0];
      const finfo = this._fInfo[this._mbX]!;
      finfo.fInner = finfo.fInner || !skip;
    }

    return true;
  }

  private parseResiduals(mb: VP8MB, tokenBr?: VP8BitReader): boolean {
    const bands = this._proba!.bands;
    const q = this._dqm[this._segment];
    const block = this._mbData[this._mbX];
    const dst = new InputBuffer<Int16Array>({
      buffer: block.coeffs,
    });
    const leftMb = this._mbInfo[0];
    let tnz: number = 0;
    let lnz: number = 0;
    let nonZeroY = 0;
    let nonZeroUV = 0;
    let outTopNz: number = 0;
    let outLeftNz: number = 0;
    let first: number = 0;

    dst.memset(0, dst.length, 0);

    let acProba: VP8BandProbas[] = [];
    if (!block.isIntra4x4) {
      // parse DC
      const dc = new InputBuffer<Int16Array>({
        buffer: new Int16Array(16),
      });
      const ctx = mb.nzDc + leftMb.nzDc;
      const nz = this.getCoeffs(tokenBr, bands[1], ctx, q!.y2Mat, 0, dc);
      leftMb.nzDc = nz > 0 ? 1 : 0;
      mb.nzDc = leftMb.nzDc;
      if (nz > 1) {
        // more than just the DC -> perform the full transform
        this.transformWHT(dc, dst);
      } else {
        // only DC is non-zero -> inlined simplified transform
        const dc0 = (dc.get(0) + 3) >>> 3;
        for (let i = 0; i < 16 * 16; i += 16) {
          dst.set(i, dc0);
        }
      }

      first = 1;
      acProba = bands[0];
    } else {
      first = 0;
      acProba = bands[3];
    }

    tnz = mb.nz & 0x0f;
    lnz = leftMb.nz & 0x0f;
    for (let y = 0; y < 4; ++y) {
      let l = lnz & 1;
      let nzCoeffs = 0;
      for (let x = 0; x < 4; ++x) {
        const ctx = l + (tnz & 1);
        const nz = this.getCoeffs(tokenBr, acProba, ctx, q!.y1Mat, first, dst);
        l = nz > first ? 1 : 0;
        tnz = (tnz >>> 1) | (l << 7);
        nzCoeffs = this.nzCodeBits(nzCoeffs, nz, dst.get(0) !== 0 ? 1 : 0);
        dst.offset += 16;
      }

      tnz >>>= 4;
      lnz = (lnz >>> 1) | (l << 7);
      nonZeroY = ((nonZeroY << 8) | nzCoeffs) >>> 0;
    }
    outTopNz = tnz;
    outLeftNz = lnz >>> 4;

    for (let ch = 0; ch < 4; ch += 2) {
      let nzCoeffs = 0;
      tnz = mb.nz >>> (4 + ch);
      lnz = leftMb.nz >>> (4 + ch);
      for (let y = 0; y < 2; ++y) {
        let l = lnz & 1;
        for (let x = 0; x < 2; ++x) {
          const ctx = l + (tnz & 1);
          const nz = this.getCoeffs(tokenBr, bands[2], ctx, q!.uvMat, 0, dst);
          l = nz > 0 ? 1 : 0;
          tnz = (tnz >>> 1) | (l << 3);
          nzCoeffs = this.nzCodeBits(nzCoeffs, nz, dst.get(0) !== 0 ? 1 : 0);
          dst.offset += 16;
        }

        tnz >>>= 2;
        lnz = (lnz >>> 1) | (l << 5);
      }

      // Note: we don't really need the per-4x4 details for U/V blocks.
      nonZeroUV |= nzCoeffs << (4 * ch);
      outTopNz |= (tnz << 4) << ch;
      outLeftNz |= (lnz & 0xf0) << ch;
    }

    mb.nz = outTopNz;
    leftMb.nz = outLeftNz;

    block.nonZeroY = nonZeroY;
    block.nonZeroUV = nonZeroUV;
    // We look at the mode-code of each block and check if some blocks have
    // less than three non-zero coeffs (code < 2). This is to avoid dithering
    // flat and empty blocks.
    block.dither = (nonZeroUV & 0xaaaa) !== 0 ? 0 : q!.dither;

    // will be used for further optimization
    return (nonZeroY | nonZeroUV) === 0;
  }

  private transformWHT(
    src: InputBuffer<Int16Array>,
    out: InputBuffer<Int16Array>
  ): void {
    const tmp = new Int32Array(16);

    let oi = 0;
    for (let i = 0; i < 4; ++i) {
      const a0 = src.get(0 + i) + src.get(12 + i);
      const a1 = src.get(4 + i) + src.get(8 + i);
      const a2 = src.get(4 + i) - src.get(8 + i);
      const a3 = src.get(0 + i) - src.get(12 + i);
      tmp[0 + i] = a0 + a1;
      tmp[8 + i] = a0 - a1;
      tmp[4 + i] = a3 + a2;
      tmp[12 + i] = a3 - a2;
    }

    for (let i = 0; i < 4; ++i) {
      const dc = tmp[0 + i * 4] + 3;
      const a0 = dc + tmp[3 + i * 4];
      const a1 = tmp[1 + i * 4] + tmp[2 + i * 4];
      const a2 = tmp[1 + i * 4] - tmp[2 + i * 4];
      const a3 = dc - tmp[3 + i * 4];
      out.set(oi + 0, (a0 + a1) >>> 3);
      out.set(oi + 16, (a3 + a2) >>> 3);
      out.set(oi + 32, (a0 - a1) >>> 3);
      out.set(oi + 48, (a3 - a2) >>> 3);

      oi += 64;
    }
  }

  private nzCodeBits(nzCoeffs: number, nz: number, dcNz: number): number {
    let _nzCoeffs = nzCoeffs;
    _nzCoeffs <<= 2;
    _nzCoeffs |= nz > 3 ? 3 : nz > 1 ? 2 : dcNz;
    return _nzCoeffs;
  }

  /**
   * See section 13-2: http://tools.ietf.org/html/rfc6386#section-13.2
   */
  private getLargeValue(br: VP8BitReader, p: Uint8Array): number {
    let v: number = 0;
    if (br.getBit(p[3]) === 0) {
      if (br.getBit(p[4]) === 0) {
        v = 2;
      } else {
        v = 3 + br.getBit(p[5]);
      }
    } else {
      if (br.getBit(p[6]) === 0) {
        if (br.getBit(p[7]) === 0) {
          v = 5 + br.getBit(159);
        } else {
          v = 7 + 2 * br.getBit(165);
          v += br.getBit(145);
        }
      } else {
        const bit1 = br.getBit(p[8]);
        const bit0 = br.getBit(p[9 + bit1]);
        const cat = 2 * bit1 + bit0;
        v = 0;
        const tab = VP8.kCat3456[cat];
        const len = tab.length;
        for (let i = 0; i < len; ++i) {
          v += v + br.getBit(tab[i]);
        }
        v += 3 + (8 << cat);
      }
    }
    return v;
  }

  /**
   * Returns the position of the last non-zero coeff plus one
   */
  private getCoeffs(
    br: VP8BitReader | undefined,
    prob: VP8BandProbas[],
    ctx: number,
    dq: Int32Array,
    n: number,
    out: InputBuffer<Int16Array>
  ): number {
    let _n = n;
    // _n is either 0 or 1 here. kBands[_n] is not necessary for extracting '*p'.
    let p: Uint8Array = prob[_n].probas[ctx];
    for (; _n < 16; ++_n) {
      if (br!.getBit(p[0]) === 0) {
        // previous coeff was last non-zero coeff
        return _n;
      }

      while (br!.getBit(p[1]) === 0) {
        // sequence of zero coeffs
        p = prob[VP8.kBands[++_n]].probas[0];
        if (_n === 16) {
          return 16;
        }
      }

      {
        // non zero coeff
        const pCtx = prob[VP8.kBands[_n + 1]].probas;
        let v: number = 0;
        if (br!.getBit(p[2]) === 0) {
          v = 1;
          p = pCtx[1];
        } else {
          v = this.getLargeValue(br!, p);
          p = pCtx[2];
        }

        out.set(VP8.kZigzag[_n], br!.getSigned(v) * dq[_n > 0 ? 1 : 0]);
      }
    }
    return 16;
  }

  private parseIntraMode(): void {
    const ti = 4 * this._mbX;
    const li = 0;
    const top = this._intraT;
    const left = this._intraL;

    const block = this._mbData[this._mbX];
    // decide for B_PRED first
    block.isIntra4x4 = this._br.getBit(145) === 0;

    if (!block.isIntra4x4) {
      // Hardcoded 16x16 intra-mode decision tree.
      const ymode =
        this._br.getBit(156) !== 0
          ? this._br.getBit(128) !== 0
            ? VP8.tmPred
            : VP8.hPred
          : this._br.getBit(163) !== 0
            ? VP8.vPred
            : VP8.dcPred;
      block.imodes[0] = ymode;

      top!.fill(ymode, ti, ti + 4);
      left.fill(ymode, li, li + 4);
    } else {
      const modes = block.imodes;
      let mi = 0;
      for (let y = 0; y < 4; ++y) {
        let ymode = left[y];
        for (let x = 0; x < 4; ++x) {
          const prob = VP8.kBModesProba[top![ti + x]][ymode];

          // Generic tree-parsing
          const b = this._br.getBit(prob[0]);
          let i = VP8.kYModesIntra4[b];

          while (i > 0) {
            i = VP8.kYModesIntra4[2 * i + this._br.getBit(prob[i])];
          }

          ymode = -i;
          top![ti + x] = ymode;
        }

        ArrayUtils.copyRange(top!, ti, modes, mi, 4);

        mi += 4;
        left[y] = ymode;
      }
    }

    // Hardcoded UVMode decision tree
    block.uvmode =
      this._br.getBit(142) === 0
        ? VP8.dcPred
        : this._br.getBit(114) === 0
          ? VP8.vPred
          : this._br.getBit(183) !== 0
            ? VP8.tmPred
            : VP8.hPred;
  }

  public decodeHeader(): boolean {
    const bits = this._input.readUint24();

    const keyFrame = (bits & 1) === 0;
    if (!keyFrame) {
      return false;
    }

    if (((bits >>> 1) & 7) > 3) {
      // unknown profile
      return false;
    }

    if (((bits >>> 4) & 1) === 0) {
      // first frame is invisible!
      return false;
    }

    this._frameHeader.keyFrame = (bits & 1) === 0;
    this._frameHeader.profile = (bits >>> 1) & 7;
    this._frameHeader.show = (bits >>> 4) & 1;
    this._frameHeader.partitionLength = bits >>> 5;

    const signature = this._input.readUint24();
    if (signature !== VP8.vp8Signature) {
      return false;
    }

    this._webp.width = this._input.readUint16();
    this._webp.height = this._input.readUint16();

    return true;
  }

  public decode(): MemoryImage | undefined {
    if (!this.getHeaders()) {
      return undefined;
    }

    this._output = new MemoryImage({
      width: this._webp.width,
      height: this._webp.height,
      numChannels: 4,
    });

    // Will allocate memory and prepare everything
    if (!this.initFrame()) {
      return undefined;
    }

    // Main decoding loop
    if (!this.parseFrame()) {
      return undefined;
    }

    if (this._webp.exifData.length > 0) {
      const input = new InputBuffer({
        buffer: StringUtils.getCodePoints(this._webp.exifData),
      });
      this._output.exifData = ExifData.fromInputBuffer(input);
    }

    return this._output;
  }

  /**
   * Vertical position of a MB
   */
  public macroBlockVPos(mbY: number): number {
    return mbY * 16;
  }

  /**
   * How many extra lines are needed on the MB boundary
   * for caching, given a filtering level.
   * Simple filter:  up to 2 luma samples are read and 1 is written.
   * Complex filter: up to 4 luma samples are read and 3 are written. Same for
   * U/V, so it's 8 samples total (because of the 2x upsampling).
   */
  public static readonly filterExtraRows = [0, 2, 8];

  public static readonly vp8Signature = 0x2a019d;

  public static readonly mbFeatureTreeProbs = 3;
  public static readonly numMbSegments = 4;
  public static readonly numRefLfDeltas = 4;
  // I4x4, ZERO, *, SPLIT
  public static readonly numModeLfDeltas = 4;
  public static readonly maxNumPartitions = 8;

  // 4x4 modes
  public static readonly bDcPred = 0;
  public static readonly bTmPred = 1;
  public static readonly bVePred = 2;
  public static readonly bHePred = 3;
  public static readonly bRdPred = 4;
  public static readonly bVrPred = 5;
  public static readonly bLdPred = 6;
  public static readonly bVlPred = 7;
  public static readonly bHdPred = 8;
  public static readonly bHuPred = 9;
  public static readonly numBModes = VP8.bHuPred + 1 - VP8.bDcPred;

  // Luma16 or UV modes
  public static readonly dcPred = VP8.bDcPred;
  public static readonly vPred = VP8.bVePred;
  public static readonly hPred = VP8.bHePred;
  public static readonly tmPred = VP8.bTmPred;
  public static readonly bPred = VP8.numBModes;

  // special modes
  public static readonly bDcPredNoTop = 4;
  public static readonly bDcPredNoLeft = 5;
  public static readonly bDcPredNoTopLeft = 6;
  public static readonly numBDcModes = 7;

  // Probabilities
  public static readonly numTypes = 4;
  public static readonly numBands = 8;
  public static readonly numCtx = 3;
  public static readonly numProbas = 11;

  // this is the common stride used by yuv[]
  public static readonly bps = 32;
  public static readonly yuvSize = VP8.bps * 17 + VP8.bps * 9;
  public static readonly ySize = VP8.bps * 17;
  public static readonly yOffset = Number(VP8.bps) + 8;
  public static readonly uOffset = VP8.yOffset + VP8.bps * 16 + VP8.bps;
  public static readonly vOffset = VP8.uOffset + 16;

  // fixed-point precision for RGB->YUV
  public static readonly yuvFix = 16;
  public static readonly yuvHalf = 1 << (VP8.yuvFix - 1);
  public static readonly yuvMask = (256 << VP8.yuvFix) - 1;
  // min value of r/g/b output
  public static readonly yuvRangeMin = -227;
  // max value of r/g/b output
  public static readonly yuvRangeMax = 256 + 226;
  // fixed-point precision for YUV->RGB
  public static readonly yuvFix2 = 14;
  public static readonly yuvHalf2 = 1 << (VP8.yuvFix2 - 1);
  public static readonly yuvMask2 = (256 << VP8.yuvFix2) - 1;
  public static readonly xorYuvMask2 = -VP8.yuvMask2 - 1;

  // These constants are 14b fixed-point version of ITU-R BT.601 constants.
  // 1.164 = 255 / 219
  public static readonly kYScale = 19077;
  // 1.596 = 255 / 112 * 0.701
  public static readonly kVToR = 26149;
  // 0.391 = 255 / 112 * 0.886 * 0.114 / 0.587
  public static readonly kUToG = 6419;
  // 0.813 = 255 / 112 * 0.701 * 0.299 / 0.587
  public static readonly kVToG = 13320;
  // 2.018 = 255 / 112 * 0.886
  public static readonly kUToB = 33050;
  public static readonly kRCst =
    -VP8.kYScale * 16 - VP8.kVToR * 128 + VP8.yuvHalf2;
  public static readonly kGCst =
    -VP8.kYScale * 16 + VP8.kUToG * 128 + VP8.kVToG * 128 + VP8.yuvHalf2;
  public static readonly kBCst =
    -VP8.kYScale * 16 - VP8.kUToB * 128 + VP8.yuvHalf2;

  public static readonly kYModesIntra4: number[] = [
    -VP8.bDcPred,
    1,
    -VP8.bTmPred,
    2,
    -VP8.bVePred,
    3,
    4,
    6,
    -VP8.bHePred,
    5,
    -VP8.bRdPred,
    -VP8.bVrPred,
    -VP8.bLdPred,
    7,
    -VP8.bVlPred,
    8,
    -VP8.bHdPred,
    -VP8.bHuPred,
  ];

  public static readonly kBModesProba: Array<Array<Array<number>>> = [
    [
      [231, 120, 48, 89, 115, 113, 120, 152, 112],
      [152, 179, 64, 126, 170, 118, 46, 70, 95],
      [175, 69, 143, 80, 85, 82, 72, 155, 103],
      [56, 58, 10, 171, 218, 189, 17, 13, 152],
      [114, 26, 17, 163, 44, 195, 21, 10, 173],
      [121, 24, 80, 195, 26, 62, 44, 64, 85],
      [144, 71, 10, 38, 171, 213, 144, 34, 26],
      [170, 46, 55, 19, 136, 160, 33, 206, 71],
      [63, 20, 8, 114, 114, 208, 12, 9, 226],
      [81, 40, 11, 96, 182, 84, 29, 16, 36],
    ],
    [
      [134, 183, 89, 137, 98, 101, 106, 165, 148],
      [72, 187, 100, 130, 157, 111, 32, 75, 80],
      [66, 102, 167, 99, 74, 62, 40, 234, 128],
      [41, 53, 9, 178, 241, 141, 26, 8, 107],
      [74, 43, 26, 146, 73, 166, 49, 23, 157],
      [65, 38, 105, 160, 51, 52, 31, 115, 128],
      [104, 79, 12, 27, 217, 255, 87, 17, 7],
      [87, 68, 71, 44, 114, 51, 15, 186, 23],
      [47, 41, 14, 110, 182, 183, 21, 17, 194],
      [66, 45, 25, 102, 197, 189, 23, 18, 22],
    ],
    [
      [88, 88, 147, 150, 42, 46, 45, 196, 205],
      [43, 97, 183, 117, 85, 38, 35, 179, 61],
      [39, 53, 200, 87, 26, 21, 43, 232, 171],
      [56, 34, 51, 104, 114, 102, 29, 93, 77],
      [39, 28, 85, 171, 58, 165, 90, 98, 64],
      [34, 22, 116, 206, 23, 34, 43, 166, 73],
      [107, 54, 32, 26, 51, 1, 81, 43, 31],
      [68, 25, 106, 22, 64, 171, 36, 225, 114],
      [34, 19, 21, 102, 132, 188, 16, 76, 124],
      [62, 18, 78, 95, 85, 57, 50, 48, 51],
    ],
    [
      [193, 101, 35, 159, 215, 111, 89, 46, 111],
      [60, 148, 31, 172, 219, 228, 21, 18, 111],
      [112, 113, 77, 85, 179, 255, 38, 120, 114],
      [40, 42, 1, 196, 245, 209, 10, 25, 109],
      [88, 43, 29, 140, 166, 213, 37, 43, 154],
      [61, 63, 30, 155, 67, 45, 68, 1, 209],
      [100, 80, 8, 43, 154, 1, 51, 26, 71],
      [142, 78, 78, 16, 255, 128, 34, 197, 171],
      [41, 40, 5, 102, 211, 183, 4, 1, 221],
      [51, 50, 17, 168, 209, 192, 23, 25, 82],
    ],
    [
      [138, 31, 36, 171, 27, 166, 38, 44, 229],
      [67, 87, 58, 169, 82, 115, 26, 59, 179],
      [63, 59, 90, 180, 59, 166, 93, 73, 154],
      [40, 40, 21, 116, 143, 209, 34, 39, 175],
      [47, 15, 16, 183, 34, 223, 49, 45, 183],
      [46, 17, 33, 183, 6, 98, 15, 32, 183],
      [57, 46, 22, 24, 128, 1, 54, 17, 37],
      [65, 32, 73, 115, 28, 128, 23, 128, 205],
      [40, 3, 9, 115, 51, 192, 18, 6, 223],
      [87, 37, 9, 115, 59, 77, 64, 21, 47],
    ],
    [
      [104, 55, 44, 218, 9, 54, 53, 130, 226],
      [64, 90, 70, 205, 40, 41, 23, 26, 57],
      [54, 57, 112, 184, 5, 41, 38, 166, 213],
      [30, 34, 26, 133, 152, 116, 10, 32, 134],
      [39, 19, 53, 221, 26, 114, 32, 73, 255],
      [31, 9, 65, 234, 2, 15, 1, 118, 73],
      [75, 32, 12, 51, 192, 255, 160, 43, 51],
      [88, 31, 35, 67, 102, 85, 55, 186, 85],
      [56, 21, 23, 111, 59, 205, 45, 37, 192],
      [55, 38, 70, 124, 73, 102, 1, 34, 98],
    ],
    [
      [125, 98, 42, 88, 104, 85, 117, 175, 82],
      [95, 84, 53, 89, 128, 100, 113, 101, 45],
      [75, 79, 123, 47, 51, 128, 81, 171, 1],
      [57, 17, 5, 71, 102, 57, 53, 41, 49],
      [38, 33, 13, 121, 57, 73, 26, 1, 85],
      [41, 10, 67, 138, 77, 110, 90, 47, 114],
      [115, 21, 2, 10, 102, 255, 166, 23, 6],
      [101, 29, 16, 10, 85, 128, 101, 196, 26],
      [57, 18, 10, 102, 102, 213, 34, 20, 43],
      [117, 20, 15, 36, 163, 128, 68, 1, 26],
    ],
    [
      [102, 61, 71, 37, 34, 53, 31, 243, 192],
      [69, 60, 71, 38, 73, 119, 28, 222, 37],
      [68, 45, 128, 34, 1, 47, 11, 245, 171],
      [62, 17, 19, 70, 146, 85, 55, 62, 70],
      [37, 43, 37, 154, 100, 163, 85, 160, 1],
      [63, 9, 92, 136, 28, 64, 32, 201, 85],
      [75, 15, 9, 9, 64, 255, 184, 119, 16],
      [86, 6, 28, 5, 64, 255, 25, 248, 1],
      [56, 8, 17, 132, 137, 255, 55, 116, 128],
      [58, 15, 20, 82, 135, 57, 26, 121, 40],
    ],
    [
      [164, 50, 31, 137, 154, 133, 25, 35, 218],
      [51, 103, 44, 131, 131, 123, 31, 6, 158],
      [86, 40, 64, 135, 148, 224, 45, 183, 128],
      [22, 26, 17, 131, 240, 154, 14, 1, 209],
      [45, 16, 21, 91, 64, 222, 7, 1, 197],
      [56, 21, 39, 155, 60, 138, 23, 102, 213],
      [83, 12, 13, 54, 192, 255, 68, 47, 28],
      [85, 26, 85, 85, 128, 128, 32, 146, 171],
      [18, 11, 7, 63, 144, 171, 4, 4, 246],
      [35, 27, 10, 146, 174, 171, 12, 26, 128],
    ],
    [
      [190, 80, 35, 99, 180, 80, 126, 54, 45],
      [85, 126, 47, 87, 176, 51, 41, 20, 32],
      [101, 75, 128, 139, 118, 146, 116, 128, 85],
      [56, 41, 15, 176, 236, 85, 37, 9, 62],
      [71, 30, 17, 119, 118, 255, 17, 18, 138],
      [101, 38, 60, 138, 55, 70, 43, 26, 142],
      [146, 36, 19, 30, 171, 255, 97, 27, 20],
      [138, 45, 61, 62, 219, 1, 81, 188, 64],
      [32, 41, 20, 117, 151, 142, 20, 21, 163],
      [112, 19, 12, 61, 195, 128, 48, 4, 24],
    ],
  ];

  public static readonly coeffsProba0: Array<Array<Array<Array<number>>>> = [
    [
      [
        [128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128],
        [128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128],
        [128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128],
      ],
      [
        [253, 136, 254, 255, 228, 219, 128, 128, 128, 128, 128],
        [189, 129, 242, 255, 227, 213, 255, 219, 128, 128, 128],
        [106, 126, 227, 252, 214, 209, 255, 255, 128, 128, 128],
      ],
      [
        [1, 98, 248, 255, 236, 226, 255, 255, 128, 128, 128],
        [181, 133, 238, 254, 221, 234, 255, 154, 128, 128, 128],
        [78, 134, 202, 247, 198, 180, 255, 219, 128, 128, 128],
      ],
      [
        [1, 185, 249, 255, 243, 255, 128, 128, 128, 128, 128],
        [184, 150, 247, 255, 236, 224, 128, 128, 128, 128, 128],
        [77, 110, 216, 255, 236, 230, 128, 128, 128, 128, 128],
      ],
      [
        [1, 101, 251, 255, 241, 255, 128, 128, 128, 128, 128],
        [170, 139, 241, 252, 236, 209, 255, 255, 128, 128, 128],
        [37, 116, 196, 243, 228, 255, 255, 255, 128, 128, 128],
      ],
      [
        [1, 204, 254, 255, 245, 255, 128, 128, 128, 128, 128],
        [207, 160, 250, 255, 238, 128, 128, 128, 128, 128, 128],
        [102, 103, 231, 255, 211, 171, 128, 128, 128, 128, 128],
      ],
      [
        [1, 152, 252, 255, 240, 255, 128, 128, 128, 128, 128],
        [177, 135, 243, 255, 234, 225, 128, 128, 128, 128, 128],
        [80, 129, 211, 255, 194, 224, 128, 128, 128, 128, 128],
      ],
      [
        [1, 1, 255, 128, 128, 128, 128, 128, 128, 128, 128],
        [246, 1, 255, 128, 128, 128, 128, 128, 128, 128, 128],
        [255, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128],
      ],
    ],
    [
      [
        [198, 35, 237, 223, 193, 187, 162, 160, 145, 155, 62],
        [131, 45, 198, 221, 172, 176, 220, 157, 252, 221, 1],
        [68, 47, 146, 208, 149, 167, 221, 162, 255, 223, 128],
      ],
      [
        [1, 149, 241, 255, 221, 224, 255, 255, 128, 128, 128],
        [184, 141, 234, 253, 222, 220, 255, 199, 128, 128, 128],
        [81, 99, 181, 242, 176, 190, 249, 202, 255, 255, 128],
      ],
      [
        [1, 129, 232, 253, 214, 197, 242, 196, 255, 255, 128],
        [99, 121, 210, 250, 201, 198, 255, 202, 128, 128, 128],
        [23, 91, 163, 242, 170, 187, 247, 210, 255, 255, 128],
      ],
      [
        [1, 200, 246, 255, 234, 255, 128, 128, 128, 128, 128],
        [109, 178, 241, 255, 231, 245, 255, 255, 128, 128, 128],
        [44, 130, 201, 253, 205, 192, 255, 255, 128, 128, 128],
      ],
      [
        [1, 132, 239, 251, 219, 209, 255, 165, 128, 128, 128],
        [94, 136, 225, 251, 218, 190, 255, 255, 128, 128, 128],
        [22, 100, 174, 245, 186, 161, 255, 199, 128, 128, 128],
      ],
      [
        [1, 182, 249, 255, 232, 235, 128, 128, 128, 128, 128],
        [124, 143, 241, 255, 227, 234, 128, 128, 128, 128, 128],
        [35, 77, 181, 251, 193, 211, 255, 205, 128, 128, 128],
      ],
      [
        [1, 157, 247, 255, 236, 231, 255, 255, 128, 128, 128],
        [121, 141, 235, 255, 225, 227, 255, 255, 128, 128, 128],
        [45, 99, 188, 251, 195, 217, 255, 224, 128, 128, 128],
      ],
      [
        [1, 1, 251, 255, 213, 255, 128, 128, 128, 128, 128],
        [203, 1, 248, 255, 255, 128, 128, 128, 128, 128, 128],
        [137, 1, 177, 255, 224, 255, 128, 128, 128, 128, 128],
      ],
    ],
    [
      [
        [253, 9, 248, 251, 207, 208, 255, 192, 128, 128, 128],
        [175, 13, 224, 243, 193, 185, 249, 198, 255, 255, 128],
        [73, 17, 171, 221, 161, 179, 236, 167, 255, 234, 128],
      ],
      [
        [1, 95, 247, 253, 212, 183, 255, 255, 128, 128, 128],
        [239, 90, 244, 250, 211, 209, 255, 255, 128, 128, 128],
        [155, 77, 195, 248, 188, 195, 255, 255, 128, 128, 128],
      ],
      [
        [1, 24, 239, 251, 218, 219, 255, 205, 128, 128, 128],
        [201, 51, 219, 255, 196, 186, 128, 128, 128, 128, 128],
        [69, 46, 190, 239, 201, 218, 255, 228, 128, 128, 128],
      ],
      [
        [1, 191, 251, 255, 255, 128, 128, 128, 128, 128, 128],
        [223, 165, 249, 255, 213, 255, 128, 128, 128, 128, 128],
        [141, 124, 248, 255, 255, 128, 128, 128, 128, 128, 128],
      ],
      [
        [1, 16, 248, 255, 255, 128, 128, 128, 128, 128, 128],
        [190, 36, 230, 255, 236, 255, 128, 128, 128, 128, 128],
        [149, 1, 255, 128, 128, 128, 128, 128, 128, 128, 128],
      ],
      [
        [1, 226, 255, 128, 128, 128, 128, 128, 128, 128, 128],
        [247, 192, 255, 128, 128, 128, 128, 128, 128, 128, 128],
        [240, 128, 255, 128, 128, 128, 128, 128, 128, 128, 128],
      ],
      [
        [1, 134, 252, 255, 255, 128, 128, 128, 128, 128, 128],
        [213, 62, 250, 255, 255, 128, 128, 128, 128, 128, 128],
        [55, 93, 255, 128, 128, 128, 128, 128, 128, 128, 128],
      ],
      [
        [128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128],
        [128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128],
        [128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128],
      ],
    ],
    [
      [
        [202, 24, 213, 235, 186, 191, 220, 160, 240, 175, 255],
        [126, 38, 182, 232, 169, 184, 228, 174, 255, 187, 128],
        [61, 46, 138, 219, 151, 178, 240, 170, 255, 216, 128],
      ],
      [
        [1, 112, 230, 250, 199, 191, 247, 159, 255, 255, 128],
        [166, 109, 228, 252, 211, 215, 255, 174, 128, 128, 128],
        [39, 77, 162, 232, 172, 180, 245, 178, 255, 255, 128],
      ],
      [
        [1, 52, 220, 246, 198, 199, 249, 220, 255, 255, 128],
        [124, 74, 191, 243, 183, 193, 250, 221, 255, 255, 128],
        [24, 71, 130, 219, 154, 170, 243, 182, 255, 255, 128],
      ],
      [
        [1, 182, 225, 249, 219, 240, 255, 224, 128, 128, 128],
        [149, 150, 226, 252, 216, 205, 255, 171, 128, 128, 128],
        [28, 108, 170, 242, 183, 194, 254, 223, 255, 255, 128],
      ],
      [
        [1, 81, 230, 252, 204, 203, 255, 192, 128, 128, 128],
        [123, 102, 209, 247, 188, 196, 255, 233, 128, 128, 128],
        [20, 95, 153, 243, 164, 173, 255, 203, 128, 128, 128],
      ],
      [
        [1, 222, 248, 255, 216, 213, 128, 128, 128, 128, 128],
        [168, 175, 246, 252, 235, 205, 255, 255, 128, 128, 128],
        [47, 116, 215, 255, 211, 212, 255, 255, 128, 128, 128],
      ],
      [
        [1, 121, 236, 253, 212, 214, 255, 255, 128, 128, 128],
        [141, 84, 213, 252, 201, 202, 255, 219, 128, 128, 128],
        [42, 80, 160, 240, 162, 185, 255, 205, 128, 128, 128],
      ],
      [
        [1, 1, 255, 128, 128, 128, 128, 128, 128, 128, 128],
        [244, 1, 255, 128, 128, 128, 128, 128, 128, 128, 128],
        [238, 1, 255, 128, 128, 128, 128, 128, 128, 128, 128],
      ],
    ],
  ];

  public static readonly coeffsUpdateProba: Array<Array<Array<Array<number>>>> =
    [
      [
        [
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [176, 246, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [223, 241, 252, 255, 255, 255, 255, 255, 255, 255, 255],
          [249, 253, 253, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 244, 252, 255, 255, 255, 255, 255, 255, 255, 255],
          [234, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [253, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 246, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [239, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [254, 255, 254, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 248, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [251, 255, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [251, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [254, 255, 254, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 254, 253, 255, 254, 255, 255, 255, 255, 255, 255],
          [250, 255, 254, 255, 254, 255, 255, 255, 255, 255, 255],
          [254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
      ],
      [
        [
          [217, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [225, 252, 241, 253, 255, 255, 254, 255, 255, 255, 255],
          [234, 250, 241, 250, 253, 255, 253, 254, 255, 255, 255],
        ],
        [
          [255, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [223, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [238, 253, 254, 254, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 248, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [249, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 253, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [247, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [252, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [253, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 254, 253, 255, 255, 255, 255, 255, 255, 255, 255],
          [250, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
      ],
      [
        [
          [186, 251, 250, 255, 255, 255, 255, 255, 255, 255, 255],
          [234, 251, 244, 254, 255, 255, 255, 255, 255, 255, 255],
          [251, 251, 243, 253, 254, 255, 254, 255, 255, 255, 255],
        ],
        [
          [255, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [236, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [251, 253, 253, 254, 254, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [254, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [254, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
      ],
      [
        [
          [248, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [250, 254, 252, 254, 255, 255, 255, 255, 255, 255, 255],
          [248, 254, 249, 253, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 253, 253, 255, 255, 255, 255, 255, 255, 255, 255],
          [246, 253, 253, 255, 255, 255, 255, 255, 255, 255, 255],
          [252, 254, 251, 254, 254, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 254, 252, 255, 255, 255, 255, 255, 255, 255, 255],
          [248, 254, 253, 255, 255, 255, 255, 255, 255, 255, 255],
          [253, 255, 254, 254, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 251, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [245, 251, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [253, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 251, 253, 255, 255, 255, 255, 255, 255, 255, 255],
          [252, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 252, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [249, 255, 254, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 254, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 255, 253, 255, 255, 255, 255, 255, 255, 255, 255],
          [250, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
        [
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
          [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        ],
      ],
    ];

  /**
   * Paragraph 14.1
   */
  public static readonly dcTable: number[] = [
    // uint8
    4, 5, 6, 7, 8, 9, 10, 10, 11, 12, 13, 14, 15, 16, 17, 17, 18, 19, 20, 20,
    21, 21, 22, 22, 23, 23, 24, 25, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
    36, 37, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 46, 47, 48, 49, 50, 51, 52,
    53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
    72, 73, 74, 75, 76, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
    91, 93, 95, 96, 98, 100, 101, 102, 104, 106, 108, 110, 112, 114, 116, 118,
    122, 124, 126, 128, 130, 132, 134, 136, 138, 140, 143, 145, 148, 151, 154,
    157,
  ];

  public static readonly acTable: number[] = [
    // uint16
    4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 60, 62, 64,
    66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100,
    102, 104, 106, 108, 110, 112, 114, 116, 119, 122, 125, 128, 131, 134, 137,
    140, 143, 146, 149, 152, 155, 158, 161, 164, 167, 170, 173, 177, 181, 185,
    189, 193, 197, 201, 205, 209, 213, 217, 221, 225, 229, 234, 239, 245, 249,
    254, 259, 264, 269, 274, 279, 284,
  ];

  public static readonly kScan: number[] = [
    0 + 0 * VP8.bps,
    4 + 0 * VP8.bps,
    8 + 0 * VP8.bps,
    12 + 0 * VP8.bps,
    0 + 4 * VP8.bps,
    4 + 4 * VP8.bps,
    8 + 4 * VP8.bps,
    12 + 4 * VP8.bps,
    0 + 8 * VP8.bps,
    4 + 8 * VP8.bps,
    8 + 8 * VP8.bps,
    12 + 8 * VP8.bps,
    0 + 12 * VP8.bps,
    4 + 12 * VP8.bps,
    8 + 12 * VP8.bps,
    12 + 12 * VP8.bps,
  ];

  public static readonly kBands: number[] = [
    0, 1, 2, 3, 6, 4, 5, 6, 6, 6, 6, 6, 6, 6, 6, 7, 0,
  ];

  public static readonly kCat3: number[] = [173, 148, 140];

  public static readonly kCat4: number[] = [176, 155, 140, 135];

  public static readonly kCat5: number[] = [180, 157, 141, 134, 130];

  public static readonly kCat6: number[] = [
    254, 254, 243, 230, 196, 177, 153, 140, 133, 130, 129,
  ];

  public static readonly kCat3456: Array<Array<number>> = [
    VP8.kCat3,
    VP8.kCat4,
    VP8.kCat5,
    VP8.kCat6,
  ];

  public static readonly kZigzag: number[] = [
    0, 1, 4, 8, 5, 2, 3, 6, 9, 12, 13, 10, 7, 11, 14, 15,
  ];

  /**
   * How many extra lines are needed on the MB boundary
   * for caching, given a filtering level.
   * Simple filter:  up to 2 luma samples are read and 1 is written.
   * Complex filter: up to 4 luma samples are read and 3 are written. Same for
   * U/V, so it's 8 samples total (because of the 2x upsampling).
   */
  public static readonly kFilterExtraRows: number[] = [0, 2, 8];
}
