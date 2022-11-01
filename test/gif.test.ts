/** @format */

import {
  decodeGif,
  decodeJpg,
  encodeGif,
  encodeGifAnimation,
  encodePng,
  ImageTransform,
} from '../src';
import { FrameAnimation } from '../src/common/frame-animation';
import { MemoryImage } from '../src/common/memory-image';
import { GifDecoder } from '../src/formats/gif-decoder';
import { GifEncoder } from '../src/formats/gif-encoder';
import { TestFolder, TestSection, TestHelpers } from './test-helpers';

describe('GIF', () => {
  const resFiles = TestHelpers.listFiles(
    TestFolder.res,
    TestSection.gif,
    '.gif'
  );

  for (const file of resFiles) {
    test(`getInfo ${file.name}`, () => {
      const input = TestHelpers.readFromFilePath(file.path);
      const data = new GifDecoder().startDecode(input);
      if (data === undefined) {
        throw new Error(`Unable to parse GIF info: ${file.name}.`);
      }
    });
  }

  for (const file of resFiles) {
    test(`decodeImage ${file.name}`, () => {
      const input = TestHelpers.readFromFilePath(file.path);
      const image = decodeGif(input);
      expect(image).not.toBeUndefined();
      if (image !== undefined) {
        const output = encodePng(image);
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.gif,
          TestHelpers.replaceFileName(file.name, (ext) => 'bmp'),
          output
        );
      }
    });
  }

  const carsFiles = TestHelpers.listFiles(
    TestFolder.res,
    TestSection.gif,
    'cars.gif'
  );

  for (const file of carsFiles) {
    let animation: FrameAnimation | undefined = undefined;

    test(`decodeCars ${file.name}`, () => {
      const input = TestHelpers.readFromFilePath(file.path);
      animation = new GifDecoder().decodeAnimation(input);
      expect(animation).not.toBeUndefined();
      if (animation !== undefined) {
        expect(animation.frames.length).toBe(30);
        expect(animation.loopCount).toBe(0);
      }
    });

    test(`encodeCars ${file.name}`, () => {
      expect(animation).not.toBeUndefined();
      if (animation !== undefined) {
        const output = encodeGifAnimation(animation);
        expect(output).not.toBeUndefined();
        if (output !== undefined) {
          TestHelpers.writeToFile(
            TestFolder.out,
            TestSection.gif,
            file.name,
            output
          );
        }
      }
    });
  }

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
    const encoded = encodeGifAnimation(animation);
    expect(encoded).not.toBeUndefined();
    if (encoded !== undefined) {
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.gif,
        'encodeAnimation.gif',
        encoded
      );
      const animation2 = new GifDecoder().decodeAnimation(encoded);
      expect(animation2).not.toBeUndefined();
      if (animation2 !== undefined) {
        expect(animation2.frames.length).toBe(10);
        expect(animation2.loopCount).toBe(10);
      }
    }
  });

  test('encodeAnimation with letiable FPS', () => {
    const animation = new FrameAnimation();
    for (let i = 1; i <= 3; i++) {
      const image = new MemoryImage({
        width: 480,
        height: 120,
      });
      image.duration = i * 1000;
      // Do some changes here ...
      animation.addFrame(image);
    }
    const encoded = encodeGifAnimation(animation);
    expect(encoded).not.toBeUndefined();
    if (encoded !== undefined) {
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.gif,
        'encodeAnimation_letiable_FPS.gif',
        encoded
      );
      const animation2 = new GifDecoder().decodeAnimation(encoded);
      expect(animation2).not.toBeUndefined();
      if (animation2 !== undefined) {
        expect(animation2.frames.length).toBe(3);
        expect(animation2.loopCount).toBe(0);
        expect(animation2.getFrame(0).duration).toBe(1000);
        expect(animation2.getFrame(1).duration).toBe(2000);
        expect(animation2.getFrame(2).duration).toBe(3000);
      }
    }
  });

  test('encodeImage', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.jpeg,
      'jpeg444.jpg'
    );
    const image = decodeJpg(input);
    expect(image).not.toBeUndefined();
    if (image !== undefined) {
      const output = new GifEncoder().encodeImage(image);
      expect(output).not.toBeUndefined();
      if (output !== undefined) {
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.gif,
          'jpeg444.gif',
          output
        );
      }
    }
  });

  test('encode_small_gif', () => {
    const input = TestHelpers.readFromFile(
      TestFolder.res,
      TestSection.jpeg,
      'big_buck_bunny.jpg'
    );
    const image = decodeJpg(input);
    expect(image).not.toBeUndefined();
    if (image !== undefined) {
      const resized = ImageTransform.copyResize({
        image: image,
        width: 16,
        height: 16,
      });
      const output = encodeGif(resized);
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.gif,
        'encode_small_gif.gif',
        output
      );
    }
  });
});
