/** @format */

import { describe, expect, test } from 'vitest';
import { ColorRgba8, Interpolation, MemoryImage, Transform } from '../../src';

describe('Transform bug fixes', () => {
  for (const interp of [Interpolation.nearest, Interpolation.linear]) {
    const name =
      `copyResizeCropSquare with a radius keeps all frames (${interp})`;
    test(name, () => {
      const anim = new MemoryImage({ width: 20, height: 10, numChannels: 4 });
      anim.clear(new ColorRgba8(255, 0, 0, 255));
      const f2 = new MemoryImage({ width: 20, height: 10, numChannels: 4 });
      f2.clear(new ColorRgba8(0, 255, 0, 255));
      anim.addFrame(f2);
      const f3 = new MemoryImage({ width: 20, height: 10, numChannels: 4 });
      f3.clear(new ColorRgba8(0, 0, 255, 255));
      anim.addFrame(f3);
      const dst = Transform.copyResizeCropSquare({
        image: anim,
        size: 8,
        radius: 2,
        interpolation: interp,
      });
      expect(dst.numFrames).toBe(3);
      expect(dst.frames[0].getPixel(4, 4).r).toBe(255);
      expect(dst.frames[1].getPixel(4, 4).g).toBe(255);
      expect(dst.frames[2].getPixel(4, 4).b).toBe(255);
    });
  }
});
