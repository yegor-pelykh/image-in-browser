/** @format */

/**
 * The pattern to use for dithering
 */
export enum DitherKernel {
  /** No dithering */
  none,
  /** Floyd-Steinberg dithering */
  floydSteinberg,
  /** False Floyd-Steinberg dithering */
  falseFloydSteinberg,
  /** Jarvis-Judice-Ninke dithering */
  jarvisJudiceNinke,
  /** Stucki dithering */
  stucki,
  /** Burkes dithering */
  burkes,
  /** Atkinson dithering */
  atkinson,
  /** Bayer 2x2 ordered dithering */
  bayer2x2,
  /** Bayer 4x4 ordered dithering */
  bayer4x4,
  /** Bayer 8x8 ordered dithering */
  bayer8x8,
}

/**
 * Error-diffusion dither kernels keyed by DitherKernel.
 *
 * Each kernel is a list of taps, where every tap is `[weight, offsetX,
 * offsetY]`: the weight (fraction of the quantization error) is propagated
 * to the neighbor at `(x + offsetX, y + offsetY)`.
 *
 * Bayer kernels are not error-diffusion kernels and live in _bayerMatrices
 * instead.
 */
export const errorDiffusionKernels = new Map<DitherKernel, number[][]>([
  // Placeholder for [DitherKernel.none]; it is never actually used because
  // [ditherImage] short-circuits before reaching the diffusion loop.
  [
    DitherKernel.none,
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  ],
  // Floyd-Steinberg
  [
    DitherKernel.floydSteinberg,
    [
      [7 / 16, 1, 0],
      [3 / 16, -1, 1],
      [5 / 16, 0, 1],
      [1 / 16, 1, 1],
    ],
  ],
  // False Floyd-Steinberg (Heckbert)
  [
    DitherKernel.falseFloydSteinberg,
    [
      [3 / 8, 1, 0],
      [3 / 8, 0, 1],
      [2 / 8, 1, 1],
    ],
  ],
  // Jarvis-Judice-Ninke
  [
    DitherKernel.jarvisJudiceNinke,
    [
      [7 / 48, 1, 0],
      [5 / 48, 2, 0],
      [3 / 48, -2, 1],
      [5 / 48, -1, 1],
      [7 / 48, 0, 1],
      [5 / 48, 1, 1],
      [3 / 48, 2, 1],
      [1 / 48, -2, 2],
      [3 / 48, -1, 2],
      [5 / 48, 0, 2],
      [3 / 48, 1, 2],
      [1 / 48, 2, 2],
    ],
  ],
  // Stucki
  [
    DitherKernel.stucki,
    [
      [8 / 42, 1, 0],
      [4 / 42, 2, 0],
      [2 / 42, -2, 1],
      [4 / 42, -1, 1],
      [8 / 42, 0, 1],
      [4 / 42, 1, 1],
      [2 / 42, 2, 1],
      [1 / 42, -2, 2],
      [2 / 42, -1, 2],
      [4 / 42, 0, 2],
      [2 / 42, 1, 2],
      [1 / 42, 2, 2],
    ],
  ],
  // Burkes
  [
    DitherKernel.burkes,
    [
      [8 / 32, 1, 0],
      [4 / 32, 2, 0],
      [2 / 32, -2, 1],
      [4 / 32, -1, 1],
      [8 / 32, 0, 1],
      [4 / 32, 1, 1],
      [2 / 32, 2, 1],
    ],
  ],
  // Atkinson
  [
    DitherKernel.atkinson,
    [
      [1 / 8, 1, 0],
      [1 / 8, 2, 0],
      [1 / 8, -1, 1],
      [1 / 8, 0, 1],
      [1 / 8, 1, 1],
      [1 / 8, 0, 2],
    ],
  ],
]);

/**
 * Ordered (Bayer) dither matrices with values normalized to [0, 1).
 */
export const bayerMatrices = new Map<DitherKernel, number[][]>([
  [
    DitherKernel.bayer2x2,
    [
      [0 / 4, 2 / 4],
      [3 / 4, 1 / 4],
    ],
  ],
  [
    DitherKernel.bayer4x4,
    [
      [0 / 16, 8 / 16, 2 / 16, 10 / 16],
      [12 / 16, 4 / 16, 14 / 16, 6 / 16],
      [3 / 16, 11 / 16, 1 / 16, 9 / 16],
      [15 / 16, 7 / 16, 13 / 16, 5 / 16],
    ],
  ],
  [
    DitherKernel.bayer8x8,
    [
      [0 / 64, 32 / 64, 8 / 64, 40 / 64, 2 / 64, 34 / 64, 10 / 64, 42 / 64],
      [48 / 64, 16 / 64, 56 / 64, 24 / 64, 50 / 64, 18 / 64, 58 / 64, 26 / 64],
      [12 / 64, 44 / 64, 4 / 64, 36 / 64, 14 / 64, 46 / 64, 6 / 64, 38 / 64],
      [60 / 64, 28 / 64, 52 / 64, 20 / 64, 62 / 64, 30 / 64, 54 / 64, 22 / 64],
      [3 / 64, 35 / 64, 11 / 64, 43 / 64, 1 / 64, 33 / 64, 9 / 64, 41 / 64],
      [51 / 64, 19 / 64, 59 / 64, 27 / 64, 49 / 64, 17 / 64, 57 / 64, 25 / 64],
      [15 / 64, 47 / 64, 7 / 64, 39 / 64, 13 / 64, 45 / 64, 5 / 64, 37 / 64],
      [63 / 64, 31 / 64, 55 / 64, 23 / 64, 61 / 64, 29 / 64, 53 / 64, 21 / 64],
    ],
  ],
]);
