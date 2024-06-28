/** @format */

import { describe, expect, test } from 'vitest';
import {
  ArrayUtils,
  BlendMode,
  ColorRgba8,
  decodePng,
  decodeTga,
  Draw,
  encodePng,
  MemoryImage,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

/**
 * Test suite for the Draw module.
 */
describe('Draw', () => {
  /**
   * Test case for the compositeImage function.
   */
  test('compositeImage', () => {
    // Create two MemoryImage instances with specified dimensions
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });
    const i1 = new MemoryImage({
      width: 256,
      height: 256,
      numChannels: 4,
    });

    // Clear the first image with a solid red color
    i0.clear(new ColorRgba8(255, 0, 0, 255));

    // Modify the second image's pixels
    for (const p of i1) {
      p.r = p.x;
      p.g = p.y;
      p.a = p.y;
    }

    // Composite the second image onto the first image at specified positions and sizes
    Draw.compositeImage({
      dst: i0,
      src: i1,
      dstX: 50,
      dstY: 50,
      dstW: 100,
      dstH: 100,
    });

    Draw.compositeImage({
      dst: i0,
      src: i1,
      dstX: 100,
      dstY: 100,
      dstW: 100,
      dstH: 100,
    });

    // Encode the resulting image to PNG format and write to file
    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'compositeImage_1.png',
      output
    );

    // Read and decode a TGA image file
    const fgBytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.tga,
      'globe.tga'
    );
    let fg = decodeTga({
      data: fgBytes,
    });
    expect(fg).toBeDefined();
    if (fg === undefined) {
      return;
    }

    // Convert the TGA image to have 4 channels
    fg = fg.convert({
      numChannels: 4,
    });

    // Modify the alpha channel of the TGA image
    for (const p of fg) {
      if (p.r === 0 && p.g === 0 && p.b === 0) {
        p.a = 0;
      }
    }

    // Read and decode a PNG image file
    const origBgBytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const origBg = decodePng({
      data: origBgBytes,
    });
    expect(origBg).toBeDefined();
    if (origBg === undefined) {
      return;
    }

    // Composite the TGA image onto the PNG image at specified positions and sizes
    {
      const bg = origBg.clone();
      Draw.compositeImage({
        dst: bg,
        src: fg,
        dstX: 50,
        dstY: 50,
      });
      const output = encodePng({
        image: bg,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.draw,
        'compositeImage.png',
        output
      );
    }

    {
      const bg = origBg.clone();
      Draw.compositeImage({
        dst: bg,
        src: fg,
        dstX: 50,
        dstY: 50,
        dstW: 200,
        dstH: 200,
      });
      const output = encodePng({
        image: bg,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.draw,
        'compositeImage_scaled.png',
        output
      );
    }

    // Composite the TGA image onto the PNG image using different blend modes
    for (const blend of ArrayUtils.getNumEnumValues(BlendMode)) {
      const bg = origBg.clone();
      Draw.compositeImage({
        dst: bg,
        src: fg,
        dstX: 50,
        dstY: 50,
        blend: blend as BlendMode,
      });
      const output = encodePng({
        image: bg,
      });
      TestUtils.writeToFile(
        TestFolder.output,
        TestSection.draw,
        `compositeImage_${BlendMode[blend]}.png`,
        output
      );
    }
  });
});
