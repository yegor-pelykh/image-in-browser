/** @format */

import { describe, expect, test } from 'vitest';
import { TestUtils } from '../_utils/test-utils';
import {
  ExifData,
  IfdAsciiValue,
  IfdLongValue,
  IfdRationalValue,
  IfdShortValue,
  IfdSLongValue,
  IfdSRationalValue,
  IfdSShortValue,
  IfdUndefinedValue,
  InputBuffer,
  OutputBuffer,
  Rational,
} from '../../src';

/**
 * Test suite for Exif data handling.
 */
describe('Exif', TestUtils.testOptions, () => {
  /**
   * Test case for writing and reading Exif data.
   */
  test('write/read', () => {
    const exif = new ExifData();

    // Set values in the image IFD (Image File Directory)
    exif.imageIfd.setValue(0, new IfdShortValue(124));
    exif.imageIfd.setValue(1, new IfdLongValue(52141));
    exif.imageIfd.setValue(2, new IfdSShortValue(-42));
    exif.imageIfd.setValue(3, new IfdSLongValue(-42141));
    exif.imageIfd.setValue(4, new IfdRationalValue(new Rational(72, 1)));
    exif.imageIfd.setValue(5, new IfdSRationalValue(new Rational(-50, 5)));
    exif.imageIfd.setValue(6, new IfdAsciiValue('this is an exif string'));
    exif.imageIfd.setValue(
      7,
      new IfdUndefinedValue(new Uint8Array([1, 2, 3, 4]))
    );

    // Set values in the sub IFD (Exif sub-directory)
    exif.imageIfd.sub.get('exif').setValue(0, new IfdShortValue(124));
    exif.imageIfd.sub.get('exif').setValue(1, new IfdLongValue(52141));
    exif.imageIfd.sub.get('exif').setValue(2, new IfdSShortValue(-42));
    exif.imageIfd.sub.get('exif').setValue(3, new IfdSLongValue(-42141));
    exif.imageIfd.sub
      .get('exif')
      .setValue(4, new IfdRationalValue(new Rational(72, 1)));
    exif.imageIfd.sub
      .get('exif')
      .setValue(5, new IfdSRationalValue(new Rational(-50, 5)));
    exif.imageIfd.sub
      .get('exif')
      .setValue(6, new IfdAsciiValue('this is an exif string'));
    exif.imageIfd.sub
      .get('exif')
      .setValue(7, new IfdUndefinedValue(new Uint8Array([5, 6, 7, 8])));

    // Set values in the thumbnail IFD
    exif.thumbnailIfd.setValue(0, new IfdShortValue(124));
    exif.thumbnailIfd.setValue(1, new IfdLongValue(52141));
    exif.thumbnailIfd.setValue(2, new IfdSShortValue(-42));
    exif.thumbnailIfd.setValue(3, new IfdSLongValue(-42141));
    exif.thumbnailIfd.setValue(4, new IfdRationalValue(new Rational(72, 1)));
    exif.thumbnailIfd.setValue(5, new IfdSRationalValue(new Rational(-50, 5)));
    exif.thumbnailIfd.setValue(6, new IfdAsciiValue('this is an exif string'));
    exif.thumbnailIfd.setValue(
      7,
      new IfdUndefinedValue(new Uint8Array([9, 10, 11, 12]))
    );

    // Write Exif data to an output buffer
    const out = new OutputBuffer();
    exif.write(out);

    // Read Exif data from the output buffer
    const exif1 = new ExifData();
    const input = new InputBuffer<Uint8Array>({ buffer: out.getBytes() });
    exif1.read(input);
    const exif2 = exif1.clone();

    // Validate the size of the image IFD
    expect(exif2.imageIfd.size).toBe(exif.imageIfd.size);

    // Validate the values in the image IFD
    for (let i = 0; i <= 7; ++i) {
      const val = exif.imageIfd.getValue(i);
      const val2 = exif2.imageIfd.getValue(i);
      const eq = val2!.equals(val!);
      if (i === 7) {
        expect(eq).toBeFalsy();
      } else {
        expect(eq).toBeTruthy();
      }
    }

    // Validate the size and keys of the sub IFD
    expect(exif2.imageIfd.sub.size).toBe(1);
    expect(exif2.imageIfd.sub.keys.next().value).toBe('exif');

    // Validate the values in the sub IFD
    const ifd = exif.imageIfd.sub.get('exif');
    const ifd2 = exif2.imageIfd.sub.get('exif');
    for (let i = 0; i < ifd2.size; ++i) {
      const val = ifd.getValue(i);
      const val2 = ifd2.getValue(i);
      const eq = val2!.equals(val!);
      if (i === 7) {
        expect(eq).toBeFalsy();
      } else {
        expect(eq).toBeTruthy();
      }
    }

    // Validate the size of the thumbnail IFD
    expect(exif2.thumbnailIfd.size).toBe(exif.thumbnailIfd.size);

    // Validate the values in the thumbnail IFD
    for (let i = 0; i < exif2.thumbnailIfd.size; ++i) {
      const val = exif.thumbnailIfd.getValue(i);
      const val2 = exif2.thumbnailIfd.getValue(i);
      const eq = val2!.equals(val!);
      if (i === 7) {
        expect(eq).toBeFalsy();
      } else {
        expect(eq).toBeTruthy();
      }
    }
  });
});
