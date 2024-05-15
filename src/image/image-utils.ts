/** @format */

import { Line } from '../common/line.js';
import { Point } from '../common/point.js';
import { Rectangle } from '../common/rectangle.js';
import { Pixel } from './pixel.js';

export abstract class ImageUtils {
  /**
   * Test if the pixel **p** is within the circle centered at **center** with a
   * squared radius of **rad2**. This will test the corners, edges, and center
   * of the pixel and return the ratio of samples within the circle.
   */
  public static circleTest(
    p: Pixel,
    center: Point,
    rad2: number,
    antialias = true
  ): number {
    let total = 0;
    const dx1 = p.x - center.x;
    const dy1 = p.y - center.y;
    const d1 = dx1 * dx1 + dy1 * dy1;
    const r1 = d1 <= rad2 ? 1 : 0;
    total += r1;

    const dx2 = p.x + 1 - center.x;
    const dy2 = p.y - center.y;
    const d2 = dx2 * dx2 + dy2 * dy2;
    const r2 = d2 <= rad2 ? 1 : 0;
    total += r2;

    const dx3 = p.x + 1 - center.x;
    const dy3 = p.y + 1 - center.y;
    const d3 = dx3 * dx3 + dy3 * dy3;
    const r3 = d3 <= rad2 ? 1 : 0;
    total += r3;

    const dx4 = p.x - center.x;
    const dy4 = p.y + 1 - center.y;
    const d4 = dx4 * dx4 + dy4 * dy4;
    const r4 = d4 <= rad2 ? 1 : 0;
    total += r4;

    const dx5 = p.x + 0.5 - center.x;
    const dy5 = p.y - center.y;
    const d5 = dx5 * dx5 + dy5 * dy5;
    const r5 = d5 <= rad2 ? 1 : 0;
    total += r5;

    const dx6 = p.x + 0.5 - center.x;
    const dy6 = p.y + 1 - center.y;
    const d6 = dx6 * dx6 + dy6 * dy6;
    const r6 = d6 <= rad2 ? 1 : 0;
    total += r6;

    const dx7 = p.x - center.x;
    const dy7 = p.y + 0.5 - center.y;
    const d7 = dx7 * dx7 + dy7 * dy7;
    const r7 = d7 <= rad2 ? 1 : 0;
    total += r7;

    const dx8 = p.x + 1 - center.x;
    const dy8 = p.y + 0.5 - center.y;
    const d8 = dx8 * dx8 + dy8 * dy8;
    const r8 = d8 <= rad2 ? 1 : 0;
    total += r8;

    const dx9 = p.x + 0.5 - center.x;
    const dy9 = p.y + 0.5 - center.y;
    const d9 = dx9 * dx9 + dy9 * dy9;
    const r9 = d9 <= rad2 ? 1 : 0;
    total += r9;

    return antialias ? total / 9 : total > 0 ? 1 : 0;
  }

  /**
   * Clip a line to a rectangle using the Cohen–Sutherland clipping algorithm.
   * **line** is a Line object.
   * **rect** is a Rectangle object.
   * Results are stored in **line**.
   * If **line** falls completely outside of **rect**, false is returned, otherwise
   * true is returned.
   */
  public static clipLine(rect: Rectangle, line: Line): boolean {
    const xmin = rect.left;
    const ymin = rect.top;
    const xmax = rect.right;
    const ymax = rect.bottom;

    // 0000
    const inside = 0;
    // 0001
    const left = 1;
    // 0010
    const right = 2;
    // 0100
    const bottom = 4;
    // 1000
    const top = 8;

    const computeOutCode = (p: Point): number => {
      // initialized as being inside of clip window
      let code = inside;
      if (p.x < xmin) {
        // to the left of clip window
        code |= left;
      } else if (p.x > xmax) {
        // to the right of clip window
        code |= right;
      }

      if (p.y < ymin) {
        // below the clip window
        code |= bottom;
      } else if (p.y > ymax) {
        // above the clip window
        code |= top;
      }

      return code;
    };

    // compute outcodes for P0, P1, and whatever point lies outside the clip rectangle
    let outcode1 = computeOutCode(new Point(line.x1, line.y1));
    let outcode2 = computeOutCode(new Point(line.x2, line.y2));
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
        if ((outcodeOut & top) !== 0) {
          // point is above the clip rectangle
          x = line.x1 + Math.trunc((line.dx * (ymax - line.y1)) / line.dy);
          y = ymax;
        } else if ((outcodeOut & bottom) !== 0) {
          // point is below the clip rectangle
          x = line.x1 + Math.trunc((line.dx * (ymin - line.y1)) / line.dy);
          y = ymin;
        } else if ((outcodeOut & right) !== 0) {
          // point is to the right of clip rectangle
          y = line.y1 + Math.trunc((line.dy * (xmax - line.x1)) / line.dx);
          x = xmax;
        } else if ((outcodeOut & left) !== 0) {
          // point is to the left of clip rectangle
          y = line.y1 + Math.trunc((line.dy * (xmin - line.x1)) / line.dx);
          x = xmin;
        }

        // Now we move outside point to intersection point to clip
        // and get ready for next pass.
        if (outcodeOut === outcode1) {
          line.movePoint1(x, y);
          outcode1 = computeOutCode(new Point(line.x1, line.y1));
        } else {
          line.movePoint2(x, y);
          outcode2 = computeOutCode(new Point(line.x2, line.y2));
        }
      }
    }

    return accept;
  }
}
