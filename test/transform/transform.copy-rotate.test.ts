/** @format */

import { ColorRgb8, decodePng, encodePng, Transform } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Transform', () => {
  test('copyRotate', () => {
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

    img.backgroundColor = new ColorRgb8(255, 255, 255);

    for (let i = 0; i < 360; i += 45) {
      const i0 = Transform.copyRotate({
        image: img,
        angle: i,
      });
      expect(i0.numChannels).toBe(img.numChannels);
      const output = encodePng({
        image: i0,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.transform,
        `copyRotate_${i}.png`,
        output
      );
    }
  });
});
