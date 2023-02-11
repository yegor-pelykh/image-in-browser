/** @format */

import { ColorRgb8, Draw, encodePng, Line, MemoryImage } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Draw', () => {
  test('drawLine', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    Draw.drawLine({
      image: i0,
      line: new Line(0, 0, 255, 255),
      color: new ColorRgb8(255, 255, 255),
    });
    Draw.drawLine({
      image: i0,
      line: new Line(255, 0, 0, 255),
      color: new ColorRgb8(255, 0, 0),
      antialias: true,
      thickness: 4,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'drawLine.png',
      output
    );
  });

  test('drawLineWu', () => {
    const i0 = new MemoryImage({
      width: 800,
      height: 400,
    });

    for (let x = 0; x < 400; x += 10) {
      Draw.drawLine({
        image: i0,
        line: new Line(400, 0, x, 400),
        color: new ColorRgb8(0, 255, 0),
        antialias: true,
        thickness: 1.1,
      });
    }
    for (let x = 400; x <= 800; x += 10) {
      Draw.drawLine({
        image: i0,
        line: new Line(400, 0, x, 400),
        color: new ColorRgb8(255, 0, 0),
        antialias: true,
      });
    }

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'drawLineWu.png',
      output
    );
  });
});
