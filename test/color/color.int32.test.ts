/** @format */

import { describe, expect, test } from 'vitest';
import { TestUtils } from '../_utils/test-utils';
import { ColorInt32 } from '../../src';

/**
 * Color immutability tests — int32 format.
 */
describe('Color', () => {
  /**
   * ColorInt32 with length 0 is immutable; setting r has no effect and all channels remain 0.
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
