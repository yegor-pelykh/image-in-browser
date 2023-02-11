/** @format */

import { ColorRgb8, Draw, encodePng, MemoryImage, Point } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Draw', () => {
  test('fillPolygon', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    const vertices = [
      new Point(50, 50),
      new Point(200, 20),
      new Point(120, 70),
      new Point(30, 150),
    ];

    Draw.fillPolygon({
      image: i0,
      vertices: vertices,
      color: new ColorRgb8(176, 0, 0),
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillPolygon.png',
      output
    );
  });
});
