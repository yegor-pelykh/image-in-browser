/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, DitherKernel, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Filter', () => {
  test('ditherImage', () => {
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

    let id = Filter.ditherImage({
      image: i0,
      kernel: DitherKernel.atkinson,
    });

    let output = encodePng({
      image: id,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dither_atkinson.png',
      output
    );

    id = Filter.ditherImage({
      image: i0,
      kernel: DitherKernel.floydSteinberg,
    });

    output = encodePng({
      image: id,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dither_floydSteinberg.png',
      output
    );

    id = Filter.ditherImage({
      image: i0,
      kernel: DitherKernel.falseFloydSteinberg,
    });

    output = encodePng({
      image: id,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dither_falseFloydSteinberg.png',
      output
    );

    id = Filter.ditherImage({
      image: i0,
      kernel: DitherKernel.stucki,
    });

    output = encodePng({
      image: id,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dither_stucki.png',
      output
    );

    id = Filter.ditherImage({
      image: i0,
      kernel: DitherKernel.none,
    });

    output = encodePng({
      image: id,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dither_none.png',
      output
    );
  });
});
