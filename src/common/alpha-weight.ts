/** @format */

/**
 * Returns the bilinear color of four taps weighted by alpha, since a plain
 * blend mixes RGB of transparent taps into visible ones. The result is an
 * offset from the reference tap, which keeps it exact when only one tap has
 * weight.
 * @param {number} center - The center tap color.
 * @param {number} right - The right tap color.
 * @param {number} below - The below tap color.
 * @param {number} diagonal - The diagonal tap color.
 * @param {number} centerAlpha - The center tap alpha.
 * @param {number} rightAlpha - The right tap alpha.
 * @param {number} belowAlpha - The below tap alpha.
 * @param {number} diagonalAlpha - The diagonal tap alpha.
 * @param {number} fractionX - The horizontal fraction.
 * @param {number} fractionY - The vertical fraction.
 * @param {number} alpha - The blended alpha.
 * @returns {number} The alpha-weighted color.
 */
export function alphaWeightedLinear(
  center: number,
  right: number,
  below: number,
  diagonal: number,
  centerAlpha: number,
  rightAlpha: number,
  belowAlpha: number,
  diagonalAlpha: number,
  fractionX: number,
  fractionY: number,
  alpha: number
): number {
  const cross = fractionX * fractionY;
  const centerWeight = (1 - fractionX - fractionY + cross) * centerAlpha;
  const rightWeight = (fractionX - cross) * rightAlpha;
  const belowWeight = (fractionY - cross) * belowAlpha;
  const diagonalWeight = cross * diagonalAlpha;

  let reference = center;
  let largest = centerWeight;
  if (rightWeight > largest) {
    reference = right;
    largest = rightWeight;
  }
  if (belowWeight > largest) {
    reference = below;
    largest = belowWeight;
  }
  if (diagonalWeight > largest) {
    reference = diagonal;
  }

  const offset =
    centerWeight * (center - reference) +
    rightWeight * (right - reference) +
    belowWeight * (below - reference) +
    diagonalWeight * (diagonal - reference);

  return reference + offset / alpha;
}

/**
 * Replaces the alpha of 16 taps in row order in **weights** with the bicubic
 * weight times alpha, and returns the tap with the largest weight, which is
 * the reference in {@link alphaWeightedCubic}.
 * @param {Float64Array} weights - The tap alphas, replaced by their weights.
 * @param {number} fractionX - The horizontal fraction.
 * @param {number} fractionY - The vertical fraction.
 * @returns {number} The reference tap index.
 */
export function cubicAlphaWeights(
  weights: Float64Array,
  fractionX: number,
  fractionY: number
): number {
  const squareX = fractionX * fractionX;
  const cubeX = squareX * fractionX;
  const squareY = fractionY * fractionY;
  const cubeY = squareY * fractionY;
  const previousX = 0.5 * (-fractionX + 2 * squareX - cubeX);
  const currentX = 1 + 0.5 * (-5 * squareX + 3 * cubeX);
  const nextX = 0.5 * (fractionX + 4 * squareX - 3 * cubeX);
  const afterX = 0.5 * (-squareX + cubeX);

  for (let row = 0; row < 4; ++row) {
    const rowWeight =
      row === 0
        ? 0.5 * (-fractionY + 2 * squareY - cubeY)
        : row === 1
          ? 1 + 0.5 * (-5 * squareY + 3 * cubeY)
          : row === 2
            ? 0.5 * (fractionY + 4 * squareY - 3 * cubeY)
            : 0.5 * (-squareY + cubeY);
    const first = row * 4;

    weights[first] *= rowWeight * previousX;
    weights[first + 1] *= rowWeight * currentX;
    weights[first + 2] *= rowWeight * nextX;
    weights[first + 3] *= rowWeight * afterX;
  }

  let referenceTap = 0;
  for (let i = 1; i < 16; ++i) {
    if (weights[i] > weights[referenceTap]) {
      referenceTap = i;
    }
  }

  return referenceTap;
}

/**
 * Returns the bicubic color of 16 taps weighted by alpha as
 * {@link alphaWeightedLinear} does, with **weights** and **referenceTap**
 * from {@link cubicAlphaWeights}.
 * @param {Float64Array} colors - The tap colors.
 * @param {Float64Array} weights - The tap weights.
 * @param {number} referenceTap - The reference tap index.
 * @param {number} alpha - The blended alpha.
 * @returns {number} The alpha-weighted color.
 */
export function alphaWeightedCubic(
  colors: Float64Array,
  weights: Float64Array,
  referenceTap: number,
  alpha: number
): number {
  const reference = colors[referenceTap];
  let offset = 0;
  for (let i = 0; i < 16; ++i) {
    offset += weights[i] * (colors[i] - reference);
  }

  return reference + offset / alpha;
}
