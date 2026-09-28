/** @format */

/**
 * Enum representing different color channels.
 */
export enum Channel {
  /**
   * Red color channel.
   */
  red,
  /**
   * Green color channel.
   */
  green,
  /**
   * Blue color channel.
   */
  blue,
  /**
   * Alpha (transparency) channel.
   */
  alpha,
  /**
   * Luminance channel.
   */
  luminance,
}

export const channelAlpha: number = Channel.alpha;

export const channelLuminance: number = Channel.luminance;
