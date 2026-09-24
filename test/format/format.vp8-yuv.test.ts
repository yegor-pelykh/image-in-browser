/** @format */

import { describe, expect, it } from 'vitest';
import { ColorRgb8, MemoryImage } from '../../src/index';
import { importYuv } from '../../src/formats/webp/vp8-yuv';

describe('vp8-yuv', () => {
  it('converts a small RGB image to YUV 4:2:0', () => {
    const img = new MemoryImage({ width: 4, height: 4 });
    img.setPixel(0, 0, new ColorRgb8(255, 0, 0));
    img.setPixel(1, 1, new ColorRgb8(0, 255, 0));

    const yuv = importYuv(img);

    expect(yuv.width).toBe(4);
    expect(yuv.height).toBe(4);
    expect(yuv.uvWidth).toBe(2);
    expect(yuv.uvHeight).toBe(2);
    expect(yuv.y.length).toBe(16);
    expect(yuv.u.length).toBe(4);
    expect(yuv.v.length).toBe(4);
    expect(yuv.a).toBeUndefined();
  });
});
