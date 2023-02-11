/** @format */

import {
  decodeJpg,
  encodePng,
  Interpolation,
  Point,
  Transform,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { ImageTestUtils } from '../_utils/image-test-utils';

describe('Transform', () => {
  test('copyRectify', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'oblique.jpg'
    );
    const img = decodeJpg({
      data: input,
    });

    ImageTestUtils.dumpData(img!.toUint8Array(), 'dump.txt');

    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const i0 = Transform.copyRectify({
      image: img,
      topLeft: new Point(16, 32),
      topRight: new Point(79, 39),
      bottomLeft: new Point(16, 151),
      bottomRight: new Point(108, 141),
      interpolation: Interpolation.cubic,
    });

    ImageTestUtils.dumpData(i0!.toUint8Array(), 'dump.txt');

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyRectify.png',
      output
    );
  });
});
