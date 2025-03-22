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

/**
 * Test suite for the Draw module.
 */
describe('Draw', TestUtils.testOptions, () => {
  /**
   * Test case for the fillRect function.
   */
  test('fillRect', () => {
    // Create a new MemoryImage with specified width and height.
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
      numChannels: 4,
    });

    // Draw a filled rectangle with solid red color.
    Draw.fillRect({
      image: i0,
      rect: new Rectangle(50, 50, 150, 150),
      color: new ColorRgb8(255, 0, 0),
    });

    // Draw a filled rectangle with semi-transparent green color.
    Draw.fillRect({
      image: i0,
      rect: new Rectangle(100, 100, 200, 200),
      color: new ColorRgba8(0, 255, 0, 128),
    });

    // Draw a filled rectangle with rounded corners and semi-transparent yellow color.
    Draw.fillRect({
      image: i0,
      rect: new Rectangle(75, 75, 175, 175),
      radius: 20,
      color: new ColorRgba8(255, 255, 0, 128),
    });

    // Encode the image to PNG format.
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG file to the specified location.
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillRect.png',
      output
    );

    // Verify the color of the pixel at (51, 51) is red.
    let p = i0.getPixel(51, 51);
    expect(p.r).toBe(255);
    expect(p.g).toBe(0);
    expect(p.b).toBe(0);
    expect(p.a).toBe(255);

    // Verify the color of the pixel at (195, 195) is a blend of green and the background.
    p = i0.getPixel(195, 195);
    expect(p.r).toBe(0);
    expect(p.g).toBe(128);
    expect(p.b).toBe(0);
    expect(p.a).toBe(128);
  });
});
