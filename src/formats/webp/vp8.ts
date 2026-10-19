/** @format */

import { ArrayUtils } from '../../common/array-utils.js';
import { InputBuffer } from '../../common/input-buffer.js';
import { IccProfile } from '../../image/icc-profile.js';
import { IccProfileCompression } from '../../image/icc-profile-compression.js';
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
import {
  bDcPred,
  bHePred,
  bHuPred,
  bLdPred,
  bPred,
  bRdPred,
  bTmPred,
  bVePred,
  bVlPred,
  bVrPred,
  bHdPred,
  dcPred,
  hPred,
  kAcTable,
  kBands,
  kBModesProba,
  kCat3456,
  kCoeffsProba0,
  kCoeffsUpdateProba,
  kDcTable,
  kScan,
  kYModesIntra4,
  kZigzag,
  numBModes,
  numBands,
  numCtx,
  numProbas,
  numTypes,
  tmPred,
  vPred,
} from './vp8-tables.js';
import { WebPAlpha } from './webp-alpha.js';
import { WebPInfo } from './webp-info.js';
import { WebPInfoInternal } from './webp-info-internal.js';
import { StringUtils } from '../../common/string-utils.js';
import { ExifData } from '../../exif/exif-data.js';

/**
 * WebP lossy format decoder (VP8)
 */
export class VP8 {
  public static readonly filterExtraRows = [0, 2, 8];
  public static readonly vp8Signature = 0x2a019d;
  public static readonly mbFeatureTreeProbs = 3;
  public static readonly numMbSegments = 4;
  public static readonly numRefLfDeltas = 4;
  public static readonly numModeLfDeltas = 4;
  public static readonly maxNumPartitions = 8;
  public static readonly bDcPredNoTop = 4;
  public static readonly bDcPredNoLeft = 5;
  public static readonly bDcPredNoTopLeft = 6;
  public static readonly numBDcModes = 7;
  public static readonly bps = 32;
  public static readonly yuvSize = VP8.bps * 17 + VP8.bps * 9;
  public static readonly ySize = VP8.bps * 17;
  public static readonly yOffset = VP8.bps + 8;
  public static readonly uOffset = VP8.yOffset + VP8.bps * 16 + VP8.bps;
  public static readonly vOffset = VP8.uOffset + 16;
  public static readonly yuvFix = 16;
  public static readonly yuvHalf = 1 << (VP8.yuvFix - 1);
  public static readonly yuvMask = (256 << VP8.yuvFix) - 1;
  public static readonly yuvRangeMin = -227;
  public static readonly yuvRangeMax = 256 + 226;
  public static readonly yuvFix2 = 14;
  public static readonly yuvHalf2 = 1 << (VP8.yuvFix2 - 1);
  public static readonly yuvMask2 = (256 << VP8.yuvFix2) - 1;
  public static readonly xorYuvMask2 = -VP8.yuvMask2 - 1;
  public static readonly kYScale = 19077;
  public static readonly kVToR = 26149;
  public static readonly kUToG = 6419;
  public static readonly kVToG = 13320;
  public static readonly kUToB = 33050;
  public static readonly kRCst =
    -VP8.kYScale * 16 - VP8.kVToR * 128 + VP8.yuvHalf2;
  public static readonly kGCst =
    -VP8.kYScale * 16 + VP8.kUToG * 128 + VP8.kVToG * 128 + VP8.yuvHalf2;
  public static readonly kBCst =
    -VP8.kYScale * 16 - VP8.kUToB * 128 + VP8.yuvHalf2;
  public static readonly kFilterExtraRows: number[] = [0, 2, 8];

  /**
   * Returns public WebP info.
   */
  public get webp(): WebPInfo {
    return this._webp;
  }

  /** VP8 Frame Header */
  private readonly _frameHeader = new VP8FrameHeader();
  /** VP8 Picture Header */
  private readonly _picHeader = new VP8PictureHeader();
  /** VP8 Filter Header */
  private readonly _filterHeader = new VP8FilterHeader();
  /** VP8 Segment Header */
  private readonly _segmentHeader = new VP8SegmentHeader();
  /** Internal WebP info */
  private readonly _webp: WebPInfoInternal;

  /** Input buffer */
  private _input: InputBuffer<Uint8Array>;
  /** Bit reader for main data */
  private _br!: VP8BitReader;
  /** DSP/filter instance */
  private _dsp!: VP8Filter;
  /** Output image */
  private _output?: MemoryImage;

  /** Crop left */
  private _cropLeft: number = 0;
  /** Crop right */
  private _cropRight: number = 0;
  /** Crop top */
  private _cropTop: number = 0;
  /** Crop bottom */
  private _cropBottom: number = 0;
  /** Macroblock width */
  private _mbWidth: number = 0;
  /** Macroblock height */
  private _mbHeight: number = 0;
  /** Top-left macroblock X for filtering */
  private _tlMbX: number = 0;
  /** Top-left macroblock Y for filtering */
  private _tlMbY: number = 0;
  /** Bottom-right macroblock X for decoding */
  private _brMbX: number = 0;
  /** Bottom-right macroblock Y for decoding */
  private _brMbY: number = 0;

  /** Number of partitions */
  private _numPartitions: number = 0;
  /** Per-partition boolean decoders */
  private readonly _partitions: Array<VP8BitReader | undefined> =
    ArrayUtils.fill<VP8BitReader | undefined>(VP8.maxNumPartitions, undefined);
  /** Probabilities */
  private _proba?: VP8Proba;
  /** Use skip probability */
  private _useSkipProba: boolean = false;
  /** Skip probability */
  private _skipP: number = 0;

  /** Dequantization matrices per segment */
  private readonly _dqm: Array<VP8QuantMatrix | undefined> = ArrayUtils.fill<
    VP8QuantMatrix | undefined
  >(VP8.numMbSegments, undefined);
  /** Current segment index */
  private _segment: number = 0;

  /** Top intra modes (4 * _mbWidth) */
  private _intraT?: Uint8Array;
  /** Left intra modes */
  private readonly _intraL: Uint8Array = new Uint8Array(4);

  /** Top Y/U/V samples */
  private _yuvT!: VP8TopSamples[];
  /** Macroblock info (mb_w_ + 1) */
  private _mbInfo!: VP8MB[];
  /** Macroblock data */
  private _mbData!: VP8MBData[];
  /** Filter info per macroblock */
  private _fInfo!: VP8FInfo[];
  /** Precomputed filter strengths */
  private _fStrengths!: Array<Array<VP8FInfo>>;
  /** Filter type: 0=off, 1=simple, 2=complex */
  private _filterType!: number;

  /** Main YUV block buffer */
  private _yuvBlock!: Uint8Array;
  /** Macroblock row cache for Y */
  private _cacheY!: InputBuffer<Uint8Array>;
  /** Macroblock row cache for U */
  private _cacheU!: InputBuffer<Uint8Array>;
  /** Macroblock row cache for V */
  private _cacheV!: InputBuffer<Uint8Array>;
  /** Stride for Y cache */
  private _cacheYStride!: number;
  /** Stride for UV cache */
  private _cacheUVStride!: number;
  /** Temporary Y buffer */
  private _tmpY!: InputBuffer<Uint8Array>;
  /** Temporary U buffer */
  private _tmpU!: InputBuffer<Uint8Array>;
  /** Temporary V buffer */
  private _tmpV!: InputBuffer<Uint8Array>;
  /** Current Y buffer */
  private _y!: InputBuffer<Uint8Array>;
  /** Current U buffer */
  private _u!: InputBuffer<Uint8Array>;
  /** Current V buffer */
  private _v!: InputBuffer<Uint8Array>;
  /** Current alpha buffer */
  private _a?: InputBuffer<Uint8Array>;

  /** Current macroblock X */
  private _mbX: number = 0;
  /** Current macroblock Y */
  private _mbY: number = 0;

  /** Dithering enabled */
  private readonly _dither: boolean = false;

  /** Alpha-plane decoder */
  private _alpha?: WebPAlpha;
  /** Compressed alpha data */
  private _alphaData?: InputBuffer<Uint8Array>;
  /** Alpha plane buffer */
  private _alphaPlane!: Uint8Array;

  /**
   * Create VP8 decoder instance.
   * @param input Input buffer
   * @param webp WebP info
   */
  constructor(input: InputBuffer<Uint8Array>, webp: WebPInfoInternal) {
    this._input = input;
    this._webp = webp;
  }

  /**
   * Decode the input stream and return the decoded image.
   * @returns Decoded image or undefined if failed.
   */
  public decode(): MemoryImage | undefined {
    if (!this.getHeaders()) return undefined;
    this._output = new MemoryImage({
      width: this._webp.width,
      height: this._webp.height,
      numChannels: 4,
    });
    if (!this.initFrame()) return undefined;
    if (!this.parseFrame()) return undefined;
    if (this._webp.exifData.length > 0) {
      const input = new InputBuffer({
        buffer: StringUtils.getCodePoints(this._webp.exifData),
      });
      this._output.exifData = ExifData.fromInputBuffer(input);
    }

    // The ICCP chunk holds the profile uncompressed.
    const iccp = this._webp.iccpData;
    if (iccp !== undefined) {
      this._output.iccProfile = new IccProfile(
        'ICC_PROFILE',
        IccProfileCompression.none,
        iccp
      );
    }

    return this._output;
  }

  /**
   * Decode VP8 header from input stream.
   * @returns True if header is valid.
   */
  public decodeHeader(): boolean {
    const bits = this._input.readUint24();
    const keyFrame = (bits & 1) === 0;
    if (!keyFrame) return false;
    if (((bits >>> 1) & 7) > 3) return false;
    if (((bits >>> 4) & 1) === 0) return false;
    this._frameHeader.keyFrame = (bits & 1) === 0;
    this._frameHeader.profile = (bits >>> 1) & 7;
    this._frameHeader.show = (bits >>> 4) & 1;
    this._frameHeader.partitionLength = bits >>> 5;
    const signature = this._input.readUint24();
    if (signature !== VP8.vp8Signature) return false;
    this._webp.width = this._input.readUint16();
    this._webp.height = this._input.readUint16();
    return true;
  }

  /**
   * Compute vertical position of macroblock.
   * @param mbY Macroblock Y
   * @returns Vertical pixel position
   */
  public macroBlockVPos(mbY: number): number {
    return mbY * 16;
  }

  /**
   * Parse all headers and initialize decoding state.
   * @returns True if headers are valid.
   */
  private getHeaders(): boolean {
    if (!this.decodeHeader()) return false;
    this._proba = new VP8Proba();
    for (let i = 0; i < VP8.numMbSegments; ++i)
      this._dqm[i] = new VP8QuantMatrix();
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
    if (!this.parseSegmentHeader(this._segmentHeader, this._proba))
      return false;
    if (!this.parseFilterHeader()) return false;
    if (!this.parsePartitions(this._input)) return false;
    this.parseQuant();
    this._br.get();
    this.parseProba();
    return true;
  }

  /**
   * Parse segment header.
   * @param hdr Segment header
   * @param proba Probability table
   * @returns True if parsed
   */
  private parseSegmentHeader(hdr: VP8SegmentHeader, proba?: VP8Proba): boolean {
    hdr.useSegment = this._br.get() !== 0;
    if (hdr.useSegment) {
      hdr.updateMap = this._br.get() !== 0;
      if (this._br.get() !== 0) {
        hdr.absoluteDelta = this._br.get() !== 0;
        for (let s = 0; s < VP8.numMbSegments; ++s)
          hdr.quantizer[s] =
            this._br.get() !== 0 ? this._br.getSignedValue(7) : 0;
        for (let s = 0; s < VP8.numMbSegments; ++s)
          hdr.filterStrength[s] =
            this._br.get() !== 0 ? this._br.getSignedValue(6) : 0;
      }
      if (hdr.updateMap) {
        for (let s = 0; s < VP8.mbFeatureTreeProbs; ++s)
          proba!.segments[s] =
            this._br.get() !== 0 ? this._br.getValue(8) : 255;
      }
    } else hdr.updateMap = false;
    return true;
  }

  /**
   * Parse filter header.
   * @returns True if parsed
   */
  private parseFilterHeader(): boolean {
    const hdr = this._filterHeader;
    this._filterHeader.simple = this._br.get() !== 0;
    this._filterHeader.level = this._br.getValue(6);
    this._filterHeader.sharpness = this._br.getValue(3);
    this._filterHeader.useLfDelta = this._br.get() !== 0;
    if (hdr.useLfDelta && this._br.get() !== 0) {
      for (let i = 0; i < VP8.numRefLfDeltas; ++i)
        if (this._br.get() !== 0)
          hdr.refLfDelta[i] = this._br.getSignedValue(6);
      for (let i = 0; i < VP8.numModeLfDeltas; ++i)
        if (this._br.get() !== 0)
          hdr.modeLfDelta[i] = this._br.getSignedValue(6);
    }
    this._filterType = hdr.level === 0 ? 0 : hdr.simple ? 1 : 2;
    return true;
  }

  /**
   * Parse partitions from input buffer.
   * @param input Input buffer
   * @returns True if parsed
   */
  private parsePartitions(input: InputBuffer<Uint8Array>): boolean {
    let sz = 0;
    const bufEnd = input.length;
    this._numPartitions = 1 << this._br.getValue(2);
    const lastPart = this._numPartitions - 1;
    let partStart = lastPart * 3;
    if (bufEnd < partStart) return false;
    for (let p = 0; p < lastPart; ++p) {
      const szb = input.peek(3, sz);
      const psize = szb.get(0) | (szb.get(1) << 8) | (szb.get(2) << 16);
      let partEnd = partStart + psize;
      if (partEnd > bufEnd) partEnd = bufEnd;
      const pin = input.subarray(partEnd - partStart, partStart);
      this._partitions[p] = new VP8BitReader(pin);
      partStart = partEnd;
      sz += 3;
    }
    const pin = input.subarray(bufEnd - partStart, input.position + partStart);
    this._partitions[lastPart] = new VP8BitReader(pin);
    return partStart < bufEnd;
  }

  /**
   * Parse quantization parameters and update dequant matrices.
   */
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
        if (!hdr.absoluteDelta) q += baseQ0;
      } else {
        if (i > 0) {
          this._dqm[i] = this._dqm[0];
          continue;
        } else q = baseQ0;
      }
      const m = this._dqm[i]!;
      m.y1Mat[0] = kDcTable[VP8.clip(q + dqy1Dc, 127)];
      m.y1Mat[1] = kAcTable[VP8.clip(q + 0, 127)];
      m.y2Mat[0] = kDcTable[VP8.clip(q + dqy2Dc, 127)] * 2;
      m.y2Mat[1] = (kAcTable[VP8.clip(q + dqy2Ac, 127)] * 101581) >>> 16;
      if (m.y2Mat[1] < 8) m.y2Mat[1] = 8;
      m.uvMat[0] = kDcTable[VP8.clip(q + dquvDc, 117)];
      m.uvMat[1] = kAcTable[VP8.clip(q + dquvAc, 127)];
      m.uvQuant = q + dquvAc;
    }
  }

  /**
   * Parse probability values for VP8 codec.
   */
  private parseProba(): void {
    const proba = this._proba;
    for (let t = 0; t < numTypes; ++t)
      for (let b = 0; b < numBands; ++b)
        for (let c = 0; c < numCtx; ++c)
          for (let p = 0; p < numProbas; ++p) {
            const v =
              this._br.getBit(kCoeffsUpdateProba[t][b][c][p]) !== 0
                ? this._br.getValue(8)
                : kCoeffsProba0[t][b][c][p];
            proba!.bands[t][b].probas[c][p] = v;
          }
    this._useSkipProba = this._br.get() !== 0;
    if (this._useSkipProba) this._skipP = this._br.getValue(8);
  }

  /**
   * Initialize frame buffers and state for decoding.
   * @returns True if successful.
   */
  private initFrame(): boolean {
    if (this._webp.alphaData !== undefined)
      this._alphaData = this._webp.alphaData;
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
    const extraPixels = VP8.filterExtraRows[this._filterType];
    if (this._filterType === 2) {
      this._tlMbX = 0;
      this._tlMbY = 0;
    } else {
      this._tlMbX = Math.trunc((this._cropLeft - extraPixels) / 16);
      this._tlMbY = Math.trunc((this._cropTop - extraPixels) / 16);
      if (this._tlMbX < 0) this._tlMbX = 0;
      if (this._tlMbY < 0) this._tlMbY = 0;
    }
    this._brMbY = Math.trunc((this._cropBottom + 15 + extraPixels) / 16);
    this._brMbX = Math.trunc((this._cropRight + 15 + extraPixels) / 16);
    if (this._brMbX > this._mbWidth) this._brMbX = this._mbWidth;
    if (this._brMbY > this._mbHeight) this._brMbY = this._mbHeight;
    this._mbInfo = ArrayUtils.generate<VP8MB>(
      this._mbWidth + 1,
      () => new VP8MB()
    );
    this._mbData = ArrayUtils.generate<VP8MBData>(
      this._mbWidth,
      () => new VP8MBData()
    );
    this._fInfo = ArrayUtils.generate<VP8FInfo>(
      this._mbWidth,
      () => new VP8FInfo()
    );
    this.precomputeFilterStrengths();
    this._dsp = new VP8Filter();
    return true;
  }

  /**
   * Precompute filter strengths for each macroblock segment.
   */
  private precomputeFilterStrengths(): void {
    if (this._filterType > 0) {
      const hdr = this._filterHeader;
      for (let s = 0; s < VP8.numMbSegments; ++s) {
        let baseLevel: number = 0;
        if (this._segmentHeader.useSegment) {
          baseLevel = this._segmentHeader.filterStrength[s];
          if (!this._segmentHeader.absoluteDelta) baseLevel += hdr.level;
        } else baseLevel = hdr.level;
        for (let i4x4 = 0; i4x4 <= 1; ++i4x4) {
          const info = this._fStrengths[s][i4x4];
          let level = baseLevel;
          if (hdr.useLfDelta) {
            level += hdr.refLfDelta[0];
            if (i4x4 !== 0) level += hdr.modeLfDelta[0];
          }
          level = level < 0 ? 0 : level > 63 ? 63 : level;
          if (level > 0) {
            let iLevel: number = level;
            if (hdr.sharpness > 0) {
              if (hdr.sharpness > 4) iLevel >>>= 2;
              else iLevel >>>= 1;
              if (iLevel > 9 - hdr.sharpness) iLevel = 9 - hdr.sharpness;
            }
            if (iLevel < 1) iLevel = 1;
            info.fInnerLevel = iLevel;
            info.fLimit = 2 * level + iLevel;
            info.hevThresh = level >= 40 ? 2 : level >= 15 ? 1 : 0;
          } else info.fLimit = 0;
          info.fInner = i4x4 !== 0;
        }
      }
    }
  }

  /**
   * Parse frame by iterating macroblock rows and columns.
   * @returns True if frame parsed
   */
  private parseFrame(): boolean {
    for (this._mbY = 0; this._mbY < this._brMbY; ++this._mbY) {
      const tokenBr = this._partitions[this._mbY & (this._numPartitions - 1)];
      for (; this._mbX < this._mbWidth; ++this._mbX)
        if (!this.decodeMB(tokenBr)) return false;
      this._mbInfo[0].nz = 0;
      this._mbInfo[0].nzDc = 0;
      this._intraL.fill(bDcPred);
      this._mbX = 0;
      if (!this.processRow()) return false;
    }
    return true;
  }

  /**
   * Process a row: reconstruct, filter, and emit.
   * @returns True if successful
   */
  private processRow(): boolean {
    this.reconstructRow();
    const useFilter =
      this._filterType > 0 &&
      this._mbY >= this._tlMbY &&
      this._mbY <= this._brMbY;
    return this.finishRow(useFilter);
  }

  /**
   * Reconstruct a row of macroblocks.
   */
  private reconstructRow(): void {
    const mbY = this._mbY;
    const yuv = this._yuvBlock;
    const yDst = new InputBuffer<Uint8Array>({
      buffer: yuv,
      offset: VP8.yOffset,
    });
    const uDst = new InputBuffer<Uint8Array>({
      buffer: yuv,
      offset: VP8.uOffset,
    });
    const vDst = new InputBuffer<Uint8Array>({
      buffer: yuv,
      offset: VP8.vOffset,
    });
    const cacheY = this._cacheY.buffer;
    const cacheU = this._cacheU.buffer;
    const cacheV = this._cacheV.buffer;
    const cacheYStride = this._cacheYStride;
    const cacheUVStride = this._cacheUVStride;
    for (let mbX = 0; mbX < this._mbWidth; ++mbX) {
      const block = this._mbData[mbX];
      if (mbX > 0) {
        for (let j = -1; j < 16; ++j)
          VP8.copy(
            yuv,
            VP8.yOffset + j * VP8.bps - 4,
            yuv,
            VP8.yOffset + j * VP8.bps + 12,
            4
          );
        for (let j = -1; j < 8; ++j) {
          VP8.copy(
            yuv,
            VP8.uOffset + j * VP8.bps - 4,
            yuv,
            VP8.uOffset + j * VP8.bps + 4,
            4
          );
          VP8.copy(
            yuv,
            VP8.vOffset + j * VP8.bps - 4,
            yuv,
            VP8.vOffset + j * VP8.bps + 4,
            4
          );
        }
      } else {
        for (let j = 0; j < 16; ++j) yuv[VP8.yOffset + j * VP8.bps - 1] = 129;
        for (let j = 0; j < 8; ++j) {
          yuv[VP8.uOffset + j * VP8.bps - 1] = 129;
          yuv[VP8.vOffset + j * VP8.bps - 1] = 129;
        }
        if (mbY > 0) {
          yuv[VP8.yOffset - 1 - VP8.bps] = 129;
          yuv[VP8.uOffset - 1 - VP8.bps] = 129;
          yuv[VP8.vOffset - 1 - VP8.bps] = 129;
        }
      }
      const topYuv = this._yuvT[mbX];
      const coeffs = block.coeffs;
      let bits = block.nonZeroY;
      if (mbY > 0) {
        VP8.copy(yuv, VP8.yOffset - VP8.bps, topYuv.y, 0, 16);
        VP8.copy(yuv, VP8.uOffset - VP8.bps, topYuv.u, 0, 8);
        VP8.copy(yuv, VP8.vOffset - VP8.bps, topYuv.v, 0, 8);
      } else if (mbX === 0) {
        yuv.fill(
          127,
          VP8.yOffset - VP8.bps - 1,
          VP8.yOffset - VP8.bps + 16 + 4
        );
        yuv.fill(127, VP8.uOffset - VP8.bps - 1, VP8.uOffset - VP8.bps + 8);
        yuv.fill(127, VP8.vOffset - VP8.bps - 1, VP8.vOffset - VP8.bps + 8);
      }
      if (block.isIntra4x4) {
        const topRight = VP8.yOffset - VP8.bps + 16;
        if (mbY > 0) {
          if (mbX >= this._mbWidth - 1)
            yuv.fill(topYuv.y[15], topRight, topRight + 4);
          else VP8.copy(yuv, topRight, this._yuvT[mbX + 1].y, 0, 4);
        }
        VP8.copy(yuv, topRight + 4 * VP8.bps, yuv, topRight, 4);
        VP8.copy(yuv, topRight + 8 * VP8.bps, yuv, topRight, 4);
        VP8.copy(yuv, topRight + 12 * VP8.bps, yuv, topRight, 4);
        for (let n = 0; n < 16; ++n, bits = (bits << 2) & 0xffffffff) {
          const dst = InputBuffer.from(yDst, kScan[n]);
          VP8Filter.predLuma4[block.imodes[n]](dst);
          this.doTransform(
            bits,
            new InputBuffer<Int16Array>({ buffer: coeffs, offset: n * 16 }),
            dst
          );
        }
      } else {
        const predFunc = VP8.checkMode(mbX, mbY, block.imodes[0])!;
        VP8Filter.predLuma16[predFunc](yDst);
        if (bits !== 0) {
          for (let n = 0; n < 16; ++n, bits = (bits << 2) & 0xffffffff) {
            const dst = InputBuffer.from(yDst, kScan[n]);
            this.doTransform(
              bits,
              new InputBuffer<Int16Array>({ buffer: coeffs, offset: n * 16 }),
              dst
            );
          }
        }
      }
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
      if (mbY < this._mbHeight - 1) {
        VP8.copy(topYuv.y, 0, yuv, VP8.yOffset + 15 * VP8.bps, 16);
        VP8.copy(topYuv.u, 0, yuv, VP8.uOffset + 7 * VP8.bps, 8);
        VP8.copy(topYuv.v, 0, yuv, VP8.vOffset + 7 * VP8.bps, 8);
      }
      const yOut = this._cacheY.offset + mbX * 16;
      const uOut = this._cacheU.offset + mbX * 8;
      const vOut = this._cacheV.offset + mbX * 8;
      for (let j = 0; j < 16; ++j)
        VP8.copy(
          cacheY,
          yOut + j * cacheYStride,
          yuv,
          VP8.yOffset + j * VP8.bps,
          16
        );
      for (let j = 0; j < 8; ++j) {
        VP8.copy(
          cacheU,
          uOut + j * cacheUVStride,
          yuv,
          VP8.uOffset + j * VP8.bps,
          8
        );
        VP8.copy(
          cacheV,
          vOut + j * cacheUVStride,
          yuv,
          VP8.vOffset + j * VP8.bps,
          8
        );
      }
    }
  }

  /**
   * Copies n bytes from src at si to dst at di.
   * @param {Uint8Array} dst - The destination buffer.
   * @param {number} di - The destination index.
   * @param {Uint8Array} src - The source buffer.
   * @param {number} si - The source index.
   * @param {number} n - The number of bytes to copy.
   */
  private static copy(
    dst: Uint8Array,
    di: number,
    src: Uint8Array,
    si: number,
    n: number
  ): void {
    for (let i = 0; i < n; ++i) {
      dst[di + i] = src[si + i];
    }
  }

  /**
   * Apply filter to macroblock at (mbX, mbY).
   * @param mbX Macroblock X
   * @param mbY Macroblock Y
   */
  private doFilter(mbX: number, mbY: number): void {
    const yBps = this._cacheYStride;
    const fInfo = this._fInfo[mbX];
    const y = this._cacheY.buffer;
    const yo = this._cacheY.offset + mbX * 16;
    const limit = fInfo.fLimit;
    if (limit === 0) return;
    if (this._filterType === 1) {
      if (mbX > 0) this._dsp.simpleHFilter16(y, yo, yBps, limit + 4);
      if (fInfo.fInner) this._dsp.simpleHFilter16i(y, yo, yBps, limit);
      if (mbY > 0) this._dsp.simpleVFilter16(y, yo, yBps, limit + 4);
      if (fInfo.fInner) this._dsp.simpleVFilter16i(y, yo, yBps, limit);
    } else {
      const iLevel = fInfo.fInnerLevel;
      const uvBps = this._cacheUVStride;
      const u = this._cacheU.buffer;
      const uo = this._cacheU.offset + mbX * 8;
      const v = this._cacheV.buffer;
      const vo = this._cacheV.offset + mbX * 8;
      const hevThresh = fInfo.hevThresh;
      if (mbX > 0) {
        this._dsp.hFilter16(y, yo, yBps, limit + 4, iLevel, hevThresh);
        this._dsp.hFilter8(u, uo, v, vo, uvBps, limit + 4, iLevel, hevThresh);
      }
      if (fInfo.fInner) {
        this._dsp.hFilter16i(y, yo, yBps, limit, iLevel, hevThresh);
        this._dsp.hFilter8i(u, uo, v, vo, uvBps, limit, iLevel, hevThresh);
      }
      if (mbY > 0) {
        this._dsp.vFilter16(y, yo, yBps, limit + 4, iLevel, hevThresh);
        this._dsp.vFilter8(u, uo, v, vo, uvBps, limit + 4, iLevel, hevThresh);
      }
      if (fInfo.fInner) {
        this._dsp.vFilter16i(y, yo, yBps, limit, iLevel, hevThresh);
        this._dsp.vFilter8i(u, uo, v, vo, uvBps, limit, iLevel, hevThresh);
      }
    }
  }

  /**
   * Filter a row of macroblocks.
   */
  private filterRow(): void {
    for (let mbX = this._tlMbX; mbX < this._brMbX; ++mbX)
      this.doFilter(mbX, this._mbY);
  }

  /**
   * Dither the current row (stub).
   */
  private ditherRow(): void {}

  /**
   * Finalize processing of the current row.
   * @param useFilter Whether to apply filter
   * @returns True if successful
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
    let yStart = this.macroBlockVPos(mbY);
    let yEnd = this.macroBlockVPos(mbY + 1);
    if (useFilter) this.filterRow();
    if (this._dither) this.ditherRow();
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
    if (!isLastRow) yEnd -= extraYRows;
    if (yEnd > this._cropBottom) yEnd = this._cropBottom;
    this._a = undefined;
    if (this._alphaData !== undefined && yStart < yEnd) {
      this._a = this.decompressAlphaRows(yStart, yEnd - yStart);
      if (this._a === undefined) return false;
    }
    if (yStart < this._cropTop) {
      const deltaY = this._cropTop - yStart;
      yStart = this._cropTop;
      this._y.offset += this._cacheYStride * deltaY;
      this._u.offset += this._cacheUVStride * (deltaY >>> 1);
      this._v.offset += this._cacheUVStride * (deltaY >>> 1);
      if (this._a !== undefined) this._a.offset += this._webp.width * deltaY;
    }
    if (yStart < yEnd) {
      this._y.offset += this._cropLeft;
      this._u.offset += this._cropLeft >>> 1;
      this._v.offset += this._cropLeft >>> 1;
      if (this._a !== undefined) this._a.offset += this._cropLeft;
      this.put(
        yStart - this._cropTop,
        this._cropRight - this._cropLeft,
        yEnd - yStart
      );
    }
    if (!isLastRow) {
      this._cacheY.memcpy(-ySize, ySize, yDst, 16 * this._cacheYStride);
      this._cacheU.memcpy(-uvSize, uvSize, uDst, 8 * this._cacheUVStride);
      this._cacheV.memcpy(-uvSize, uvSize, vDst, 8 * this._cacheUVStride);
    }
    return true;
  }

  /**
   * Write decoded RGB and alpha to output.
   * @param mbY Y position
   * @param mbW Width
   * @param mbH Height
   * @returns True if written
   */
  private put(mbY: number, mbW: number, mbH: number): boolean {
    if (mbW <= 0 || mbH <= 0) return false;
    this.emitFancyRGB(mbY, mbW, mbH);
    this.emitAlphaRGB(mbY, mbW, mbH);
    return true;
  }

  /**
   * Emit alpha values for RGB.
   * @param mbY Macroblock Y
   * @param mbW Macroblock width
   * @param mbH Macroblock height
   */
  private emitAlphaRGB(mbY: number, mbW: number, mbH: number): void {
    if (this._a === undefined) return;
    const alpha = this._a.buffer;
    let alphaOffset = this._a.offset;
    let startY = mbY;
    let numRows = mbH;
    if (startY === 0) --numRows;
    else {
      --startY;
      alphaOffset -= this.webp.width;
    }
    if (this._cropTop + mbY + mbH === this._cropBottom)
      numRows = this._cropBottom - this._cropTop - startY;
    const out = this._output!.toUint8Array();
    const outStride = this._output!.width * 4;
    for (let y = 0; y < numRows; ++y) {
      let di = (y + startY) * outStride + 3;
      for (let x = 0; x < mbW; ++x, di += 4) {
        out[di] = alpha[alphaOffset + x];
      }
      alphaOffset += this.webp.width;
    }
  }

  /**
   * Emit fancy RGB values.
   * @param mbY Macroblock Y
   * @param mbW Macroblock width
   * @param mbH Macroblock height
   * @returns Number of lines output
   */
  private emitFancyRGB(mbY: number, mbW: number, mbH: number): number {
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
    if (y === 0)
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
    else {
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
    curY.offset += this._cacheYStride;
    if (this._cropTop + yEnd < this._cropBottom) {
      this._tmpY.memcpy(0, mbW, curY);
      this._tmpU.memcpy(0, uvW, curU);
      this._tmpV.memcpy(0, uvW, curV);
      numLinesOut--;
    } else if ((yEnd & 1) === 0) {
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
    return numLinesOut;
  }

  /**
   * Decompress alpha rows.
   * @param row Start row
   * @param numRows Number of rows
   * @returns Buffer with decompressed alpha rows or undefined
   */
  private decompressAlphaRows(
    row: number,
    numRows: number
  ): InputBuffer<Uint8Array> | undefined {
    const width = this.webp.width;
    const height = this.webp.height;
    if (row < 0 || numRows <= 0 || row + numRows > height) return undefined;
    if (row === 0) {
      this._alphaPlane = new Uint8Array(width * height);
      this._alpha = new WebPAlpha(this._alphaData!, width, height);
    }
    if (this._alpha !== undefined) {
      if (!this._alpha.isAlphaDecoded) {
        if (!this._alpha.decode(row, numRows, this._alphaPlane))
          return undefined;
      }
    }
    return new InputBuffer<Uint8Array>({
      buffer: this._alphaPlane,
      offset: row * width,
    });
  }

  /**
   * Decode a macroblock.
   * @param tokenBr Bit reader for tokens
   * @returns True if successful
   */
  private decodeMB(tokenBr?: VP8BitReader): boolean {
    const left = this._mbInfo[0];
    const mb = this._mbInfo[1 + this._mbX];
    const block = this._mbData[this._mbX];
    let skip: boolean = false;
    if (this._segmentHeader.updateMap) {
      this._segment =
        this._br.getBit(this._proba!.segments[0]) === 0
          ? this._br.getBit(this._proba!.segments[1])
          : 2 + this._br.getBit(this._proba!.segments[2]);
    }
    skip = this._useSkipProba && this._br.getBit(this._skipP) !== 0;
    this.parseIntraMode();
    if (!skip) skip = this.parseResiduals(mb, tokenBr);
    else {
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
      const src = this._fStrengths[this._segment][block.isIntra4x4 ? 1 : 0];
      const info = this._fInfo[this._mbX];
      info.fLimit = src.fLimit;
      info.fInnerLevel = src.fInnerLevel;
      info.hevThresh = src.hevThresh;
      info.fInner = src.fInner || !skip;
    }
    return true;
  }

  /**
   * Parse residuals for a macroblock.
   * @param mb Macroblock info
   * @param tokenBr Bit reader for tokens
   * @returns True if parsed
   */
  private parseResiduals(mb: VP8MB, tokenBr?: VP8BitReader): boolean {
    const bands = this._proba!.bands;
    const q = this._dqm[this._segment];
    const block = this._mbData[this._mbX];
    const dst = new InputBuffer<Int16Array>({ buffer: block.coeffs });
    const leftMb = this._mbInfo[0];
    let tnz: number = 0;
    let lnz: number = 0;
    let nonZeroY = 0;
    let nonZeroUV = 0;
    let outTopNz = 0;
    let outLeftNz = 0;
    let first = 0;
    dst.memset(0, dst.length, 0);
    let acProba: VP8BandProbas[] = [];
    if (!block.isIntra4x4) {
      const dc = new InputBuffer<Int16Array>({ buffer: new Int16Array(16) });
      const ctx = mb.nzDc + leftMb.nzDc;
      const nz = this.getCoeffs(tokenBr, bands[1], ctx, q!.y2Mat, 0, dc);
      leftMb.nzDc = nz > 0 ? 1 : 0;
      mb.nzDc = leftMb.nzDc;
      if (nz > 1) this.transformWHT(dc, dst);
      else {
        const dc0 = (dc.get(0) + 3) >>> 3;
        for (let i = 0; i < 16 * 16; i += 16) dst.set(i, dc0);
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
      nonZeroUV |= nzCoeffs << (4 * ch);
      outTopNz |= (tnz << 4) << ch;
      outLeftNz |= (lnz & 0xf0) << ch;
    }
    mb.nz = outTopNz;
    leftMb.nz = outLeftNz;
    block.nonZeroY = nonZeroY;
    block.nonZeroUV = nonZeroUV;
    block.dither = (nonZeroUV & 0xaaaa) !== 0 ? 0 : q!.dither;
    return (nonZeroY | nonZeroUV) === 0;
  }

  /**
   * Parse intra prediction mode for macroblock.
   */
  private parseIntraMode(): void {
    const ti = 4 * this._mbX;
    const li = 0;
    const top = this._intraT;
    const left = this._intraL;
    const block = this._mbData[this._mbX];
    block.isIntra4x4 = this._br.getBit(145) === 0;
    if (!block.isIntra4x4) {
      const ymode =
        this._br.getBit(156) !== 0
          ? this._br.getBit(128) !== 0
            ? tmPred
            : hPred
          : this._br.getBit(163) !== 0
            ? vPred
            : dcPred;
      block.imodes[0] = ymode;
      top!.fill(ymode, ti, ti + 4);
      left.fill(ymode, li, li + 4);
    } else {
      const modes = block.imodes;
      let mi = 0;
      for (let y = 0; y < 4; ++y) {
        let ymode = left[y];
        for (let x = 0; x < 4; ++x) {
          const prob = kBModesProba[top![ti + x]][ymode];
          const b = this._br.getBit(prob[0]);
          let i = kYModesIntra4[b];
          while (i > 0) i = kYModesIntra4[2 * i + this._br.getBit(prob[i])];
          ymode = -i;
          top![ti + x] = ymode;
        }
        ArrayUtils.copyRange(top!, ti, modes, mi, 4);
        mi += 4;
        left[y] = ymode;
      }
    }
    block.uvmode =
      this._br.getBit(142) === 0
        ? dcPred
        : this._br.getBit(114) === 0
          ? vPred
          : this._br.getBit(183) !== 0
            ? tmPred
            : hPred;
  }

  /**
   * Transform input buffer based on bit pattern.
   * @param bits Bit pattern
   * @param src Source buffer
   * @param dst Destination buffer
   */
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

  /**
   * Perform UV transform on input buffers.
   * @param bits Bit pattern
   * @param src Source buffer
   * @param dst Destination buffer
   */
  private doUVTransform(
    bits: number,
    src: InputBuffer<Int16Array>,
    dst: InputBuffer<Uint8Array>
  ): void {
    if ((bits & 0xff) !== 0) {
      if ((bits & 0xaa) !== 0) this._dsp.transformUV(src, dst);
      else this._dsp.transformDCUV(src, dst);
    }
  }

  /**
   * Walsh-Hadamard Transform (WHT) on input buffer.
   * @param src Source buffer
   * @param out Output buffer
   */
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

  /**
   * Compute non-zero coefficients code.
   * @param nzCoeffs Current code
   * @param nz Non-zero count
   * @param dcNz Non-zero DC
   * @returns Updated code
   */
  private nzCodeBits(nzCoeffs: number, nz: number, dcNz: number): number {
    let _nzCoeffs = nzCoeffs;
    _nzCoeffs <<= 2;
    _nzCoeffs |= nz > 3 ? 3 : nz > 1 ? 2 : dcNz;
    return _nzCoeffs;
  }

  /**
   * Get large value from bit reader.
   * @param br Bit reader
   * @param p Probability array
   * @returns Value
   */
  private getLargeValue(br: VP8BitReader, p: Uint8Array): number {
    let v: number = 0;
    if (br.getBit(p[3]) === 0)
      v = br.getBit(p[4]) === 0 ? 2 : 3 + br.getBit(p[5]);
    else if (br.getBit(p[6]) === 0)
      v =
        br.getBit(p[7]) === 0
          ? 5 + br.getBit(159)
          : 7 + 2 * br.getBit(165) + br.getBit(145);
    else {
      const bit1 = br.getBit(p[8]);
      const bit0 = br.getBit(p[9 + bit1]);
      const cat = 2 * bit1 + bit0;
      v = 0;
      const tab = kCat3456[cat];
      const len = tab.length;
      for (let i = 0; i < len; ++i) v += v + br.getBit(tab[i]);
      v += 3 + (8 << cat);
    }
    return v;
  }

  /**
   * Get position of last non-zero coefficient plus one.
   * @param br Bit reader
   * @param prob Probability bands
   * @param ctx Context
   * @param dq Dequant values
   * @param n Initial coefficient index
   * @param out Output buffer
   * @returns Position
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
    let p: Uint8Array = prob[_n].probas[ctx];
    for (; _n < 16; ++_n) {
      if (br!.getBit(p[0]) === 0) return _n;
      while (br!.getBit(p[1]) === 0) {
        p = prob[kBands[++_n]].probas[0];
        if (_n === 16) return 16;
      }
      {
        const pCtx = prob[kBands[_n + 1]].probas;
        let v: number = 0;
        if (br!.getBit(p[2]) === 0) {
          v = 1;
          p = pCtx[1];
        } else {
          v = this.getLargeValue(br!, p);
          p = pCtx[2];
        }
        out.set(kZigzag[_n], br!.getSigned(v) * dq[_n > 0 ? 1 : 0]);
      }
    }
    return 16;
  }

  /**
   * Clips value v to range [0, M].
   * @param v Value
   * @param M Max
   * @returns Clipped value
   */
  private static clip(v: number, M: number): number {
    return v < 0 ? 0 : v > M ? M : v;
  }

  /**
   * Check prediction mode based on macroblock position.
   * @param mbX Macroblock X
   * @param mbY Macroblock Y
   * @param mode Optional mode
   * @returns Mode or undefined
   */
  private static checkMode(
    mbX: number,
    mbY: number,
    mode?: number
  ): number | undefined {
    if (mode === bDcPred) {
      if (mbX === 0)
        return mbY === 0 ? VP8.bDcPredNoTopLeft : VP8.bDcPredNoLeft;
      else return mbY === 0 ? VP8.bDcPredNoTop : bDcPred;
    }
    return mode;
  }

  /**
   * Clip value to 8-bit range.
   * @param v Value
   * @returns Clipped value
   */
  private clip8(v: number): number {
    const d = (v & VP8.xorYuvMask2) === 0 ? v >>> VP8.yuvFix2 : v < 0 ? 0 : 255;
    return d;
  }

  /**
   * Convert YUV to R component.
   * @param y Y
   * @param v V
   * @returns R
   */
  private yuvToR(y: number, v: number): number {
    return this.clip8(VP8.kYScale * y + VP8.kVToR * v + VP8.kRCst);
  }

  /**
   * Convert YUV to G component.
   * @param y Y
   * @param u U
   * @param v V
   * @returns G
   */
  private yuvToG(y: number, u: number, v: number): number {
    return this.clip8(
      VP8.kYScale * y - VP8.kUToG * u - VP8.kVToG * v + VP8.kGCst
    );
  }

  /**
   * Convert YUV to B component.
   * @param y Y
   * @param u U
   * @returns B
   */
  private yuvToB(y: number, u: number): number {
    return this.clip8(VP8.kYScale * y + VP8.kUToB * u + VP8.kBCst);
  }

  /**
   * Convert YUV to RGBA.
   * @param y Y
   * @param u U
   * @param v V
   * @param rgba Output buffer
   * @param o Output offset
   */
  private yuvToRgba(
    y: number,
    u: number,
    v: number,
    rgba: Uint8Array,
    o: number
  ): void {
    rgba[o] = this.yuvToR(y, v);
    rgba[o + 1] = this.yuvToG(y, u, v);
    rgba[o + 2] = this.yuvToB(y, u);
    rgba[o + 3] = 0xff;
  }

  /**
   * Upsample YUV components to RGBA.
   * @param topY Top Y buffer
   * @param bottomY Bottom Y buffer
   * @param topU Top U buffer
   * @param topV Top V buffer
   * @param curU Current U buffer
   * @param curV Current V buffer
   * @param topDst Top output buffer
   * @param bottomDst Bottom output buffer
   * @param len Length
   */
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
    const ty = topY.buffer;
    const tyo = topY.offset;
    const tu = topU.buffer;
    const tuo = topU.offset;
    const tv = topV.buffer;
    const tvo = topV.offset;
    const cu = curU.buffer;
    const cuo = curU.offset;
    const cv = curV.buffer;
    const cvo = curV.offset;
    const td = topDst.buffer;
    const tdo = topDst.offset;
    const by = bottomY === undefined ? undefined : bottomY.buffer;
    const byo = bottomY?.offset ?? 0;
    const bd = bottomDst === undefined ? undefined : bottomDst.buffer;
    const bdo = bottomDst?.offset ?? 0;

    const lastPixelPair = (len - 1) >>> 1;
    let tlUv = tu[tuo] | (tv[tvo] << 16);
    let lUv = cu[cuo] | (cv[cvo] << 16);

    let uv0 = (3 * tlUv + lUv + 0x00020002) >>> 2;
    this.yuvToRgba(ty[tyo], uv0 & 0xff, uv0 >>> 16, td, tdo);

    if (by !== undefined) {
      uv0 = (3 * lUv + tlUv + 0x00020002) >>> 2;
      this.yuvToRgba(by[byo], uv0 & 0xff, uv0 >>> 16, bd!, bdo);
    }

    for (let x = 1; x <= lastPixelPair; ++x) {
      const tUv = tu[tuo + x] | (tv[tvo + x] << 16);
      const uv = cu[cuo + x] | (cv[cvo + x] << 16);
      const avg = tlUv + tUv + lUv + uv + 0x00080008;
      const diag12 = (avg + 2 * (tUv + lUv)) >>> 3;
      const diag03 = (avg + 2 * (tlUv + uv)) >>> 3;

      uv0 = (diag12 + tlUv) >>> 1;
      let uv1 = (diag03 + tUv) >>> 1;

      this.yuvToRgba(
        ty[tyo + 2 * x - 1],
        uv0 & 0xff,
        uv0 >>> 16,
        td,
        tdo + (2 * x - 1) * 4
      );
      this.yuvToRgba(
        ty[tyo + 2 * x],
        uv1 & 0xff,
        uv1 >>> 16,
        td,
        tdo + 2 * x * 4
      );

      if (by !== undefined) {
        uv0 = (diag03 + lUv) >>> 1;
        uv1 = (diag12 + uv) >>> 1;
        this.yuvToRgba(
          by[byo + 2 * x - 1],
          uv0 & 0xff,
          uv0 >>> 16,
          bd!,
          bdo + (2 * x - 1) * 4
        );
        this.yuvToRgba(
          by[byo + 2 * x],
          uv1 & 0xff,
          uv1 >>> 16,
          bd!,
          bdo + 2 * x * 4
        );
      }

      tlUv = tUv;
      lUv = uv;
    }

    if ((len & 1) === 0) {
      uv0 = (3 * tlUv + lUv + 0x00020002) >>> 2;
      this.yuvToRgba(
        ty[tyo + len - 1],
        uv0 & 0xff,
        uv0 >>> 16,
        td,
        tdo + (len - 1) * 4
      );

      if (by !== undefined) {
        uv0 = (3 * lUv + tlUv + 0x00020002) >>> 2;
        this.yuvToRgba(
          by[byo + len - 1],
          uv0 & 0xff,
          uv0 >>> 16,
          bd!,
          bdo + (len - 1) * 4
        );
      }
    }
  }
}
