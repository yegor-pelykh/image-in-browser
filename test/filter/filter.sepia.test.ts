/** @format */

import { decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Filter', () => {
  test('sepia', () => {
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

    Filter.sepia({
      image: i0,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'sepia.png',
      output
    );
  });
});
