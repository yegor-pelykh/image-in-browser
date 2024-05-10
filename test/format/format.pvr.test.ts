/** @format */

import { decodePvr, encodePng } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Format: PVR (PVRTC)', () => {
  test('globe', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.pvr,
      'globe.pvr'
    );
    const pvr = decodePvr({
      data: input,
    });

    expect(pvr).toBeDefined();
    if (pvr === undefined) {
      return;
    }

    const output = encodePng({
      image: pvr,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.pvr,
      'globe.png',
      output
    );
  });

  const resFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.pvr,
    '.pvr'
  );
  for (const file of resFiles) {
    test(`decode ${file.nameExt}`, () => {
      const input = TestUtils.readFromFilePath(file.path);
      const pvr = decodePvr({
        data: input,
      });

      expect(pvr).toBeDefined();
      if (pvr === undefined) {
        return;
      }

      const output = encodePng({
        image: pvr,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.pvr,
        `${file.name}.png`,
        output
      );
    });
  }
});
