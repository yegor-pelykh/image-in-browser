/** @format */

import { describe, expect, test } from 'vitest';
import { ColorUint2 } from '../../src';

/**
 * Test suite for the Color class.
 */
describe('Color', () => {
  /**
   * Test case for the ColorUint2 class.
   */
  test('ColorUint2', () => {
    const c0 = new ColorUint2(0);
    expect(c0.length).toBe(0);
    expect(c0.r).toBe(0);
    expect(c0.g).toBe(0);
    expect(c0.b).toBe(0);
    expect(c0.a).toBe(0);

    const c1 = ColorUint2.rgba(2, 1, 3, 2);
    expect(c1.length).toBe(4);
    expect(c1.r).toBe(2);
    expect(c1.g).toBe(1);
    expect(c1.b).toBe(3);
    expect(c1.a).toBe(2);
  });
});
