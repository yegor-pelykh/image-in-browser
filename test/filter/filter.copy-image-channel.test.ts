/** @format */

import { describe, expect, test } from 'vitest';
import {
  Channel,
  ColorRgb8,
  decodePng,
  Draw,
  encodePng,
  Filter,
  MemoryImage,
  Point,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Filter', () => {
  test('copyImageChannels', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    let i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    i0 = i0.convert({
      numChannels: 4,
    });

    const maskImage = new MemoryImage({
      width: 256,
      height: 256,
    });
    Draw.fillCircle({
      image: maskImage,
      center: new Point(128, 128),
      radius: 128,
      color: new ColorRgb8(255, 255, 255),
    });

    Filter.copyImageChannels({
      image: i0,
      from: maskImage,
      scaled: true,
      alpha: Channel.luminance,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'copyImageChannels.png',
      output
    );
  });
});
