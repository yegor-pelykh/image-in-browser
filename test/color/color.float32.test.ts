/** @format */

import { ColorFloat32 } from '../../src';

describe('Color', () => {
  test('ColorFloat32', () => {
    const c0 = new ColorFloat32(0);
    expect(c0.length).toBe(0);
    c0.r = 5;
    expect(c0.r).toBe(0);
    expect(c0.g).toBe(0);
    expect(c0.b).toBe(0);
    expect(c0.a).toBe(0);
  });
});
