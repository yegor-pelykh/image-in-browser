/** @format */

import {
  ColorRgb8,
  decodeGif,
  decodePng,
  Draw,
  encodeGif,
  Format,
  MemoryImage,
  Point,
  RandomUtils,
  Transform,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';
import { ImageTestUtils } from '../_utils/image-test-utils';

describe('Format: GIF', () => {
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

    const output = encodeGif({
      image: g1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.gif,
      'transparencyAnim.gif',
      output
    );
  });

  test('resizing', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.gif,
      'cars.gif'
    );
    let image = decodeGif({
      data: input,
    });

    expect(image).toBeDefined();
    if (image === undefined) {
      return;
    }

    image = Transform.copyResize({
      image: image,
      width: 64,
    });

    const output = encodeGif({
      image: image,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.gif,
      'cars_resized.gif',
      output
    );
  });

  test('convert animated', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.gif,
      'cars.gif'
    );
    const anim = decodeGif({
      data: input,
    });

    expect(anim).toBeDefined();
    if (anim === undefined) {
      return;
    }

    const rgba8 = anim.convert({
      format: Format.uint8,
      numChannels: 4,
      alpha: 255,
    });
    expect(rgba8.numFrames).toBe(anim.numFrames);

    for (const frame of rgba8.frames) {
      const output = encodeGif({
        image: frame,
        singleFrame: true,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.gif,
        `cars_${frame.frameIndex}.png`,
        output
      );
    }

    const output = encodeGif({
      image: rgba8,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.gif,
      'cars.png',
      output
    );
  });

  test('encodeAnimation', () => {
    const anim = new MemoryImage({
      width: 480,
      height: 120,
    });
    anim.loopCount = 10;

    for (let i = 0; i < 10; i++) {
      const image = i === 0 ? anim : anim.addFrame();
      Draw.drawCircle({
        image: image,
        center: new Point(240, 60),
        radius: RandomUtils.intrand(60),
        color: new ColorRgb8(255, 0, 0),
      });
    }

    const gif = encodeGif({
      image: anim,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.gif,
      'encodeAnimation.gif',
      gif
    );

    const anim2 = decodeGif({
      data: gif,
    });

    expect(anim2).toBeDefined();
    if (anim2 === undefined) {
      return;
    }
    expect(anim2.numFrames).toBe(10);
    expect(anim2.loopCount).toBe(10);
  });

  test('encodeAnimation with variable FPS', () => {
    const anim = new MemoryImage({
      width: 480,
      height: 120,
    });
    for (let i = 1; i <= 3; i++) {
      const image = i === 1 ? anim : anim.addFrame();
      image.frameDuration = i * 1000;

      Draw.drawCircle({
        image: image,
        center: new Point(240, 60),
        radius: RandomUtils.intrand(60),
        color: new ColorRgb8(255, 0, 0),
      });
    }
    const gif = encodeGif({
      image: anim,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.gif,
      'encodeAnimation_variable_FPS.gif',
      gif
    );

    const anim2 = decodeGif({
      data: gif,
    });

    expect(anim2).toBeDefined();
    if (anim2 === undefined) {
      return;
    }

    expect(anim2.numFrames).toBe(3);
    expect(anim2.loopCount).toBe(0);
    expect(anim2.frames[0].frameDuration).toBe(1000);
    expect(anim2.frames[1].frameDuration).toBe(2000);
    expect(anim2.frames[2].frameDuration).toBe(3000);
  });

  test('encode_small_gif', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.gif,
      'buck_24.gif'
    );
    const image = decodeGif({
      data: input,
    });
    expect(image).not.toBeUndefined();
    if (image !== undefined) {
      const resized = Transform.copyResize({
        image: image,
        width: 16,
        height: 16,
      });
      const output = encodeGif({
        image: resized,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.gif,
        'encode_small_gif.gif',
        output
      );
    }
  });

  const inputFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.gif,
    '.gif'
  );

  for (const f of inputFiles) {
    test(f.name, () => {
      const input = TestUtils.readFromFilePath(f.path);
      const anim = decodeGif({
        data: input,
      });
      expect(anim).toBeDefined();
      if (anim === undefined) {
        return;
      }

      const gif = encodeGif({
        image: anim,
      });
      if (anim.numFrames > 1) {
        TestUtils.writeToFile(
          TestFolder.output,
          TestSection.gif,
          `${f.name}_anim.gif`,
          gif
        );
      }

      for (const frame of anim.frames) {
        const gif = encodeGif({
          image: frame,
          singleFrame: true,
        });
        TestUtils.writeToFile(
          TestFolder.output,
          TestSection.gif,
          `${f.name}_${frame.frameIndex}.gif`,
          gif
        );
      }

      const a2 = decodeGif({
        data: gif,
      });

      expect(a2).toBeDefined();
      if (a2 === undefined) {
        return;
      }

      expect(a2.numFrames).toBe(anim.numFrames);
      expect(a2.width).toBe(anim.width);
      expect(a2.height).toBe(anim.height);

      for (const frame of anim.frames) {
        const i2 = a2.frames[frame.frameIndex];
        ImageTestUtils.testImageDataEquals(i2, frame);
      }
    });
  }
});
