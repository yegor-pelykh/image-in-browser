/** @format */

import { describe, expect, test } from 'vitest';
import { decodePvr, encodePng } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for PVR (PVRTC) format.
 */
describe('Format: PVR (PVRTC)', () => {
  /**
   * Test case for decoding and encoding a specific PVR file (globe.pvr).
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
     * Test case for decoding and encoding each PVR file found in the input folder.
     * @param {Object} file - The file object containing file details.
     * @param {string} file.nameExt - The name of the file with extension.
     * @param {string} file.path - The full path to the file.
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
    });
  }
});
