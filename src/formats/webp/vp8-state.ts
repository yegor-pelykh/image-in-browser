/** @format */

import { errorDiffusionQuality, VP8Config } from './vp8-config.js';
import { VP8EncProba } from './vp8-enc-proba.js';
import { VP8Quantizers } from './vp8-quant.js';
import { VP8Yuv } from './vp8-yuv.js';

/**
 * Frame-level state of the lossy encoder: everything that outlives one
 * macroblock.
 */
export class VP8EncState {
  public readonly config: VP8Config;
  public readonly pic: VP8Yuv;

  /**
   * Picture size in macroblocks.
   */
  public readonly mbW: number;
  public readonly mbH: number;

  /**
   * Stride of [preds], which carries one border column and row.
   */
  public readonly predsW: number;

  /**
   * Per-macroblock decisions.
   */
  public readonly mbType: Uint8Array;
  public readonly mbUvMode: Uint8Array;
  public readonly mbSkip: Uint8Array;
  public readonly mbSegment: Uint8Array;
  public readonly mbAlpha: Uint8Array;

  /**
   * Intra modes of every 4x4 block, with a border of `B_DC_PRED` around the
   * picture so that neighbour lookups need no bounds checks.
   */
  public readonly preds: Uint8Array;

  /**
   * The non-zero pattern of each macroblock column, plus one border entry.
   */
  public readonly nz: Int32Array;

  /**
   * Reconstructed samples along the bottom edge of the previous row.
   */
  public readonly yTop: Uint8Array;

  /**
   * The same for chroma, eight U samples then eight V per macroblock.
   */
  public readonly uvTop: Uint8Array;

  /**
   * Chroma DC quantization error carried into the macroblock row below.
   */
  public readonly topDerr: Int8Array | undefined;

  public readonly proba: VP8EncProba = new VP8EncProba();
  public readonly quant: VP8Quantizers;

  public alpha: number = 0;
  public uvAlpha: number = 0;
  public updateMap: boolean = false;
  public segmentSize: number = 0;
  public maxI4HeaderBits: number = 0;
  public mbHeaderLimit: number = 0;

  constructor(config: VP8Config, pic: VP8Yuv) {
    this.config = config;
    this.pic = pic;
    this.mbW = (pic.width + 15) >> 4;
    this.mbH = (pic.height + 15) >> 4;
    this.predsW = 4 * ((pic.width + 15) >> 4) + 1;

    const mbs = this.mbW * this.mbH;
    this.mbType = new Uint8Array(mbs);
    this.mbUvMode = new Uint8Array(mbs);
    this.mbSkip = new Uint8Array(mbs);
    this.mbSegment = new Uint8Array(mbs);
    this.mbAlpha = new Uint8Array(mbs);
    this.preds = new Uint8Array(this.predsW * (4 * this.mbH + 1));
    this.nz = new Int32Array(this.mbW + 1);
    this.yTop = new Uint8Array(this.mbW * 16);
    this.uvTop = new Uint8Array(this.mbW * 16);
    this.topDerr =
      config.quality <= errorDiffusionQuality
        ? new Int8Array(this.mbW * 4)
        : undefined;
    this.quant = new VP8Quantizers(config.segments);

    this.mbHeaderLimit = (256 * 510 * 8 * 1024) / mbs;
    this.maxI4HeaderBits = 256 * 16 * 16;

    this.resetBoundaryPredictions();
  }

  /**
   * Index of the picture's top-left 4x4 block within [preds].
   */
  public get predsOrigin(): number {
    return 1 + this.predsW;
  }

  /**
   * The bitstream profile, deduced from the filter settings.
   */
  public get profile(): number {
    return this.config.filterStrength > 0
      ? this.config.filterType === 1
        ? 0
        : 1
      : 2;
  }

  public get numSegments(): number {
    return this.quant.numSegments;
  }

  public resetBoundaryPredictions(): void {
    const top = this.predsOrigin - this.predsW;
    for (let i = -1; i < 4 * this.mbW; i++) {
      this.preds[top + i] = 0;
    }
    for (let i = 0; i < 4 * this.mbH; i++) {
      this.preds[this.predsOrigin - 1 + i * this.predsW] = 0;
    }
    this.nz[0] = 0;
  }
}
