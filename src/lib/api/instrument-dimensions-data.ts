/**
 * Expanded Instrument Dimensions Data
 * 
 * This module provides an expanded set of instrument dimensions data
 * for desktop and handheld electronic instruments.
 */

export interface InstrumentDimensions {
  instrumentType: string;
  brand: string;
  model: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  compatibleCaseDimensions: {
    minLength: number;
    maxLength: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    unit: string;
  };
  accessorySpace?: {
    required: boolean;
    description: string;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
  };
  lastVerified: Date;
}

export const desktopSynthesizers: InstrumentDimensions[] = [
  {
    instrumentType: 'synthesizer',
    brand: 'Korg',
    model: 'Minilogue',
    dimensions: { length: 19.69, width: 11.85, height: 2.83, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 20.5, maxLength: 22,
      minWidth: 12.5, maxWidth: 14,
      minHeight: 3.5, maxHeight: 6,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables',
      dimensions: { length: 6, width: 4, height: 2, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'synthesizer',
    brand: 'Korg',
    model: 'Minilogue XD',
    dimensions: { length: 19.69, width: 11.85, height: 2.83, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 20.5, maxLength: 22,
      minWidth: 12.5, maxWidth: 14,
      minHeight: 3.5, maxHeight: 6,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables',
      dimensions: { length: 6, width: 4, height: 2, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'synthesizer',
    brand: 'Korg',
    model: 'Prologue 8',
    dimensions: { length: 25.63, width: 14.76, height: 4.84, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 26.5, maxLength: 28,
      minWidth: 15.5, maxWidth: 17,
      minHeight: 5.5, maxHeight: 8,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables',
      dimensions: { length: 8, width: 6, height: 3, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'synthesizer',
    brand: 'Korg',
    model: 'Prologue 16',
    dimensions: { length: 32.09, width: 14.76, height: 4.84, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 33, maxLength: 35,
      minWidth: 15.5, maxWidth: 17,
      minHeight: 5.5, maxHeight: 8,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables',
      dimensions: { length: 8, width: 6, height: 3, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'synthesizer',
    brand: 'Moog',
    model: 'Subsequent 37',
    dimensions: { length: 22.5, width: 14.8, height: 5.1, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 23, maxLength: 25,
      minWidth: 15.5, maxWidth: 17,
      minHeight: 6, maxHeight: 8,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables',
      dimensions: { length: 7, width: 5, height: 3, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'synthesizer',
    brand: 'Moog',
    model: 'Grandmother',
    dimensions: { length: 22, width: 14.75, height: 5.75, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 23, maxLength: 25,
      minWidth: 15.5, maxWidth: 17,
      minHeight: 6.5, maxHeight: 8.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables, patch cables',
      dimensions: { length: 8, width: 6, height: 3, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'synthesizer',
    brand: 'Moog',
    model: 'Matriarch',
    dimensions: { length: 32, width: 14.75, height: 5.75, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 33, maxLength: 35,
      minWidth: 15.5, maxWidth: 17,
      minHeight: 6.5, maxHeight: 8.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables, patch cables',
      dimensions: { length: 8, width: 6, height: 3, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'synthesizer',
    brand: 'Arturia',
    model: 'MiniBrute 2',
    dimensions: { length: 18.1, width: 14.8, height: 3.7, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 19, maxLength: 21,
      minWidth: 15.5, maxWidth: 17,
      minHeight: 4.5, maxHeight: 6.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables, patch cables',
      dimensions: { length: 7, width: 5, height: 3, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'synthesizer',
    brand: 'Arturia',
    model: 'MicroFreak',
    dimensions: { length: 12.99, width: 8.27, height: 2.56, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 14, maxLength: 16,
      minWidth: 9, maxWidth: 11,
      minHeight: 3.5, maxHeight: 5.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables',
      dimensions: { length: 5, width: 4, height: 2, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'synthesizer',
    brand: 'Arturia',
    model: 'PolyBrute',
    dimensions: { length: 38.8, width: 15.9, height: 4.9, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 40, maxLength: 42,
      minWidth: 17, maxWidth: 19,
      minHeight: 6, maxHeight: 8,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables, expression pedal',
      dimensions: { length: 10, width: 8, height: 4, unit: 'in' }
    },
    lastVerified: new Date()
  }
];

export const handheldSynthesizers: InstrumentDimensions[] = [
  {
    instrumentType: 'synthesizer',
    brand: 'Teenage Engineering',
    model: 'OP-1',
    dimensions: { length: 11.1, width: 4.1, height: 0.5, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 12, maxLength: 14,
      minWidth: 5, maxWidth: 7,
      minHeight: 1.5, maxHeight: 3.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'USB cable, audio cables, headphones',
      dimensions: { length: 4, width: 3, height: 1, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'synthesizer',
    brand: 'Teenage Engineering',
    model: 'OP-Z',
    dimensions: { length: 8.7, width: 2.2, height: 0.5, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 9.5, maxLength: 11.5,
      minWidth: 3, maxWidth: 5,
      minHeight: 1.5, maxHeight: 3,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'USB cable, audio cables, headphones',
      dimensions: { length: 4, width: 3, height: 1, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'synthesizer',
    brand: 'Korg',
    model: 'Volca Keys',
    dimensions: { length: 7.5, width: 4.5, height: 1.75, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 8.5, maxLength: 10.5,
      minWidth: 5.5, maxWidth: 7.5,
      minHeight: 2.5, maxHeight: 4.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, audio cables, MIDI cables',
      dimensions: { length: 4, width: 3, height: 1.5, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'synthesizer',
    brand: 'Korg',
    model: 'Volca Beats',
    dimensions: { length: 7.5, width: 4.5, height: 1.75, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 8.5, maxLength: 10.5,
      minWidth: 5.5, maxWidth: 7.5,
      minHeight: 2.5, maxHeight: 4.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, audio cables, MIDI cables',
      dimensions: { length: 4, width: 3, height: 1.5, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'synthesizer',
    brand: 'Korg',
    model: 'Volca Bass',
    dimensions: { length: 7.5, width: 4.5, height: 1.75, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 8.5, maxLength: 10.5,
      minWidth: 5.5, maxWidth: 7.5,
      minHeight: 2.5, maxHeight: 4.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, audio cables, MIDI cables',
      dimensions: { length: 4, width: 3, height: 1.5, unit: 'in' }
    },
    lastVerified: new Date()
  }
];

export const drumMachines: InstrumentDimensions[] = [
  {
    instrumentType: 'drum machine',
    brand: 'Elektron',
    model: 'Digitakt',
    dimensions: { length: 8.5, width: 7.1, height: 2.2, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 9.5, maxLength: 11.5,
      minWidth: 8, maxWidth: 10,
      minHeight: 3, maxHeight: 5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables',
      dimensions: { length: 5, width: 4, height: 2, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'drum machine',
    brand: 'Elektron',
    model: 'Analog Rytm MKII',
    dimensions: { length: 13.4, width: 7.1, height: 2.2, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 14.5, maxLength: 16.5,
      minWidth: 8, maxWidth: 10,
      minHeight: 3, maxHeight: 5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables',
      dimensions: { length: 6, width: 5, height: 2.5, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'drum machine',
    brand: 'Roland',
    model: 'TR-8S',
    dimensions: { length: 16.5, width: 10.4, height: 2.7, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 17.5, maxLength: 19.5,
      minWidth: 11.5, maxWidth: 13.5,
      minHeight: 3.5, maxHeight: 5.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables',
      dimensions: { length: 7, width: 5, height: 2.5, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'drum machine',
    brand: 'Arturia',
    model: 'DrumBrute',
    dimensions: { length: 18.1, width: 11.8, height: 2.8, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 19, maxLength: 21,
      minWidth: 12.5, maxWidth: 14.5,
      minHeight: 3.5, maxHeight: 5.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables',
      dimensions: { length: 7, width: 5, height: 2.5, unit: 'in' }
    },
    lastVerified: new Date()
  }
];

export const audioInterfaces: InstrumentDimensions[] = [
  {
    instrumentType: 'audio interface',
    brand: 'Focusrite',
    model: 'Scarlett 2i2 3rd Gen',
    dimensions: { length: 7.17, width: 3.77, height: 1.89, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 8, maxLength: 10,
      minWidth: 4.5, maxWidth: 6.5,
      minHeight: 2.5, maxHeight: 4.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'USB cable, audio cables',
      dimensions: { length: 4, width: 3, height: 1.5, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'audio interface',
    brand: 'Universal Audio',
    model: 'Apollo Twin X',
    dimensions: { length: 6.3, width: 6.2, height: 2.6, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 7.5, maxLength: 9.5,
      minWidth: 7, maxWidth: 9,
      minHeight: 3.5, maxHeight: 5.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, Thunderbolt cable, audio cables',
      dimensions: { length: 5, width: 4, height: 2, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'audio interface',
    brand: 'Native Instruments',
    model: 'Komplete Audio 6 MK2',
    dimensions: { length: 7.28, width: 5.51, height: 1.77, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 8.5, maxLength: 10.5,
      minWidth: 6.5, maxWidth: 8.5,
      minHeight: 2.5, maxHeight: 4.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'USB cable, audio cables',
      dimensions: { length: 4, width: 3, height: 1.5, unit: 'in' }
    },
    lastVerified: new Date()
  }
];

export const grooveboxes: InstrumentDimensions[] = [
  {
    instrumentType: 'groovebox',
    brand: 'Elektron',
    model: 'Octatrack MKII',
    dimensions: { length: 13.4, width: 7.1, height: 2.2, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 14.5, maxLength: 16.5,
      minWidth: 8, maxWidth: 10,
      minHeight: 3, maxHeight: 5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables, CF cards',
      dimensions: { length: 6, width: 5, height: 2.5, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'groovebox',
    brand: 'Elektron',
    model: 'Syntakt',
    dimensions: { length: 8.5, width: 7.1, height: 2.2, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 9.5, maxLength: 11.5,
      minWidth: 8, maxWidth: 10,
      minHeight: 3, maxHeight: 5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables',
      dimensions: { length: 5, width: 4, height: 2, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'groovebox',
    brand: 'Roland',
    model: 'MC-707',
    dimensions: { length: 16.7, width: 11.4, height: 2.8, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 17.5, maxLength: 19.5,
      minWidth: 12.5, maxWidth: 14.5,
      minHeight: 3.5, maxHeight: 5.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables, SD cards',
      dimensions: { length: 7, width: 5, height: 2.5, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'groovebox',
    brand: 'Akai',
    model: 'MPC One',
    dimensions: { length: 11.52, width: 9.53, height: 2.27, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 12.5, maxLength: 14.5,
      minWidth: 10.5, maxWidth: 12.5,
      minHeight: 3, maxHeight: 5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables, SD cards',
      dimensions: { length: 6, width: 5, height: 2.5, unit: 'in' }
    },
    lastVerified: new Date()
  }
];

export const samplers: InstrumentDimensions[] = [
  {
    instrumentType: 'sampler',
    brand: 'Elektron',
    model: 'Digitone',
    dimensions: { length: 8.5, width: 7.1, height: 2.2, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 9.5, maxLength: 11.5,
      minWidth: 8, maxWidth: 10,
      minHeight: 3, maxHeight: 5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables',
      dimensions: { length: 5, width: 4, height: 2, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'sampler',
    brand: '1010music',
    model: 'Blackbox',
    dimensions: { length: 4.33, width: 4.33, height: 1.77, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 5.5, maxLength: 7.5,
      minWidth: 5.5, maxWidth: 7.5,
      minHeight: 2.5, maxHeight: 4.5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables, SD cards',
      dimensions: { length: 4, width: 3, height: 1.5, unit: 'in' }
    },
    lastVerified: new Date()
  },
  {
    instrumentType: 'sampler',
    brand: 'Roland',
    model: 'SP-404 MKII',
    dimensions: { length: 7.52, width: 5.94, height: 2.28, unit: 'in' },
    compatibleCaseDimensions: {
      minLength: 8.5, maxLength: 10.5,
      minWidth: 7, maxWidth: 9,
      minHeight: 3, maxHeight: 5,
      unit: 'in'
    },
    accessorySpace: {
      required: true,
      description: 'Power adapter, MIDI cables, audio cables, SD cards',
      dimensions: { length: 5, width: 4, height: 2, unit: 'in' }
    },
    lastVerified: new Date()
  }
];

// Combine all instrument types into a single array
export const allInstruments: InstrumentDimensions[] = [
  ...desktopSynthesizers,
  ...handheldSynthesizers,
  ...drumMachines,
  ...audioInterfaces,
  ...grooveboxes,
  ...samplers
];

export default allInstruments;
