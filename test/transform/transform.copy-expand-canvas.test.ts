/** @format */

import { describe, expect, test } from 'vitest';
import {
  ArrayUtils,
  ColorRgb8,
  decodePng,
  encodePng,
  ExifData,
  LibError,
  MemoryImage,
  Transform,
} from '../../src';
import { ExpandCanvasPosition } from '../../src/transform/expand-canvas-position';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import {
  imagesAreEqual,
  quadrantImage,
  solidImage,
} from '../_utils/test-helpers.js';

/**
 * Transform copyExpandCanvas operations.
 */
describe('Transform', () => {
  for (const position of ArrayUtils.getNumEnumValues(ExpandCanvasPosition)) {
    const strPosition = ExpandCanvasPosition[position];

    /**
     * Expands canvas and places image at the specified position alignment.
     */
    test(`copyExpandCanvas - ${strPosition}`, () => {
      const input = TestUtils.readFromFile(
        TestFolder.input,
        TestSection.png,
        'buck_24.png'
      );
      const image = decodePng({
        data: input,
      });
      expect(image).toBeDefined();
      if (image === undefined) {
        return;
      }

      const expandedCanvas = Transform.copyExpandCanvas({
        image: image,
        newWidth: image.width * 2,
        newHeight: image.height * 2,
        position: position,
        backgroundColor: new ColorRgb8(255, 255, 255),
      });

      const output = encodePng({
        image: expandedCanvas,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.transform,
        `copyExpandCanvas_${strPosition}.png`,
        output
      );
    });
  }

  /**
   * Expands canvas to double size with default center alignment.
   */
  test('copyExpandCanvas - default parameters', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const image = decodePng({
      data: input,
    });
    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    const expandedCanvas = Transform.copyExpandCanvas({
      image: image,
      newWidth: image.width * 2,
      newHeight: image.height * 2,
    });

    const output = encodePng({
      image: expandedCanvas,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyExpandCanvas_default.png',
      output
    );
  });

  /**
   * Test the copyExpandCanvas function with a specified toImage parameter.
   */
  test('copyExpandCanvas - with toImage', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const image = decodePng({
      data: input,
    });
    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    const toImage = new MemoryImage({
      width: image.width * 2,
      height: image.height * 2,
    });

    const expandedCanvas = Transform.copyExpandCanvas({
      image: image,
      newWidth: image.width * 2,
      newHeight: image.height * 2,
      toImage: toImage,
    });

    const output = encodePng({
      image: expandedCanvas,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyExpandCanvas_toImage.png',
      output
    );
  });

  /**
   * Expands canvas by 50px padding on all sides.
   */
  test('copyExpandCanvas - with padding', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const image = decodePng({
      data: input,
    });
    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    const expandedCanvas = Transform.copyExpandCanvas({
      image: image,
      padding: 50,
    });

    const output = encodePng({
      image: expandedCanvas,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyExpandCanvas_padding.png',
      output
    );
  });

  /**
   * Throws error when both new dimensions and padding are specified.
   */
  test('copyExpandCanvas - with new dimensions and padding', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const image = decodePng({
      data: input,
    });
    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    expect(() =>
      Transform.copyExpandCanvas({
        image: image,
        newWidth: image.width * 2,
        newHeight: image.height * 2,
        padding: 50,
      })
    ).toThrow(LibError);
  });

  /**
   * Expands canvas of an alpha PNG with a white background fill.
   */
  test('copyExpandCanvas - alpha image', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'alpha.png'
    );
    const image = decodePng({
      data: input,
    });
    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    const expandedCanvas = Transform.copyExpandCanvas({
      image: image,
      newWidth: image.width * 2,
      newHeight: image.height * 2,
      backgroundColor: new ColorRgb8(255, 255, 255),
    });

    const output = encodePng({
      image: expandedCanvas,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyExpandCanvas_alpha.png',
      output
    );
  });

  /**
   * EXIF metadata is preserved after expanding the canvas.
   */
  test('EXIF metadata preserved after expand canvas', () => {
    const img = new MemoryImage({ width: 16, height: 16 });
    const exif = new ExifData();
    exif.imageIfd.orientation = 6;
    img.exifData = exif;
    const expanded = Transform.copyExpandCanvas({
      image: img,
      padding: 8,
    });
    expect(expanded.exifData).toBeDefined();
    expect(expanded.exifData?.imageIfd.orientation).toBe(6);
  });

  /**
   * Expanded canvas result dimensions exceed the source.
   */
  test('result dimensions are larger than the source', () => {
    const src = solidImage(20, 20, new ColorRgb8(100, 150, 200));
    const result = Transform.copyExpandCanvas({
      image: src,
      newWidth: 40,
      newHeight: 50,
    });
    expect(result.width).toBe(40);
    expect(result.height).toBe(50);
  });

  /**
   * Padding mode produces the correctly computed dimensions.
   */
  test('padding mode produces correct dimensions', () => {
    const src = solidImage(10, 10, new ColorRgb8(255, 0, 0));
    const pad = 5;
    const result = Transform.copyExpandCanvas({
      image: src,
      padding: pad,
    });
    expect(result.width).toBe(10 + pad * 2);
    expect(result.height).toBe(10 + pad * 2);
  });

  /**
   * CopyExpandCanvas does not mutate the source image.
   */
  test('copyExpandCanvas does not mutate source', () => {
    const src = solidImage(8, 8, new ColorRgb8(200, 100, 50));
    const orig = src.clone();
    Transform.copyExpandCanvas({ image: src, padding: 4 });
    expect(imagesAreEqual(src, orig)).toBe(true);
  });
});
