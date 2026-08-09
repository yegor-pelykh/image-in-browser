/** @format */

/**
 * The order in which pixels are visited by the error-diffusion kernels.
 */
export enum DitherScanOrder {
  /**
   * Standard raster scan: every row is traversed left to right, top to
   * bottom.
   */
  raster,

  /**
   * Boustrophedon (snake) scan: the horizontal direction is reversed on
   * every other row, which reduces directional artifacts.
   */
  serpentine,

  /**
   * Diagonal zigzag scan (the JPEG-style ordering): pixels are visited along
   * anti-diagonals (`x + y == d`), alternating the direction of each
   * diagonal. It spreads the error along both axes, which softens the
   * horizontal worm patterns typical of raster scanning.
   */
  zigzag,

  /**
   * Hilbert space-filling curve scan: pixels are visited following the
   * fractal Hilbert curve order, which maximizes spatial locality. Every
   * pair of consecutive pixels is adjacent on the grid. This gives the best
   * reduction of directional artifacts among deterministic scan orders and
   * closely approximates random-walk error diffusion without sacrificing
   * determinism.
   */
  hilbert,
}
