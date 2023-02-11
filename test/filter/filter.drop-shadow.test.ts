/** @format */

import {
  ColorRgb8,
  Draw,
  encodePng,
  Filter,
  MemoryImage,
  Rectangle,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Filter', () => {
  test('dropShadow', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
      numChannels: 4,
    });

    Draw.drawRect({
      image: i0,
      rect: Rectangle.fromXYWH(80, 100, 130, 100),
      color: new ColorRgb8(255, 0, 0),
      thickness: 3,
    });

    const id = Filter.dropShadow({
      image: i0,
      hShadow: -5,
      vShadow: 5,
      blur: 3,
    });

    const i1 = new MemoryImage({
      width: 256,
      height: 256,
    });
    i1.clear(new ColorRgb8(255, 255, 255));

    Draw.compositeImage({
      dst: i1,
      src: id,
    });

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'dropShadow.png',
      output
    );
  });
});
