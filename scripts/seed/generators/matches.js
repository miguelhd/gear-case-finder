/**
 * Gear-Case Matches Generator
 * 
 * Generates mock compatibility matches between audio gear and cases
 * based on dimensions and other compatibility factors
 */

const { ObjectId } = require('mongodb');

// Generate a random number between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random float between min and max with specified precision
function randomFloat(min, max, precision = 2) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(precision));
}

// Calculate dimensional compatibility score (0-100)
function calculateDimensionalCompatibility(gear, caseItem) {
  // Get gear dimensions
  const gearLength = gear.dimensions.length;
  const gearWidth = gear.dimensions.width;
  const gearHeight = gear.dimensions.height;
  
  // Get case internal dimensions
  const caseLength = caseItem.internalDimensions.length;
  const caseWidth = caseItem.internalDimensions.width;
  const caseHeight = caseItem.internalDimensions.height;
  
  // Check if gear fits in case (with some margin)
  const margin = 0.5; // 0.5 inch margin
  
  if (gearLength > caseLength + margin || 
      gearWidth > caseWidth + margin || 
      gearHeight > caseHeight + margin) {
    return 0; // Gear doesn't fit in case
  }
  
  // Calculate how well the gear fits in the case
  // Perfect fit: gear dimensions are just slightly smaller than case internal dimensions
  // Poor fit: gear is much smaller than case internal dimensions
  
  const lengthRatio = gearLength / caseLength;
  const widthRatio = gearWidth / caseWidth;
  const heightRatio = gearHeight / caseHeight;
  
  // Calculate average ratio (higher is better, up to a point)
  const avgRatio = (lengthRatio + widthRatio + heightRatio) / 3;
  
  // Optimal ratio is around 0.8-0.9 (some padding but not too much)
  // Score decreases if ratio is too low (too much empty space) or too high (too tight)
  let fitScore;
  if (avgRatio < 0.5) {
    // Too much empty space
    fitScore = avgRatio * 100; // Linear scaling from 0 to 50
  } else if (avgRatio <= 0.9) {
    // Ideal range (0.5 to 0.9)
    fitScore = 50 + ((avgRatio - 0.5) / 0.4) * 50; // Linear scaling from 50 to 100
  } else {
    // Too tight
    fitScore = 100 - ((avgRatio - 0.9) / 0.1) * 50; // Linear scaling from 100 down to 50
    fitScore = Math.max(50, fitScore); // Don't go below 50
  }
  
  return Math.round(fitScore);
}

// Calculate protection compatibility score (0-100)
function calculateProtectionCompatibility(gear, caseItem) {
  // Base score
  let score = 50;
  
  // Adjust score based on case protection features
  if (caseItem.waterproof) score += 10;
  if (caseItem.shockproof) score += 10;
  if (caseItem.dustproof) score += 10;
  
  // Adjust score based on protection level
  if (caseItem.protectionLevel === 'high') score += 15;
  else if (caseItem.protectionLevel === 'medium') score += 5;
  else if (caseItem.protectionLevel === 'low') score -= 10;
  
  // Adjust score based on case type
  if (caseItem.type.includes('Hard')) score += 10;
  else if (caseItem.type.includes('Soft')) score -= 5;
  
  // Adjust score based on gear category (some gear needs more protection)
  if (gear.category === 'Microphone' || 
      gear.category === 'Audio Interface' || 
      gear.category === 'Mixer') {
    if (caseItem.type.includes('Hard') || caseItem.type.includes('Flight')) {
      score += 10;
    } else {
      score -= 10;
    }
  }
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
}

// Calculate brand compatibility score (0-100)
function calculateBrandCompatibility(gear, caseItem) {
  // Same brand is ideal
  if (gear.brand.toLowerCase() === caseItem.brand.toLowerCase()) {
    return 100;
  }
  
  // Check if case is compatible with gear category
  if (caseItem.compatibleWith && 
      caseItem.compatibleWith.some(category => 
        category.toLowerCase().includes(gear.category.toLowerCase()) || 
        gear.category.toLowerCase().includes(category.toLowerCase())
      )) {
    return 80;
  }
  
  // Default moderate compatibility
  return 50;
}

// Calculate overall compatibility score (0-100)
function calculateOverallCompatibility(gear, caseItem) {
  // Calculate individual compatibility scores
  const dimensionalScore = calculateDimensionalCompatibility(gear, caseItem);
  
  // If gear doesn't fit in case at all, overall score is 0
  if (dimensionalScore === 0) {
    return 0;
  }
  
  const protectionScore = calculateProtectionCompatibility(gear, caseItem);
  const brandScore = calculateBrandCompatibility(gear, caseItem);
  
  // Weight the scores (dimensional fit is most important)
  const weightedScore = (
    dimensionalScore * 0.6 + 
    protectionScore * 0.3 + 
    brandScore * 0.1
  );
  
  // Add some randomness to make it more realistic
  const randomFactor = randomFloat(-5, 5);
  
  // Ensure final score is within 0-100 range
  return Math.max(0, Math.min(100, Math.round(weightedScore + randomFactor)));
}

// Generate matches between audio gear and cases
async function generateMatches(db, audioGearItems, caseItems) {
  console.log('Generating gear-case matches...');
  
  const matches = [];
  
  // For each audio gear item
  for (const gear of audioGearItems) {
    // Find compatible cases
    const compatibleCases = [];
    
    for (const caseItem of caseItems) {
      // Calculate compatibility score
      const compatibilityScore = calculateOverallCompatibility(gear, caseItem);
      
      // Only include matches with non-zero compatibility
      if (compatibilityScore > 0) {
        compatibleCases.push({
          caseId: caseItem._id,
          compatibilityScore
        });
      }
    }
    
    // Sort compatible cases by compatibility score (highest first)
    compatibleCases.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
    // Create match documents
    for (const compatibleCase of compatibleCases) {
      matches.push({
        _id: new ObjectId(),
        gearId: gear._id,
        caseId: compatibleCase.caseId,
        compatibilityScore: compatibleCase.compatibilityScore,
        matchReason: generateMatchReason(compatibleCase.compatibilityScore),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
  
  console.log(`Generated ${matches.length} gear-case matches`);
  return matches;
}

// Generate match reason based on compatibility score
function generateMatchReason(score) {
  if (score >= 90) {
    return "Perfect fit with excellent protection";
  } else if (score >= 80) {
    return "Great fit with good protection";
  } else if (score >= 70) {
    return "Good fit with adequate protection";
  } else if (score >= 60) {
    return "Decent fit with reasonable protection";
  } else if (score >= 50) {
    return "Acceptable fit with basic protection";
  } else if (score >= 40) {
    return "Marginal fit with minimal protection";
  } else if (score >= 30) {
    return "Poor fit but usable in a pinch";
  } else if (score >= 20) {
    return "Not recommended but technically fits";
  } else {
    return "Minimal compatibility, not recommended";
  }
}

module.exports = {
  generateMatches
};
