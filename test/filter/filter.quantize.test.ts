/** @format */

import {
  decodePng,
  DitherKernel,
  encodePng,
  Filter,
  QuantizeMethod,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Filter', () => {
  test('quantize', () => {
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

    const q0 = Filter.quantize({
      image: i0,
      numberOfColors: 32,
      method: QuantizeMethod.octree,
    });

    let output = encodePng({
      image: q0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'quantize_octree.png',
      output
    );

    const i0_ = decodePng({
      data: input,
    })!;
    const q0_ = Filter.quantize({
      image: i0_,
      numberOfColors: 32,
      method: QuantizeMethod.octree,
      dither: DitherKernel.floydSteinberg,
    });
    output = encodePng({
      image: q0_,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'quantize_octree_dither.png',
      output
    );

    const i1 = decodePng({
      data: input,
    })!;
    const q1 = Filter.quantize({
      image: i1,
      numberOfColors: 32,
    });
    output = encodePng({
      image: q1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'quantize_neural.png',
      output
    );

    const i1_ = decodePng({
      data: input,
    })!;
    const q1_ = Filter.quantize({
      image: i1_,
      numberOfColors: 32,
      dither: DitherKernel.floydSteinberg,
    });
    output = encodePng({
      image: q1_,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'quantize_neural_dither.png',
      output
    );
  });
});
