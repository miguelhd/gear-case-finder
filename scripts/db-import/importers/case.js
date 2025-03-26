/**
 * Case Collection Import Script
 * 
 * This script imports case data from normalized product objects
 * into the Case collection in MongoDB.
 */

module.exports = async function importCase(db, items) {
  console.log('Starting Case import...');
  
  // Initialize counters
  const result = {
    insertedCount: 0,
    updatedCount: 0,
    skippedCount: 0
  };
  
  try {
    // Get reference to Case collection
    const collection = db.collection('Case');
    
    // Process each item
    for (const item of items) {
      // Skip if item is not marked as a case
      if (!item.isCase) {
        result.skippedCount++;
        continue;
      }
      
      // Skip items that don't have required fields
      if (!item.title || !item.marketplace) {
        console.warn(`Skipping item with missing required fields: ${item.id}`);
        result.skippedCount++;
        continue;
      }
      
      // Extract features from description and features array
      const extractedFeatures = extractFeatures(item);
      
      // Transform normalized product to Case schema
      const caseItem = {
        name: item.title,
        brand: extractBrand(item.title),
        type: determineCaseType(item),
        dimensions: {
          interior: {
            length: item.dimensions?.length || 0,
            width: item.dimensions?.width || 0,
            height: item.dimensions?.height || 0,
            unit: item.dimensions?.unit || 'in'
          }
        },
        // Add internalDimensions to match the schema
        internalDimensions: {
          length: item.dimensions?.length || 0,
          width: item.dimensions?.width || 0,
          height: item.dimensions?.height || 0,
          unit: item.dimensions?.unit || 'in'
        },
        weight: item.weight ? {
          value: item.weight.value || 0,
          unit: item.weight.unit || 'lb'
        } : undefined,
        features: extractedFeatures,
        price: item.price || 0,
        currency: item.currency || 'USD',
        rating: item.rating,
        reviewCount: item.reviewCount,
        imageUrl: item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : null,
        productUrl: item.url,
        description: item.description,
        protectionLevel: determineProtectionLevel(item),
        waterproof: isWaterproof(item),
        shockproof: isShockproof(item),
        hasPadding: hasPadding(item),
        hasCompartments: hasCompartments(item),
        hasHandle: hasHandle(item),
        hasWheels: hasWheels(item),
        hasLock: hasLock(item),
        material: extractMaterial(item),
        color: extractColor(item),
        marketplace: item.marketplace,
        url: item.url,
        imageUrls: item.imageUrls || [],
        availability: item.availability,
        seller: item.seller ? {
          name: item.seller.name,
          url: item.seller.url,
          rating: item.seller.rating
        } : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Additional fields for tracking
        sourceId: item.sourceId
      };
      
      // Check if item already exists in the database
      const existingItem = await collection.findOne({ 
        $or: [
          { sourceId: item.sourceId, marketplace: item.marketplace },
          { productUrl: item.url }
        ]
      });
      
      if (existingItem) {
        // Update existing item
        const updateResult = await collection.updateOne(
          { _id: existingItem._id },
          { 
            $set: {
              ...caseItem,
              createdAt: existingItem.createdAt, // Preserve original creation date
              updatedAt: new Date() // Update the updatedAt timestamp
            }
          }
        );
        
        if (updateResult.modifiedCount > 0) {
          result.updatedCount++;
        } else {
          result.skippedCount++;
        }
      } else {
        // Insert new item
        const insertResult = await collection.insertOne(caseItem);
        
        if (insertResult.acknowledged) {
          result.insertedCount++;
        } else {
          result.skippedCount++;
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error importing Case data:', error);
    throw error;
  }
};

/**
 * Extract brand name from product title
 */
function extractBrand(title) {
  if (!title) return 'Unknown';
  
  // Common case brands
  const brands = [
    'Gator', 'SKB', 'Pelican', 'Nanuk', 'HPRC', 'Thomann', 'Magma', 'Mono',
    'Decksaver', 'UDG', 'Odyssey', 'Road Runner', 'Sweetwater', 'Behringer',
    'Korg', 'Roland', 'Yamaha', 'Moog', 'Arturia', 'Elektron', 'Akai',
    'Native Instruments', 'Teenage Engineering', 'Novation', 'Focusrite',
    'Universal Audio', 'Presonus', 'Mackie', 'Allen & Heath', 'Soundcraft',
    'Tascam', 'Zoom', 'Shure', 'Sennheiser', 'Audio-Technica', 'AKG',
    'Neumann', 'Rode', 'Sony', 'Pioneer', 'Denon', 'JBL', 'KRK', 'Genelec',
    'Adam Audio', 'Dynaudio', 'Focal', 'Audeze', 'Beyerdynamic'
  ];
  
  // Check if any brand appears at the beginning of the title
  for (const brand of brands) {
    if (title.toLowerCase().startsWith(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Check if any brand appears anywhere in the title
  for (const brand of brands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Extract first word as potential brand
  const firstWord = title.split(' ')[0];
  if (firstWord && firstWord.length > 1) {
    return firstWord;
  }
  
  return 'Unknown';
}

/**
 * Determine case type based on title, description, and features
 */
function determineCaseType(item) {
  const title = item.title?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  const features = item.features ? item.features.join(' ').toLowerCase() : '';
  const combinedText = `${title} ${description} ${features}`;
  
  // Define case type keywords
  const caseTypes = {
    'hard case': ['hard case', 'hardcase', 'hard shell', 'hardshell', 'flight case', 'road case', 'protective case', 'rigid case'],
    'soft case': ['soft case', 'softcase', 'gig bag', 'gigbag', 'carrying bag', 'carry bag', 'padded bag', 'soft shell'],
    'rack case': ['rack case', 'rack mount', 'rackmount', 'rack drawer', 'rack bag', 'rack unit'],
    'pedalboard': ['pedalboard', 'pedal board', 'pedal case', 'effects board', 'effects case'],
    'keyboard case': ['keyboard case', 'keyboard bag', 'synth case', 'synthesizer case', 'piano case', 'keyboard flight case'],
    'mixer case': ['mixer case', 'mixing console case', 'dj case', 'controller case'],
    'drum machine case': ['drum machine case', 'sampler case', 'groove box case', 'sequencer case'],
    'microphone case': ['microphone case', 'mic case', 'mic bag', 'microphone bag'],
    'headphone case': ['headphone case', 'headphone bag', 'earphone case', 'earphone bag'],
    'cable organizer': ['cable organizer', 'cable bag', 'cable case', 'cable management', 'cable storage']
  };
  
  // Check each case type
  for (const [type, keywords] of Object.entries(caseTypes)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      return type;
    }
  }
  
  // Default to generic case type
  return 'case';
}

/**
 * Extract features from description and features array
 */
function extractFeatures(item) {
  const features = item.features || [];
  const description = item.description || '';
  
  // If we already have features, return them
  if (features.length > 0) {
    return features;
  }
  
  // Extract features from description
  const extractedFeatures = [];
  
  // Look for bullet points in description
  const bulletPoints = description.split(/•|\*|\-|\n/).map(line => line.trim()).filter(line => line.length > 0);
  
  if (bulletPoints.length > 1) {
    // If we have multiple bullet points, use them as features
    return bulletPoints;
  }
  
  // Look for feature keywords
  const featureKeywords = [
    'waterproof', 'water resistant', 'shockproof', 'shock resistant', 'dustproof', 'dust resistant',
    'padded', 'padding', 'foam', 'compartments', 'pockets', 'dividers', 'customizable',
    'handle', 'wheels', 'rolling', 'lock', 'locking', 'tsa approved', 'airline approved',
    'hard shell', 'soft shell', 'reinforced', 'durable', 'lightweight', 'heavy duty'
  ];
  
  for (const keyword of featureKeywords) {
    if (description.toLowerCase().includes(keyword)) {
      extractedFeatures.push(capitalizeFirstLetter(keyword));
    }
  }
  
  return extractedFeatures;
}

/**
 * Determine protection level based on case features and description
 */
function determineProtectionLevel(item) {
  const title = item.title?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  const features = item.features ? item.features.join(' ').toLowerCase() : '';
  const combinedText = `${title} ${description} ${features}`;
  
  // High protection keywords
  const highProtectionKeywords = [
    'waterproof', 'shockproof', 'crushproof', 'dustproof', 'airtight',
    'military grade', 'mil-spec', 'ip67', 'ip68', 'pelican', 'nanuk', 'hprc',
    'flight case', 'road case', 'heavy duty', 'extreme protection'
  ];
  
  // Medium protection keywords
  const mediumProtectionKeywords = [
    'water resistant', 'shock resistant', 'dust resistant', 'padded',
    'protective', 'hard shell', 'hardshell', 'hard case', 'foam lined',
    'reinforced', 'durable', 'rugged'
  ];
  
  // Low protection keywords
  const lowProtectionKeywords = [
    'soft case', 'gig bag', 'carrying bag', 'sleeve', 'pouch',
    'lightweight', 'basic protection', 'simple'
  ];
  
  // Check for high protection first
  if (highProtectionKeywords.some(keyword => combinedText.includes(keyword))) {
    return 'high';
  }
  
  // Then check for medium protection
  if (mediumProtectionKeywords.some(keyword => combinedText.includes(keyword))) {
    return 'medium';
  }
  
  // Default to low protection
  return 'low';
}

/**
 * Check if case is waterproof
 */
function isWaterproof(item) {
  const title = item.title?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  const features = item.features ? item.features.join(' ').toLowerCase() : '';
  const combinedText = `${title} ${description} ${features}`;
  
  const waterproofKeywords = [
    'waterproof', 'water proof', 'water-proof', 'water tight', 'watertight',
    'ip67', 'ip68', 'submersible', 'water resistant', 'water-resistant'
  ];
  
  return waterproofKeywords.some(keyword => combinedText.includes(keyword));
}

/**
 * Check if case is shockproof
 */
function isShockproof(item) {
  const title = item.title?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  const features = item.features ? item.features.join(' ').toLowerCase() : '';
  const combinedText = `${title} ${description} ${features}`;
  
  const shockproofKeywords = [
    'shockproof', 'shock proof', 'shock-proof', 'shock resistant', 'shock-resistant',
    'impact resistant', 'impact-resistant', 'drop proof', 'drop-proof', 'rugged'
  ];
  
  return shockproofKeywords.some(keyword => combinedText.includes(keyword));
}

/**
 * Check if case has padding
 */
function hasPadding(item) {
  const title = item.title?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  const features = item.features ? item.features.join(' ').toLowerCase() : '';
  const combinedText = `${title} ${description} ${features}`;
  
  const paddingKeywords = [
    'padded', 'padding', 'foam', 'foam lined', 'foam insert', 'foam padding',
    'cushioned', 'cushioning', 'soft interior', 'plush', 'protective foam'
  ];
  
  return paddingKeywords.some(keyword => combinedText.includes(keyword));
}

/**
 * Check if case has compartments
 */
function hasCompartments(item) {
  const title = item.title?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  const features = item.features ? item.features.join(' ').toLowerCase() : '';
  const combinedText = `${title} ${description} ${features}`;
  
  const compartmentKeywords = [
    'compartment', 'compartments', 'divider', 'dividers', 'section', 'sections',
    'pocket', 'pockets', 'organizer', 'storage', 'customizable foam', 'pick and pluck'
  ];
  
  return compartmentKeywords.some(keyword => combinedText.includes(keyword));
}

/**
 * Check if case has handle
 */
function hasHandle(item) {
  const title = item.title?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  const features = item.features ? item.features.join(' ').toLowerCase() : '';
  const combinedText = `${title} ${description} ${features}`;
  
  const handleKeywords = [
    'handle', 'handles', 'carrying handle', 'side handle', 'top handle',
    'grip', 'ergonomic handle', 'comfortable handle', 'carry handle'
  ];
  
  return handleKeywords.some(keyword => combinedText.includes(keyword));
}

/**
 * Check if case has wheels
 */
function hasWheels(item) {
  const title = item.title?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  const features = item.features ? item.features.join(' ').toLowerCase() : '';
  const combinedText = `${title} ${description} ${features}`;
  
  const wheelKeywords = [
    'wheel', 'wheels', 'rolling', 'roller', 'trolley', 'pull handle',
    'telescoping handle', 'retractable handle', 'wheeled', 'rolling case'
  ];
  
  return wheelKeywords.some(keyword => combinedText.includes(keyword));
}

/**
 * Check if case has lock
 */
function hasLock(item) {
  const title = item.title?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  const features = item.features ? item.features.join(' ').toLowerCase() : '';
  const combinedText = `${title} ${description} ${features}`;
  
  const lockKeywords = [
    'lock', 'locking', 'lockable', 'combination lock', 'key lock',
    'tsa lock', 'security', 'secure', 'padlock', 'latch'
  ];
  
  return lockKeywords.some(keyword => combinedText.includes(keyword));
}

/**
 * Extract material from item description
 */
function extractMaterial(item) {
  const title = item.title?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  const features = item.features ? item.features.join(' ').toLowerCase() : '';
  const combinedText = `${title} ${description} ${features}`;
  
  const materials = {
    'plastic': ['plastic', 'abs', 'polypropylene', 'polyethylene', 'polycarbonate', 'polymer'],
    'aluminum': ['aluminum', 'aluminium', 'metal', 'alloy'],
    'wood': ['wood', 'wooden', 'plywood', 'mdf'],
    'nylon': ['nylon', 'cordura', 'ballistic nylon', 'polyester'],
    'leather': ['leather', 'leatherette', 'faux leather', 'pu leather'],
    'eva': ['eva', 'ethylene vinyl acetate', 'molded eva'],
    'carbon fiber': ['carbon fiber', 'carbon fibre', 'carbon'],
    'foam': ['foam', 'foam-lined', 'foam padded']
  };
  
  for (const [material, keywords] of Object.entries(materials)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      return material;
    }
  }
  
  return undefined;
}

/**
 * Extract color from item description
 */
function extractColor(item) {
  const title = item.title?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  const features = item.features ? item.features.join(' ').toLowerCase() : '';
  const combinedText = `${title} ${description} ${features}`;
  
  const colors = [
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple',
    'pink', 'brown', 'gray', 'grey', 'silver', 'gold', 'transparent', 'clear'
  ];
  
  for (const color of colors) {
    if (combinedText.includes(color)) {
      return color;
    }
  }
  
  return undefined;
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
