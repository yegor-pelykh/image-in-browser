/** @format */

import { ColorUint1 } from '../../src';

describe('Color', () => {
  test('ColorUint1', () => {
    const c0 = new ColorUint1(0);
    expect(c0.length).toBe(0);
    expect(c0.r).toBe(0);
    expect(c0.g).toBe(0);
    expect(c0.b).toBe(0);
    expect(c0.a).toBe(0);

    const c1 = ColorUint1.rgba(1, 0, 1, 1);
    expect(c1.length).toBe(4);
    expect(c1.r).toBe(1);
    expect(c1.g).toBe(0);
    expect(c1.b).toBe(1);
    expect(c1.a).toBe(1);
  });
});
