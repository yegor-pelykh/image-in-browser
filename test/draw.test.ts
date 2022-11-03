/** @format */

import { Color, Draw, encodePng } from '../src';
import { Line } from '../src/common/line';
import { MemoryImage } from '../src/common/memory-image';
import { Point } from '../src/common/point';
import { Rectangle } from '../src/common/rectangle';
import { TestFolder, TestSection, TestHelpers } from './test-helpers';

describe('Draw', () => {
  test('drawCircle', () => {
    const radiusStep = 4;
    let radius = 0;
    for (let i = 0; i < 10; i++) {
      const image = new MemoryImage({
        width: 64,
        height: 64,
      });
      image.fill(Color.getColor(0, 0, 0));
      Draw.drawCircle(
        image,
        new Point(32, 32),
        radius,
        Color.getColor(255, 255, 255)
      );
      const encoded = encodePng(image);
      expect(encoded).not.toBeUndefined();
      if (encoded !== undefined) {
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.draw,
          `draw-circle-${i}.png`,
          encoded
        );
      }
      radius += radiusStep;
    }
  });

  test('fillCircle', () => {
    const radiusStep = 4;
    let radius = 0;
    for (let i = 0; i < 10; i++) {
      const image = new MemoryImage({
        width: 64,
        height: 64,
      });
      image.fill(Color.getColor(0, 0, 0));
      Draw.fillCircle(
        image,
        new Point(32, 32),
        radius,
        Color.getColor(255, 255, 255)
      );
      const encoded = encodePng(image);
      expect(encoded).not.toBeUndefined();
      if (encoded !== undefined) {
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.draw,
          `fill-circle-${i}.png`,
          encoded
        );
      }
      radius += radiusStep;
    }
  });

  test('drawImage', () => {
    const sizeStep = 4;
    let size = 0;
    for (let i = 0; i < 10; i++) {
      const src = new MemoryImage({
        width: size,
        height: size,
      });
      src.fill(Color.getColor(255, 255, 255));
      const image = new MemoryImage({
        width: 64,
        height: 64,
      });
      image.fill(Color.getColor(0, 0, 0));
      Draw.drawImage({
        dst: image,
        src: src,
      });
      const encoded = encodePng(image);
      expect(encoded).not.toBeUndefined();
      if (encoded !== undefined) {
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.draw,
          `draw-image-${i}.png`,
          encoded
        );
      }
      size += sizeStep;
    }
  });

  test('drawLine', () => {
    const sizeStep = 4;
    let size = 0;
    const center = new Point(64 / 2, 64 / 2);
    for (let i = 0; i < 10; i++) {
      const image = new MemoryImage({
        width: 64,
        height: 64,
      });
      image.fill(Color.getColor(0, 0, 0));
      Draw.drawLine({
        image: image,
        line: new Line(
          center.x - size,
          center.y - size,
          center.x + size,
          center.y + size
        ),
        color: Color.getColor(255, 255, 255),
      });
      const encoded = encodePng(image);
      expect(encoded).not.toBeUndefined();
      if (encoded !== undefined) {
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.draw,
          `draw-line-${i}.png`,
          encoded
        );
      }
      size += sizeStep;
    }
  });

  test('drawPixel', () => {
    const image = new MemoryImage({
      width: 64,
      height: 64,
    });
    image.fill(Color.getColor(0, 0, 0));
    for (let xi = 0; xi < image.width; xi++) {
      for (let yi = 0; yi < image.height; yi++) {
        if ((xi % 2 === 0) !== (yi % 2 === 0)) {
          Draw.drawPixel(
            image,
            new Point(xi, yi),
            Color.getColor(255, 255, 255)
          );
        }
      }
    }
    const encoded = encodePng(image);
    expect(encoded).not.toBeUndefined();
    if (encoded !== undefined) {
      TestHelpers.writeToFile(
        TestFolder.out,
        TestSection.draw,
        'draw-pixel.png',
        encoded
      );
    }
  });

  test('drawRect', () => {
    const sizeStep = 4;
    let size = 0;
    const center = new Point(64 / 2, 64 / 2);
    for (let i = 0; i < 10; i++) {
      const image = new MemoryImage({
        width: 64,
        height: 64,
      });
      image.fill(Color.getColor(0, 0, 0));
      Draw.drawRect(
        image,
        new Rectangle(
          center.x - size,
          center.y - size,
          center.x + size,
          center.y + size
        ),
        Color.getColor(255, 255, 255)
      );
      const encoded = encodePng(image);
      expect(encoded).not.toBeUndefined();
      if (encoded !== undefined) {
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.draw,
          `draw-rect-${i}.png`,
          encoded
        );
      }
      size += sizeStep;
    }
  });

  test('fillFlood', () => {
    const sizeStep = 4;
    let size = 0;
    const center = new Point(64 / 2, 64 / 2);
    for (let i = 0; i < 10; i++) {
      const image = new MemoryImage({
        width: 64,
        height: 64,
      });
      image.fill(Color.getColor(0, 0, 0));
      Draw.drawRect(
        image,
        new Rectangle(
          center.x - size,
          center.y - size,
          center.x + size,
          center.y + size
        ),
        Color.getColor(255, 255, 255)
      );
      Draw.fillFlood({
        src: image,
        x: center.x,
        y: center.y,
        color: Color.getColor(255, 0, 0),
      });
      const encoded = encodePng(image);
      expect(encoded).not.toBeUndefined();
      if (encoded !== undefined) {
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.draw,
          `fill-flood-${i}.png`,
          encoded
        );
      }
      size += sizeStep;
    }
  });

  test('fillRect', () => {
    const sizeStep = 4;
    let size = 0;
    const center = new Point(64 / 2, 64 / 2);
    for (let i = 0; i < 10; i++) {
      const image = new MemoryImage({
        width: 64,
        height: 64,
      });
      image.fill(Color.getColor(0, 0, 0));
      Draw.fillRect(
        image,
        new Rectangle(
          center.x - size,
          center.y - size,
          center.x + size,
          center.y + size
        ),
        Color.getColor(255, 255, 255)
      );
      const encoded = encodePng(image);
      expect(encoded).not.toBeUndefined();
      if (encoded !== undefined) {
        TestHelpers.writeToFile(
          TestFolder.out,
          TestSection.draw,
          `fill-rect-${i}.png`,
          encoded
        );
      }
      size += sizeStep;
    }
  });
});
