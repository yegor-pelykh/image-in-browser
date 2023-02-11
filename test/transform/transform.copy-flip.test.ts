/** @format */

import { decodePng, encodePng, FlipDirection, Transform } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Transform', () => {
  test('copyFlip', () => {
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

    const ih = Transform.copyFlip({
      image: img,
      direction: FlipDirection.horizontal,
    });

    expect(ih.numChannels).toBe(img.numChannels);

    let output = encodePng({
      image: ih,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyFlip_h.png',
      output
    );

    const iv = Transform.copyFlip({
      image: img,
      direction: FlipDirection.vertical,
    });

    expect(iv.numChannels).toBe(img.numChannels);

    output = encodePng({
      image: iv,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyFlip_v.png',
      output
    );

    const ib = Transform.copyFlip({
      image: img,
      direction: FlipDirection.both,
    });

    expect(ib.numChannels).toBe(img.numChannels);

    output = encodePng({
      image: ib,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyFlip_b.png',
      output
    );
  });
});
