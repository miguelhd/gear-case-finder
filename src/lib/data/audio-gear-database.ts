import { AudioGear, IAudioGear } from '../models/gear-models';
import mongoose from 'mongoose';

// Database of common synthesizers with dimensions
const synthesizers = [
  {
    name: "Moog Subsequent 37",
    brand: "Moog",
    category: "Synthesizer",
    type: "Analog Synthesizer",
    dimensions: {
      length: 22.5, // inches
      width: 14.8,
      height: 5.1,
      unit: "in"
    },
    weight: {
      value: 22,
      unit: "lb"
    },
    imageUrl: "https://cdn.shopify.com/s/files/1/0657/7617/products/SUB37_web_front_1024x1024.jpg",
    productUrl: "https://www.moogmusic.com/products/subsequent-37",
    description: "Analog synthesizer with 37 keys, 2 oscillators, and a multidrive circuit",
    popularity: 95,
    releaseYear: 2017,
    discontinued: false
  },
  {
    name: "Korg Minilogue XD",
    brand: "Korg",
    category: "Synthesizer",
    type: "Analog Synthesizer",
    dimensions: {
      length: 19.3,
      width: 11.4,
      height: 3.4,
      unit: "in"
    },
    weight: {
      value: 6.17,
      unit: "lb"
    },
    imageUrl: "https://www.korg.com/us/products/synthesizers/minilogue_xd/images/top_minilogue_xd_module.jpg",
    productUrl: "https://www.korg.com/us/products/synthesizers/minilogue_xd/",
    description: "4-voice polyphonic analog synthesizer with digital multi-engine",
    popularity: 90,
    releaseYear: 2019,
    discontinued: false
  },
  {
    name: "Roland Jupiter-X",
    brand: "Roland",
    category: "Synthesizer",
    type: "Digital Synthesizer",
    dimensions: {
      length: 33.5,
      width: 14.6,
      height: 4.9,
      unit: "in"
    },
    weight: {
      value: 17,
      unit: "lb"
    },
    imageUrl: "https://static.roland.com/assets/images/products/gallery/jupiter-x_angle_gal.jpg",
    productUrl: "https://www.roland.com/global/products/jupiter-x/",
    description: "Flagship synthesizer with ZEN-Core sound engine and 61 keys",
    popularity: 85,
    releaseYear: 2019,
    discontinued: false
  },
  {
    name: "Arturia MicroFreak",
    brand: "Arturia",
    category: "Synthesizer",
    type: "Digital Synthesizer",
    dimensions: {
      length: 12.8,
      width: 8.7,
      height: 2.4,
      unit: "in"
    },
    weight: {
      value: 2.2,
      unit: "lb"
    },
    imageUrl: "https://www.arturia.com/products/hardware-synths/microfreak/resources/microfreak-front.jpg",
    productUrl: "https://www.arturia.com/products/hardware-synths/microfreak/overview",
    description: "Digital synthesizer with analog filter and touch capacitive keyboard",
    popularity: 88,
    releaseYear: 2019,
    discontinued: false
  },
  {
    name: "Behringer Neutron",
    brand: "Behringer",
    category: "Synthesizer",
    type: "Semi-modular Synthesizer",
    dimensions: {
      length: 12.8,
      width: 6.9,
      height: 3.5,
      unit: "in"
    },
    weight: {
      value: 4.4,
      unit: "lb"
    },
    imageUrl: "https://medias.audiofanzine.com/images/normal/behringer-neutron-2347465.jpg",
    productUrl: "https://www.behringer.com/product.html?modelCode=P0CM5",
    description: "Semi-modular analog synthesizer with 56 patch points",
    popularity: 82,
    releaseYear: 2018,
    discontinued: false
  }
];

// Database of common drum machines with dimensions
const drumMachines = [
  {
    name: "Roland TR-8S",
    brand: "Roland",
    category: "Drum Machine",
    type: "Digital Drum Machine",
    dimensions: {
      length: 16.5,
      width: 10.4,
      height: 2.7,
      unit: "in"
    },
    weight: {
      value: 4.9,
      unit: "lb"
    },
    imageUrl: "https://static.roland.com/assets/images/products/gallery/tr-8s_top_gal.jpg",
    productUrl: "https://www.roland.com/global/products/tr-8s/",
    description: "Rhythm performer with sample import and classic TR drum sounds",
    popularity: 92,
    releaseYear: 2018,
    discontinued: false
  },
  {
    name: "Elektron Digitakt",
    brand: "Elektron",
    category: "Drum Machine",
    type: "Digital Sampler",
    dimensions: {
      length: 8.5,
      width: 7.1,
      height: 2.2,
      unit: "in"
    },
    weight: {
      value: 3.3,
      unit: "lb"
    },
    imageUrl: "https://www.elektron.se/wp-content/uploads/2017/01/Digitakt_Angle_1600.jpg",
    productUrl: "https://www.elektron.se/products/digitakt/",
    description: "8-track digital drum machine and sampler with sequencer",
    popularity: 90,
    releaseYear: 2017,
    discontinued: false
  }
];

// Database of common mixers with dimensions
const mixers = [
  {
    name: "Allen & Heath Xone:96",
    brand: "Allen & Heath",
    category: "Mixer",
    type: "DJ Mixer",
    dimensions: {
      length: 13.2,
      width: 12.6,
      height: 4.1,
      unit: "in"
    },
    weight: {
      value: 14.3,
      unit: "lb"
    },
    imageUrl: "https://www.allen-heath.com/wp-content/uploads/2018/05/Xone96_Front_Angle_1600.jpg",
    productUrl: "https://www.allen-heath.com/ahproducts/xone96/",
    description: "6-channel analog DJ mixer with dual 32-bit USB soundcards",
    popularity: 88,
    releaseYear: 2018,
    discontinued: false
  },
  {
    name: "Mackie ProFX12v3",
    brand: "Mackie",
    category: "Mixer",
    type: "Audio Mixer",
    dimensions: {
      length: 14.1,
      width: 12.9,
      height: 3.5,
      unit: "in"
    },
    weight: {
      value: 8.8,
      unit: "lb"
    },
    imageUrl: "https://mackie.com/sites/default/files/styles/product_page_image/public/ProFXv3_12_Front_0.jpg",
    productUrl: "https://mackie.com/products/profxv3-professional-effects-mixers",
    description: "12-channel professional effects mixer with USB",
    popularity: 85,
    releaseYear: 2020,
    discontinued: false
  }
];

// Database of common effects pedals with dimensions
const effectsPedals = [
  {
    name: "Strymon Big Sky",
    brand: "Strymon",
    category: "Effects Pedal",
    type: "Reverb Pedal",
    dimensions: {
      length: 6.75,
      width: 5.1,
      height: 2.5,
      unit: "in"
    },
    weight: {
      value: 2.2,
      unit: "lb"
    },
    imageUrl: "https://www.strymon.net/wp-content/uploads/2016/01/bigsky-front-tilt-1024x683.jpg",
    productUrl: "https://www.strymon.net/products/bigsky/",
    description: "High-end reverb pedal with 12 reverb types and MIDI control",
    popularity: 95,
    releaseYear: 2013,
    discontinued: false
  },
  {
    name: "Boss DD-8",
    brand: "Boss",
    category: "Effects Pedal",
    type: "Delay Pedal",
    dimensions: {
      length: 2.9,
      width: 2.3,
      height: 2.4,
      unit: "in"
    },
    weight: {
      value: 0.9,
      unit: "lb"
    },
    imageUrl: "https://static.roland.com/assets/images/products/gallery/dd-8_top_gal.jpg",
    productUrl: "https://www.boss.info/global/products/dd-8/",
    description: "Digital delay pedal with 11 delay modes and looper function",
    popularity: 90,
    releaseYear: 2019,
    discontinued: false
  }
];

// Database of common audio interfaces with dimensions
const audioInterfaces = [
  {
    name: "Focusrite Scarlett 2i2 3rd Gen",
    brand: "Focusrite",
    category: "Audio Interface",
    type: "USB Audio Interface",
    dimensions: {
      length: 7.0,
      width: 4.5,
      height: 1.9,
      unit: "in"
    },
    weight: {
      value: 1.3,
      unit: "lb"
    },
    imageUrl: "https://d1aeri3ty3izns.cloudfront.net/media/49/491213/1200/preview.jpg",
    productUrl: "https://focusrite.com/en/usb-audio-interface/scarlett/scarlett-2i2",
    description: "2-in, 2-out USB audio interface with 2 mic preamps",
    popularity: 98,
    releaseYear: 2019,
    discontinued: false
  },
  {
    name: "Universal Audio Apollo Twin X Duo",
    brand: "Universal Audio",
    category: "Audio Interface",
    type: "Thunderbolt Audio Interface",
    dimensions: {
      length: 6.3,
      width: 6.2,
      height: 2.6,
      unit: "in"
    },
    weight: {
      value: 2.35,
      unit: "lb"
    },
    imageUrl: "https://media.sweetwater.com/api/i/q-82__ha-a1e8c51c9c13214c__hmac-b9d9d498c4144c3c6d9e9e3a5e2e631e1c8cd1e0/images/items/750/ApoTwinXD-large.jpg",
    productUrl: "https://www.uaudio.com/audio-interfaces/apollo-twin-x.html",
    description: "Desktop Thunderbolt 3 audio interface with UAD-2 processing",
    popularity: 92,
    releaseYear: 2019,
    discontinued: false
  }
];

// Combine all gear into one array
const allGear = [
  ...synthesizers,
  ...drumMachines,
  ...mixers,
  ...effectsPedals,
  ...audioInterfaces
];

/**
 * Seed the database with common audio gear
 */
export async function seedAudioGearDatabase(): Promise<void> {
  try {
    // Check if we already have gear in the database
    const count = await AudioGear.countDocuments();
    if (count > 0) {
      console.log(`Database already contains ${count} audio gear items. Skipping seed.`);
      return;
    }

    // Insert all gear
    await AudioGear.insertMany(allGear);
    console.log(`Successfully seeded database with ${allGear.length} audio gear items.`);
  } catch (error) {
    console.error('Error seeding audio gear database:', error);
    throw error;
  }
}

/**
 * Get all audio gear from the database
 */
export async function getAllAudioGear(): Promise<IAudioGear[]> {
  return AudioGear.find();
}

/**
 * Get audio gear by category
 */
export async function getAudioGearByCategory(category: string): Promise<IAudioGear[]> {
  return AudioGear.find({ category });
}

/**
 * Get audio gear by brand
 */
export async function getAudioGearByBrand(brand: string): Promise<IAudioGear[]> {
  return AudioGear.find({ brand });
}

/**
 * Get audio gear by type
 */
export async function getAudioGearByType(type: string): Promise<IAudioGear[]> {
  return AudioGear.find({ type });
}

/**
 * Search audio gear by name
 */
export async function searchAudioGearByName(name: string): Promise<IAudioGear[]> {
  return AudioGear.find({ name: { $regex: name, $options: 'i' } });
}

/**
 * Add a new audio gear item to the database
 */
export async function addAudioGear(gear: Partial<IAudioGear>): Promise<IAudioGear> {
  const newGear = new AudioGear(gear);
  return newGear.save();
}

/**
 * Update an existing audio gear item
 */
export async function updateAudioGear(id: string, gear: Partial<IAudioGear>): Promise<IAudioGear | null> {
  return AudioGear.findByIdAndUpdate(id, gear, { new: true });
}

/**
 * Delete an audio gear item
 */
export async function deleteAudioGear(id: string): Promise<boolean> {
  const result = await AudioGear.findByIdAndDelete(id);
  return !!result;
}
