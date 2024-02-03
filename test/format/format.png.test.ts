/** @format */

import {
  ArrayUtils,
  ColorRgb8,
  decodePng,
  Draw,
  encodePng,
  FlipDirection,
  Format,
  LibError,
  MemoryImage,
  PaletteUint8,
  PngEncoder,
  PngFilterType,
  Point,
  Transform,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { ImageTestUtils } from '../_utils/image-test-utils';

describe('Format: PNG', () => {
  const buck24Hash = 817446904;
  let buck24Image: MemoryImage | undefined = undefined;

  test('luminanceAlpha', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'png_LA.png'
    );
    const png = decodePng({
      data: input,
    });
    expect(png).toBeDefined();
    if (png === undefined) {
      return;
    }

    expect(png.numChannels).toBe(2);

    const rgba = png.convert({
      numChannels: 4,
    });

    const output = encodePng({
      image: rgba,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.png,
      'png_LA_rgba.png',
      output
    );
  });

  test('hungry_180', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'hungry_180.png'
    );
    const png = decodePng({
      data: input,
    });
    expect(png).toBeDefined();
    if (png === undefined) {
      return;
    }

    Transform.flip({
      image: png,
      direction: FlipDirection.horizontal,
    });

    const output = encodePng({
      image: png,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.png,
      'hungry_180_flip.png',
      output
    );
  });

  test('transparencyAnim', () => {
    const input1 = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'g1.png'
    );
    const g1 = decodePng({
      data: input1,
    });
    expect(g1).toBeDefined();
    if (g1 === undefined) {
      return;
    }

    const input2 = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'g2.png'
    );
    const g2 = decodePng({
      data: input2,
    });

    expect(g2).toBeDefined();
    if (g2 === undefined) {
      return;
    }

    const input3 = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'g3.png'
    );
    const g3 = decodePng({
      data: input3,
    });

    expect(g3).toBeDefined();
    if (g3 === undefined) {
      return;
    }

    g1.addFrame(g2);
    g1.addFrame(g3);

    const output = encodePng({
      image: g1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.png,
      'transparencyAnim.png',
      output
    );
  });

  describe('b1_1', () => {
    const image = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint1,
      numChannels: 1,
    });
    for (const p of image) {
      const c = p.x < 32 - p.y ? 1 : 0;
      p.r = c;
    }

    for (const filter of ArrayUtils.getNumEnumValues(PngFilterType)) {
      test(`b1_1_${PngFilterType[filter]}`, () => {
        const png = encodePng({
          image,
          filter: filter as PngFilterType,
        });

        TestUtils.writeToFile(
          TestFolder.output,
          TestSection.png,
          `b1_1_${PngFilterType[filter]}.png`,
          png
        );

        const image2 = decodePng({
          data: png,
        });
        expect(image2).toBeDefined();
        if (image2 === undefined) {
          return;
        }

        ImageTestUtils.testImageEquals(image, image2);
      });
    }
  });

  describe('b1_1p', () => {
    const image = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint1,
      withPalette: true,
    });
    image.palette!.setRgb(0, 255, 0, 0);
    image.palette!.setRgb(1, 0, 255, 0);

    for (const p of image) {
      const c = p.x < 32 - p.y ? 1 : 0;
      p.index = c;
    }

    for (const filter of ArrayUtils.getNumEnumValues(PngFilterType)) {
      test(`b1_1p_${PngFilterType[filter]}`, () => {
        const png = encodePng({
          image,
          filter: filter as PngFilterType,
        });
        TestUtils.writeToFile(
          TestFolder.output,
          TestSection.png,
          `b1_1p_${PngFilterType[filter]}.png`,
          png
        );

        const image2 = decodePng({
          data: png,
        });
        expect(image2).toBeDefined();
        if (image2 === undefined) {
          return;
        }

        // ImageTestUtils.testImageEquals(image, image2);
      });
    }
  });

  describe('b2_1', () => {
    const image = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint2,
      numChannels: 1,
    });

    for (const p of image) {
      const c = p.x < 32 - p.y ? 3 : 0;
      p.r = c;
    }

    for (const filter of ArrayUtils.getNumEnumValues(PngFilterType)) {
      test(`b2_1_${PngFilterType[filter]}`, () => {
        const png = encodePng({
          image,
          filter: filter as PngFilterType,
        });
        TestUtils.writeToFile(
          TestFolder.output,
          TestSection.png,
          `b2_1_${PngFilterType[filter]}.png`,
          png
        );

        const image2 = decodePng({
          data: png,
        });
        expect(image2).toBeDefined();
        if (image2 === undefined) {
          return;
        }

        // ImageTestUtils.testImageEquals(image, image2);
      });
    }
  });

  describe('b2_1p', () => {
    const image = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint2,
      withPalette: true,
    });

    for (let i = 0; i < 4; ++i) {
      image.palette!.setRgb(i, i * 85, i * 85, i * 85);
    }
    for (const p of image) {
      p.r = p.x >>> 3;
    }

    for (const filter of ArrayUtils.getNumEnumValues(PngFilterType)) {
      test(`b2_1p_${PngFilterType[filter]}`, () => {
        const png = encodePng({
          image,
          filter: filter as PngFilterType,
        });
        TestUtils.writeToFile(
          TestFolder.output,
          TestSection.png,
          `b2_1p_${PngFilterType[filter]}.png`,
          png
        );

        const image2 = decodePng({
          data: png,
        });
        expect(image2).toBeDefined();
        if (image2 === undefined) {
          return;
        }

        // ImageTestUtils.testImageEquals(image, image2);
      });
    }
  });

  describe('b4_1', () => {
    const image = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint4,
      numChannels: 1,
    });

    for (const p of image) {
      const c = p.x < 32 - p.y ? 31 : 0;
      p.r = c;
    }

    for (const filter of ArrayUtils.getNumEnumValues(PngFilterType)) {
      test(`b4_1_${PngFilterType[filter]}`, () => {
        const png = encodePng({
          image,
          filter: filter as PngFilterType,
        });
        TestUtils.writeToFile(
          TestFolder.output,
          TestSection.png,
          `b4_1_${PngFilterType[filter]}.png`,
          png
        );

        const image2 = decodePng({
          data: png,
        });
        expect(image2).toBeDefined();
        if (image2 === undefined) {
          return;
        }

        // ImageTestUtils.testImageEquals(image, image2);
      });
    }
  });

  describe('b4_1p', () => {
    const image = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint4,
      withPalette: true,
    });

    for (let i = 0; i < 16; ++i) {
      image.palette!.setRgb(i, i * 17, i * 17, i * 17);
    }
    for (const p of image) {
      p.r = p.x >>> 1;
    }

    for (const filter of ArrayUtils.getNumEnumValues(PngFilterType)) {
      test(`b4_1p_${PngFilterType[filter]}`, () => {
        const png = encodePng({
          image,
          filter: filter as PngFilterType,
        });
        TestUtils.writeToFile(
          TestFolder.output,
          TestSection.png,
          `b4_1p_${PngFilterType[filter]}.png`,
          png
        );

        const image2 = decodePng({
          data: png,
        });
        expect(image2).toBeDefined();
        if (image2 === undefined) {
          return;
        }

        // ImageTestUtils.testImageEquals(image, image2);
      });
    }
  });

  describe('b8_3', () => {
    const image = new MemoryImage({
      width: 32,
      height: 32,
    });

    for (const p of image) {
      const c = p.x < 32 - p.y ? 255 : 0;
      p.r = c;
      p.g = c;
      p.b = c;
    }

    for (const filter of ArrayUtils.getNumEnumValues(PngFilterType)) {
      test(`b8_3_${PngFilterType[filter]}`, () => {
        const png = encodePng({
          image,
          filter: filter as PngFilterType,
        });
        TestUtils.writeToFile(
          TestFolder.output,
          TestSection.png,
          `b8_3_${PngFilterType[filter]}.png`,
          png
        );

        const image2 = decodePng({
          data: png,
        });
        expect(image2).toBeDefined();
        if (image2 === undefined) {
          return;
        }

        // ImageTestUtils.testImageEquals(image, image2);
      });
    }
  });

  describe('b8_3p', () => {
    const image = new MemoryImage({
      width: 32,
      height: 32,
      withPalette: true,
    });

    for (let i = 0; i < 256; ++i) {
      image.palette!.setRgb(i, i, i, i);
    }
    for (const p of image) {
      p.r = p.x * 8;
    }

    for (const filter of ArrayUtils.getNumEnumValues(PngFilterType)) {
      test(`b8_3p_${PngFilterType[filter]}`, () => {
        const png = encodePng({
          image,
          filter: filter as PngFilterType,
        });
        TestUtils.writeToFile(
          TestFolder.output,
          TestSection.png,
          `b8_3p_${PngFilterType[filter]}.png`,
          png
        );

        const image2 = decodePng({
          data: png,
        });
        expect(image2).toBeDefined();
        if (image2 === undefined) {
          return;
        }

        // ImageTestUtils.testImageEquals(image, image2);
      });
    }
  });

  describe('b16_3', () => {
    const image = new MemoryImage({
      width: 32,
      height: 32,
      format: Format.uint16,
    });

    for (const p of image) {
      const c = p.x * 2114;
      p.r = c;
      p.g = c;
      p.b = c;
    }

    for (const filter of ArrayUtils.getNumEnumValues(PngFilterType)) {
      test(`b16_3_${PngFilterType[filter]}`, () => {
        const png = encodePng({
          image,
          filter: filter as PngFilterType,
        });
        TestUtils.writeToFile(
          TestFolder.output,
          TestSection.png,
          `b16_3_${PngFilterType[filter]}.png`,
          png
        );

        const image2 = decodePng({
          data: png,
        });
        expect(image2).toBeDefined();
        if (image2 === undefined) {
          return;
        }

        ImageTestUtils.testImageEquals(image, image2);
      });
    }
  });

  test('decode', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const image = decodePng({
      data: input,
    });

    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    expect(image.width).toBe(300);
    expect(image.height).toBe(186);
    expect(image.numChannels).toBe(3);
    expect(image.format).toBe(Format.uint8);

    const hash = ImageTestUtils.hashImage(image);
    expect(hash).toBe(buck24Hash);

    buck24Image = image;
  });

  test('encode palette', () => {
    const palette = new PaletteUint8(256, 3);
    for (let i = 0; i < 256; ++i) {
      palette.setRgb(i, (i * 2) % 256, (i * 8) % 256, i);
    }
    const image = new MemoryImage({
      width: 256,
      height: 256,
      numChannels: 1,
      palette: palette,
    });
    for (const p of image) {
      p.index = p.x % 256;
    }

    const png = encodePng({
      image: image,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.png,
      'encode_palette.png',
      png
    );

    const image2 = decodePng({
      data: png,
    });
    expect(image2).toBeDefined();
    if (image2 === undefined) {
      return;
    }

    expect(image2.width).toBe(image.width);
    expect(image2.height).toBe(image.height);

    ImageTestUtils.testImageDataEquals(image, image2);
  });

  test('decode palette', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_8.png'
    );
    const image = decodePng({
      data: input,
    });
    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    expect(image.width).toBe(300);
    expect(image.height).toBe(186);
    expect(image.numChannels).toBe(3);
    expect(image.format).toBe(Format.uint8);
    expect(image.hasPalette).toBe(true);

    const png = encodePng({
      image: image,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.png,
      'decode_palette.png',
      png
    );
  });

  test('encode filter:none', () => {
    const data = encodePng({
      image: buck24Image!,
      filter: PngFilterType.none,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.png,
      'encode_filter_none.png',
      data
    );

    const png2 = decodePng({
      data: data,
    });

    expect(png2).toBeDefined();
    if (png2 === undefined) {
      return;
    }

    const hash = ImageTestUtils.hashImage(png2);
    expect(hash).toBe(buck24Hash);
  });

  test('encode filter:sub', () => {
    const data = encodePng({
      image: buck24Image!,
      filter: PngFilterType.sub,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.png,
      'encode_filter_sub.png',
      data
    );

    const png2 = decodePng({
      data: data,
    });

    expect(png2).toBeDefined();
    if (png2 === undefined) {
      return;
    }

    const hash = ImageTestUtils.hashImage(png2);
    expect(hash).toBe(buck24Hash);
  });

  test('encode filter:up', () => {
    const data = encodePng({
      image: buck24Image!,
      filter: PngFilterType.up,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.png,
      'encode_filter_up.png',
      data
    );

    const png2 = decodePng({
      data: data,
    });

    expect(png2).toBeDefined();
    if (png2 === undefined) {
      return;
    }

    const hash = ImageTestUtils.hashImage(png2);
    expect(hash).toBe(buck24Hash);
  });

  test('encode filter:average', () => {
    const data = encodePng({
      image: buck24Image!,
      filter: PngFilterType.average,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.png,
      'encode_filter_average.png',
      data
    );

    const png2 = decodePng({
      data: data,
    });

    expect(png2).toBeDefined();
    if (png2 === undefined) {
      return;
    }

    const hash = ImageTestUtils.hashImage(png2);
    expect(hash).toBe(buck24Hash);
  });

  test('encode filter:paeth', () => {
    const data = encodePng({
      image: buck24Image!,
      filter: PngFilterType.paeth,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.png,
      'encode_filter_paeth.png',
      data
    );

    const png2 = decodePng({
      data: data,
    });

    expect(png2).toBeDefined();
    if (png2 === undefined) {
      return;
    }

    const hash = ImageTestUtils.hashImage(png2);
    expect(hash).toBe(buck24Hash);
  });

  test('decodeAnimation', () => {
    type TestExampleInfo = {
      fileName: string;
      correctLength: number;
    };
    const testInfo: TestExampleInfo[] = [
      {
        fileName: 'test_apng.png',
        correctLength: 2,
      },
      {
        fileName: 'test_apng2.png',
        correctLength: 60,
      },
      {
        fileName: 'test_apng3.png',
        correctLength: 19,
      },
    ];
    const resFiles = TestUtils.listFiles(
      TestFolder.input,
      TestSection.apng,
      '.png'
    );
    for (const file of resFiles.filter((f) =>
      testInfo.some((ti) => ti.fileName === f.fileName)
    )) {
      const input = TestUtils.readFromFilePath(file.path);
      const anim = decodePng({
        data: input,
      });
      expect(anim).toBeDefined();
      if (anim === undefined) {
        return;
      }
      const info = testInfo.find((ti) => ti.fileName === file.fileName);
      if (info === undefined) {
        return;
      }
      expect(anim.numFrames).toBe(info.correctLength);

      for (let i = 0; i < anim.numFrames; ++i) {
        const frame = encodePng({
          image: anim.getFrame(i),
        });
        TestUtils.writeToFile(
          TestFolder.output,
          TestSection.png,
          `${file.name}-${i}${file.ext}`,
          frame
        );
      }
    }
  });

  test('encodeAnimation', () => {
    const anim = new MemoryImage({
      width: 480,
      height: 120,
    });
    anim.loopCount = 10;
    for (let i = 0; i < 10; i++) {
      const frame = i === 0 ? anim : anim.addFrame();
      Draw.drawCircle({
        image: frame,
        center: new Point(240, 60),
        radius: i * 10,
        color: new ColorRgb8(255, 0, 0),
      });
    }

    const png = encodePng({
      image: anim,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.png,
      'encodeAnimation.png',
      png
    );
  });

  test('encodeAnimation with mulitple single frame Images', () => {
    const encoder = new PngEncoder();
    encoder.start(10);

    for (let i = 0; i < 10; i++) {
      const frame = new MemoryImage({
        width: 480,
        height: 120,
      });
      frame.loopCount = 10;
      Draw.drawCircle({
        image: frame,
        center: new Point(120, 60),
        radius: (i + 1) * 10,
        color: new ColorRgb8(0, 255, 0),
      });
      encoder.addFrame(frame);
    }

    const png = encoder.finish()!;
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.png,
      'encodeAnimation.png',
      png
    );
  });

  test('textData', () => {
    const img = new MemoryImage({
      width: 16,
      height: 16,
      textData: new Map<string, string>([['foo', 'bar']]),
    });
    const png = encodePng({
      image: img,
    });
    const img2 = decodePng({
      data: png,
    });
    expect(img2).toBeDefined();
    if (img2 === undefined) {
      return;
    }
    expect(img2.width).toBe(img.width);
    expect(img2.textData?.get('foo')).toBe('bar');
  });

  test('iccProfile', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'iCCP.png'
    );
    const img = decodePng({
      data: input,
    });

    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    expect(img.iccProfile).toBeDefined();
    expect(img.iccProfile!.data).toBeDefined();

    const png = encodePng({
      image: img,
    });
    const img2 = decodePng({
      data: png,
    });

    expect(img2).toBeDefined();
    if (img2 === undefined) {
      return;
    }

    expect(img2.iccProfile).toBeDefined();
    expect(img2.iccProfile!.data).toBeDefined();
    expect(img2.iccProfile!.data.length).toBe(img.iccProfile!.data.length);
  });

  // PngSuite File naming convention:
  // filename:                                g04i2c08.png
  //                                          || ||||
  //  test feature (in this case gamma) ------+| ||||
  //  parameter of test (here gamma-value) ----+ ||||
  //  interlaced or non-interlaced --------------+|||
  //  color-type (numerical) ---------------------+||
  //  color-type (descriptive) --------------------+|
  //  bit-depth ------------------------------------+
  //
  //  color-type:
  //
  //    0g - grayscale
  //    2c - rgb color
  //    3p - paletted
  //    4a - grayscale + alpha channel
  //    6a - rgb color + alpha channel
  //    bit-depth:
  //      01 - with color-type 0, 3
  //      02 - with color-type 0, 3
  //      04 - with color-type 0, 3
  //      08 - with color-type 0, 2, 3, 4, 6
  //      16 - with color-type 0, 2, 4, 6
  //      interlacing:
  //        n - non-interlaced
  //        i - interlaced

  const resFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.png,
    '.png'
  );

  for (const file of resFiles) {
    test(`PNG ${file.fileName}`, () => {
      const input = TestUtils.readFromFile(
        TestFolder.input,
        TestSection.png,
        file.fileName
      );
      // X* png's are corrupted and are supposed to crash.
      if (file.fileName.toLowerCase().startsWith('x')) {
        expect(() => {
          const image = decodePng({
            data: input,
          });
          if (image === undefined) {
            throw new LibError('image is undefined.');
          }
        }).toThrow();
      } else {
        const animation = decodePng({
          data: input,
        });
        expect(animation).toBeDefined();
        if (animation === undefined) {
          return;
        }
        if (animation.numFrames === 1) {
          const output = encodePng({
            image: animation.getFrame(0),
          });
          TestUtils.writeToFile(
            TestFolder.output,
            TestSection.png,
            file.fileName,
            output
          );
        } else {
          for (let i = 0; i < animation.numFrames; ++i) {
            const output = encodePng({
              image: animation.getFrame(i),
            });
            TestUtils.writeToFile(
              TestFolder.output,
              TestSection.png,
              `${file.name}-${i}.png`,
              output
            );
          }
        }
      }
    });
  }
});
