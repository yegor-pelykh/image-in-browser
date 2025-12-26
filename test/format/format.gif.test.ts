/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  decodeGif,
  decodePng,
  Draw,
  encodeGif,
  encodePng,
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

/**
 * Test suite for GIF format operations.
 */
describe('Format: GIF', () => {
  /**
   * Test case for bounce.gif animation.
   */
  test('bounce', () => {
    const input1 = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.gif,
      'bounce.gif'
    );
    const g1 = decodeGif({
      data: input1,
    });

    expect(g1).toBeDefined();
    if (g1 === undefined) {
      return;
    }

    const output = encodeGif({
      image: g1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.gif,
      'bounce.gif',
      output
    );

    for (const frame of g1.frames) {
      const output = encodePng({
        image: frame,
        singleFrame: true,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.gif,
        `bounce_${frame.frameIndex}.png`,
        output
      );
    }
  });

  /**
   * Test case for animated.gif animation.
   */
  test('animated', () => {
    const input1 = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.gif,
      'animated.gif'
    );
    const g1 = decodeGif({
      data: input1,
    });

    expect(g1).toBeDefined();
    if (g1 === undefined) {
      return;
    }

    const output = encodeGif({
      image: g1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.gif,
      'animated.gif',
      output
    );

    for (const frame of g1.frames) {
      const output = encodePng({
        image: frame,
        singleFrame: true,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.gif,
        `animated_${frame.frameIndex}.png`,
        output
      );
    }
  });

  /**
   * Test case for anim_palette GIF.
   */
  test('anim_palette', () => {
    const input1 = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.gif,
      'anim_palette.gif'
    );
    const g1 = decodeGif({
      data: input1,
    });

    expect(g1).toBeDefined();
    if (g1 === undefined) {
      return;
    }

    const output = encodeGif({
      image: g1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.gif,
      'anim_palette.gif',
      output
    );
  });

  /**
   * Test case for hand_anim GIF.
   */
  test('hand_anim', () => {
    const input1 = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.gif,
      'hand_anim.gif'
    );
    const g1 = decodeGif({
      data: input1,
    });

    expect(g1).toBeDefined();
    if (g1 === undefined) {
      return;
    }

    const output = encodeGif({
      image: g1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.gif,
      'hand_anim.gif',
      output
    );
  });

  /**
   * Test case for resizing hand_anim GIF.
   */
  test('hand_anim resize', () => {
    const input1 = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.gif,
      'hand_anim.gif'
    );
    const g1 = decodeGif({
      data: input1,
    });

    expect(g1).toBeDefined();
    if (g1 === undefined) {
      return;
    }

    const g2 = Transform.copyResize({
      image: g1,
      width: Math.trunc(g1.width / 2),
      height: Math.trunc(g1.height / 2),
    });

    for (const f of g2.frames) {
      const p1 = g1.frames[f.frameIndex].getPixel(0, 0);
      const p2 = f.getPixel(0, 0);
      const equals = p1.equals(p2);
      expect(equals).toBeTruthy();

      const g3 = encodeGif({
        image: f,
        singleFrame: true,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.gif,
        `hand_${f.frameIndex}.gif`,
        g3
      );
    }

    const g2output = encodeGif({
      image: g2,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.gif,
      'hand_anim_resize.gif',
      g2output
    );
  });

  /**
   * Test case for transparency animation using PNGs.
   */
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

  /**
   * Test case for resizing cars GIF.
   */
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

  /**
   * Test case for converting animated GIF to PNG.
   */
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

  /**
   * Test case for encoding animation with fixed number of frames.
   */
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

  /**
   * Test case for encoding animation with variable FPS.
   */
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

  /**
   * Test case for encoding small GIF.
   */
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

  /**
   * Test case for encoding and decoding all GIF files in the input folder.
   */
  const inputFiles = TestUtils.listFiles(
    TestFolder.input,
    TestSection.gif,
    '.gif'
  );

  for (const f of inputFiles) {
    test(f.nameExt, () => {
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
