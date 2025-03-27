/**
 * AudioGear Collection Import Script
 * 
 * This script imports audio gear data from normalized product objects
 * into the AudioGear collection in MongoDB.
 */

module.exports = async function importAudioGear(db, items) {
  console.log('Starting AudioGear import...');
  
  // Initialize counters
  const result = {
    insertedCount: 0,
    updatedCount: 0,
    skippedCount: 0
  };
  
  try {
    // Get reference to AudioGear collection
    const collection = db.collection('AudioGear');
    
    // Process each item
    for (const item of items) {
      // Skip if item is marked as a case
      if (item.isCase) {
        result.skippedCount++;
        continue;
      }
      
      // Skip items that don't have required fields
      if (!item.title || !item.marketplace) {
        console.warn(`Skipping item with missing required fields: ${item.id}`);
        result.skippedCount++;
        continue;
      }
      
      // Transform normalized product to AudioGear schema
      const audioGear = {
        name: item.title,
        brand: extractBrand(item.title),
        category: item.category || 'Unknown',
        type: item.productType || 'Unknown',
        dimensions: {
          length: item.dimensions?.length || 0,
          width: item.dimensions?.width || 0,
          height: item.dimensions?.height || 0,
          unit: item.dimensions?.unit || 'in'
        },
        weight: {
          value: item.weight?.value || 0,
          unit: item.weight?.unit || 'lb'
        },
        imageUrl: item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : null,
        productUrl: item.url,
        description: item.description,
        popularity: calculatePopularity(item),
        releaseYear: extractReleaseYear(item),
        discontinued: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Additional fields for tracking
        sourceId: item.sourceId,
        marketplace: item.marketplace,
        scrapedAt: item.scrapedAt ? new Date(item.scrapedAt) : new Date(),
        features: item.features || []
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
              ...audioGear,
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
        const insertResult = await collection.insertOne(audioGear);
        
        if (insertResult.acknowledged) {
          result.insertedCount++;
        } else {
          result.skippedCount++;
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error importing AudioGear data:', error);
    throw error;
  }
};

/**
 * Extract brand name from product title
 */
function extractBrand(title) {
  if (!title) return 'Unknown';
  
  // Common audio gear brands
  const brands = [
    'Korg', 'Roland', 'Yamaha', 'Moog', 'Arturia', 'Behringer', 'Elektron',
    'Sequential', 'Novation', 'Akai', 'Native Instruments', 'Teenage Engineering',
    'Make Noise', 'Eurorack', 'Focusrite', 'Universal Audio', 'Ableton',
    'Presonus', 'Mackie', 'Allen & Heath', 'Soundcraft', 'Tascam', 'Zoom',
    'Shure', 'Sennheiser', 'Audio-Technica', 'AKG', 'Neumann', 'Rode',
    'Sony', 'Pioneer', 'Denon', 'JBL', 'KRK', 'Genelec', 'Adam Audio',
    'Dynaudio', 'Focal', 'Audeze', 'Beyerdynamic', 'Gator', 'SKB', 'Pelican'
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
 * Calculate popularity score based on rating and review count
 */
function calculatePopularity(item) {
  let score = 0;
  
  // Base score from rating (0-5 scale)
  if (item.rating) {
    score += item.rating * 10; // 0-50 points
  }
  
  // Additional points from review count
  if (item.reviewCount) {
    // Log scale for review count to prevent extremely popular items from dominating
    score += Math.min(50, Math.log10(item.reviewCount) * 10); // 0-50 points
  }
  
  return Math.round(score);
}

/**
 * Extract release year from product description or title
 */
function extractReleaseYear(item) {
  const currentYear = new Date().getFullYear();
  
  // Look for year patterns in description
  if (item.description) {
    // Look for "released in YYYY" or "launched in YYYY" patterns
    const releasePatterns = [
      /released in (\d{4})/i,
      /launched in (\d{4})/i,
      /introduced in (\d{4})/i,
      /since (\d{4})/i,
      /(\d{4}) release/i,
      /(\d{4}) model/i,
      /(\d{4}) version/i
    ];
    
    for (const pattern of releasePatterns) {
      const match = item.description.match(pattern);
      if (match && match[1]) {
        const year = parseInt(match[1], 10);
        if (year >= 1970 && year <= currentYear) {
          return year;
        }
      }
    }
  }
  
  // Look for year in title (e.g., "Model 2022")
  if (item.title) {
    const yearMatch = item.title.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch && yearMatch[1]) {
      const year = parseInt(yearMatch[1], 10);
      if (year >= 1970 && year <= currentYear) {
        return year;
      }
    }
  }
  
  // Default to current year if no year found
  return currentYear;
}
