/** @format */

/**
 * The pattern to use for dithering
 */
export enum DitherKernel {
  none,
  falseFloydSteinberg,
  floydSteinberg,
  stucki,
  atkinson,
}

export const DitherKernels = [
  [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  // FalseFloydSteinberg
  [
    [3 / 8, 1, 0],
    [3 / 8, 0, 1],
    [2 / 8, 1, 1],
  ],
  // FloydSteinberg
  [
    [7 / 16, 1, 0],
    [3 / 16, -1, 1],
    [5 / 16, 0, 1],
    [1 / 16, 1, 1],
  ],
  // Stucki
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
  //Atkinson:
  [
    [1 / 8, 1, 0],
    [1 / 8, 2, 0],
    [1 / 8, -1, 1],
    [1 / 8, 0, 1],
    [1 / 8, 1, 1],
    [1 / 8, 0, 2],
  ],
];
