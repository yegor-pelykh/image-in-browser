/** @format */

import { decodePng, encodePng, Filter, QuantizeMethod } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Filter', () => {
  test('pixelate', () => {
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

    const i1 = i0.clone();

    Filter.quantize({
      image: i0,
      numberOfColors: 32,
      method: QuantizeMethod.octree,
    });

    let output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'quantize_octree.png',
      output
    );

    Filter.quantize({
      image: i1,
      numberOfColors: 32,
    });

    output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'quantize_neural.png',
      output
    );
  });
});
