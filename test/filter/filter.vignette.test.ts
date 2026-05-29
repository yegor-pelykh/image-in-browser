/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgb8, ColorRgba8, decodePng, encodePng, Filter } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { imagesAreEqual, solidImage } from '../_utils/test-helpers.js';

/**
 * vignette filter: darkens edges to create a vignette effect.
 */
describe('Filter', () => {
  /**
   * Tests vignette with defaults, white color, and custom RGBA start/end/amount, writing three output variants.
   */
  test('vignette', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );

    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const v1 = Filter.vignette({
      image: img.clone(),
    });
    let output = encodePng({
      image: v1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'vignette.png',
      output
    );

    const v2 = Filter.vignette({
      image: img.clone(),
      color: new ColorRgb8(255, 255, 255),
    });
    output = encodePng({
      image: v2,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'vignette_2.png',
      output
    );

    const v3 = Filter.vignette({
      image: img.clone().convert({
        numChannels: 4,
      }),
      color: new ColorRgba8(255, 255, 255, 0),
      start: 0.65,
      end: 0.95,
      amount: 0.5,
    });
    output = encodePng({
      image: v3,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.filter,
      'vignette_3.png',
      output
    );
  });

  /**
   * Preserves image dimensions after vignette filter.
   */
  test('vignette preserves dimensions', () => {
    const src = solidImage(64, 64, new ColorRgb8(200, 200, 200));
    Filter.vignette({ image: src });
    expect(src.width).toBe(64);
    expect(src.height).toBe(64);
  });

  /**
   * Corner pixels are darker than center pixels after vignette.
   */
  test('vignette darkens corners more than the centre', () => {
    const src = solidImage(100, 100, new ColorRgb8(200, 200, 200));
    Filter.vignette({ image: src });
    const centre = src.getPixel(50, 50);
    const corner = src.getPixel(0, 0);
    expect(corner.r).toBeLessThan(centre.r);
  });

  /**
   * Amount 0 produces no pixel change.
   */
  test('vignette with amount 0 leaves image unchanged', () => {
    const src = solidImage(32, 32, new ColorRgb8(100, 150, 200));
    const orig = src.clone();
    Filter.vignette({ image: src, amount: 0 });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });
});
