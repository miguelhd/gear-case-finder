/**
 * Audio Gear Generator
 * 
 * Generates mock audio gear data for testing purposes
 */

const { ObjectId } = require('mongodb');

// Audio gear brands
const brands = [
  'Shure', 'Sennheiser', 'Audio-Technica', 'AKG', 'Neumann', 'Rode', 'Beyerdynamic',
  'Sony', 'Zoom', 'Tascam', 'Roland', 'Yamaha', 'Korg', 'Moog', 'Arturia', 'Behringer',
  'Elektron', 'Novation', 'Akai', 'Native Instruments', 'Teenage Engineering', 'Focusrite',
  'Universal Audio', 'Presonus', 'Mackie', 'Allen & Heath', 'JBL', 'KRK', 'Genelec',
  'Adam Audio', 'Dynaudio', 'Focal', 'Audeze'
];

// Audio gear categories
const categories = [
  'Microphone', 'Audio Interface', 'Mixer', 'Synthesizer', 'Drum Machine',
  'Sampler', 'Controller', 'Headphones', 'Monitors', 'Effects Processor',
  'Preamp', 'Compressor', 'EQ', 'Reverb', 'Delay', 'Multi-effects',
  'MIDI Controller', 'Sequencer', 'Groovebox', 'Field Recorder'
];

// Audio gear types by category
const typesByCategory = {
  'Microphone': ['Dynamic', 'Condenser', 'Ribbon', 'USB', 'Lavalier', 'Shotgun', 'Boundary'],
  'Audio Interface': ['USB', 'Thunderbolt', 'FireWire', 'PCIe', 'Dante', 'ADAT'],
  'Mixer': ['Analog', 'Digital', 'Powered', 'Unpowered', 'Rack Mount', 'Desktop'],
  'Synthesizer': ['Analog', 'Digital', 'Hybrid', 'Modular', 'Semi-modular', 'Virtual Analog', 'FM', 'Wavetable'],
  'Drum Machine': ['Analog', 'Digital', 'Hybrid', 'Sample-based', 'Synthesis-based'],
  'Sampler': ['Standalone', 'Eurorack', 'Software', 'Hardware', 'Groove Sampler'],
  'Controller': ['MIDI', 'DJ', 'Pad', 'Keyboard', 'Eurorack', 'CV/Gate'],
  'Headphones': ['Closed-back', 'Open-back', 'Semi-open', 'In-ear', 'On-ear', 'Over-ear', 'Wireless'],
  'Monitors': ['Active', 'Passive', 'Near-field', 'Mid-field', 'Far-field', 'Subwoofer'],
  'Effects Processor': ['Multi-effects', 'Single-effect', 'Rack', 'Pedal', 'Desktop', 'Eurorack'],
  'Preamp': ['Tube', 'Solid State', 'Hybrid', 'Channel Strip', 'Microphone', 'Instrument'],
  'Compressor': ['Optical', 'VCA', 'FET', 'Vari-mu', 'Digital', 'Multiband'],
  'EQ': ['Parametric', 'Graphic', 'Semi-parametric', 'Dynamic', 'Shelving', 'Digital'],
  'Reverb': ['Spring', 'Plate', 'Digital', 'Convolution', 'Algorithmic', 'Hybrid'],
  'Delay': ['Analog', 'Digital', 'Tape', 'BBD', 'Multi-tap', 'Looper'],
  'Multi-effects': ['Guitar', 'Vocal', 'Bass', 'Keyboard', 'Studio', 'Live'],
  'MIDI Controller': ['Keyboard', 'Pad', 'Knob', 'Fader', 'Wind', 'Percussion'],
  'Sequencer': ['Step', 'Piano Roll', 'Generative', 'CV/Gate', 'MIDI', 'Drum'],
  'Groovebox': ['Sample-based', 'Synthesis', 'Hybrid', 'Standalone', 'Controller'],
  'Field Recorder': ['Handheld', 'Portable', 'Multi-track', 'Stereo', 'Ambisonic', 'Binaural']
};

// Generate a random number between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random float between min and max with specified precision
function randomFloat(min, max, precision = 2) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(precision));
}

// Pick a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate a random boolean with specified probability of being true
function randomBoolean(probability = 0.5) {
  return Math.random() < probability;
}

// Generate a random date between start and end dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate a random product name based on brand, category, and type
function generateProductName(brand, category, type) {
  const models = ['Pro', 'Studio', 'Elite', 'Plus', 'Ultra', 'Classic', 'Signature', 'Artist', 'Producer'];
  const numbers = ['1', '2', '3', '4', '5', '10', '20', '50', '100', '200', '500', '1000'];
  const letters = ['A', 'B', 'C', 'D', 'E', 'S', 'X', 'Z'];
  
  const modelNumber = randomBoolean(0.7) 
    ? randomItem(numbers) + (randomBoolean(0.3) ? randomItem(letters) : '') 
    : randomItem(letters) + randomItem(numbers);
    
  const modelName = randomBoolean(0.4) ? ' ' + randomItem(models) : '';
  
  return `${brand} ${category} ${type} ${modelNumber}${modelName}`.trim();
}

// Generate a random product description
function generateDescription(brand, category, type, name) {
  const qualities = ['professional', 'high-quality', 'premium', 'industry-standard', 'versatile', 'reliable', 'innovative', 'cutting-edge'];
  const uses = ['studio recording', 'live performance', 'home studio', 'professional production', 'on-the-go music creation', 'field recording', 'sound design'];
  const features = ['exceptional sound quality', 'intuitive controls', 'durable construction', 'compact design', 'versatile connectivity', 'advanced features', 'pristine audio reproduction'];
  const benefits = ['enhances your workflow', 'delivers outstanding results', 'provides unmatched reliability', 'offers exceptional value', 'takes your productions to the next level'];
  
  return `The ${name} is a ${randomItem(qualities)} ${category.toLowerCase()} from ${brand}, designed for ${randomItem(uses)}. This ${type.toLowerCase()} ${category.toLowerCase()} features ${randomItem(features)} and ${randomItem(features)}, which ${randomItem(benefits)}. Perfect for musicians, producers, and audio engineers who demand the best.`;
}

// Generate a random image URL
function generateImageUrl(brand, category, type) {
  const sanitizedBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sanitizedCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sanitizedType = type.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return `https://example.com/images/${sanitizedBrand}/${sanitizedCategory}_${sanitizedType}_${randomInt(1000, 9999)}.jpg`;
}

// Generate a random product URL
function generateProductUrl(brand, name) {
  const sanitizedBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  return `https://example.com/products/${sanitizedBrand}/${sanitizedName}`;
}

// Generate a single audio gear item
function generateAudioGearItem(index) {
  const brand = randomItem(brands);
  const category = randomItem(categories);
  const type = randomItem(typesByCategory[category] || ['Standard']);
  const name = generateProductName(brand, category, type);
  
  // Generate dimensions based on category
  let dimensions;
  switch (category) {
    case 'Microphone':
      dimensions = {
        length: randomFloat(5, 10, 1),
        width: randomFloat(1.5, 3, 1),
        height: randomFloat(1.5, 3, 1),
        unit: 'in'
      };
      break;
    case 'Audio Interface':
      dimensions = {
        length: randomFloat(6, 12, 1),
        width: randomFloat(4, 8, 1),
        height: randomFloat(1, 3, 1),
        unit: 'in'
      };
      break;
    case 'Synthesizer':
      dimensions = {
        length: randomFloat(12, 36, 1),
        width: randomFloat(6, 15, 1),
        height: randomFloat(2, 6, 1),
        unit: 'in'
      };
      break;
    default:
      dimensions = {
        length: randomFloat(5, 20, 1),
        width: randomFloat(4, 15, 1),
        height: randomFloat(1, 8, 1),
        unit: 'in'
      };
  }
  
  // Generate weight based on category
  let weight;
  switch (category) {
    case 'Microphone':
      weight = {
        value: randomFloat(0.3, 2, 2),
        unit: 'lb'
      };
      break;
    case 'Headphones':
      weight = {
        value: randomFloat(0.2, 1, 2),
        unit: 'lb'
      };
      break;
    case 'Synthesizer':
      weight = {
        value: randomFloat(2, 20, 1),
        unit: 'lb'
      };
      break;
    default:
      weight = {
        value: randomFloat(0.5, 10, 1),
        unit: 'lb'
      };
  }
  
  const description = generateDescription(brand, category, type, name);
  const imageUrl = generateImageUrl(brand, category, type);
  const productUrl = generateProductUrl(brand, name);
  
  const releaseYear = randomInt(1990, new Date().getFullYear());
  const popularity = randomInt(30, 100);
  const discontinued = randomBoolean(0.2);
  
  const now = new Date();
  const createdAt = randomDate(new Date(now.getFullYear() - 2, 0, 1), now);
  
  return {
    _id: new ObjectId(),
    name,
    brand,
    category,
    type,
    dimensions,
    weight,
    imageUrl,
    productUrl,
    description,
    popularity,
    releaseYear,
    discontinued,
    createdAt,
    updatedAt: new Date(),
    sourceId: `src_${randomInt(10000, 99999)}`,
    marketplace: randomItem(['Amazon', 'Sweetwater', 'Guitar Center', 'Thomann', 'B&H Photo']),
    scrapedAt: new Date(),
    features: [
      `${randomItem(['High', 'Premium', 'Professional', 'Studio'])} quality ${category.toLowerCase()}`,
      `${randomItem(['Durable', 'Rugged', 'Reliable', 'Long-lasting'])} construction`,
      `${randomItem(['Easy to use', 'Intuitive', 'User-friendly', 'Straightforward'])} controls`,
      `${randomItem(['Compact', 'Portable', 'Lightweight', 'Space-saving'])} design`,
      `${randomItem(['Versatile', 'Flexible', 'Adaptable', 'Multi-purpose'])} connectivity options`
    ].slice(0, randomInt(2, 5))
  };
}

// Generate multiple audio gear items
function generateAudioGear(count) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(generateAudioGearItem(i));
  }
  return items;
}

module.exports = {
  generateAudioGear,
  generateAudioGearItem
};
