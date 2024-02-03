/** @format */

import {
  decodeJpg,
  decodeTiff,
  encodePng,
  encodeTiff,
  Format,
  MemoryImage,
  TiffDecoder,
  TiffImageType,
  TiffPhotometricType,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

type TiffFrameInfo = {
  width: number;
  height: number;
  photometricType: TiffPhotometricType;
  compression: number;
  bitsPerSample: number;
  samplesPerPixel: number;
  imageType: TiffImageType;
  tiled: boolean;
  tileWidth: number;
  tileHeight: number;
  predictor: number;
};

type TiffFileInfo = {
  width: number;
  height: number;
  bigEndian: boolean;
  images: TiffFrameInfo[];
};

describe('Format: TIFF', () => {
  test('encode', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });
    for (const p of i0) {
      p.r = p.x;
      p.g = p.y;
    }

    let output = encodeTiff({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.tiff,
      'colors.tif',
      output
    );

    const b1 = TestUtils.readFromFile(
      TestFolder.output,
      TestSection.tiff,
      'colors.tif'
    );
    const i1 = decodeTiff({
      data: b1,
    });
    expect(i1).toBeDefined();
    if (i1 === undefined) {
      return;
    }

    expect(i1.width).toBe(i0.width);
    expect(i1.height).toBe(i0.height);

    for (const p of i1) {
      expect(p.r).toBe(p.x);
      expect(p.g).toBe(p.y);
      expect(p.b).toBe(0);
      expect(p.a).toBe(255);
    }

    const i3p = new MemoryImage({
      width: 256,
      height: 256,
      numChannels: 4,
      withPalette: true,
    });
    for (let i = 0; i < 256; ++i) {
      i3p.palette!.setRgb(i, i, i, i);
    }
    for (const p of i3p) {
      p.index = p.x;
    }

    output = encodeTiff({
      image: i3p,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.tiff,
      'palette.tif',
      output
    );

    const b2 = TestUtils.readFromFile(
      TestFolder.output,
      TestSection.tiff,
      'palette.tif'
    );
    const i3p2 = decodeTiff({
      data: b2,
    });
    expect(i3p2).toBeDefined();
    if (i3p2 === undefined) {
      return;
    }

    expect(i3p2).toBeDefined();
    expect(i3p2.width).toBe(i3p.width);
    expect(i3p2.height).toBe(i3p.height);
    expect(i3p2.hasPalette).toBeTruthy();

    for (const p of i3p2) {
      expect(p.r).toBe(p.x);
      expect(p.g).toBe(p.x);
      expect(p.b).toBe(p.x);
      expect(p.a).toBe(255);
    }

    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.jpeg,
      'big_buck_bunny.jpg'
    );
    const img = decodeJpg({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const convBytes = encodeTiff({
      image: img,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.tiff,
      'big_buck_bunny.tif',
      convBytes
    );
  });

  test('cmyk', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.tiff,
      'cmyk.tif'
    );
    const i0 = decodeTiff({
      data: input,
    });
    expect(i0).toBeDefined();
    if (i0 === undefined) {
      return;
    }

    const i1 = i0.isHdrFormat
      ? i0.convert({
          format: Format.uint8,
        })
      : i0;

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.tiff,
      'cmyk.png',
      output
    );
  });

  const resFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.tiff,
    '.tif'
  );

  for (const file of resFiles) {
    test(`get info ${file.fileName}`, () => {
      const bytes = TestUtils.readFromFilePath(file.path);
      const info = new TiffDecoder().startDecode(bytes);
      expect(info).toBeDefined();
      if (info === undefined) {
        return;
      }
      const expectedInfo = _expectedInfo.get(file.fileName);
      if (info !== undefined && expectedInfo !== undefined) {
        expect(info.width).toBe(expectedInfo.width);
        expect(info.height).toBe(expectedInfo.height);
        expect(info.bigEndian).toBe(expectedInfo.bigEndian);
        const images = expectedInfo.images;
        expect(info.images.length).toBe(images.length);
        for (let i = 0; i < info.images.length; ++i) {
          const i1 = info.images[i];
          const i2 = images[i];
          expect(i1.width).toBe(i2.width);
          expect(i1.height).toBe(i2.height);
          expect(i1.photometricType).toBe(i2.photometricType);
          expect(i1.compression).toBe(i2.compression);
          expect(i1.bitsPerSample).toBe(i2.bitsPerSample);
          expect(i1.samplesPerPixel).toBe(i2.samplesPerPixel);
          expect(i1.imageType).toBe(i2.imageType);
          expect(i1.tiled).toBe(i2.tiled);
          expect(i1.tileWidth).toBe(i2.tileWidth);
          expect(i1.tileHeight).toBe(i2.tileHeight);
          expect(i1.predictor).toBe(i2.predictor);
        }
      }
    });
  }

  for (const file of resFiles) {
    test(`decode ${file.fileName}`, () => {
      const bytes = TestUtils.readFromFilePath(file.path);
      const image = decodeTiff({
        data: bytes,
      });
      expect(image).toBeDefined();
      if (image === undefined) {
        return;
      }

      const i0 = image;
      const i1 = i0.isHdrFormat
        ? i0.convert({
            format: Format.uint8,
          })
        : i0;

      const output = encodePng({
        image: i1,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.tiff,
        `${file.name}.png`,
        output
      );

      const tif = encodeTiff({
        image: image,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.tiff,
        file.fileName,
        tif
      );

      const i2 = decodeTiff({
        data: tif,
      });
      expect(i2).toBeDefined();
      if (i2 === undefined) {
        return;
      }

      expect(i2.width).toBe(image.width);
      expect(i2.height).toBe(image.height);

      const i3 = i2.isHdrFormat
        ? i2.convert({
            format: Format.uint8,
          })
        : i2;

      const png = encodePng({
        image: i3,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.tiff,
        `${file.name}-2.png`,
        png
      );
    });
  }
});

const _expectedInfo = new Map<string, TiffFileInfo>([
  [
    'aspect32float.tif',
    {
      width: 10,
      height: 8,
      bigEndian: true,
      images: [
        {
          width: 10,
          height: 8,
          photometricType: TiffPhotometricType.blackIsZero,
          compression: 1,
          bitsPerSample: 32,
          samplesPerPixel: 1,
          imageType: TiffImageType.gray,
          tiled: false,
          tileWidth: 10,
          tileHeight: 8,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'bitonal_lzw.tif',
    {
      width: 100,
      height: 100,
      bigEndian: false,
      images: [
        {
          width: 100,
          height: 100,
          photometricType: TiffPhotometricType.whiteIsZero,
          compression: 5,
          bitsPerSample: 1,
          samplesPerPixel: 1,
          imageType: TiffImageType.bilevel,
          tiled: false,
          tileWidth: 100,
          tileHeight: 100,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'bitonal_none.tif',
    {
      width: 100,
      height: 100,
      bigEndian: false,
      images: [
        {
          width: 100,
          height: 100,
          photometricType: TiffPhotometricType.whiteIsZero,
          compression: 1,
          bitsPerSample: 1,
          samplesPerPixel: 1,
          imageType: TiffImageType.bilevel,
          tiled: false,
          tileWidth: 100,
          tileHeight: 100,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'bitonal_zip.tif',
    {
      width: 100,
      height: 100,
      bigEndian: false,
      images: [
        {
          width: 100,
          height: 100,
          photometricType: TiffPhotometricType.whiteIsZero,
          compression: 8,
          bitsPerSample: 1,
          samplesPerPixel: 1,
          imageType: TiffImageType.bilevel,
          tiled: false,
          tileWidth: 100,
          tileHeight: 100,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'ccittt_t4_1d_nofill.tif',
    {
      width: 300,
      height: 225,
      bigEndian: false,
      images: [
        {
          width: 300,
          height: 225,
          photometricType: TiffPhotometricType.whiteIsZero,
          compression: 3,
          bitsPerSample: 1,
          samplesPerPixel: 1,
          imageType: TiffImageType.bilevel,
          tiled: false,
          tileWidth: 300,
          tileHeight: 225,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'ccitt_t4_1d_fill.tif',
    {
      width: 300,
      height: 225,
      bigEndian: false,
      images: [
        {
          width: 300,
          height: 225,
          photometricType: TiffPhotometricType.whiteIsZero,
          compression: 3,
          bitsPerSample: 1,
          samplesPerPixel: 1,
          imageType: TiffImageType.bilevel,
          tiled: false,
          tileWidth: 300,
          tileHeight: 225,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'ccitt_t4_2d_fill.tif',
    {
      width: 300,
      height: 225,
      bigEndian: false,
      images: [
        {
          width: 300,
          height: 225,
          photometricType: TiffPhotometricType.whiteIsZero,
          compression: 3,
          bitsPerSample: 1,
          samplesPerPixel: 1,
          imageType: TiffImageType.bilevel,
          tiled: false,
          tileWidth: 300,
          tileHeight: 225,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'ccitt_t4_2d_nofill.tif',
    {
      width: 300,
      height: 225,
      bigEndian: false,
      images: [
        {
          width: 300,
          height: 225,
          photometricType: TiffPhotometricType.whiteIsZero,
          compression: 3,
          bitsPerSample: 1,
          samplesPerPixel: 1,
          imageType: TiffImageType.bilevel,
          tiled: false,
          tileWidth: 300,
          tileHeight: 225,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'ccitt_t6.tif',
    {
      width: 300,
      height: 225,
      bigEndian: false,
      images: [
        {
          width: 300,
          height: 225,
          photometricType: TiffPhotometricType.whiteIsZero,
          compression: 4,
          bitsPerSample: 1,
          samplesPerPixel: 1,
          imageType: TiffImageType.bilevel,
          tiled: false,
          tileWidth: 300,
          tileHeight: 225,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'cmyk.tif',
    {
      width: 300,
      height: 225,
      bigEndian: false,
      images: [
        {
          width: 300,
          height: 225,
          photometricType: TiffPhotometricType.cmyk,
          compression: 5,
          bitsPerSample: 8,
          samplesPerPixel: 4,
          imageType: TiffImageType.generic,
          tiled: false,
          tileWidth: 300,
          tileHeight: 27,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'dtm32float.tif',
    {
      width: 10,
      height: 8,
      bigEndian: true,
      images: [
        {
          width: 10,
          height: 8,
          photometricType: TiffPhotometricType.blackIsZero,
          compression: 1,
          bitsPerSample: 32,
          samplesPerPixel: 1,
          imageType: TiffImageType.gray,
          tiled: false,
          tileWidth: 10,
          tileHeight: 8,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'dtm64float.tif',
    {
      width: 10,
      height: 8,
      bigEndian: true,
      images: [
        {
          width: 10,
          height: 8,
          photometricType: TiffPhotometricType.blackIsZero,
          compression: 1,
          bitsPerSample: 64,
          samplesPerPixel: 1,
          imageType: TiffImageType.gray,
          tiled: false,
          tileWidth: 10,
          tileHeight: 8,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'dtm_test.tif',
    {
      width: 10,
      height: 8,
      bigEndian: false,
      images: [
        {
          width: 10,
          height: 8,
          photometricType: TiffPhotometricType.blackIsZero,
          compression: 1,
          bitsPerSample: 32,
          samplesPerPixel: 1,
          imageType: TiffImageType.gray,
          tiled: false,
          tileWidth: 10,
          tileHeight: 8,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'float16.tif',
    {
      width: 420,
      height: 420,
      bigEndian: false,
      images: [
        {
          width: 420,
          height: 420,
          photometricType: TiffPhotometricType.rgb,
          compression: 1,
          bitsPerSample: 16,
          samplesPerPixel: 3,
          imageType: TiffImageType.rgb,
          tiled: false,
          tileWidth: 420,
          tileHeight: 420,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'float1x32.tif',
    {
      width: 420,
      height: 420,
      bigEndian: false,
      images: [
        {
          width: 420,
          height: 420,
          photometricType: TiffPhotometricType.blackIsZero,
          compression: 1,
          bitsPerSample: 32,
          samplesPerPixel: 1,
          imageType: TiffImageType.gray,
          tiled: false,
          tileWidth: 420,
          tileHeight: 420,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'float32.tif',
    {
      width: 420,
      height: 420,
      bigEndian: false,
      images: [
        {
          width: 420,
          height: 420,
          photometricType: TiffPhotometricType.rgb,
          compression: 1,
          bitsPerSample: 32,
          samplesPerPixel: 3,
          imageType: TiffImageType.rgb,
          tiled: false,
          tileWidth: 420,
          tileHeight: 420,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'flow16int.tif',
    {
      width: 10,
      height: 8,
      bigEndian: true,
      images: [
        {
          width: 10,
          height: 8,
          photometricType: TiffPhotometricType.blackIsZero,
          compression: 1,
          bitsPerSample: 16,
          samplesPerPixel: 1,
          imageType: TiffImageType.gray,
          tiled: false,
          tileWidth: 10,
          tileHeight: 8,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'globe.tif',
    {
      width: 256,
      height: 256,
      bigEndian: true,
      images: [
        {
          width: 256,
          height: 256,
          photometricType: TiffPhotometricType.rgb,
          compression: 5,
          bitsPerSample: 8,
          samplesPerPixel: 3,
          imageType: TiffImageType.rgb,
          tiled: false,
          tileWidth: 256,
          tileHeight: 256,
          predictor: 2,
        },
      ],
    },
  ],
  [
    'lzw_strips.tif',
    {
      width: 300,
      height: 225,
      bigEndian: false,
      images: [
        {
          width: 300,
          height: 225,
          photometricType: TiffPhotometricType.rgb,
          compression: 5,
          bitsPerSample: 8,
          samplesPerPixel: 3,
          imageType: TiffImageType.rgb,
          tiled: false,
          tileWidth: 300,
          tileHeight: 9,
          predictor: 2,
        },
      ],
    },
  ],
  [
    'lzw_tiled.tif',
    {
      width: 300,
      height: 225,
      bigEndian: false,
      images: [
        {
          width: 300,
          height: 225,
          photometricType: TiffPhotometricType.rgb,
          compression: 5,
          bitsPerSample: 8,
          samplesPerPixel: 3,
          imageType: TiffImageType.rgb,
          tiled: true,
          tileWidth: 256,
          tileHeight: 256,
          predictor: 2,
        },
      ],
    },
  ],
  [
    'small.tif',
    {
      width: 300,
      height: 225,
      bigEndian: false,
      images: [
        {
          width: 300,
          height: 225,
          photometricType: TiffPhotometricType.rgb,
          compression: 1,
          bitsPerSample: 8,
          samplesPerPixel: 3,
          imageType: TiffImageType.rgb,
          tiled: false,
          tileWidth: 300,
          tileHeight: 9,
          predictor: 1,
        },
      ],
    },
  ],
  [
    'tca32int.tif',
    {
      width: 10,
      height: 8,
      bigEndian: true,
      images: [
        {
          width: 10,
          height: 8,
          photometricType: TiffPhotometricType.blackIsZero,
          compression: 1,
          bitsPerSample: 32,
          samplesPerPixel: 1,
          imageType: TiffImageType.gray,
          tiled: false,
          tileWidth: 10,
          tileHeight: 8,
          predictor: 1,
        },
      ],
    },
  ],
]);
