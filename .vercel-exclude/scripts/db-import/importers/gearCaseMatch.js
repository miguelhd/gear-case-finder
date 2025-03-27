/**
 * GearCaseMatch Collection Import Script
 * 
 * This script generates and imports gear-case matches based on compatibility
 * between audio gear and cases in the database.
 */

module.exports = async function importGearCaseMatch(db, options = {}) {
  console.log('Starting GearCaseMatch import...');
  
  // Initialize counters
  const result = {
    insertedCount: 0,
    updatedCount: 0,
    skippedCount: 0
  };
  
  try {
    // Get references to collections
    const audioGearCollection = db.collection('AudioGear');
    const caseCollection = db.collection('Case');
    const matchCollection = db.collection('GearCaseMatch');
    
    // Determine which items to process based on options
    let audioGearItems = [];
    let caseItems = [];
    
    if (options.newAudioGear) {
      // Get recently added audio gear items
      audioGearItems = await audioGearCollection.find({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).toArray();
      console.log(`Found ${audioGearItems.length} recent audio gear items`);
    }
    
    if (options.newCases) {
      // Get recently added case items
      caseItems = await caseCollection.find({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).toArray();
      console.log(`Found ${caseItems.length} recent case items`);
    }
    
    // If no specific items are specified, process all items
    if (!options.newAudioGear && !options.newCases) {
      audioGearItems = await audioGearCollection.find({}).toArray();
      caseItems = await caseCollection.find({}).toArray();
      console.log(`Processing all ${audioGearItems.length} audio gear items and ${caseItems.length} cases`);
    }
    
    // Generate matches
    const matches = [];
    
    // For each audio gear item, find compatible cases
    for (const gear of audioGearItems) {
      // Get all cases or just the new ones depending on options
      const casesToCheck = options.newCases ? caseItems : await caseCollection.find({}).toArray();
      
      for (const caseItem of casesToCheck) {
        // Check if gear and case are compatible
        const compatibilityScore = calculateCompatibilityScore(gear, caseItem);
        
        if (compatibilityScore > 0) {
          matches.push({
            gearId: gear._id,
            caseId: caseItem._id,
            compatibilityScore,
            compatibilityReason: generateCompatibilityReason(gear, caseItem, compatibilityScore),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }
    
    // For each case item, find compatible gear (if not already processed)
    if (options.newCases && !options.newAudioGear) {
      for (const caseItem of caseItems) {
        const gearToCheck = await audioGearCollection.find({}).toArray();
        
        for (const gear of gearToCheck) {
          // Check if gear and case are compatible
          const compatibilityScore = calculateCompatibilityScore(gear, caseItem);
          
          if (compatibilityScore > 0) {
            // Check if this match is already in our list
            const existingMatch = matches.find(m => 
              m.gearId.toString() === gear._id.toString() && 
              m.caseId.toString() === caseItem._id.toString()
            );
            
            if (!existingMatch) {
              matches.push({
                gearId: gear._id,
                caseId: caseItem._id,
                compatibilityScore,
                compatibilityReason: generateCompatibilityReason(gear, caseItem, compatibilityScore),
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
          }
        }
      }
    }
    
    console.log(`Generated ${matches.length} potential matches`);
    
    // Insert or update matches in the database
    for (const match of matches) {
      // Check if match already exists
      const existingMatch = await matchCollection.findOne({
        gearId: match.gearId,
        caseId: match.caseId
      });
      
      if (existingMatch) {
        // Update existing match
        const updateResult = await matchCollection.updateOne(
          { _id: existingMatch._id },
          { 
            $set: {
              compatibilityScore: match.compatibilityScore,
              compatibilityReason: match.compatibilityReason,
              updatedAt: new Date()
            }
          }
        );
        
        if (updateResult.modifiedCount > 0) {
          result.updatedCount++;
        } else {
          result.skippedCount++;
        }
      } else {
        // Insert new match
        const insertResult = await matchCollection.insertOne(match);
        
        if (insertResult.acknowledged) {
          result.insertedCount++;
        } else {
          result.skippedCount++;
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error importing GearCaseMatch data:', error);
    throw error;
  }
};

/**
 * Calculate compatibility score between audio gear and case
 * Returns a score from 0-100, where 0 means incompatible and 100 means perfect match
 */
function calculateCompatibilityScore(gear, caseItem) {
  // If dimensions are missing, we can't calculate compatibility
  if (!gear.dimensions || !caseItem.dimensions || !caseItem.dimensions.interior) {
    return 0;
  }
  
  // Get gear dimensions
  const gearLength = gear.dimensions.length || 0;
  const gearWidth = gear.dimensions.width || 0;
  const gearHeight = gear.dimensions.height || 0;
  
  // Get case interior dimensions
  const caseLength = caseItem.dimensions.interior.length || 0;
  const caseWidth = caseItem.dimensions.interior.width || 0;
  const caseHeight = caseItem.dimensions.interior.height || 0;
  
  // If any dimension is 0, we can't calculate compatibility
  if (gearLength === 0 || gearWidth === 0 || gearHeight === 0 ||
      caseLength === 0 || caseWidth === 0 || caseHeight === 0) {
    return 0;
  }
  
  // Check if gear fits in case with some padding (0.5 inches on each side)
  const padding = 0.5;
  
  // Calculate fit scores for each dimension (0-100)
  // Perfect fit is when gear dimension + padding*2 is slightly less than case dimension
  // Too tight is when gear dimension is larger than case dimension
  // Too loose is when there's more than 2 inches of extra space on each side
  
  let lengthScore = 0;
  let widthScore = 0;
  let heightScore = 0;
  
  // Length fit
  if (gearLength > caseLength) {
    // Too tight - doesn't fit
    lengthScore = 0;
  } else if (gearLength + padding * 2 <= caseLength) {
    // Fits with padding
    const extraSpace = caseLength - (gearLength + padding * 2);
    if (extraSpace <= 1) {
      // Perfect fit with just enough padding
      lengthScore = 100;
    } else if (extraSpace <= 3) {
      // Good fit with some extra space
      lengthScore = 90 - (extraSpace - 1) * 10; // 90 to 70
    } else {
      // Too loose
      lengthScore = Math.max(0, 60 - (extraSpace - 3) * 10); // 60 to 0
    }
  }
  
  // Width fit
  if (gearWidth > caseWidth) {
    // Too tight - doesn't fit
    widthScore = 0;
  } else if (gearWidth + padding * 2 <= caseWidth) {
    // Fits with padding
    const extraSpace = caseWidth - (gearWidth + padding * 2);
    if (extraSpace <= 1) {
      // Perfect fit with just enough padding
      widthScore = 100;
    } else if (extraSpace <= 3) {
      // Good fit with some extra space
      widthScore = 90 - (extraSpace - 1) * 10; // 90 to 70
    } else {
      // Too loose
      widthScore = Math.max(0, 60 - (extraSpace - 3) * 10); // 60 to 0
    }
  }
  
  // Height fit
  if (gearHeight > caseHeight) {
    // Too tight - doesn't fit
    heightScore = 0;
  } else if (gearHeight + padding * 2 <= caseHeight) {
    // Fits with padding
    const extraSpace = caseHeight - (gearHeight + padding * 2);
    if (extraSpace <= 1) {
      // Perfect fit with just enough padding
      heightScore = 100;
    } else if (extraSpace <= 3) {
      // Good fit with some extra space
      heightScore = 90 - (extraSpace - 1) * 10; // 90 to 70
    } else {
      // Too loose
      heightScore = Math.max(0, 60 - (extraSpace - 3) * 10); // 60 to 0
    }
  }
  
  // If any dimension doesn't fit, the overall score is 0
  if (lengthScore === 0 || widthScore === 0 || heightScore === 0) {
    return 0;
  }
  
  // Calculate overall fit score (average of all dimensions)
  const fitScore = (lengthScore + widthScore + heightScore) / 3;
  
  // Calculate protection score based on case features
  let protectionScore = 0;
  
  // Base protection score from protection level
  if (caseItem.protectionLevel === 'high') {
    protectionScore += 30;
  } else if (caseItem.protectionLevel === 'medium') {
    protectionScore += 20;
  } else if (caseItem.protectionLevel === 'low') {
    protectionScore += 10;
  }
  
  // Additional points for specific features
  if (caseItem.waterproof) protectionScore += 10;
  if (caseItem.shockproof) protectionScore += 10;
  if (caseItem.hasPadding) protectionScore += 10;
  if (caseItem.hasCompartments) protectionScore += 5;
  if (caseItem.hasLock) protectionScore += 5;
  
  // Cap protection score at 50
  protectionScore = Math.min(50, protectionScore);
  
  // Calculate convenience score based on case features
  let convenienceScore = 0;
  
  if (caseItem.hasHandle) convenienceScore += 5;
  if (caseItem.hasWheels) convenienceScore += 5;
  
  // Cap convenience score at 10
  convenienceScore = Math.min(10, convenienceScore);
  
  // Calculate type match score based on gear type and case type
  let typeMatchScore = 0;
  
  // Define gear type to case type mappings
  const typeMatches = {
    'synthesizer': ['keyboard case', 'synth case', 'hard case', 'soft case'],
    'mixer': ['mixer case', 'hard case', 'rack case'],
    'sampler': ['drum machine case', 'hard case', 'soft case'],
    'effects pedal': ['pedalboard', 'pedal case', 'hard case'],
    'audio interface': ['hard case', 'rack case'],
    'microphone': ['microphone case', 'hard case'],
    'headphones': ['headphone case', 'hard case', 'soft case'],
    'speaker': ['hard case', 'speaker case'],
    'cable': ['cable organizer', 'soft case']
  };
  
  // Check if case type matches gear type
  if (gear.type && caseItem.type) {
    const gearType = gear.type.toLowerCase();
    const caseType = caseItem.type.toLowerCase();
    
    if (typeMatches[gearType] && typeMatches[gearType].includes(caseType)) {
      typeMatchScore = 20;
    } else if (caseType === 'case') {
      // Generic case type gets partial score
      typeMatchScore = 10;
    }
  }
  
  // Calculate brand match score
  let brandMatchScore = 0;
  
  if (gear.brand && caseItem.brand && gear.brand.toLowerCase() === caseItem.brand.toLowerCase()) {
    brandMatchScore = 20;
  }
  
  // Calculate overall compatibility score
  const compatibilityScore = Math.round(
    fitScore * 0.5 +          // 50% weight for fit
    protectionScore * 0.2 +   // 20% weight for protection
    convenienceScore * 0.1 +  // 10% weight for convenience
    typeMatchScore * 0.1 +    // 10% weight for type match
    brandMatchScore * 0.1     // 10% weight for brand match
  );
  
  return compatibilityScore;
}

/**
 * Generate a human-readable compatibility reason
 */
function generateCompatibilityReason(gear, caseItem, score) {
  const reasons = [];
  
  // Fit assessment
  const gearDimensions = gear.dimensions || { length: 0, width: 0, height: 0 };
  const caseDimensions = caseItem.dimensions?.interior || { length: 0, width: 0, height: 0 };
  
  const lengthFit = caseDimensions.length - gearDimensions.length;
  const widthFit = caseDimensions.width - gearDimensions.width;
  const heightFit = caseDimensions.height - gearDimensions.height;
  
  if (lengthFit >= 1 && widthFit >= 1 && heightFit >= 1) {
    if (lengthFit <= 3 && widthFit <= 3 && heightFit <= 3) {
      reasons.push("Good fit with appropriate padding");
    } else {
      reasons.push("Fits with extra room");
    }
  } else if (lengthFit >= 0 && widthFit >= 0 && heightFit >= 0) {
    reasons.push("Tight fit with minimal padding");
  }
  
  // Protection assessment
  if (caseItem.protectionLevel === 'high') {
    reasons.push("High level of protection");
  } else if (caseItem.protectionLevel === 'medium') {
    reasons.push("Medium level of protection");
  }
  
  if (caseItem.waterproof) {
    reasons.push("Waterproof");
  }
  
  if (caseItem.shockproof) {
    reasons.push("Shockproof");
  }
  
  if (caseItem.hasPadding) {
    reasons.push("Padded interior");
  }
  
  // Convenience features
  const convenienceFeatures = [];
  if (caseItem.hasHandle) convenienceFeatures.push("handle");
  if (caseItem.hasWheels) convenienceFeatures.push("wheels");
  if (caseItem.hasCompartments) convenienceFeatures.push("compartments");
  if (caseItem.hasLock) convenienceFeatures.push("lock");
  
  if (convenienceFeatures.length > 0) {
    reasons.push(`Includes ${convenienceFeatures.join(', ')}`);
  }
  
  // Brand match
  if (gear.brand && caseItem.brand && gear.brand.toLowerCase() === caseItem.brand.toLowerCase()) {
    reasons.push(`Made by ${caseItem.brand} (same as gear)`);
  }
  
  // Type match
  if (gear.type && caseItem.type) {
    reasons.push(`${caseItem.type} designed for ${gear.type}`);
  }
  
  // Overall assessment based on score
  let overallAssessment = "";
  if (score >= 90) {
    overallAssessment = "Perfect match";
  } else if (score >= 80) {
    overallAssessment = "Excellent match";
  } else if (score >= 70) {
    overallAssessment = "Very good match";
  } else if (score >= 60) {
    overallAssessment = "Good match";
  } else if (score >= 50) {
    overallAssessment = "Decent match";
  } else if (score >= 40) {
    overallAssessment = "Acceptable match";
  } else if (score >= 30) {
    overallAssessment = "Basic match";
  } else {
    overallAssessment = "Minimal match";
  }
  
  // Combine all reasons
  return `${overallAssessment}. ${reasons.join('. ')}`;
}
