/** @format */

export class PsdBlendMode {
  // 'pass'
  public static readonly passThrough: number = 0x70617373;
  // 'norm'
  public static readonly normal: number = 0x6e6f726d;
  // 'diss'
  public static readonly dissolve: number = 0x64697373;
  // 'dark'
  public static readonly darken: number = 0x6461726b;
  // 'mul '
  public static readonly multiply: number = 0x6d756c20;
  // 'idiv'
  public static readonly colorBurn: number = 0x69646976;
  // 'lbrn'
  public static readonly linearBurn: number = 0x6c62726e;
  // 'dkCl'
  public static readonly darkenColor: number = 0x646b436c;
  // 'lite'
  public static readonly lighten: number = 0x6c697465;
  // 'scrn'
  public static readonly screen: number = 0x7363726e;
  // 'div '
  public static readonly colorDodge: number = 0x64697620;
  // 'lddg'
  public static readonly linearDodge: number = 0x6c646467;
  // 'lgCl'
  public static readonly lighterColor: number = 0x6c67436c;
  // 'over'
  public static readonly overlay: number = 0x6f766572;
  // 'sLit'
  public static readonly softLight: number = 0x734c6974;
  // 'hLit'
  public static readonly hardLight: number = 0x684c6974;
  // 'vLit'
  public static readonly vividLight: number = 0x764c6974;
  // lLit'
  public static readonly linearLight: number = 0x6c4c6974;
  // 'pLit'
  public static readonly pinLight: number = 0x704c6974;
  // 'hMix'
  public static readonly hardMix: number = 0x684d6978;
  // 'diff'
  public static readonly difference: number = 0x64696666;
  // 'smud'
  public static readonly exclusion: number = 0x736d7564;
  // 'fsub'
  public static readonly subtract: number = 0x66737562;
  // 'fdiv'
  public static readonly divide: number = 0x66646976;
  // 'hue '
  public static readonly hue: number = 0x68756520;
  // 'sat '
  public static readonly saturation: number = 0x73617420;
  // 'colr'
  public static readonly color: number = 0x636f6c72;
  // 'lum '
  public static readonly luminosity: number = 0x6c756d20;

  private _value: number;
  public get value(): number {
    return this._value;
  }

  constructor(value: number) {
    this._value = value;
  }
}
