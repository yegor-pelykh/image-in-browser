/** @format */

/**
 * Enum representing different channel orders.
 */
export enum ChannelOrder {
  rgba,
  bgra,
  abgr,
  argb,
  rgb,
  bgr,
  grayAlpha,
  red,
}

/**
 * Map representing the length of each channel order.
 */
export const ChannelOrderLength = new Map<ChannelOrder, number>([
  [ChannelOrder.rgba, 4],
  [ChannelOrder.bgra, 4],
  [ChannelOrder.abgr, 4],
  [ChannelOrder.argb, 4],
  [ChannelOrder.rgb, 3],
  [ChannelOrder.bgr, 3],
  [ChannelOrder.grayAlpha, 2],
  [ChannelOrder.red, 1],
]);
