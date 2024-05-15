/** @format */

import { describe, expect, test } from 'vitest';
import {
  ColorRgb8,
  decodePng,
  Draw,
  encodePng,
  MemoryImage,
  Transform,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Transform', () => {
  test('copyResizeCropSquare', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const i0 = Transform.copyResizeCropSquare({
      image: img,
      size: 64,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResizeCropSquare.png',
      output
    );
  });

  test('copyResizeCropSquare rounded', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    let img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    img = img.convert({
      numChannels: 4,
    });

    img = Transform.copyResizeCropSquare({
      image: img,
      size: 64,
      radius: 20,
    });

    let bgimg = new MemoryImage({
      width: 64,
      height: 64,
    });
    bgimg.clear(new ColorRgb8(255, 255, 255));

    bgimg = Draw.compositeImage({
      dst: bgimg,
      src: img,
    });

    const output = encodePng({
      image: bgimg,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResizeCropSquare_rounded.png',
      output
    );
  });

  test('copyResizeCropSquare rounded alpha', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_24.png'
    );
    let img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    img = img.convert({
      numChannels: 4,
    });

    img = Transform.copyResizeCropSquare({
      image: img,
      size: 300,
      radius: 20,
    });

    const output = encodePng({
      image: img,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResizeCropSquare_rounded_alpha.png',
      output
    );
  });
});
