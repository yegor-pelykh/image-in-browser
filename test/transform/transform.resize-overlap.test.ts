/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  ColorUint16,
  Format,
  Interpolation,
  MemoryImage,
  Transform,
} from '../../src';

/**
 * Builds an 8x8 gradient pattern, optionally palette-based.
 */
function pattern(opt?: { palette?: boolean; blue?: number }): MemoryImage {
  const palette = opt?.palette ?? false;
  const blue = opt?.blue ?? 40;
  const image = new MemoryImage({ width: 8, height: 8, withPalette: palette });
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (palette) {
        const index = y * 8 + x;
        image.palette!.setRgb(index, 10 + x * 20, 10 + y * 20, blue);
        image.setPixelIndex(x, y, index);
      } else {
        image.setPixelRgb(x, y, 10 + x * 20, 10 + y * 20, blue);
      }
    }
  }
  return image;
}

/**
 * Asserts that a nearest-neighbor resized image matches the source pattern.
 */
function expectNearest(
  image: MemoryImage,
  width: number,
  height: number,
  blue = 40
): void {
  expect(image.width).toBe(width);
  expect(image.height).toBe(height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = image.getPixel(x, y);
      expect([pixel.r, pixel.g, pixel.b], `output pixel (${x}, ${y})`).toEqual([
        10 + Math.trunc((x * 8) / width) * 20,
        10 + Math.trunc((y * 8) / height) * 20,
        blue,
      ]);
    }
  }
}

/**
 * Compares two byte arrays element by element.
 */
function expectBytesEqual(
  actual: Uint8Array,
  expected: Uint8Array,
  reason?: string
): void {
  expect(actual.length, reason).toBe(expected.length);
  expect(Array.from(actual), reason).toEqual(Array.from(expected));
}

/**
 * Transform resize overlap operations.
 */
describe('Transform resize overlap', () => {
  for (const [sizeW, sizeH] of [
    [16, 4],
    [4, 16],
    [16, 3],
    [3, 16],
  ] as const) {
    for (const palette of [false, true]) {
      test(`${sizeW}x${sizeH}, palette=${palette}`, () => {
        const src = pattern({ palette: palette });
        const data = src.data;
        const dst = Transform.resize({
          image: src,
          width: sizeW,
          height: sizeH,
        });
        expectNearest(dst, sizeW, sizeH);
        expect(dst.hasPalette).toBe(palette);
        expect(dst === src).toBe(!palette);
        if (palette) {
          expectNearest(src, 8, 8);
        } else {
          expect(dst.data).toBe(data);
        }
      });
    }
  }

  test('preserves every animation frame and its duration', () => {
    const src = pattern();
    src.loopCount = 3;
    src.frameDuration = 100;
    const frame = pattern({ blue: 200 });
    frame.frameDuration = 300;
    src.addFrame(frame);
    const dst = Transform.resize({ image: src, width: 16, height: 4 });
    expect(dst.numFrames).toBe(2);
    expect(dst.loopCount).toBe(3);
    expect(dst.frames.map((f) => f.frameDuration)).toEqual([100, 300]);
    expectNearest(dst.frames[0], 16, 4);
    expectNearest(dst.frames[1], 16, 4, 200);
  });

  for (const interpolation of [
    Interpolation.nearest,
    Interpolation.linear,
    Interpolation.cubic,
    Interpolation.average,
  ]) {
    test(`preserves constant color with ${Interpolation[interpolation]}`, () => {
      const src = new MemoryImage({ width: 8, height: 8 });
      src.clear(new ColorRgb8(40, 80, 120));
      const dst = Transform.resize({
        image: src,
        width: 16,
        height: 3,
        interpolation: interpolation,
      });
      expect([dst.width, dst.height]).toEqual([16, 3]);
      for (const pixel of dst) {
        expect([pixel.r, pixel.g, pixel.b]).toEqual([40, 80, 120]);
      }
      expect([src.width, src.height]).toEqual(
        interpolation === Interpolation.nearest ? [16, 3] : [8, 8]
      );
    });
  }

  test('mixed-axis nearest reuses buffers and matches both axis mappings', () => {
    let cases = 0;
    for (let sw = 2; sw <= 10; sw++) {
      for (let sh = 2; sh <= 10; sh++) {
        for (let w = 1; w <= 20; w++) {
          for (let h = 1; h <= 20; h++) {
            if ((w <= sw && h <= sh) || w * h > sw * sh) {
              continue;
            }
            for (const channels of [1, 3, 4]) {
              const src = new MemoryImage({
                width: sw,
                height: sh,
                numChannels: channels,
              });
              for (const p of src) {
                p.setRgba(
                  (p.x * 71 + p.y * 19) % 256,
                  (p.x * 13 + p.y * 97) % 256,
                  (p.x * 41 + p.y * 37) % 256,
                  (p.x * 29 + p.y * 53) % 256
                );
              }
              const expected = Transform.copyResize({
                image: src,
                width: w,
                height: h,
              });
              const original = src.clone();
              const data = src.data;
              const dst = Transform.resize({ image: src, width: w, height: h });
              expect(dst === src).toBe(true);
              expect(dst.data).toBe(data);
              expectBytesEqual(
                dst.getBytes().subarray(0, w * h * channels),
                expected.getBytes(),
                `${sw} x ${sh} -> ${w} x ${h}, channels=${channels}`
              );
              for (const p of dst) {
                const q = original.getPixel(
                  Math.trunc((p.x * sw) / w),
                  Math.trunc((p.y * sh) / h)
                );
                expect([p.r, p.g, p.b, p.a]).toEqual([q.r, q.g, q.b, q.a]);
              }
              cases++;
            }
          }
        }
      }
    }
    expect(cases).toBeGreaterThan(1000);
  });

  test('mixed-axis nearest keeps copy fallback outside buffer scope', () => {
    for (const src of [
      new MemoryImage({ width: 8, height: 8, numChannels: 2 }),
      new MemoryImage({ width: 8, height: 8, format: Format.uint16 }),
      pattern({ palette: true }),
    ]) {
      const expected = Transform.copyResize({
        image: src,
        width: 16,
        height: 4,
      });
      const dst = Transform.resize({ image: src, width: 16, height: 4 });
      expect(dst === src).toBe(false);
      expectBytesEqual(dst.getBytes(), expected.getBytes());
      expect([src.width, src.height]).toEqual([8, 8]);
    }
    for (const aspect of [false, true]) {
      const src = pattern();
      const h = aspect ? 4 : 5;
      const expected = Transform.copyResize({
        image: src,
        width: 16,
        height: h,
        maintainAspect: aspect,
      });
      const dst = Transform.resize({
        image: src,
        width: 16,
        height: h,
        maintainAspect: aspect,
      });
      expect(dst === src).toBe(false);
      expectBytesEqual(dst.getBytes(), expected.getBytes());
      expectNearest(src, 8, 8);
    }
  });

  for (const sharedData of [false, true]) {
    for (const kind of ['mixed', 'cubic', 'letterbox']) {
      test(`${kind} falls back for shared data=${sharedData}`, () => {
        const src = pattern();
        const b = pattern({ blue: 80 });
        const c = pattern({ blue: 120 });
        const repeated = sharedData ? pattern() : b;
        if (sharedData) {
          repeated.data = b.data;
        }
        src.addFrame(b);
        src.addFrame(c);
        src.addFrame(repeated);
        const width = kind === 'mixed' ? 16 : kind === 'cubic' ? 7 : 8;
        const height = kind === 'cubic' ? 7 : 4;
        const interpolation =
          kind === 'cubic' ? Interpolation.cubic : Interpolation.nearest;
        const maintainAspect = kind === 'letterbox';
        const expected = Transform.copyResize({
          image: src,
          width: width,
          height: height,
          maintainAspect: maintainAspect,
          interpolation: interpolation,
        });
        const before = src.clone();
        const dst = Transform.resize({
          image: src,
          width: width,
          height: height,
          maintainAspect: maintainAspect,
          interpolation: interpolation,
        });
        expect(dst === src).toBe(false);
        for (let i = 0; i < 4; i++) {
          expectBytesEqual(
            dst.frames[i].getBytes(),
            expected.frames[i].getBytes()
          );
          expectBytesEqual(
            src.frames[i].getBytes(),
            before.frames[i].getBytes()
          );
          expect([src.frames[i].width, src.frames[i].height]).toEqual([8, 8]);
        }
      });
    }
  }

  test('cubic aspect without padding reuses the buffer', () => {
    const src = pattern();
    const data = src.data;
    const expected = Transform.copyResize({
      image: src,
      width: 7,
      height: 7,
      maintainAspect: true,
      interpolation: Interpolation.cubic,
    });
    const dst = Transform.resize({
      image: src,
      width: 7,
      height: 7,
      maintainAspect: true,
      interpolation: Interpolation.cubic,
    });
    expect(dst === src).toBe(true);
    expect(dst.data).toBe(data);
    expectBytesEqual(
      dst.getBytes().subarray(0, 7 * 7 * 3),
      expected.getBytes()
    );
  });

  test('cubic zero offset still falls back for trailing padding', () => {
    const src = new MemoryImage({ width: 8, height: 7 });
    src.clear(new ColorRgb8(30, 60, 90));
    // Content is 7x6 at offset (0, 0); the final row is still padding.
    const expected = Transform.copyResize({
      image: src,
      width: 7,
      height: 7,
      maintainAspect: true,
      interpolation: Interpolation.cubic,
    });
    const dst = Transform.resize({
      image: src,
      width: 7,
      height: 7,
      maintainAspect: true,
      interpolation: Interpolation.cubic,
    });
    expect(dst === src).toBe(false);
    expectBytesEqual(dst.getBytes(), expected.getBytes());
  });

  test('same size and pure downscale retain the existing in-place path', () => {
    const src = pattern();
    expect(Transform.resize({ image: src, width: 8, height: 8 })).toBe(src);
    const dst = Transform.resize({ image: src, width: 4, height: 4 });
    expect(dst === src).toBe(true);
    expectNearest(dst, 4, 4);
  });

  test('cubic downscale reads every sample from the original image', () => {
    const src = pattern();
    const originalData = src.data;
    const expected = new MemoryImage({ width: 7, height: 7 });
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        expected.setPixel(x, y, src.getPixelCubic(x * (8 / 7), y * (8 / 7)));
      }
    }
    const dst = Transform.resize({
      image: src,
      width: 7,
      height: 7,
      interpolation: Interpolation.cubic,
    });
    expectBytesEqual(
      dst.getBytes().subarray(0, 7 * 7 * 3),
      expected.getBytes()
    );
    expect(dst === src).toBe(true);
    expect(dst.data).toBe(originalData);
    expect([src.width, src.height]).toEqual([7, 7]);
  });

  test('buffered cubic matches copyResize across small dimensions', () => {
    for (let sw = 1; sw <= 10; sw++) {
      for (let sh = 1; sh <= 10; sh++) {
        for (let w = 1; w <= sw; w++) {
          for (let h = 1; h <= sh; h++) {
            for (let channels = 1; channels <= 4; channels++) {
              const src = new MemoryImage({
                width: sw,
                height: sh,
                numChannels: channels,
              });
              for (const p of src) {
                p.setRgba(
                  (p.x * 71 + p.y * 19) % 256,
                  (p.x * 13 + p.y * 97) % 256,
                  (p.x * 41 + p.y * 37) % 256,
                  (p.x * 29 + p.y * 53) % 256
                );
              }
              const expected = Transform.copyResize({
                image: src,
                width: w,
                height: h,
                interpolation: Interpolation.cubic,
              });
              const data = src.data;
              const dst = Transform.resize({
                image: src,
                width: w,
                height: h,
                interpolation: Interpolation.cubic,
              });
              expectBytesEqual(
                dst.getBytes().subarray(0, w * h * channels),
                expected.getBytes(),
                `${sw} x ${sh} -> ${w} x ${h}, channels=${channels}`
              );
              expect(dst === src).toBe(true);
              expect(dst.data).toBe(data);
            }
          }
        }
      }
    }
  });

  test('buffered cubic preserves animation and uses one buffer per frame', () => {
    const src = pattern();
    src.loopCount = 3;
    src.frameDuration = 100;
    const frame = pattern({ blue: 200 });
    frame.frameDuration = 300;
    src.addFrame(frame);
    const expected = Transform.copyResize({
      image: src,
      width: 7,
      height: 7,
      interpolation: Interpolation.cubic,
    });
    const data = src.frames.map((f) => f.data);
    const dst = Transform.resize({
      image: src,
      width: 7,
      height: 7,
      interpolation: Interpolation.cubic,
    });
    expect(src === dst).toBe(true);
    expect(dst.loopCount).toBe(3);
    expect(dst.frames.map((f) => f.frameDuration)).toEqual([100, 300]);
    for (let i = 0; i < 2; i++) {
      expect(dst.frames[i].data).toBe(data[i]);
      expectBytesEqual(
        dst.frames[i].getBytes().subarray(0, 7 * 7 * 3),
        expected.frames[i].getBytes()
      );
    }
  });

  test('cubic keeps copy fallback for aspect handling and non-uint8', () => {
    for (const src of [
      pattern(),
      (() => {
        const i = new MemoryImage({
          width: 8,
          height: 8,
          format: Format.uint16,
        });
        i.clear(ColorUint16.rgb(1000, 2000, 3000));
        return i;
      })(),
    ]) {
      const aspect = src.format === Format.uint8;
      const expected = Transform.copyResize({
        image: src,
        width: 7,
        height: 5,
        maintainAspect: aspect,
        interpolation: Interpolation.cubic,
      });
      const dst = Transform.resize({
        image: src,
        width: 7,
        height: 5,
        maintainAspect: aspect,
        interpolation: Interpolation.cubic,
      });
      expect(dst === src).toBe(false);
      expect([src.width, src.height]).toEqual([8, 8]);
      expectBytesEqual(dst.getBytes(), expected.getBytes());
    }
  });

  for (const [sizeW, sizeH] of [
    [8, 4],
    [4, 8],
  ] as const) {
    for (const palette of [false, true]) {
      test(`nearest letterbox ${sizeW}x${sizeH}, palette=${palette}`, () => {
        const src = pattern({ palette: palette });
        const originalData = src.data;
        const dst = Transform.resize({
          image: src,
          width: sizeW,
          height: sizeH,
          maintainAspect: true,
        });
        const offsetX = Math.trunc((sizeW - 4) / 2);
        const offsetY = Math.trunc((sizeH - 4) / 2);
        for (let y = 0; y < 4; y++) {
          for (let x = 0; x < 4; x++) {
            const p = dst.getPixel(offsetX + x, offsetY + y);
            expect([p.r, p.g, p.b]).toEqual([10 + x * 40, 10 + y * 40, 40]);
          }
        }
        expect([dst.width, dst.height]).toEqual([sizeW, sizeH]);
        expect(dst.hasPalette).toBe(palette);
        expect(dst === src).toBe(!palette);
        if (palette) {
          expectNearest(src, 8, 8);
        } else {
          expect(dst.data).toBe(originalData);
        }
      });
    }
  }

  test('in-place nearest letterbox matches all pixels including padding', () => {
    let cases = 0;
    for (let sw = 2; sw <= 12; sw++) {
      for (let sh = 2; sh <= 12; sh++) {
        for (let w = 2; w <= sw; w++) {
          for (let h = 2; h <= sh; h++) {
            let cw = w;
            let ch = Math.trunc(w * (sh / sw));
            if (ch > h) {
              ch = h;
              cw = Math.trunc(h * (sw / sh));
            }
            if (
              cw === 0 ||
              ch === 0 ||
              (Math.trunc((w - cw) / 2) === 0 && Math.trunc((h - ch) / 2) === 0)
            ) {
              continue;
            }
            for (const channels of [1, 3, 4]) {
              const src = new MemoryImage({
                width: sw,
                height: sh,
                numChannels: channels,
              });
              for (const p of src) {
                p.setRgba(
                  (p.x * 71 + p.y * 19) % 256,
                  (p.x * 13 + p.y * 97) % 256,
                  (p.x * 41 + p.y * 37) % 256,
                  (p.x * 29 + p.y * 53) % 256
                );
              }
              const expected = Transform.copyResize({
                image: src,
                width: w,
                height: h,
                maintainAspect: true,
              });
              const data = src.data;
              const dst = Transform.resize({
                image: src,
                width: w,
                height: h,
                maintainAspect: true,
              });
              expectBytesEqual(
                dst.getBytes().subarray(0, w * h * channels),
                expected.getBytes(),
                `${sw} x ${sh} -> ${w} x ${h}, channels=${channels}`
              );
              expect(dst === src).toBe(true);
              expect(dst.data).toBe(data);
              cases++;
            }
          }
        }
      }
    }
    expect(cases).toBeGreaterThan(1000);
  });

  test('nearest letterbox preserves animation and frame buffers', () => {
    const src = pattern();
    src.loopCount = 3;
    src.frameDuration = 100;
    const frame = pattern({ blue: 200 });
    frame.frameDuration = 300;
    src.addFrame(frame);
    const expected = Transform.copyResize({
      image: src,
      width: 8,
      height: 4,
      maintainAspect: true,
    });
    const data = src.frames.map((f) => f.data);
    const dst = Transform.resize({
      image: src,
      width: 8,
      height: 4,
      maintainAspect: true,
    });
    expect(src === dst).toBe(true);
    expect(dst.loopCount).toBe(3);
    expect(dst.frames.map((f) => f.frameDuration)).toEqual([100, 300]);
    for (let i = 0; i < 2; i++) {
      expect(dst.frames[i].data).toBe(data[i]);
      expectBytesEqual(
        dst.frames[i].getBytes().subarray(0, 8 * 4 * 3),
        expected.frames[i].getBytes()
      );
    }
  });

  test('nearest letterbox keeps background and format fallbacks', () => {
    const srcs = [
      pattern(),
      (() => {
        const i = new MemoryImage({ width: 8, height: 8, numChannels: 2 });
        i.clear(new ColorRgb8(40, 80, 120));
        return i;
      })(),
      (() => {
        const i = new MemoryImage({
          width: 8,
          height: 8,
          format: Format.uint16,
        });
        i.clear(ColorUint16.rgb(1000, 2000, 3000));
        return i;
      })(),
    ];
    for (const src of srcs) {
      const bg =
        src.format === Format.uint8 && src.numChannels === 3
          ? new ColorRgb8(3, 5, 7)
          : undefined;
      const expected = Transform.copyResize({
        image: src,
        width: 8,
        height: 4,
        maintainAspect: true,
        backgroundColor: bg,
      });
      const dst = Transform.resize({
        image: src,
        width: 8,
        height: 4,
        maintainAspect: true,
        backgroundColor: bg,
      });
      expect(dst === src).toBe(false);
      expect([src.width, src.height]).toEqual([8, 8]);
      expectBytesEqual(dst.getBytes(), expected.getBytes());
    }
  });

  for (const interpolation of [
    Interpolation.nearest,
    Interpolation.linear,
    Interpolation.cubic,
    Interpolation.average,
  ]) {
    test(`mixed axes match copyResize with ${Interpolation[interpolation]}`, () => {
      const src = pattern();
      const expected = Transform.copyResize({
        image: src,
        width: 16,
        height: 3,
        interpolation: interpolation,
      });
      const dst = Transform.resize({
        image: src,
        width: 16,
        height: 3,
        interpolation: interpolation,
      });
      expectBytesEqual(
        dst.getBytes().subarray(0, 16 * 3 * 3),
        expected.getBytes()
      );
      if (interpolation !== Interpolation.nearest) {
        expectNearest(src, 8, 8);
      }
    });
  }

  test('mixed axes preserve letterbox content and background', () => {
    const src = pattern();
    const dst = Transform.resize({
      image: src,
      width: 16,
      height: 4,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(3, 5, 7),
    });
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 16; x++) {
        const p = dst.getPixel(x, y);
        expect([p.r, p.g, p.b]).toEqual(
          x >= 6 && x < 10 ? [10 + (x - 6) * 40, 10 + y * 40, 40] : [3, 5, 7]
        );
      }
    }
    expectNearest(src, 8, 8);
  });

  // (source width, source height, width, height): leading offsets and
  // trailing-only padding on each axis.
  for (const [sw, sh, dw, dh] of [
    [8, 8, 8, 4],
    [8, 8, 4, 8],
    [8, 7, 7, 7],
    [7, 8, 7, 7],
  ] as const) {
    for (const interpolation of [
      Interpolation.nearest,
      Interpolation.linear,
      Interpolation.cubic,
      Interpolation.average,
    ]) {
      for (const background of [undefined, new ColorRgb8(1, 2, 3)]) {
        test(
          `letterbox ${sw}x${sh} -> ${dw}x${dh} matches copyResize` +
            ` with ${Interpolation[interpolation]}, background=${background !== undefined}`,
          () => {
            const src = new MemoryImage({ width: sw, height: sh });
            for (const p of src) {
              p.setRgb(10 + p.x * 20, 10 + p.y * 20, 40 + p.x * p.y);
            }
            const expected = Transform.copyResize({
              image: src,
              width: dw,
              height: dh,
              maintainAspect: true,
              backgroundColor: background,
              interpolation: interpolation,
            });
            const dst = Transform.resize({
              image: src,
              width: dw,
              height: dh,
              maintainAspect: true,
              backgroundColor: background,
              interpolation: interpolation,
            });
            expect([dst.width, dst.height]).toEqual([dw, dh]);
            expectBytesEqual(
              dst.getBytes().subarray(0, dw * dh * 3),
              expected.getBytes()
            );
          }
        );
      }
    }
  }
});
