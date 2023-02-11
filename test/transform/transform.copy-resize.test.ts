/** @format */

import { decodePng, encodePng, Interpolation, Transform } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Transform', () => {
  test('copyResize', () => {
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

    const i0 = Transform.copyResize({
      image: img,
      width: 64,
    });

    expect(i0.width).toBe(64);
    expect(i0.height).toBe(39);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize.png',
      output
    );
  });

  test('copyResize palette', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'test.png'
    );
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const i0 = Transform.copyResize({
      image: img,
      width: 64,
      interpolation: Interpolation.cubic,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_palette.png',
      output
    );
  });
});
