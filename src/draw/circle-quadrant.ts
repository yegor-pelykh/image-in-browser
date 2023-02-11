/** @format */

export enum CircleQuadrant {
  topLeft = 1,
  topRight = 2,
  bottomLeft = 4,
  bottomRight = 8,
  all = topLeft | topRight | bottomLeft | bottomRight,
}
