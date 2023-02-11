/** @format */

import { ColorInt8 } from '../../src';

describe('Color', () => {
  test('ColorInt8', () => {
    const c0 = new ColorInt8(0);
    expect(c0.length).toBe(0);
    c0.r = 5;
    expect(c0.r).toBe(0);
    expect(c0.g).toBe(0);
    expect(c0.b).toBe(0);
    expect(c0.a).toBe(0);
  });
});
