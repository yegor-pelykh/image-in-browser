/** @format */

import { ColorRgb8, Draw, encodePng, MemoryImage, Point } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Draw', () => {
  test('fillFlood', () => {
    const i0 = new MemoryImage({
      width: 100,
      height: 100,
    });

    Draw.drawCircle({
      image: i0,
      center: new Point(50, 50),
      radius: 49,
      color: new ColorRgb8(255, 0, 0),
    });

    Draw.fillFlood({
      image: i0,
      start: new Point(50, 50),
      color: new ColorRgb8(0, 255, 0),
      threshold: 1,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillFlood.png',
      output
    );
  });
});
