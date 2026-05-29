/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter, NoiseType } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { checkerImage, imageVariance } from '../_utils/test-helpers.js';

/**
 * Filter module.
 */
describe('Filter', () => {
  /**
   * Applying Gaussian noise to an image.
   */
  test('noise gaussian', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    Filter.noise({
      image: i0,
      sigma: 10,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'noise_gaussian.png',
      output
    );
  });

  /**
   * Applying uniform noise to an image.
   */
  test('noise uniform', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    Filter.noise({
      image: i0,
      sigma: 10,
      type: NoiseType.uniform,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'noise_uniform.png',
      output
    );
  });

  /**
   * Applying salt and pepper noise to an image.
   */
  test('noise saltAndPepper', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    Filter.noise({
      image: i0,
      sigma: 10,
      type: NoiseType.saltAndPepper,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'noise_saltAndPepper.png',
      output
    );
  });

  /**
   * Applying Poisson noise to an image.
   */
  test('noise poisson', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    Filter.noise({
      image: i0,
      sigma: 10,
      type: NoiseType.poisson,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'noise_poisson.png',
      output
    );
  });

  /**
   * Applying Rice noise to an image.
   */
  test('noise rice', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    Filter.noise({
      image: i0,
      sigma: 10,
      type: NoiseType.rice,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'noise_rice.png',
      output
    );
  });

  /**
   * Preserves image dimensions after noise filter.
   */
  test('noise preserves dimensions', () => {
    const src = checkerImage(64, 48);
    Filter.noise({ image: src, type: NoiseType.gaussian, sigma: 10 });
    expect(src.width).toBe(64);
    expect(src.height).toBe(48);
  });

  /**
   * Gaussian noise increases pixel variance of a checker image.
   */
  test('gaussian noise increases variance of a checker image', () => {
    const src = checkerImage(32, 32, 4);
    const varianceBefore = imageVariance(src);
    Filter.noise({ image: src, type: NoiseType.gaussian, sigma: 30 });
    expect(imageVariance(src)).not.toBe(varianceBefore);
  });
});
