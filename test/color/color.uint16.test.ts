/** @format */

import { describe, expect, test } from 'vitest';
import { ColorUint16 } from '../../src';

/**
 * Test suite for Color related functionalities.
 */
describe('Color', () => {
  /**
   * Test case for ColorUint16 class.
   */
  test('ColorUint16', () => {
    const c0 = new ColorUint16(0);
    expect(c0.length).toBe(0);
    c0.r = 5;
    expect(c0.r).toBe(0);
    expect(c0.g).toBe(0);
    expect(c0.b).toBe(0);
    expect(c0.a).toBe(0);
  });
});
