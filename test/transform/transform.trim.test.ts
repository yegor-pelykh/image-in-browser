/** @format */

import { describe, expect, test } from 'vitest';
import { decodePng, encodePng, Transform, TrimMode } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Transform', () => {
  test('trim', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'trim.png'
    );
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    let trimmed = Transform.trim({
      image: img,
    });

    let output = encodePng({
      image: trimmed,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'trim.png',
      output
    );

    expect(trimmed.width).toBe(64);
    expect(trimmed.height).toBe(56);

    trimmed = Transform.trim({
      image: img,
      mode: TrimMode.transparent,
    });

    output = encodePng({
      image: trimmed,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'trim_transparent.png',
      output
    );

    expect(trimmed.width).toBe(img.width);
    expect(trimmed.height).toBe(img.height);

    trimmed = Transform.trim({
      image: img,
      mode: TrimMode.bottomRightColor,
    });

    output = encodePng({
      image: trimmed,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'trim_bottomRightColor.png',
      output
    );

    expect(trimmed.width).toBe(64);
    expect(trimmed.height).toBe(56);
  });
});
