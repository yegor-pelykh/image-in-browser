/** @format */

/**
 * Options for creating a VP8Config.
 */
export interface VP8ConfigOptions {
  quality?: number;
  method?: number;
  segments?: number;
  snsStrength?: number;
  filterStrength?: number;
  filterSharpness?: number;
  filterType?: number;
  alphaQuality?: number;
  alphaFiltering?: number;
  alphaCompression?: boolean;
  exact?: boolean;
  emulateJpegSize?: boolean;
}

/**
 * Above this quality the chroma DC error is too small to be worth diffusing.
 */
export const errorDiffusionQuality = 98;

/**
 * How much work the encoder puts into finding a good coding of each block.
 *
 * The scale is libwebp's `-m`: 0 is fastest and 6 slowest, 4 is the default.
 * Rising values enable, in order, rate-distortion mode selection, a
 * coefficient trellis, and the trellis on every candidate rather than only on
 * the winner.
 */
export class VP8Config {
  /**
   * Between 0 and 100. Around 75 is visually close to a JPEG of the same
   * setting.
   */
  public readonly quality: number;

  /**
   * Effort, 0 to 6.
   */
  public readonly method: number;

  /**
   * How many quantizer segments to split the picture into, 1 to 4.
   */
  public readonly segments: number;

  /**
   * Spatial noise shaping, 0 to 100: how much bit budget moves from flat
   * areas to detailed ones.
   */
  public readonly snsStrength: number;

  /**
   * Deblocking filter strength, 0 to 100. This only reaches the decoder as a
   * header value; the encoder never runs the filter itself.
   */
  public readonly filterStrength: number;

  /**
   * Deblocking filter sharpness, 0 to 7.
   */
  public readonly filterSharpness: number;

  /**
   * 0 for the simple filter, 1 for the strong one, which also filters chroma.
   */
  public readonly filterType: number;

  /**
   * Quality of the alpha plane, 0 to 100.
   *
   * Below 100 the plane is reduced to fewer distinct levels before coding,
   * which shrinks it a great deal on soft-edged transparency at the cost of
   * banding in the edge itself. At 100 it is coded exactly.
   */
  public readonly alphaQuality: number;

  /**
   * Predictive filtering of the alpha plane: 0 none, 1 fast, 2 best.
   */
  public readonly alphaFiltering: number;

  /**
   * Whether to compress the alpha plane losslessly rather than store it raw.
   */
  public readonly alphaCompression: boolean;

  /**
   * Whether to keep the color hidden under fully transparent pixels.
   */
  public readonly exact: boolean;

  /**
   * Whether to aim for the file size libjpeg would produce at this quality.
   */
  public readonly emulateJpegSize: boolean;

  public static readonly rdOptNone = 0;
  public static readonly rdOptBasic = 1;
  public static readonly rdOptTrellis = 2;
  public static readonly rdOptTrellisAll = 3;

  public get rdOptLevel(): number {
    return this.method >= 6
      ? VP8Config.rdOptTrellisAll
      : this.method >= 5
        ? VP8Config.rdOptTrellis
        : this.method >= 3
          ? VP8Config.rdOptBasic
          : VP8Config.rdOptNone;
  }

  constructor(opt: VP8ConfigOptions = {}) {
    this.quality = opt.quality ?? 75;
    this.method = opt.method ?? 4;
    this.segments = opt.segments ?? 4;
    this.snsStrength = opt.snsStrength ?? 50;
    this.filterStrength = opt.filterStrength ?? 60;
    this.filterSharpness = opt.filterSharpness ?? 0;
    this.filterType = opt.filterType ?? 1;
    this.alphaQuality = opt.alphaQuality ?? 100;
    this.alphaFiltering = opt.alphaFiltering ?? 1;
    this.alphaCompression = opt.alphaCompression ?? true;
    this.exact = opt.exact ?? false;
    this.emulateJpegSize = opt.emulateJpegSize ?? false;
  }
}
