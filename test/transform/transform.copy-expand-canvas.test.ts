/** @format */

import { describe, expect, test } from 'vitest';
import {
  ArrayUtils,
  ColorRgb8,
  decodePng,
  encodePng,
  LibError,
  MemoryImage,
  Transform,
} from '../../src';
import { ExpandCanvasPosition } from '../../src/transform/expand-canvas-position';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Transform module.
 */
describe('Transform', () => {
  // Loop through each position in ExpandCanvasPosition enum
  for (const position of ArrayUtils.getNumEnumValues(ExpandCanvasPosition)) {
    const strPosition = ExpandCanvasPosition[position];

    /**
     * Test the copyExpandCanvas function with different positions.
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
   * Test the copyExpandCanvas function with default parameters.
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
   * Test the copyExpandCanvas function with padding.
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
   * Test the copyExpandCanvas function with new dimensions and padding.
   * Expect an error to be thrown.
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
    ).toThrowError(LibError);
  });

  /**
   * Test the copyExpandCanvas function with an alpha image.
   * The function should expand the canvas and fill the background with white color.
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
});
