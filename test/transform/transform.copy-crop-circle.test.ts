/** @format */

import { decodePng, encodePng, Transform } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Transform', () => {
  test('copyCropCircle', () => {
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

    const i0 = image.convert({
      numChannels: 4,
    });

    const i0_1 = Transform.copyCropCircle({
      image: i0,
    });

    expect(i0_1.width).toBe(186);
    expect(i0_1.height).toBe(186);
    expect(i0_1.format).toBe(i0.format);

    const output = encodePng({
      image: i0_1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyCropCircle.png',
      output
    );
  });
});
