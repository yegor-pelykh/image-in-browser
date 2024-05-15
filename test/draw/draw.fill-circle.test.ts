/** @format */

import { describe, test } from 'vitest';
import { ColorRgba8, Draw, encodePng, MemoryImage, Point } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Draw', () => {
  test('fillCircle', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    Draw.fillCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 100,
      antialias: true,
      color: new ColorRgba8(255, 255, 0, 200),
    });

    Draw.fillCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 50,
      color: new ColorRgba8(0, 255, 0, 255),
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillCircle.png',
      output
    );
  });
});
