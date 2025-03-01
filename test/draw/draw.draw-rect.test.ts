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
   * Test case for the drawRect function.
   */
  test('drawRect', () => {
    // Create a new MemoryImage with specified width and height.
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    // Draw a red rectangle on the image.
    Draw.drawRect({
      image: i0,
      rect: new Rectangle(50, 50, 150, 150),
      color: new ColorRgb8(255, 0, 0),
    });

    // Draw a semi-transparent green rectangle with a specified thickness.
    Draw.drawRect({
      image: i0,
      rect: new Rectangle(100, 100, 200, 200),
      color: new ColorRgba8(0, 255, 0, 128),
      thickness: 14,
    });

    // Draw a blue rectangle with rounded corners.
    Draw.drawRect({
      image: i0,
      rect: new Rectangle(75, 75, 175, 175),
      color: new ColorRgb8(0, 0, 255),
      radius: 20,
    });

    // Encode the image to PNG format.
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG to a file.
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'drawRect.png',
      output
    );

    // Verify the color of the pixel at (50, 50).
    let p = i0.getPixel(50, 50);
    expect(p.r).toBe(255);
    expect(p.g).toBe(0);
    expect(p.b).toBe(0);

    // Verify the color of the pixel at (100, 100).
    p = i0.getPixel(100, 100);
    expect(p.r).toBe(0);
    expect(p.g).toBe(128);
    expect(p.b).toBe(0);
  });
});
