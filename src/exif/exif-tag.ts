/** @format */

import { ExifValueType } from './exif-value-type';

export interface ExifTagInitOptions {
  name: string;
  type?: ExifValueType;
  count?: number;
}

export class ExifTag {
  private readonly _name: string;
  public get name(): string {
    return this._name;
  }

  private readonly _type: ExifValueType;
  public get type(): ExifValueType {
    return this._type;
  }

  private _count: number;
  public get count(): number {
    return this._count;
  }

  constructor(options: ExifTagInitOptions) {
    this._name = options.name;
    this._type = options.type ?? ExifValueType.none;
    this._count = options.count ?? 1;
  }
}

export const ExifTagNameToID = new Map<string, number>([
  ['ProcessingSoftware', 0xb],
  ['SubfileType', 0xfe],
  ['OldSubfileType', 0xff],
  ['ImageWidth', 0x100],
  ['ImageLength', 0x101],
  // alias for a more common name.
  ['ImageHeight', 0x101],
  ['BitsPerSample', 0x102],
  ['Compression', 0x103],
  ['PhotometricInterpretation', 0x106],
  ['Thresholding', 0x107],
  ['CellWidth', 0x108],
  ['CellLength', 0x109],
  ['FillOrder', 0x10a],
  ['DocumentName', 0x10d],
  ['ImageDescription', 0x10e],
  ['Make', 0x10f],
  ['Model', 0x110],
  ['StripOffsets', 0x111],
  ['Orientation', 0x112],
  ['SamplesPerPixel', 0x115],
  ['RowsPerStrip', 0x116],
  ['StripByteCounts', 0x117],
  ['MinSampleValue', 0x118],
  ['MaxSampleValue', 0x119],
  ['XResolution', 0x11a],
  ['YResolution', 0x11b],
  ['PlanarConfiguration', 0x11c],
  ['PageName', 0x11d],
  ['XPosition', 0x11e],
  ['YPosition', 0x11f],
  ['GrayResponseUnit', 0x122],
  ['GrayResponseCurve', 0x123],
  ['T4Options', 0x124],
  ['T6Options', 0x125],
  ['ResolutionUnit', 0x128],
  ['PageNumber', 0x129],
  ['ColorResponseUnit', 0x12c],
  ['TransferFunction', 0x12d],
  ['Software', 0x131],
  ['DateTime', 0x132],
  ['Artist', 0x13b],
  ['HostComputer', 0x13c],
  ['Predictor', 0x13d],
  ['WhitePoint', 0x13e],
  ['PrimaryChromaticities', 0x13f],
  ['ColorMap', 0x140],
  ['HalftoneHints', 0x141],
  ['TileWidth', 0x142],
  ['TileLength', 0x143],
  ['TileOffsets', 0x144],
  ['TileByteCounts', 0x145],
  ['BadFaxLines', 0x146],
  ['CleanFaxData', 0x147],
  ['ConsecutiveBadFaxLines', 0x148],
  ['InkSet', 0x14c],
  ['InkNames', 0x14d],
  ['NumberofInks', 0x14e],
  ['DotRange', 0x150],
  ['TargetPrinter', 0x151],
  ['ExtraSamples', 0x152],
  ['SampleFormat', 0x153],
  ['SMinSampleValue', 0x154],
  ['SMaxSampleValue', 0x155],
  ['TransferRange', 0x156],
  ['ClipPath', 0x157],
  ['JPEGProc', 0x200],
  ['JPEGInterchangeFormat', 0x201],
  ['JPEGInterchangeFormatLength', 0x202],
  ['YCbCrCoefficients', 0x211],
  ['YCbCrSubSampling', 0x212],
  ['YCbCrPositioning', 0x213],
  ['ReferenceBlackWhite', 0x214],
  ['ApplicationNotes', 0x2bc],
  ['Rating', 0x4746],
  ['CFARepeatPatternDim', 0x828d],
  ['CFAPattern', 0x828e],
  ['BatteryLevel', 0x828f],
  ['Copyright', 0x8298],
  ['ExposureTime', 0x829a],
  ['FNumber', 0x829d],
  ['IPTC-NAA', 0x83bb],
  ['ExifOffset', 0x8769],
  ['InterColorProfile', 0x8773],
  ['ExposureProgram', 0x8822],
  ['SpectralSensitivity', 0x8824],
  ['GPSOffset', 0x8825],
  ['ISOSpeed', 0x8827],
  ['OECF', 0x8828],
  ['SensitivityType', 0x8830],
  ['RecommendedExposureIndex', 0x8832],
  ['ExifVersion', 0x9000],
  ['DateTimeOriginal', 0x9003],
  ['DateTimeDigitized', 0x9004],
  ['OffsetTime', 0x9010],
  ['OffsetTimeOriginal', 0x9011],
  ['OffsetTimeDigitized', 0x9012],
  ['ComponentsConfiguration', 0x9101],
  ['CompressedBitsPerPixel', 0x9102],
  ['ShutterSpeedValue', 0x9201],
  ['ApertureValue', 0x9202],
  ['BrightnessValue', 0x9203],
  ['ExposureBiasValue', 0x9204],
  ['MaxApertureValue', 0x9205],
  ['SubjectDistance', 0x9206],
  ['MeteringMode', 0x9207],
  ['LightSource', 0x9208],
  ['Flash', 0x9209],
  ['FocalLength', 0x920a],
  ['SubjectArea', 0x9214],
  ['MakerNote', 0x927c],
  ['UserComment', 0x9286],
  ['SubSecTime', 0x9290],
  ['SubSecTimeOriginal', 0x9291],
  ['SubSecTimeDigitized', 0x9292],
  ['XPTitle', 0x9c9b],
  ['XPComment', 0x9c9c],
  ['XPAuthor', 0x9c9d],
  ['XPKeywords', 0x9c9e],
  ['XPSubject', 0x9c9f],
  ['FlashPixVersion', 0xa000],
  ['ColorSpace', 0xa001],
  ['ExifImageWidth', 0xa002],
  ['ExifImageLength', 0xa003],
  ['RelatedSoundFile', 0xa004],
  ['InteroperabilityOffset', 0xa005],
  ['FlashEnergy', 0xa20b],
  ['SpatialFrequencyResponse', 0xa20c],
  ['FocalPlaneXResolution', 0xa20e],
  ['FocalPlaneYResolution', 0xa20f],
  ['FocalPlaneResolutionUnit', 0xa210],
  ['SubjectLocation', 0xa214],
  ['ExposureIndex', 0xa215],
  ['SensingMethod', 0xa217],
  ['FileSource', 0xa300],
  ['SceneType', 0xa301],
  ['CVAPattern', 0xa302],
  ['CustomRendered', 0xa401],
  ['ExposureMode', 0xa402],
  ['WhiteBalance', 0xa403],
  ['DigitalZoomRatio', 0xa404],
  ['FocalLengthIn35mmFilm', 0xa405],
  ['SceneCaptureType', 0xa406],
  ['GainControl', 0xa407],
  ['Contrast', 0xa408],
  ['Saturation', 0xa409],
  ['Sharpness', 0xa40a],
  ['DeviceSettingDescription', 0xa40b],
  ['SubjectDistanceRange', 0xa40c],
  ['ImageUniqueID', 0xa420],
  ['CameraOwnerName', 0xa430],
  ['BodySerialNumber', 0xa431],
  ['LensSpecification', 0xa432],
  ['LensMake', 0xa433],
  ['LensModel', 0xa434],
  ['LensSerialNumber', 0xa435],
  ['Gamma', 0xa500],
  ['PrintIM', 0xc4a5],
  ['Padding', 0xea1c],
  ['OffsetSchema', 0xea1d],
  ['OwnerName', 0xfde8],
  ['SerialNumber', 0xfde9],
  ['InteropIndex', 0x1],
  ['InteropVersion', 0x2],
  ['RelatedImageFileFormat', 0x1000],
  ['RelatedImageWidth', 0x1001],
  ['RelatedImageLength', 0x1002],
  ['GPSVersionID', 0x0],
  ['GPSLatitudeRef', 0x1],
  ['GPSLatitude', 0x2],
  ['GPSLongitudeRef', 0x3],
  ['GPSLongitude', 0x4],
  ['GPSAltitudeRef', 0x5],
  ['GPSAltitude', 0x6],
  ['GPSTimeStamp', 0x7],
  ['GPSSatellites', 0x8],
  ['GPSStatus', 0x9],
  ['GPSMeasureMode', 0xa],
  ['GPSDOP', 0xb],
  ['GPSSpeedRef', 0xc],
  ['GPSSpeed', 0xd],
  ['GPSTrackRef', 0xe],
  ['GPSTrack', 0xf],
  ['GPSImgDirectionRef', 0x10],
  ['GPSImgDirection', 0x11],
  ['GPSMapDatum', 0x12],
  ['GPSDestLatitudeRef', 0x13],
  ['GPSDestLatitude', 0x14],
  ['GPSDestLongitudeRef', 0x15],
  ['GPSDestLongitude', 0x16],
  ['GPSDestBearingRef', 0x17],
  ['GPSDestBearing', 0x18],
  ['GPSDestDistanceRef', 0x19],
  ['GPSDestDistance', 0x1a],
  ['GPSProcessingMethod', 0x1b],
  ['GPSAreaInformation', 0x1c],
  ['GPSDate', 0x1d],
  ['GPSDifferential', 0x1e],
]);

export const ExifImageTags = new Map<number, ExifTag>([
  [
    0x000b,
    new ExifTag({
      name: 'ProcessingSoftware',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x00fe,
    new ExifTag({
      name: 'SubfileType',
      type: ExifValueType.long,
    }),
  ],
  [
    0x00ff,
    new ExifTag({
      name: 'OldSubfileType',
      type: ExifValueType.long,
    }),
  ],
  [
    0x0100,
    new ExifTag({
      name: 'ImageWidth',
      type: ExifValueType.long,
    }),
  ],
  [
    0x0101,
    new ExifTag({
      name: 'ImageLength',
      type: ExifValueType.long,
    }),
  ],
  [
    0x0102,
    new ExifTag({
      name: 'BitsPerSample',
      type: ExifValueType.short,
    }),
  ],
  [
    0x0103,
    new ExifTag({
      name: 'Compression',
      type: ExifValueType.short,
    }),
  ],
  [
    0x0106,
    new ExifTag({
      name: 'PhotometricInterpretation',
      type: ExifValueType.short,
    }),
  ],
  [
    0x0107,
    new ExifTag({
      name: 'Thresholding',
      type: ExifValueType.short,
    }),
  ],
  [
    0x0108,
    new ExifTag({
      name: 'CellWidth',
      type: ExifValueType.short,
    }),
  ],
  [
    0x0109,
    new ExifTag({
      name: 'CellLength',
      type: ExifValueType.short,
    }),
  ],
  [
    0x010a,
    new ExifTag({
      name: 'FillOrder',
      type: ExifValueType.short,
    }),
  ],
  [
    0x010d,
    new ExifTag({
      name: 'DocumentName',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x010e,
    new ExifTag({
      name: 'ImageDescription',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x010f,
    new ExifTag({
      name: 'Make',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x0110,
    new ExifTag({
      name: 'Model',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x0111,
    new ExifTag({
      name: 'StripOffsets',
      type: ExifValueType.long,
    }),
  ],
  [
    0x0112,
    new ExifTag({
      name: 'Orientation',
      type: ExifValueType.short,
    }),
  ],
  [
    0x0115,
    new ExifTag({
      name: 'SamplesPerPixel',
      type: ExifValueType.short,
    }),
  ],
  [
    0x0116,
    new ExifTag({
      name: 'RowsPerStrip',
      type: ExifValueType.long,
    }),
  ],
  [
    0x0117,
    new ExifTag({
      name: 'StripByteCounts',
      type: ExifValueType.long,
    }),
  ],
  [
    0x0118,
    new ExifTag({
      name: 'MinSampleValue',
      type: ExifValueType.short,
    }),
  ],
  [
    0x0119,
    new ExifTag({
      name: 'MaxSampleValue',
      type: ExifValueType.short,
    }),
  ],
  [
    0x011a,
    new ExifTag({
      name: 'XResolution',
      type: ExifValueType.rational,
    }),
  ],
  [
    0x011b,
    new ExifTag({
      name: 'YResolution',
      type: ExifValueType.rational,
    }),
  ],
  [
    0x011c,
    new ExifTag({
      name: 'PlanarConfiguration',
      type: ExifValueType.short,
    }),
  ],
  [
    0x011d,
    new ExifTag({
      name: 'PageName',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x011e,
    new ExifTag({
      name: 'XPosition',
      type: ExifValueType.rational,
    }),
  ],
  [
    0x011f,
    new ExifTag({
      name: 'YPosition',
      type: ExifValueType.rational,
    }),
  ],
  [
    0x0122,
    new ExifTag({
      name: 'GrayResponseUnit',
      type: ExifValueType.short,
    }),
  ],
  [
    0x0123,
    new ExifTag({
      name: 'GrayResponseCurve',
    }),
  ],
  [
    0x0124,
    new ExifTag({
      name: 'T4Options',
    }),
  ],
  [
    0x0125,
    new ExifTag({
      name: 'T6Options',
    }),
  ],
  [
    0x0128,
    new ExifTag({
      name: 'ResolutionUnit',
      type: ExifValueType.short,
    }),
  ],
  [
    0x0129,
    new ExifTag({
      name: 'PageNumber',
      type: ExifValueType.short,
      count: 2,
    }),
  ],
  [
    0x012c,
    new ExifTag({
      name: 'ColorResponseUnit',
    }),
  ],
  [
    0x012d,
    new ExifTag({
      name: 'TransferFunction',
      type: ExifValueType.short,
      count: 768,
    }),
  ],
  [
    0x0131,
    new ExifTag({
      name: 'Software',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x0132,
    new ExifTag({
      name: 'DateTime',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x013b,
    new ExifTag({
      name: 'Artist',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x013c,
    new ExifTag({
      name: 'HostComputer',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x013d,
    new ExifTag({
      name: 'Predictor',
      type: ExifValueType.short,
    }),
  ],
  [
    0x013e,
    new ExifTag({
      name: 'WhitePoint',
      type: ExifValueType.rational,
      count: 2,
    }),
  ],
  [
    0x013f,
    new ExifTag({
      name: 'PrimaryChromaticities',
      type: ExifValueType.rational,
      count: 6,
    }),
  ],
  [
    0x0140,
    new ExifTag({
      name: 'ColorMap',
    }),
  ],
  [
    0x0141,
    new ExifTag({
      name: 'HalftoneHints',
      type: ExifValueType.short,
      count: 2,
    }),
  ],
  [
    0x0142,
    new ExifTag({
      name: 'TileWidth',
      type: ExifValueType.long,
    }),
  ],
  [
    0x0143,
    new ExifTag({
      name: 'TileLength',
      type: ExifValueType.long,
    }),
  ],
  [
    0x0144,
    new ExifTag({
      name: 'TileOffsets',
    }),
  ],
  [
    0x0145,
    new ExifTag({
      name: 'TileByteCounts',
    }),
  ],
  [
    0x0146,
    new ExifTag({
      name: 'BadFaxLines',
    }),
  ],
  [
    0x0147,
    new ExifTag({
      name: 'CleanFaxData',
    }),
  ],
  [
    0x0148,
    new ExifTag({
      name: 'ConsecutiveBadFaxLines',
    }),
  ],
  [
    0x014c,
    new ExifTag({
      name: 'InkSet',
    }),
  ],
  [
    0x014d,
    new ExifTag({
      name: 'InkNames',
    }),
  ],
  [
    0x014e,
    new ExifTag({
      name: 'NumberofInks',
    }),
  ],
  [
    0x0150,
    new ExifTag({
      name: 'DotRange',
    }),
  ],
  [
    0x0151,
    new ExifTag({
      name: 'TargetPrinter',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x0152,
    new ExifTag({
      name: 'ExtraSamples',
    }),
  ],
  [
    0x0153,
    new ExifTag({
      name: 'SampleFormat',
    }),
  ],
  [
    0x0154,
    new ExifTag({
      name: 'SMinSampleValue',
    }),
  ],
  [
    0x0155,
    new ExifTag({
      name: 'SMaxSampleValue',
    }),
  ],
  [
    0x0156,
    new ExifTag({
      name: 'TransferRange',
    }),
  ],
  [
    0x0157,
    new ExifTag({
      name: 'ClipPath',
    }),
  ],
  [
    0x0200,
    new ExifTag({
      name: 'JPEGProc',
    }),
  ],
  [
    0x0201,
    new ExifTag({
      name: 'JPEGInterchangeFormat',
    }),
  ],
  [
    0x0202,
    new ExifTag({
      name: 'JPEGInterchangeFormatLength',
    }),
  ],
  [
    0x0211,
    new ExifTag({
      name: 'YCbCrCoefficients',
      type: ExifValueType.rational,
      count: 3,
    }),
  ],
  [
    0x0212,
    new ExifTag({
      name: 'YCbCrSubSampling',
      type: ExifValueType.short,
    }),
  ],
  [
    0x0213,
    new ExifTag({
      name: 'YCbCrPositioning',
      type: ExifValueType.short,
    }),
  ],
  [
    0x0214,
    new ExifTag({
      name: 'ReferenceBlackWhite',
      type: ExifValueType.rational,
      count: 6,
    }),
  ],
  // XPM Info
  [
    0x02bc,
    new ExifTag({
      name: 'ApplicationNotes',
      type: ExifValueType.short,
    }),
  ],
  [
    0x4746,
    new ExifTag({
      name: 'Rating',
      type: ExifValueType.short,
    }),
  ],
  [
    0x828d,
    new ExifTag({
      name: 'CFARepeatPatternDim',
    }),
  ],
  [
    0x828e,
    new ExifTag({
      name: 'CFAPattern',
    }),
  ],
  [
    0x828f,
    new ExifTag({
      name: 'BatteryLevel',
    }),
  ],
  [
    0x8298,
    new ExifTag({
      name: 'Copyright',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x829a,
    new ExifTag({
      name: 'ExposureTime',
      type: ExifValueType.rational,
    }),
  ],
  [
    0x829d,
    new ExifTag({
      name: 'FNumber',
      type: ExifValueType.rational,
    }),
  ],
  [
    0x83bb,
    new ExifTag({
      name: 'IPTC-NAA',
      type: ExifValueType.long,
    }),
  ],
  // Exif Tags
  [
    0x8769,
    new ExifTag({
      name: 'ExifOffset',
    }),
  ],
  [
    0x8773,
    new ExifTag({
      name: 'InterColorProfile',
    }),
  ],
  [
    0x8822,
    new ExifTag({
      name: 'ExposureProgram',
      type: ExifValueType.short,
    }),
  ],
  [
    0x8824,
    new ExifTag({
      name: 'SpectralSensitivity',
      type: ExifValueType.ascii,
    }),
  ],
  // GPS tags
  [
    0x8825,
    new ExifTag({
      name: 'GPSOffset',
    }),
  ],
  [
    0x8827,
    new ExifTag({
      name: 'ISOSpeed',
      type: ExifValueType.long,
    }),
  ],
  [
    0x8828,
    new ExifTag({
      name: 'OECF',
    }),
  ],
  [
    0x8830,
    new ExifTag({
      name: 'SensitivityType',
      type: ExifValueType.short,
    }),
  ],
  [
    0x8832,
    new ExifTag({
      name: 'RecommendedExposureIndex',
      type: ExifValueType.long,
    }),
  ],
  [
    0x8833,
    new ExifTag({
      name: 'ISOSpeed',
      type: ExifValueType.long,
    }),
  ],
  [
    0x9000,
    new ExifTag({
      name: 'ExifVersion',
      type: ExifValueType.undefined,
    }),
  ],
  [
    0x9003,
    new ExifTag({
      name: 'DateTimeOriginal',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x9004,
    new ExifTag({
      name: 'DateTimeDigitized',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x9010,
    new ExifTag({
      name: 'OffsetTime',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x9011,
    new ExifTag({
      name: 'OffsetTimeOriginal',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x9012,
    new ExifTag({
      name: 'OffsetTimeDigitized',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x9101,
    new ExifTag({
      name: 'ComponentsConfiguration',
    }),
  ],
  [
    0x9102,
    new ExifTag({
      name: 'CompressedBitsPerPixel',
    }),
  ],
  [
    0x9201,
    new ExifTag({
      name: 'ShutterSpeedValue',
    }),
  ],
  [
    0x9202,
    new ExifTag({
      name: 'ApertureValue',
    }),
  ],
  [
    0x9203,
    new ExifTag({
      name: 'BrightnessValue',
    }),
  ],
  [
    0x9204,
    new ExifTag({
      name: 'ExposureBiasValue',
    }),
  ],
  [
    0x9205,
    new ExifTag({
      name: 'MaxApertureValue',
    }),
  ],
  [
    0x9206,
    new ExifTag({
      name: 'SubjectDistance',
    }),
  ],
  [
    0x9207,
    new ExifTag({
      name: 'MeteringMode',
    }),
  ],
  [
    0x9208,
    new ExifTag({
      name: 'LightSource',
    }),
  ],
  [
    0x9209,
    new ExifTag({
      name: 'Flash',
    }),
  ],
  [
    0x920a,
    new ExifTag({
      name: 'FocalLength',
    }),
  ],
  [
    0x9214,
    new ExifTag({
      name: 'SubjectArea',
    }),
  ],
  [
    0x927c,
    new ExifTag({
      name: 'MakerNote',
    }),
  ],
  [
    0x9286,
    new ExifTag({
      name: 'UserComment',
    }),
  ],
  [
    0x9290,
    new ExifTag({
      name: 'SubSecTime',
    }),
  ],
  [
    0x9291,
    new ExifTag({
      name: 'SubSecTimeOriginal',
    }),
  ],
  [
    0x9292,
    new ExifTag({
      name: 'SubSecTimeDigitized',
    }),
  ],
  [
    0x9c9b,
    new ExifTag({
      name: 'XPTitle',
    }),
  ],
  [
    0x9c9c,
    new ExifTag({
      name: 'XPComment',
    }),
  ],
  [
    0x9c9d,
    new ExifTag({
      name: 'XPAuthor',
    }),
  ],
  [
    0x9c9e,
    new ExifTag({
      name: 'XPKeywords',
    }),
  ],
  [
    0x9c9f,
    new ExifTag({
      name: 'XPSubject',
    }),
  ],
  [
    0xa000,
    new ExifTag({
      name: 'FlashPixVersion',
    }),
  ],
  [
    0xa001,
    new ExifTag({
      name: 'ColorSpace',
      type: ExifValueType.short,
    }),
  ],
  [
    0xa002,
    new ExifTag({
      name: 'ExifImageWidth',
      type: ExifValueType.short,
    }),
  ],
  [
    0xa003,
    new ExifTag({
      name: 'ExifImageLength',
      type: ExifValueType.short,
    }),
  ],
  [
    0xa004,
    new ExifTag({
      name: 'RelatedSoundFile',
    }),
  ],
  [
    0xa005,
    new ExifTag({
      name: 'InteroperabilityOffset',
    }),
  ],
  // [0x920B in TIFF/EP
  [
    0xa20b,
    new ExifTag({
      name: 'FlashEnergy',
    }),
  ],
  [
    0xa20c,
    new ExifTag({
      name: 'SpatialFrequencyResponse',
    }),
  ],
  [
    0xa20e,
    new ExifTag({
      name: 'FocalPlaneXResolution',
    }),
  ],
  [
    0xa20f,
    new ExifTag({
      name: 'FocalPlaneYResolution',
    }),
  ],
  [
    0xa210,
    new ExifTag({
      name: 'FocalPlaneResolutionUnit',
    }),
  ],
  [
    0xa214,
    new ExifTag({
      name: 'SubjectLocation',
    }),
  ],
  [
    0xa215,
    new ExifTag({
      name: 'ExposureIndex',
    }),
  ],
  [
    0xa217,
    new ExifTag({
      name: 'SensingMethod',
    }),
  ],
  [
    0xa300,
    new ExifTag({
      name: 'FileSource',
    }),
  ],
  [
    0xa301,
    new ExifTag({
      name: 'SceneType',
    }),
  ],
  [
    0xa302,
    new ExifTag({
      name: 'CVAPattern',
    }),
  ],
  [
    0xa401,
    new ExifTag({
      name: 'CustomRendered',
    }),
  ],
  [
    0xa402,
    new ExifTag({
      name: 'ExposureMode',
    }),
  ],
  [
    0xa403,
    new ExifTag({
      name: 'WhiteBalance',
    }),
  ],
  [
    0xa404,
    new ExifTag({
      name: 'DigitalZoomRatio',
    }),
  ],
  [
    0xa405,
    new ExifTag({
      name: 'FocalLengthIn35mmFilm',
    }),
  ],
  [
    0xa406,
    new ExifTag({
      name: 'SceneCaptureType',
    }),
  ],
  [
    0xa407,
    new ExifTag({
      name: 'GainControl',
    }),
  ],
  [
    0xa408,
    new ExifTag({
      name: 'Contrast',
    }),
  ],
  [
    0xa409,
    new ExifTag({
      name: 'Saturation',
    }),
  ],
  [
    0xa40a,
    new ExifTag({
      name: 'Sharpness',
    }),
  ],
  [
    0xa40b,
    new ExifTag({
      name: 'DeviceSettingDescription',
    }),
  ],
  [
    0xa40c,
    new ExifTag({
      name: 'SubjectDistanceRange',
    }),
  ],
  [
    0xa420,
    new ExifTag({
      name: 'ImageUniqueID',
    }),
  ],
  [
    0xa430,
    new ExifTag({
      name: 'CameraOwnerName',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0xa431,
    new ExifTag({
      name: 'BodySerialNumber',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0xa432,
    new ExifTag({
      name: 'LensSpecification',
    }),
  ],
  [
    0xa433,
    new ExifTag({
      name: 'LensMake',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0xa434,
    new ExifTag({
      name: 'LensModel',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0xa435,
    new ExifTag({
      name: 'LensSerialNumber',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0xa500,
    new ExifTag({
      name: 'Gamma',
      type: ExifValueType.rational,
    }),
  ],
  [
    0xc4a5,
    new ExifTag({
      name: 'PrintIM',
    }),
  ],
  [
    0xea1c,
    new ExifTag({
      name: 'Padding',
    }),
  ],
  [
    0xea1d,
    new ExifTag({
      name: 'OffsetSchema',
    }),
  ],
  [
    0xfde8,
    new ExifTag({
      name: 'OwnerName',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0xfde9,
    new ExifTag({
      name: 'SerialNumber',
      type: ExifValueType.ascii,
    }),
  ],
]);

export const ExifInteropTags = new Map<number, ExifTag>([
  [
    0x0001,
    new ExifTag({
      name: 'InteropIndex',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x0002,
    new ExifTag({
      name: 'InteropVersion',
      type: ExifValueType.undefined,
    }),
  ],
  [
    0x1000,
    new ExifTag({
      name: 'RelatedImageFileFormat',
      type: ExifValueType.ascii,
    }),
  ],
  [
    0x1001,
    new ExifTag({
      name: 'RelatedImageWidth',
      type: ExifValueType.short,
    }),
  ],
  [
    0x1002,
    new ExifTag({
      name: 'RelatedImageLength',
      type: ExifValueType.short,
    }),
  ],
]);

export const ExifGpsTags = new Map<number, ExifTag>([
  [
    0x0000,
    new ExifTag({
      name: 'GPSVersionID',
    }),
  ],
  [
    0x0001,
    new ExifTag({
      name: 'GPSLatitudeRef',
    }),
  ],
  [
    0x0002,
    new ExifTag({
      name: 'GPSLatitude',
    }),
  ],
  [
    0x0003,
    new ExifTag({
      name: 'GPSLongitudeRef',
    }),
  ],
  [
    0x0004,
    new ExifTag({
      name: 'GPSLongitude',
    }),
  ],
  [
    0x0005,
    new ExifTag({
      name: 'GPSAltitudeRef',
    }),
  ],
  [
    0x0006,
    new ExifTag({
      name: 'GPSAltitude',
    }),
  ],
  [
    0x0007,
    new ExifTag({
      name: 'GPSTimeStamp',
    }),
  ],
  [
    0x0008,
    new ExifTag({
      name: 'GPSSatellites',
    }),
  ],
  [
    0x0009,
    new ExifTag({
      name: 'GPSStatus',
    }),
  ],
  [
    0x000a,
    new ExifTag({
      name: 'GPSMeasureMode',
    }),
  ],
  [
    0x000b,
    new ExifTag({
      name: 'GPSDOP',
    }),
  ],
  [
    0x000c,
    new ExifTag({
      name: 'GPSSpeedRef',
    }),
  ],
  [
    0x000d,
    new ExifTag({
      name: 'GPSSpeed',
    }),
  ],
  [
    0x000e,
    new ExifTag({
      name: 'GPSTrackRef',
    }),
  ],
  [
    0x000f,
    new ExifTag({
      name: 'GPSTrack',
    }),
  ],
  [
    0x0010,
    new ExifTag({
      name: 'GPSImgDirectionRef',
    }),
  ],
  [
    0x0011,
    new ExifTag({
      name: 'GPSImgDirection',
    }),
  ],
  [
    0x0012,
    new ExifTag({
      name: 'GPSMapDatum',
    }),
  ],
  [
    0x0013,
    new ExifTag({
      name: 'GPSDestLatitudeRef',
    }),
  ],
  [
    0x0014,
    new ExifTag({
      name: 'GPSDestLatitude',
    }),
  ],
  [
    0x0015,
    new ExifTag({
      name: 'GPSDestLongitudeRef',
    }),
  ],
  [
    0x0016,
    new ExifTag({
      name: 'GPSDestLongitude',
    }),
  ],
  [
    0x0017,
    new ExifTag({
      name: 'GPSDestBearingRef',
    }),
  ],
  [
    0x0018,
    new ExifTag({
      name: 'GPSDestBearing',
    }),
  ],
  [
    0x0019,
    new ExifTag({
      name: 'GPSDestDistanceRef',
    }),
  ],
  [
    0x001a,
    new ExifTag({
      name: 'GPSDestDistance',
    }),
  ],
  [
    0x001b,
    new ExifTag({
      name: 'GPSProcessingMethod',
    }),
  ],
  [
    0x001c,
    new ExifTag({
      name: 'GPSAreaInformation',
    }),
  ],
  [
    0x001d,
    new ExifTag({
      name: 'GPSDate',
    }),
  ],
  [
    0x001e,
    new ExifTag({
      name: 'GPSDifferential',
    }),
  ],
]);
