/** @format */

import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Filter', () => {
  test('colorOffset', () => {
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

    Filter.colorOffset({
      image: i0,
      red: 50,
      green: 10,
      blue: 30,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'colorOffset.png',
      output
    );
  });
});
