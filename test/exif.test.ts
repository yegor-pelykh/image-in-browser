/** @format */

import {
  ExifData,
  ExifLongValue,
  ExifRationalValue,
  ExifShortValue,
  ExifSLongValue,
  ExifSRationalValue,
  ExifSShortValue,
  InputBuffer,
  OutputBuffer,
  Rational,
} from '../src';

describe('Exif', () => {
  test('write/read', () => {
    const exif = new ExifData();
    exif.imageIfd.setValue(0, new ExifShortValue(124));
    exif.imageIfd.setValue(1, new ExifLongValue(52141));
    exif.imageIfd.setValue(2, new ExifSShortValue(-42));
    exif.imageIfd.setValue(3, new ExifSLongValue(-42141));
    exif.imageIfd.setValue(4, new ExifRationalValue(new Rational(72, 1)));
    exif.imageIfd.setValue(5, new ExifSRationalValue(new Rational(-50, 5)));
    const exifSubDir = exif.imageIfd.sub.get('exif');
    exifSubDir.setValue(0, new ExifShortValue(124));
    exifSubDir.setValue(1, new ExifLongValue(52141));
    exifSubDir.setValue(2, new ExifSShortValue(-42));
    exifSubDir.setValue(3, new ExifSLongValue(-42141));
    exifSubDir.setValue(4, new ExifRationalValue(new Rational(72, 1)));
    exifSubDir.setValue(5, new ExifSRationalValue(new Rational(-50, 5)));
    exif.thumbnailIfd.setValue(0, new ExifShortValue(124));
    exif.thumbnailIfd.setValue(1, new ExifLongValue(52141));
    exif.thumbnailIfd.setValue(2, new ExifSShortValue(-42));
    exif.thumbnailIfd.setValue(3, new ExifSLongValue(-42141));
    exif.thumbnailIfd.setValue(4, new ExifRationalValue(new Rational(72, 1)));
    exif.thumbnailIfd.setValue(5, new ExifSRationalValue(new Rational(-50, 5)));
    const out = new OutputBuffer();
    exif.write(out);
    const exif2 = new ExifData();
    const input = new InputBuffer({
      buffer: out.getBytes(),
    });
    exif2.read(input);

    expect(exif2.imageIfd.size).toBe(exif.imageIfd.size);
    const exifValues = Array.from(exif.imageIfd.values);
    const exif2Values = Array.from(exif2.imageIfd.values);
    for (let i = 0; i < exifValues.length; i++) {
      const isEqual = exifValues[i].equalsTo(exif2Values[i]);
      expect(isEqual).toBe(true);
    }

    expect(exif2.imageIfd.sub.size).toBe(1);

    const exif2FirstKey = exif2.imageIfd.sub.keys.next().value;
    expect(exif2FirstKey).toBe('exif');

    const exif2SubDir = exif2.imageIfd.sub.get('exif');

    const exifSubValues = Array.from(exifSubDir.values);
    const exif2SubValues = Array.from(exif2SubDir.values);
    for (let i = 0; i < exifSubValues.length; ++i) {
      const isEqual = exifSubValues[i].equalsTo(exif2SubValues[i]);
      expect(isEqual).toBe(true);
    }

    expect(exif2.thumbnailIfd.size).toBe(exif.thumbnailIfd.size);
    const exifThumbValues = Array.from(exif.thumbnailIfd.values);
    const exif2ThumbValues = Array.from(exif2.thumbnailIfd.values);
    for (let i = 0; i < exifThumbValues.length; ++i) {
      const isEqual = exifThumbValues[i].equalsTo(exif2ThumbValues[i]);
      expect(isEqual).toBe(true);
    }
  });
});
