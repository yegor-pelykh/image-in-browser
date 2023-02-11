/** @format */

import { decodePng, encodePng, Rectangle, Transform } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Transform', () => {
  test('copyCrop', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const i0 = decodePng({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    const i0_1 = Transform.copyCrop({
      image: i0,
      rect: Rectangle.fromXYWH(50, 50, 100, 100),
    });

    expect(i0_1.width).toBe(100);
    expect(i0_1.height).toBe(100);
    expect(i0_1.format).toBe(i0.format);

    let output = encodePng({
      image: i0_1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyCrop.png',
      output
    );

    const i1 = i0.convert({
      numChannels: 4,
    });

    const i0_2 = Transform.copyCrop({
      image: i1,
      rect: Rectangle.fromXYWH(50, 50, 100, 100),
      radius: 20,
    });

    expect(i0_2.width).toBe(100);
    expect(i0_2.height).toBe(100);
    expect(i0_2.format).toBe(i0.format);

    output = encodePng({
      image: i0_2,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyCrop_rounded.png',
      output
    );
  });
});
