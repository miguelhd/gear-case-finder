/**
 * Cases Generator
 * 
 * Generates mock protective case data for testing purposes
 */

const { ObjectId } = require('mongodb');

// Case brands
const brands = [
  'Pelican', 'SKB', 'Gator', 'Nanuk', 'HPRC', 'Seahorse', 'Monoprice', 'Thomann',
  'Sweetwater', 'Musician\'s Friend', 'Harmony', 'ProTec', 'Odyssey', 'Road Runner',
  'Mono', 'Levy\'s', 'Reunion Blues', 'Coffin Case', 'Crossrock', 'Guardian',
  'Gearlux', 'Gig Gear', 'Stagg', 'Tourtech', 'Rockbag', 'Rockcase', 'Hardcase',
  'Caseman', 'Protector', 'Vault', 'Fortress', 'Defender', 'Safeguard', 'ProShield'
];

// Case types
const caseTypes = [
  'Hard Case', 'Soft Case', 'Gig Bag', 'Flight Case', 'Waterproof Case',
  'Molded Case', 'ATA Case', 'Rack Case', 'Backpack', 'Briefcase',
  'Pedalboard Case', 'Road Case', 'Touring Case', 'Protective Cover',
  'Padded Bag', 'Hardshell Case', 'Hybrid Case', 'Aluminum Case'
];

// Case materials
const materials = [
  'ABS Plastic', 'Polypropylene', 'Polyethylene', 'Aluminum', 'Wood',
  'Nylon', 'Polyester', 'EVA Foam', 'Carbon Fiber', 'Fiberglass',
  'High-impact Polymer', 'Ballistic Nylon', 'Cordura', 'Plywood',
  'Laminated Wood', 'Molded Plastic', 'Injection-molded Resin'
];

// Case colors
const colors = [
  'Black', 'Gray', 'Silver', 'Orange', 'Yellow', 'Olive', 'Desert Tan',
  'Blue', 'Red', 'Green', 'White', 'Brown', 'Charcoal', 'Navy',
  'Camouflage', 'Pink', 'Purple', 'Transparent', 'Carbon'
];

// Case features
const features = [
  'Waterproof', 'Shockproof', 'Dustproof', 'Crushproof', 'Airtight',
  'Pressure Equalization Valve', 'Customizable Foam', 'Pick and Pluck Foam',
  'Padded Interior', 'Velcro Straps', 'Cable Management', 'Accessory Pockets',
  'Wheels', 'Telescoping Handle', 'Shoulder Strap', 'Backpack Straps',
  'Locking Latches', 'TSA Approved Locks', 'Stackable Design', 'Military Spec',
  'Lifetime Warranty', 'UV Resistant', 'Corrosion Proof', 'Reinforced Corners',
  'Rubber Feet', 'Ergonomic Handle', 'ID Card Holder', 'Customizable Nameplate'
];

// Compatible gear types
const compatibleGearTypes = [
  'Microphones', 'Audio Interfaces', 'Mixers', 'Synthesizers', 'Drum Machines',
  'Samplers', 'Controllers', 'Headphones', 'Monitors', 'Effects Processors',
  'Preamps', 'Compressors', 'EQs', 'Reverbs', 'Delays', 'Multi-effects',
  'MIDI Controllers', 'Sequencers', 'Grooveboxes', 'Field Recorders',
  'Small Audio Gear', 'Medium Audio Gear', 'Large Audio Gear', 'Rack Equipment',
  'Studio Equipment', 'Live Sound Equipment', 'DJ Equipment', 'Production Equipment'
];

// Marketplaces
const marketplaces = [
  'Amazon', 'Sweetwater', 'Guitar Center', 'Thomann', 'B&H Photo',
  'Musician\'s Friend', 'Reverb', 'eBay', 'Zzounds', 'Sam Ash',
  'Gear4music', 'Perfect Circuit', 'Vintage King', 'Andertons'
];

// Sellers
const sellers = [
  { name: 'AudioGear Store', rating: 4.8 },
  { name: 'Pro Audio Gear', rating: 4.6 },
  { name: 'Music Equipment Direct', rating: 4.7 },
  { name: 'Studio Essentials', rating: 4.5 },
  { name: 'DJ Warehouse', rating: 4.4 },
  { name: 'Sound Solutions', rating: 4.9 },
  { name: 'Gear Outlet', rating: 4.3 },
  { name: 'Music Production Supplies', rating: 4.7 },
  { name: 'Audio Professional Shop', rating: 4.8 },
  { name: 'Musician\'s Corner', rating: 4.6 },
  { name: 'Sound Equipment Center', rating: 4.5 },
  { name: 'Pro Gear Supply', rating: 4.9 }
];

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

// Generate a random case name
function generateCaseName(brand, type) {
  const series = ['Pro', 'Elite', 'Protector', 'Guardian', 'Defender', 'Vault', 'Shield', 'Armor', 'Fortress'];
  const numbers = ['100', '200', '300', '500', '1000', '1500', '2000', '3000', '5000', '10000'];
  const letters = ['A', 'B', 'C', 'D', 'E', 'S', 'X', 'Z'];
  
  const modelNumber = randomBoolean(0.7) 
    ? randomItem(numbers) + (randomBoolean(0.3) ? randomItem(letters) : '') 
    : randomItem(letters) + randomItem(numbers);
    
  const seriesName = randomBoolean(0.6) ? ' ' + randomItem(series) : '';
  
  return `${brand} ${type} ${modelNumber}${seriesName}`.trim();
}

// Generate a random case description
function generateDescription(brand, type, name, features) {
  const qualities = ['professional', 'high-quality', 'premium', 'industry-standard', 'versatile', 'reliable', 'durable', 'rugged'];
  const uses = ['protecting valuable audio equipment', 'professional transportation', 'touring musicians', 'studio professionals', 'on-the-go producers', 'field recording', 'live sound engineers'];
  const benefits = ['ensures your gear stays safe', 'provides maximum protection', 'keeps your equipment secure', 'offers peace of mind', 'protects your investment'];
  
  const featuresText = features.length > 0 
    ? `Features include ${features.slice(0, 3).join(', ')}, and more.` 
    : '';
  
  return `The ${name} is a ${randomItem(qualities)} ${type.toLowerCase()} from ${brand}, designed for ${randomItem(uses)}. This ${randomItem(qualities)} case ${randomItem(benefits)} in any environment. ${featuresText} Perfect for musicians, producers, and audio engineers who demand the best protection for their gear.`;
}

// Generate random image URLs
function generateImageUrls(brand, type, count = randomInt(1, 4)) {
  const sanitizedBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sanitizedType = type.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const urls = [];
  for (let i = 0; i < count; i++) {
    urls.push(`https://example.com/images/cases/${sanitizedBrand}/${sanitizedType}_${randomInt(1000, 9999)}_${i + 1}.jpg`);
  }
  
  return urls;
}

// Generate a random product URL
function generateProductUrl(brand, name) {
  const sanitizedBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  return `https://example.com/cases/${sanitizedBrand}/${sanitizedName}`;
}

// Generate a single case item
function generateCaseItem(index) {
  const brand = randomItem(brands);
  const type = randomItem(caseTypes);
  const name = generateCaseName(brand, type);
  const material = randomItem(materials);
  const color = randomItem(colors);
  
  // Generate dimensions based on case type
  let externalDimensions, internalDimensions;
  
  if (type === 'Hard Case' || type === 'Flight Case' || type === 'Waterproof Case' || type === 'ATA Case') {
    // Larger cases
    externalDimensions = {
      length: randomFloat(10, 30, 1),
      width: randomFloat(8, 24, 1),
      height: randomFloat(4, 12, 1),
      unit: 'in'
    };
    
    // Internal dimensions are slightly smaller than external
    internalDimensions = {
      length: externalDimensions.length - randomFloat(0.5, 2, 1),
      width: externalDimensions.width - randomFloat(0.5, 2, 1),
      height: externalDimensions.height - randomFloat(0.5, 2, 1),
      unit: 'in'
    };
  } else {
    // Smaller cases
    externalDimensions = {
      length: randomFloat(6, 20, 1),
      width: randomFloat(4, 16, 1),
      height: randomFloat(2, 8, 1),
      unit: 'in'
    };
    
    // Internal dimensions are slightly smaller than external
    internalDimensions = {
      length: externalDimensions.length - randomFloat(0.3, 1, 1),
      width: externalDimensions.width - randomFloat(0.3, 1, 1),
      height: externalDimensions.height - randomFloat(0.3, 1, 1),
      unit: 'in'
    };
  }
  
  // Generate weight based on case type and dimensions
  const weight = {
    value: randomFloat(
      (externalDimensions.length * externalDimensions.width * externalDimensions.height) / 200,
      (externalDimensions.length * externalDimensions.width * externalDimensions.height) / 100,
      1
    ),
    unit: 'lb'
  };
  
  // Determine protection level based on case type
  let protectionLevel, waterproof, shockproof, dustproof;
  
  if (type === 'Hard Case' || type === 'Waterproof Case' || type === 'Flight Case' || type === 'ATA Case') {
    protectionLevel = randomItem(['high', 'very high']);
    waterproof = randomBoolean(0.8);
    shockproof = randomBoolean(0.9);
    dustproof = randomBoolean(0.9);
  } else if (type === 'Soft Case' || type === 'Gig Bag' || type === 'Padded Bag') {
    protectionLevel = randomItem(['low', 'medium']);
    waterproof = randomBoolean(0.3);
    shockproof = randomBoolean(0.5);
    dustproof = randomBoolean(0.4);
  } else {
    protectionLevel = randomItem(['medium', 'high']);
    waterproof = randomBoolean(0.5);
    shockproof = randomBoolean(0.7);
    dustproof = randomBoolean(0.6);
  }
  
  // Generate random features
  const caseFeatures = [];
  const featureCount = randomInt(3, 8);
  const shuffledFeatures = [...features].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < featureCount; i++) {
    if (i < shuffledFeatures.length) {
      caseFeatures.push(shuffledFeatures[i]);
    }
  }
  
  // Add waterproof, shockproof, dustproof to features if applicable
  if (waterproof && !caseFeatures.includes('Waterproof')) {
    caseFeatures.push('Waterproof');
  }
  if (shockproof && !caseFeatures.includes('Shockproof')) {
    caseFeatures.push('Shockproof');
  }
  if (dustproof && !caseFeatures.includes('Dustproof')) {
    caseFeatures.push('Dustproof');
  }
  
  // Generate compatible gear types
  const compatibleWith = [];
  const compatibleCount = randomInt(1, 5);
  const shuffledCompatible = [...compatibleGearTypes].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < compatibleCount; i++) {
    if (i < shuffledCompatible.length) {
      compatibleWith.push(shuffledCompatible[i]);
    }
  }
  
  const description = generateDescription(brand, type, name, caseFeatures);
  const imageUrls = generateImageUrls(brand, type);
  const productUrl = generateProductUrl(brand, name);
  
  const price = randomFloat(
    type.includes('Hard') || type.includes('Flight') ? 50 : 20,
    type.includes('Hard') || type.includes('Flight') ? 300 : 150,
    2
  );
  
  const rating = randomFloat(3.5, 5.0, 1);
  const reviewCount = randomInt(5, 1000);
  
  const marketplace = randomItem(marketplaces);
  const seller = randomItem(sellers);
  
  const hasHandle = randomBoolean(0.9);
  const hasWheels = type.includes('Flight') || type.includes('ATA') ? randomBoolean(0.8) : randomBoolean(0.3);
  
  const now = new Date();
  const scrapedAt = randomDate(new Date(now.getFullYear() - 1, 0, 1), now);
  
  return {
    _id: new ObjectId(),
    id: `case${index.toString().padStart(3, '0')}`,
    sourceId: `src_${randomInt(10000, 99999)}`,
    marketplace,
    name,
    brand,
    type,
    externalDimensions,
    internalDimensions,
    weight,
    price,
    currency: 'USD',
    url: productUrl,
    imageUrls,
    description,
    features: caseFeatures,
    rating,
    reviewCount,
    availability: randomItem(['In Stock', 'In Stock', 'In Stock', 'Limited Stock', 'Back Order', 'Pre-order']),
    seller: {
      name: seller.name,
      url: `https://example.com/sellers/${seller.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      rating: seller.rating
    },
    protectionLevel,
    waterproof,
    shockproof,
    dustproof,
    hasHandle,
    hasWheels,
    material,
    color,
    compatibleWith,
    scrapedAt,
    updatedAt: new Date()
  };
}

// Generate multiple case items
function generateCases(count) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(generateCaseItem(i));
  }
  return items;
}

module.exports = {
  generateCases,
  generateCaseItem
};
