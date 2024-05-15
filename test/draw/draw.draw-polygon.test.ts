/** @format */

import { describe, test } from 'vitest';
import { ColorRgb8, Draw, encodePng, MemoryImage, Point } from '../../src';
import { TestFolder } from '../_utils/test-folder';
import { TestSection } from '../_utils/test-section';
import { TestUtils } from '../_utils/test-utils';

describe('Draw', () => {
  test('drawPolygon', () => {
    const i0 = new MemoryImage({
      width: 256,
      height: 256,
    });

    const vertices = [
      new Point(50, 50),
      new Point(200, 20),
      new Point(120, 70),
      new Point(30, 150),
    ];

    Draw.drawPolygon({
      image: i0,
      vertices: vertices,
      color: new ColorRgb8(255, 0, 0),
    });

    Draw.drawPolygon({
      image: i0,
      vertices: vertices.map((p) => new Point(p.x + 20, p.y + 20)),
      color: new ColorRgb8(0, 255, 0),
      antialias: true,
      thickness: 1.1,
    });

    Draw.drawPolygon({
      image: i0,
      vertices: vertices.map((p) => new Point(p.x + 40, p.y + 40)),
      color: new ColorRgb8(0, 0, 255),
      antialias: true,
    });

    const output = encodePng({
      image: i0,
    });
    TestUtils.writeToFile(
      TestFolder.output,
      TestSection.draw,
      'drawPolygon.png',
      output
    );
  });
});
