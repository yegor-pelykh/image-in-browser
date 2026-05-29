/** @format */

import { describe, expect, test } from 'vitest';
import { decodePvr, encodePng, PvrDecoder } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * PVR (PVRTC) format.
 */
describe('Format: PVR (PVRTC)', () => {
  /**
   * Decoding and encoding a specific PVR file (globe.pvr).
   */
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

  /**
   * List all PVR files in the input folder and create a test case for each file.
   */
  const resFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.pvr,
    '.pvr'
  );
  for (const file of resFiles) {
    /**
     * Decodes PVR, encodes to PNG, verifies deterministic re-decode yields same dimensions.
     */
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

      const pvr2 = new PvrDecoder();
      const img2 = pvr2.decode({ bytes: input });
      expect(img2).toBeDefined();
      if (img2 !== undefined) {
        expect(img2.width).toBe(pvr.width);
        expect(img2.height).toBe(pvr.height);
      }
    });
  }
});
