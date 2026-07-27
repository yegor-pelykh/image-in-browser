/** @format */

import { describe, expect, test } from 'vitest';
import {
  ExifData,
  IfdAsciiValue,
  IfdLongValue,
  InputBuffer,
  JpegUtils,
  OutputBuffer,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Returns the set of JPEG marker bytes (e.g. 0xe0 for APP0) present in the
 * segment list of [jpeg], scanning from the SOI up to the start of scan data.
 */
function segmentMarkers(jpeg: Uint8Array): Set<number> {
  const markers = new Set<number>();
  let i = 2;
  while (i + 4 <= jpeg.length) {
    if (jpeg[i] !== 0xff) {
      break;
    }
    const marker = jpeg[i + 1];
    if (marker === 0xda || marker === 0xd9) {
      break;
    }
    markers.add(marker);
    const len = (jpeg[i + 2] << 8) | jpeg[i + 3];
    i += 2 + len;
  }
  return markers;
}

const files = ['icc_profile_Upper_Left.jpg', 'icc_profile_data.jpg'];

for (const name of files) {
  describe(`injectExif preserves APP0 and thumbnail: ${name}`, () => {
    const orig = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      name
    );

    test('thumbnail payload is captured on read', () => {
      const exif = new JpegUtils().decodeExif(orig);
      expect(exif).toBeDefined();

      const thumb = exif!.thumbnailData;
      expect(thumb, 'IFD1 thumbnail should be captured').toBeDefined();
      expect(thumb!.length).toBeGreaterThan(0);
      // An embedded EXIF thumbnail is itself a JPEG (starts with SOI).
      expect(thumb![0]).toBe(0xff);
      expect(thumb![1]).toBe(0xd8);
    });

    test('round-trip keeps the JFIF APP0 segment and the thumbnail', () => {
      const exif = new JpegUtils().decodeExif(orig);
      expect(exif).toBeDefined();

      // Sanity: the source really does have the segments under test.
      expect(segmentMarkers(orig)).toContain(0xe0);

      // Minimal edit, exactly like the issue's reproduction.
      exif!.imageIfd.set('DateTime', new IfdAsciiValue('2017:12:23 12:39:48'));

      const out = new JpegUtils().injectExif(exif!, orig);
      expect(out).toBeDefined();

      // Cause 1: the JFIF APP0 (and everything before the EXIF block) must
      // survive the round-trip rather than being silently dropped.
      expect(segmentMarkers(out!)).toContain(0xe0);

      // Cause 2: the thumbnail payload must round-trip byte-for-byte, and the
      // ThumbnailOffset/Length tags must point at it (not dangle).
      const decoded = new JpegUtils().decodeExif(out!);
      expect(decoded).toBeDefined();
      expect(
        decoded!.thumbnailData,
        'thumbnail must survive the round-trip'
      ).toBeDefined();
      expect(decoded!.thumbnailData).toEqual(exif!.thumbnailData);

      // The edited tag still round-trips.
      expect(decoded!.imageIfd.get('DateTime')?.toString()).toBe(
        '2017:12:23 12:39:48'
      );
    });
  });
}

describe('write() drops ThumbnailOffset/Length when no payload is available', () => {
  test('write() drops ThumbnailOffset/Length when no payload is available', () => {
    // An ExifData with IFD1 offset/length tags but no captured thumbnail bytes
    // must not emit dangling pointers — the tags should be dropped instead.
    const exif = new ExifData();
    exif.imageIfd.set('Make', new IfdAsciiValue('test'));
    // ThumbnailOffset
    exif.thumbnailIfd.set(0x0201, new IfdLongValue(9999));
    // ThumbnailLength
    exif.thumbnailIfd.set(0x0202, new IfdLongValue(1234));

    const out = new OutputBuffer({ bigEndian: true });
    exif.write(out);
    const reread = ExifData.fromInputBuffer(
      new InputBuffer<Uint8Array>({ buffer: out.getBytes(), bigEndian: true })
    );

    expect(reread.thumbnailData).toBeUndefined();
    expect(reread.thumbnailIfd.has(0x0201)).toBeFalsy();
    expect(reread.thumbnailIfd.has(0x0202)).toBeFalsy();
  });
});
