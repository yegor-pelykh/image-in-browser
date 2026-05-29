/** @format */

import { describe, expect, test } from 'vitest';
import { TestUtils } from '../_utils/test-utils';
import { ColorUint4 } from '../../src';

/**
 * Color immutability tests — uint4 format.
 */
describe('Color', () => {
  /**
   * ColorUint4 with length 0 is immutable; rgba(15,1,15,8) yields correct per-channel values.
   */
  test('ColorUint4', () => {
    const c0 = new ColorUint4(0);
    expect(c0.length).toBe(0);
    c0.r = 5;
    expect(c0.r).toBe(0);
    expect(c0.g).toBe(0);
    expect(c0.b).toBe(0);
    expect(c0.a).toBe(0);

    const c1 = ColorUint4.rgba(15, 1, 15, 8);
    expect(c1.length).toBe(4);
    expect(c1.r).toBe(15);
    expect(c1.g).toBe(1);
    expect(c1.b).toBe(15);
    expect(c1.a).toBe(8);
  });
});
