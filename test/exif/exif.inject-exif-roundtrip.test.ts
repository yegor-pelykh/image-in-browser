/** @format */

import * as fs from 'fs';
import { describe, expect, test } from 'vitest';
import { TestUtils } from '../_utils/test-utils';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { ExifData, IfdAsciiValue, JpegUtils } from '../../src';

/**
 * Test suite for realistic EXIF tag roundtrip in JPEG files.
 */
describe('injectExif realistic tags roundtrip', TestUtils.testOptions, () => {
  function getAsciiValue(v: unknown): string | undefined {
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'string') return v;
    if (v instanceof IfdAsciiValue) return v.toString();
    return v.toString();
  }

  const resFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.jpeg,
    '.jpg'
  );

  for (const file of resFiles) {
    test(`injectExif realistic tags roundtrip: ${file.nameExt}`, () => {
      const orig = fs.readFileSync(file.path);
      const exif = new JpegUtils().decodeExif(orig);
      const data = exif ?? new ExifData();

      const dt = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dtStr = `${dt.getFullYear()}:${pad(dt.getMonth() + 1)}:${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;

      const strValue = new IfdAsciiValue(dtStr);
      data.imageIfd.set('DateTime', strValue);
      data.exifIfd.set('DateTimeOriginal', strValue);
      data.exifIfd.set('DateTimeDigitized', strValue);

      const out = new JpegUtils().injectExif(data, orig);
      expect(out).toBeDefined();
      if (out === undefined) {
        return;
      }

      const decoded = new JpegUtils().decodeExif(out);
      expect(decoded).toBeDefined();
      if (decoded === undefined) {
        return;
      }

      expect(getAsciiValue(decoded.imageIfd.get('DateTime'))).toBe(dtStr);
      expect(getAsciiValue(decoded.exifIfd.get('DateTimeOriginal'))).toBe(
        dtStr
      );
      expect(getAsciiValue(decoded.exifIfd.get('DateTimeDigitized'))).toBe(
        dtStr
      );
    });
  }
});
