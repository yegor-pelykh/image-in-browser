/** @format */

import { describe, test } from 'vitest';
import {
  BlendMode,
  ColorRgba8,
  Draw,
  encodePng,
  MemoryImage,
  Point,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for Draw functionalities.
 */
describe('Draw', TestUtils.testOptions, () => {
  /**
   * Test case for the fillCircle function.
   */
  test('fillCircle', () => {
    // Create a new MemoryImage with specified width and height
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    // Draw a filled circle with antialiasing and a specific color
    Draw.fillCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 100,
      antialias: true,
      color: new ColorRgba8(255, 255, 0, 200),
    });

    // Draw another filled circle with a different color
    Draw.fillCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 50,
      color: new ColorRgba8(0, 255, 0, 255),
    });

    // Encode the image to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG to a file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillCircle.png',
      output
    );
  });

  /**
   * Test case for the fillCircle function with direct blend mode.
   */
  test('fillCircleWithBlendDirect', () => {
    // Create a new MemoryImage with specified width, height, and number of channels
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
      numChannels: 4,
    });

    // Draw a filled circle with antialiasing and a specific color
    Draw.fillCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 100,
      antialias: true,
      color: new ColorRgba8(255, 255, 0, 200),
    });

    // Draw another filled circle with a different color and direct blend mode
    Draw.fillCircle({
      image: i0,
      center: new Point(128, 128),
      radius: 50,
      color: new ColorRgba8(0, 255, 0, 0),
      blend: BlendMode.direct,
    });

    // Encode the image to PNG format
    const output = encodePng({
      image: i0,
    });

    // Write the output PNG to a file
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'fillCircleWithBlendDirect.png',
      output
    );
  });
});
