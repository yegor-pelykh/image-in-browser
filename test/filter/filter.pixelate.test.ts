/** @format */

import { decodePng, encodePng, Filter, PixelateMode } from '../../src';
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

    Filter.pixelate({
      image: i0,
      size: 10,
    });

    let output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'pixelate_upperLeft.png',
      output
    );

    Filter.pixelate({
      image: i1,
      size: 10,
      mode: PixelateMode.average,
    });

    output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'pixelate_average.png',
      output
    );
  });
});
