/** @format */

import {
  ColorRgb8,
  decodePng,
  encodePng,
  Interpolation,
  MemoryImage,
  Transform,
} from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Transform', () => {
  test('copyResize nearest', () => {
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

    const i0 = Transform.copyResize({
      image: img,
      width: 64,
    });

    expect(i0.width).toBe(64);
    expect(i0.height).toBe(40);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_nearest.png',
      output
    );
  });

  test('copyResize average', () => {
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

    const i0 = Transform.copyResize({
      image: img,
      width: 64,
      interpolation: Interpolation.average,
    });

    expect(i0.width).toBe(64);
    expect(i0.height).toBe(40);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_average.png',
      output
    );
  });

  test('copyResize linear', () => {
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

    const i0 = Transform.copyResize({
      image: img,
      width: 64,
      interpolation: Interpolation.linear,
    });

    expect(i0.width).toBe(64);
    expect(i0.height).toBe(40);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_linear.png',
      output
    );
  });

  test('copyResize cubic', () => {
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

    const i0 = Transform.copyResize({
      image: img,
      width: 64,
      interpolation: Interpolation.cubic,
    });

    expect(i0.width).toBe(64);
    expect(i0.height).toBe(40);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_cubic.png',
      output
    );
  });

  test('copyResize maintainAspect', () => {
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

    const i0 = Transform.copyResize({
      image: img,
      width: 640,
      height: 640,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i0.width).toEqual(640);
    expect(i0.height).toEqual(640);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect.png',
      output
    );
  });

  test('copyResize maintainAspect palette', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'buck_8.png'
    );
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const i0 = Transform.copyResize({
      image: img,
      width: 640,
      height: 640,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i0.width).toEqual(640);
    expect(i0.height).toEqual(640);

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_palette.png',
      output
    );
  });

  test('copyResize maintainAspect 2', () => {
    const i0 = new MemoryImage({
      width: 100,
      height: 50,
    });
    i0.clear(new ColorRgb8(255, 0, 0));

    const i1 = Transform.copyResize({
      image: i0,
      width: 200,
      height: 200,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).toEqual(200);
    expect(i1.height).toEqual(200);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_2.png',
      output
    );
  });

  test('copyResize maintainAspect 3', () => {
    const i0 = new MemoryImage({
      width: 50,
      height: 100,
    });
    i0.clear(new ColorRgb8(0, 255, 0));

    const i1 = Transform.copyResize({
      image: i0,
      width: 200,
      height: 200,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).toEqual(200);
    expect(i1.height).toEqual(200);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_3.png',
      output
    );
  });

  test('copyResize maintainAspect 4', () => {
    const i0 = new MemoryImage({
      width: 100,
      height: 50,
    });
    i0.clear(new ColorRgb8(255, 0, 0));

    const i1 = Transform.copyResize({
      image: i0,
      width: 50,
      height: 100,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).toEqual(50);
    expect(i1.height).toEqual(100);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_4.png',
      output
    );
  });

  test('copyResize maintainAspect 5', () => {
    const i0 = new MemoryImage({
      width: 50,
      height: 100,
    });
    i0.clear(new ColorRgb8(0, 255, 0));

    const i1 = Transform.copyResize({
      image: i0,
      width: 100,
      height: 50,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).toEqual(100);
    expect(i1.height).toEqual(50);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_5.png',
      output
    );
  });

  test('copyResize maintainAspect 6', () => {
    const i0 = new MemoryImage({
      width: 50,
      height: 100,
    });
    i0.clear(new ColorRgb8(0, 255, 0));

    const i1 = Transform.copyResize({
      image: i0,
      width: 100,
      height: 500,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).toEqual(100);
    expect(i1.height).toEqual(500);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_6.png',
      output
    );
  });

  test('copyResize maintainAspect 7', () => {
    const i0 = new MemoryImage({
      width: 100,
      height: 50,
    });
    i0.clear(new ColorRgb8(0, 255, 0));

    const i1 = Transform.copyResize({
      image: i0,
      width: 500,
      height: 100,
      maintainAspect: true,
      backgroundColor: new ColorRgb8(0, 0, 255),
    });

    expect(i1.width).toEqual(500);
    expect(i1.height).toEqual(100);

    const output = encodePng({
      image: i1,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_maintainAspect_7.png',
      output
    );
  });

  test('copyResize palette', () => {
    const input = TestUtils.readFromFile(
      TestFolder.input,
      TestSection.png,
      'test.png'
    );
    const img = decodePng({
      data: input,
    });
    expect(img).toBeDefined();
    if (img === undefined) {
      return;
    }

    const i0 = Transform.copyResize({
      image: img,
      width: 64,
      interpolation: Interpolation.cubic,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.transform,
      'copyResize_palette.png',
      output
    );
  });
});
