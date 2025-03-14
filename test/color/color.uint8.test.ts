/** @format */

import { describe, expect, test } from 'vitest';
import { TestUtils } from '../_utils/test-utils';
import { ColorUint8 } from '../../src';

/**
 * Test suite for the Color class.
 */
describe('Color', TestUtils.testOptions, () => {
  /**
   * Test cases for the ColorUint8 class.
   */
  test('ColorUint8', () => {
    const c0 = new ColorUint8(0);
    expect(c0.length).toBe(0);
    c0.r = 5;
    expect(c0.r).toBe(0);
    expect(c0.g).toBe(0);
    expect(c0.b).toBe(0);
    expect(c0.a).toBe(255);

    const c1 = ColorUint8.rgb(5, 12, 230);
    expect(c1.length).toBe(3);
    expect(c1.r).toBe(5);
    expect(c1.g).toBe(12);
    expect(c1.b).toBe(230);
    expect(c1.a).toBe(255);
    c1.g = 10;
    expect(c1.g).toBe(10);

    const c2 = ColorUint8.rgba(5, 12, 230, 240);
    expect(c2.length).toBe(4);
    expect(c2.r).toBe(5);
    expect(c2.g).toBe(12);
    expect(c2.b).toBe(230);
    expect(c2.a).toBe(240);

    c1.set(c2);
    expect(c1.r).toBe(5);
    expect(c1.g).toBe(12);
    expect(c1.b).toBe(230);

    c2.a = 255;
    const a = c2.a / c2.maxChannelValue;
    expect(a).toBe(1);
  });

  /**
   * Test cases for the equality method of the ColorUint8 class.
   */
  test('ColorUint8.equality', () => {
    const ca = ColorUint8.rgba(5, 10, 123, 40);
    const cb = ColorUint8.rgba(3, 10, 123, 40);
    expect(ca.equals(cb)).toBeFalsy();
    expect(!ca.equals(cb)).toBeTruthy();

    cb.r = 5;
    expect(ca.equals(cb)).toBeTruthy();
    expect(!ca.equals(cb)).toBeFalsy();
  });
});
