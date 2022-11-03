/** @format */

import {
  Color,
  decodeAnimation,
  decodePng,
  encodePng,
  encodePngAnimation,
  PngDecoder,
} from '../src';
import { FrameAnimation } from '../src/common/frame-animation';
import { MemoryImage } from '../src/common/memory-image';
import { RgbChannelSet } from '../src/common/rgb-channel-set';
import { TestFolder, TestSection, TestHelpers } from './test-helpers';

describe('PNG', () => {
  const resFiles = TestHelpers.listFiles(
    TestFolder.res,
    TestSection.png,
    '.png'
  );

  test('encode', () => {
    const image = new MemoryImage({
      width: 64,
      height: 64,
    });
    image.fill(Color.getColor(100, 200, 255));
    const output = encodePng(image);
    TestHelpers.writeToFile(
      TestFolder.out,
      TestSection.png,
      'encode.png',
      output
    );
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

    for (const file of resFiles.filter((f) =>
      testInfo.some((ti) => ti.fileName === f.name)
    )) {
      const input = TestHelpers.readFromFilePath(file.path);
      const animation = new PngDecoder().decodeAnimation(input);
      expect(animation).not.toBeUndefined();
      if (animation !== undefined) {
        const info = testInfo.find((ti) => ti.fileName === file.name);
        if (info !== undefined) {
          expect(animation.numFrames).toBe(info.correctLength);
        }
      }
    }
  });

  test('encodeAnimation', () => {
    const animation = new FrameAnimation({
      loopCount: 10,
    });
    for (let i = 0; i < 10; i++) {
      const image = new MemoryImage({
        width: 480,
        height: 120,
      });
      // Do some changes here ...
      animation.addFrame(image);
    }
    const output = encodePngAnimation(animation);
    expect(output).not.toBeUndefined();
    if (output !== undefined) {
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.png,
        'encodeAnimation.png',
        output
      );
    }
  });

  test('textData', () => {
    const image = new MemoryImage({
      width: 16,
      height: 16,
      rgbChannelSet: RgbChannelSet.rgba,
      textData: new Map<string, string>([['foo', 'bar']]),
    });
    const encoded = encodePng(image);
    const image2 = decodePng(encoded);
    expect(image2).not.toBeUndefined();
    if (image2 !== undefined) {
      expect(image2.width).toBe(image.width);
      expect(image2.textData?.get('foo')).toBe('bar');
    }
  });

  test('decode', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.png,
      'decode.png'
    );
    const image = decodePng(input);
    expect(image).not.toBeUndefined();
    if (image !== undefined) {
      expect(image.width).toBe(64);
      expect(image.height).toBe(64);
      const c = Color.getColor(100, 200, 255);
      for (let i = 0, len = image.length; i < len; ++i) {
        expect(image.getPixelByIndex(i)).toBe(c);
      }
      const output = encodePng(image);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.png,
        'decode.png',
        output
      );
    }
  });

  test('iCCP', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.png,
      'iCCP.png'
    );
    const image = decodePng(input);
    expect(image).not.toBeUndefined();
    if (image !== undefined) {
      expect(image.iccProfile).not.toBeUndefined();
      const encoded = encodePng(image);
      const image2 = decodePng(encoded);
      expect(image2).not.toBeUndefined();
      if (image2 !== undefined) {
        expect(image2.iccProfile).not.toBeUndefined();
        expect(image2.iccProfile!.data.length).toBe(
          image.iccProfile!.data.length
        );
      }
    }
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

  for (const file of resFiles) {
    test(`PNG ${file.name}`, () => {
      const input = TestHelpers.readFromFile(
        TestFolder.res,
        TestSection.png,
        file.name
      );
      // X* png's are corrupted and are supposed to crash.
      if (file.name.toLowerCase().startsWith('x')) {
        try {
          const image = decodePng(input);
          expect(image).toBeUndefined();
        } catch (e) {
          // Noop
        }
      } else {
        const animation = decodeAnimation(input);
        expect(animation).not.toBeUndefined();
        if (animation !== undefined) {
          if (animation.numFrames === 1) {
            const output = encodePng(animation.getFrame(0));
            TestHelpers.writeToFile(
              TestFolder.out,
              TestSection.png,
              file.name,
              output
            );
          } else {
            for (let i = 0; i < animation.numFrames; ++i) {
              const output = encodePng(animation.getFrame(i));
              TestHelpers.writeToFile(
                TestFolder.out,
                TestSection.png,
                `${file.name}-${i}.png`,
                output
              );
            }
          }
        }
      }
    });
  }
});
