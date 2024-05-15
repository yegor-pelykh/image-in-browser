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

describe('Transform', () => {
  for (const position of ArrayUtils.getNumEnumValues(ExpandCanvasPosition)) {
    const strPosition = ExpandCanvasPosition[position];
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
});
