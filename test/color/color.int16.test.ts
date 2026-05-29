/** @format */

import { describe, expect, test } from 'vitest';
import { TestUtils } from '../_utils/test-utils';
import { ColorInt16 } from '../../src';

/**
 * Color immutability tests — int16 format.
 */
describe('Color', () => {
  /**
   * ColorInt16 with length 0 is immutable; setting r has no effect and all channels remain 0.
   */
  test('ColorInt16', () => {
    const c0 = new ColorInt16(0);
    expect(c0.length).toBe(0);
    c0.r = 5;
    expect(c0.r).toBe(0);
    expect(c0.g).toBe(0);
    expect(c0.b).toBe(0);
    expect(c0.a).toBe(0);
  });
});
