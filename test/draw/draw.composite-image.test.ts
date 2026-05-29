/** @format */

import { describe, expect, test } from 'vitest';
import {
  ArrayUtils,
  BlendMode,
  ColorRgb8,
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
import { solidImage } from '../_utils/test-helpers.js';

/**
 * Draw compositeImage operations.
 */
describe('Draw', () => {
  /**
   * Composites a 512×512 source onto a 256×256 destination at offset (50,50) with direct blend.
   */
  test('compositeImage large foreground', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });
    const i1 = new MemoryImage({
      width: 512,
      height: 512,
      numChannels: 4,
    });
    i0.clear(new ColorRgba8(255, 0, 0, 255));
    for (const p of i1) {
      p.r = p.x;
      p.g = p.y;
      p.a = p.y;
    }
    Draw.compositeImage({
      dst: i0,
      src: i1,
      dstX: 50,
      dstY: 50,
      blend: BlendMode.direct,
    });
  });

  /**
   * Composited region exactly matches the source color.
   */
  test('compositeImage direct: region becomes source color', () => {
    const dst = solidImage(32, 32, new ColorRgb8(0, 0, 255));
    const src = solidImage(8, 8, new ColorRgb8(255, 0, 0));

    Draw.compositeImage({
      dst,
      src,
      dstX: 4,
      dstY: 4,
      blend: BlendMode.direct,
    });

    for (let y = 4; y < 12; y++) {
      for (let x = 4; x < 12; x++) {
        const p = dst.getPixel(x, y);
        expect(p.r).toBe(255);
        expect(p.g).toBe(0);
        expect(p.b).toBe(0);
      }
    }

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 32; x++) {
        const p = dst.getPixel(x, y);
        expect(p.b).toBe(255);
        expect(p.r).toBe(0);
      }
    }
  });

  /**
   * Pixels outside the destination rectangle remain untouched.
   */
  test('compositeImage direct: pixels outside dst rect are unchanged', () => {
    const dst = solidImage(20, 20, new ColorRgb8(255, 255, 255));
    const src = solidImage(4, 4, new ColorRgb8(0, 0, 0));

    Draw.compositeImage({
      dst,
      src,
      dstX: 8,
      dstY: 8,
      blend: BlendMode.direct,
    });

    const corner = dst.getPixel(0, 0);
    expect(corner.r).toBe(255);
    expect(corner.g).toBe(255);
    expect(corner.b).toBe(255);

    const center = dst.getPixel(8, 8);
    expect(center.r).toBe(0);
    expect(center.g).toBe(0);
    expect(center.b).toBe(0);
  });

  /**
   * Composites synthesized and file-based TGA/PNG images with all blend modes.
   */
  test('compositeImage', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });
    const i1 = new MemoryImage({
      width: 256,
      height: 256,
      numChannels: 4,
    });

    i0.clear(new ColorRgba8(255, 0, 0, 255));

    for (const p of i1) {
      p.r = p.x;
      p.g = p.y;
      p.a = p.y;
    }

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

    const output = encodePng({
      image: i0,
    });

    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'compositeImage_1.png',
      output
    );

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

    fg = fg.convert({
      numChannels: 4,
    });

    for (const p of fg) {
      if (p.r === 0 && p.g === 0 && p.b === 0) {
        p.a = 0;
      }
    }

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

  /**
   * Composites a foreground PNG onto a background PNG using a mask image.
   */
  test('compositeImage2', () => {
    const maskBytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'logo.png'
    );
    const mask = decodePng({
      data: maskBytes,
    });
    expect(mask).toBeDefined();
    if (mask === undefined) {
      return;
    }

    const fgBytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'colors.png'
    );
    const fg = decodePng({
      data: fgBytes,
    });
    expect(fg).toBeDefined();
    if (fg === undefined) {
      return;
    }

    const bgBytes = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const bg = decodePng({
      data: bgBytes,
    });
    expect(bg).toBeDefined();
    if (bg === undefined) {
      return;
    }

    Draw.compositeImage({
      dst: bg,
      src: fg,
      mask: mask,
    });

    const output = encodePng({
      image: bg,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      `compositeImage2.png`,
      output
    );
  });
});
