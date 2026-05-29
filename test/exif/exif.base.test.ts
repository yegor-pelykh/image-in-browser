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
 * Exif data handling.
 */
describe('Exif', () => {
  /**
   * Round-trips write/read of all IFD value types across image, exif, and thumbnail IFDs.
   */
  test('write/read', () => {
    const exif = new ExifData();

    exif.imageIfd.set(0, new IfdShortValue(124));
    exif.imageIfd.set(1, new IfdLongValue(52141));
    exif.imageIfd.set(2, new IfdSShortValue(-42));
    exif.imageIfd.set(3, new IfdSLongValue(-42141));
    exif.imageIfd.set(4, new IfdRationalValue(new Rational(72, 1)));
    exif.imageIfd.set(5, new IfdSRationalValue(new Rational(-50, 5)));
    exif.imageIfd.set(6, new IfdAsciiValue('this is an exif string'));
    exif.imageIfd.set(7, new IfdUndefinedValue(new Uint8Array([1, 2, 3, 4])));

    exif.imageIfd.sub.get('exif').set(0, new IfdShortValue(124));
    exif.imageIfd.sub.get('exif').set(1, new IfdLongValue(52141));
    exif.imageIfd.sub.get('exif').set(2, new IfdSShortValue(-42));
    exif.imageIfd.sub.get('exif').set(3, new IfdSLongValue(-42141));
    exif.imageIfd.sub
      .get('exif')
      .set(4, new IfdRationalValue(new Rational(72, 1)));
    exif.imageIfd.sub
      .get('exif')
      .set(5, new IfdSRationalValue(new Rational(-50, 5)));
    exif.imageIfd.sub
      .get('exif')
      .set(6, new IfdAsciiValue('this is an exif string'));
    exif.imageIfd.sub
      .get('exif')
      .set(7, new IfdUndefinedValue(new Uint8Array([5, 6, 7, 8])));

    exif.thumbnailIfd.set(0, new IfdShortValue(124));
    exif.thumbnailIfd.set(1, new IfdLongValue(52141));
    exif.thumbnailIfd.set(2, new IfdSShortValue(-42));
    exif.thumbnailIfd.set(3, new IfdSLongValue(-42141));
    exif.thumbnailIfd.set(4, new IfdRationalValue(new Rational(72, 1)));
    exif.thumbnailIfd.set(5, new IfdSRationalValue(new Rational(-50, 5)));
    exif.thumbnailIfd.set(6, new IfdAsciiValue('this is an exif string'));
    exif.thumbnailIfd.set(
      7,
      new IfdUndefinedValue(new Uint8Array([9, 10, 11, 12]))
    );

    const out = new OutputBuffer();
    exif.write(out);

    const exif1 = new ExifData();
    const input = new InputBuffer<Uint8Array>({ buffer: out.getBytes() });
    exif1.read(input);
    const exif2 = exif1.clone();

    expect(exif2.imageIfd.size).toBe(exif.imageIfd.size);

    for (let i = 0; i <= 7; ++i) {
      const val = exif.imageIfd.get(i);
      const val2 = exif2.imageIfd.get(i);
      const eq = val2!.equals(val!);
      if (i === 7) {
        expect(eq).toBeFalsy();
      } else {
        expect(eq).toBeTruthy();
      }
    }

    expect(exif2.imageIfd.sub.size).toBe(1);
    expect(exif2.imageIfd.sub.keys.next().value).toBe('exif');

    const ifd = exif.imageIfd.sub.get('exif');
    const ifd2 = exif2.imageIfd.sub.get('exif');
    for (let i = 0; i < ifd2.size; ++i) {
      const val = ifd.get(i);
      const val2 = ifd2.get(i);
      const eq = val2!.equals(val!);
      if (i === 7) {
        expect(eq).toBeFalsy();
      } else {
        expect(eq).toBeTruthy();
      }
    }

    expect(exif2.thumbnailIfd.size).toBe(exif.thumbnailIfd.size);

    for (let i = 0; i < exif2.thumbnailIfd.size; ++i) {
      const val = exif.thumbnailIfd.get(i);
      const val2 = exif2.thumbnailIfd.get(i);
      const eq = val2!.equals(val!);
      if (i === 7) {
        expect(eq).toBeFalsy();
      } else {
        expect(eq).toBeTruthy();
      }
    }
  });

  /**
   * Does not throw when reading a corrupt EXIF IFD buffer.
   */
  test('read does not crash on a corrupt IFD', () => {
    const corrupt = new Uint8Array([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0xff, 0xff,
    ]);
    expect(() => {
      const exif = new ExifData();
      exif.read(new InputBuffer({ buffer: corrupt }));
    }).not.toThrow();
  });
});
