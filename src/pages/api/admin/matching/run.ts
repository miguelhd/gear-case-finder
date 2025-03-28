import { NextApiRequest, NextApiResponse } from 'next';
import connectToMongoDB from '../../../../lib/mongodb';
import { AudioGear, Case, GearCaseMatch } from '../../../../lib/models/gear-models';
import { ProductMatcher } from '../../../../lib/matching/product-matcher';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Route based on HTTP method
    switch (req.method) {
      case 'POST':
        return handlePostRequest(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in matching run API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Handle POST requests to run matching operations
 */
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  const { gearIds, caseIds, matchAll, useCustomParameters, parameters } = req.body;
  
  // Validate request
  if (!matchAll && (!gearIds || !caseIds || gearIds.length === 0 || caseIds.length === 0)) {
    return res.status(400).json({ message: 'Either matchAll must be true or gearIds and caseIds must be provided' });
  }
  
  try {
    const startTime = Date.now();
    const productMatcher = new ProductMatcher();
    
    // Apply custom parameters if provided
    if (useCustomParameters && parameters) {
      // This would be implemented in the ProductMatcher class
      // productMatcher.setParameters(parameters);
      console.log('Using custom parameters:', parameters);
    }
    
    let matchesCreated = 0;
    
    if (matchAll) {
      // Match all gear with all cases
      const allGear = await AudioGear.find();
      const allCases = await Case.find();
      
      for (const gear of allGear) {
        const compatibleCases = await productMatcher.findCompatibleCases(gear);
        matchesCreated += compatibleCases.length;
      }
    } else {
      // Match specific gear with specific cases
      const gearItems = await AudioGear.find({ _id: { $in: gearIds } });
      const caseItems = await Case.find({ _id: { $in: caseIds } });
      
      for (const gear of gearItems) {
        for (const caseItem of caseItems) {
          const compatibilityScore = productMatcher.calculateCompatibilityScore(gear, caseItem);
          const dimensionFit = productMatcher.calculateDimensionFit(gear, caseItem);
          const priceCategory = productMatcher.determinePriceCategory(caseItem);
          
          // Create or update the match
          await GearCaseMatch.findOneAndUpdate(
            { gearId: gear._id, caseId: caseItem._id },
            {
              gearId: gear._id,
              caseId: caseItem._id,
              compatibilityScore,
              dimensionScore: dimensionFit.overall,
              featureScore: 0, // This would be calculated by the feature matcher
              dimensionFit,
              priceCategory,
              protectionLevel: caseItem.protectionLevel || 'medium'
            },
            { upsert: true, new: true }
          );
          
          matchesCreated++;
        }
      }
    }
    
    const endTime = Date.now();
    const duration = `${((endTime - startTime) / 1000).toFixed(2)} seconds`;
    
    return res.status(200).json({
      message: 'Matching operation completed successfully',
      matchesCreated,
      duration
    });
  } catch (error) {
    console.error('Error running matching operation:', error);
    return res.status(500).json({ message: 'Failed to run matching operation' });
  }
}
