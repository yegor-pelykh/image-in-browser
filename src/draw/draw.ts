/** @format */

import { Channel } from '../color/channel.js';
import { Color } from '../color/color.js';
import { ColorUtils } from '../color/color-utils.js';
import { ArrayUtils } from '../common/array-utils.js';
import { Line } from '../common/line.js';
import { MathUtils } from '../common/math-utils.js';
import { Point } from '../common/point.js';
import { Rectangle } from '../common/rectangle.js';
import { MemoryImage } from '../image/image.js';
import { ImageUtils } from '../image/image-utils.js';
import { Pixel } from '../image/pixel.js';
import { BlendMode } from './blend-mode.js';
import { CircleQuadrant } from './circle-quadrant.js';

/**
 * Type definition for a function that tests a pixel during a flood fill operation.
 */
type FillFloodTestPixel = (y: number, x: number) => boolean;

/**
 * Type definition for a function that marks a pixel during a flood fill operation.
 */
type FillFloodMarkPixel = (y: number, x: number) => void;

/**
 * Options for drawing a line using Xiaolin Wu's algorithm.
 */
interface DrawLineWuOptions {
  /** The image to draw on. */
  image: MemoryImage;
  /** The line to draw. */
  line: Line;
  /** The color to use for drawing. */
  color: Color;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for drawing a line.
 */
export interface DrawLineOptions extends DrawLineWuOptions {
  /** Whether to use antialiasing. */
  antialias?: boolean;
  /** The thickness of the line. */
  thickness?: number;
}

/**
 * Options for drawing an antialiased circle.
 */
interface DrawAntialiasCircleOptions {
  /** The image to draw on. */
  image: MemoryImage;
  /** The x-coordinate of the circle's center. */
  x: number;
  /** The y-coordinate of the circle's center. */
  y: number;
  /** The radius of the circle. */
  radius: number;
  /** The color to use for drawing. */
  color: Color;
  /** The quadrants of the circle to draw. */
  quadrants?: CircleQuadrant;
  /** The mask image. */
  mask?: MemoryImage;
  /** The channel to use for masking. */
  maskChannel?: Channel;
}

/**
 * Options for drawing a circle.
 */
export interface DrawCircleOptions {
  /** The image to draw on. */
  image: MemoryImage;
  /** The center point of the circle. */
  center: Point;
  /** The radius of the circle. */
  radius: number;
  /** The color to use for drawing. */
  color: Color;
  /** Whether to use antialiasing. */
  antialias?: boolean;
  /** The mask image. */
  mask?: MemoryImage;
  /** The channel to use for masking. */
  maskChannel?: Channel;
}

/**
 * Options for drawing a pixel.
 */
export interface DrawPixelOptions {
  /** The image to draw on. */
  image: MemoryImage;
  /** The position of the pixel. */
  pos: Point;
  /** The color to use for drawing. */
  color: Color;
  /** The filter color to apply. */
  filter?: Color;
  /** The alpha value to use. */
  alpha?: number;
  /** The blend mode to use. */
  blend?: BlendMode;
  /** Whether to use linear blending. */
  linearBlend?: boolean;
  /** The mask image. */
  mask?: MemoryImage;
  /** The channel to use for masking. */
  maskChannel?: Channel;
}

/**
 * Options for drawing a polygon.
 */
export interface DrawPolygonOptions {
  /** The image to draw on. */
  image: MemoryImage;
  /** The vertices of the polygon. */
  vertices: Point[];
  /** The color to use for drawing. */
  color: Color;
  /** Whether to use antialiasing. */
  antialias?: boolean;
  /** The thickness of the polygon's edges. */
  thickness?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for drawing a rectangle.
 */
export interface DrawRectOptions {
  /** The image to draw on. */
  image: MemoryImage;
  /** The rectangle to draw. */
  rect: Rectangle;
  /** The color to use for drawing. */
  color: Color;
  /** The thickness of the rectangle's edges. */
  thickness?: number;
  /** The radius for rounded corners. */
  radius?: number;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for filling a circle.
 */
export interface FillCircleOptions {
  /** The image to draw on. */
  image: MemoryImage;
  /** The center point of the circle. */
  center: Point;
  /** The radius of the circle. */
  radius: number;
  /** The color to use for filling. */
  color: Color;
  /** Whether to use antialiasing. */
  antialias?: boolean;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for flood filling an area.
 */
export interface FillFloodOptions {
  /** The image to draw on. */
  image: MemoryImage;
  /** The starting point for the flood fill. */
  start: Point;
  /** The color to use for filling. */
  color: Color;
  /** The threshold for color comparison. */
  threshold?: number;
  /** Whether to compare alpha values. */
  compareAlpha?: boolean;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for creating a mask using flood fill.
 */
export interface MaskFloodOptions {
  /** The image to draw on. */
  image: MemoryImage;
  /** The starting point for the flood fill. */
  start: Point;
  /** The threshold for color comparison. */
  threshold?: number;
  /** Whether to compare alpha values. */
  compareAlpha?: boolean;
  /** The value to fill the mask with. */
  fillValue?: number;
}

/**
 * Options for filling a polygon.
 */
export interface FillPolygonOptions {
  /** The image to draw on. */
  image: MemoryImage;
  /** The vertices of the polygon. */
  vertices: Point[];
  /** The color to use for filling. */
  color: Color;
  /** The channel to use for masking. */
  maskChannel?: Channel;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for filling a rectangle.
 */
export interface FillRectOptions {
  /** The image to draw on. */
  image: MemoryImage;
  /** The rectangle to fill. */
  rect: Rectangle;
  /** The color to use for filling. */
  color: Color;
  /** The radius for rounded corners. */
  radius?: number;
  /** Whether to use alpha blending. */
  alphaBlend?: boolean;
  /** The mask image. */
  mask?: MemoryImage;
  /** The channel to use for masking. */
  maskChannel?: Channel;
}

/**
 * Options for filling an image.
 */
export interface FillOptions {
  /** The image to fill. */
  image: MemoryImage;
  /** The color to use for filling. */
  color: Color;
  /** The channel to use for masking. */
  maskChannel?: Channel.luminance;
  /** The mask image. */
  mask?: MemoryImage;
}

/**
 * Options for compositing an image.
 */
export interface CompositeImageOptions {
  /** The destination image. */
  dst: MemoryImage;
  /** The source image. */
  src: MemoryImage;
  /** The x-coordinate in the destination image. */
  dstX?: number;
  /** The y-coordinate in the destination image. */
  dstY?: number;
  /** The width of the destination area. */
  dstW?: number;
  /** The height of the destination area. */
  dstH?: number;
  /** The x-coordinate in the source image. */
  srcX?: number;
  /** The y-coordinate in the source image. */
  srcY?: number;
  /** The width of the source area. */
  srcW?: number;
  /** The height of the source area. */
  srcH?: number;
  /** The blend mode to use. */
  blend?: BlendMode;
  /** Whether to use linear blending. */
  linearBlend?: boolean;
  /** Whether to center the source image in the destination image. */
  center?: boolean;
  /** The mask image. */
  mask?: MemoryImage;
  /** The channel to use for masking. */
  maskChannel?: Channel;
}

/**
 * Abstract class for drawing operations.
 */
export abstract class Draw {
  /**
   * Calculates the circumference points of a circle on a given image.
   *
   * @param {MemoryImage} image - The image on which the circle is to be drawn.
   * @param {Point} center - The center point of the circle.
   * @param {number} radius - The radius of the circle.
   * @returns {Point[]} An array of points representing the circumference of the circle.
   *         Returns an empty array if the radius is negative or if the circle
   *         would be completely outside the bounds of the image.
   */
  private static calculateCircumference(
    image: MemoryImage,
    center: Point,
    radius: number
  ): Point[] {
    if (
      radius < 0 ||
      center.x + radius < 0 ||
      center.x - radius >= image.width ||
      center.y + radius < 0 ||
      center.y - radius >= image.height
    ) {
      return [];
    }

    if (radius === 0) {
      return [center];
    }

    const points: Point[] = [
      new Point(center.x - radius, center.y),
      new Point(center.x + radius, center.y),
      new Point(center.x, center.y - radius),
      new Point(center.x, center.y + radius),
    ];

    if (radius === 1) {
      return points;
    }

    for (
      let f = 1 - radius, ddFx = 0, ddFy = -(radius << 1), x = 0, y = radius;
      x < y;

    ) {
      if (f >= 0) {
        ddFy += 2;
        f += ddFy;
        --y;
      }
      ++x;
      ddFx += 2;
      f += ddFx + 1;

      if (x !== y + 1) {
        const x1 = center.x - y;
        const x2 = center.x + y;
        const y1 = center.y - x;
        const y2 = center.y + x;
        const x3 = center.x - x;
        const x4 = center.x + x;
        const y3 = center.y - y;
        const y4 = center.y + y;

        points.push(new Point(x1, y1));
        points.push(new Point(x1, y2));
        points.push(new Point(x2, y1));
        points.push(new Point(x2, y2));

        if (x !== y) {
          points.push(new Point(x3, y3));
          points.push(new Point(x4, y4));
          points.push(new Point(x4, y3));
          points.push(new Point(x3, y4));
        }
      }
    }

    return points;
  }

  /**
   * Draws an anti-aliased circle on the provided image.
   *
   * @param {DrawAntialiasCircleOptions} opt - The options for drawing the circle.
   * @param {MemoryImage} opt.image - The image on which to draw the circle.
   * @param {number} opt.x - The x-coordinate of the circle's center.
   * @param {number} opt.y - The y-coordinate of the circle's center.
   * @param {number} opt.radius - The radius of the circle.
   * @param {Color} opt.color - The color of the circle.
   * @param {CircleQuadrant} [opt.quadrants] - The quadrants of the circle to draw.
   * @param {Channel} [opt.maskChannel] - The mask channel to use.
   * @param {MemoryImage} [opt.mask] - The mask to apply.
   * @returns {MemoryImage} The image with the drawn circle.
   */
  private static drawAntialiasCircle(
    opt: DrawAntialiasCircleOptions
  ): MemoryImage {
    /**
     * Draws a pixel in four quadrants of the circle.
     *
     * @param {number} x - The x-coordinate of the circle's center.
     * @param {number} y - The y-coordinate of the circle's center.
     * @param {number} dx - The x offset from the center.
     * @param {number} dy - The y offset from the center.
     * @param {number} alpha - The alpha value for the pixel.
     */
    const drawPixel4 = (
      x: number,
      y: number,
      dx: number,
      dy: number,
      alpha: number
    ): void => {
      // bottom right
      if ((quadrants & CircleQuadrant.bottomRight) !== 0) {
        Draw.drawPixel({
          image: opt.image,
          pos: new Point(x + dx, y + dy),
          color: opt.color,
          alpha: alpha,
          maskChannel: maskChannel,
          mask: opt.mask,
        });
      }

      // bottom left
      if ((quadrants & CircleQuadrant.bottomLeft) !== 0) {
        Draw.drawPixel({
          image: opt.image,
          pos: new Point(x - dx, y + dy),
          color: opt.color,
          alpha: alpha,
          maskChannel: maskChannel,
          mask: opt.mask,
        });
      }

      // upper right
      if ((quadrants & CircleQuadrant.topRight) !== 0) {
        Draw.drawPixel({
          image: opt.image,
          pos: new Point(x + dx, y - dy),
          color: opt.color,
          alpha: alpha,
          maskChannel: maskChannel,
          mask: opt.mask,
        });
      }

      // upper left
      if ((quadrants & CircleQuadrant.topLeft) !== 0) {
        Draw.drawPixel({
          image: opt.image,
          pos: new Point(x - dx, y - dy),
          color: opt.color,
          alpha: alpha,
          maskChannel: maskChannel,
          mask: opt.mask,
        });
      }
    };

    const quadrants = opt.quadrants ?? CircleQuadrant.all;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const radiusSqr = opt.radius * opt.radius;
    const quarter = Math.round(opt.radius / Math.SQRT2);
    for (let i = 0; i <= quarter; ++i) {
      const j = Math.sqrt(radiusSqr - i * i);
      const frc = MathUtils.fract(j);
      const frc2 = frc * (i === quarter ? 0.25 : 1);
      const flr = Math.floor(j);
      drawPixel4(opt.x, opt.y, i, flr, 1 - frc);
      drawPixel4(opt.x, opt.y, i, flr + 1, frc2);
      drawPixel4(opt.x, opt.y, flr, i, 1 - frc);
      drawPixel4(opt.x, opt.y, flr + 1, i, frc2);
    }

    return opt.image;
  }

  /**
   * Draws a line on an image using Wu's line algorithm, which provides anti-aliased lines.
   *
   * @param {DrawLineWuOptions} opt - The options for drawing the line, including the image, line coordinates, color, and mask options.
   * @returns {MemoryImage} The image with the line drawn on it.
   */
  private static drawLineWu(opt: DrawLineWuOptions): MemoryImage {
    const line = opt.line.clone();
    const steep = Math.abs(line.dy) > Math.abs(line.dx);

    if (steep) {
      line.swapXY1();
      line.swapXY2();
    }
    if (line.x1 > line.x2) {
      line.flipX();
      line.flipY();
    }

    const gradient = line.dx === 1 ? 1 : line.dy / line.dx;

    // handle first endpoint
    let xend = Math.floor(line.x1 + 0.5);
    let yend = line.y1 + gradient * (xend - line.x1);
    let xgap = 1 - (line.x1 + 0.5 - Math.floor(line.x1 + 0.5));
    // this will be used in the main loop
    const xpxl1 = xend;
    const ypxl1 = Math.floor(yend);

    if (steep) {
      Draw.drawPixel({
        image: opt.image,
        pos: new Point(ypxl1, xpxl1),
        color: opt.color,
        alpha: (1 - (yend - Math.floor(yend))) * xgap,
        maskChannel: opt.maskChannel,
        mask: opt.mask,
      });
      Draw.drawPixel({
        image: opt.image,
        pos: new Point(ypxl1 + 1, xpxl1),
        color: opt.color,
        alpha: (yend - Math.floor(yend)) * xgap,
        maskChannel: opt.maskChannel,
        mask: opt.mask,
      });
    } else {
      Draw.drawPixel({
        image: opt.image,
        pos: new Point(xpxl1, ypxl1),
        color: opt.color,
        alpha: (1 - (yend - Math.floor(yend))) * xgap,
        maskChannel: opt.maskChannel,
        mask: opt.mask,
      });
      Draw.drawPixel({
        image: opt.image,
        pos: new Point(xpxl1, ypxl1 + 1),
        color: opt.color,
        alpha: (yend - Math.floor(yend)) * xgap,
        maskChannel: opt.maskChannel,
        mask: opt.mask,
      });
    }

    // first y-intersection for the main loop
    let intery = yend + gradient;

    // handle second endpoint
    xend = Math.floor(line.x2 + 0.5);
    yend = line.y2 + gradient * (xend - line.x2);
    xgap = line.x2 + 0.5 - Math.floor(line.x2 + 0.5);

    // this will be used in the main loop
    const xpxl2 = xend;
    const ypxl2 = Math.floor(yend);

    if (steep) {
      Draw.drawPixel({
        image: opt.image,
        pos: new Point(ypxl2, xpxl2),
        color: opt.color,
        alpha: (1 - (yend - Math.floor(yend))) * xgap,
        mask: opt.mask,
        maskChannel: opt.maskChannel,
      });
      Draw.drawPixel({
        image: opt.image,
        pos: new Point(ypxl2 + 1, xpxl2),
        color: opt.color,
        alpha: (yend - Math.floor(yend)) * xgap,
        maskChannel: opt.maskChannel,
        mask: opt.mask,
      });

      // main loop
      for (let x = xpxl1 + 1; x <= xpxl2 - 1; x++) {
        Draw.drawPixel({
          image: opt.image,
          pos: new Point(Math.floor(intery), x),
          color: opt.color,
          alpha: 1 - (intery - Math.floor(intery)),
          mask: opt.mask,
          maskChannel: opt.maskChannel,
        });
        Draw.drawPixel({
          image: opt.image,
          pos: new Point(Math.floor(intery) + 1, x),
          color: opt.color,
          alpha: intery - Math.floor(intery),
          maskChannel: opt.maskChannel,
          mask: opt.mask,
        });

        intery += gradient;
      }
    } else {
      Draw.drawPixel({
        image: opt.image,
        pos: new Point(xpxl2, ypxl2),
        color: opt.color,
        alpha: (1 - (yend - Math.floor(yend))) * xgap,
        maskChannel: opt.maskChannel,
        mask: opt.mask,
      });
      Draw.drawPixel({
        image: opt.image,
        pos: new Point(xpxl2, ypxl2 + 1),
        color: opt.color,
        alpha: (yend - Math.floor(yend)) * xgap,
        maskChannel: opt.maskChannel,
        mask: opt.mask,
      });

      // main loop
      for (let x = xpxl1 + 1; x <= xpxl2 - 1; x++) {
        Draw.drawPixel({
          image: opt.image,
          pos: new Point(x, Math.floor(intery)),
          color: opt.color,
          alpha: 1 - (intery - Math.floor(intery)),
          maskChannel: opt.maskChannel,
          mask: opt.mask,
        });
        Draw.drawPixel({
          image: opt.image,
          pos: new Point(x, Math.floor(intery) + 1),
          color: opt.color,
          alpha: intery - Math.floor(intery),
          maskChannel: opt.maskChannel,
          mask: opt.mask,
        });

        intery += gradient;
      }
    }

    return opt.image;
  }

  /**
   * Sets the alpha value of a given color.
   *
   * @param {Color} c - The color object whose alpha value is to be set.
   * @param {number} a - The alpha value to set (typically between 0 and 1).
   * @returns {Color} The color object with the updated alpha value.
   */
  private static setAlpha(c: Color, a: number): Color {
    c.a = a;
    return c;
  }

  /**
   * Calculates the distance between two colors.
   *
   * @param {number[]} c1 - The first color represented as an array of numbers [R, G, B, A].
   * @param {number[]} c2 - The second color represented as an array of numbers [R, G, B, A].
   * @param {boolean} compareAlpha - A boolean indicating whether to include the alpha channel in the comparison.
   * @returns {number} The distance between the two colors.
   */
  private static colorDistance(
    c1: number[],
    c2: number[],
    compareAlpha: boolean
  ): number {
    const d1 = c1[0] - c2[0];
    const d2 = c1[1] - c2[1];
    const d3 = c1[2] - c2[2];
    if (compareAlpha) {
      const dA = c1[3] - c2[3];
      return Math.sqrt(
        Math.max(d1 * d1, (d1 - dA) * (d1 - dA)) +
          Math.max(d2 * d2, (d2 - dA) * (d2 - dA)) +
          Math.max(d3 * d3, (d3 - dA) * (d3 - dA))
      );
    } else {
      return Math.sqrt(d1 * d1 + d2 * d2 + d3 * d3);
    }
  }

  /**
   * Tests the color distance between a pixel in an image and a reference color.
   *
   * @param {MemoryImage} src - The source image from which the pixel is taken.
   * @param {number} x - The x-coordinate of the pixel.
   * @param {number} y - The y-coordinate of the pixel.
   * @param {number[]} refColor - The reference color to compare against, in LAB color space.
   *                   If it contains an alpha value, it should be included as the fourth element.
   * @param {number} threshold - The threshold distance to determine if the pixel color is sufficiently different from the reference color.
   * @returns {boolean} `true` if the color distance is greater than the threshold, otherwise `false`.
   */
  private static testPixelLabColorDistance(
    src: MemoryImage,
    x: number,
    y: number,
    refColor: number[],
    threshold: number
  ): boolean {
    const pixel = src.getPixel(x, y);
    const compareAlpha = refColor.length > 3;
    const pixelColor = ColorUtils.rgbToLab(pixel.r, pixel.g, pixel.b);
    if (compareAlpha) {
      pixelColor.push(pixel.a);
    }
    return Draw.colorDistance(pixelColor, refColor, compareAlpha) > threshold;
  }

  /**
   * Fills a rectangular block in the image starting from the specified coordinates.
   * This function uses a flood fill algorithm to fill contiguous areas of the image.
   *
   * @param {MemoryImage} src - The source image to be filled.
   * @param {number} x - The starting x-coordinate for the fill operation.
   * @param {number} y - The starting y-coordinate for the fill operation.
   * @param {FillFloodTestPixel} array - A function that tests if a pixel should be filled.
   * @param {FillFloodMarkPixel} mark - A function that marks a pixel as filled.
   * @param {Uint8Array} visited - A Uint8Array that keeps track of visited pixels.
   */
  private static fill4Core(
    src: MemoryImage,
    x: number,
    y: number,
    array: FillFloodTestPixel,
    mark: FillFloodMarkPixel,
    visited: Uint8Array
  ): void {
    let _x = x;
    let _y = y;

    if (visited[_y * src.width + _x] === 1) {
      return;
    }
    // at this point, we know that array(y,x) is clear, and array(y-1,x) and
    // array(y,x-1) are set. We'll begin scanning down and to the right,
    // attempting to fill an entire rectangular block

    // the number of cells that were clear in the last row we scanned
    let lastRowLength = 0;

    do {
      let rowLength = 0;
      let sx = _x;
      // keep track of how long this row is. sx is the starting x for the main
      // scan below now we want to handle a case like |***|, where we fill 3
      // cells in the first row and then after we move to the second row we find
      // the first  | **| cell is filled, ending our rectangular scan. rather
      // than handling this via the recursion below, we'll increase the starting
      // value of 'x' and reduce the last row length to match. then we'll continue
      // trying to set the narrower rectangular block
      if (lastRowLength !== 0 && array(_y, _x)) {
        // if this is not the first row and the leftmost cell is filled...
        do {
          if (--lastRowLength === 0) {
            // shorten the row. if it's full, we're done
            return;
          }
          // otherwise, update the starting point of the main scan to match
        } while (array(_y, ++_x));
        sx = _x;
      } else {
        // we also want to handle the opposite case, | **|, where we begin
        // scanning a 2-wide rectangular block and then find on the next row that
        // it has |***| gotten wider on the left. again, we could handle this
        // with recursion but we'd prefer to adjust x and lastRowLength instead
        for (; _x !== 0 && !array(_y, _x - 1); rowLength++, lastRowLength++) {
          mark(_y, --_x);
          // to avoid scanning the cells twice, we'll fill them and update
          // rowLength here if there's something above the new starting point,
          // handle that recursively. this deals with cases like |* **| when we
          // begin filling from (2,0), move down to (2,1), and then move left to
          // (0,1). The  |****| main scan assumes the portion of the previous row
          // from x to x+lastRowLength has already been filled. adjusting x and
          // lastRowLength breaks that assumption in this case, so we must fix it
          if (_y !== 0 && !array(_y - 1, _x)) {
            // use _Fill since there may be more up and left
            Draw.fill4(src, _x, _y - 1, array, mark, visited);
          }
        }
      }

      // now at this point we can begin to scan the current row in the rectangular
      // block. the span of the previous row from x (inclusive) to x+lastRowLength
      // (exclusive) has already been filled, so we don't need to
      // check it. so scan across to the right in the current row
      for (; sx < src.width && !array(_y, sx); rowLength++, sx++) {
        mark(_y, sx);
      }
      // now we've scanned this row. if the block is rectangular, then the
      // previous row has already been scanned, so we don't need to look upwards
      // and we're going to scan the next row in the next iteration so we don't
      // need to look downwards. however, if the block is not rectangular, we may
      // need to look upwards or rightwards for some portion of the row. if this
      // row was shorter than the last row, we may need to look rightwards near
      // the end, as in the case of |*****|, where the first row is 5 cells long
      // and the second row is 3 cells long. We must look to the right  |*** *|
      // of the single cell at the end of the second row, i.e. at (4,1)
      if (rowLength < lastRowLength) {
        // 'end' is the end of the previous row, so scan the current row to
        for (const end = _x + lastRowLength; ++sx < end; ) {
          // there. any clear cells would have been connected to the previous
          if (!array(_y, sx)) {
            // row. the cells up and left must be set so use FillCore
            Draw.fill4Core(src, sx, _y, array, mark, visited);
          }
        }
      }
      // alternately, if this row is longer than the previous row, as in the case
      // |*** *| then we must look above the end of the row, i.e at (4,0)
      // |*****|
      else if (rowLength > lastRowLength && _y !== 0) {
        // if this row is longer and we're not already at the top...
        for (let ux = _x + lastRowLength; ++ux < sx; ) {
          // sx is the end of the current row
          if (!array(_y - 1, ux)) {
            // since there may be clear cells up and left, use _Fill
            Draw.fill4(src, ux, _y - 1, array, mark, visited);
          }
        }
      }
      // record the new row length
      lastRowLength = rowLength;
      // if we get to a full row or to the bottom, we're done
    } while (lastRowLength !== 0 && ++_y < src.height);
  }

  /**
   * Fills a region in the given MemoryImage starting from the specified coordinates (x, y).
   * The function attempts to move as far as possible to the upper-left corner before filling.
   *
   * @param src The source MemoryImage to be filled.
   * @param x The x-coordinate to start filling from.
   * @param y The y-coordinate to start filling from.
   * @param array A function that tests if a pixel should be filled.
   * @param mark A function that marks a pixel as filled.
   * @param visited A Uint8Array that keeps track of visited pixels.
   */
  private static fill4(
    src: MemoryImage,
    x: number,
    y: number,
    array: FillFloodTestPixel,
    mark: FillFloodMarkPixel,
    visited: Uint8Array
  ): void {
    let _x = x;
    let _y = y;

    if (visited[_y * src.width + _x] === 1) {
      return;
    }

    // At this point, we know array(y,x) is clear, and we want to move as far as
    // possible to the upper-left. Moving up is much more important than moving
    // left, so we could try to make this smarter by sometimes moving to the
    // right if doing so would allow us to move further up, but it doesn't seem
    // worth the complexity
    while (true) {
      const ox = _x;
      const oy = _y;
      while (_y !== 0 && !array(_y - 1, _x)) {
        _y--;
      }
      while (_x !== 0 && !array(_y, _x - 1)) {
        _x--;
      }
      if (_x === ox && _y === oy) {
        break;
      }
    }
    Draw.fill4Core(src, _x, _y, array, mark, visited);
  }

  /**
   * Composites an image directly onto another image with optional masking.
   *
   * @param src - The source image to composite from.
   * @param dst - The destination image to composite to.
   * @param dstX - The x-coordinate in the destination image where compositing starts.
   * @param dstY - The y-coordinate in the destination image where compositing starts.
   * @param dstW - The width of the area to composite.
   * @param dstH - The height of the area to composite.
   * @param xCache - A cache of x-coordinates for the source image.
   * @param yCache - A cache of y-coordinates for the source image.
   * @param maskChannel - The channel of the mask image to use for compositing.
   * @param mask - An optional mask image to control compositing.
   */
  private static imgDirectComposite(
    src: MemoryImage,
    dst: MemoryImage,
    dstX: number,
    dstY: number,
    dstW: number,
    dstH: number,
    xCache: number[],
    yCache: number[],
    maskChannel: Channel,
    mask?: MemoryImage
  ): void {
    let p: Pixel | undefined = undefined;
    if (mask !== undefined) {
      for (let y = 0; y < dstH; ++y) {
        for (let x = 0; x < dstW; ++x) {
          const sx = xCache[x];
          const sy = yCache[y];
          p = src.getPixel(sx, sy, p);
          const m = mask.getPixel(sx, sy).getChannelNormalized(maskChannel);
          if (m === 1) {
            dst.setPixel(dstX + x, dstY + y, p);
          } else {
            const dp = dst.getPixel(dstX + x, dstY + y);
            dp.r = MathUtils.mix(dp.r, p.r, m);
            dp.g = MathUtils.mix(dp.g, p.g, m);
            dp.b = MathUtils.mix(dp.b, p.b, m);
            dp.a = MathUtils.mix(dp.a, p.a, m);
          }
        }
      }
    } else {
      for (let y = 0; y < dstH; ++y) {
        for (let x = 0; x < dstW; ++x) {
          p = src.getPixel(xCache[x], yCache[y], p);
          dst.setPixel(dstX + x, dstY + y, p);
        }
      }
    }
  }

  /**
   * Composites an image onto another image at a specified position and size.
   *
   * @param src - The source image to composite from.
   * @param dst - The destination image to composite onto.
   * @param dstX - The x-coordinate in the destination image where the composite starts.
   * @param dstY - The y-coordinate in the destination image where the composite starts.
   * @param dstW - The width of the area in the destination image to composite onto.
   * @param dstH - The height of the area in the destination image to composite onto.
   * @param xCache - An array of x-coordinates for caching.
   * @param yCache - An array of y-coordinates for caching.
   * @param blend - The blend mode to use for compositing.
   * @param linearBlend - Whether to use linear blending.
   * @param maskChannel - The channel to use for masking.
   * @param mask - An optional mask image.
   */
  private static imgComposite(
    src: MemoryImage,
    dst: MemoryImage,
    dstX: number,
    dstY: number,
    dstW: number,
    dstH: number,
    xCache: number[],
    yCache: number[],
    blend: BlendMode,
    linearBlend: boolean,
    maskChannel: Channel,
    mask?: MemoryImage
  ): void {
    let p: Pixel | undefined = undefined;
    for (let y = 0; y < dstH; ++y) {
      for (let x = 0; x < dstW; ++x) {
        p = src.getPixel(xCache[x], yCache[y], p);
        Draw.drawPixel({
          image: dst,
          pos: new Point(dstX + x, dstY + y),
          color: p,
          blend: blend,
          linearBlend: linearBlend,
          maskChannel: maskChannel,
          mask: mask,
        });
      }
    }
  }

  /**
   * Draws a circle on the provided image with the specified options.
   *
   * @param {DrawCircleOptions} opt - The options for drawing the circle, including:
   * @param {MemoryImage} opt.image - The image on which to draw the circle.
   * @param {Point} opt.center - The center point of the circle.
   * @param {number} opt.radius - The radius of the circle.
   * @param {Color} opt.color - The color of the circle.
   * @param {MemoryImage} [opt.mask] - An optional mask to apply.
   * @param {Channel} [opt.maskChannel] - The channel of the mask to use (default is luminance).
   * @param {boolean} [opt.antialias] - Whether to apply antialiasing (default is false).
   * @returns {MemoryImage} The image with the drawn circle.
   */
  public static drawCircle(opt: DrawCircleOptions): MemoryImage {
    const antialias = opt.antialias ?? false;
    const maskChannel = opt.maskChannel ?? Channel.luminance;
    if (antialias) {
      return Draw.drawAntialiasCircle({
        image: opt.image,
        x: opt.center.x,
        y: opt.center.y,
        radius: opt.radius,
        color: opt.color,
        mask: opt.mask,
        maskChannel: maskChannel,
      });
    }

    const points = Draw.calculateCircumference(
      opt.image,
      opt.center,
      opt.radius
    );
    for (const pt of points) {
      Draw.drawPixel({
        image: opt.image,
        pos: new Point(pt.x, pt.y),
        color: opt.color,
        mask: opt.mask,
        maskChannel: maskChannel,
      });
    }
    return opt.image;
  }

  /**
   * Fills a circle on the given image with the specified options.
   *
   * @param {FillCircleOptions} opt - The options for filling the circle.
   * @param {MemoryImage} opt.image - The image to draw on.
   * @param {Point} opt.center - The center point of the circle.
   * @param {number} opt.radius - The radius of the circle.
   * @param {Color} opt.color - The color to fill the circle with.
   * @param {boolean} [opt.antialias=false] - Whether to apply antialiasing (optional, default is false).
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use for masking (optional, default is luminance).
   * @param {MemoryImage} [opt.mask] - The mask to apply (optional).
   * @returns {MemoryImage} The image with the filled circle.
   */
  public static fillCircle(opt: FillCircleOptions): MemoryImage {
    const antialias = opt.antialias ?? false;
    const maskChannel = opt.maskChannel ?? Channel.luminance;
    const radiusSqr = opt.radius * opt.radius;
    const x1 = Math.max(0, opt.center.x - opt.radius);
    const y1 = Math.max(0, opt.center.y - opt.radius);
    const x2 = Math.min(opt.image.width - 1, opt.center.x + opt.radius);
    const y2 = Math.min(opt.image.height - 1, opt.center.y + opt.radius);
    const range = opt.image.getRange(x1, y1, x2 - x1 + 1, y2 - y1 + 1);

    let it: IteratorResult<Pixel> | undefined = undefined;
    while (((it = range.next()), !it.done)) {
      const p = it.value;
      if (antialias) {
        const a = ImageUtils.circleTest(p, opt.center, radiusSqr, antialias);
        if (a > 0) {
          const alpha = opt.color.aNormalized * a;
          Draw.drawPixel({
            image: opt.image,
            pos: new Point(p.x, p.y),
            color: opt.color,
            alpha: alpha,
            maskChannel: maskChannel,
            mask: opt.mask,
          });
        }
      } else {
        const dx = p.x - opt.center.x;
        const dy = p.y - opt.center.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < radiusSqr) {
          Draw.drawPixel({
            image: opt.image,
            pos: new Point(p.x, p.y),
            color: opt.color,
            maskChannel: maskChannel,
            mask: opt.mask,
          });
        }
      }
    }

    return opt.image;
  }

  /**
   * Draws a line on the given image based on the provided options.
   *
   * @param {DrawLineOptions} opt The options for drawing the line.
   * @param {MemoryImage} opt.image The image on which the line will be drawn.
   * @param {Line} opt.line The line coordinates.
   * @param {Color} opt.color The color of the line.
   * @param {number} [opt.thickness=1] The thickness of the line.
   * @param {boolean} [opt.antialias=false] Whether to apply antialiasing.
   * @param {Channel} [opt.maskChannel=Channel.luminance] The mask channel to use.
   * @param {MemoryImage} [opt.mask] The mask to apply.
   * @returns {MemoryImage} The modified image with the drawn line.
   */
  public static drawLine(opt: DrawLineOptions): MemoryImage {
    const line = opt.line.clone();
    const antialias = opt.antialias ?? false;
    const thickness = opt.thickness ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    // Clip the line to the image boundaries.
    if (
      !ImageUtils.clipLine(
        new Rectangle(0, 0, opt.image.width - 1, opt.image.height - 1),
        line
      )
    ) {
      return opt.image;
    }

    const radius = Math.floor(thickness / 2);

    // Drawing a single point.
    if (line.dx === 0 && line.dy === 0) {
      opt.thickness === 1
        ? Draw.drawPixel({
            image: opt.image,
            pos: new Point(line.x1, line.y1),
            color: opt.color,
            maskChannel: opt.maskChannel,
            mask: opt.mask,
          })
        : Draw.fillCircle({
            image: opt.image,
            center: new Point(line.x1, line.y1),
            radius: radius,
            color: opt.color,
            maskChannel: opt.maskChannel,
            mask: opt.mask,
          });
      return opt.image;
    }

    // Axis-aligned lines
    if (line.dx === 0) {
      if (line.dy < 0) {
        for (let y = line.y2; y <= line.y1; ++y) {
          if (thickness <= 1) {
            Draw.drawPixel({
              image: opt.image,
              pos: new Point(line.x1, y),
              color: opt.color,
              maskChannel: maskChannel,
              mask: opt.mask,
            });
          } else {
            for (let i = 0; i < thickness; i++) {
              Draw.drawPixel({
                image: opt.image,
                pos: new Point(line.x1 - radius + i, y),
                color: opt.color,
                maskChannel: maskChannel,
                mask: opt.mask,
              });
            }
          }
        }
      } else {
        for (let y = line.y1; y <= line.y2; ++y) {
          if (thickness <= 1) {
            Draw.drawPixel({
              image: opt.image,
              pos: new Point(line.x1, y),
              color: opt.color,
              maskChannel: maskChannel,
              mask: opt.mask,
            });
          } else {
            for (let i = 0; i < thickness; i++) {
              Draw.drawPixel({
                image: opt.image,
                pos: new Point(line.x1 - radius + i, y),
                color: opt.color,
                maskChannel: maskChannel,
                mask: opt.mask,
              });
            }
          }
        }
      }
      return opt.image;
    } else if (line.dy === 0) {
      if (line.dx < 0) {
        for (let x = line.x2; x <= line.x1; ++x) {
          if (thickness <= 1) {
            Draw.drawPixel({
              image: opt.image,
              pos: new Point(x, line.y1),
              color: opt.color,
              maskChannel: maskChannel,
              mask: opt.mask,
            });
          } else {
            for (let i = 0; i < thickness; i++) {
              Draw.drawPixel({
                image: opt.image,
                pos: new Point(x, line.y1 - radius + i),
                color: opt.color,
                maskChannel: maskChannel,
                mask: opt.mask,
              });
            }
          }
        }
      } else {
        for (let x = line.x1; x <= line.x2; ++x) {
          if (thickness <= 1) {
            Draw.drawPixel({
              image: opt.image,
              pos: new Point(x, line.y1),
              color: opt.color,
              maskChannel: maskChannel,
              mask: opt.mask,
            });
          } else {
            for (let i = 0; i < thickness; i++) {
              Draw.drawPixel({
                image: opt.image,
                pos: new Point(x, line.y1 - radius + i),
                color: opt.color,
                maskChannel: maskChannel,
                mask: opt.mask,
              });
            }
          }
        }
      }
      return opt.image;
    }

    // 16-bit unsigned int xor.
    const xor = (n: number): number => {
      return (~n + 0x10000) & 0xffff;
    };

    if (!antialias) {
      const dx = Math.abs(line.dx);
      const dy = Math.abs(line.dy);
      if (dy <= dx) {
        // More-or-less horizontal. use wid for vertical stroke
        const ac = Math.cos(Math.atan2(dy, dx));
        let wid = 0;
        if (ac !== 0) {
          wid = Math.trunc(thickness / ac);
        } else {
          wid = 1;
        }

        if (wid === 0) {
          wid = 1;
        }

        let d = 2 * dy - dx;
        const incr1 = 2 * dy;
        const incr2 = 2 * (dy - dx);

        let x = 0;
        let y = 0;
        let ydirflag = 0;
        let xend = 0;
        if (line.x1 > line.x2) {
          x = line.x2;
          y = line.y2;
          ydirflag = -1;
          xend = line.x1;
        } else {
          x = line.x1;
          y = line.y1;
          ydirflag = 1;
          xend = line.x2;
        }

        // Set up line thickness
        let wstart = Math.trunc(y - wid / 2);
        for (let w = wstart; w < wstart + wid; w++) {
          Draw.drawPixel({
            image: opt.image,
            pos: new Point(x, w),
            color: opt.color,
            maskChannel: maskChannel,
            mask: opt.mask,
          });
        }

        if ((line.y2 - line.y1) * ydirflag > 0) {
          while (x < xend) {
            x++;
            if (d < 0) {
              d += incr1;
            } else {
              y++;
              d += incr2;
            }
            wstart = Math.trunc(y - wid / 2);
            for (let w = wstart; w < wstart + wid; w++) {
              Draw.drawPixel({
                image: opt.image,
                pos: new Point(x, w),
                color: opt.color,
                maskChannel: maskChannel,
                mask: opt.mask,
              });
            }
          }
        } else {
          while (x < xend) {
            x++;
            if (d < 0) {
              d += incr1;
            } else {
              y--;
              d += incr2;
            }
            wstart = Math.trunc(y - wid / 2);
            for (let w = wstart; w < wstart + wid; w++) {
              Draw.drawPixel({
                image: opt.image,
                pos: new Point(x, w),
                color: opt.color,
                maskChannel: maskChannel,
                mask: opt.mask,
              });
            }
          }
        }
      } else {
        // More-or-less vertical. use wid for horizontal stroke
        const as = Math.sin(Math.atan2(dy, dx));
        let wid = 0;
        if (as !== 0) {
          wid = Math.trunc(thickness / as);
        } else {
          wid = 1;
        }
        if (wid === 0) {
          wid = 1;
        }

        let d = 2 * dx - dy;
        const incr1 = 2 * dx;
        const incr2 = 2 * (dx - dy);
        let x = 0;
        let y = 0;
        let yend = 0;
        let xdirflag = 0;
        if (line.y1 > line.y2) {
          y = line.y2;
          x = line.x2;
          yend = line.y1;
          xdirflag = -1;
        } else {
          y = line.y1;
          x = line.x1;
          yend = line.y2;
          xdirflag = 1;
        }

        // Set up line thickness
        let wstart = Math.trunc(x - wid / 2);
        for (let w = wstart; w < wstart + wid; w++) {
          Draw.drawPixel({
            image: opt.image,
            pos: new Point(w, y),
            color: opt.color,
            maskChannel: maskChannel,
            mask: opt.mask,
          });
        }

        if ((line.x2 - line.x1) * xdirflag > 0) {
          while (y < yend) {
            y++;
            if (d < 0) {
              d += incr1;
            } else {
              x++;
              d += incr2;
            }
            wstart = Math.trunc(x - wid / 2);
            for (let w = wstart; w < wstart + wid; w++) {
              Draw.drawPixel({
                image: opt.image,
                pos: new Point(w, y),
                color: opt.color,
                maskChannel: maskChannel,
                mask: opt.mask,
              });
            }
          }
        } else {
          while (y < yend) {
            y++;
            if (d < 0) {
              d += incr1;
            } else {
              x--;
              d += incr2;
            }
            wstart = Math.trunc(x - wid / 2);
            for (let w = wstart; w < wstart + wid; w++) {
              Draw.drawPixel({
                image: opt.image,
                pos: new Point(w, y),
                color: opt.color,
                maskChannel: maskChannel,
                mask: opt.mask,
              });
            }
          }
        }
      }

      return opt.image;
    }

    // Antialias Line
    if (thickness === 1) {
      return Draw.drawLineWu({
        image: opt.image,
        line: new Line(line.x1, line.y1, line.x2, line.y2),
        color: opt.color,
      });
    }

    const ag =
      Math.abs(line.dy) < Math.abs(line.dx)
        ? Math.cos(Math.atan2(line.dy, line.dx))
        : Math.sin(Math.atan2(line.dy, line.dx));

    let wid = 0;
    if (ag !== 0.0) {
      wid = Math.trunc(Math.abs(thickness / ag));
    } else {
      wid = 1;
    }
    if (wid === 0) {
      wid = 1;
    }

    if (Math.abs(line.dx) > Math.abs(line.dy)) {
      if (line.dx < 0) {
        line.flipX();
        line.flipY();
      }

      let y = line.y1;
      const inc = Math.trunc((line.dy * 65536) / line.dx);
      let frac = 0;

      for (let x = line.x1; x <= line.x2; x++) {
        const wstart = y - Math.trunc(wid / 2);
        for (let w = wstart; w < wstart + wid; w++) {
          Draw.drawPixel({
            image: opt.image,
            pos: new Point(x, w),
            color: opt.color,
            alpha: ((frac >>> 8) & 0xff) / 255,
            maskChannel: maskChannel,
            mask: opt.mask,
          });

          Draw.drawPixel({
            image: opt.image,
            pos: new Point(x, w + 1),
            color: opt.color,
            alpha: ((xor(frac) >>> 8) & 0xff) / 255,
            maskChannel: maskChannel,
            mask: opt.mask,
          });
        }

        frac += inc;
        if (frac >= 65536) {
          frac -= 65536;
          y++;
        } else if (frac < 0) {
          frac += 65536;
          y--;
        }
      }
    } else {
      if (line.dy < 0) {
        line.flipX();
        line.flipY();
      }

      let x = line.x1;
      const inc = Math.trunc((line.dx * 65536) / line.dy);
      let frac = 0;

      for (let y = line.y1; y <= line.y2; y++) {
        const wstart = x - Math.trunc(wid / 2);
        for (let w = wstart; w < wstart + wid; w++) {
          Draw.drawPixel({
            image: opt.image,
            pos: new Point(w, y),
            color: opt.color,
            alpha: ((frac >>> 8) & 0xff) / 255,
            maskChannel: maskChannel,
            mask: opt.mask,
          });

          Draw.drawPixel({
            image: opt.image,
            pos: new Point(w + 1, y),
            color: opt.color,
            alpha: ((xor(frac) >>> 8) & 0xff) / 255,
            maskChannel: maskChannel,
            mask: opt.mask,
          });
        }

        frac += inc;
        if (frac >= 65536) {
          frac -= 65536;
          x++;
        } else if (frac < 0) {
          frac += 65536;
          x--;
        }
      }
    }

    return opt.image;
  }

  /**
   * Draws a pixel on the given image with various blending modes and options.
   *
   * @param {DrawPixelOptions} opt The options for drawing the pixel, including:
   * @param {MemoryImage} opt.image The image to draw on.
   * @param {Position} opt.pos The position to draw the pixel.
   * @param {Color} opt.color The color of the pixel.
   * @param {BlendMode} [opt.blend=BlendMode.alpha] The blending mode to use (default is BlendMode.alpha).
   * @param {boolean} [opt.linearBlend=false] Whether to use linear blending (default is false).
   * @param {MemoryImage} [opt.mask] An optional mask image.
   * @param {Channel} [opt.maskChannel=Channel.luminance] The channel of the mask to use (default is Channel.luminance).
   * @param {Color} [opt.filter] An optional color filter.
   * @param {number} [opt.alpha] An optional alpha value.
   * @returns {MemoryImage} The modified image with the pixel drawn.
   */
  public static drawPixel(opt: DrawPixelOptions): MemoryImage {
    const blend = opt.blend ?? BlendMode.alpha;
    const linearBlend = opt.linearBlend ?? false;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (!opt.image.isBoundsSafe(opt.pos.x, opt.pos.y)) {
      return opt.image;
    }

    if (blend === BlendMode.direct || opt.image.hasPalette) {
      if (opt.image.isBoundsSafe(opt.pos.x, opt.pos.y)) {
        opt.image.getPixel(opt.pos.x, opt.pos.y).set(opt.color);
        return opt.image;
      }
    }

    const msk =
      opt.mask
        ?.getPixel(opt.pos.x, opt.pos.y)
        .getChannelNormalized(maskChannel) ?? 1;

    let overlayR =
      opt.filter !== undefined
        ? opt.color.rNormalized * opt.filter.rNormalized
        : opt.color.rNormalized;
    let overlayG =
      opt.filter !== undefined
        ? opt.color.gNormalized * opt.filter.gNormalized
        : opt.color.gNormalized;
    let overlayB =
      opt.filter !== undefined
        ? opt.color.bNormalized * opt.filter.bNormalized
        : opt.color.bNormalized;

    const a =
      (opt.color.length < 4 ? 1 : opt.color.aNormalized) *
      (opt.filter === undefined || opt.filter.length < 4
        ? 1
        : opt.filter.aNormalized);

    const overlayA = (opt.alpha ?? a) * msk;

    if (overlayA === 0) {
      return opt.image;
    }

    const dst = opt.image.getPixel(opt.pos.x, opt.pos.y);

    const baseR = dst.rNormalized;
    const baseG = dst.gNormalized;
    const baseB = dst.bNormalized;
    const baseA = dst.aNormalized;

    switch (blend) {
      case BlendMode.direct:
        return opt.image;
      case BlendMode.alpha:
        break;
      case BlendMode.lighten:
        overlayR = Math.max(baseR, overlayR);
        overlayG = Math.max(baseG, overlayG);
        overlayB = Math.max(baseB, overlayB);
        break;
      case BlendMode.screen:
        overlayR = 1 - (1 - overlayR) * (1 - baseR);
        overlayG = 1 - (1 - overlayG) * (1 - baseG);
        overlayB = 1 - (1 - overlayB) * (1 - baseB);
        break;
      case BlendMode.dodge:
        {
          const baseOverlayAlphaProduct = overlayA * baseA;

          const rightHandProductR =
            overlayR * (1 - baseA) + baseR * (1 - overlayA);
          const rightHandProductG =
            overlayG * (1 - baseA) + baseG * (1 - overlayA);
          const rightHandProductB =
            overlayB * (1 - baseA) + baseB * (1 - overlayA);

          const firstBlendColorR = baseOverlayAlphaProduct + rightHandProductR;
          const firstBlendColorG = baseOverlayAlphaProduct + rightHandProductG;
          const firstBlendColorB = baseOverlayAlphaProduct + rightHandProductB;

          const oR = MathUtils.clamp(
            (overlayR / MathUtils.clamp(overlayA, 0.01, 1)) *
              MathUtils.step(0, overlayA),
            0,
            0.99
          );
          const oG = MathUtils.clamp(
            (overlayG / MathUtils.clamp(overlayA, 0.01, 1)) *
              MathUtils.step(0, overlayA),
            0,
            0.99
          );
          const oB = MathUtils.clamp(
            (overlayB / MathUtils.clamp(overlayA, 0.01, 1)) *
              MathUtils.step(0, overlayA),
            0,
            0.99
          );

          const secondBlendColorR =
            (baseR * overlayA) / (1 - oR) + rightHandProductR;
          const secondBlendColorG =
            (baseG * overlayA) / (1 - oG) + rightHandProductG;
          const secondBlendColorB =
            (baseB * overlayA) / (1 - oB) + rightHandProductB;

          const colorChoiceR = MathUtils.step(
            overlayR * baseA + baseR * overlayA,
            baseOverlayAlphaProduct
          );
          const colorChoiceG = MathUtils.step(
            overlayG * baseA + baseG * overlayA,
            baseOverlayAlphaProduct
          );
          const colorChoiceB = MathUtils.step(
            overlayB * baseA + baseB * overlayA,
            baseOverlayAlphaProduct
          );

          overlayR = MathUtils.mix(
            firstBlendColorR,
            secondBlendColorR,
            colorChoiceR
          );
          overlayG = MathUtils.mix(
            firstBlendColorG,
            secondBlendColorG,
            colorChoiceG
          );
          overlayB = MathUtils.mix(
            firstBlendColorB,
            secondBlendColorB,
            colorChoiceB
          );
        }
        break;
      case BlendMode.addition:
        overlayR = baseR + overlayR;
        overlayG = baseG + overlayG;
        overlayB = baseB + overlayB;
        break;
      case BlendMode.darken:
        overlayR = Math.min(baseR, overlayR);
        overlayG = Math.min(baseG, overlayG);
        overlayB = Math.min(baseB, overlayB);
        break;
      case BlendMode.multiply:
        overlayR *= baseR;
        overlayG *= baseG;
        overlayB *= baseB;
        break;
      case BlendMode.burn:
        overlayR = overlayR !== 0 ? 1 - (1 - baseR) / overlayR : 0;
        overlayG = overlayG !== 0 ? 1 - (1 - baseG) / overlayG : 0;
        overlayB = overlayB !== 0 ? 1 - (1 - baseB) / overlayB : 0;
        break;
      case BlendMode.overlay:
        if (2 * baseR < baseA) {
          overlayR =
            2 * overlayR * baseR +
            overlayR * (1 - baseA) +
            baseR * (1 - overlayA);
        } else {
          overlayR =
            overlayA * baseA -
            2 * (baseA - baseR) * (overlayA - overlayR) +
            overlayR * (1 - baseA) +
            baseR * (1 - overlayA);
        }

        if (2 * baseG < baseA) {
          overlayG =
            2 * overlayG * baseG +
            overlayG * (1 - baseA) +
            baseG * (1 - overlayA);
        } else {
          overlayG =
            overlayA * baseA -
            2 * (baseA - baseG) * (overlayA - overlayG) +
            overlayG * (1 - baseA) +
            baseG * (1 - overlayA);
        }

        if (2 * baseB < baseA) {
          overlayB =
            2 * overlayB * baseB +
            overlayB * (1 - baseA) +
            baseB * (1 - overlayA);
        } else {
          overlayB =
            overlayA * baseA -
            2 * (baseA - baseB) * (overlayA - overlayB) +
            overlayB * (1 - baseA) +
            baseB * (1 - overlayA);
        }
        break;
      case BlendMode.softLight:
        overlayR =
          baseA === 0
            ? 0
            : baseR *
                (overlayA * (baseR / baseA) +
                  2 * overlayR * (1 - baseR / baseA)) +
              overlayR * (1 - baseA) +
              baseR * (1 - overlayA);

        overlayG =
          baseA === 0
            ? 0
            : baseG *
                (overlayA * (baseG / baseA) +
                  2 * overlayG * (1 - baseG / baseA)) +
              overlayG * (1 - baseA) +
              baseG * (1 - overlayA);

        overlayB =
          baseA === 0
            ? 0
            : baseB *
                (overlayA * (baseB / baseA) +
                  2 * overlayB * (1 - baseB / baseA)) +
              overlayB * (1 - baseA) +
              baseB * (1 - overlayA);
        break;
      case BlendMode.hardLight:
        if (2 * overlayR < overlayA) {
          overlayR =
            2 * overlayR * baseR +
            overlayR * (1 - baseA) +
            baseR * (1 - overlayA);
        } else {
          overlayR =
            overlayA * baseA -
            2 * (baseA - baseR) * (overlayA - overlayR) +
            overlayR * (1 - baseA) +
            baseR * (1 - overlayA);
        }

        if (2 * overlayG < overlayA) {
          overlayG =
            2 * overlayG * baseG +
            overlayG * (1 - baseA) +
            baseG * (1 - overlayA);
        } else {
          overlayG =
            overlayA * baseA -
            2 * (baseA - baseG) * (overlayA - overlayG) +
            overlayG * (1 - baseA) +
            baseG * (1 - overlayA);
        }

        if (2 * overlayB < overlayA) {
          overlayB =
            2 * overlayB * baseB +
            overlayB * (1 - baseA) +
            baseB * (1 - overlayA);
        } else {
          overlayB =
            overlayA * baseA -
            2 * (baseA - baseB) * (overlayA - overlayB) +
            overlayB * (1 - baseA) +
            baseB * (1 - overlayA);
        }
        break;
      case BlendMode.difference:
        overlayR = Math.abs(overlayR - baseR);
        overlayG = Math.abs(overlayG - baseG);
        overlayB = Math.abs(overlayB - baseB);
        break;
      case BlendMode.subtract:
        overlayR = baseR - overlayR;
        overlayG = baseG - overlayG;
        overlayB = baseB - overlayB;
        break;
      case BlendMode.divide:
        overlayR = overlayR !== 0 ? baseR / overlayR : 0;
        overlayG = overlayG !== 0 ? baseG / overlayG : 0;
        overlayB = overlayB !== 0 ? baseB / overlayB : 0;
        break;
    }

    const invA = 1 - overlayA;

    if (linearBlend) {
      const lbr = Math.pow(baseR, 2.2);
      const lbg = Math.pow(baseG, 2.2);
      const lbb = Math.pow(baseB, 2.2);
      const lor = Math.pow(overlayR, 2.2);
      const log = Math.pow(overlayG, 2.2);
      const lob = Math.pow(overlayB, 2.2);
      const r = Math.pow(lor * overlayA + lbr * baseA * invA, 1 / 2.2);
      const g = Math.pow(log * overlayA + lbg * baseA * invA, 1 / 2.2);
      const b = Math.pow(lob * overlayA + lbb * baseA * invA, 1 / 2.2);
      const a = overlayA + baseA * invA;
      dst.rNormalized = r;
      dst.gNormalized = g;
      dst.bNormalized = b;
      dst.aNormalized = a;
    } else {
      const r = overlayR * overlayA + baseR * baseA * invA;
      const g = overlayG * overlayA + baseG * baseA * invA;
      const b = overlayB * overlayA + baseB * baseA * invA;
      const a = overlayA + baseA * invA;
      dst.rNormalized = r;
      dst.gNormalized = g;
      dst.bNormalized = b;
      dst.aNormalized = a;
    }

    return opt.image;
  }

  /**
   * Draws a polygon on the given image based on the provided options.
   *
   * @param {DrawPolygonOptions} opt The options for drawing the polygon.
   * @param {MemoryImage} opt.image The image on which to draw the polygon.
   * @param {Array<Point>} opt.vertices An array of points representing the vertices of the polygon.
   * @param {Color} opt.color The color to use for the polygon.
   * @param {boolean} [opt.antialias=false] Optional. Whether to apply antialiasing. Defaults to false.
   * @param {number} [opt.thickness=1] Optional. The thickness of the polygon lines. Defaults to 1.
   * @param {Channel} [opt.maskChannel=Channel.luminance] Optional. The channel to use for masking. Defaults to luminance.
   * @param {MemoryImage} [opt.mask] Optional. A mask to apply when drawing.
   * @returns {MemoryImage} The image with the polygon drawn on it.
   */
  public static drawPolygon(opt: DrawPolygonOptions): MemoryImage {
    const antialias = opt.antialias ?? false;
    const thickness = opt.thickness ?? 1;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (opt.color.a === 0) {
      return opt.image;
    }

    const vertices = opt.vertices;
    const numVertices = vertices.length;

    if (numVertices === 0) {
      return opt.image;
    }

    if (numVertices === 1) {
      return Draw.drawPixel({
        image: opt.image,
        pos: vertices[0],
        color: opt.color,
        maskChannel: maskChannel,
        mask: opt.mask,
      });
    }

    if (numVertices === 2) {
      return Draw.drawLine({
        image: opt.image,
        line: new Line(
          vertices[0].x,
          vertices[0].y,
          vertices[1].x,
          vertices[1].y
        ),
        color: opt.color,
        antialias: antialias,
        thickness: thickness,
        maskChannel: maskChannel,
        mask: opt.mask,
      });
    }

    for (let i = 0; i < numVertices - 1; ++i) {
      Draw.drawLine({
        image: opt.image,
        line: new Line(
          vertices[i].x,
          vertices[i].y,
          vertices[i + 1].x,
          vertices[i + 1].y
        ),
        color: opt.color,
        antialias: antialias,
        thickness: thickness,
        maskChannel: maskChannel,
        mask: opt.mask,
      });
    }

    Draw.drawLine({
      image: opt.image,
      line: new Line(
        vertices[numVertices - 1].x,
        vertices[numVertices - 1].y,
        vertices[0].x,
        vertices[0].y
      ),
      color: opt.color,
      antialias: antialias,
      thickness: thickness,
      maskChannel: maskChannel,
      mask: opt.mask,
    });

    return opt.image;
  }

  /**
   * Draw a rectangle in the image with the specified options.
   *
   * @param {DrawRectOptions} opt - Options for drawing the rectangle.
   * @param {MemoryImage} opt.image - The image on which to draw the rectangle.
   * @param {Rectangle} opt.rect - The rectangle dimensions and position.
   * @param {Color} opt.color - The color of the rectangle.
   * @param {number} [opt.thickness=1] - The thickness of the rectangle's border. Defaults to 1.
   * @param {number} [opt.radius=0] - The radius for rounded corners. Defaults to 0.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use for masking. Defaults to Channel.luminance.
   * @param {MemoryImage} [opt.mask] - An optional mask to apply when drawing.
   * @returns {MemoryImage} The modified image with the drawn rectangle.
   */
  public static drawRect(opt: DrawRectOptions): MemoryImage {
    const rect = opt.rect;
    const thickness = opt.thickness ?? 1;
    const radius = opt.radius ?? 0;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    const x0 = rect.left;
    const y0 = rect.top;
    const x1 = rect.right;
    const y1 = rect.bottom;

    // Draw a rounded rectangle
    if (radius > 0) {
      const rad = Math.round(radius);
      Draw.drawLine({
        image: opt.image,
        line: new Line(x0 + rad, y0, x1 - rad, y0),
        color: opt.color,
      });
      Draw.drawLine({
        image: opt.image,
        line: new Line(x1, y0 + rad, x1, y1 - rad),
        color: opt.color,
      });
      Draw.drawLine({
        image: opt.image,
        line: new Line(x0 + rad, y1, x1 - rad, y1),
        color: opt.color,
      });
      Draw.drawLine({
        image: opt.image,
        line: new Line(x0, y0 + rad, x0, y1 - rad),
        color: opt.color,
      });

      const c1x = x0 + rad;
      const c1y = y0 + rad;
      const c2x = x1 - rad;
      const c2y = y0 + rad;
      const c3x = x1 - rad;
      const c3y = y1 - rad;
      const c4x = x0 + rad;
      const c4y = y1 - rad;

      Draw.drawAntialiasCircle({
        image: opt.image,
        x: c1x,
        y: c1y,
        radius: rad,
        color: opt.color,
        maskChannel: maskChannel,
        quadrants: CircleQuadrant.topLeft,
        mask: opt.mask,
      });

      Draw.drawAntialiasCircle({
        image: opt.image,
        x: c2x,
        y: c2y,
        radius: rad,
        color: opt.color,
        maskChannel: maskChannel,
        quadrants: CircleQuadrant.topRight,
        mask: opt.mask,
      });

      Draw.drawAntialiasCircle({
        image: opt.image,
        x: c3x,
        y: c3y,
        radius: rad,
        color: opt.color,
        maskChannel: maskChannel,
        quadrants: CircleQuadrant.bottomRight,
        mask: opt.mask,
      });

      Draw.drawAntialiasCircle({
        image: opt.image,
        x: c4x,
        y: c4y,
        radius: rad,
        color: opt.color,
        maskChannel: maskChannel,
        quadrants: CircleQuadrant.bottomLeft,
        mask: opt.mask,
      });

      return opt.image;
    }

    const ht = thickness / 2;

    Draw.drawLine({
      image: opt.image,
      line: new Line(x0, y0, x1, y0),
      color: opt.color,
      thickness: thickness,
      maskChannel: maskChannel,
      mask: opt.mask,
    });

    Draw.drawLine({
      image: opt.image,
      line: new Line(x0, y1, x1, y1),
      color: opt.color,
      thickness: thickness,
      maskChannel: maskChannel,
      mask: opt.mask,
    });

    const isEvenThickness = ht - Math.trunc(ht) === 0;
    const dh = isEvenThickness ? 1 : 0;

    const by0 = Math.ceil(y0 + ht);
    const by1 = Math.floor(y1 - ht - dh);
    const bx0 = Math.floor(x0 + ht);
    const bx1 = Math.ceil(x1 - ht + dh);

    Draw.drawLine({
      image: opt.image,
      line: new Line(bx0, by0, bx0, by1),
      color: opt.color,
      thickness: thickness,
      maskChannel: maskChannel,
      mask: opt.mask,
    });

    Draw.drawLine({
      image: opt.image,
      line: new Line(bx1, by0, bx1, by1),
      color: opt.color,
      thickness: thickness,
      maskChannel: maskChannel,
      mask: opt.mask,
    });

    return opt.image;
  }

  /**
   * Fills an area of an image with a specified color using the flood fill algorithm.
   *
   * @param {FillFloodOptions} opt - Options for the flood fill operation.
   * @param {MemoryImage} opt.image - The image to be filled.
   * @param {Pixel} opt.start - The starting pixel coordinates for the flood fill.
   * @param {Pixel} opt.color - The color to fill the area with.
   * @param {number} [opt.threshold=0] - The color distance threshold for the fill.
   * @param {boolean} [opt.compareAlpha=false] - Whether to compare the alpha channel.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use for masking.
   * @param {MemoryImage} [opt.mask] - An optional mask image.
   * @returns {MemoryImage} The modified image after the flood fill operation.
   */
  public static fillFlood(opt: FillFloodOptions): MemoryImage {
    const threshold = opt.threshold ?? 0;
    const compareAlpha = opt.compareAlpha ?? false;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (opt.color.a === 0) {
      return opt.image;
    }

    const visited = new Uint8Array(opt.image.width * opt.image.height);

    const srcColor = opt.image.getPixel(opt.start.x, opt.start.y);
    if (!compareAlpha) {
      opt.color.a = 0;
    }

    let array: FillFloodTestPixel | undefined = undefined;
    if (threshold > 0) {
      const lab = ColorUtils.rgbToLab(srcColor.r, srcColor.g, srcColor.b);
      if (compareAlpha) {
        lab.push(srcColor.a);
      }

      array = (y: number, x: number) => {
        return (
          visited[y * opt.image.width + x] === 0 &&
          Draw.testPixelLabColorDistance(opt.image, x, y, lab, threshold)
        );
      };
    } else if (!compareAlpha) {
      array = (y: number, x: number) => {
        return (
          visited[y * opt.image.width + x] === 0 &&
          Draw.setAlpha(opt.image.getPixel(x, y), 0) !== srcColor
        );
      };
    } else {
      array = (y: number, x: number) => {
        return (
          visited[y * opt.image.width + x] === 0 &&
          opt.image.getPixel(x, y) !== srcColor
        );
      };
    }

    let p: Pixel | undefined = undefined;

    const mark = (y: number, x: number): void => {
      if (opt.mask !== undefined) {
        const m = opt.mask.getPixel(x, y).getChannelNormalized(maskChannel);
        if (m > 0) {
          p = opt.image.getPixel(x, y, p);
          p.r = MathUtils.mix(p!.r, opt.color.r, m);
          p.g = MathUtils.mix(p!.g, opt.color.g, m);
          p.b = MathUtils.mix(p!.b, opt.color.b, m);
          p.a = MathUtils.mix(p!.a, opt.color.a, m);
        }
      } else {
        opt.image.setPixel(x, y, opt.color);
      }
      visited[y * opt.image.width + x] = 1;
    };

    Draw.fill4(opt.image, opt.start.x, opt.start.y, array, mark, visited);

    return opt.image;
  }

  /**
   * Fills a polygon on the given image with the specified options.
   *
   * @param {FillPolygonOptions} opt - The options for filling the polygon.
   * @param {MemoryImage} opt.image - The image to draw on.
   * @param {Array<Point>} opt.vertices - An array of points representing the vertices of the polygon.
   * @param {Color} opt.color - The color to fill the polygon with.
   * @param {MemoryImage} [opt.mask] - An optional mask to apply.
   * @param {Channel} [opt.maskChannel] - The channel of the mask to use (default is luminance).
   * @returns {MemoryImage} - The modified image with the polygon filled.
   */
  public static fillPolygon(opt: FillPolygonOptions): MemoryImage {
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (opt.color.a === 0) {
      return opt.image;
    }

    const numVertices = opt.vertices.length;

    if (numVertices === 0) {
      return opt.image;
    }

    if (numVertices === 1) {
      return Draw.drawPixel({
        image: opt.image,
        pos: opt.vertices[0],
        color: opt.color,
        maskChannel: maskChannel,
        mask: opt.mask,
      });
    }

    if (numVertices === 2) {
      return Draw.drawLine({
        image: opt.image,
        line: new Line(
          opt.vertices[0].x,
          opt.vertices[0].y,
          opt.vertices[1].x,
          opt.vertices[1].y
        ),
        color: opt.color,
        mask: opt.mask,
        maskChannel: maskChannel,
      });
    }

    let xMin = 0;
    let yMin = 0;
    let xMax = 0;
    let yMax = 0;
    let first = true;
    for (const vertex of opt.vertices) {
      if (first) {
        xMin = vertex.x;
        yMin = vertex.y;
        xMax = vertex.x;
        yMax = vertex.y;
        first = false;
      } else {
        xMin = Math.min(xMin, vertex.x);
        yMin = Math.min(yMin, vertex.y);
        xMax = Math.max(xMax, vertex.x);
        yMax = Math.max(yMax, vertex.y);
      }
    }

    xMin = Math.max(xMin, 0);
    yMin = Math.max(yMin, 0);
    xMax = Math.min(xMax, opt.image.width - 1);
    yMax = Math.min(yMax, opt.image.height - 1);

    const inter = ArrayUtils.fill<number>(40, 0);
    const vi = ArrayUtils.generate<number>(numVertices + 1, (i) =>
      i < numVertices ? i : 0
    );

    for (let yi = yMin, y = yMin + 0.5; yi <= yMax; ++yi, ++y) {
      let c = 0;
      for (let i = 0; i < numVertices; ++i) {
        const v1 = opt.vertices[vi[i]];
        const v2 = opt.vertices[vi[i + 1]];

        let x1 = v1.x;
        let y1 = v1.y;
        let x2 = v2.x;
        let y2 = v2.y;
        if (y2 < y1) {
          let temp = x1;
          x1 = x2;
          x2 = temp;
          temp = y1;
          y1 = y2;
          y2 = temp;
        }

        if (y <= y2 && y >= y1) {
          let x = 0;
          if (y1 - y2 === 0) {
            x = x1;
          } else {
            x = ((x2 - x1) * (y - y1)) / (y2 - y1);
            x += x1;
          }
          if (x <= xMax && x >= xMin) {
            inter[c++] = x;
          }
        }
      }

      for (let i = 0; i < c; i += 2) {
        let x1f = inter[i];
        let x2f = inter[i + 1];
        if (x1f > x2f) {
          const t = x1f;
          x1f = x2f;
          x2f = t;
        }
        const x1 = Math.floor(x1f);
        const x2 = Math.ceil(x2f);
        for (let x = x1; x <= x2; ++x) {
          Draw.drawPixel({
            image: opt.image,
            pos: new Point(x, yi),
            color: opt.color,
            maskChannel: maskChannel,
            mask: opt.mask,
          });
        }
      }
    }

    return opt.image;
  }

  /**
   * Fills a rectangular area of an image with a specified color, with options for
   * alpha blending, masking, and rounded corners.
   *
   * @param {FillRectOptions} opt - The options for filling the rectangle.
   * @param {MemoryImage} opt.image - The image to be modified.
   * @param {Rectangle} opt.rect - The rectangle area to fill.
   * @param {Color} opt.color - The color to fill the rectangle with.
   * @param {number} [opt.radius] - The radius for rounded corners (optional).
   * @param {boolean} [opt.alphaBlend] - Whether to use alpha blending (optional).
   * @param {MemoryImage} [opt.mask] - An optional mask image to control blending.
   * @param {Channel} [opt.maskChannel] - The channel of the mask image to use (optional).
   * @returns {MemoryImage} - The modified image.
   */
  public static fillRect(opt: FillRectOptions): MemoryImage {
    const radius = opt.radius ?? 0;
    const alphaBlend = opt.alphaBlend ?? true;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (alphaBlend && opt.color.a === 0) {
      return opt.image;
    }

    const xx0 = MathUtils.clamp(opt.rect.left, 0, opt.image.width - 1);
    const yy0 = MathUtils.clamp(opt.rect.top, 0, opt.image.height - 1);
    const xx1 = MathUtils.clamp(opt.rect.right, 0, opt.image.width - 1);
    const yy1 = MathUtils.clamp(opt.rect.bottom, 0, opt.image.height - 1);
    const ww = xx1 - xx0 + 1;
    const hh = yy1 - yy0 + 1;

    // Fill a rounded rect
    if (radius > 0) {
      const rad = Math.round(radius);
      const rad2 = rad * rad;
      const c1x = xx0 + rad;
      const c1y = yy0 + rad;
      const c2x = xx1 - rad + 1;
      const c2y = yy0 + rad;
      const c3x = xx1 - rad + 1;
      const c3y = yy1 - rad + 1;
      const c4x = xx0 + rad;
      const c4y = yy1 - rad + 1;

      const range = opt.image.getRange(xx0, yy0, ww, hh);
      let it: IteratorResult<Pixel> | undefined = undefined;
      while (((it = range.next()), !it.done)) {
        const p = it.value;
        const px = p.x;
        const py = p.y;

        let a = 1;
        if (px < c1x && py < c1y) {
          a = ImageUtils.circleTest(p, new Point(c1x, c1y), rad2);
          if (a === 0) {
            continue;
          }
        } else if (px > c2x && py < c2y) {
          a = ImageUtils.circleTest(p, new Point(c2x, c2y), rad2);
          if (a === 0) {
            continue;
          }
        } else if (px > c3x && py > c3y) {
          a = ImageUtils.circleTest(p, new Point(c3x, c3y), rad2);
          if (a === 0) {
            continue;
          }
        } else if (px < c4x && py > c4y) {
          a = ImageUtils.circleTest(p, new Point(c4x, c4y), rad2);
          if (a === 0) {
            continue;
          }
        }

        a *= opt.color.aNormalized;

        const m =
          opt.mask?.getPixel(p.x, p.y).getChannelNormalized(maskChannel) ?? 1;
        p.r = MathUtils.mix(p.r, opt.color.r, a * m);
        p.g = MathUtils.mix(p.g, opt.color.g, a * m);
        p.b = MathUtils.mix(p.b, opt.color.b, a * m);
        p.a *= 1 - opt.color.a * m;
      }

      return opt.image;
    }

    // If no blending is necessary, use a faster fill method.
    if (
      !alphaBlend ||
      (opt.color.a === opt.color.maxChannelValue && opt.mask === undefined)
    ) {
      const range = opt.image.getRange(xx0, yy0, ww, hh);
      let it: IteratorResult<Pixel> | undefined = undefined;
      while (((it = range.next()), !it.done)) {
        it.value.set(opt.color);
      }
    } else {
      const a = opt.color.a / opt.color.maxChannelValue;
      const range = opt.image.getRange(xx0, yy0, ww, hh);
      let it: IteratorResult<Pixel> | undefined = undefined;
      while (((it = range.next()), !it.done)) {
        const p = it.value;
        const m =
          opt.mask?.getPixel(p.x, p.y).getChannelNormalized(maskChannel) ?? 1;
        p.r = MathUtils.mix(p.r, opt.color.r, a * m);
        p.g = MathUtils.mix(p.g, opt.color.g, a * m);
        p.b = MathUtils.mix(p.b, opt.color.b, a * m);
        p.a *= 1 - opt.color.a * m;
      }
    }

    return opt.image;
  }

  /**
   * Fills the given image with the specified color, optionally using a mask.
   *
   * @param {FillOptions} opt - The options for filling the image.
   * @param {MemoryImage} opt.image - The MemoryImage to be filled.
   * @param {Color} opt.color - The color to fill the image with.
   * @param {MemoryImage} [opt.mask] - (Optional) A mask image to control the fill operation.
   * @param {Channel} [opt.maskChannel] - (Optional) The channel of the mask image to use (default is luminance).
   * @returns {MemoryImage} - The filled MemoryImage.
   */
  public static fill(opt: FillOptions): MemoryImage {
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (opt.mask === undefined) {
      opt.image.clear(opt.color);
      return opt.image;
    }

    for (const p of opt.image) {
      const maskValue = opt.mask
        .getPixel(p.x, p.y)
        .getChannelNormalized(maskChannel);
      p.r = MathUtils.mix(p.r, opt.color.r, maskValue);
      p.g = MathUtils.mix(p.g, opt.color.g, maskValue);
      p.b = MathUtils.mix(p.b, opt.color.b, maskValue);
      p.a = MathUtils.mix(p.a, opt.color.a, maskValue);
    }

    return opt.image;
  }

  /**
   * Create a mask describing the 4-connected shape containing **start** in the **image**.
   *
   * @param {MaskFloodOptions} opt - Options for the maskFlood function.
   * @param {MemoryImage} opt.image - The image in which the mask will be created.
   * @param {Point} opt.start - The starting point for the flood fill.
   * @param {number} [opt.threshold] - The color distance threshold for the flood fill.
   * @param {boolean} [opt.compareAlpha] - Whether to compare the alpha channel in the color distance calculation.
   * @param {number} [opt.fillValue] - The value to fill the mask with.
   * @returns {Uint8Array} A Uint8Array representing the mask.
   */
  public static maskFlood(opt: MaskFloodOptions): Uint8Array {
    const threshold = opt.threshold ?? 0;
    const compareAlpha = opt.compareAlpha ?? false;
    const fillValue = opt.fillValue ?? 255;

    const visited = new Uint8Array(opt.image.width * opt.image.height);

    let srcColor: Color = opt.image.getPixel(opt.start.x, opt.start.y);
    if (!compareAlpha) {
      srcColor = Draw.setAlpha(srcColor, 0);
    }

    const ret = new Uint8Array(opt.image.width * opt.image.height);

    let array: FillFloodTestPixel | undefined = undefined;
    if (threshold > 0) {
      const lab = ColorUtils.rgbToLab(srcColor.r, srcColor.g, srcColor.b);
      if (compareAlpha) {
        lab.push(srcColor.a);
      }
      array = (y: number, x: number) => {
        return (
          visited[y * opt.image.width + x] === 0 &&
          (ret[y * opt.image.width + x] !== 0 ||
            Draw.testPixelLabColorDistance(opt.image, x, y, lab, threshold))
        );
      };
    } else if (!compareAlpha) {
      array = (y: number, x: number) => {
        return (
          visited[y * opt.image.width + x] === 0 &&
          (ret[y * opt.image.width + x] !== 0 ||
            Draw.setAlpha(opt.image.getPixel(x, y), 0) !== srcColor)
        );
      };
    } else {
      array = (y: number, x: number) => {
        return (
          visited[y * opt.image.width + x] === 0 &&
          (ret[y * opt.image.width + x] !== 0 ||
            opt.image.getPixel(x, y) !== srcColor)
        );
      };
    }

    const mark = (y: number, x: number): void => {
      ret[y * opt.image.width + x] = fillValue;
      visited[y * opt.image.width + x] = 1;
    };

    Draw.fill4(opt.image, opt.start.x, opt.start.y, array, mark, visited);
    return ret;
  }

  /**
   * Overlay the image **src** onto the image **dst**.
   *
   * Specifically, compositeImage will take a rectangular section from **src** with
   * dimensions **srcW** by **srcH** starting at (**srcX**, **srcY**) and place it
   * into a rectangular section of **dst** with dimensions **dstW** by **dstH** starting
   * at (**dstX**, **dstY**).
   *
   * If the source and destination coordinates and dimensions differ, the image fragment
   * will be appropriately stretched or shrunk. The coordinates refer to the upper left corner.
   * This function can also be used to copy regions within the same image (if **dst** is the same as **src**),
   * but overlapping regions may produce unpredictable results.
   *
   * If **center** is true, the **src** will be centered within **dst**.
   *
   * @param {CompositeImageOptions} opt - Options for compositing the image.
   * @param {MemoryImage} opt.dst - The destination image.
   * @param {number} [opt.dstX=0] - The x-coordinate in the destination image.
   * @param {number} [opt.dstY=0] - The y-coordinate in the destination image.
   * @param {number} [opt.srcX=0] - The x-coordinate in the source image.
   * @param {number} [opt.srcY=0] - The y-coordinate in the source image.
   * @param {number} [opt.srcW=opt.src.width] - The width of the source image area.
   * @param {number} [opt.srcH=opt.src.height] - The height of the source image area.
   * @param {number} [opt.dstW] - The width of the destination image area.
   * @param {number} [opt.dstH] - The height of the destination image area.
   * @param {BlendMode} [opt.blend=BlendMode.alpha] - The blending mode to use.
   * @param {boolean} [opt.linearBlend=false] - Whether to use linear blending.
   * @param {boolean} [opt.center=false] - Whether to center the source image in the destination.
   * @param {Channel} [opt.maskChannel=Channel.luminance] - The channel to use for the mask.
   * @param {ImageMask} [opt.mask] - The mask to apply during compositing.
   */
  public static compositeImage(opt: CompositeImageOptions): MemoryImage {
    let dst = opt.dst;
    let dstX = opt.dstX ?? 0;
    let dstY = opt.dstY ?? 0;
    const srcX = opt.srcX ?? 0;
    const srcY = opt.srcY ?? 0;
    const srcW = opt.srcW ?? opt.src.width;
    const srcH = opt.srcH ?? opt.src.height;
    const dstW =
      opt.dstW ?? (dst.width < opt.src.width ? dst.width : opt.src.width);
    const dstH =
      opt.dstH ?? (dst.height < opt.src.height ? dst.height : opt.src.height);
    const blend = opt.blend ?? BlendMode.alpha;
    const linearBlend = opt.linearBlend ?? false;
    const center = opt.center ?? false;
    const maskChannel = opt.maskChannel ?? Channel.luminance;

    if (center) {
      // if [src] is wider than [dst]
      let wdt = dst.width - opt.src.width;
      if (wdt < 0) wdt = 0;
      dstX = Math.trunc(wdt / 2);
      // if [src] is higher than [dst]
      let height = dst.height - opt.src.height;
      if (height < 0) height = 0;
      dstY = Math.trunc(height / 2);
    }

    if (dst.hasPalette) {
      dst = dst.convert({
        numChannels: dst.numChannels,
      });
    }

    const dy = srcH / dstH;
    const dx = srcW / dstW;
    const yCache = Array.from(
      { length: dstH },
      (_, y) => srcY + Math.trunc(y * dy)
    );
    const xCache = Array.from(
      { length: dstW },
      (_, x) => srcX + Math.trunc(x * dx)
    );

    if (blend === BlendMode.direct) {
      Draw.imgDirectComposite(
        opt.src,
        dst,
        dstX,
        dstY,
        dstW,
        dstH,
        xCache,
        yCache,
        maskChannel,
        opt.mask
      );
    } else {
      Draw.imgComposite(
        opt.src,
        dst,
        dstX,
        dstY,
        dstW,
        dstH,
        xCache,
        yCache,
        blend,
        linearBlend,
        maskChannel,
        opt.mask
      );
    }

    return dst;
  }
}
