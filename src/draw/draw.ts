/** @format */

import { Color } from '../common/color';
import { Line } from '../common/line';
import { MathOperators } from '../common/math-operators';
import { MemoryImage } from '../common/memory-image';
import { Point } from '../common/point';
import { Rectangle } from '../common/rectangle';
import { DrawImageOptions } from './draw-image-options';
import { DrawLineOptions } from './draw-line-options';
import { FillFloodOptions } from './fill-flood-options';
import { MaskFloodOptions } from './mask-flood-options';

type FillFloodTestPixel = (y: number, x: number) => boolean;
type FillFloodMarkPixel = (y: number, x: number) => void;

export abstract class Draw {
  // 0000
  private static readonly OUTCODE_INSIDE = 0;
  // 0001
  private static readonly OUTCODE_LEFT = 1;
  // 0010
  private static readonly OUTCODE_RIGHT = 2;
  // 0100
  private static readonly OUTCODE_BOTTOM = 4;
  // 1000
  private static readonly OUTCODE_TOP = 8;

  /**
   * Calculate the pixels that make up the circumference of a circle on the
   * given **image**, centered at **center** and the given **radius**.
   *
   * The returned list of points is sorted, first by the x coordinate, and
   * second by the y coordinate.
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
   * Compute the bit code for a point **p** using the clip rectangle **rect**
   */
  private static computeOutCode(rect: Rectangle, p: Point): number {
    // initialized as being inside of clip window
    let code = Draw.OUTCODE_INSIDE;
    if (p.x < rect.left) {
      // to the left of clip window
      code |= Draw.OUTCODE_LEFT;
    } else if (p.x > rect.right) {
      // to the right of clip window
      code |= Draw.OUTCODE_RIGHT;
    }

    if (p.y < rect.top) {
      // below the clip window
      code |= Draw.OUTCODE_TOP;
    } else if (p.y > rect.bottom) {
      // above the clip window
      code |= Draw.OUTCODE_BOTTOM;
    }

    return code;
  }

  /**
   * Clip a line to a rectangle using the Cohen–Sutherland clipping algorithm.
   * **line** is a **Line** object.
   * **rect** is a **Rectangle** object.
   * Results are stored in **line**.
   * If **line** falls completely outside of **rect**, false is returned, otherwise
   * true is returned.
   */
  private static clipLine(rect: Rectangle, line: Line): boolean {
    const xmin = rect.left;
    const ymin = rect.top;
    const xmax = rect.right;
    const ymax = rect.bottom;

    // compute outcodes for P0, P1, and whatever point lies outside the clip rectangle
    let outcode1 = Draw.computeOutCode(
      rect,
      new Point(line.startX, line.startY)
    );
    let outcode2 = Draw.computeOutCode(rect, new Point(line.endX, line.endY));
    let accept = false;

    while (true) {
      if ((outcode1 | outcode2) === 0) {
        // Bitwise OR is 0. Trivially accept and get out of loop
        accept = true;
        break;
      } else if ((outcode1 & outcode2) !== 0) {
        // Bitwise AND is not 0. Trivially reject and get out of loop
        break;
      } else {
        // failed both tests, so calculate the line segment to clip
        // from an outside point to an intersection with clip edge

        // At least one endpoint is outside the clip rectangle; pick it.
        const outcodeOut = outcode1 !== 0 ? outcode1 : outcode2;

        let x = 0;
        let y = 0;

        // Now find the intersection point;
        // use formulas y = y0 + slope * (x - x0), x = x0 + (1 / slope) * (y - y0)
        if ((outcodeOut & Draw.OUTCODE_TOP) !== 0) {
          // point is above the clip rectangle
          x =
            line.startX +
            Math.trunc((line.dx * (ymin - line.startY)) / line.dy);
          y = ymin;
        } else if ((outcodeOut & Draw.OUTCODE_BOTTOM) !== 0) {
          // point is below the clip rectangle
          x =
            line.startX +
            Math.trunc((line.dx * (ymax - line.startY)) / line.dy);
          y = ymax;
        } else if ((outcodeOut & Draw.OUTCODE_RIGHT) !== 0) {
          // point is to the right of clip rectangle
          y =
            line.startY +
            Math.trunc((line.dy * (xmax - line.startX)) / line.dx);
          x = xmax;
        } else if ((outcodeOut & Draw.OUTCODE_LEFT) !== 0) {
          // point is to the left of clip rectangle
          y =
            line.startY +
            Math.trunc((line.dy * (xmin - line.startX)) / line.dx);
          x = xmin;
        }

        // Now we move outside point to intersection point to clip
        // and get ready for next pass.
        if (outcodeOut === outcode1) {
          line.moveStart(x, y);
          outcode1 = Draw.computeOutCode(
            rect,
            new Point(line.startX, line.startY)
          );
        } else {
          line.moveEnd(x, y);
          outcode2 = Draw.computeOutCode(rect, new Point(line.endX, line.endY));
        }
      }
    }

    return accept;
  }

  private static testPixelLabColorDistance(
    src: MemoryImage,
    x: number,
    y: number,
    refColor: number[],
    threshold: number
  ): boolean {
    const pixel = src.getPixel(x, y);
    const compareAlpha = refColor.length > 3;
    const pixelColor = Color.rgbToLab(
      Color.getRed(pixel),
      Color.getGreen(pixel),
      Color.getBlue(pixel)
    );
    if (compareAlpha) {
      pixelColor.push(Color.getAlpha(pixel));
    }
    return Color.distance(pixelColor, refColor, compareAlpha) > threshold;
  }

  /**
   * Adam Milazzo (2015). A More Efficient Flood Fill.
   * http://www.adammil.net/blog/v126_A_More_Efficient_Flood_Fill.html
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

    // at this point, we know array(y,x) is clear, and we want to move as far as
    // possible to the upper-left. moving up is much more important than moving
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
   * Draw a circle into the **image** with a center of **center** and
   * the given **radius** and **color**.
   */
  public static drawCircle(
    image: MemoryImage,
    center: Point,
    radius: number,
    color: number
  ): MemoryImage {
    const points = Draw.calculateCircumference(image, center, radius);
    for (const p of points) {
      Draw.drawPixel(image, p, color);
    }
    return image;
  }

  /**
   * Draw and fill a circle into the **image** with a **center**
   * and the given **radius** and **color**.
   *
   * The algorithm uses the same logic as **drawCircle** to calculate each point
   * around the circle's circumference. Then it iterates through every point,
   * finding the smallest and largest y-coordinate values for a given x-
   * coordinate.
   *
   * Once found, it draws a line connecting those two points. The circle is thus
   * filled one vertical slice at a time (each slice being 1-pixel wide).
   */
  public static fillCircle(
    image: MemoryImage,
    center: Point,
    radius: number,
    color: number
  ): MemoryImage {
    const points = Draw.calculateCircumference(image, center, radius);

    // sort points by x-coordinate and then by y-coordinate
    points.sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

    if (points.length > 0) {
      let start = points[0];
      let end = points[0];
      for (let i = 1; i < points.length; i++) {
        const p = points[i];
        if (p.x === start.x) {
          end = p;
        } else {
          Draw.drawLine({
            image: image,
            line: new Line(start.xt, start.yt, end.xt, end.yt),
            color: color,
          });
          start = p;
          end = p;
        }
      }
      Draw.drawLine({
        image: image,
        line: new Line(start.xt, start.yt, end.xt, end.yt),
        color: color,
      });
    }

    return image;
  }

  /**
   * Draw the image **src** onto the image **dst**.
   *
   * In other words, drawImage will take an rectangular area from **src** of
   * width **srcW** and height **srcH** at position (**srcX**,**srY**) and place it
   * in a rectangular area of **dst** of width **dstW** and height **dstH** at
   * position (**dstX**,**dstY**).
   *
   * If the source and destination coordinates and width and heights differ,
   * appropriate stretching or shrinking of the image fragment will be performed.
   * The coordinates refer to the upper left corner. This function can be used to
   * copy regions within the same image (if **dst** is the same as **src**)
   * but if the regions overlap the results will be unpredictable.
   */
  public static drawImage(options: DrawImageOptions): MemoryImage {
    const dstX = options.dstX ?? 0;
    const dstY = options.dstY ?? 0;
    const srcX = options.srcX ?? 0;
    const srcY = options.srcY ?? 0;
    const srcW = options.srcW ?? options.src.width;
    const srcH = options.srcH ?? options.src.height;
    const dstW = options.dstW ?? Math.min(options.dst.width, options.src.width);
    const dstH =
      options.dstH ?? Math.min(options.dst.height, options.src.height);
    const blend = options.blend ?? true;

    if (blend) {
      for (let y = 0; y < dstH; ++y) {
        for (let x = 0; x < dstW; ++x) {
          const stepX = Math.trunc(x * (srcW / dstW));
          const stepY = Math.trunc(y * (srcH / dstH));
          const srcPixel = options.src.getPixel(srcX + stepX, srcY + stepY);
          const point = new Point(dstX + x, dstY + y);
          Draw.drawPixel(options.dst, point, srcPixel);
        }
      }
    } else {
      for (let y = 0; y < dstH; ++y) {
        for (let x = 0; x < dstW; ++x) {
          const stepX = Math.trunc(x * (srcW / dstW));
          const stepY = Math.trunc(y * (srcH / dstH));
          const srcPixel = options.src.getPixel(srcX + stepX, srcY + stepY);
          options.dst.setPixel(dstX + x, dstY + y, srcPixel);
        }
      }
    }

    return options.dst;
  }

  /**
   * Draw a line into **image**.
   *
   * If **antialias** is true then the line is drawn with smooth edges.
   * **thickness** determines how thick the line should be drawn, in pixels.
   */
  public static drawLine(options: DrawLineOptions): MemoryImage {
    const line = Line.from(options.line);
    const isClipped = Draw.clipLine(
      new Rectangle(0, 0, options.image.width - 1, options.image.height - 1),
      line
    );
    if (!isClipped) {
      return options.image;
    }

    const thickness = options.thickness ?? 1;

    const radius = Math.floor(thickness / 2);

    // Drawing a single point.
    if (line.dx === 0 && line.dy === 0) {
      thickness === 1
        ? Draw.drawPixel(
            options.image,
            new Point(line.startX, line.startY),
            options.color
          )
        : Draw.fillCircle(
            options.image,
            new Point(line.startX, line.startY),
            radius,
            options.color
          );
      return options.image;
    }

    // Axis-aligned lines
    if (line.dx === 0) {
      for (let y = line.startY; y <= line.endY; ++y) {
        if (thickness <= 1) {
          const point = new Point(line.startX, y);
          Draw.drawPixel(options.image, point, options.color);
        } else {
          for (let i = 0; i < thickness; i++) {
            const point = new Point(line.startX - radius + i, y);
            Draw.drawPixel(options.image, point, options.color);
          }
        }
      }
      return options.image;
    } else if (line.dy === 0) {
      for (let x = line.startX; x <= line.endX; ++x) {
        if (thickness <= 1) {
          const point = new Point(x, line.startY);
          Draw.drawPixel(options.image, point, options.color);
        } else {
          for (let i = 0; i < thickness; i++) {
            const point = new Point(x, line.startY - radius + i);
            Draw.drawPixel(options.image, point, options.color);
          }
        }
      }
      return options.image;
    }

    // 16-bit xor
    const xor = (n: number) => (~n + 0x10000) & 0xffff;

    if (!options.antialias) {
      if (line.dy <= line.dx) {
        // More-or-less horizontal. use wid for vertical stroke
        const ac = Math.cos(Math.atan2(line.dy, line.dx));
        let wid = 0;
        if (ac !== 0) {
          wid = Math.trunc(thickness / ac);
        } else {
          wid = 1;
        }

        if (wid === 0) {
          wid = 1;
        }

        let d = 2 * line.dy - line.dx;
        const incr1 = 2 * line.dy;
        const incr2 = 2 * (line.dy - line.dx);

        let x = line.startX;
        let y = line.startY;

        // Set up line thickness
        let wstart = Math.trunc(y - wid / 2);
        for (let w = wstart; w < wstart + wid; w++) {
          const point = new Point(x, w);
          Draw.drawPixel(options.image, point, options.color);
        }

        if (line.dy > 0) {
          while (x < line.endX) {
            x++;
            if (d < 0) {
              d += incr1;
            } else {
              y++;
              d += incr2;
            }
            wstart = Math.trunc(y - wid / 2);
            for (let w = wstart; w < wstart + wid; w++) {
              const point = new Point(x, w);
              Draw.drawPixel(options.image, point, options.color);
            }
          }
        } else {
          while (x < line.endX) {
            x++;
            if (d < 0) {
              d += incr1;
            } else {
              y--;
              d += incr2;
            }
            wstart = Math.trunc(y - wid / 2);
            for (let w = wstart; w < wstart + wid; w++) {
              const point = new Point(x, w);
              Draw.drawPixel(options.image, point, options.color);
            }
          }
        }
      } else {
        // More-or-less vertical. use wid for horizontal stroke
        const as = Math.sin(Math.atan2(line.dy, line.dx));
        let wid = 0;
        if (as !== 0) {
          wid = Math.trunc(thickness / as);
        } else {
          wid = 1;
        }
        if (wid === 0) {
          wid = 1;
        }

        let d = 2 * line.dx - line.dy;
        const incr1 = 2 * line.dx;
        const incr2 = 2 * (line.dx - line.dy);

        let x = line.startX;
        let y = line.startY;

        // Set up line thickness
        let wstart = Math.trunc(x - wid / 2);
        for (let w = wstart; w < wstart + wid; w++) {
          const point = new Point(w, y);
          Draw.drawPixel(options.image, point, options.color);
        }

        if (line.endX - line.startX > 0) {
          while (y < line.endY) {
            y++;
            if (d < 0) {
              d += incr1;
            } else {
              x++;
              d += incr2;
            }
            wstart = Math.trunc(x - wid / 2);
            for (let w = wstart; w < wstart + wid; w++) {
              const point = new Point(w, y);
              Draw.drawPixel(options.image, point, options.color);
            }
          }
        } else {
          while (y < line.endY) {
            y++;
            if (d < 0) {
              d += incr1;
            } else {
              x--;
              d += incr2;
            }
            wstart = Math.trunc(x - wid / 2);
            for (let w = wstart; w < wstart + wid; w++) {
              const point = new Point(w, y);
              Draw.drawPixel(options.image, point, options.color);
            }
          }
        }
      }

      return options.image;
    }

    // Antialias Line

    const ag =
      line.dy < line.dx
        ? Math.cos(Math.atan2(line.dy, line.dx))
        : Math.sin(Math.atan2(line.dy, line.dx));

    let wid = 0;
    if (ag !== 0) {
      wid = Math.trunc(Math.abs(thickness / ag));
    } else {
      wid = 1;
    }
    if (wid === 0) {
      wid = 1;
    }

    if (line.dx > line.dy) {
      let y = line.startY;
      const inc = Math.trunc((line.dy * 65536) / line.dx);
      let frac = 0;

      for (let x = line.startX; x <= line.endX; x++) {
        const wstart = y - Math.trunc(wid / 2);
        for (let w = wstart; w < wstart + wid; w++) {
          const point = new Point(x, w);
          Draw.drawPixel(
            options.image,
            point,
            options.color,
            (frac >> 8) & 0xff
          );
          point.offset(0, 1);
          Draw.drawPixel(
            options.image,
            point,
            options.color,
            (xor(frac) >> 8) & 0xff
          );
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
      let x = line.startX;
      const inc = Math.trunc((line.dx * 65536) / line.dy);
      let frac = 0;

      for (let y = line.startY; y <= line.endY; y++) {
        const wstart = x - Math.trunc(wid / 2);
        for (let w = wstart; w < wstart + wid; w++) {
          const point = new Point(w, y);
          Draw.drawPixel(
            options.image,
            point,
            options.color,
            (frac >> 8) & 0xff
          );
          point.offset(1, 0);
          Draw.drawPixel(
            options.image,
            point,
            options.color,
            (xor(frac) >> 8) & 0xff
          );
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

    return options.image;
  }

  /**
   * Draw a single pixel into the image, applying alpha and opacity blending.
   */
  public static drawPixel(
    image: MemoryImage,
    pos: Point,
    color: number,
    opacity = 0xff
  ): MemoryImage {
    if (image.boundsSafe(pos.xt, pos.yt)) {
      const index = image.getBufferIndex(pos.xt, pos.yt);
      const dst = image.getPixelByIndex(index);
      image.setPixelByIndex(index, Color.alphaBlendColors(dst, color, opacity));
    }
    return image;
  }

  /**
   * Draw a rectangle in the image **dst** with the **color**.
   */
  public static drawRect(
    dst: MemoryImage,
    rect: Rectangle,
    color: number
  ): MemoryImage {
    Draw.drawLine({
      image: dst,
      line: new Line(rect.left, rect.top, rect.right, rect.top),
      color: color,
    });
    Draw.drawLine({
      image: dst,
      line: new Line(rect.right, rect.top, rect.right, rect.bottom),
      color: color,
    });
    Draw.drawLine({
      image: dst,
      line: new Line(rect.right, rect.bottom, rect.left, rect.bottom),
      color: color,
    });
    Draw.drawLine({
      image: dst,
      line: new Line(rect.left, rect.bottom, rect.left, rect.top),
      color: color,
    });
    return dst;
  }

  /**
   * Fill the 4-connected shape containing **x**,**y** in the image **src** with the
   * given **color**.
   */
  public static fillFlood(options: FillFloodOptions): MemoryImage {
    const threshold = options.threshold ?? 0;
    const compareAlpha = options.compareAlpha ?? false;

    const visited = new Uint8Array(options.src.width * options.src.height);

    let srcColor = options.src.getPixel(options.x, options.y);
    if (!compareAlpha) {
      srcColor = Color.setAlpha(srcColor, 0);
    }

    let array: FillFloodTestPixel | undefined = undefined;
    if (threshold > 0) {
      const lab = Color.rgbToLab(
        Color.getRed(srcColor),
        Color.getGreen(srcColor),
        Color.getBlue(srcColor)
      );
      if (compareAlpha) {
        lab.push(Color.getAlpha(srcColor));
      }
      array = (y: number, x: number) =>
        visited[y * options.src.width + x] === 0 &&
        Draw.testPixelLabColorDistance(options.src, x, y, lab, threshold);
    } else if (!compareAlpha) {
      array = (y: number, x: number) =>
        visited[y * options.src.width + x] === 0 &&
        Color.setAlpha(options.src.getPixel(x, y), 0) !== srcColor;
    } else {
      array = (y: number, x: number) =>
        visited[y * options.src.width + x] === 0 &&
        options.src.getPixel(x, y) !== srcColor;
    }

    const mark = (y: number, x: number) => {
      options.src.setPixel(x, y, options.color);
      visited[y * options.src.width + x] = 1;
    };

    Draw.fill4(options.src, options.x, options.y, array, mark, visited);
    return options.src;
  }

  /**
   * Create a mask describing the 4-connected shape containing **x**,**y** in the
   * image **src**.
   */
  public static maskFlood(options: MaskFloodOptions): Uint8Array {
    const threshold = options.threshold ?? 0;
    const compareAlpha = options.compareAlpha ?? false;
    const fillValue = options.fillValue ?? 255;

    const visited = new Uint8Array(options.src.width * options.src.height);

    let srcColor = options.src.getPixel(options.x, options.y);
    if (!compareAlpha) {
      srcColor = Color.setAlpha(srcColor, 0);
    }

    const ret = new Uint8Array(options.src.width * options.src.height);

    let array: FillFloodTestPixel | undefined = undefined;
    if (threshold > 0) {
      const lab = Color.rgbToLab(
        Color.getRed(srcColor),
        Color.getGreen(srcColor),
        Color.getBlue(srcColor)
      );
      if (compareAlpha) {
        lab.push(Color.getAlpha(srcColor));
      }
      array = (y: number, x: number) =>
        visited[y * options.src.width + x] === 0 &&
        (ret[y * options.src.width + x] !== 0 ||
          Draw.testPixelLabColorDistance(options.src, x, y, lab, threshold));
    } else if (!compareAlpha) {
      array = (y: number, x: number) =>
        visited[y * options.src.width + x] === 0 &&
        (ret[y * options.src.width + x] !== 0 ||
          Color.setAlpha(options.src.getPixel(x, y), 0) !== srcColor);
    } else {
      array = (y: number, x: number) =>
        visited[y * options.src.width + x] === 0 &&
        (ret[y * options.src.width + x] !== 0 ||
          options.src.getPixel(x, y) !== srcColor);
    }

    const mark = (y: number, x: number) => {
      ret[y * options.src.width + x] = fillValue;
      visited[y * options.src.width + x] = 1;
    };

    Draw.fill4(options.src, options.x, options.y, array, mark, visited);
    return ret;
  }

  /**
   * Fill a rectangle in the image **src** with the given **color** with the
   * coordinates defined by **rect**.
   */
  public static fillRect(
    src: MemoryImage,
    rect: Rectangle,
    color: number
  ): MemoryImage {
    const _x0 = MathOperators.clamp(rect.left, 0, src.width - 1);
    const _y0 = MathOperators.clamp(rect.top, 0, src.height - 1);
    const _x1 = MathOperators.clamp(rect.right, 0, src.width - 1);
    const _y1 = MathOperators.clamp(rect.bottom, 0, src.height - 1);

    // If no blending is necessary, use a faster fill method.
    if (Color.getAlpha(color) === 255) {
      const w = src.width;
      let start = _y0 * w + _x0;
      let end = start + (_x1 - _x0) + 1;
      for (let sy = _y0; sy <= _y1; ++sy) {
        src.data.fill(color, start, end);
        start += w;
        end += w;
      }
    } else {
      for (let sy = _y0; sy <= _y1; ++sy) {
        let pi = sy * src.width + _x0;
        for (let sx = _x0; sx <= _x1; ++sx, ++pi) {
          src.setPixelByIndex(
            pi,
            Color.alphaBlendColors(src.getPixelByIndex(pi), color)
          );
        }
      }
    }

    return src;
  }

  /**
   * Set all of the pixels of an **image** to the given **color**.
   */
  public static fill(image: MemoryImage, color: number): MemoryImage {
    return image.fill(color);
  }
}
