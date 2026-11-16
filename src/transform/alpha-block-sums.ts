/** @format */

/**
 * Sums one block of uint8 pixels with alpha in the last of 2 or 4 channels,
 * both plainly and weighted by alpha.
 */
export class AlphaBlockSums {
  /** The plain red sum. */
  public red = 0;
  /** The plain green sum. */
  public green = 0;
  /** The plain blue sum. */
  public blue = 0;
  /** The alpha sum. */
  public alpha = 0;

  /** The alpha-weighted red sum. */
  public weightedRed = 0;
  /** The alpha-weighted green sum. */
  public weightedGreen = 0;
  /** The alpha-weighted blue sum. */
  public weightedBlue = 0;
  /** Whether the block has more than one alpha value. */
  public hasMixedAlpha = false;

  /**
   * Sums one block of pixels.
   * @param {Uint8Array} bytes - The image bytes.
   * @param {number} start - The byte offset of the block start.
   * @param {number} colStep - The byte step between columns.
   * @param {number} rowStep - The byte step between rows.
   * @param {number} columns - The number of columns.
   * @param {number} rows - The number of rows.
   * @param {number} channels - The number of channels.
   */
  public sumBlock(
    bytes: Uint8Array,
    start: number,
    colStep: number,
    rowStep: number,
    columns: number,
    rows: number,
    channels: number
  ): void {
    const alphaChannel = channels - 1;
    const hasColor = channels === 4;
    let redSum = 0;
    let greenSum = 0;
    let blueSum = 0;
    let alphaSum = 0;

    let redWeighted = 0;
    let greenWeighted = 0;
    let blueWeighted = 0;
    let alphaOr = 0;
    let alphaAnd = 0xff;

    for (let row = 0, rowStart = start; row < rows; ++row) {
      let offset = rowStart;
      rowStart += rowStep;

      for (let i = 0; i < columns; ++i, offset += colStep) {
        const pixelAlpha = bytes[offset + alphaChannel];
        const pixelRed = bytes[offset];
        alphaSum += pixelAlpha;
        alphaOr |= pixelAlpha;
        alphaAnd &= pixelAlpha;
        redSum += pixelRed;
        redWeighted += pixelRed * pixelAlpha;

        if (hasColor) {
          const pixelGreen = bytes[offset + 1];
          const pixelBlue = bytes[offset + 2];
          greenSum += pixelGreen;
          blueSum += pixelBlue;
          greenWeighted += pixelGreen * pixelAlpha;
          blueWeighted += pixelBlue * pixelAlpha;
        }
      }
    }

    this.red = redSum;
    this.green = greenSum;
    this.blue = blueSum;
    this.alpha = alphaSum;

    this.weightedRed = redWeighted;
    this.weightedGreen = greenWeighted;
    this.weightedBlue = blueWeighted;
    this.hasMixedAlpha = alphaOr !== alphaAnd;
  }
}
