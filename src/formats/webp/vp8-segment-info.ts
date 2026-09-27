/** @format */

import { VP8Matrix } from './vp8-matrix.js';

/**
 * Everything one quantizer segment decides: its step sizes, the weights that
 * balance rate against distortion at those steps, and its filter strength.
 */
export class VP8SegmentInfo {
  public readonly y1: VP8Matrix = new VP8Matrix();
  public readonly y2: VP8Matrix = new VP8Matrix();
  public readonly uv: VP8Matrix = new VP8Matrix();

  /**
   * Quantization susceptibility, -127 to 127. Lower means less risk of
   * visible blurring, so the segment can take a coarser quantizer.
   */
  public alpha: number = 0;

  /**
   * Filter susceptibility, 0 to 255.
   */
  public beta: number = 0;

  /**
   * The segment's quantizer index.
   */
  public quant: number = 0;

  /**
   * In-loop filtering strength signalled for this segment.
   */
  public fstrength: number = 0;

  /**
   * Largest edge step seen, used to pick the filter strength.
   */
  public maxEdge: number = 0;

  /**
   * Distortion below which filtering statistics are not recorded.
   */
  public minDisto: number = 0;

  public lambdaI16: number = 0;
  public lambdaI4: number = 0;
  public lambdaUv: number = 0;
  public lambdaMode: number = 0;
  public lambdaTrellis: number = 0;
  public tlambda: number = 0;
  public lambdaTrellisI16: number = 0;
  public lambdaTrellisI4: number = 0;
  public lambdaTrellisUv: number = 0;

  /**
   * What choosing intra 4x4 has to beat, in score units.
   */
  public i4Penalty: number = 0;

  public equivalentTo(other: VP8SegmentInfo): boolean {
    return this.quant === other.quant && this.fstrength === other.fstrength;
  }

  public copyFrom(other: VP8SegmentInfo): void {
    this.alpha = other.alpha;
    this.beta = other.beta;
    this.quant = other.quant;
    this.fstrength = other.fstrength;
    this.maxEdge = other.maxEdge;
    this.minDisto = other.minDisto;
  }
}
