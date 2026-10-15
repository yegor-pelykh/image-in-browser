/** @format */

/**
 * Larger than any real score, but small enough that scores can be added to it
 * without leaving the range an int is exact to on the web, where an int is a
 * double.
 *
 * Written out rather than as `1 << 50`: on the web `<<` is a 32-bit shift, so
 * that expression is zero there, and a zero ceiling makes every mode lose its
 * comparison and the search return no mode at all.
 */
export const maxCost = 1125899906842624;

/**
 * The decisions and coefficients of one candidate coding of a macroblock.
 */
export class VP8ModeScore {
  /**
   * Squared error, and spectral distortion.
   */
  public d: number = 0;
  public sd: number = 0;

  /**
   * Cost of the header bits (the mode itself) and of the coefficients.
   */
  public h: number = 0;
  public r: number = 0;

  /**
   * `(r + h) * lambda + distortion`.
   */
  public score: number = 0;

  /**
   * Quantized levels: the luma DC block, the sixteen luma blocks, and the
   * four U then four V blocks.
   */
  public readonly yDcLevels = new Int16Array(16);
  public readonly yAcLevels = new Int16Array(16 * 16);
  public readonly uvLevels = new Int16Array(8 * 16);

  public modeI16: number = 0;
  public readonly modesI4 = new Uint8Array(16);
  public modeUv: number = 0;

  /**
   * The three chroma DC errors this coding passes to its neighbors, U then
   * V. Only kept when error diffusion is on.
   */
  public readonly derr = new Int8Array(6);

  /**
   * One bit per block that has a non-zero coefficient, in the layout
   * {@link VP8EncIterator.nzToBytes} describes.
   */
  public nz: number = 0;

  public init(): void {
    this.d = 0;
    this.sd = 0;
    this.r = 0;
    this.h = 0;
    this.nz = 0;
    this.score = maxCost;
  }

  /**
   * Copies the score fields only, leaving the levels alone.
   */
  public copyScore(src: VP8ModeScore): void {
    this.d = src.d;
    this.sd = src.sd;
    this.r = src.r;
    this.h = src.h;
    this.nz = src.nz;
    this.score = src.score;
  }

  public addScore(src: VP8ModeScore): void {
    this.d += src.d;
    this.sd += src.sd;
    this.r += src.r;
    this.h += src.h;
    this.nz |= src.nz;
    this.score += src.score;
  }

  public copyFrom(src: VP8ModeScore): void {
    this.copyScore(src);
    this.yDcLevels.set(src.yDcLevels, 0);
    this.yAcLevels.set(src.yAcLevels, 0);
    this.uvLevels.set(src.uvLevels, 0);
    this.modeI16 = src.modeI16;
    this.modesI4.set(src.modesI4, 0);
    this.modeUv = src.modeUv;
  }
}
