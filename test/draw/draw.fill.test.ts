/** @format */

import { ColorRgba8, Draw, encodePng, MemoryImage } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Draw', () => {
  test('fill', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    Draw.fill({
      image: i0,
      color: new ColorRgba8(120, 64, 85, 90),
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fill.png',
      output
    );
  });
});
