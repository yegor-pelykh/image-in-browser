/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  ColorRgba8,
  Draw,
  encodePng,
  MemoryImage,
  Rectangle,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Draw', () => {
  test('fillRect', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    Draw.fillRect({
      image: i0,
      rect: new Rectangle(50, 50, 150, 150),
      color: new ColorRgb8(255, 0, 0),
    });

    Draw.fillRect({
      image: i0,
      rect: new Rectangle(100, 100, 200, 200),
      color: new ColorRgba8(0, 255, 0, 128),
    });

    Draw.fillRect({
      image: i0,
      rect: new Rectangle(75, 75, 175, 175),
      radius: 20,
      color: new ColorRgba8(255, 255, 0, 128),
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillRect.png',
      output
    );

    let p = i0.getPixel(51, 51);
    expect(p.r).toBe(255);
    expect(p.g).toBe(0);
    expect(p.b).toBe(0);

    p = i0.getPixel(195, 195);
    expect(p.r).toBe(0);
    expect(p.g).toBe(128);
    expect(p.b).toBe(0);
  });
});
