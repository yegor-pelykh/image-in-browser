/** @format */

import { describe, expect, test } from 'vitest';
import { TestUtils } from '../_utils/test-utils';
import { ColorInt32 } from '../../src';

/**
 * Test suite for the Color class.
 */
describe('Color', TestUtils.testOptions, () => {
  /**
   * Test case for the ColorInt32 class.
   */
  test('ColorInt32', () => {
    const c0 = new ColorInt32(0);
    expect(c0.length).toBe(0);
    c0.r = 5;
    expect(c0.r).toBe(0);
    expect(c0.g).toBe(0);
    expect(c0.b).toBe(0);
    expect(c0.a).toBe(0);
  });
});
