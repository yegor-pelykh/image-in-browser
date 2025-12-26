/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Filter, NoiseType } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Filter module.
 */
describe('Filter', () => {
  /**
   * Test case for applying Gaussian noise to an image.
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
   * Test case for applying uniform noise to an image.
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
   * Test case for applying salt and pepper noise to an image.
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
   * Test case for applying Poisson noise to an image.
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
   * Test case for applying Rice noise to an image.
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
});
